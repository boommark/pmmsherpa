#!/usr/bin/env python3
"""
PMMSherpa Knowledge Ingestion Pipeline

Ingests PMM documents from three sources:
- PMM Books (Markdown with page delimiters)
- PMA Blogs (Markdown with YAML front matter)
- Sharebird AMAs (Markdown Q&A format)

Chunks documents, generates embeddings, and stores in Supabase.
"""

import os
import sys
import hashlib
import json
from pathlib import Path
from typing import Optional
from datetime import datetime

import openai
from supabase import create_client, Client
from dotenv import load_dotenv
from tqdm import tqdm

# Add processors to path
sys.path.append(str(Path(__file__).parent))
from processors.book_processor import BookProcessor
from processors.blog_processor import BlogProcessor
from processors.ama_processor import AMAProcessor

# Load environment variables
load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Source paths
BOOKS_PATH = Path("/Users/abhishekratna/Documents/Antigravity Projects/kindle_scraper/output/PMM Books")
BLOGS_PATH = Path("/Users/abhishekratna/Documents/Antigravity Projects/PMA Scraper/output")
AMAS_PATH = Path("/Users/abhishekratna/Documents/Antigravity Projects/Sharebird Scraper/output")

# Embedding config
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 512
BATCH_SIZE = 100  # OpenAI batch size for embeddings


def get_supabase_client() -> Client:
    """Initialize Supabase client with service role key."""
    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        raise ValueError("Missing Supabase configuration. Check .env file.")
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)


def get_openai_client() -> openai.OpenAI:
    """Initialize OpenAI client."""
    if not OPENAI_API_KEY:
        raise ValueError("Missing OpenAI API key. Check .env file.")
    return openai.OpenAI(api_key=OPENAI_API_KEY)


def compute_content_hash(content: str) -> str:
    """Compute SHA-256 hash of content for deduplication."""
    return hashlib.sha256(content.encode()).hexdigest()


def generate_embeddings(
    client: openai.OpenAI,
    texts: list[str],
    model: str = EMBEDDING_MODEL,
    dimensions: int = EMBEDDING_DIMENSIONS
) -> list[list[float]]:
    """Generate embeddings for a batch of texts."""
    response = client.embeddings.create(
        input=texts,
        model=model,
        dimensions=dimensions
    )
    return [item.embedding for item in response.data]


def insert_document(
    supabase: Client,
    title: str,
    source_type: str,
    source_file: str,
    raw_content: str,
    author: Optional[str] = None,
    url: Optional[str] = None,
    speaker_role: Optional[str] = None,
    tags: list[str] = None
) -> Optional[str]:
    """Insert a document into the database, return document ID."""
    content_hash = compute_content_hash(raw_content)

    # Check if document already exists
    existing = supabase.table("documents").select("id").eq("content_hash", content_hash).execute()
    if existing.data:
        print(f"  Skipping duplicate: {title[:50]}...")
        return existing.data[0]["id"]

    data = {
        "title": title,
        "source_type": source_type,
        "source_file": source_file,
        "raw_content": raw_content,
        "content_hash": content_hash,
        "author": author,
        "url": url,
        "speaker_role": speaker_role,
        "tags": tags or []
    }

    result = supabase.table("documents").insert(data).execute()
    return result.data[0]["id"] if result.data else None


def insert_chunks(
    supabase: Client,
    openai_client: openai.OpenAI,
    document_id: str,
    chunks: list[dict]
) -> int:
    """Insert chunks with embeddings for a document."""
    if not chunks:
        return 0

    # Generate embeddings in batches
    all_embeddings = []
    for i in range(0, len(chunks), BATCH_SIZE):
        batch_texts = [c["content"] for c in chunks[i:i + BATCH_SIZE]]
        batch_embeddings = generate_embeddings(openai_client, batch_texts)
        all_embeddings.extend(batch_embeddings)

    # Prepare chunk data
    chunk_data = []
    for idx, (chunk, embedding) in enumerate(zip(chunks, all_embeddings)):
        chunk_data.append({
            "document_id": document_id,
            "chunk_index": idx,
            "content": chunk["content"],
            "token_count": chunk.get("token_count", len(chunk["content"].split())),
            "context_header": chunk.get("context_header"),
            "page_number": chunk.get("page_number"),
            "section_title": chunk.get("section_title"),
            "question": chunk.get("question"),
            "embedding": embedding,
            "embedding_updated_at": datetime.utcnow().isoformat()
        })

    # Insert chunks in batches
    inserted = 0
    for i in range(0, len(chunk_data), BATCH_SIZE):
        batch = chunk_data[i:i + BATCH_SIZE]
        result = supabase.table("chunks").insert(batch).execute()
        inserted += len(result.data) if result.data else 0

    return inserted


