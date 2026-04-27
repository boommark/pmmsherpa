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
    # PM Books → book_pm
    {
        "file": KINDLE_BASE / "PM Books" / "Empowered_Marty_Cagan.md",
        "title": "Empowered",
        "author": "Marty Cagan",
        "source_type": "book_pm",
        "tags": ["pm-book", "product-management", "product-teams"],
    },
    {
        "file": KINDLE_BASE / "PM Books" / "Masters of Scale - Reid Hoffman.md",
        "title": "Masters of Scale",
        "author": "Reid Hoffman",
        "source_type": "book_pm",
        "tags": ["pm-book", "entrepreneurship", "growth", "scaling"],
    },
    # Communication Books → book_communication
    {
        "file": KINDLE_BASE / "Communication Books" / "CONTAGIOUS_Why_Things_Catch_On_JONAH_BERGER.md",
        "title": "Contagious: Why Things Catch On",
        "author": "Jonah Berger",
        "source_type": "book_communication",
        "tags": ["communication-book", "virality", "word-of-mouth", "marketing"],
    },
    {
        "file": KINDLE_BASE / "Communication Books" / "Crack_the_CSuite_Code.md",
        "title": "Crack the C-Suite Code",
        "author": "Natalie Marcotullio",
        "source_type": "book_communication",
        "tags": ["communication-book", "executive-communication", "leadership", "career"],
    },
    {
        "file": KINDLE_BASE / "Communication Books" / "Elements of Persuaion.md",
        "title": "Elements of Persuasion",
        "author": "Richard Maxwell",
        "source_type": "book_communication",
        "tags": ["communication-book", "persuasion", "storytelling"],
    },
    {
        "file": KINDLE_BASE / "Communication Books" / "FIERCE_CONVERSATIONS_Achieving_Success_at_Work__in_Life.md",
        "title": "Fierce Conversations",
        "author": "Susan Scott",
        "source_type": "book_communication",
        "tags": ["communication-book", "difficult-conversations", "leadership"],
    },
    {
        "file": KINDLE_BASE / "Communication Books" / "Getting_to_Yes_Roger_Ury.md",
        "title": "Getting to Yes",
        "author": "Roger Fisher and William Ury",
        "source_type": "book_communication",
        "tags": ["communication-book", "negotiation", "conflict-resolution"],
    },
    {
        "file": KINDLE_BASE / "Communication Books" / "How to become a people magnet.md",
        "title": "How to Become a People Magnet",
        "author": "Marc Reklau",
        "source_type": "book_communication",
        "tags": ["communication-book", "interpersonal-skills", "influence"],
    },
    {
        "file": KINDLE_BASE / "Communication Books" / "Thanks_for_the_Feedback_Douglas_Stone.md",
        "title": "Thanks for the Feedback",
        "author": "Douglas Stone",
        "source_type": "book_communication",
        "tags": ["communication-book", "feedback", "learning", "growth"],
    },
    {
        "file": KINDLE_BASE / "Communication Books" / "The_Coaching_Habit_Say_Less_Ask_More.md",
        "title": "The Coaching Habit",
        "author": "Michael Bungay Stanier",
        "source_type": "book_communication",
        "tags": ["communication-book", "coaching", "leadership", "management"],
    },
    # Presentations Books → book_presentations
    {
        "file": KINDLE_BASE / "Presentations" / "Resonate-Nancy-Duarte.md",
        "title": "Resonate",
        "author": "Nancy Duarte",
        "source_type": "book_presentations",
        "tags": ["presentations-book", "storytelling", "presentations", "persuasion"],
    },
    {
        "file": KINDLE_BASE / "Presentations" / "ILLUMINATE_Ignite_Change_Through_Speeches_Stories.md",
        "title": "Illuminate",
        "author": "Nancy Duarte and Patti Sanchez",
        "source_type": "book_presentations",
        "tags": ["presentations-book", "change-communication", "leadership", "storytelling"],
    },
    {
        "file": KINDLE_BASE / "Presentations" / "cole_nussbaumer_knaflic_storytelling_with.md",
        "title": "Storytelling with Data",
        "author": "Cole Nussbaumer Knaflic",
        "source_type": "book_presentations",
        "tags": ["presentations-book", "data-visualization", "storytelling", "charts"],
    },
    {
        "file": KINDLE_BASE / "Presentations" / "HOW_TO_DELIVER_A_TEDta_Secrets_of_the_Worlds.md",
        "title": "How to Deliver a TED Talk",
        "author": "Jeremey Donovan",
        "source_type": "book_presentations",
        "tags": ["presentations-book", "public-speaking", "ted-talk", "presentations"],
    },
    # Sales Books → book_sales
    {
        "file": KINDLE_BASE / "Sales" / "100Moffers.md",
        "title": "100M Offers",
        "author": "Alex Hormozi",
        "source_type": "book_sales",
        "tags": ["sales-book", "offers", "pricing", "revenue"],
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
