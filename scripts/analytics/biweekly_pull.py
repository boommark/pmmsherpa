#!/usr/bin/env python3
"""PMM Sherpa biweekly analytics pull.

Computes the last 14 full days vs the prior 14 days (deltas) across:
Supabase (users/messages/conversations/tokens), Langfuse (MCP), Stripe (revenue),
and a cost model (Anthropic Admin API if ANTHROPIC_ADMIN_KEY is set, else a
calibrated estimate; Perplexity calibrated at $0.0246/research message from the
2026-08-01 console reconciliation).

Usage:
  python3 scripts/analytics/biweekly_pull.py            # print JSON to stdout
  python3 scripts/analytics/biweekly_pull.py --send     # also email a plain
                                                        # tabular report via Resend
Output JSON is also written to scripts/analytics/last_biweekly.json
"""
import json, os, sys, base64, urllib.request, urllib.parse, time
from datetime import datetime, timedelta, timezone

REPO = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ENVFILE = os.path.join(REPO, ".env.local")
OUTFILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "last_biweekly.json")

env = {}
with open(ENVFILE) as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")

SB_URL = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
SB_H = {"apikey": env["SUPABASE_SERVICE_ROLE_KEY"],
        "Authorization": "Bearer " + env["SUPABASE_SERVICE_ROLE_KEY"]}

def http(url, headers, method="GET", data=None, retries=4):
    for i in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "pmmsherpa-analytics/1.0", **headers},
                                         method=method,
                                         data=data.encode() if isinstance(data, str) else data)
            with urllib.request.urlopen(req, timeout=120) as r:
                return json.loads(r.read() or "{}")
        except Exception as e:
            if i == retries - 1:
                raise
            time.sleep(4 * (i + 1))

def sb(table, select, extra=""):
    out, offset = [], 0
    while True:
        q = f"{SB_URL}/rest/v1/{table}?select={urllib.parse.quote(select)}{extra}&limit=1000&offset={offset}&order=created_at"
        data = http(q, SB_H)
        out.extend(data)
        if len(data) < 1000:
            return out
        offset += 1000

now = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
cur_start, cur_end = now - timedelta(days=14), now
prev_start, prev_end = now - timedelta(days=28), now - timedelta(days=14)
iso = lambda d: d.strftime("%Y-%m-%dT%H:%M:%SZ")

# ---------- Supabase ----------
convs = sb("conversations", "id,user_id,created_at")
cmap = {c["id"]: c["user_id"] for c in convs}
msgs = sb("messages", "conversation_id,created_at", "&role=eq.user")
profs = sb("profiles", "id,full_name,email,created_at,tier")
pname = {p["id"]: (p.get("full_name") or p.get("email") or "?") for p in profs}

def parse(ts):
    # normalize: strip fractional seconds (variable digits break py3.10 fromisoformat)
    ts = ts.replace("Z", "+00:00")
    if "." in ts:
        head, tail = ts.split(".", 1)
        tz = tail[tail.index("+"):] if "+" in tail else (tail[tail.index("-"):] if "-" in tail else "+00:00")
        ts = head + tz
    dt = datetime.fromisoformat(ts)
    return dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)

first_msg = {}
for m in msgs:
    uid = cmap.get(m["conversation_id"])
    if uid:
        t = parse(m["created_at"])
        if uid not in first_msg or t < first_msg[uid]:
            first_msg[uid] = t

def window_msgs(a, b):
    users, count = set(), 0
    for m in msgs:
        t = parse(m["created_at"])
        if a <= t < b:
            count += 1
            uid = cmap.get(m["conversation_id"])
            if uid:
                users.add(uid)
    new = {u for u in users if a <= first_msg[u] < b}
    return {"user_msgs": count, "active_users": len(users),
            "new_active_users": len(new), "active_user_names": sorted(pname.get(u, "?") for u in users)}

def window_convs(a, b):
    return sum(1 for c in convs if a <= parse(c["created_at"]) < b)

def window_signups(a, b):
    return sum(1 for p in profs if p.get("created_at") and a <= parse(p["created_at"]) < b)

ul = sb("usage_logs", "created_at,input_tokens,output_tokens",
        f"&endpoint=eq./api/chat&created_at=gte.{iso(prev_start)}")
