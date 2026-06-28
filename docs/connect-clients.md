# Connect PMM Sherpa to your AI

PMM Sherpa is a remote MCP server. Once connected, your AI can call three tools:
`ask_sherpa`, `draft_artifact`, and `get_feedback`.

- **Production URL**: `https://pmmsherpa.com/api/mcp`
- **Staging URL**: `https://staging.pmmsherpa.com/api/mcp`
- **Transport**: Streamable HTTP
- **Auth**: OAuth 2.1 with PKCE — log in with the same Google account or
  email/password you use at [pmmsherpa.com](https://pmmsherpa.com)

Pick your client below.

---

## Claude.ai (Pro, Max, Team, Enterprise)

1. Open [claude.ai → Settings → Connectors](https://claude.ai/settings/connectors).
2. Scroll to the bottom and click **Add custom connector**.
3. **Name**: `PMM Sherpa` · **URL**: `https://pmmsherpa.com/api/mcp`
4. Click **Add**. Claude opens an OAuth window — sign in with your PMM Sherpa
   account and approve.
5. In any chat, click the tools icon and toggle **PMM Sherpa** on for that
   conversation. The three tools appear in the tool picker.

**Auth**: Browser OAuth, fully handled by Claude. No tokens to paste.
**Limitation**: Free plan can't add custom connectors. Free users on Pro/Max
trial get one custom connector slot.

---

## Claude Code (CLI and IDE extensions)

One-line install:

```bash
claude mcp add --transport http pmm-sherpa https://pmmsherpa.com/api/mcp
```

Or add to `~/.claude/mcp.json` (user-global) or project-local `.mcp.json`:

```json
{
  "mcpServers": {
    "pmm-sherpa": {
      "type": "http",
      "url": "https://pmmsherpa.com/api/mcp"
    }
  }
}
```

Verify it loaded inside Claude Code:

```
/mcp
```

You should see `pmm-sherpa` listed. The first tool call triggers a browser
OAuth flow; subsequent sessions reuse the cached token.

**Auth**: Browser OAuth, handled automatically on first use.
**Limitation**: None — full read/write tool support.

---

## ChatGPT (Plus, Pro, Business, Enterprise, Edu)

ChatGPT supports remote MCP in two places: **Deep Research / Company Knowledge**
(GA) and **Developer Mode** (beta, full read+write tool calls in regular chat).
Note: as of December 2025, ChatGPT renamed "Connectors" to **Apps**.

**To use PMM Sherpa as a full tool in regular chat (recommended):**

1. **Settings → Apps → Advanced settings → Developer mode** → enable.
2. **Settings → Apps → Add custom app** (or "Add MCP server" in Developer mode).
3. **URL**: `https://pmmsherpa.com/api/mcp` · choose **OAuth** for auth.
4. Sign in with your PMM Sherpa account in the popup.
5. In a new chat, open the apps/tools menu and toggle **PMM Sherpa** on.

**Auth**: OAuth in-browser (Developer Mode). Connector mode also accepts a
pasted bearer token if your workspace blocks OAuth.
**Limitation**: Developer Mode is **beta** and not available on Free.
Outside Developer Mode, only the Deep Research path is supported, and only the
`search` / `fetch` tool shape — `draft_artifact` and `get_feedback` are not
exposed there. Use Developer Mode for full functionality.

---

## Codex (OpenAI Codex CLI and IDE extension)

One-line install:

```bash
codex mcp add pmm-sherpa --url https://pmmsherpa.com/api/mcp
```

Or edit `~/.codex/config.toml` directly:

```toml
[mcp_servers.pmm-sherpa]
url = "https://pmmsherpa.com/api/mcp"
```

The CLI and the Codex IDE extension share this config. Restart Codex; the
tools appear automatically.

**Auth**: First call opens a browser for OAuth. If you prefer a static token,
set `bearer_token_env_var = "PMM_SHERPA_TOKEN"` and export the variable.
**Limitation**: None for streamable HTTP servers — Codex is a first-class MCP
client.

---

## Gemini CLI

Add to `~/.gemini/settings.json` (global) or `.gemini/settings.json` (project):

```json
{
  "mcpServers": {
    "pmm-sherpa": {
      "httpUrl": "https://pmmsherpa.com/api/mcp"
    }
  }
}
```

Restart the CLI. Confirm with `/mcp` inside a session.

**Auth**: Gemini CLI handles OAuth 2.0 in-browser on first call.
**Limitation**: Gemini CLI consumes tools only — it does not surface MCP
resources or prompts.

> **Gemini consumer app (gemini.google.com / mobile)**: does **not** support
> custom remote MCP servers as of May 2026. Use Gemini CLI, Antigravity, or
> Gemini Enterprise.

---

## Antigravity (Google's IDE)

1. Open the **MCP store** in Antigravity → **Manage MCP Servers** → **View raw config**.
2. This opens `mcp_config.json` (`~/.gemini/antigravity/mcp_config.json` on
   macOS/Linux; `C:\Users\<you>\.gemini\antigravity\mcp_config.json` on
   Windows).
3. Add PMM Sherpa under `mcpServers`:

```json
{
  "mcpServers": {
    "pmm-sherpa": {
      "httpUrl": "https://pmmsherpa.com/api/mcp"
    }
  }
}
```

4. Save. Antigravity hot-reloads and triggers OAuth on the first tool call.

**Auth**: Browser OAuth on first use.
**Limitation**: Per-workspace MCP config is still being rolled out — for now,
this config is global across all Antigravity workspaces.

---

## Troubleshooting

- **OAuth window doesn't open**: make sure pop-ups are allowed for
  `pmmsherpa.com`, then re-trigger any tool call.
- **401 / token expired**: disconnect and re-add the connector; tokens refresh
  automatically thereafter.
- **Tool not showing in chat**: most clients require you to toggle the
  connector on per-conversation (Claude.ai, ChatGPT). Check the tools/apps
  menu inside the chat itself.
- **Staging vs. prod**: swap the host to `staging.pmmsherpa.com` in any of the
  configs above. Staging requires a separate login.
