#!/usr/bin/env python3
"""
Update CORPUS.md with live counts from Supabase.

Queries document and chunk counts by source_type, then rewrites
the count lines in CORPUS.md via regex. Safe to run repeatedly.

Usage:
    python update_corpus_counts.py                    # Update CORPUS.md
    python update_corpus_counts.py --dry-run          # Print counts only
    python update_corpus_counts.py --corpus /path/to  # Custom CORPUS.md path
"""

import os
import re
import sys
import json
from datetime import datetime
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.resolve()

# Default CORPUS.md location (Mac)
DEFAULT_CORPUS = SCRIPT_DIR.parent / "CORPUS.md"


def get_counts_from_supabase():
    """Query Supabase for document and chunk counts by source_type.

    Uses Prefer: count=exact with Range: 0-0 to get counts from
    Content-Range headers without fetching all rows.
    """
    import urllib.request
    import urllib.error

    # Support both env var naming conventions
    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        raise ValueError("Missing SUPABASE_URL/SUPABASE_SERVICE_KEY env vars")

    base = url.rstrip("/")
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    }

    SOURCE_TYPES = [
        "book", "book_pm",
        "podcast_pm", "podcast_pmm", "podcast_ai",
        "ama", "blog", "substack", "blog_external",
    ]

    def count_request(path):
        """Get exact count via Content-Range header."""
        req = urllib.request.Request(
            f"{base}/rest/v1/{path}",
            headers={**headers, "Prefer": "count=exact", "Range": "0-0"},
        )
        try:
            with urllib.request.urlopen(req) as resp:
                cr = resp.headers.get("Content-Range", "")
                if "/" in cr:
                    return int(cr.split("/")[1])
        except urllib.error.HTTPError:
            pass
        return 0

    counts = {}
    for st in SOURCE_TYPES:
        doc_count = count_request(f"documents?select=id&source_type=eq.{st}")
        if doc_count == 0:
            continue

        # Chunk count: use inner join via PostgREST embedding
        # chunks joined to documents filtered by source_type
        chunk_count = count_request(
            f"chunks?select=id,documents!inner(source_type)&documents.source_type=eq.{st}"
        )

        counts[st] = {"documents": doc_count, "chunks": chunk_count}

    return counts


def update_corpus_md(corpus_path, counts, dry_run=False):
    """Rewrite count lines in CORPUS.md with live data."""
    content = corpus_path.read_text()
    original = content

    today = datetime.now().strftime("%Y-%m-%d")

    # Total across all source types
    total_docs = sum(c["documents"] for c in counts.values())
    total_chunks = sum(c["chunks"] for c in counts.values())

    # 1. Update "Last updated" date
    content = re.sub(
        r"\*\*Last updated:\*\* \d{4}-\d{2}-\d{2}",
        f"**Last updated:** {today}",
        content,
    )

    # 2. Update total counts
    content = re.sub(
        r"\*\*Total:\*\* ~[\d,]+ documents, ~[\d,]+ chunks",
        f"**Total:** ~{total_docs:,} documents, ~{total_chunks:,} chunks",
        content,
    )

    # 3. Update per-layer source_type lines
    # Pattern: **source_type:** `TYPE` | **Documents:** N | **Chunks:** N
    for st in ["book", "book_pm", "ama", "blog", "substack", "blog_external"]:
        if st in counts:
            pattern = (
                rf"(\*\*source_type:\*\* `{re.escape(st)}` \| \*\*Documents:\*\* )"
                rf"[\d,]+"
                rf"( \| \*\*Chunks:\*\* )"
                rf"[\d,]+"
            )
            replacement = rf"\g<1>{counts[st]['documents']:,}\g<2>{counts[st]['chunks']:,}"
            content = re.sub(pattern, replacement, content)

    # 4. Update podcast sub-sections (different format)
    # Pattern: **Documents:** N | **Chunks:** N (under podcast_pm, podcast_pmm, podcast_ai headers)
    podcast_sections = {
        "podcast_pm": r"(### podcast_pm.*?\n\*\*Documents:\*\* )(\d[\d,]*)( \| \*\*Chunks:\*\* )(\d[\d,]*)",
        "podcast_pmm": r"(### podcast_pmm.*?\n\*\*Documents:\*\* )(\d[\d,]*)( \| \*\*Chunks:\*\* )(\d[\d,]*)",
        "podcast_ai": r"(### podcast_ai.*?\n\*\*Documents:\*\* )(\d[\d,]*)( \| \*\*Chunks:\*\* )(\d[\d,]*)",
    }
    for st, pattern in podcast_sections.items():
        if st in counts:
            def make_replacer(c):
                def replacer(m):
                    return f"{m.group(1)}{c['documents']:,}{m.group(3)}{c['chunks']:,}"
                return replacer
            content = re.sub(pattern, make_replacer(counts[st]), content, flags=re.DOTALL)

    if content == original:
        print("  CORPUS.md: no changes needed")
        return False

    if dry_run:
        print("  [DRY RUN] Would update CORPUS.md")
        return False

    corpus_path.write_text(content)
    print(f"  CORPUS.md updated ({today})")
    return True


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Update CORPUS.md with live Supabase counts")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--corpus", type=str, default=None, help="Path to CORPUS.md")
    args = parser.parse_args()

    # Load env
    try:
        from dotenv import load_dotenv
        load_dotenv(SCRIPT_DIR / ".env")
    except ImportError:
        pass

    corpus_path = Path(args.corpus) if args.corpus else DEFAULT_CORPUS
    if not corpus_path.exists():
        print(f"CORPUS.md not found at {corpus_path}")
        print("(Expected on Mac only — VPS runs skip this step)")
        return 0

    print("Querying Supabase for corpus counts...")
    counts = get_counts_from_supabase()

    # Print summary
    total_docs = sum(c["documents"] for c in counts.values())
    total_chunks = sum(c["chunks"] for c in counts.values())
    print(f"\n  {'Source Type':<20} {'Docs':>6} {'Chunks':>8}")
    print(f"  {'─'*20} {'─'*6} {'─'*8}")
    for st in sorted(counts.keys()):
        c = counts[st]
        print(f"  {st:<20} {c['documents']:>6,} {c['chunks']:>8,}")
    print(f"  {'─'*20} {'─'*6} {'─'*8}")
    print(f"  {'TOTAL':<20} {total_docs:>6,} {total_chunks:>8,}")

    update_corpus_md(corpus_path, counts, dry_run=args.dry_run)
    return 0


if __name__ == "__main__":
    sys.exit(main())
