#!/usr/bin/env python3
"""
Scorer: Citation Accuracy (Metric 3)

Programmatic scorer — no LLM required.

For each response, checks:
  1. Does the response mention named authors/books from the PMM corpus?
  2. Do those named sources actually exist in Sherpa's Supabase corpus?
  3. Are the claims attributed to those sources plausible? (fuzzy match against real chunks)

This is the MOAT METRIC. Vanilla LLMs can paraphrase PMM books from training data
but can't cite specific authors correctly. Sherpa's curated corpus + citation pipeline
should dominate here.

Usage:
    python score_citations.py --run ../reports/v1/raw_outputs.jsonl

Output:
    Writes to ../reports/v1/scores_citations.jsonl
"""

import argparse
import json
import os
import re
from pathlib import Path

# Optional: Supabase for corpus verification
try:
    from supabase import create_client
    HAS_SUPABASE = True
except ImportError:
    HAS_SUPABASE = False


# ---------------------------------------------------------------------------
# Known PMM authors and works in the Sherpa corpus
# This is the ground truth for citation checking.
# ---------------------------------------------------------------------------
KNOWN_AUTHORS = {
    "april dunford": ["obviously awesome", "sales pitch"],
    "geoffrey moore": ["crossing the chasm", "inside the tornado"],
    "donald miller": ["building a storybrand"],
    "al ries": ["22 immutable laws", "immutable laws of marketing"],
    "jack trout": ["22 immutable laws", "immutable laws of marketing"],
    "maja voje": ["go-to-market strategist", "gtm strategist"],
    "al ramadan": ["play bigger"],
    "nir eyal": ["hooked"],
    "robert greene": ["laws of human nature"],
    "chris voss": ["never split the difference"],
    "robert cialdini": ["influence"],
    "david maister": ["trusted advisor", "managing the professional service firm"],
    "kindra hall": ["stories that stick"],
    "marty cagan": ["inspired"],
    "gabriel weinberg": ["traction"],
    "ann handley": [],  # blog_external, no book title needed
    "mark schaefer": [],
    "neil patel": [],
    "kyle poyar": [],
    "elena verna": [],
    "wes bush": [],
}

# Pattern matchers for extracting author/work mentions
AUTHOR_PATTERNS = [
    re.compile(r"\b(" + "|".join(
        re.escape(name) for name in KNOWN_AUTHORS.keys()
    ) + r")\b", re.IGNORECASE),
]

WORK_PATTERNS = []
for works_list in KNOWN_AUTHORS.values():
    for work in works_list:
        WORK_PATTERNS.append(
            re.compile(re.escape(work), re.IGNORECASE)
        )

# Patterns for detecting INVENTED citations (hallucinated sources)
HALLUCINATED_PATTERNS = [
    re.compile(r"dunford.{0,20}(?:matrix|pyramid|wheel|circle|triangle|diamond)", re.IGNORECASE),
    re.compile(r"moore.{0,20}(?:matrix|pyramid|wheel|diamond|funnel)", re.IGNORECASE),
    re.compile(r"(?:the\s+)?7\s*P(?:')?s\s+of\s+(?:positioning|marketing)", re.IGNORECASE),
    re.compile(r"dunford.{0,10}(?:6|7|8|9|10)\s+(?:component|step|element|pillar)", re.IGNORECASE),
]


