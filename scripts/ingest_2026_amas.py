#!/usr/bin/env python3
"""
One-off script to ingest only 2026-* Sharebird AMA files.
"""

import os
import sys
import hashlib
from pathlib import Path
from typing import Optional
from datetime import datetime

import openai
from supabase import create_client, Client
from dotenv import load_dotenv
from tqdm import tqdm

sys.path.append(str(Path(__file__).parent))
from processors.ama_processor import AMAProcessor

load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

AMAS_PATH = Path("/Users/abhishekratna/Documents/Antigravity Projects/Sharebird Scraper/output")
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 512
BATCH_SIZE = 100


def compute_content_hash(content: str) -> str:
    return hashlib.sha256(content.encode()).hexdigest()


def generate_embeddings(client, texts):
    response = client.embeddings.create(
        input=texts, model=EMBEDDING_MODEL, dimensions=EMBEDDING_DIMENSIONS
    )
    return [item.embedding for item in response.data]


def insert_document(supabase, title, source_file, raw_content, author=None, speaker_role=None, tags=None):
    content_hash = compute_content_hash(raw_content)
    existing = supabase.table("documents").select("id").eq("content_hash", content_hash).execute()
    if existing.data:
        print(f"  Skipping (already exists): {title[:60]}")
        return None

    result = supabase.table("documents").insert({
        "title": title,
        "source_type": "ama",
        "source_file": str(source_file),
        "raw_content": raw_content,
        "content_hash": content_hash,
        "author": author,
        "speaker_role": speaker_role,
        "tags": tags or []
    }).execute()
    return result.data[0]["id"] if result.data else None


def insert_chunks(supabase, openai_client, document_id, chunks):
    if not chunks:
        return 0

    all_embeddings = []
    for i in range(0, len(chunks), BATCH_SIZE):
        batch_texts = [c["content"] for c in chunks[i:i + BATCH_SIZE]]
        all_embeddings.extend(generate_embeddings(openai_client, batch_texts))

    chunk_data = []
    for idx, (chunk, embedding) in enumerate(zip(chunks, all_embeddings)):
        chunk_data.append({
            "document_id": document_id,
            "chunk_index": idx,
            "content": chunk["content"],
            "token_count": chunk.get("token_count", len(chunk["content"].split())),
            "context_header": chunk.get("context_header"),
            "question": chunk.get("question"),
            "embedding": embedding,
            "embedding_updated_at": datetime.utcnow().isoformat()
        })

    inserted = 0
    for i in range(0, len(chunk_data), BATCH_SIZE):
        result = supabase.table("chunks").insert(chunk_data[i:i + BATCH_SIZE]).execute()
        inserted += len(result.data) if result.data else 0
    return inserted


def main():
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    openai_client = openai.OpenAI(api_key=OPENAI_API_KEY)
    processor = AMAProcessor()

    ama_files = sorted(AMAS_PATH.glob("2026-*.md"))
    print(f"Found {len(ama_files)} files matching 2026-*.md\n")

    docs_inserted = 0
    chunks_inserted = 0
    skipped = 0

    for ama_path in tqdm(ama_files, desc="Ingesting 2026 AMAs"):
        try:
            doc = processor.process(ama_path)
            if not doc:
                skipped += 1
                continue

            doc_id = insert_document(
                supabase,
                title=doc["title"],
                source_file=ama_path,
                raw_content=doc["raw_content"],
                author=doc.get("author"),
                speaker_role=doc.get("speaker_role"),
                tags=doc.get("tags", [])
            )

            if doc_id:
                n = insert_chunks(supabase, openai_client, doc_id, doc["chunks"])
                docs_inserted += 1
                chunks_inserted += n
                print(f"  + {doc['title'][:70]} ({n} chunks)")
            else:
                skipped += 1
        except Exception as e:
            print(f"  ERROR {ama_path.name}: {e}")
            skipped += 1

    print(f"\nDone!")
    print(f"  Documents inserted: {docs_inserted}")
    print(f"  Chunks inserted:    {chunks_inserted}")
    print(f"  Skipped:            {skipped}")


if __name__ == "__main__":
    main()
