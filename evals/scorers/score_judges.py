#!/usr/bin/env python3
"""
Scorer: LLM-as-Judge Ensemble (Metrics 4-7)

Uses Claude Opus 4.6 + GPT-5 as an ensemble judge to score:
  - Metric 4: Framework Fidelity (1-5)
  - Metric 5: Specificity / Actionability (1-5)
  - Metric 6: Voice Quality — Layer 4 adherence (1-5)
  - Metric 7: Mode Match (PASS/FAIL)

Judge hygiene:
  - Both judges score every output independently
  - Position of response is randomized (for pairwise comparisons, separate script)
  - Rubric anchors are loaded from rubrics/*.md and included in judge prompts
  - Inter-judge agreement reported via Cohen's kappa

Usage:
    python score_judges.py --run ../reports/v1/raw_outputs.jsonl --rubrics ../rubrics/

Output:
    ../reports/v1/scores_judges.jsonl — one record per (prompt, system, judge, metric)
    ../reports/v1/judge_agreement.json — Cohen's kappa per metric
"""

import argparse
import asyncio
import json
from collections import defaultdict
from pathlib import Path

from openai import AsyncOpenAI
from anthropic import AsyncAnthropic


# ---------------------------------------------------------------------------
# Judge prompt templates
# ---------------------------------------------------------------------------

POINTWISE_TEMPLATE = """You are an expert evaluator for a product marketing AI benchmark.

## Your task
Score the following AI-generated response on the metric described below.

## The prompt that was given
{prompt}

## The response to evaluate
{response}

## Metric: {metric_name}
{rubric}

## Instructions
- Score as an integer from 1 to 5
- Use the anchored examples in the rubric to calibrate your score
- Respond ONLY with valid JSON, no other text:

{{"score": <int 1-5>, "anchor_example_closest": "1 | 3 | 5", "reasoning": "<1-2 sentences>"}}"""

MODE_MATCH_TEMPLATE = """You are an expert evaluator for a product marketing AI benchmark.

## Your task
Determine whether the response uses the correct voice register for the expected mode.

## The prompt that was given
{prompt}

## Expected mode: {expected_mode}

## The response to evaluate
{response}

## Mode definitions and examples
{rubric}

## Instructions
Respond ONLY with valid JSON, no other text:

{{"verdict": "PASS" | "FAIL", "expected_mode": "{expected_mode}", "detected_mode": "advisory | written_artifact | spoken_artifact | mixed", "reasoning": "<1-2 sentences>"}}"""


def load_rubrics(rubrics_dir: Path) -> dict:
    """Load rubric markdown files."""
    rubrics = {}
    for name in ["framework_fidelity", "specificity", "voice_quality", "mode_match"]:
        path = rubrics_dir / f"{name}.md"
        if path.exists():
            rubrics[name] = path.read_text()
        else:
            rubrics[name] = f"(Rubric file not found: {path})"
    return rubrics


async def judge_with_claude(prompt_text: str, judge_prompt: str, config: dict) -> dict:
    """Run a single judge call via Claude Opus."""
    api_key = config.get("anthropic_api_key", "")
    client = AsyncAnthropic(api_key=api_key)

    response = await client.messages.create(
        model="claude-opus-4-6",
        max_tokens=300,
        messages=[{"role": "user", "content": judge_prompt}],
        temperature=0.0,  # Deterministic judging
    )

    text = ""
    for block in response.content:
        if block.type == "text":
            text += block.text

    # Parse JSON
    text = text.strip()
    # Strip markdown fences
    if text.startswith("```"):
        text = text.split("\n", 1)[-1].rsplit("```", 1)[0]

    return json.loads(text)


async def judge_with_gpt(prompt_text: str, judge_prompt: str, config: dict) -> dict:
    """Run a single judge call via GPT-5."""
    api_key = config.get("openai_api_key", "")
    client = AsyncOpenAI(api_key=api_key)

    response = await client.chat.completions.create(
        model="gpt-5",
        messages=[{"role": "user", "content": judge_prompt}],
        temperature=0.0,
        max_tokens=300,
    )

    text = response.choices[0].message.content or ""
    text = text.strip()
    if text.startswith("```"):
        text = text.split("\n", 1)[-1].rsplit("```", 1)[0]

    return json.loads(text)


