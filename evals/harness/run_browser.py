#!/usr/bin/env python3
"""
Sherpa Eval v1 — Browser Runner for DIY Baselines

Runs prompts through Custom GPT, Gemini Gem, and Claude Project using
Playwright browser automation with real logged-in sessions.

Prerequisites:
    pip install playwright
    playwright install chromium

    Import cookies first: use /setup-browser-cookies in Claude Code,
    or manually export cookies to a JSON file.

Usage:
    python run_browser.py --prompts ../prompts/sherpa-eval-v1.yaml --config config.yaml

    # Run a single system:
    python run_browser.py --systems custom_gpt --prompts ../prompts/sherpa-eval-v1.yaml

    # Run a specific prompt:
    python run_browser.py --systems gemini_gem --prompts-filter T1-01
"""

import argparse
import asyncio
import json
import time
from pathlib import Path

import yaml

# Reuse orchestrator utilities
from run_systems import load_prompts, load_config, build_full_prompt, load_existing_results


SYSTEM_CONFIG = {
    "custom_gpt": {
        "name": "Custom GPT",
        "input_selector": 'textarea[data-testid="chat-input"], #prompt-textarea',
        "submit_selector": 'button[data-testid="send-button"], button[aria-label="Send"]',
        "response_selector": '[data-message-author-role="assistant"]',
        "wait_indicator": '[data-testid="stop-button"]',  # Visible while generating
    },
    "gemini_gem": {
        "name": "Gemini Gem",
        "input_selector": '.ql-editor, [contenteditable="true"]',
        "submit_selector": 'button[aria-label="Send message"]',
        "response_selector": '.model-response-text, .response-container',
        "wait_indicator": '.loading-indicator',
    },
    "claude_project": {
        "name": "Claude Project",
        "input_selector": '[contenteditable="true"].ProseMirror, fieldset .ProseMirror',
        "submit_selector": 'button[aria-label="Send Message"]',
        "response_selector": '[data-is-streaming], .font-claude-message',
        "wait_indicator": '[data-is-streaming="true"]',
    },
}


async def wait_for_response_complete(page, system_key: str, timeout_ms: int = 120000):
    """Wait for the AI response to finish generating."""
    cfg = SYSTEM_CONFIG[system_key]
    wait_sel = cfg["wait_indicator"]

    # First wait for generation to START (indicator appears)
    try:
        await page.wait_for_selector(wait_sel, state="attached", timeout=15000)
    except Exception:
        # Indicator may not appear for fast responses
        pass

    # Then wait for generation to FINISH (indicator disappears)
    try:
        await page.wait_for_selector(wait_sel, state="detached", timeout=timeout_ms)
    except Exception:
        pass

    # Extra settle time for DOM updates
    await asyncio.sleep(2.0)


async def extract_last_response(page, system_key: str) -> str:
    """Extract the last assistant response text from the page."""
    cfg = SYSTEM_CONFIG[system_key]
    sel = cfg["response_selector"]

    # Get all response elements and take the last one
    elements = await page.query_selector_all(sel)
    if not elements:
        return ""

    last_el = elements[-1]
    text = await last_el.inner_text()
    return text.strip()


async def run_prompt_in_browser(page, system_key: str, prompt: str) -> dict:
    """Type a prompt, wait for response, extract it."""
    cfg = SYSTEM_CONFIG[system_key]
    start_ms = time.time() * 1000

    # Clear and type the prompt
    input_el = await page.wait_for_selector(cfg["input_selector"], timeout=10000)

    # Some inputs are contenteditable divs, some are textareas
    tag = await input_el.evaluate("el => el.tagName.toLowerCase()")
    if tag == "textarea":
        await input_el.fill(prompt)
    else:
        await input_el.click()
        # Clear existing content
        await page.keyboard.press("Meta+a")
        await page.keyboard.press("Backspace")
        await input_el.type(prompt, delay=5)

    # Small pause to let UI register the input
    await asyncio.sleep(0.5)

    # Click send
    submit_btn = await page.wait_for_selector(cfg["submit_selector"], timeout=5000)
    await submit_btn.click()

    # Wait for response to complete
    await wait_for_response_complete(page, system_key)

    # Extract response
    response_text = await extract_last_response(page, system_key)
    latency_ms = int(time.time() * 1000 - start_ms)

    return {
        "response": response_text,
        "latency_ms": latency_ms,
        "input_tokens": 0,   # Can't measure from browser
        "output_tokens": 0,
        "metadata": {"source": "browser", "system": system_key},
    }