def ingest_books(supabase: Client, openai_client: openai.OpenAI) -> dict:
    """Ingest all PMM books."""
    print("\n📚 Ingesting PMM Books...")
    processor = BookProcessor()
    stats = {"documents": 0, "chunks": 0, "skipped": 0}

    if not BOOKS_PATH.exists():
        print(f"  Warning: Books path not found: {BOOKS_PATH}")
        return stats

    book_files = list(BOOKS_PATH.glob("*.md"))
    for book_path in tqdm(book_files, desc="Books"):
        try:
            doc = processor.process(book_path)
            if not doc:
                stats["skipped"] += 1
                continue

            doc_id = insert_document(
                supabase,
                title=doc["title"],
                source_type="book",
                source_file=str(book_path),
                raw_content=doc["raw_content"],
                author=doc.get("author"),
                tags=doc.get("tags", [])
            )

            if doc_id:
                chunks_inserted = insert_chunks(
                    supabase, openai_client, doc_id, doc["chunks"]
                )
                stats["documents"] += 1
                stats["chunks"] += chunks_inserted
        except Exception as e:
            print(f"  Error processing {book_path.name}: {e}")
            stats["skipped"] += 1

    return stats


def ingest_blogs(supabase: Client, openai_client: openai.OpenAI) -> dict:
    """Ingest all PMA blog articles."""
    print("\n📝 Ingesting PMA Blogs...")
    processor = BlogProcessor()
    stats = {"documents": 0, "chunks": 0, "skipped": 0}

    if not BLOGS_PATH.exists():
        print(f"  Warning: Blogs path not found: {BLOGS_PATH}")
        return stats

    blog_files = list(BLOGS_PATH.glob("**/*.md"))
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
                tags=doc.get("tags", [])
            )

            if doc_id:
                chunks_inserted = insert_chunks(
                    supabase, openai_client, doc_id, doc["chunks"]
                )
                stats["documents"] += 1
                stats["chunks"] += chunks_inserted
        except Exception as e:
            print(f"  Error processing {blog_path.name}: {e}")
            stats["skipped"] += 1

    return stats


def ingest_amas(supabase: Client, openai_client: openai.OpenAI) -> dict:
    """Ingest all Sharebird AMA sessions."""
    print("\n💬 Ingesting Sharebird AMAs...")
    processor = AMAProcessor()
    stats = {"documents": 0, "chunks": 0, "skipped": 0}

    if not AMAS_PATH.exists():
        print(f"  Warning: AMAs path not found: {AMAS_PATH}")
        return stats

    ama_files = list(AMAS_PATH.glob("**/*.md"))
    for ama_path in tqdm(ama_files, desc="AMAs"):
        try:
            doc = processor.process(ama_path)
            if not doc:
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
                tags=doc.get("tags", [])
            )

            if doc_id:
                chunks_inserted = insert_chunks(
                    supabase, openai_client, doc_id, doc["chunks"]
                )
                stats["documents"] += 1
                stats["chunks"] += chunks_inserted
        except Exception as e:
            print(f"  Error processing {ama_path.name}: {e}")
            stats["skipped"] += 1

    return stats


def main():
    """Main ingestion pipeline."""
    print("=" * 60)
    print("PMMSherpa Knowledge Ingestion Pipeline")
    print("=" * 60)

    # Initialize clients
    print("\n🔧 Initializing clients...")
    supabase = get_supabase_client()
    openai_client = get_openai_client()
    print("  ✅ Clients initialized")

    # Run ingestion
    all_stats = {}
    all_stats["books"] = ingest_books(supabase, openai_client)
    all_stats["blogs"] = ingest_blogs(supabase, openai_client)
    all_stats["amas"] = ingest_amas(supabase, openai_client)

    # Print summary
    print("\n" + "=" * 60)
    print("📊 Ingestion Summary")
    print("=" * 60)

    total_docs = 0
    total_chunks = 0
    total_skipped = 0

    for source, stats in all_stats.items():
        print(f"\n{source.upper()}:")
        print(f"  Documents: {stats['documents']}")
        print(f"  Chunks: {stats['chunks']}")
        print(f"  Skipped: {stats['skipped']}")
        total_docs += stats["documents"]
        total_chunks += stats["chunks"]
        total_skipped += stats["skipped"]

    print(f"\nTOTAL:")
    print(f"  Documents: {total_docs}")
    print(f"  Chunks: {total_chunks}")
    print(f"  Skipped: {total_skipped}")
    print("\n✅ Ingestion complete!")


if __name__ == "__main__":
    main()
