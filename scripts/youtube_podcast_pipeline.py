#!/usr/bin/env python3
"""
YouTube Podcast Pipeline for PMM Sherpa
========================================
Fetches new episodes from Lenny's Podcast and PMA YouTube channels,
chunks transcripts at 600 tokens, embeds with OpenAI, and ingests
into Supabase.

Designed for Claude Code remote triggers — uses Supabase as state
store (no local checkpoint files needed).

Env vars required:
    SUPABASE_URL          — Supabase project URL
    SUPABASE_SERVICE_KEY  — Supabase service role key
    OPENAI_API_KEY        — OpenAI API key for embeddings
    RESEND_API_KEY        — (optional) Resend key for email summaries

Usage:
    python3 youtube_podcast_pipeline.py                    # Full run
    python3 youtube_podcast_pipeline.py --dry-run          # Preview only
    python3 youtube_podcast_pipeline.py --recent 10        # Last 10 per channel
    python3 youtube_podcast_pipeline.py --channel lenny    # One channel only
    python3 youtube_podcast_pipeline.py --channel pma
"""

import argparse
import hashlib
import json
import os
import re
import subprocess
import sys
import time
import random
from datetime import datetime, timezone

# ── Auto-install dependencies ──────────────────────────────────────
def ensure_deps():
    deps = {
        "yt_dlp": "yt-dlp",
        "youtube_transcript_api": "youtube-transcript-api",
        "openai": "openai",
        "tiktoken": "tiktoken",
    }
    missing = []
    for module, pkg in deps.items():
        try:
            __import__(module)
        except ImportError:
            missing.append(pkg)
    if missing:
        print(f"Installing: {', '.join(missing)}")
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", *missing, "-q"],
            stdout=subprocess.DEVNULL,
        )

ensure_deps()

import yt_dlp
from youtube_transcript_api import YouTubeTranscriptApi
import openai
import tiktoken

# ── Config ──────────────────────────────────────────────────────────
CHANNELS = {
    "lenny": {
        "url": "https://www.youtube.com/@LennysPodcast",
        "author": "Lenny Rachitsky",
        "source_type": "podcast_pm",
        "tags": ["lennys_podcast"],
    },
    "pma": {
        "url": "https://www.youtube.com/@ProductMarketingAlliance",
        "author": "Product Marketing Alliance",
        "source_type": "podcast_pmm",
        "tags": ["pma"],
    },
}

EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 512
TARGET_TOKENS = 600
MAX_TOKENS = 800
BATCH_SIZE = 25
MIN_DELAY = 3
MAX_DELAY = 8

ENCODER = tiktoken.get_encoding("cl100k_base")


# ── Helpers ─────────────────────────────────────────────────────────
def count_tokens(text):
    return len(ENCODER.encode(text))


def compute_hash(content):
    return hashlib.sha256(content.encode()).hexdigest()


# ── YouTube Scraping ────────────────────────────────────────────────
def enumerate_channel_videos(channel_url):
    """Use yt-dlp to list all videos from a channel."""
    ydl_opts = {
        "extract_flat": True,
        "quiet": True,
        "no_warnings": True,
        "ignoreerrors": True,
    }
    print(f"  Enumerating videos from {channel_url} ...")
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        result = ydl.extract_info(channel_url, download=False)

    if not result:
        return []

    entries = result.get("entries", [])
    videos = []
    for entry in entries or []:
        if entry is None:
            continue
        if entry.get("_type") == "playlist" or "entries" in entry:
            for v in entry.get("entries", []) or []:
                if v is not None:
                    videos.append(v)
        else:
            videos.append(entry)
    return videos


def filter_videos(videos, min_duration=180):
    """Filter out shorts and non-video content."""
    filtered = []
    for v in videos:
        vid = v.get("id") or v.get("url", "")
        title = v.get("title", "Unknown")
        duration = v.get("duration")

        if not vid:
            continue
        if vid.startswith("http"):
            m = re.search(r"(?:v=|/)([a-zA-Z0-9_-]{11})", vid)
            if m:
                vid = m.group(1)
            else:
                continue
        v["id"] = vid

        if duration is not None and duration < min_duration:
            continue
        if title and "#shorts" in title.lower():
            continue
        filtered.append(v)
    return filtered


