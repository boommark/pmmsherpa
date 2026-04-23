#!/usr/bin/env python3
"""
Sherpa Eval v1 — Aggregator

Merges citation scores and judge scores, computes per-system aggregates
with 95% bootstrap confidence intervals.

Usage:
    python aggregate.py --run ../reports/v1/

Output:
    ../reports/v1/aggregates.json — per-system, per-metric mean + 95% CI
    ../reports/v1/scorecard.html  — visual radar chart + side-by-side examples
"""

import argparse
import json
from collections import defaultdict
from pathlib import Path

import numpy as np


def bootstrap_ci(scores: list, n_bootstrap: int = 10000, ci: float = 0.95) -> tuple:
    """Compute bootstrap confidence interval for the mean."""
    if not scores:
        return (0.0, 0.0, 0.0)

    arr = np.array(scores, dtype=float)
    observed_mean = float(np.mean(arr))

    if len(arr) < 3:
        return (observed_mean, observed_mean, observed_mean)

    rng = np.random.default_rng(42)
    boot_means = []
    for _ in range(n_bootstrap):
        sample = rng.choice(arr, size=len(arr), replace=True)
        boot_means.append(float(np.mean(sample)))

    alpha = (1 - ci) / 2
    lower = float(np.percentile(boot_means, alpha * 100))
    upper = float(np.percentile(boot_means, (1 - alpha) * 100))

    return (observed_mean, lower, upper)


def load_citation_scores(run_dir: Path) -> list[dict]:
    """Load citation scorer output."""
    path = run_dir / "scores_citations.jsonl"
    if not path.exists():
        return []
    results = []
    with open(path) as f:
        for line in f:
            if line.strip():
                results.append(json.loads(line))
    return results


def load_judge_scores(run_dir: Path) -> list[dict]:
    """Load judge scorer output."""
    path = run_dir / "scores_judges.jsonl"
    if not path.exists():
        return []
    results = []
    with open(path) as f:
        for line in f:
            if line.strip():
                results.append(json.loads(line))
    return results


def load_judge_agreement(run_dir: Path) -> dict:
    """Load inter-judge agreement stats."""
    path = run_dir / "judge_agreement.json"
    if path.exists():
        with open(path) as f:
            return json.load(f)
    return {}


def aggregate(run_dir: Path) -> dict:
    """Aggregate all scores into a single report."""
    citation_scores = load_citation_scores(run_dir)
    judge_scores = load_judge_scores(run_dir)
    agreement = load_judge_agreement(run_dir)

    # Organize scores by (system, metric)
    scores_by_system_metric = defaultdict(lambda: defaultdict(list))

    # Citation scores (metric 3)
    for r in citation_scores:
        scores_by_system_metric[r["system"]]["citation_accuracy"].append(r["composite_score"])

    # Judge scores (metrics 4-7) — average across both judges
    judge_pairs = defaultdict(lambda: defaultdict(list))
    for r in judge_scores:
        if r["score"] is not None:
            key = (r["prompt_id"], r["system"], r["metric"])
            judge_pairs[key][r["judge"]].append(r["score"])

    for key, judges in judge_pairs.items():
        prompt_id, system, metric = key
        # Ensemble: average the two judges' scores
        all_scores = []
        for judge_scores_list in judges.values():
            all_scores.extend(judge_scores_list)
        if all_scores:
            ensemble_mean = sum(all_scores) / len(all_scores)
            scores_by_system_metric[system][metric].append(ensemble_mean)

    # Compute aggregates with CIs
    aggregates = {}
    all_systems = sorted(scores_by_system_metric.keys())
    all_metrics = sorted(set(
        m for s in scores_by_system_metric.values() for m in s.keys()
    ))

    for system in all_systems:
        aggregates[system] = {}
        for metric in all_metrics:
            scores = scores_by_system_metric[system][metric]
            mean, ci_lower, ci_upper = bootstrap_ci(scores)
            aggregates[system][metric] = {
                "mean": round(mean, 3),
                "ci_lower": round(ci_lower, 3),
                "ci_upper": round(ci_upper, 3),
                "n": len(scores),
            }

    report = {
        "version": "v1",
        "systems": all_systems,
        "metrics": all_metrics,
        "aggregates": aggregates,
        "judge_agreement": agreement,
    }

    return report


