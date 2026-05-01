# RESEARCH — Claude Skill (`pmm-sherpa`)

## Findings

**Existing artifacts:**
- Vault blueprint at `~/Documents/AbhishekR/PMM Sherpa/PMMSherpa Claude Code Skill.md` (2.1KB) envisions three-mode skill: FRAME (pre-work guidance), CONSULT (mid-task judgment), VALIDATE (post-artifact scoring). Layer 4 "thinking alongside" voice. Deliverables: positioning, battlecards, launch plans.
- Reference skills examined: `book-advisor` (~650 words, structured routing), `pptx` (~400, integration-first), `pmmsherpa-email` (workflow + deps), `braintrust` (~300, MCP setup mention).

**System prompt voice (`src/lib/llm/system-prompt.ts`):** Seasoned marketing leader over coffee. Markdown sections, bold key phrases, short paragraphs. Layer 4: think *alongside* reader. Reference frameworks without naming authors. Subject-verb-first sentences. Active verbs.

**MCP integration in skills:** No frontmatter declaration; skill body describes when/why to invoke MCP tools. Claude decides at inference time based on availability.

## Recommendation

**Location:** `~/.claude/skills/pmm-sherpa/SKILL.md` (user-global). Sherpa is cross-project advisor; lives outside repo.

**Frontmatter:**
```yaml
---
name: pmm-sherpa
description: PMM Sherpa — full advisory voice + MCP tools (search_corpus, query_pmm_sherpa, validate_artifact) for positioning, messaging, GTM, launches, and artifact validation. Auto-invoke on PMM/marketing tasks.
---
```

**Body sections (~300-400 words total):**
1. **When to use** — auto-trigger triggers (positioning, messaging, GTM, battlecard, launch, ICP, pricing, sales enablement, customer story); manual `/pmm-sherpa`
2. **Three modes** — FRAME / CONSULT / VALIDATE with one-line each
3. **Voice principles** — Layer 4 thinking-alongside, grounded references, specific > abstract, active verbs, no em-dashes
4. **MCP tool routing** — when to call which:
   - `query_pmm_sherpa` for substantive PMM questions (synthesizes answer in Sherpa voice via prod RAG; **default for any PMM advisory ask**)
   - `search_corpus` for raw chunk retrieval when user wants source-level evidence
   - `validate_artifact` for reviewing user-supplied artifacts
5. **Boundaries** — no current market data / competitor pricing / news (suggest web search instead)
6. **Output rules** — markdown sections, citations preserved, end with one-question close

**Auto-invoke:** YES — solves user's "wasn't invoked by default" feedback. Description must be specific enough that Claude reaches for it on PMM keywords.

## Open Questions

1. Skill installation: just `~/.claude/skills/pmm-sherpa/`? Or also commit a copy to pmmsherpa repo for future MCP installer? **Default: user-global only for now.**
2. Should skill name MCP tools explicitly so Claude routes correctly? **Yes — name them.**
3. Versioning convention? **Skip version field; not needed.**

## Files to create
- `~/.claude/skills/pmm-sherpa/SKILL.md`