async def score_single_record(
    record: dict,
    rubrics: dict,
    config: dict,
) -> list[dict]:
    """Score one (prompt, system) pair across all 4 metrics with both judges."""
    prompt_text = record["prompt_text"]
    response_text = record["response"]
    mode = record.get("mode", "advisory")

    results = []

    # Metrics 4-6: pointwise 1-5
    pointwise_metrics = [
        ("framework_fidelity", "Framework Fidelity"),
        ("specificity", "Specificity / Actionability"),
        ("voice_quality", "Voice Quality (Layer 4 adherence)"),
    ]

    for metric_key, metric_name in pointwise_metrics:
        judge_prompt = POINTWISE_TEMPLATE.format(
            prompt=prompt_text,
            response=response_text,
            metric_name=metric_name,
            rubric=rubrics.get(metric_key, ""),
        )

        # Run both judges in parallel
        claude_task = judge_with_claude(prompt_text, judge_prompt, config)
        gpt_task = judge_with_gpt(prompt_text, judge_prompt, config)

        try:
            claude_result, gpt_result = await asyncio.gather(
                claude_task, gpt_task, return_exceptions=True
            )
        except Exception:
            claude_result = None
            gpt_result = None

        # Record Claude judge result
        if isinstance(claude_result, dict):
            results.append({
                "prompt_id": record["prompt_id"],
                "system": record["system"],
                "tier": record.get("tier"),
                "metric": metric_key,
                "judge": "claude_opus",
                "score": claude_result.get("score"),
                "reasoning": claude_result.get("reasoning", ""),
                "anchor_closest": claude_result.get("anchor_example_closest", ""),
            })
        else:
            results.append({
                "prompt_id": record["prompt_id"],
                "system": record["system"],
                "tier": record.get("tier"),
                "metric": metric_key,
                "judge": "claude_opus",
                "score": None,
                "reasoning": f"Error: {claude_result}",
                "anchor_closest": "",
            })

        # Record GPT judge result
        if isinstance(gpt_result, dict):
            results.append({
                "prompt_id": record["prompt_id"],
                "system": record["system"],
                "tier": record.get("tier"),
                "metric": metric_key,
                "judge": "gpt5",
                "score": gpt_result.get("score"),
                "reasoning": gpt_result.get("reasoning", ""),
                "anchor_closest": gpt_result.get("anchor_example_closest", ""),
            })
        else:
            results.append({
                "prompt_id": record["prompt_id"],
                "system": record["system"],
                "tier": record.get("tier"),
                "metric": metric_key,
                "judge": "gpt5",
                "score": None,
                "reasoning": f"Error: {gpt_result}",
                "anchor_closest": "",
            })

    # Metric 7: Mode Match (PASS/FAIL)
    mode_prompt = MODE_MATCH_TEMPLATE.format(
        prompt=prompt_text,
        response=response_text,
        expected_mode=mode,
        rubric=rubrics.get("mode_match", ""),
    )

    claude_mode = judge_with_claude(prompt_text, mode_prompt, config)
    gpt_mode = judge_with_gpt(prompt_text, mode_prompt, config)

    try:
        claude_mode_result, gpt_mode_result = await asyncio.gather(
            claude_mode, gpt_mode, return_exceptions=True
        )
    except Exception:
        claude_mode_result = None
        gpt_mode_result = None

    for judge_name, judge_result in [("claude_opus", claude_mode_result), ("gpt5", gpt_mode_result)]:
        if isinstance(judge_result, dict):
            results.append({
                "prompt_id": record["prompt_id"],
                "system": record["system"],
                "tier": record.get("tier"),
                "metric": "mode_match",
                "judge": judge_name,
                "score": 1 if judge_result.get("verdict") == "PASS" else 0,
                "reasoning": judge_result.get("reasoning", ""),
                "anchor_closest": judge_result.get("detected_mode", ""),
            })
        else:
            results.append({
                "prompt_id": record["prompt_id"],
                "system": record["system"],
                "tier": record.get("tier"),
                "metric": "mode_match",
                "judge": judge_name,
                "score": None,
                "reasoning": f"Error: {judge_result}",
                "anchor_closest": "",
            })

    return results


def compute_cohens_kappa(scores_a: list, scores_b: list) -> float:
    """Compute Cohen's kappa between two judge score lists."""
    if len(scores_a) != len(scores_b) or not scores_a:
        return 0.0

    n = len(scores_a)
    # For kappa, we need categorical agreement
    # Treat each 1-5 score as a category
    agree = sum(1 for a, b in zip(scores_a, scores_b) if a == b)
    p_o = agree / n  # Observed agreement

    # Expected agreement by chance
    from collections import Counter
    counts_a = Counter(scores_a)
    counts_b = Counter(scores_b)
    all_categories = set(scores_a) | set(scores_b)
    p_e = sum((counts_a.get(c, 0) / n) * (counts_b.get(c, 0) / n) for c in all_categories)

    if p_e == 1.0:
        return 1.0
    return (p_o - p_e) / (1 - p_e)