def fetch_transcript(video_id):
    """Fetch transcript for a video."""
    try:
        api = YouTubeTranscriptApi()
        transcript = api.fetch(video_id)
        lines = [s.text.strip() for s in transcript.snippets if s.text.strip()]
        return "\n".join(lines) if lines else None
    except Exception as e:
        print(f"    [WARN] No transcript for {video_id}: {type(e).__name__}")
        return None


# ── Transcript Chunking (600-token, matching ingest_podcasts.py) ───
def chunk_transcript(content, title, author, source_type):
    """Custom transcript chunker: paragraph-split at ~600 tokens."""
    body = content.strip()
    if not body:
        return []

    label_map = {
        "podcast_pm": "PM Podcast",
        "podcast_pmm": "PMM Podcast",
        "podcast_ai": "AI Podcast",
    }
    label = label_map.get(source_type, "Podcast")
    base_header = f'"{title}" - {author} ({label})'

    # Transcripts are single-newline per line — group into paragraph blocks
    if "\n\n" in body:
        paragraphs = [p.strip() for p in re.split(r"\n\n+", body) if p.strip()]
    else:
        lines = [l.strip() for l in body.split("\n") if l.strip()]
        paragraphs = []
        current = ""
        current_t = 0
        for line in lines:
            lt = count_tokens(line)
            if current_t + lt > TARGET_TOKENS and current:
                paragraphs.append(current.strip())
                current = ""
                current_t = 0
            current += line + " "
            current_t += lt
        if current.strip():
            paragraphs.append(current.strip())

    chunks = []
    current_chunk = ""
    current_tokens = 0

    for para in paragraphs:
        para_tokens = count_tokens(para)

        if para_tokens > MAX_TOKENS:
            sentences = re.split(r"(?<=[.!?])\s+", para)
            for sent in sentences:
                sent_tokens = count_tokens(sent)
                if current_tokens + sent_tokens > TARGET_TOKENS and current_chunk:
                    chunks.append({
                        "content": current_chunk.strip(),
                        "token_count": current_tokens,
                        "context_header": base_header,
                        "section_title": None,
                    })
                    current_chunk = ""
                    current_tokens = 0
                current_chunk += sent + " "
                current_tokens += sent_tokens
            continue

        if current_tokens + para_tokens > TARGET_TOKENS and current_chunk:
            chunks.append({
                "content": current_chunk.strip(),
                "token_count": current_tokens,
                "context_header": base_header,
                "section_title": None,
            })
            current_chunk = ""
            current_tokens = 0

        current_chunk += para + "\n\n"
        current_tokens += para_tokens

    if current_chunk.strip():
        chunks.append({
            "content": current_chunk.strip(),
            "token_count": current_tokens,
            "context_header": base_header,
            "section_title": None,
        })

    # Safety: hard-split any chunk over 7500 tokens (OpenAI 8192 limit)
    safe_chunks = []
    for chunk in chunks:
        if chunk["token_count"] > 7500:
            text = chunk["content"]
            sentences = re.split(r"(?<=[.!?])\s+", text)
            sub_chunk = ""
            sub_tokens = 0
            for sent in sentences:
                st = count_tokens(sent)
                if sub_tokens + st > TARGET_TOKENS and sub_chunk:
                    safe_chunks.append({
                        "content": sub_chunk.strip(),
                        "token_count": sub_tokens,
                        "context_header": chunk["context_header"],
                        "section_title": None,
                    })
                    sub_chunk = ""
                    sub_tokens = 0
                sub_chunk += sent + " "
                sub_tokens += st
            if sub_chunk.strip():
                safe_chunks.append({
                    "content": sub_chunk.strip(),
                    "token_count": sub_tokens,
                    "context_header": chunk["context_header"],
                    "section_title": None,
                })
        else:
            safe_chunks.append(chunk)

    return safe_chunks


