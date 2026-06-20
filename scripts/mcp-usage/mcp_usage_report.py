#!/usr/bin/env python3
"""
MCP usage report — pulls PMM Sherpa MCP tool-call traces from Langfuse,
enriches each with token usage, maps users via Supabase, and writes a
date-stamped markdown report + raw JSON to data/mcp-usage-reports/.

Source of truth: Langfuse project "PMMSherpa-MCP" (traces tagged surface:mcp).
Each MCP tool call is a trace named `mcp.tool.<name>` whose input carries the
user query/model; token usage lives on the trace's observations (usageDetails).

USAGE (run from the repo root, with .env.local loaded):
    set -a; source .env.local; set +a
    python3 scripts/mcp-usage/mcp_usage_report.py                 # last 30 days
    python3 scripts/mcp-usage/mcp_usage_report.py --days 90       # last 90 days
    python3 scripts/mcp-usage/mcp_usage_report.py --from 2026-05-01 --to 2026-06-01
    python3 scripts/mcp-usage/mcp_usage_report.py --no-write      # print only, no files

Env required: LANGFUSE_PUBLIC_KEY, LANGFUSE_SECRET_KEY, LANGFUSE_BASEURL,
              NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

Historic reports are saved under data/mcp-usage-reports/ — read those instead
of re-running a full pull when you just need a past window.
"""
import os, sys, json, base64, time, argparse, collections
import urllib.request, urllib.parse, urllib.error
from datetime import datetime, timedelta, timezone

TOOLS = ["ask_sherpa", "draft_artifact", "get_feedback", "scope_pmm_research"]


def env(k):
    v = os.environ.get(k)
    if not v:
        sys.exit(f"ERROR: missing env var {k} (did you `source .env.local`?)")
    return v


def lf_get(base, auth, path, params=None):
    url = base + path
    if params:
        url += "?" + urllib.parse.urlencode(params)
    for attempt in range(8):
        try:
            req = urllib.request.Request(url, headers={"Authorization": auth})
            with urllib.request.urlopen(req, timeout=60) as r:
                time.sleep(0.35)  # gentle pacing to stay under rate limit
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < 7:
                ra = e.headers.get("Retry-After")
                wait = float(ra) if ra and ra.isdigit() else (2 ** attempt)
                sys.stderr.write(f"  429 -> sleeping {min(wait,30)}s\n")
                time.sleep(min(wait, 30))
                continue
            if attempt == 7:
                raise
            time.sleep(2 ** attempt)
        except Exception:
            if attempt == 7:
                raise
            time.sleep(2 ** attempt)


def fetch_tool_traces(base, auth, frm):
    traces = []
    for tool in TOOLS:
        page = 1
        while True:
            d = lf_get(base, auth, "/api/public/traces", {
                "tags": "surface:mcp", "name": f"mcp.tool.{tool}",
                "fromTimestamp": frm, "limit": 100, "page": page,
            })
            traces.extend(d.get("data", []))
            meta = d.get("meta", {})
            sys.stderr.write(f"{tool} page {page}/{meta.get('totalPages')} "
                             f"(items={meta.get('totalItems')})\n")
            if page >= meta.get("totalPages", 1):
                break
            page += 1
    return traces


def enrich(base, auth, traces, to_ts):
    records = []
    for i, t in enumerate(traces):
        ts = t.get("timestamp") or ""
        if to_ts and ts and ts > to_ts:
            continue  # outside upper bound
        full = lf_get(base, auth, f"/api/public/traces/{t['id']}")
        inp = outp = tot = 0
        cost = 0.0
        for o in full.get("observations", []):
            ud = o.get("usageDetails") or {}
            inp += ud.get("input", 0) or 0
            outp += ud.get("output", 0) or 0
            tot += ud.get("total", 0) or 0
            cd = o.get("costDetails") or {}
            cost += cd.get("total", 0) or 0
        if tot == 0:
            for o in full.get("observations", []):
                tot += o.get("totalTokens", 0) or 0
                inp += o.get("promptTokens", 0) or 0
                outp += o.get("completionTokens", 0) or 0
        ti = t.get("input") or {}
        query = ""
        if isinstance(ti, dict):
            query = (ti.get("query") or ti.get("topic") or ti.get("brief")
                     or ti.get("input") or "")
            if not query:
                for k in ("artifact_type", "content", "draft", "context"):
                    if ti.get(k):
                        query = str(ti.get(k))[:400]
                        break
        records.append({
            "trace_id": t["id"],
            "tool": t["name"].replace("mcp.tool.", ""),
            "user_id": t.get("userId"),
            "session_id": t.get("sessionId"),
            "timestamp": ts,
            "model": ti.get("model") if isinstance(ti, dict) else None,
            "query": (query or "").replace("\n", " ").strip(),
            "input_tokens": inp, "output_tokens": outp, "total_tokens": tot,
            "cost_usd": round(cost, 6),
        })
        if (i + 1) % 20 == 0:
            sys.stderr.write(f"  enriched {i+1}/{len(traces)}\n")
    return records