async def main():
    parser = argparse.ArgumentParser(description="Score with LLM-as-Judge ensemble")
    parser.add_argument("--run", required=True, help="Path to raw_outputs.jsonl")
    parser.add_argument(
        "--rubrics",
        default=str(Path(__file__).parent.parent / "rubrics"),
        help="Path to rubrics directory",
    )
    parser.add_argument("--out", help="Output path")
    parser.add_argument("--max-concurrent", type=int, default=5, help="Max concurrent judge calls")
    args = parser.parse_args()

    rubrics = load_rubrics(Path(args.rubrics))

    # Load config from env vars
    import os
    config = {
        "anthropic_api_key": os.environ.get("ANTHROPIC_API_KEY", ""),
        "openai_api_key": os.environ.get("OPENAI_API_KEY", ""),
    }

    if not config["anthropic_api_key"] or not config["openai_api_key"]:
        print("ERROR: Set ANTHROPIC_API_KEY and OPENAI_API_KEY environment variables")
        return

    run_path = Path(args.run)
    out_path = Path(args.out) if args.out else run_path.parent / "scores_judges.jsonl"
    agreement_path = run_path.parent / "judge_agreement.json"

    # Load records
    records = []
    with open(run_path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            record = json.loads(line)
            if not record.get("error") and record.get("response"):
                records.append(record)

    print(f"Scoring {len(records)} records across 4 metrics with 2 judges")
    print(f"Total judge calls: {len(records) * 4 * 2} = {len(records) * 8}")

    # Process with concurrency limit
    semaphore = asyncio.Semaphore(args.max_concurrent)
    all_results = []

    async def score_with_limit(record):
        async with semaphore:
            return await score_single_record(record, rubrics, config)

    tasks = [score_with_limit(r) for r in records]

    completed = 0
    for coro in asyncio.as_completed(tasks):
        results = await coro
        all_results.extend(results)
        completed += 1
        if completed % 10 == 0:
            print(f"  Progress: {completed}/{len(records)} records scored")

    # Write scores
    with open(out_path, "w") as f:
        for r in all_results:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    # Compute inter-judge agreement (Cohen's kappa per metric)
    agreement = {}
    metrics = ["framework_fidelity", "specificity", "voice_quality", "mode_match"]

    for metric in metrics:
        claude_scores = {}
        gpt_scores = {}

        for r in all_results:
            if r["metric"] == metric and r["score"] is not None:
                key = (r["prompt_id"], r["system"])
                if r["judge"] == "claude_opus":
                    claude_scores[key] = r["score"]
                elif r["judge"] == "gpt5":
                    gpt_scores[key] = r["score"]

        # Align scores
        common_keys = sorted(set(claude_scores.keys()) & set(gpt_scores.keys()))
        if common_keys:
            a = [claude_scores[k] for k in common_keys]
            b = [gpt_scores[k] for k in common_keys]
            kappa = compute_cohens_kappa(a, b)
            exact_agree = sum(1 for x, y in zip(a, b) if x == y) / len(a)
            within_one = sum(1 for x, y in zip(a, b) if abs(x - y) <= 1) / len(a)
        else:
            kappa = 0.0
            exact_agree = 0.0
            within_one = 0.0

        agreement[metric] = {
            "cohens_kappa": round(kappa, 3),
            "exact_agreement": round(exact_agree, 3),
            "within_one_agreement": round(within_one, 3),
            "n_pairs": len(common_keys),
        }

    with open(agreement_path, "w") as f:
        json.dump(agreement, f, indent=2)

    # Print summary
    print(f"\n{'='*60}")
    print("Inter-Judge Agreement (Cohen's Kappa)")
    print(f"{'='*60}")
    print(f"{'Metric':<25} {'Kappa':>8} {'Exact %':>9} {'Within-1 %':>12}")
    print("-" * 60)

    for metric, stats in agreement.items():
        print(
            f"{metric:<25} {stats['cohens_kappa']:>8.3f} "
            f"{stats['exact_agreement']*100:>8.1f}% "
            f"{stats['within_one_agreement']*100:>11.1f}%"
        )

    # Print mean scores per system
    print(f"\n{'='*60}")
    print("Mean Scores by System (ensemble average)")
    print(f"{'='*60}")

    by_system_metric = defaultdict(lambda: defaultdict(list))
    for r in all_results:
        if r["score"] is not None:
            by_system_metric[r["system"]][r["metric"]].append(r["score"])

    header = f"{'System':<20}"
    for m in metrics:
        header += f" {m[:12]:>12}"
    print(header)
    print("-" * (20 + 13 * len(metrics)))

    for system in sorted(by_system_metric.keys()):
        row = f"{system:<20}"
        for m in metrics:
            scores = by_system_metric[system][m]
            if scores:
                mean = sum(scores) / len(scores)
                row += f" {mean:>12.2f}"
            else:
                row += f" {'N/A':>12}"
        print(row)

    print(f"\nScores written to {out_path}")
    print(f"Agreement written to {agreement_path}")


if __name__ == "__main__":
    asyncio.run(main())
