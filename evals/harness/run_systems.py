#!/usr/bin/env python3
"""
Sherpa Eval v1 — Harness Orchestrator

Runs all prompts through all enabled API-based systems (6 of 9).
For the 3 DIY browser-based systems, use run_browser.py or clipboard_fallback.py.

Usage:
    python run_systems.py --prompts ../prompts/sherpa-eval-v1.yaml --config config.yaml

Output:
    Appends to {output_dir}/raw_outputs.jsonl — one JSON line per (prompt, system) pair.
"""

import argparse
import asyncio
import json
import os
import sys
import time
from pathlib import Path

import yaml

# Add adapters to path
sys.path.insert(0, str(Path(__file__).parent))

from adapters.sherpa import run_sherpa
from adapters.openai_vanilla import run_openai_vanilla
from adapters.openai_search import run_openai_search
from adapters.claude_vanilla import run_claude_vanilla
from adapters.jasper import run_jasper
from adapters.writer import run_writer


ADAPTER_MAP = {
    "sherpa": run_sherpa,
    "openai_vanilla": run_openai_vanilla,
    "openai_search": run_openai_search,
    "claude_vanilla": run_claude_vanilla,
    "jasper": run_jasper,
    "writer": run_writer,
}

# DIY baselines are browser-based — handled by run_browser.py
BROWSER_SYSTEMS = {"custom_gpt", "gemini_gem", "claude_project"}


def load_prompts(path: str) -> list[dict]:
    """Load prompts from the YAML eval set."""
    with open(path, "r") as f:
        data = yaml.safe_load(f)

    prompts = data.get("prompts", [])
    fictional_product = data.get("fictional_product", {})

    # For Tier 3 prompts, prepend the fictional product context
    product_context = (
        f"Product context for this task:\n"
        f"Name: {fictional_product.get('name', '')}\n"
        f"Category: {fictional_product.get('category', '')}\n"
        f"Description: {fictional_product.get('one_liner', '').strip()}\n"
        f"Competitors: {', '.join(c for c in fictional_product.get('competitors', []))}\n"
        f"ICP: {fictional_product.get('icp', '')}\n"
        f"Pricing benchmark: {fictional_product.get('pricing_benchmark', '')}"
    )

    for p in prompts:
        p["_product_context"] = product_context if p.get("tier") == 3 else None

    return prompts


def load_config(path: str) -> dict:
    """Load harness config, resolving env var references."""
    with open(path, "r") as f:
        raw = f.read()

    # Resolve ${ENV_VAR} patterns
    import re
    def _resolve_env(match):
        var_name = match.group(1)
        return os.environ.get(var_name, "")

    resolved = re.sub(r"\$\{(\w+)\}", _resolve_env, raw)
    return yaml.safe_load(resolved)


def build_full_prompt(prompt_data: dict) -> str:
    """Build the full prompt text including product context for Tier 3."""
    parts = []
    if prompt_data.get("_product_context"):
        parts.append(prompt_data["_product_context"])
    parts.append(prompt_data["prompt"].strip())
    return "\n\n".join(parts)


async def run_single(
    system_name: str,
    adapter_fn,
    prompt_data: dict,
    config: dict,
) -> dict:
    """Run a single prompt through a single system and return the result."""
    prompt_id = prompt_data["id"]
    full_prompt = build_full_prompt(prompt_data)

    start_ms = time.time() * 1000

    try:
        result = await adapter_fn(full_prompt, config)
        latency_ms = int(time.time() * 1000 - start_ms)

        return {
            "prompt_id": prompt_id,
            "system": system_name,
            "tier": prompt_data.get("tier"),
            "mode": prompt_data.get("mode"),
            "prompt_text": full_prompt,
            "response": result.get("response", ""),
            "latency_ms": latency_ms,
            "input_tokens": result.get("input_tokens", 0),
            "output_tokens": result.get("output_tokens", 0),
            "metadata": result.get("metadata", {}),
            "error": None,
        }
    except Exception as e:
        latency_ms = int(time.time() * 1000 - start_ms)
        print(f"  ERROR [{system_name}] {prompt_id}: {e}")
        return {
            "prompt_id": prompt_id,
            "system": system_name,
            "tier": prompt_data.get("tier"),
            "mode": prompt_data.get("mode"),
            "prompt_text": full_prompt,
            "response": "",
            "latency_ms": latency_ms,
            "input_tokens": 0,
            "output_tokens": 0,
            "metadata": {},
            "error": str(e),
        }


