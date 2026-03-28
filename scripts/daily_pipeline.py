#!/usr/bin/env python3
"""
PMM Sherpa Daily Pipeline
=========================
Automated daily scraping of PMA blogs + Sharebird AMAs, followed by
incremental ingestion into Supabase (embeddings + vector store).

Uses a checkpoint file to track which files have already been ingested,
so subsequent runs only process genuinely new files (seconds, not minutes).

Usage:
    python daily_pipeline.py                    # Run full pipeline
    python daily_pipeline.py --scrape-only      # Only scrape, skip ingestion
    python daily_pipeline.py --ingest-only      # Only ingest, skip scraping
    python daily_pipeline.py --dry-run          # Show what would happen, don't execute
    python daily_pipeline.py --reset-checkpoint # Clear checkpoint, re-scan all files

Exit codes:
    0 = success (or nothing new to process)
    1 = partial failure (one scraper failed but pipeline continued)
    2 = auth failure (session expired, needs manual re-auth)
    3 = fatal error
"""

import os
import sys
import subprocess
import json
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional

# ── Paths ────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = SCRIPT_DIR.parent
ANTIGRAVITY = Path(os.environ.get(
    "PMM_PIPELINE_ANTIGRAVITY",
    "/Users/abhishekratna/Documents/Antigravity Projects"
))

PMA_SCRAPER_DIR = ANTIGRAVITY / "PMA Scraper"
SHAREBIRD_SCRAPER_DIR = ANTIGRAVITY / "Sharebird Scraper"

PMA_OUTPUT = PMA_SCRAPER_DIR / "output"
SHAREBIRD_OUTPUT = SHAREBIRD_SCRAPER_DIR / "output"

LOG_DIR = PROJECT_ROOT / "logs" / "pipeline"
LOG_DIR.mkdir(parents=True, exist_ok=True)

CHECKPOINT_FILE = SCRIPT_DIR / ".ingestion_checkpoint.json"

# ── Logging ──────────────────────────────────────────────────────────
log_file = LOG_DIR / f"pipeline_{datetime.now().strftime('%Y-%m-%d_%H%M%S')}.log"

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(log_file),
        logging.StreamHandler(sys.stdout),
    ],
)
log = logging.getLogger("pipeline")


# ── Checkpoint ───────────────────────────────────────────────────────
def load_checkpoint() -> dict:
    """Load the set of already-ingested file paths from checkpoint."""
    if CHECKPOINT_FILE.exists():
        try:
            data = json.loads(CHECKPOINT_FILE.read_text())
            return data
        except (json.JSONDecodeError, KeyError):
            return {"ingested_files": [], "last_run": None}
    return {"ingested_files": [], "last_run": None}


def save_checkpoint(checkpoint: dict):
    """Save checkpoint to disk."""
    checkpoint["last_run"] = datetime.now().isoformat()
    CHECKPOINT_FILE.write_text(json.dumps(checkpoint, indent=2))


def get_new_files(directories: list[Path], checkpoint: dict, glob_pattern: str = "*.md") -> list[Path]:
    """Return only files not yet in the checkpoint."""
    ingested = set(checkpoint.get("ingested_files", []))
    new_files = []
    for d in directories:
        if not d.exists():
            continue
        for f in d.glob(glob_pattern):
            if str(f) not in ingested:
                new_files.append(f)
    return sorted(new_files)


# ── Scraper Runner ───────────────────────────────────────────────────
def count_md_files(directory: Path) -> int:
    if not directory.exists():
        return 0
    return len(list(directory.glob("*.md")))


