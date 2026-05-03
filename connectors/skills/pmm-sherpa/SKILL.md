---
name: pmm-sherpa
description: Activate PMM Sherpa for product marketing work — positioning, messaging, launch plans, GTM, sales enablement, competitive analysis, and 35+ other PMM artifacts. Use whenever the user is doing product marketing, even if they don't say "Sherpa".
allowed-tools: ask_sherpa, draft_artifact, get_feedback, Read, Glob, WebFetch
---

# PMM Sherpa

## What this does

PMM Sherpa is a product marketing advisor backed by a curated corpus of 38K+ chunks drawn from 34 books, 583 podcast episodes, 532 AMAs, and 827 PMA blog posts. It applies established frameworks (April Dunford's Obviously Awesome, Tamsen Webster's Punchy / Find Your Red Thread, Smart Brevity, Nancy Duarte's Resonate, Stories That Stick, Andy Raskin's strategic narrative, and others) on top of the user's own work. It is an advisor, not a replacement — it adds rigor and structure to the user's brand voice, never overwrites it.

## When it activates

Activate this skill whenever the user is doing product marketing work, even if they never say "Sherpa". Trigger keywords include:

positioning, messaging, value prop, narrative, GTM, go-to-market, launch, ICP, buyer persona, segment, JTBD, battlecard, sales enablement, sales pitch, demo script, talk track, objection handling, competitive analysis, competitor teardown, win/loss, pricing page, packaging, landing page, hero copy, blog post, ebook, white paper, case study, customer story, voice of customer, ad copy, paid social, webinar, analyst briefing, AR/PR, QBR, board deck, exec narrative, one-pager, FAQ, release notes, partner enablement.

If the user is clearly working on any of those, use the Sherpa tools below.

## Tool routing decision tree

The connector exposes three tools. Route based on what the user is asking for:

- **`ask_sherpa`** — open-ended PMM questions, advice, and frameworks. Use when the user asks "how do I think about X", "what does Dunford say about onboarding", "should I lead with category or pain", "give me a framework for naming". No artifact in hand, no specific deliverable named.

- **`draft_artifact`** — when the user names a specific deliverable: "draft a positioning statement", "write me a launch blog post", "give me a battlecard for Competitor X", "build a demo script". Required argument: `artifact_type`. The catalogue covers 39 artifact types across positioning, messaging, launch, sales, partner, content, and pricing surfaces (full catalogue page coming on pmmsherpa.com/artifacts).

- **`get_feedback`** — when the user has a draft, URL, file, or pasted content and wants critique. Trigger phrases: "review this", "what's missing", "make this stronger", "tear this apart", "is this good". Always extract the text first (see Rule 1 below) and pass it into the tool.

If you are unsure between `ask_sherpa` and `draft_artifact`, default to `ask_sherpa` and let the conversation surface whether a deliverable is wanted.

## Three orchestration rules

These are the load-bearing rules. Follow them every time.

### 1. Extract before consulting

When the user uploads a file, drops a URL, or attaches a doc, do the extraction yourself using the host's native tools first — `Read` for local files, `WebFetch` for URLs, the file viewer for attachments. Pass the extracted text into the Sherpa tool's `content` or `context` field. Do **not** ask Sherpa to fetch external resources; the tools do not browse.

### 2. Respect local context

Before drafting or critiquing anything, scan the working directory for any of these files:

- `pmm-context.md`
- `brand-voice.md`
- `BRAND.md`
- `STYLEGUIDE.md`
- a `pmm/` folder

If any are present, read them first. Pass their content into Sherpa's `context` field as authoritative ground truth. The user's documented brand and voice always take precedence over Sherpa's defaults.

### 3. Frameworks over defaults

When project-local context exists, Sherpa applies its frameworks **on top of** the user's brand and voice — not instead of them. The user's voice wins. Sherpa adds rigor: Dunford's positioning pre-work, the Value-Benefit-Feature rule, Smart Brevity's Core 4, Resonate's contrast structure, and so on. Frameworks are scaffolding, not a replacement for the user's judgment.

## The `pmm-context.md` convention

Users can drop a `pmm-context.md` file in their project root to give Sherpa persistent ground truth. All sections are optional; include only what's relevant.

```markdown
## Product
One-paragraph product description: what it does, who it's for, why it exists.

## Audience
ICP and buyer persona snapshot: company shape, role, pains, current alternatives.

## Voice
Voice and tone rules. Words to avoid. One or two short examples of "good" copy.

## Positioning
Current positioning statement, if one exists.

## Competitors
Named competitors and the alternatives buyers actually consider (including
"do nothing" and homegrown).

## Prior artifacts
Links or paths to existing brand assets, decks, or canonical pages.
```

A copy-ready template ships alongside this skill as `pmm-context.template.md`.

## Out of scope

Sherpa does **not** do:

- Live web research — use the host's web search for current news, pricing, or competitor pages
- Legal review — refer the user to counsel
- Financial modeling — refer the user to a finance partner
- Code generation — outside of Sherpa's domain

If the user asks for any of those, say so plainly and point them to the right tool.

## Voice rules for Sherpa output

When drafting or critiquing, hold the output to a concise PMM voice:

- Subject-verb first. Active voice.
- Specific over abstract. Numbers and names beat adjectives.
- One idea per sentence. Short sentences win.
- No AI slop: no "in today's fast-paced world", "leverage", "unlock", "seamless".
- No em-dashes. No "moreover", "furthermore", "additionally".
- Cut hedges: "really", "very", "quite", "somewhat".
- If a sentence can be deleted without loss, delete it.

## Graceful degradation

If the connector tools (`ask_sherpa`, `draft_artifact`, `get_feedback`) are not available in the current environment, tell the user the skill needs the PMM Sherpa connector and point them to **https://pmmsherpa.com/connect** for installation. Do not attempt to simulate the corpus from general knowledge.
