#!/usr/bin/env python3
"""
Targeted ingestion of new content discovered March 2026.

New content:
- 5 new books in kindle_scraper/output/ (root, outside PMM Books/)
- 11 Communication Books in kindle_scraper/output/Communication Books/
- 64 new PMA blog articles in PMA Scraper/output feb 2026/
"""

import os
import sys
from pathlib import Path

# Add processors to path
sys.path.append(str(Path(__file__).parent))

from dotenv import load_dotenv
from tqdm import tqdm

# Reuse existing pipeline components
from ingest_documents import (
    get_supabase_client,
    get_openai_client,
    insert_document,
    insert_chunks,
)
from processors.book_processor import BookProcessor
from processors.blog_processor import BlogProcessor

# Load environment variables from .env.local
load_dotenv(Path(__file__).parent.parent / ".env.local")

# New content paths
NEW_BOOKS_ROOT = Path("/Users/abhishekratna/Documents/Antigravity Projects/kindle_scraper/output")
COMM_BOOKS = NEW_BOOKS_ROOT / "Communication Books"
NEW_BLOGS = Path("/Users/abhishekratna/Documents/Antigravity Projects/PMA Scraper/output feb 2026")

# Books in root output/ that are NOT in PMM Books/ subfolder
NEW_BOOK_FILES = [
    NEW_BOOKS_ROOT / "THE_TRUSTED_ADVISOR.md",
    NEW_BOOKS_ROOT / "Managing the Professional Service Firm Maister.md",
    NEW_BOOKS_ROOT / "obviously awesome 2.md",
    NEW_BOOKS_ROOT / "Stories_that_Stick.md",
    NEW_BOOKS_ROOT / "Inspired_Marty_Cagan.md",
]


def ingest_new_books(supabase, openai_client):
    """Ingest new books from root output/ and Communication Books/."""
    print("\n📚 Ingesting new books...")
    processor = BookProcessor()
    stats = {"documents": 0, "chunks": 0, "skipped": 0, "errors": 0}

    # Collect all new book files
    book_files = list(NEW_BOOK_FILES)

    # Add Communication Books
    if COMM_BOOKS.exists():
        book_files.extend(list(COMM_BOOKS.glob("*.md")))

    print(f"  Found {len(book_files)} new book files to process")

    for book_path in tqdm(book_files, desc="Books"):
        if not book_path.exists():
            print(f"  ⚠️  File not found: {book_path.name}")
            stats["skipped"] += 1
            continue

        try:
            doc = processor.process(book_path)
            if not doc:
                print(f"  ⚠️  Could not process: {book_path.name}")
                stats["skipped"] += 1
                continue

            doc_id = insert_document(
                supabase,
                title=doc["title"],
                source_type="book",
                source_file=str(book_path),
                raw_content=doc["raw_content"],
                author=doc.get("author"),
                tags=doc.get("tags", []),
            )

            if doc_id:
                # Check if this was a duplicate (insert_document returns existing ID for dupes)
                # We need to check if chunks already exist
                existing_chunks = (
                    supabase.table("chunks")
                    .select("id", count="exact")
                    .eq("document_id", doc_id)
                    .execute()
                )
                if existing_chunks.count and existing_chunks.count > 0:
                    print(f"  ⏭️  Already has chunks: {doc['title'][:50]}")
                    stats["skipped"] += 1
                    continue

                chunks_inserted = insert_chunks(
                    supabase, openai_client, doc_id, doc["chunks"]
                )
                stats["documents"] += 1
                stats["chunks"] += chunks_inserted
                print(f"  ✅ {doc['title'][:50]} → {chunks_inserted} chunks")
        except Exception as e:
            print(f"  ❌ Error processing {book_path.name}: {e}")
            stats["errors"] += 1

    return stats


def ingest_new_blogs(supabase, openai_client):
    """Ingest new PMA blog articles from feb 2026 folder."""
    print("\n📝 Ingesting new PMA blog articles (Feb 2026)...")
    processor = BlogProcessor()
    stats = {"documents": 0, "chunks": 0, "skipped": 0, "errors": 0}

    if not NEW_BLOGS.exists():
        print(f"  ⚠️  Blog path not found: {NEW_BLOGS}")
        return stats

    blog_files = sorted(NEW_BLOGS.glob("*.md"))
    print(f"  Found {len(blog_files)} new blog articles to process")

    for blog_path in tqdm(blog_files, desc="Blogs"):
        try:
            doc = processor.process(blog_path)
            if not doc:
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
                existing_chunks = (
                    supabase.table("chunks")
                    .select("id", count="exact")
                    .eq("document_id", doc_id)
                    .execute()
                )
                if existing_chunks.count and existing_chunks.count > 0:
                    stats["skipped"] += 1
                    continue

                chunks_inserted = insert_chunks(
                    supabase, openai_client, doc_id, doc["chunks"]
                )
                stats["documents"] += 1
                stats["chunks"] += chunks_inserted
        except Exception as e:
            print(f"  ❌ Error processing {blog_path.name}: {e}")
            stats["errors"] += 1

    return stats


def main():
    print("=" * 60)
    print("PMMSherpa — New Content Ingestion (March 2026)")
    print("=" * 60)

    # Initialize clients
    print("\n🔧 Initializing clients...")
    supabase = get_supabase_client()
    openai_client = get_openai_client()
    print("  ✅ Clients initialized")

    # Run ingestion
    book_stats = ingest_new_books(supabase, openai_client)
    blog_stats = ingest_new_blogs(supabase, openai_client)

    # Print summary
    print("\n" + "=" * 60)
    print("📊 Ingestion Summary")
    print("=" * 60)

    for name, stats in [("NEW BOOKS", book_stats), ("NEW BLOGS (Feb 2026)", blog_stats)]:
        print(f"\n{name}:")
        print(f"  Documents ingested: {stats['documents']}")
        print(f"  Chunks created:     {stats['chunks']}")
        print(f"  Skipped (dupes):    {stats['skipped']}")
        if stats.get("errors"):
            print(f"  Errors:             {stats['errors']}")

    total_docs = book_stats["documents"] + blog_stats["documents"]
    total_chunks = book_stats["chunks"] + blog_stats["chunks"]
    print(f"\nTOTAL NEW:")
    print(f"  Documents: {total_docs}")
    print(f"  Chunks:    {total_chunks}")
    print("\n✅ Ingestion complete!")


if __name__ == "__main__":
    main()