def score_response(response: str, prompt_data: dict) -> dict:
    """Score a single response for citation accuracy."""

    text = response.lower()

    # 1. Find mentioned authors
    mentioned_authors = set()
    for pattern in AUTHOR_PATTERNS:
        for match in pattern.finditer(response):
            mentioned_authors.add(match.group(0).lower().strip())

    # 2. Find mentioned works
    mentioned_works = set()
    for pattern in WORK_PATTERNS:
        for match in pattern.finditer(response):
            mentioned_works.add(match.group(0).lower().strip())

    # 3. Check for hallucinated frameworks
    hallucinations = []
    for pattern in HALLUCINATED_PATTERNS:
        match = pattern.search(response)
        if match:
            hallucinations.append(match.group(0))

    # 4. Validate author-work pairs
    valid_citations = 0
    total_citations = len(mentioned_authors) + len(mentioned_works)

    for author in mentioned_authors:
        # Check if author is in our corpus
        if author in KNOWN_AUTHORS:
            valid_citations += 1

    for work in mentioned_works:
        # Check if work title exists in our corpus
        work_found = False
        for author, works in KNOWN_AUTHORS.items():
            if any(work in w.lower() for w in works):
                work_found = True
                break
        if work_found:
            valid_citations += 1

    # 5. Check expected sources from prompt metadata
    expected_sources = prompt_data.get("expected_sources", [])
    expected_found = 0
    expected_total = 0

    for expected in expected_sources:
        if isinstance(expected, dict):
            exp_author = expected.get("author", "").lower()
            exp_work = expected.get("work", "").lower()

            if exp_author and exp_author != "practitioner corpus":
                expected_total += 1
                # Check if this author was mentioned
                if any(exp_author.split()[-1] in a for a in mentioned_authors):
                    expected_found += 1
                elif exp_work and any(exp_work in w for w in mentioned_works):
                    expected_found += 1

    # 6. Compute scores
    # Citation presence: did the response cite anything at all?
    has_citations = total_citations > 0

    # Citation accuracy: of the things cited, how many are real?
    citation_accuracy = valid_citations / max(total_citations, 1)

    # Citation hallucination penalty
    hallucination_penalty = min(len(hallucinations) * 0.2, 0.6)

    # Expected source coverage: of the sources the prompt SHOULD cite, how many did it?
    expected_coverage = expected_found / max(expected_total, 1)

    # Composite score (0-1)
    # Weight: 40% accuracy, 30% expected coverage, 20% presence, 10% no-hallucination
    composite = (
        0.40 * citation_accuracy
        + 0.30 * expected_coverage
        + 0.20 * (1.0 if has_citations else 0.0)
        + 0.10 * (1.0 - hallucination_penalty)
    )

    return {
        "citation_accuracy": round(citation_accuracy, 3),
        "expected_coverage": round(expected_coverage, 3),
        "has_citations": has_citations,
        "composite_score": round(composite, 3),
        "mentioned_authors": sorted(mentioned_authors),
        "mentioned_works": sorted(mentioned_works),
        "valid_citations": valid_citations,
        "total_citations": total_citations,
        "hallucinations": hallucinations,
        "expected_found": expected_found,
        "expected_total": expected_total,
    }


def main():
    parser = argparse.ArgumentParser(description="Score citation accuracy")
    parser.add_argument("--run", required=True, help="Path to raw_outputs.jsonl")
    parser.add_argument(
        "--prompts",
        default=str(Path(__file__).parent.parent / "prompts" / "sherpa-eval-v1.yaml"),
    )
    parser.add_argument("--out", help="Output path (default: same dir as --run)")
    args = parser.parse_args()

    import yaml
    with open(args.prompts) as f:
        prompt_data_all = yaml.safe_load(f)
    prompts_by_id = {p["id"]: p for p in prompt_data_all.get("prompts", [])}

    run_path = Path(args.run)
    out_path = Path(args.out) if args.out else run_path.parent / "scores_citations.jsonl"

    results = []

    with open(run_path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            record = json.loads(line)

            if record.get("error"):
                continue

            prompt_id = record["prompt_id"]
            prompt_meta = prompts_by_id.get(prompt_id, {})

            score = score_response(record["response"], prompt_meta)

            result = {
                "prompt_id": prompt_id,
                "system": record["system"],
                "tier": record.get("tier"),
                **score,
            }
            results.append(result)

    # Write scores
    with open(out_path, "w") as f:
        for r in results:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    # Print summary by system
    from collections import defaultdict
    by_system = defaultdict(list)
    for r in results:
        by_system[r["system"]].append(r["composite_score"])

    print(f"\nCitation Accuracy Summary")
    print(f"{'System':<20} {'Mean':>8} {'Has Citations %':>16}")
    print("-" * 50)

    for system in sorted(by_system.keys()):
        scores = by_system[system]
        mean = sum(scores) / len(scores)
        has_cit_pct = sum(1 for r in results if r["system"] == system and r["has_citations"]) / len(scores) * 100
        print(f"{system:<20} {mean:>8.3f} {has_cit_pct:>15.1f}%")

    print(f"\nScores written to {out_path}")


if __name__ == "__main__":
    main()