def run_scraper(name: str, cwd: Path, args: list[str], timeout_minutes: int = 30) -> dict:
    """Run a scraper subprocess and return result info."""
    log.info(f"{'='*50}")
    log.info(f"Starting {name} scraper...")

    output_dir = cwd / "output"
    files_before = count_md_files(output_dir)

    cmd = [sys.executable, "main.py"] + args
    log.info(f"  Command: {' '.join(cmd)}")
    log.info(f"  Working dir: {cwd}")

    start = datetime.now()

    try:
        result = subprocess.run(
            cmd,
            cwd=str(cwd),
            capture_output=True,
            text=True,
            timeout=timeout_minutes * 60,
            env={**os.environ, "PYTHONUNBUFFERED": "1"},
        )

        duration = (datetime.now() - start).total_seconds()
        files_after = count_md_files(output_dir)
        new_files = files_after - files_before

        if result.stdout:
            for line in result.stdout.strip().split("\n"):
                log.info(f"  [{name}] {line}")
        if result.stderr:
            for line in result.stderr.strip().split("\n"):
                log.warning(f"  [{name} stderr] {line}")

        auth_expired = result.returncode in (2, 3)

        if auth_expired:
            log.warning(f"{name}: Session expired (exit code {result.returncode}). Needs manual re-auth.")
        elif result.returncode != 0:
            log.error(f"{name}: Failed with exit code {result.returncode}")
        else:
            log.info(f"{name}: Completed successfully. {new_files} new files. ({duration:.0f}s)")

        return {
            "success": result.returncode == 0,
            "exit_code": result.returncode,
            "auth_expired": auth_expired,
            "new_files": new_files,
            "duration_sec": duration,
        }

    except subprocess.TimeoutExpired:
        duration = (datetime.now() - start).total_seconds()
        log.error(f"{name}: Timed out after {timeout_minutes} minutes")
        return {"success": False, "exit_code": -1, "auth_expired": False, "new_files": 0, "duration_sec": duration}
    except Exception as e:
        log.error(f"{name}: Exception: {e}")
        return {"success": False, "exit_code": -1, "auth_expired": False, "new_files": 0, "duration_sec": 0}