def window_tokens(a, b):
    tin = sum(r["input_tokens"] or 0 for r in ul if a <= parse(r["created_at"]) < b)
    tout = sum(r["output_tokens"] or 0 for r in ul if a <= parse(r["created_at"]) < b)
    n = sum(1 for r in ul if a <= parse(r["created_at"]) < b)
    return {"web_calls": n, "in_tokens": tin, "out_tokens": tout}

research = sb("messages", "created_at", f"&expanded_research=not.is.null&created_at=gte.{iso(prev_start)}")
def window_research(a, b):
    return sum(1 for r in research if a <= parse(r["created_at"]) < b)

# ---------- Langfuse (MCP) ----------
LF = env.get("LANGFUSE_BASEURL", "https://us.cloud.langfuse.com").rstrip("/")
LF_AUTH = base64.b64encode(f"{env['LANGFUSE_PUBLIC_KEY']}:{env['LANGFUSE_SECRET_KEY']}".encode()).decode()
TOOLS = ["ask_sherpa", "get_feedback", "draft_artifact", "scope_pmm_research"]

def mcp_window(a, b):
    inv, cost, users, bytool = 0, 0.0, set(), {}
    for t in TOOLS:
        page = 1
        while True:
            params = {"tags": "surface:mcp", "name": f"mcp.tool.{t}", "limit": 100, "page": page,
                      "fromTimestamp": iso(a), "toTimestamp": iso(b)}
            d = http(f"{LF}/api/public/traces?" + urllib.parse.urlencode(params),
                     {"Authorization": f"Basic {LF_AUTH}"})
            rows = d.get("data", [])
            for r in rows:
                inv += 1
                cost += r.get("totalCost") or 0
                if r.get("userId"):
                    users.add(r["userId"])
                bytool[t] = bytool.get(t, 0) + 1
            if len(rows) < 100:
                break
            page += 1
            time.sleep(1)
    return {"mcp_invocations": inv, "mcp_cost_usd": round(cost, 2),
            "mcp_users": len(users), "mcp_by_tool": bytool}

# ---------- Stripe ----------
SK = env["STRIPE_SECRET_KEY"]
SH = {"Authorization": "Bearer " + SK}
subs = http("https://api.stripe.com/v1/subscriptions?status=active&limit=100", SH)["data"]
mrr = sum(s["items"]["data"][0]["price"]["unit_amount"] for s in subs if s["items"]["data"]) / 100
charges = http("https://api.stripe.com/v1/charges?limit=100", SH)["data"]

def window_revenue(a, b):
    return round(sum(c["amount"] for c in charges if c["paid"] and not c["refunded"]
                     and a.timestamp() <= c["created"] < b.timestamp()) / 100, 2)

# ---------- Anthropic cost ----------
def anthropic_cost(a, b, tokens):
    admin = env.get("ANTHROPIC_ADMIN_KEY")
    if admin:
        try:
            h = {"x-api-key": admin, "anthropic-version": "2023-06-01"}
            url = ("https://api.anthropic.com/v1/organizations/cost_report?"
                   + urllib.parse.urlencode({"starting_at": iso(a), "ending_at": iso(b), "limit": 31}))
            d = http(url, h)
            total = 0.0
            for bucket in d.get("data", []):
                for r in bucket.get("results", []):
                    total += float(r.get("amount", 0))
            return {"anthropic_usd": round(total, 2), "anthropic_source": "admin_api_org_total"}
        except Exception as e:
            pass
    # calibrated estimate: Sonnet 4.6 pricing x1.5 (observed console/estimate ratio, Jul 2026)
    est = (tokens["in_tokens"] * 3 + tokens["out_tokens"] * 15) / 1e6 * 1.5
    return {"anthropic_usd": round(est, 2), "anthropic_source": "estimate_tokens_x1.5"}

