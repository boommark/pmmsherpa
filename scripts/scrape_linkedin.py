#!/usr/bin/env python3
"""
LinkedIn Post Scraper for PMM Sherpa
====================================
Low-volume scraper for LinkedIn posts from specific PMM thought leaders.
Uses Playwright with saved session cookies. Designed for 1-2 profiles
and 20-30 posts per day to stay under LinkedIn's radar.

Usage:
    python scrape_linkedin.py login              # Manual login, save session
    python scrape_linkedin.py scrape             # Scrape configured profiles
    python scrape_linkedin.py scrape --dry-run   # Show what would be scraped
    python scrape_linkedin.py list               # List configured profiles
"""

import os
import sys
import json
import re
import time
import random
import hashlib
import logging
from pathlib import Path
from datetime import datetime
from typing import Optional

from playwright.sync_api import sync_playwright

log = logging.getLogger("linkedin_scraper")

# ── Configuration ────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).parent.resolve()
OUTPUT_DIR = SCRIPT_DIR.parent / "data" / "linkedin"
SESSION_FILE = SCRIPT_DIR / ".linkedin_session.json"
CHECKPOINT_FILE = SCRIPT_DIR / ".linkedin_checkpoint.json"

# Delay between page loads (seconds) — randomized to look human
MIN_DELAY = 8
MAX_DELAY = 15

# Max posts to scrape per profile per run
MAX_POSTS_PER_PROFILE = 20

# Profiles to scrape. Add more here.
PROFILES = [
    {
        "username": "aprildunford",
        "name": "April Dunford",
        "tags": ["positioning", "b2b", "differentiation"],
    },
    # {
    #     "username": "yourprofile",
    #     "name": "Name",
    #     "tags": ["topic1", "topic2"],
    # },
]


