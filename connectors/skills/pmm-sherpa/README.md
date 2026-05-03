# PMM Sherpa Skill — Install Guide

This skill activates PMM Sherpa across any host that supports MCP connectors and skill-style system instructions. Pick the section for your environment.

The connector lives at **https://pmmsherpa.com/connect** — that page hosts the live MCP URL, OAuth flow, and the latest version of this skill.

---

## Claude Code

1. Copy the skill file into your global skills directory:

   ```bash
   mkdir -p ~/.claude/skills/pmm-sherpa
   cp SKILL.md ~/.claude/skills/pmm-sherpa/SKILL.md
   ```

2. Install the MCP connector:

   ```bash
   claude mcp add pmm-sherpa <connector-url-from-pmmsherpa.com/connect>
   ```

3. Restart Claude Code so it picks up both the skill and the connector.

4. Verify activation with a sample prompt:

   > Help me sharpen the positioning for a new feature. We sell to mid-market RevOps teams.

   Claude should activate the `pmm-sherpa` skill and route the request through `ask_sherpa`.

---

## Claude Desktop / Claude.ai

Plugin packaging is in progress. When the official Anthropic Plugin ships, install it from **https://pmmsherpa.com/connect** in one click.

In the meantime:

1. Open **Settings → Connectors** and add the PMM Sherpa MCP server using the URL from **https://pmmsherpa.com/connect**.
2. Create a Project for your product marketing work.
3. Open **Project Instructions** and paste the body of `SKILL.md` (everything below the YAML frontmatter — start at the `# PMM Sherpa` heading).
4. Drop a `pmm-context.md` file (see the included `pmm-context.template.md`) into the Project's files for persistent ground truth.

Verify by asking the project for positioning or messaging help. Claude should call the Sherpa tools.

---

## ChatGPT (Custom GPT)

1. **Settings → Connectors → Developer Mode → Add MCP Server.** Use the URL from **https://pmmsherpa.com/connect**.
2. Create a new **Custom GPT**.
3. In the GPT's **Instructions**, paste the body of `SKILL.md` (everything **below** the YAML frontmatter — i.e. starting at `# PMM Sherpa`). The frontmatter is Claude-specific and ChatGPT will ignore or mishandle it.
4. Under **Capabilities**, attach the PMM Sherpa MCP server you registered in step 1.
5. Save and test.

### Paste-ready snippet

The text to paste into the Custom GPT instructions is the contents of `SKILL.md` starting from the line `# PMM Sherpa` and continuing to the end of the file. Do **not** include the YAML frontmatter (the section between `---` markers).

---

## Verifying the skill is working

A correctly installed Sherpa skill will:

- Activate on PMM keywords without the user typing "Sherpa"
- Read `pmm-context.md` (or any `brand-voice.md` / `BRAND.md` / `STYLEGUIDE.md`) before drafting
- Call `ask_sherpa`, `draft_artifact`, or `get_feedback` based on the request shape
- Refuse legal, financial, live-web, and code-generation requests with a clear redirect

If the connector is unavailable, the skill degrades gracefully and points the user to https://pmmsherpa.com/connect.

---

## Updates

The canonical version of this skill ships with the connector. When the connector publishes a new version, re-copy `SKILL.md` (Claude Code) or re-paste the body (ChatGPT, Claude Project).