def generate_scorecard_html(report: dict, run_dir: Path):
    """Generate a simple HTML scorecard with a table."""
    systems = report["systems"]
    metrics = report["metrics"]
    agg = report["aggregates"]

    # Build HTML table
    rows_html = ""
    for system in systems:
        cells = f"<td><strong>{system}</strong></td>"
        for metric in metrics:
            data = agg.get(system, {}).get(metric, {})
            mean = data.get("mean", 0)
            ci_l = data.get("ci_lower", 0)
            ci_u = data.get("ci_upper", 0)
            n = data.get("n", 0)

            # Color code: green > 0.7 or > 4.0, yellow > 0.4 or > 2.5, red otherwise
            threshold_high = 4.0 if metric != "citation_accuracy" and metric != "mode_match" else 0.7
            threshold_mid = 2.5 if metric != "citation_accuracy" and metric != "mode_match" else 0.4

            if mean >= threshold_high:
                color = "#d4edda"
            elif mean >= threshold_mid:
                color = "#fff3cd"
            else:
                color = "#f8d7da"

            cells += f'<td style="background:{color};text-align:center">'
            cells += f'<strong>{mean:.2f}</strong><br>'
            cells += f'<small style="color:#666">[{ci_l:.2f}, {ci_u:.2f}] n={n}</small>'
            cells += "</td>"
        rows_html += f"<tr>{cells}</tr>\n"

    # Header row
    header_cells = "<th>System</th>"
    for m in metrics:
        display_name = m.replace("_", " ").title()
        header_cells += f"<th>{display_name}</th>"

    # Agreement section
    agreement_html = ""
    if report.get("judge_agreement"):
        agreement_html = "<h2>Inter-Judge Agreement (Cohen's Kappa)</h2><table><tr><th>Metric</th><th>Kappa</th><th>Exact %</th><th>Within-1 %</th></tr>"
        for metric, stats in report["judge_agreement"].items():
            agreement_html += f"<tr><td>{metric}</td><td>{stats['cohens_kappa']:.3f}</td><td>{stats['exact_agreement']*100:.1f}%</td><td>{stats['within_one_agreement']*100:.1f}%</td></tr>"
        agreement_html += "</table>"

    html = f"""<!DOCTYPE html>
<html>
<head>
    <title>Sherpa Eval v1 — Scorecard</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 1200px; margin: 40px auto; padding: 0 20px; color: #333; }}
        h1 {{ border-bottom: 2px solid #333; padding-bottom: 10px; }}
        table {{ border-collapse: collapse; width: 100%; margin: 20px 0; }}
        th, td {{ border: 1px solid #ddd; padding: 10px; }}
        th {{ background: #f5f5f5; text-align: center; }}
        .meta {{ color: #666; font-size: 14px; }}
        small {{ font-size: 11px; }}
    </style>
</head>
<body>
    <h1>Sherpa Eval v1 Scorecard</h1>
    <p class="meta">9 systems, 35 prompts, 7 metrics. Scores are ensemble means (Claude Opus + GPT-5 judges). 95% bootstrap CIs shown.</p>

    <h2>Scores by System and Metric</h2>
    <table>
        <tr>{header_cells}</tr>
        {rows_html}
    </table>

    {agreement_html}

    <h2>Methodology</h2>
    <p>See <a href="https://github.com/boommark/pmmsherpa/tree/main/evals">full methodology and raw data</a>.</p>
</body>
</html>"""

    path = run_dir / "scorecard.html"
    path.write_text(html)
    return path


def main():
    parser = argparse.ArgumentParser(description="Aggregate eval scores")
    parser.add_argument("--run", required=True, help="Path to reports/v1/ directory")
    args = parser.parse_args()

    run_dir = Path(args.run)

    # Check inputs exist
    has_citations = (run_dir / "scores_citations.jsonl").exists()
    has_judges = (run_dir / "scores_judges.jsonl").exists()

    if not has_citations and not has_judges:
        print("ERROR: No score files found. Run score_citations.py and/or score_judges.py first.")
        return

    if has_citations:
        print(f"Found citation scores")
    if has_judges:
        print(f"Found judge scores")

    # Aggregate
    report = aggregate(run_dir)

    # Write aggregates JSON
    agg_path = run_dir / "aggregates.json"
    with open(agg_path, "w") as f:
        json.dump(report, f, indent=2)
    print(f"Aggregates written to {agg_path}")

    # Generate scorecard HTML
    html_path = generate_scorecard_html(report, run_dir)
    print(f"Scorecard written to {html_path}")

    # Print summary
    print(f"\n{'='*70}")
    print("AGGREGATE SUMMARY")
    print(f"{'='*70}")

    systems = report["systems"]
    metrics = report["metrics"]

    # Header
    header = f"{'System':<20}"
    for m in metrics:
        header += f" {m[:14]:>14}"
    print(header)
    print("-" * (20 + 15 * len(metrics)))

    for system in systems:
        row = f"{system:<20}"
        for m in metrics:
            data = report["aggregates"].get(system, {}).get(m, {})
            mean = data.get("mean", 0)
            ci_l = data.get("ci_lower", 0)
            ci_u = data.get("ci_upper", 0)
            row += f" {mean:>5.2f}[{ci_l:.2f},{ci_u:.2f}]"
        print(row)

    print(f"\n{len(systems)} systems x {len(metrics)} metrics")


if __name__ == "__main__":
    main()
