#!/usr/bin/env python3
"""
Substack Scraper for PMM Sherpa
===============================
Scrapes free Substack posts via RSS feeds + Jina Reader.
No browser or auth needed. Checkpoint-based incremental scraping.

Usage:
    python scrape_substacks.py                # Scrape all configured Substacks
    python scrape_substacks.py --dry-run      # Show what would be scraped
    python scrape_substacks.py --list         # List configured Substacks

To add a new Substack, add an entry to SUBSTACKS below.
"""

import os
import sys
import json
import re
import xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime
from typing import Optional
import logging

import requests

log = logging.getLogger("substack_scraper")

# ── Configuration ────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent.resolve()
OUTPUT_DIR = SCRIPT_DIR.parent / "data" / "substacks"
CHECKPOINT_FILE = SCRIPT_DIR / ".substack_checkpoint.json"

JINA_PREFIX = "https://r.jina.ai/"
REQUEST_TIMEOUT = 30

# Add new Substacks here. Just subdomain + author name + tags.
SUBSTACKS = [
    {
        "subdomain": "aprildunford",
        "author": "April Dunford",
        "tags": ["positioning", "b2b", "differentiation"],
    },
    # Example — uncomment to add more:
    # {
    #     "subdomain": "lennysnewsletter",
    #     "author": "Lenny Rachitsky",
    #     "tags": ["product-management", "growth"],
    # },
    # {
    #     "subdomain": "elenaverna",
    #     "author": "Elena Verna",
    #     "tags": ["growth", "plg", "b2b"],
    # },
]


# ── Checkpoint ───────────────────────────────────────────────────────
def load_checkpoint() -> dict:
    if CHECKPOINT_FILE.exists():
        try:
            return json.loads(CHECKPOINT_FILE.read_text())
        except (json.JSONDecodeError, KeyError):
            pass
    return {"scraped_urls": {}, "last_run": None}


def save_checkpoint(checkpoint: dict):
    checkpoint["last_run"] = datetime.now().isoformat()
    CHECKPOINT_FILE.write_text(json.dumps(checkpoint, indent=2))


# ── RSS Parsing ──────────────────────────────────────────────────────
def fetch_rss(subdomain: str) -> list[dict]:
    """Fetch and parse RSS feed, return list of {title, url, date, description}."""
    feed_url = f"https://{subdomain}.substack.com/feed"
    log.info(f"  Fetching RSS: {feed_url}")

    resp = requests.get(feed_url, timeout=REQUEST_TIMEOUT, headers={
        "User-Agent": "PMMSherpa/1.0 (RSS reader)"
    })
    resp.raise_for_status()

    root = ET.fromstring(resp.content)

    posts = []
    for item in root.iter("item"):
        title = item.findtext("title", "").strip()
        link = item.findtext("link", "").strip()
        pub_date = item.findtext("pubDate", "").strip()
        description = item.findtext("description", "").strip()

        # Parse date
        date_str = ""
        if pub_date:
            try:
                # RSS dates like "Thu, 06 Feb 2025 12:45:03 GMT"
                dt = datetime.strptime(pub_date, "%a, %d %b %Y %H:%M:%S %Z")
                date_str = dt.strftime("%Y-%m-%d")
            except ValueError:
                try:
                    dt = datetime.strptime(pub_date[:25], "%a, %d %b %Y %H:%M:%S")
                    date_str = dt.strftime("%Y-%m-%d")
                except ValueError:
                    date_str = pub_date

        if link:
            posts.append({
                "title": title,
                "url": link,
                "date": date_str,
                "description": description,
            })

    return posts


# ── Content Fetching ─────────────────────────────────────────────────
def fetch_article_content(url: str) -> Optional[str]:
    """Fetch full article content via Jina Reader."""
    jina_url = f"{JINA_PREFIX}{url}"
    log.info(f"    Fetching content via Jina: {url}")

    try:
        resp = requests.get(jina_url, timeout=60, headers={
            "User-Agent": "PMMSherpa/1.0",
            "Accept": "text/markdown",
        })
        resp.raise_for_status()

        content = resp.text.strip()

        # Jina returns markdown. Clean up common artifacts.
        # Remove Jina header metadata if present
        lines = content.split("\n")
        clean_lines = []
        in_header = True
        for line in lines:
            if in_header and (line.startswith("Title:") or line.startswith("URL Source:")
                             or line.startswith("Markdown Content:") or line.startswith("Published Time:")):
                continue
            in_header = False
            clean_lines.append(line)

        return "\n".join(clean_lines).strip()

    except Exception as e:
        log.error(f"    Failed to fetch {url}: {e}")
        return None


