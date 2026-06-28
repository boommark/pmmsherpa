#!/usr/bin/env python3
"""
MCP full-query view — second half of the MCP usage reporting pair.

Reads the raw records JSON produced by mcp_usage_report.py and renders a
grouped markdown doc: TOOL (header) -> USER -> full verbatim query, in
chronological order. For draft_artifact it re-fetches the complete structured
input from Langfuse (the records JSON only stores the artifact type) and shows
the context/notes fields.

Run BOTH scripts to get the complete report set:
    cd ~/Documents/AOL-AI/pmmsherpa
    set -a; source .env.local; set +a
    python3 scripts/mcp-usage/mcp_usage_report.py     # -> summary tables + records JSON
    python3 scripts/mcp-usage/mcp_full_queries.py     # -> *_FULL-QUERIES.md (uses latest JSON)

Optional arg: path to a specific records JSON (defaults to the newest one in
data/mcp-usage-reports/).

Env required: LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_BASEURL
"""
import os, sys, json, base64, time, glob
import urllib.request, urllib.error

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
REPORTS = os.path.join(REPO, "data", "mcp-usage-reports")


def env(k):
    v = os.environ.get(k)
    if not v:
        sys.exit(f"ERROR: missing env var {k} (did you `source .env.local`?)")
    return v


BASE = env("LANGFUSE_BASEURL").rstrip("/")
AUTH = "Basic " + base64.b64encode(
    f"{env('LANGFUSE_PUBLIC_KEY')}:{env('LANGFUSE_SECRET_KEY')}".encode()).decode()


def get(path):
    for a in range(8):
        try:
            req = urllib.request.Request(BASE + path, headers={"Authorization": AUTH})
            with urllib.request.urlopen(req, timeout=60) as r:
                time.sleep(0.35)
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429 and a < 7:
                ra = e.headers.get("Retry-After")
                w = float(ra) if ra and ra.isdigit() else 2 ** a
                time.sleep(min(w, 30))
                continue
            raise


def main():
    if len(sys.argv) > 1:
        latest = sys.argv[1]
    else:
        cands = sorted(glob.glob(os.path.join(REPORTS, "*.json")))
        if not cands:
            sys.exit(f"No records JSON in {REPORTS}; run mcp_usage_report.py first.")
        latest = cands[-1]
    d = json.load(open(latest))
    recs, users = d["records"], d["users"]

    def uname(uid):
        u = users.get(uid) or {}
        return u.get("full_name") or u.get("email") or (uid or "?")[:8]

    # Re-fetch FULL input for draft_artifact (records only stored artifact_type)
    full_input = {}
    for r in recs:
        if r["tool"] == "draft_artifact":
            full_input[r["trace_id"]] = (get(f"/api/public/traces/{r['trace_id']}") or {}).get("input")

    TOOL_ORDER = ["ask_sherpa", "get_feedback", "scope_pmm_research", "draft_artifact"]
    TOOL_DESC = {
        "ask_sherpa": "Natural-language PMM questions",
        "get_feedback": "Critique of a user-supplied draft (the draft is the query payload)",
        "scope_pmm_research": "Research-scoping briefs",
        "draft_artifact": "Generate an artifact (structured input shown)",
    }
    out = ["# PMM Sherpa — Full MCP Queries by Tool & User",
           f"_Window: {d['window']['from'][:10]} → {d['window']['to'][:10]} · {len(recs)} calls_\n"]

    for tool in TOOL_ORDER:
        rows = [r for r in recs if r["tool"] == tool]
        rows.sort(key=lambda r: (uname(r["user_id"]).lower(), r["timestamp"] or ""))
        if not rows:
            continue
        out.append(f"\n# 🛠 {tool}  ({len(rows)} calls)")
        out.append(f"_{TOOL_DESC.get(tool, '')}_")
        cur = None
        for r in rows:
            nm = uname(r["user_id"])
            if nm != cur:
                out.append(f"\n## 👤 {nm}")
                cur = nm
            ts = (r["timestamp"] or "")[:16].replace("T", " ")
            out.append(f"\n**[{ts} UTC · {r['model'] or '—'} · {r['total_tokens']:,} tok · ${r['cost_usd']:.3f}]**")
            if tool == "draft_artifact":
                fi = full_input.get(r["trace_id"]) or {}
                out.append(f"> **artifact_type:** `{fi.get('artifact_type') or fi.get('type') or '?'}`")
                for k, v in fi.items():
                    if k in ("artifact_type", "type", "model"):
                        continue
                    vs = v if isinstance(v, str) else json.dumps(v, ensure_ascii=False)
                    vs = vs.replace("\n", " ").strip()
                    if len(vs) > 500:
                        vs = vs[:500] + "…"
                    out.append(f"> **{k}:** {vs}")
            else:
                out.append("> " + (r["query"] or "(empty)").replace("\n", "\n> "))
        out.append("")

    md = "\n".join(out)
    outpath = latest.replace(".json", "_FULL-QUERIES.md")
    open(outpath, "w").write(md + "\n")
    sys.stderr.write(f"Saved -> {outpath}\n")
    print(md)


if __name__ == "__main__":
    main()