# ── Ingestion ────────────────────────────────────────────────────────
def run_ingestion(dry_run: bool = False) -> dict:
    """
    Incremental ingestion: only process files not in the checkpoint.
    After successful ingestion of each file, immediately update the checkpoint.
    """
    log.info(f"{'='*50}")
    log.info("Starting ingestion into Supabase...")

    checkpoint = load_checkpoint()
    last_run = checkpoint.get("last_run", "never")
    log.info(f"  Last ingestion run: {last_run}")
    log.info(f"  Checkpoint has {len(checkpoint.get('ingested_files', []))} tracked files")

    # Find new files across all output dirs
    pma_dirs = [PMA_OUTPUT]
    for d in PMA_SCRAPER_DIR.iterdir():
        if d.is_dir() and d.name.startswith("output") and d != PMA_OUTPUT:
            pma_dirs.append(d)

    new_blogs = get_new_files(pma_dirs, checkpoint)
    new_amas = get_new_files([SHAREBIRD_OUTPUT], checkpoint)

    log.info(f"  New PMA blogs to ingest: {len(new_blogs)}")
    log.info(f"  New Sharebird AMAs to ingest: {len(new_amas)}")

    if not new_blogs and not new_amas:
        log.info("  Nothing new to ingest. All files already in checkpoint.")
        return {"success": True, "documents": 0, "chunks": 0, "skipped": 0, "errors": 0}

    if dry_run:
        log.info("  [DRY RUN] Would ingest:")
        for f in new_blogs[:10]:
            log.info(f"    Blog: {f.name}")
        if len(new_blogs) > 10:
            log.info(f"    ... and {len(new_blogs) - 10} more")
        for f in new_amas[:10]:
            log.info(f"    AMA: {f.name}")
        if len(new_amas) > 10:
            log.info(f"    ... and {len(new_amas) - 10} more")
        return {"success": True, "documents": 0, "chunks": 0, "skipped": 0, "errors": 0}

    # Initialize clients
    sys.path.insert(0, str(SCRIPT_DIR))

    from dotenv import load_dotenv
    load_dotenv(SCRIPT_DIR / ".env")

    from ingest_documents import (
        get_supabase_client,
        get_openai_client,
        insert_document,
        insert_chunks,
    )
    from processors.blog_processor import BlogProcessor
    from processors.ama_processor import AMAProcessor

    try:
        supabase = get_supabase_client()
        openai_client = get_openai_client()
    except Exception as e:
        log.error(f"Failed to initialize clients: {e}")
        return {"success": False, "documents": 0, "chunks": 0, "skipped": 0, "errors": 1}

    stats = {"documents": 0, "chunks": 0, "skipped": 0, "errors": 0}

    def mark_ingested(filepath: Path):
        """Add file to checkpoint immediately after successful processing."""
        checkpoint.setdefault("ingested_files", []).append(str(filepath))
        save_checkpoint(checkpoint)

    # ── Ingest new PMA blogs ──
    if new_blogs:
        blog_processor = BlogProcessor()
        log.info(f"\n  Processing {len(new_blogs)} new PMA blogs...")

        for blog_path in new_blogs:
            try:
                doc = blog_processor.process(blog_path)
                if not doc:
                    mark_ingested(blog_path)  # Mark as seen even if empty
                    stats["skipped"] += 1
                    continue

                doc_id = insert_document(
                    supabase,
                    title=doc["title"],
                    source_type="blog",
                    source_file=str(blog_path),
                    raw_content=doc["raw_content"],
                    author=doc.get("author"),
                    url=doc.get("url"),
                    tags=doc.get("tags", []),
                )

                if doc_id:
                    existing = (
                        supabase.table("chunks")
                        .select("id", count="exact")
                        .eq("document_id", doc_id)
                        .execute()
                    )
                    if existing.count and existing.count > 0:
                        mark_ingested(blog_path)
                        stats["skipped"] += 1
                        continue

                    n = insert_chunks(supabase, openai_client, doc_id, doc["chunks"])
                    stats["documents"] += 1
                    stats["chunks"] += n
                    log.info(f"  + Blog: {doc['title'][:60]} ({n} chunks)")
                else:
                    stats["skipped"] += 1

                mark_ingested(blog_path)

            except Exception as e:
                log.error(f"  Blog error {blog_path.name}: {e}")
                stats["errors"] += 1
                # Don't mark as ingested on error — will retry next run

    # ── Ingest new Sharebird AMAs ──
    if new_amas:
        ama_processor = AMAProcessor()
        log.info(f"\n  Processing {len(new_amas)} new Sharebird AMAs...")

        for ama_path in new_amas:
            try:
                doc = ama_processor.process(ama_path)
                if not doc:
                    mark_ingested(ama_path)
                    stats["skipped"] += 1
                    continue

                doc_id = insert_document(
                    supabase,
                    title=doc["title"],
                    source_type="ama",
                    source_file=str(ama_path),
                    raw_content=doc["raw_content"],
                    author=doc.get("author"),
                    speaker_role=doc.get("speaker_role"),
                    tags=doc.get("tags", []),
                )

                if doc_id:
                    existing = (
                        supabase.table("chunks")
                        .select("id", count="exact")
                        .eq("document_id", doc_id)
                        .execute()
                    )
                    if existing.count and existing.count > 0:
                        mark_ingested(ama_path)
                        stats["skipped"] += 1
                        continue

                    n = insert_chunks(supabase, openai_client, doc_id, doc["chunks"])
                    stats["documents"] += 1
                    stats["chunks"] += n
                    log.info(f"  + AMA: {doc['title'][:60]} ({n} chunks)")
                else:
                    stats["skipped"] += 1

                mark_ingested(ama_path)

            except Exception as e:
                log.error(f"  AMA error {ama_path.name}: {e}")
                stats["errors"] += 1

    stats["success"] = stats["errors"] == 0
    return stats


# ── Alerts ───────────────────────────────────────────────────────────
def send_alert(subject: str, body: str):
    """Send alert email via Resend. Fails silently if key not set."""
    try:
        import requests
        resend_key = os.getenv("RESEND_API_KEY")
        if not resend_key:
            log.info("No RESEND_API_KEY set — skipping email alert.")
            return

        requests.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {resend_key}"},
            json={
                "from": "PMM Sherpa Pipeline <pipeline@pmmsherpa.com>",
                "to": ["abhishekratna@gmail.com"],
                "subject": subject,
                "text": body,
            },
            timeout=10,
        )
        log.info("Alert email sent.")
    except Exception as e:
        log.warning(f"Failed to send alert email: {e}")