# ── File Writing ─────────────────────────────────────────────────────
def save_article(author: str, subdomain: str, post: dict, content: str, tags: list[str]) -> Path:
    """Save article as markdown with frontmatter."""
    author_dir = OUTPUT_DIR / subdomain
    author_dir.mkdir(parents=True, exist_ok=True)

    # Sanitize filename
    safe_title = re.sub(r'[^\w\s-]', '', post["title"]).strip()
    safe_title = re.sub(r'\s+', '_', safe_title)[:80]
    filename = f"{post['date']}-{safe_title}.md"
    filepath = author_dir / filename

    frontmatter = (
        f"---\n"
        f"title: \"{post['title']}\"\n"
        f"author: {author}\n"
        f"date: {post['date']}\n"
        f"url: {post['url']}\n"
        f"source: substack\n"
        f"subdomain: {subdomain}\n"
        f"tags: {json.dumps(tags + ['substack'])}\n"
        f"---\n\n"
    )

    filepath.write_text(frontmatter + content, encoding="utf-8")
    return filepath


# ── Main Scraper ─────────────────────────────────────────────────────
def scrape_all(dry_run: bool = False) -> dict:
    """Scrape all configured Substacks. Returns stats dict."""
    checkpoint = load_checkpoint()
    scraped_urls = checkpoint.get("scraped_urls", {})

    stats = {"authors": 0, "new_posts": 0, "skipped": 0, "errors": 0, "files": []}

    for sub in SUBSTACKS:
        subdomain = sub["subdomain"]
        author = sub["author"]
        tags = sub.get("tags", [])

        log.info(f"\n{'='*50}")
        log.info(f"Scraping: {author} ({subdomain}.substack.com)")
        stats["authors"] += 1

        try:
            posts = fetch_rss(subdomain)
            log.info(f"  Found {len(posts)} posts in RSS feed")
        except Exception as e:
            log.error(f"  Failed to fetch RSS for {subdomain}: {e}")
            stats["errors"] += 1
            continue

        for post in posts:
            url = post["url"]

            if url in scraped_urls:
                stats["skipped"] += 1
                continue

            if dry_run:
                log.info(f"  [DRY RUN] Would scrape: {post['title']} ({post['date']})")
                stats["new_posts"] += 1
                continue

            # Fetch full content
            content = fetch_article_content(url)
            if not content or len(content.strip()) < 100:
                log.warning(f"  Skipping (too short/empty): {post['title']}")
                # Still mark as scraped to avoid retrying empty posts
                scraped_urls[url] = {"date": post["date"], "title": post["title"], "status": "empty"}
                save_checkpoint({"scraped_urls": scraped_urls, "last_run": checkpoint.get("last_run")})
                stats["errors"] += 1
                continue

            filepath = save_article(author, subdomain, post, content, tags)
            log.info(f"  Saved: {filepath.name}")

            scraped_urls[url] = {"date": post["date"], "title": post["title"], "status": "ok"}
            save_checkpoint({"scraped_urls": scraped_urls, "last_run": checkpoint.get("last_run")})

            stats["new_posts"] += 1
            stats["files"].append(str(filepath))

    if not dry_run:
        save_checkpoint({"scraped_urls": scraped_urls})

    return stats


def main():
    import argparse

    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
    )

    parser = argparse.ArgumentParser(description="Substack Scraper for PMM Sherpa")
    parser.add_argument("--dry-run", action="store_true", help="Show what would be scraped")
    parser.add_argument("--list", action="store_true", help="List configured Substacks")
    args = parser.parse_args()

    if args.list:
        print("Configured Substacks:")
        for sub in SUBSTACKS:
            print(f"  {sub['author']:25s} — {sub['subdomain']}.substack.com  tags={sub.get('tags', [])}")
        return

    stats = scrape_all(dry_run=args.dry_run)

    log.info(f"\nSubstack scrape complete:")
    log.info(f"  Authors: {stats['authors']}")
    log.info(f"  New posts: {stats['new_posts']}")
    log.info(f"  Skipped: {stats['skipped']}")
    log.info(f"  Errors: {stats['errors']}")


if __name__ == "__main__":
    main()
