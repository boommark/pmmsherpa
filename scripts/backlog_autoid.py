#!/usr/bin/env python3
"""
Auto-assign BL-XXX IDs to new rows in the PMM Sherpa Idea Backlog.

Canonical source:  ~/Documents/AbhishekR/PMM Sherpa/Product Ideas.md
Mirror target:     ~/Documents/AOL AI/pmmsherpa/IDEAS.md

Workflow:
- User adds a new row to the `## 💡 Idea Backlog` table in Obsidian, typing
  only the idea (leaving the ID column empty or partially filled).
- launchd WatchPaths triggers this script on file save.
- Script parses the backlog table, assigns the next sequential BL-XXX to any
  row missing an ID, fills default status (🔴) and explored (—), then
  mirrors the entire backlog section into the project IDEAS.md copy.

Idempotent: if nothing needs assigning, the script makes no writes — so no
launchd re-trigger loops.

Manual run:
    python3 scripts/backlog_autoid.py

Log file: ~/.pmmsherpa_backlog_autoid.log
"""
from __future__ import annotations

import datetime
import re
import sys
from pathlib import Path

HOME = Path.home()
OBSIDIAN = HOME / "Documents/AbhishekR/PMM Sherpa/Product Ideas.md"
PROJECT = HOME / "Documents/AOL AI/pmmsherpa/IDEAS.md"
LOG_PATH = HOME / ".pmmsherpa_backlog_autoid.log"

SECTION_HEADER = "## 💡 Idea Backlog"


def log(msg: str) -> None:
    ts = datetime.datetime.now().isoformat(timespec="seconds")
    line = f"[{ts}] {msg}"
    print(line)
    try:
        with open(LOG_PATH, "a") as f:
            f.write(line + "\n")
    except Exception:
        pass


def find_backlog_section(text: str) -> tuple[int | None, int | None]:
    """Return (start, end) char offsets of the backlog section.

    Section starts at the `## 💡 Idea Backlog` header and ends just before
    the next horizontal-rule separator (`---` on its own line). The section
    itself includes the trailing blank line(s); `end` points to the first
    `-` character of `---`.
    """
    start = text.find(SECTION_HEADER)
    if start == -1:
        return None, None
    remainder = text[start:]
    # Match `\n---\n` with optional surrounding blank lines (`\n\n---\n\n`,
    # `\n---\n`, etc.). The `\n` right before `---` is included in the
    # section so `end` lands on the `-`.
    match = re.search(r"\n---(?:\n|\Z)", remainder)
    if not match:
        return None, None
    end = start + match.start() + 1
    return start, end


def is_table_data_row(line: str) -> bool:
    """True if line looks like a markdown table data row (not header/sep)."""
    stripped = line.strip()
    if not stripped.startswith("|"):
        return False
    # Separator row like |---|---|...
    if re.match(r"^\|[\s\-:|]+\|$", stripped):
        return False
    # Header row
    if "ID" in stripped and "Idea" in stripped and "Category" in stripped and "Status" in stripped:
        return False
    return True


def extract_max_id(lines: list[str]) -> int:
    max_id = 0
    for line in lines:
        for m in re.finditer(r"BL-(\d{3,4})", line):
            n = int(m.group(1))
            if n > max_id:
                max_id = n
    return max_id


def split_cells(line: str) -> list[str]:
    """Split a table row `| a | b | c |` into ['a', 'b', 'c']."""
    inner = line.strip()
    if inner.startswith("|"):
        inner = inner[1:]
    if inner.endswith("|"):
        inner = inner[:-1]
    return [c.strip() for c in inner.split("|")]


def join_cells(cells: list[str]) -> str:
    return "| " + " | ".join(cells) + " |"


def process_section(section: str) -> tuple[str, list[tuple[str, str]]]:
    """Assign BL-IDs and default status/explored values to incomplete rows.

    A row is considered "complete" when it has ID + status + explored.
    Complete rows pass through untouched (preserving Obsidian's padding and
    any inline edits). Incomplete rows get rewritten in simple
    `| a | b | c |` form; Obsidian re-pads them on next edit.
    """
    lines = section.split("\n")
    max_id = extract_max_id(lines)
    next_id = max_id + 1
    assignments: list[tuple[str, str]] = []
    new_lines: list[str] = []
    for line in lines:
        if not is_table_data_row(line):
            new_lines.append(line)
            continue
        cells = split_cells(line)
        # Pad to 6 columns: ID | Idea | Category | Status | Explored | Notes
        while len(cells) < 6:
            cells.append("")

        has_id = bool(re.match(r"BL-\d{3,4}", cells[0]))
        has_idea = bool(cells[1])
        has_status = bool(cells[3])
        has_explored = bool(cells[4])

        # Skip rows with no idea text
        if not has_idea:
            new_lines.append(line)
            continue

        # Already complete — pass through untouched
        if has_id and has_status and has_explored:
            new_lines.append(line)
            continue

        # Assign new ID if missing
        if not has_id:
            new_id = f"BL-{next_id:03d}"
            cells[0] = new_id
            assignments.append((new_id, cells[1]))
            next_id += 1

        # Default status + explored for any incomplete row
        if not has_status:
            cells[3] = "🔴"
        if not has_explored:
            cells[4] = "—"

        new_lines.append(join_cells(cells[:6]))
    return "\n".join(new_lines), assignments


def mirror_section_to_project(obsidian_section: str) -> bool:
    """Replace the backlog section in PROJECT with obsidian_section.
    Returns True if the project file was written."""
    if not PROJECT.exists():
        log(f"WARN: project file missing: {PROJECT}")
        return False
    project_text = PROJECT.read_text()
    pj_start, pj_end = find_backlog_section(project_text)
    if pj_start is None:
        log("WARN: no backlog section in project file")
        return False
    new_project = project_text[:pj_start] + obsidian_section + project_text[pj_end:]
    if new_project != project_text:
        PROJECT.write_text(new_project)
        return True
    return False


def main() -> int:
    if not OBSIDIAN.exists():
        log(f"ERROR: Obsidian file not found: {OBSIDIAN}")
        return 1
    text = OBSIDIAN.read_text()
    start, end = find_backlog_section(text)
    if start is None:
        log("No '## 💡 Idea Backlog' section in Obsidian file; nothing to do")
        return 0
    section = text[start:end]
    new_section, assignments = process_section(section)

    # Rewrite Obsidian if the section content changed (new IDs OR defaulted
    # status/explored on incomplete rows).
    if new_section != section:
        new_text = text[:start] + new_section + text[end:]
        OBSIDIAN.write_text(new_text)
        if assignments:
            for bl_id, idea in assignments:
                log(f"Assigned {bl_id} → {idea[:80]}")
        else:
            log("Defaulted incomplete rows (status/explored)")
    else:
        log("No changes needed")

    # Always attempt mirror in case the section diverged for any reason
    if mirror_section_to_project(new_section):
        log(f"Mirrored backlog section to {PROJECT}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