# ── Supabase Client ─────────────────────────────────────────────────
class SupabaseClient:
    """Lightweight Supabase REST client — no SDK dependency needed."""

    def __init__(self, url, key):
        self.url = url.rstrip("/")
        self.headers = {
            "apikey": key,
            "Authorization": f"Bearer {key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }

    def _request(self, method, path, **kwargs):
        import urllib.request
        import urllib.error

        url = f"{self.url}/rest/v1/{path}"
        headers = {**self.headers, **kwargs.get("extra_headers", {})}
        data = kwargs.get("data")
        body = json.dumps(data).encode() if data else None

        req = urllib.request.Request(url, data=body, headers=headers, method=method)
        try:
            with urllib.request.urlopen(req) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            error_body = e.read().decode()
            raise RuntimeError(f"Supabase {method} {path}: {e.code} — {error_body}")

    def get_existing_docs(self, source_type):
        """Get source_file and title for all podcast documents of a given type."""
        path = f"documents?select=source_file,title&source_type=eq.{source_type}"
        return self._request("GET", path)

    def check_document_exists(self, content_hash):
        """Check if a document with this content hash already exists."""
        path = f"documents?select=id&content_hash=eq.{content_hash}"
        return self._request("GET", path)

    def insert_document(self, data):
        """Insert a document and return its ID."""
        return self._request("POST", "documents", data=data)

    def check_chunks_exist(self, document_id):
        """Check if chunks already exist for a document."""
        path = f"chunks?select=id&document_id=eq.{document_id}"
        extra = {"Prefer": "count=exact", "Range": "0-0"}
        # Use HEAD-like approach: just check if any exist
        result = self._request("GET", path, extra_headers=extra)
        return len(result) > 0

    def insert_chunks(self, chunks_data):
        """Insert chunks in batch."""
        return self._request("POST", "chunks", data=chunks_data)


# ── Embedding ───────────────────────────────────────────────────────
def embed_batch(openai_client, texts):
    """Generate embeddings for a batch of texts."""
    response = openai_client.embeddings.create(
        input=texts, model=EMBEDDING_MODEL, dimensions=EMBEDDING_DIMENSIONS
    )
    return [item.embedding for item in response.data]


# ── Main Pipeline ───────────────────────────────────────────────────
def run_pipeline(channel_keys, recent=0, dry_run=False):
    """Run the full YouTube podcast pipeline."""

    # Init clients
    supabase_url = os.environ["SUPABASE_URL"]
    supabase_key = os.environ["SUPABASE_SERVICE_KEY"]
    openai_key = os.environ["OPENAI_API_KEY"]

    sb = SupabaseClient(supabase_url, supabase_key)
    oai = openai.OpenAI(api_key=openai_key)

    total_stats = {"channels": 0, "new_videos": 0, "ingested": 0, "chunks": 0, "skipped": 0, "failed": 0}
    ingested_titles = {}  # channel_key -> [title, ...]
    failed_titles = {}    # channel_key -> [title, ...]

    for key in channel_keys:
        ch = CHANNELS[key]
        ingested_titles[key] = []
        failed_titles[key] = []
        print(f"\n{'='*60}")
        print(f"Channel: {ch['author']} ({key})")
        print(f"{'='*60}")

        # 1. Enumerate videos
        videos = enumerate_channel_videos(ch["url"])
        print(f"  Total entries: {len(videos)}")

        videos = filter_videos(videos)
        print(f"  After filtering shorts: {len(videos)}")

        if recent > 0:
            videos = videos[:recent]
            print(f"  Taking {recent} most recent")

        # 2. Check what's already ingested via Supabase
        #    Match by youtube://VIDEO_ID source_file OR by title (for old bulk-imported episodes)
        existing_docs = sb.get_existing_docs(ch["source_type"])
        existing_video_ids = set()
        existing_titles = set()
        for doc in existing_docs:
            sf = doc.get("source_file", "")
            title = doc.get("title", "")
            if sf.startswith("youtube://"):
                existing_video_ids.add(sf.replace("youtube://", ""))
            if title:
                existing_titles.add(title.lower().strip())

        def is_already_ingested(v):
            if v["id"] in existing_video_ids:
                return True
            vt = v.get("title", "").lower().strip()
            if vt and vt in existing_titles:
                return True
            return False

        pending = [v for v in videos if not is_already_ingested(v)]
        print(f"  New: {len(pending)}, Already ingested: {len(videos) - len(pending)}")

        if dry_run:
            for i, v in enumerate(pending[:20]):
                dur = v.get("duration", "?")
                print(f"    {i+1}. [{v['id']}] {v.get('title', '?')[:70]} ({dur}s)")
            if len(pending) > 20:
                print(f"    ... and {len(pending) - 20} more")
            total_stats["new_videos"] += len(pending)
            total_stats["channels"] += 1
            continue

        # 3. Fetch transcripts and ingest
        total_stats["channels"] += 1
        for i, video in enumerate(pending):
            title = video.get("title", "Unknown")
            vid = video["id"]
            print(f"\n  [{i+1}/{len(pending)}] {title[:70]}")

            transcript = fetch_transcript(vid)
            if not transcript:
                total_stats["failed"] += 1
                failed_titles[key].append(f"{title} (no transcript)")
                continue

            total_stats["new_videos"] += 1

            # Build raw content with frontmatter
            channel_name = video.get("channel", video.get("uploader", ch["author"]))
            duration = video.get("duration", 0)
            raw_content = (
                f"---\n"
                f'title: "{title}"\n'
                f'video_id: "{vid}"\n'
                f'url: "https://www.youtube.com/watch?v={vid}"\n'
                f'channel: "{channel_name}"\n'
                f"duration_seconds: {duration}\n"
                f"---\n\n"
                f"{transcript}"
            )

            content_hash = compute_hash(raw_content)

            # Check if already exists by hash
            existing = sb.check_document_exists(content_hash)
            if existing:
                print(f"    [SKIP] Already ingested (hash match)")
                total_stats["skipped"] += 1
                continue

            # Chunk transcript first
            chunks = chunk_transcript(transcript, title, ch["author"], ch["source_type"])
            if not chunks:
                print(f"    [SKIP] No chunks produced")
                total_stats["skipped"] += 1
                continue

            # Generate all embeddings BEFORE inserting anything into DB
            # (prevents orphaned document records if embedding fails)
            try:
                all_embeddings = []
                for batch_start in range(0, len(chunks), BATCH_SIZE):
                    batch = chunks[batch_start : batch_start + BATCH_SIZE]
                    texts = [c["content"] for c in batch]
                    embeddings = embed_batch(oai, texts)
                    all_embeddings.extend(embeddings)
                    time.sleep(0.3)
            except Exception as e:
                print(f"    [ERROR] Embedding failed: {e}")
                total_stats["failed"] += 1
                failed_titles[key].append(f"{title} (embed error: {e})")
                continue

            # Now insert document + chunks atomically
            try:
                doc_result = sb.insert_document({
                    "title": title,
                    "source_type": ch["source_type"],
                    "source_file": f"youtube://{vid}",
                    "raw_content": raw_content,
                    "content_hash": content_hash,
                    "author": ch["author"],
                    "tags": ch["tags"] + [ch["source_type"]],
                })
                doc_id = doc_result[0]["id"]
            except Exception as e:
                print(f"    [ERROR] Insert document: {e}")
                total_stats["failed"] += 1
                failed_titles[key].append(f"{title} (insert error)")
                continue

            # Insert chunks with pre-computed embeddings
            chunk_count = 0
            try:
                for batch_start in range(0, len(chunks), BATCH_SIZE):
                    batch = chunks[batch_start : batch_start + BATCH_SIZE]
                    batch_embs = all_embeddings[batch_start : batch_start + len(batch)]

                    chunks_data = []
                    for j, (chunk, emb) in enumerate(zip(batch, batch_embs)):
                        chunks_data.append({
                            "document_id": doc_id,
                            "chunk_index": batch_start + j,
                            "content": chunk["content"],
                            "token_count": chunk["token_count"],
                            "context_header": chunk.get("context_header"),
                            "section_title": chunk.get("section_title"),
                            "embedding": emb,
                            "embedding_updated_at": datetime.now(timezone.utc).isoformat(),
                        })

                    sb.insert_chunks(chunks_data)
                    chunk_count += len(chunks_data)

                print(f"    [OK] {chunk_count} chunks")
                total_stats["ingested"] += 1
                total_stats["chunks"] += chunk_count
                ingested_titles[key].append(f"{title} ({chunk_count} chunks)")

            except Exception as e:
                print(f"    [ERROR] Chunk insert: {e}")
                total_stats["failed"] += 1
                failed_titles[key].append(f"{title} (chunk insert error: {e})")

            # Rate limit between videos
            if i < len(pending) - 1:
                delay = random.uniform(MIN_DELAY, MAX_DELAY)
                time.sleep(delay)

    # Summary
    print(f"\n{'='*60}")
    print("PIPELINE SUMMARY")
    print(f"{'='*60}")
    print(f"  Channels processed: {total_stats['channels']}")
    print(f"  New videos found:   {total_stats['new_videos']}")
    print(f"  Ingested:           {total_stats['ingested']}")
    print(f"  Chunks created:     {total_stats['chunks']}")
    print(f"  Skipped:            {total_stats['skipped']}")
    print(f"  Failed:             {total_stats['failed']}")

    if not dry_run:
        for key in channel_keys:
            if ingested_titles[key]:
                print(f"\n  {CHANNELS[key]['author']} — ingested:")
                for t in ingested_titles[key]:
                    print(f"    + {t}")
            if failed_titles[key]:
                print(f"\n  {CHANNELS[key]['author']} — failed:")
                for t in failed_titles[key]:
                    print(f"    x {t}")

    total_stats["ingested_titles"] = ingested_titles
    total_stats["failed_titles"] = failed_titles
    return total_stats


# ── Email Summary ──────────────────────────────────────────────────
def send_summary_email(stats):
    """Send pipeline summary email via Resend with episode titles."""
    import urllib.request
    import urllib.error

    resend_key = os.environ.get("RESEND_API_KEY", "")
    if not resend_key:
        print("No RESEND_API_KEY set — skipping email.")
        return

    ingested_titles = stats.get("ingested_titles", {})
    failed_titles = stats.get("failed_titles", {})
    has_errors = stats["failed"] > 0

    # Subject line
    if has_errors and stats["ingested"] == 0:
        subject = f"PMM Sherpa YouTube Pipeline: FAILED ({stats['failed']} errors)"
    elif stats["ingested"] > 0:
        subject = f"PMM Sherpa YouTube Pipeline: {stats['ingested']} episodes, {stats['chunks']} chunks"
    else:
        subject = "PMM Sherpa YouTube Pipeline: No new episodes"

    # Body with episode titles
    lines = [
        f"YouTube Podcast Pipeline — {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        "=" * 50,
        "",
        f"Ingested:  {stats['ingested']} episodes, {stats['chunks']} chunks",
        f"Skipped:   {stats['skipped']}",
        f"Failed:    {stats['failed']}",
        "",
    ]

    for key, titles in ingested_titles.items():
        if titles:
            channel_name = CHANNELS.get(key, {}).get("author", key)
            lines.append(f"--- {channel_name} (new) ---")
            for t in titles:
                lines.append(f"  + {t}")
            lines.append("")

    for key, titles in failed_titles.items():
        if titles:
            channel_name = CHANNELS.get(key, {}).get("author", key)
            lines.append(f"--- {channel_name} (failed) ---")
            for t in titles:
                lines.append(f"  x {t}")
            lines.append("")

    if not any(ingested_titles.values()) and not any(failed_titles.values()):
        lines.append("No new episodes found across all channels.")

    body = "\n".join(lines)

    try:
        import subprocess as _sp
        curl_data = json.dumps({
            "from": "PMM Sherpa Pipeline <pipeline@pmmsherpa.com>",
            "to": ["abhishekratna@gmail.com"],
            "subject": subject,
            "text": body,
        })
        result = _sp.run(
            ["curl", "-s", "-X", "POST", "https://api.resend.com/emails",
             "-H", f"Authorization: Bearer {resend_key}",
             "-H", "Content-Type: application/json",
             "-d", curl_data],
            capture_output=True, text=True, timeout=15,
        )
        if '"id"' in result.stdout:
            print(f"Summary email sent: {subject}")
        else:
            print(f"Email send issue: {result.stdout}")
    except Exception as e:
        print(f"Failed to send email: {e}")


def update_corpus_counts(stats):
    """Update CORPUS.md with live counts. Works locally (Mac) or via SSH from VPS."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    corpus_local = os.path.join(script_dir, "..", "CORPUS.md")

    if os.path.exists(corpus_local):
        # Running on Mac — update directly
        try:
            sys.path.insert(0, script_dir)
            from update_corpus_counts import get_counts_from_supabase, update_corpus_md
            from pathlib import Path
            counts = get_counts_from_supabase()
            update_corpus_md(Path(corpus_local), counts)
            print("CORPUS.md updated with live counts")
        except Exception as e:
            print(f"Failed to update CORPUS.md locally: {e}")
    else:
        # Running on VPS — try SSH to Mac via Tailscale
        try:
            mac_cmd = (
                'cd "/Users/abhishekratna/Documents/AOL AI/pmmsherpa/scripts" '
                '&& python3 update_corpus_counts.py'
            )
            result = subprocess.run(
                [
                    "sshpass", "-p", "Adis12ab",
                    "ssh", "-o", "ConnectTimeout=5",
                    "-o", "PreferredAuthentications=password",
                    "-o", "PubkeyAuthentication=no",
                    "-o", "StrictHostKeyChecking=no",
                    "abhishekratna@100.83.114.114",
                    mac_cmd,
                ],
                capture_output=True, text=True, timeout=30,
            )
            if result.returncode == 0:
                print("CORPUS.md updated on Mac via SSH")
            else:
                print(f"SSH to Mac failed (will sync on next Mac pipeline run): {result.stderr[:100]}")
        except Exception as e:
            print(f"Could not reach Mac to update CORPUS.md (will sync on next daily run): {e}")


def main():
    parser = argparse.ArgumentParser(description="YouTube Podcast Pipeline for PMM Sherpa")
    parser.add_argument("--dry-run", action="store_true", help="Preview without ingesting")
    parser.add_argument("--recent", type=int, default=0, help="Only N most recent per channel (0=all)")
    parser.add_argument("--channel", type=str, choices=["lenny", "pma"], help="Single channel only")
    parser.add_argument("--no-email", action="store_true", help="Skip summary email")
    args = parser.parse_args()

    channels = [args.channel] if args.channel else list(CHANNELS.keys())

    print(f"YouTube Podcast Pipeline — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Channels: {', '.join(channels)}")
    if args.dry_run:
        print("[DRY RUN MODE]")
    print()

    stats = run_pipeline(channels, recent=args.recent, dry_run=args.dry_run)

    if not args.dry_run and not args.no_email:
        send_summary_email(stats)

    # Update CORPUS.md if it exists locally (Mac), or try to trigger Mac update via SSH
    if not args.dry_run and stats["ingested"] > 0:
        update_corpus_counts(stats)

    if not args.dry_run and (stats["ingested"] > 0 or stats["failed"] > 0):
        status = "OK" if stats["failed"] == 0 else "ERRORS"
        print(f"\nResult: {status}")

    sys.exit(1 if stats.get("failed", 0) > 0 and stats.get("ingested", 0) == 0 else 0)


if __name__ == "__main__":
    main()