# ── Main ─────────────────────────────────────────────────────────────
def main():
    import argparse

    parser = argparse.ArgumentParser(description="PMM Sherpa Daily Pipeline")
    parser.add_argument("--scrape-only", action="store_true", help="Only scrape, skip ingestion")
    parser.add_argument("--ingest-only", action="store_true", help="Only ingest, skip scraping")
    parser.add_argument("--dry-run", action="store_true", help="Show plan without executing")
    parser.add_argument("--reset-checkpoint", action="store_true", help="Clear ingestion checkpoint and re-scan all files")
    args = parser.parse_args()

    if args.reset_checkpoint:
        if CHECKPOINT_FILE.exists():
            CHECKPOINT_FILE.unlink()
            log.info("Checkpoint cleared. Next ingestion will scan all files.")
        else:
            log.info("No checkpoint file to clear.")
        if not args.ingest_only and not args.scrape_only:
            return 0

    log.info("=" * 60)
    log.info(f"PMM Sherpa Daily Pipeline — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    log.info(f"Log file: {log_file}")
    log.info("=" * 60)

    results = {}
    auth_failures = []

    # ── Phase 1: Scraping ──
    if not args.ingest_only:
        if args.dry_run:
            log.info("[DRY RUN] Would scrape PMA and Sharebird")
        else:
            pma_result = run_scraper("PMA", PMA_SCRAPER_DIR, ["scrape"], timeout_minutes=30)
            results["pma"] = pma_result
            if pma_result["auth_expired"]:
                auth_failures.append("PMA")

            sb_result = run_scraper("Sharebird", SHAREBIRD_SCRAPER_DIR, ["scrape", "--headless"], timeout_minutes=30)
            results["sharebird"] = sb_result
            if sb_result["auth_expired"]:
                auth_failures.append("Sharebird")

    # ── Phase 2: Ingestion ──
    if not args.scrape_only:
        ingest_result = run_ingestion(dry_run=args.dry_run)
        results["ingestion"] = ingest_result

    # ── Summary ──
    log.info("\n" + "=" * 60)
    log.info("PIPELINE SUMMARY")
    log.info("=" * 60)

    if "pma" in results:
        r = results["pma"]
        status = "AUTH EXPIRED" if r["auth_expired"] else ("OK" if r["success"] else "FAILED")
        log.info(f"  PMA Scraper:       {status} | {r['new_files']} new files | {r['duration_sec']:.0f}s")

    if "sharebird" in results:
        r = results["sharebird"]
        status = "AUTH EXPIRED" if r["auth_expired"] else ("OK" if r["success"] else "FAILED")
        log.info(f"  Sharebird Scraper: {status} | {r['new_files']} new files | {r['duration_sec']:.0f}s")

    if "ingestion" in results:
        r = results["ingestion"]
        status = "OK" if r.get("success") else "ERRORS"
        log.info(f"  Ingestion:         {status} | {r['documents']} docs, {r['chunks']} chunks | {r['skipped']} skipped, {r['errors']} errors")

    log.info(f"\nLog saved to: {log_file}")

    # ── Alerts ──
    if auth_failures:
        alert_body = (
            f"The following scrapers have expired sessions and need manual re-auth:\n\n"
            f"{', '.join(auth_failures)}\n\n"
            f"PMA: cd '{PMA_SCRAPER_DIR}' && python main.py login <magic_link>\n"
            f"Sharebird: cd '{SHAREBIRD_SCRAPER_DIR}' && python main.py login\n\n"
            f"Full log: {log_file}"
        )
        send_alert("PMM Sherpa Pipeline: Auth Expired", alert_body)
        log.warning(f"\nACTION REQUIRED: Re-authenticate {', '.join(auth_failures)}")

    # Exit code
    any_scrape_failed = any(
        not r.get("success") and not r.get("auth_expired")
        for key, r in results.items()
        if key in ("pma", "sharebird")
    )
    any_auth_expired = bool(auth_failures)
    ingest_failed = results.get("ingestion", {}).get("errors", 0) > 0

    if any_auth_expired:
        return 2
    elif any_scrape_failed or ingest_failed:
        return 1
    else:
        return 0


if __name__ == "__main__":
    sys.exit(main())