def build(a, b):
    w = {}
    w.update(window_msgs(a, b))
    w["conversations"] = window_convs(a, b)
    w["signups"] = window_signups(a, b)
    w.update(window_tokens(a, b))
    w["research_msgs"] = window_research(a, b)
    w.update(mcp_window(a, b))
    w["revenue_usd"] = window_revenue(a, b)
    ac = anthropic_cost(a, b, w)
    w.update(ac)
    w["perplexity_usd"] = round(w["research_msgs"] * 0.0246, 2)
    w["fixed_usd"] = round((25 + 22) * 14 / 30.4, 2)  # Supabase Pro + ElevenLabs Creator, prorated
    w["total_cost_usd"] = round(w["anthropic_usd"] + w["mcp_cost_usd"] + w["perplexity_usd"] + w["fixed_usd"] + 0.25, 2)
    w["depth"] = round(w["user_msgs"] / w["conversations"], 1) if w["conversations"] else 0
    return w

cur = build(cur_start, cur_end)
prev = build(prev_start, prev_end)
delta = {}
for k in cur:
    if isinstance(cur[k], (int, float)) and k in prev:
        delta[k] = round(cur[k] - prev[k], 2)

report = {
    "generated_at": iso(datetime.now(timezone.utc)),
    "current_window": {"start": iso(cur_start), "end": iso(cur_end), **cur},
    "previous_window": {"start": iso(prev_start), "end": iso(prev_end), **prev},
    "delta": delta,
    "mrr_usd": mrr,
    "active_subscriptions": len(subs),
}
with open(OUTFILE, "w") as f:
    json.dump(report, f, indent=1)
print(json.dumps(report, indent=1))

# ---------- optional plain email (fallback path) ----------
if "--send" in sys.argv:
    def row(label, key, fmt="{}"):
        c, p, d = cur.get(key), prev.get(key), delta.get(key, 0)
        arrow = "▲" if d > 0 else ("▼" if d < 0 else "—")
        return (f"<tr><td style='padding:6px 10px;border-bottom:1px solid #eee'>{label}</td>"
                f"<td align=right style='padding:6px 10px;border-bottom:1px solid #eee'>{fmt.format(c)}</td>"
                f"<td align=right style='padding:6px 10px;border-bottom:1px solid #eee;color:#888'>{fmt.format(p)}</td>"
                f"<td align=right style='padding:6px 10px;border-bottom:1px solid #eee'>{arrow} {fmt.format(abs(d))}</td></tr>")
    html = f"""
    <div style="font-family:system-ui,sans-serif;max-width:640px;margin:0 auto">
    <h2>PMM Sherpa — Biweekly Report</h2>
    <p style="color:#666">{cur_start.date()} → {(cur_end - timedelta(days=1)).date()} vs prior 14 days.
    MRR <b>${mrr:.2f}</b> ({len(subs)} active subs).</p>
    <table style="border-collapse:collapse;width:100%;font-size:14px">
    <tr><th align=left style="padding:6px 10px">Metric</th><th align=right>Current</th><th align=right>Previous</th><th align=right>Δ</th></tr>
    {row("Active users", "active_users")}
    {row("New active users", "new_active_users")}
    {row("Signups", "signups")}
    {row("Conversations", "conversations")}
    {row("User messages", "user_msgs")}
    {row("Depth (msgs/convo)", "depth")}
    {row("Web chat calls", "web_calls")}
    {row("Input tokens", "in_tokens", "{:,}")}
    {row("Output tokens", "out_tokens", "{:,}")}
    {row("MCP invocations", "mcp_invocations")}
    {row("Research messages", "research_msgs")}
    {row("Revenue (window)", "revenue_usd", "${}")}
    {row("Total cost (window)", "total_cost_usd", "${}")}
    </table>
    <p style="color:#888;font-size:12px">Anthropic source: {cur.get('anthropic_source')} · Perplexity calibrated $0.0246/research msg ·
    fixed costs prorated. Plain fallback email (no commentary run).</p>
    </div>"""
    payload = json.dumps({
        "from": "PMM Sherpa Reports <support@pmmsherpa.com>",
        "to": ["abhishekratna@gmail.com"],
        "subject": f"Sherpa biweekly: {cur['active_users']} actives ({'+' if delta.get('active_users',0)>=0 else ''}{delta.get('active_users',0)}), ${cur['total_cost_usd']} cost, ${cur['revenue_usd']} rev",
        "html": html,
    })
    r = http("https://api.resend.com/emails", {
        "Authorization": "Bearer " + env["RESEND_API_KEY"], "Content-Type": "application/json"
    }, method="POST", data=payload)
    print("EMAIL SENT:", r, file=sys.stderr)