async def run_browser_system(
    system_key: str,
    workspace_url: str,
    prompts: list[dict],
    output_path: Path,
    existing_pairs: set,
    cookies_path: str = "",
):
    """Run all prompts through one browser-based system."""
    try:
        from playwright.async_api import async_playwright
    except ImportError:
        print("ERROR: playwright not installed. Run: pip install playwright && playwright install chromium")
        return

    cfg = SYSTEM_CONFIG[system_key]
    print(f"\n{'='*60}")
    print(f"Browser: {cfg['name']} ({workspace_url})")
    print(f"{'='*60}")

    async with async_playwright() as p:
        # Launch with persistent context to reuse login sessions
        user_data_dir = Path.home() / ".sherpa-eval-browser" / system_key
        user_data_dir.mkdir(parents=True, exist_ok=True)

        browser = await p.chromium.launch_persistent_context(
            str(user_data_dir),
            headless=False,  # Must be visible for auth verification
            viewport={"width": 1280, "height": 900},
            slow_mo=100,
        )

        page = browser.pages[0] if browser.pages else await browser.new_page()

        # Navigate to the workspace
        await page.goto(workspace_url, wait_until="networkidle", timeout=30000)

        # Brief pause to let the page fully load
        await asyncio.sleep(3.0)

        # Check if we need to log in
        current_url = page.url
        if "login" in current_url.lower() or "sign" in current_url.lower():
            print(f"\n  *** LOGIN REQUIRED ***")
            print(f"  Please log in manually in the browser window.")
            print(f"  Press Enter here when you're logged in and see the workspace...")
            input()
            await page.goto(workspace_url, wait_until="networkidle", timeout=30000)
            await asyncio.sleep(3.0)

        completed = 0
        skipped = 0

        for i, prompt_data in enumerate(prompts):
            pair_key = (prompt_data["id"], system_key)

            if pair_key in existing_pairs:
                skipped += 1
                continue

            full_prompt = build_full_prompt(prompt_data)
            print(f"  [{i+1}/{len(prompts)}] {prompt_data['id']}: {prompt_data.get('title', '')[:50]}...")

            try:
                # For multi-prompt runs, start a new chat each time
                # Navigate back to workspace URL to get a fresh conversation
                if i > 0:
                    await page.goto(workspace_url, wait_until="networkidle", timeout=30000)
                    await asyncio.sleep(2.0)

                result = await run_prompt_in_browser(page, system_key, full_prompt)

                record = {
                    "prompt_id": prompt_data["id"],
                    "system": system_key,
                    "tier": prompt_data.get("tier"),
                    "mode": prompt_data.get("mode"),
                    "prompt_text": full_prompt,
                    "response": result["response"],
                    "latency_ms": result["latency_ms"],
                    "input_tokens": 0,
                    "output_tokens": 0,
                    "metadata": result["metadata"],
                    "error": None,
                }

            except Exception as e:
                print(f"    ERROR: {e}")
                record = {
                    "prompt_id": prompt_data["id"],
                    "system": system_key,
                    "tier": prompt_data.get("tier"),
                    "mode": prompt_data.get("mode"),
                    "prompt_text": full_prompt,
                    "response": "",
                    "latency_ms": 0,
                    "input_tokens": 0,
                    "output_tokens": 0,
                    "metadata": {},
                    "error": str(e),
                }

            # Append immediately
            with open(output_path, "a") as f:
                f.write(json.dumps(record, ensure_ascii=False) + "\n")

            completed += 1

            # Rate limit — be gentle with the UIs
            await asyncio.sleep(3.0)

        print(f"  Done: {completed} completed, {skipped} skipped")
        await browser.close()


async def main():
    parser = argparse.ArgumentParser(description="Sherpa Eval v1 — Browser runner for DIY baselines")
    parser.add_argument(
        "--prompts",
        default=str(Path(__file__).parent.parent / "prompts" / "sherpa-eval-v1.yaml"),
    )
    parser.add_argument("--config", default=str(Path(__file__).parent / "config.yaml"))
    parser.add_argument("--systems", nargs="*", help="Which DIY systems to run")
    parser.add_argument("--prompts-filter", nargs="*", help="Specific prompt IDs")
    args = parser.parse_args()

    config = load_config(args.config)
    prompts = load_prompts(args.prompts)

    if args.prompts_filter:
        prompts = [p for p in prompts if p["id"] in args.prompts_filter]

    output_dir = Path(args.config).parent / config.get("output_dir", "../reports/v1")
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "raw_outputs.jsonl"

    existing_pairs = load_existing_results(output_path)

    diy_config = config.get("diy_baselines", {})
    requested = args.systems if args.systems else list(SYSTEM_CONFIG.keys())

    for system_key in requested:
        if system_key not in SYSTEM_CONFIG:
            print(f"Unknown system: {system_key}")
            continue

        url = diy_config.get(system_key, {}).get("url", "")
        if not url:
            print(f"Skipping {system_key} — no URL configured in config.yaml")
            continue

        await run_browser_system(system_key, url, prompts, output_path, existing_pairs)


if __name__ == "__main__":
    asyncio.run(main())