async def run_system(
    system_name: str,
    adapter_fn,
    prompts: list[dict],
    config: dict,
    output_path: Path,
    existing_pairs: set,
):
    """Run all prompts through one system, appending results to output file."""
    print(f"\n{'='*60}")
    print(f"Running system: {system_name}")
    print(f"{'='*60}")

    completed = 0
    skipped = 0

    for i, prompt_data in enumerate(prompts):
        pair_key = (prompt_data["id"], system_name)

        # Skip if already run (allows resuming interrupted runs)
        if pair_key in existing_pairs:
            skipped += 1
            continue

        print(f"  [{i+1}/{len(prompts)}] {prompt_data['id']}: {prompt_data.get('title', '')[:50]}...")

        result = await run_single(system_name, adapter_fn, prompt_data, config)

        # Append to JSONL immediately (crash-safe)
        with open(output_path, "a") as f:
            f.write(json.dumps(result, ensure_ascii=False) + "\n")

        completed += 1

        # Rate-limit courtesy (avoid hammering APIs)
        await asyncio.sleep(1.0)

    print(f"  Done: {completed} completed, {skipped} skipped (already run)")


def load_existing_results(output_path: Path) -> set:
    """Load already-completed (prompt_id, system) pairs for resume support."""
    pairs = set()
    if output_path.exists():
        with open(output_path, "r") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    record = json.loads(line)
                    if not record.get("error"):
                        pairs.add((record["prompt_id"], record["system"]))
                except json.JSONDecodeError:
                    continue
    return pairs


async def main():
    parser = argparse.ArgumentParser(description="Sherpa Eval v1 — Run API-based systems")
    parser.add_argument(
        "--prompts",
        default=str(Path(__file__).parent.parent / "prompts" / "sherpa-eval-v1.yaml"),
        help="Path to prompts YAML",
    )
    parser.add_argument(
        "--config",
        default=str(Path(__file__).parent / "config.yaml"),
        help="Path to harness config",
    )
    parser.add_argument(
        "--systems",
        nargs="*",
        help="Specific systems to run (default: all enabled API systems)",
    )
    parser.add_argument(
        "--prompts-filter",
        nargs="*",
        help="Specific prompt IDs to run (default: all)",
    )
    args = parser.parse_args()

    # Load data
    config = load_config(args.config)
    prompts = load_prompts(args.prompts)

    # Filter prompts if requested
    if args.prompts_filter:
        prompts = [p for p in prompts if p["id"] in args.prompts_filter]

    # Determine output path
    output_dir = Path(args.config).parent / config.get("output_dir", "../reports/v1")
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / "raw_outputs.jsonl"

    # Load existing results for resume
    existing_pairs = load_existing_results(output_path)
    if existing_pairs:
        print(f"Resuming: {len(existing_pairs)} (prompt, system) pairs already completed")

    # Determine which systems to run
    enabled = config.get("enabled_systems", [])
    requested = args.systems if args.systems else enabled

    # Filter to API-only systems (browser systems handled separately)
    api_systems = [s for s in requested if s in ADAPTER_MAP and s not in BROWSER_SYSTEMS]
    browser_skipped = [s for s in requested if s in BROWSER_SYSTEMS]

    if browser_skipped:
        print(f"\nSkipping browser-based systems (use run_browser.py): {', '.join(browser_skipped)}")

    print(f"\nPrompts: {len(prompts)}")
    print(f"API systems: {', '.join(api_systems)}")
    print(f"Total runs: {len(prompts) * len(api_systems)}")
    print(f"Output: {output_path}")

    # Run each system sequentially (systems run sequentially, but each adapter may be async internally)
    for system_name in api_systems:
        adapter_fn = ADAPTER_MAP[system_name]
        await run_system(system_name, adapter_fn, prompts, config, output_path, existing_pairs)

    # Summary
    final_pairs = load_existing_results(output_path)
    print(f"\n{'='*60}")
    print(f"DONE — {len(final_pairs)} total results in {output_path}")
    print(f"{'='*60}")


if __name__ == "__main__":
    asyncio.run(main())
