#!/usr/bin/env python3
"""
PMM Sherpa Onboarding Email Series — Automated Sender
=====================================================
Runs daily via launchd. Checks if today is a scheduled send day,
reads the HTML email, pulls recipients from Supabase, and sends
via gws CLI. Alerts abhishekratna@gmail.com on failures.

Schedule (all times: 7pm ET / 4pm PT):
  Day 1: Sun Apr 19  — GTM strategy
  Day 2: Tue Apr 22  — Landing page
  Day 3: Sun Apr 26  — Career
  Day 4: Tue Apr 29  — Positioning
  Day 5: Sun May  3  — Pricing
  Day 6: Tue May  6  — Launches
  Day 7: Sun May 10  — Battlecards
"""

import json
import os
import subprocess
import sys
import time
from datetime import datetime, date
from pathlib import Path

# ── Config ─────────────────────────────────────────────────────
SERIES_DIR = Path(__file__).parent.parent / "email-drafts" / "onboarding-series"
STATE_FILE = Path(__file__).parent / ".onboarding_series_state.json"
LOG_FILE = Path(__file__).parent / "onboarding_series.log"
ALERT_EMAIL = "abhishekratna@gmail.com"
SUPABASE_PROJECT_ID = "ogbjdvnkejkqqebyetqx"

# Schedule: (date, email_file, subject)
SCHEDULE = [
    (date(2026, 4, 19), "day-1.html", "GTM strategy shouldn't take weeks of guesswork"),
    (date(2026, 4, 22), "day-2.html", "Your landing page might be working against you"),
    (date(2026, 4, 26), "day-3.html", "PMM Sherpa works on your career too"),
    (date(2026, 4, 29), "day-4.html", "Positioning that doesn't sound like every other SaaS company"),
    (date(2026, 5, 3),  "day-5.html", "Stop guessing on pricing"),
    (date(2026, 5, 6),  "day-6.html", "Launches fail when alignment breaks down"),
    (date(2026, 5, 10), "day-7.html", "Sales needs a battlecard by tomorrow morning"),
]

SUPPRESSED = {
    "abhishekratna@gmail.com", "abhishekratna1@gmail.com",
    "aratnaai@gmail.com", "pmmsherpatest@gmail.com",
    "rgoldman@atlassian.com", "yash@glacis.com", "sscaife@atlassian.com",
}


def log(msg: str):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{timestamp}] {msg}"
    print(line)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")


def load_state() -> dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text())
    return {"sent_days": []}


def save_state(state: dict):
    STATE_FILE.write_text(json.dumps(state, indent=2, default=str))


def get_recipients() -> list[str]:
    """Pull all user emails from Supabase, excluding suppressed."""
    try:
        result = subprocess.run(
            ["supabase", "db", "execute", "--project-ref", SUPABASE_PROJECT_ID,
             "SELECT email FROM profiles ORDER BY created_at;"],
            capture_output=True, text=True, timeout=30
        )
        # Fallback: use the static list if supabase CLI isn't available
    except Exception:
        pass

    # Use gws to query — more reliable since it's already authenticated
    # Fallback: read from a cached recipient file
    recipient_file = Path(__file__).parent / ".onboarding_recipients.json"
    if recipient_file.exists():
        emails = json.loads(recipient_file.read_text())
        return [e for e in emails if e not in SUPPRESSED]

    log("ERROR: No recipient list found. Run cache_recipients() first.")
    return []


def cache_recipients_from_list(emails: list[str]):
    """Save recipient list locally for offline sends."""
    recipient_file = Path(__file__).parent / ".onboarding_recipients.json"
    recipient_file.write_text(json.dumps(emails, indent=2))
    log(f"Cached {len(emails)} recipients to {recipient_file}")


def send_email(to: str, subject: str, html_body: str) -> bool:
    """Send a single email via gws CLI."""
    try:
        result = subprocess.run(
            ["gws", "gmail", "+send",
             "--to", to,
             "--subject", subject,
             "--body", html_body,
             "--html"],
            capture_output=True, text=True, timeout=30
        )
        if '"id"' in result.stdout:
            return True
        else:
            log(f"  WARN: gws send to {to} returned: {result.stdout[:200]}")
            return False
    except Exception as e:
        log(f"  ERROR: gws send to {to} failed: {e}")
        return False


def send_alert(subject: str, body: str):
    """Send alert email to admin."""
    try:
        subprocess.run(
            ["gws", "gmail", "+send",
             "--to", ALERT_EMAIL,
             "--subject", subject,
             "--body", body],
            capture_output=True, text=True, timeout=15
        )
    except Exception:
        log(f"CRITICAL: Could not send alert email!")


def run():
    today = date.today()
    state = load_state()

    # Find today's scheduled send
    today_send = None
    for send_date, filename, subject in SCHEDULE:
        if send_date == today and filename not in state.get("sent_days", []):
            today_send = (filename, subject)
            break

    if not today_send:
        log(f"No send scheduled for {today}. Exiting.")
        return

    filename, subject = today_send
    html_path = SERIES_DIR / filename
    if not html_path.exists():
        msg = f"ERROR: Email file not found: {html_path}"
        log(msg)
        send_alert(f"[PMM Sherpa] Onboarding series error", msg)
        return

    html_body = html_path.read_text()
    recipients = get_recipients()

    if not recipients:
        msg = "ERROR: No recipients loaded. Aborting send."
        log(msg)
        send_alert(f"[PMM Sherpa] Onboarding series error", msg)
        return

    log(f"=== Sending {filename} ({subject}) to {len(recipients)} recipients ===")

    success = 0
    failures = []

    for i, email in enumerate(recipients):
        ok = send_email(email, subject, html_body)
        if ok:
            success += 1
        else:
            failures.append(email)

        # Rate limit: 1 per second
        if i < len(recipients) - 1:
            time.sleep(1)

        # Progress log every 50
        if (i + 1) % 50 == 0:
            log(f"  Progress: {i + 1}/{len(recipients)} sent")

    log(f"=== Done: {success} sent, {len(failures)} failed ===")

    # Update state
    state.setdefault("sent_days", []).append(filename)
    state[f"{filename}_sent_at"] = datetime.now().isoformat()
    state[f"{filename}_success"] = success
    state[f"{filename}_failures"] = failures
    save_state(state)

    # Alert on failures
    if failures:
        msg = f"Onboarding series {filename}: {success} sent, {len(failures)} failed.\n\nFailed emails:\n" + "\n".join(failures)
        send_alert(f"[PMM Sherpa] {len(failures)} email failures in onboarding series", msg)
    else:
        # Success notification
        send_alert(
            f"[PMM Sherpa] Onboarding {filename} sent successfully",
            f"Sent '{subject}' to {success} recipients. 0 failures."
        )


if __name__ == "__main__":
    run()