# ── Session Management ───────────────────────────────────────────────
def login(email: str = None, password: str = None, headless: bool = False):
    """Log in to LinkedIn. If email/password provided, auto-fills. Otherwise manual."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        context = browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        print("Navigating to LinkedIn login...")
        page.goto("https://www.linkedin.com/login", timeout=30000)
        time.sleep(2)

        if email and password:
            print("Auto-filling credentials...")
            page.fill("#username", email)
            time.sleep(random.uniform(0.5, 1.5))
            page.fill("#password", password)
            time.sleep(random.uniform(0.5, 1.5))
            page.click("button[type='submit']")
            print("Submitted login form. Waiting for redirect...")

            # Wait for feed or security checkpoint
            try:
                page.wait_for_url("**/feed/**", timeout=30000)
                print("Login successful — landed on feed.")
            except Exception:
                current_url = page.url
                if "checkpoint" in current_url or "challenge" in current_url:
                    print(f"Security checkpoint detected: {current_url}")
                    print("Waiting 60s for manual verification (CAPTCHA, email code, etc.)...")
                    time.sleep(60)
                elif "login" in current_url:
                    print("Login may have failed. Check credentials.")
                    browser.close()
                    return False
                else:
                    print(f"Landed on: {current_url}")
                    time.sleep(5)
        else:
            print("Please log in manually in the browser window.")
            print("Waiting 60s for manual login...")
            time.sleep(60)

        # Verify we're logged in
        final_url = page.url
        if "feed" in final_url or "linkedin.com/in/" in final_url:
            context.storage_state(path=str(SESSION_FILE))
            print(f"Session saved to {SESSION_FILE}")
            browser.close()
            return True
        else:
            print(f"Login unclear. Final URL: {final_url}")
            # Save session anyway in case it worked
            context.storage_state(path=str(SESSION_FILE))
            print(f"Session saved (may not be valid): {SESSION_FILE}")
            browser.close()
            return False


def check_session() -> bool:
    """Check if session file exists."""
    return SESSION_FILE.exists()


# ── Checkpoint ───────────────────────────────────────────────────────
def load_checkpoint() -> dict:
    if CHECKPOINT_FILE.exists():
        try:
            return json.loads(CHECKPOINT_FILE.read_text())
        except (json.JSONDecodeError, KeyError):
            pass
    return {"scraped_posts": {}, "last_run": None}


def save_checkpoint(checkpoint: dict):
    checkpoint["last_run"] = datetime.now().isoformat()
    CHECKPOINT_FILE.write_text(json.dumps(checkpoint, indent=2))


# ── Post Extraction ──────────────────────────────────────────────────
def human_delay():
    """Random delay to mimic human browsing."""
    delay = random.uniform(MIN_DELAY, MAX_DELAY)
    log.info(f"    Waiting {delay:.1f}s...")
    time.sleep(delay)


def scroll_to_load_posts(page, max_scrolls: int = 8):
    """Scroll down to load more posts via lazy loading."""
    for i in range(max_scrolls):
        page.evaluate("window.scrollBy(0, 1200)")
        time.sleep(random.uniform(1.5, 3.0))


def extract_posts_from_page(page, username: str) -> list[dict]:
    """Extract post data from a LinkedIn activity page."""
    posts = []

    # LinkedIn wraps posts in feed update containers
    # Try multiple selectors as LinkedIn changes DOM frequently
    selectors = [
        "div.feed-shared-update-v2",
        "div[data-urn*='activity']",
        "div.profile-creator-shared-feed-update__container",
    ]

    post_elements = []
    for selector in selectors:
        post_elements = page.query_selector_all(selector)
        if post_elements:
            log.info(f"    Found {len(post_elements)} posts with selector: {selector}")
            break

    if not post_elements:
        # Fallback: try to find any post-like containers
        log.warning("    No posts found with known selectors. Trying fallback...")
        post_elements = page.query_selector_all("[data-urn]")
        post_elements = [el for el in post_elements if "activity" in (el.get_attribute("data-urn") or "")]
        log.info(f"    Fallback found {len(post_elements)} elements")

    for el in post_elements:
        try:
            # Extract post text
            text_el = el.query_selector(
                "div.feed-shared-update-v2__description, "
                "div.update-components-text, "
                "span.break-words, "
                "div.feed-shared-text"
            )
            post_text = ""
            if text_el:
                # Click "see more" if present
                see_more = el.query_selector("button.feed-shared-inline-show-more-text, button[aria-label*='more']")
                if see_more and see_more.is_visible():
                    try:
                        see_more.click()
                        time.sleep(0.5)
                        # Re-extract after expanding
                        text_el = el.query_selector(
                            "div.feed-shared-update-v2__description, "
                            "div.update-components-text, "
                            "span.break-words, "
                            "div.feed-shared-text"
                        )
                    except Exception:
                        pass

                post_text = text_el.inner_text().strip() if text_el else ""

            if not post_text or len(post_text) < 30:
                continue

            # Extract URN for dedup
            urn = el.get_attribute("data-urn") or ""

            # Generate a content hash for dedup if no URN
            content_hash = hashlib.md5(post_text[:200].encode()).hexdigest()
            post_id = urn or content_hash

            # Try to extract date
            date_el = el.query_selector(
                "span.feed-shared-actor__sub-description span, "
                "time, "
                "span.update-components-actor__sub-description"
            )
            date_text = date_el.inner_text().strip() if date_el else ""

            # Extract engagement metrics (optional)
            likes_el = el.query_selector(
                "span.social-details-social-counts__reactions-count, "
                "button[aria-label*='reaction'] span"
            )
            likes = likes_el.inner_text().strip() if likes_el else ""

            posts.append({
                "id": post_id,
                "text": post_text,
                "date_text": date_text,
                "likes": likes,
                "username": username,
                "content_hash": content_hash,
            })

        except Exception as e:
            log.warning(f"    Error extracting post: {e}")
            continue

    return posts


def save_post(profile: dict, post: dict) -> Path:
    """Save a LinkedIn post as markdown."""
    author_dir = OUTPUT_DIR / profile["username"]
    author_dir.mkdir(parents=True, exist_ok=True)

    # Use content hash as filename since LinkedIn dates are relative ("3d ago")
    filename = f"{post['content_hash']}.md"
    filepath = author_dir / filename

    tags = profile.get("tags", []) + ["linkedin"]

    frontmatter = (
        f"---\n"
        f"author: {profile['name']}\n"
        f"source: linkedin\n"
        f"username: {profile['username']}\n"
        f"date_text: \"{post['date_text']}\"\n"
        f"likes: \"{post['likes']}\"\n"
        f"post_id: \"{post['id']}\"\n"
        f"tags: {json.dumps(tags)}\n"
        f"scraped_at: {datetime.now().isoformat()}\n"
        f"---\n\n"
    )

    filepath.write_text(frontmatter + post["text"], encoding="utf-8")
    return filepath


# ── Main Scraper ─────────────────────────────────────────────────────
def scrape_all(dry_run: bool = False) -> dict:
    """Scrape posts from all configured profiles."""
    if not check_session():
        log.error("No session file. Run 'python scrape_linkedin.py login' first.")
        return {"profiles": 0, "new_posts": 0, "skipped": 0, "errors": 0}

    checkpoint = load_checkpoint()
    scraped_posts = checkpoint.get("scraped_posts", {})

    stats = {"profiles": 0, "new_posts": 0, "skipped": 0, "errors": 0}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(storage_state=str(SESSION_FILE))

        # Verify session is still valid
        test_page = context.new_page()
        test_page.goto("https://www.linkedin.com/feed/", timeout=30000)
        time.sleep(3)

        if "login" in test_page.url or "checkpoint" in test_page.url:
            log.error("Session expired. Run 'python scrape_linkedin.py login' to re-authenticate.")
            browser.close()
            return {**stats, "auth_expired": True}

        log.info("Session valid. Starting scrape...")
        test_page.close()

        for profile in PROFILES:
            username = profile["username"]
            name = profile["name"]

            log.info(f"\n{'='*50}")
            log.info(f"Scraping: {name} (@{username})")
            stats["profiles"] += 1

            if dry_run:
                log.info(f"  [DRY RUN] Would scrape posts from {name}")
                continue

            try:
                page = context.new_page()
                activity_url = f"https://www.linkedin.com/in/{username}/recent-activity/all/"
                log.info(f"  Navigating to: {activity_url}")
                page.goto(activity_url, timeout=30000)
                time.sleep(random.uniform(3, 5))

                # Check if we landed on the right page
                if "login" in page.url:
                    log.error(f"  Redirected to login for {username}. Session may be limited.")
                    stats["errors"] += 1
                    page.close()
                    continue

                # Scroll to load more posts
                log.info("  Scrolling to load posts...")
                scroll_to_load_posts(page, max_scrolls=6)

                # Extract posts
                posts = extract_posts_from_page(page, username)
                log.info(f"  Extracted {len(posts)} posts")

                new_count = 0
                for post in posts:
                    if new_count >= MAX_POSTS_PER_PROFILE:
                        log.info(f"  Hit max posts per profile ({MAX_POSTS_PER_PROFILE}). Stopping.")
                        break

                    if post["content_hash"] in scraped_posts:
                        stats["skipped"] += 1
                        continue

                    filepath = save_post(profile, post)
                    log.info(f"  + Saved: {filepath.name} ({len(post['text'])} chars)")

                    scraped_posts[post["content_hash"]] = {
                        "username": username,
                        "date_text": post["date_text"],
                        "scraped_at": datetime.now().isoformat(),
                    }
                    save_checkpoint({"scraped_posts": scraped_posts})

                    stats["new_posts"] += 1
                    new_count += 1

                page.close()

                # Human-like delay between profiles
                if profile != PROFILES[-1]:
                    human_delay()

            except Exception as e:
                log.error(f"  Error scraping {username}: {e}")
                stats["errors"] += 1

        browser.close()

    return stats


# ── CLI ──────────────────────────────────────────────────────────────
def main():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(message)s",
    )

    if len(sys.argv) < 2:
        print("Usage: python scrape_linkedin.py <command>")
        print("Commands: login, scrape [--dry-run], list")
        return 1

    command = sys.argv[1]

    if command == "login":
        email = sys.argv[2] if len(sys.argv) > 2 else None
        password = sys.argv[3] if len(sys.argv) > 3 else None
        headless = "--headless" in sys.argv
        success = login(email=email, password=password, headless=headless)
        return 0 if success else 1

    elif command == "list":
        print("Configured LinkedIn profiles:")
        for p in PROFILES:
            print(f"  {p['name']:25s} — linkedin.com/in/{p['username']}")
        return 0

    elif command == "scrape":
        dry_run = "--dry-run" in sys.argv
        stats = scrape_all(dry_run=dry_run)

        log.info(f"\nLinkedIn scrape complete:")
        log.info(f"  Profiles: {stats['profiles']}")
        log.info(f"  New posts: {stats['new_posts']}")
        log.info(f"  Skipped: {stats['skipped']}")
        log.info(f"  Errors: {stats['errors']}")

        if stats.get("auth_expired"):
            return 3
        return 0 if stats["errors"] == 0 else 1

    else:
        print(f"Unknown command: {command}")
        return 1


if __name__ == "__main__":
    sys.exit(main() or 0)