def fetch_users(sb_url, sb_key, user_ids):
    if not user_ids:
        return {}
    ids = ",".join(user_ids)
    url = (sb_url.rstrip("/") + "/rest/v1/profiles?select=id,email,full_name,company,tier"
           f"&id=in.({ids})")
    req = urllib.request.Request(url, headers={
        "apikey": sb_key, "Authorization": f"Bearer {sb_key}",
    })
    with urllib.request.urlopen(req, timeout=60) as r:
        rows = json.load(r)
    return {row["id"]: row for row in rows}


def fmt(n):
    return f"{n:,}"


def render(records, users, frm_label, to_label):
    def uname(uid):
        u = users.get(uid)
        if not u:
            return (uid or "unknown")[:8]
        return u.get("full_name") or u.get("email") or uid[:8]

    def utier(uid):
        u = users.get(uid)
        return (u or {}).get("tier", "?")

    for r in records:
        r["name"] = uname(r["user_id"])
        r["date"] = (r["timestamp"] or "")[:16].replace("T", " ")
    records.sort(key=lambda r: r["timestamp"] or "")

    out = []
    out.append(f"# PMM Sherpa — MCP Usage Report")
    out.append(f"**Window:** {frm_label} → {to_label}  ")
    out.append(f"**Source:** Langfuse `PMMSherpa-MCP` (surface:mcp) + Supabase profiles  ")
    out.append(f"**Tool calls:** {len(records)}\n")

    # A. by tool
    out.append("## A. MCP tool usage\n")
    out.append("| Tool | Calls | Unique users | Total tokens | Avg tokens/call | Est. cost (USD) |")
    out.append("|------|------:|------:|------:|------:|------:|")
    byt = collections.defaultdict(lambda: {"c": 0, "u": set(), "tok": 0, "cost": 0.0})
    for r in records:
        b = byt[r["tool"]]
        b["c"] += 1; b["u"].add(r["user_id"]); b["tok"] += r["total_tokens"]; b["cost"] += r["cost_usd"]
    TC = TT = 0; TCost = 0.0; AU = set()
    for tool, b in sorted(byt.items(), key=lambda x: -x[1]["c"]):
        avg = b["tok"] // b["c"] if b["c"] else 0
        out.append(f"| `{tool}` | {b['c']} | {len(b['u'])} | {fmt(b['tok'])} | {fmt(avg)} | ${b['cost']:.2f} |")
        TC += b["c"]; TT += b["tok"]; TCost += b["cost"]; AU |= b["u"]
    if TC:
        out.append(f"| **Total** | **{TC}** | **{len(AU)}** | **{fmt(TT)}** | **{fmt(TT//TC)}** | **${TCost:.2f}** |")

    # B. by user
    out.append("\n## B. Usage by user\n")
    out.append("| User | Tier | Calls | Tools used | Total tokens | Est. cost (USD) |")
    out.append("|------|------|------:|------|------:|------:|")
    byu = collections.defaultdict(lambda: {"c": 0, "tok": 0, "cost": 0.0, "tools": collections.Counter()})
    for r in records:
        b = byu[r["user_id"]]
        b["c"] += 1; b["tok"] += r["total_tokens"]; b["cost"] += r["cost_usd"]; b["tools"][r["tool"]] += 1
    for uid, b in sorted(byu.items(), key=lambda x: -x[1]["c"]):
        tools = ", ".join(f"{t}×{c}" for t, c in b["tools"].most_common())
        out.append(f"| {uname(uid)} | {utier(uid)} | {b['c']} | {tools} | {fmt(b['tok'])} | ${b['cost']:.2f} |")

    # C. per-query detail
    out.append("\n## C. Per-query detail (chronological)\n")
    out.append("| # | Date (UTC) | User | Tool | Model | Query | In tok | Out tok | Total tok | Cost |")
    out.append("|--:|------|------|------|------|------|------:|------:|------:|------:|")
    for i, r in enumerate(records, 1):
        q = (r["query"] or "—").replace("|", "\\|")
        if len(q) > 90:
            q = q[:90] + "…"
        out.append(f"| {i} | {r['date']} | {r['name']} | {r['tool']} | {r['model'] or '—'} | {q} "
                   f"| {fmt(r['input_tokens'])} | {fmt(r['output_tokens'])} | {fmt(r['total_tokens'])} | ${r['cost_usd']:.3f} |")

    zt = sum(1 for r in records if r["total_tokens"] == 0)
    out.append(f"\n_Notes: `draft_artifact` query column shows the artifact type (the document payload "
               f"is stored under a different input key). `total_tokens` includes cached/other token "
               f"categories, so it can exceed input+output. {zt}/{len(records)} calls show 0 tokens "
               f"(usage not captured on those Langfuse observations); cost is a floor._")
    return "\n".join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=30)
    ap.add_argument("--from", dest="frm", default=None, help="YYYY-MM-DD (overrides --days)")
    ap.add_argument("--to", dest="to", default=None, help="YYYY-MM-DD upper bound")
    ap.add_argument("--no-write", action="store_true", help="print only; don't save files")
    args = ap.parse_args()

    base = env("LANGFUSE_BASEURL").rstrip("/")
    auth = "Basic " + base64.b64encode(
        f"{env('LANGFUSE_PUBLIC_KEY')}:{env('LANGFUSE_SECRET_KEY')}".encode()).decode()
    sb_url = env("NEXT_PUBLIC_SUPABASE_URL")
    sb_key = env("SUPABASE_SERVICE_ROLE_KEY")

    now = datetime.now(timezone.utc)
    if args.frm:
        frm_dt = datetime.fromisoformat(args.frm).replace(tzinfo=timezone.utc)
    else:
        frm_dt = now - timedelta(days=args.days)
    to_dt = (datetime.fromisoformat(args.to).replace(tzinfo=timezone.utc)
             if args.to else now)
    frm_iso = frm_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    to_iso = to_dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    frm_label, to_label = frm_dt.strftime("%Y-%m-%d"), to_dt.strftime("%Y-%m-%d")

    sys.stderr.write(f"Pulling MCP tool traces {frm_iso} .. {to_iso}\n")
    traces = fetch_tool_traces(base, auth, frm_iso)
    sys.stderr.write(f"Found {len(traces)} tool-call traces; enriching token usage...\n")
    records = enrich(base, auth, traces, to_iso)
    user_ids = sorted({r["user_id"] for r in records if r["user_id"]})
    users = fetch_users(sb_url, sb_key, user_ids)
    md = render(records, users, frm_label, to_label)
    print(md)

    if not args.no_write:
        repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        outdir = os.path.join(repo_root, "data", "mcp-usage-reports")
        os.makedirs(outdir, exist_ok=True)
        stamp = now.strftime("%Y-%m-%d")
        base_name = f"{stamp}_mcp-usage_{frm_label}_to_{to_label}"
        with open(os.path.join(outdir, base_name + ".md"), "w") as f:
            f.write(md + "\n")
        with open(os.path.join(outdir, base_name + ".json"), "w") as f:
            json.dump({"window": {"from": frm_iso, "to": to_iso},
                       "generated_at": now.isoformat(),
                       "records": records,
                       "users": users}, f, indent=2)
        sys.stderr.write(f"Saved report -> data/mcp-usage-reports/{base_name}.md (+ .json)\n")


if __name__ == "__main__":
    main()
