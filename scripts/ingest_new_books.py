#!/usr/bin/env python3
"""
Ingest new books into PMM Sherpa corpus.

Targets specific new books from kindle_scraper that aren't yet in the corpus.
Uses content_hash deduplication so safe to re-run.

Usage:
    python ingest_new_books.py              # Ingest all new books
    python ingest_new_books.py --dry-run    # Preview only
"""

import os
import sys
from pathlib import Path
from datetime import datetime

# Add scripts dir to path
SCRIPT_DIR = Path(__file__).parent.resolve()
sys.path.insert(0, str(SCRIPT_DIR))

from dotenv import load_dotenv
load_dotenv(SCRIPT_DIR / ".env")

from processors.book_processor import BookProcessor
from ingest_documents import get_supabase_client, get_openai_client, insert_document, insert_chunks

# ── New books to ingest ──────────────────────────────────────────
KINDLE_BASE = Path("/Users/abhishekratna/Documents/Antigravity Projects/kindle_scraper/output")

NEW_BOOKS = [
    # PM Books → source_type: book_pm
    {
        "file": KINDLE_BASE / "PM Books" / "CONTINUOUS_DISCOVERY_HABITS.md",
        "title": "Continuous Discovery Habits",
        "author": "Teresa Torres",
        "source_type": "book_pm",
        "tags": ["pm-book", "customer-discovery", "product-discovery"],
    },
    {
        "file": KINDLE_BASE / "PM Books" / "Escaping_the_Build_Trap_How_Effective_Product_Management_Creates_Real_Value.md",
        "title": "Escaping the Build Trap",
        "author": "Melissa Perri",
        "source_type": "book_pm",
        "tags": ["pm-book", "product-management", "product-strategy"],
    },
    {
        "file": KINDLE_BASE / "PM Books" / "The_Innovators_Dilemma_Clay_Christensen.md",
        "title": "The Innovator's Dilemma",
        "author": "Clayton Christensen",
        "source_type": "book_pm",
        "tags": ["pm-book", "innovation", "disruption"],
    },
    {
        "file": KINDLE_BASE / "PM Books" / "Transformed_Marty_Cagan.md",
        "title": "Transformed",
        "author": "Marty Cagan",
        "source_type": "book_pm",
        "tags": ["pm-book", "product-management", "product-operating-model"],
    },
    # PMM Books → source_type: book
    {
        "file": KINDLE_BASE / "PMM Books" / "ALL_MARKETERS_ARETTARS.md",
        "title": "All Marketers Are Liars",
        "author": "Seth Godin",
        "source_type": "book",
        "tags": ["pmm-book", "storytelling", "marketing-authenticity"],
    },
    {
        "file": KINDLE_BASE / "PMM Books" / "New_Sales_Simplified_THE_ESSENTIAL_HANDBOOK_FOR_PROSPECTING.md",
        "title": "New Sales Simplified",
        "author": "Mike Weinberg",
        "source_type": "book",
        "tags": ["pmm-book", "sales", "prospecting"],
    },
    {
        "file": KINDLE_BASE / "PMM Books" / "Ogilvy_on_Advertising.md",
        "title": "Ogilvy on Advertising",
        "author": "David Ogilvy",
        "source_type": "book",
        "tags": ["pmm-book", "advertising", "copywriting"],
    },
]


def main():
    import argparse
    parser = argparse.ArgumentParser(description="Ingest new books into PMM Sherpa")
    parser.add_argument("--dry-run", action="store_true", help="Preview only")
    args = parser.parse_args()

    print("=" * 60)
    print("PMM Sherpa — New Book Ingestion")
    print(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # Validate files exist
    missing = [b for b in NEW_BOOKS if not b["file"].exists()]
    if missing:
        for b in missing:
            print(f"  [MISSING] {b['title']}: {b['file']}")
        print(f"\n{len(missing)} book file(s) not found. Aborting.")
        return 1

    print(f"\nBooks to ingest: {len(NEW_BOOKS)}")
    for b in NEW_BOOKS:
        print(f"  [{b['source_type']}] {b['title']} — {b['author']}")

    if args.dry_run:
        print("\n[DRY RUN] No changes made.")
        return 0

    # Init clients
    print("\nInitializing clients...")
    supabase = get_supabase_client()
    openai_client = get_openai_client()
    processor = BookProcessor()

    stats = {"ingested": 0, "chunks": 0, "skipped": 0, "errors": 0}

    for book in NEW_BOOKS:
        print(f"\n{'─'*50}")
        print(f"Processing: {book['title']} by {book['author']}")

        try:
            doc = processor.process(book["file"])
            if not doc:
                print(f"  [SKIP] Empty or unprocessable")
                stats["skipped"] += 1
                continue

            # Override processor metadata with our curated values
            doc["title"] = book["title"]
            doc["author"] = book["author"]

            # Update context headers on chunks
            for chunk in doc["chunks"]:
                header = f"{book['title']} by {book['author']}"
                if chunk.get("page_number"):
                    header += f" (Page {chunk['page_number']})"
                chunk["context_header"] = header

            doc_id = insert_document(
                supabase,
                title=book["title"],
                source_type=book["source_type"],
                source_file=str(book["file"]),
                raw_content=doc["raw_content"],
                author=book["author"],
                tags=book["tags"],
            )

            if doc_id:
                # Check if chunks already exist
                existing = (
                    supabase.table("chunks")
                    .select("id", count="exact")
                    .eq("document_id", doc_id)
                    .execute()
                )
                if existing.count and existing.count > 0:
                    print(f"  [SKIP] Already has {existing.count} chunks")
                    stats["skipped"] += 1
                    continue

                n = insert_chunks(supabase, openai_client, doc_id, doc["chunks"])
                print(f"  [OK] {n} chunks ingested")
                stats["ingested"] += 1
                stats["chunks"] += n
            else:
                print(f"  [SKIP] Document insert returned no ID (likely duplicate)")
                stats["skipped"] += 1

        except Exception as e:
            print(f"  [ERROR] {e}")
            stats["errors"] += 1

    # Summary
    print(f"\n{'='*60}")
    print("INGESTION SUMMARY")
    print(f"{'='*60}")
    print(f"  Ingested:  {stats['ingested']} books, {stats['chunks']} chunks")
    print(f"  Skipped:   {stats['skipped']}")
    print(f"  Errors:    {stats['errors']}")

    return 1 if stats["errors"] > 0 else 0


if __name__ == "__main__":
    sys.exit(main())
