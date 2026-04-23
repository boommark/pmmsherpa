#!/usr/bin/env python3
"""
Sherpa Eval v1 — Clipboard Fallback for DIY Baselines

Semi-automated workflow when browser automation is too fragile.
For each prompt:
  1. Copies the prompt to your clipboard
  2. You paste it into the UI (Custom GPT / Gemini Gem / Claude Project)
  3. Wait for the response
  4. Select all + copy the response
  5. Press Enter here — the script captures it from clipboard

This is the reliable fallback. 35 prompts x 3 systems = 105 runs,
typically ~2-3 hours at a comfortable pace.

Usage:
    python clipboard_fallback.py --system custom_gpt
    python clipboard_fallback.py --system gemini_gem
    python clipboard_fallback.py --system claude_project

    # Resume from a specific prompt:
    python clipboard_fallback.py --system custom_gpt --start-from T2-05
"""

import argparse
import json
import subprocess
import time
from pathlib import Path

import yaml

from run_systems import load_prompts, load_config, build_full_prompt, load_existing_results


def copy_to_clipboard(text: str):
    """Copy text to macOS clipboard."""
    process = subprocess.Popen(["pbcopy"], stdin=subprocess.PIPE)
    process.communicate(text.encode("utf-8"))


def read_from_clipboard() -> str:
    """Read text from macOS clipboard."""
    result = subprocess.run(["pbpaste"], capture_output=True, text=True)
    return result.stdout.strip()


def main():
    parser = argparse.ArgumentParser(description="Sherpa Eval v1 — Clipboard fallback")
    parser.add_argument("--system", required=True, choices=["custom_gpt", "gemini_gem", "claude_project"])
    parser.add_argument(
        "--prompts",
        default=str(Path(__file__).parent.parent / "prompts" / "sherpa-eval-v1.yaml"),
    )
    parser.add_argument("--config", default=str(Path(__file__).parent / "config.yaml"))
    parser.add_argument("--prompts-filter", nargs="*", help="Specific prompt IDs")
    parser.add_argument("--start-from", help="Skip prompts before this ID")
    args = parser.parse_args()

    config = load_config(args.config)
    prompts = load_prompts(args.prompts)

    if args.prompts_filter:
        prompts = [p for p in prompts if p["id"] in args.prompts_filter]

    # Handle --start-from
    if args.start_from:
        start_idx = next((i for i, p in enumerate(prompts) if p["id"] == args.start_from), 0)
        prompts = prompts[start_idx:]

    output_dir = Path(args.config).parent / config.get("output_dir", "../reports/v1")
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "raw_outputs.jsonl"

    existing_pairs = load_existing_results(output_path)
    system_name = args.system

    system_labels = {
        "custom_gpt": "Custom GPT",
        "gemini_gem": "Gemini Gem",
        "claude_project": "Claude Project",
    }

    print(f"\n{'='*60}")
    print(f"Clipboard Fallback — {system_labels[system_name]}")
    print(f"{'='*60}")
    print(f"Prompts: {len(prompts)}")
    print()
    print("Workflow for each prompt:")
    print("  1. Script copies prompt to clipboard")
    print("  2. You paste into the UI (Cmd+V) and send")
    print("  3. Wait for the full response")
    print("  4. Select the response text and copy (Cmd+C)")
    print("  5. Come back here and press Enter")
    print()
    print("Type 'skip' to skip a prompt, 'quit' to stop.")
    print(f"{'='*60}\n")

    completed = 0
    skipped = 0

    for i, prompt_data in enumerate(prompts):
        pair_key = (prompt_data["id"], system_name)

        if pair_key in existing_pairs:
            skipped += 1
            continue

        full_prompt = build_full_prompt(prompt_data)

        print(f"\n--- [{i+1}/{len(prompts)}] {prompt_data['id']}: {prompt_data.get('title', '')} ---")
        print(f"Tier: {prompt_data.get('tier')} | Mode: {prompt_data.get('mode')}")
        print(f"Prompt preview: {full_prompt[:120]}...")
        print()

        # Copy prompt to clipboard
        copy_to_clipboard(full_prompt)
        print("  >> Prompt copied to clipboard. Paste into the UI and send.")

        start_time = time.time()

        # Wait for user to copy the response
        user_input = input("  >> Copy the response, then press Enter (or 'skip'/'quit'): ").strip().lower()

        if user_input == "quit":
            print("\nStopping. Progress saved.")
            break

        if user_input == "skip":
            print("  Skipped.")
            continue

        latency_ms = int((time.time() - start_time) * 1000)

        # Read response from clipboard
        response_text = read_from_clipboard()

        if not response_text or response_text == full_prompt:
            print("  WARNING: clipboard appears empty or still contains the prompt.")
            retry = input("  Copy the response and press Enter to try again (or 'skip'): ").strip().lower()
            if retry == "skip":
                continue
            response_text = read_from_clipboard()

        # Preview what we captured
        preview = response_text[:150].replace("\n", " ")
        print(f"  Captured: {preview}...")
        print(f"  Length: {len(response_text)} chars | Latency: {latency_ms}ms")

        # Save
        record = {
            "prompt_id": prompt_data["id"],
            "system": system_name,
            "tier": prompt_data.get("tier"),
            "mode": prompt_data.get("mode"),
            "prompt_text": full_prompt,
            "response": response_text,
            "latency_ms": latency_ms,
            "input_tokens": 0,
            "output_tokens": 0,
            "metadata": {"source": "clipboard", "system": system_name},
            "error": None,
        }

        with open(output_path, "a") as f:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

        completed += 1

    print(f"\n{'='*60}")
    print(f"Done: {completed} completed, {skipped} already existed")
    print(f"Output: {output_path}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
