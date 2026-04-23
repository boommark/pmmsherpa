# DIY Baseline Workspace Setup

One-time manual setup for the 3 DIY RAG baselines. Each workspace gets the same 7-book pack and the same system instructions, so the only variable is the platform's retrieval and generation behavior.

---

## Book pack (upload to all 3)

Upload these 7 PDFs/EPUBs to each workspace:

1. April Dunford — *Obviously Awesome*
2. April Dunford — *Sales Pitch*
3. Geoffrey Moore — *Crossing the Chasm*
4. Donald Miller — *Building a StoryBrand*
5. Al Ries & Jack Trout — *22 Immutable Laws of Marketing*
6. Maja Voje — *Go-to-Market Strategist*
7. Al Ramadan et al. — *Play Bigger*

**File location on Mac:** Check `~/Documents/AbhishekR/` for Obsidian-imported versions, or use the original PDFs from the pmmsherpa ingestion pipeline.

---

## System instructions (same for all 3)

Paste this exact text as the custom instructions / system prompt for each workspace:

```
You are a product marketing advisor. Use the uploaded books as your primary knowledge base to ground your advice in named frameworks and practitioner methods.

When answering:
- Ground claims in specific frameworks from the books (e.g., Dunford's 5 components, Moore's bowling pin strategy)
- Be specific and actionable — name concrete tactics, not abstract principles
- If you reference a concept from the books, name it naturally without excessive author attribution
- When asked to create deliverables (positioning statements, battlecards, launch plans), produce production-ready artifacts
- When asked to write talk tracks or spoken content, use short sentences, rhetorical questions, and conversational rhythm
```

---

## Platform-specific setup

### 1. Custom GPT (ChatGPT)

1. Go to https://chatgpt.com/gpts/editor
2. Click "Create a GPT"
3. In the "Configure" tab:
   - **Name:** PMM Advisor (Eval Baseline)
   - **Instructions:** Paste the system instructions above
   - **Knowledge:** Upload all 7 books
   - **Capabilities:** Enable "Code Interpreter & Data Analysis" (off), "Web Browsing" (OFF — we want to test knowledge retrieval only), "DALL-E" (off)
4. Save as "Only me"
5. Note the GPT URL for the browser runner

**URL format:** `https://chatgpt.com/g/g-XXXXXXXXX-pmm-advisor-eval-baseline`

### 2. Gemini Gem

1. Go to https://gemini.google.com/gems
2. Click "Create a Gem"
3. **Name:** PMM Advisor (Eval Baseline)
4. **Instructions:** Paste the system instructions above
5. **Knowledge:** Upload all 7 books (drag & drop)
6. Save
7. Note the Gem URL for the browser runner

**URL format:** `https://gemini.google.com/gem/XXXXXXXXX`

### 3. Claude Project

1. Go to https://claude.ai
2. Click "Projects" in the sidebar → "Create Project"
3. **Name:** PMM Advisor (Eval Baseline)
4. **Project instructions:** Paste the system instructions above
5. **Knowledge:** Upload all 7 books via the "Add content" button
6. Note the project URL for the browser runner

**URL format:** `https://claude.ai/project/XXXXXXXXX`

---

## Important: web search OFF

For a fair comparison against Sherpa (which uses its own curated corpus + Perplexity/Brave), the DIY baselines should have web search **disabled** where possible:

- **Custom GPT:** Web Browsing capability set to OFF (controlled in GPT config)
- **Gemini Gem:** No toggle — Gemini may ground in web by default. Note this in results metadata.
- **Claude Project:** No web search by default. Good.

If Gemini can't disable web grounding, note it as a methodological caveat. This actually makes the comparison harder for Sherpa (Gemini gets web + books), which strengthens the result if Sherpa still wins.

---

## Verification checklist

Before running prompts, verify each workspace with a quick sanity check:

**Test prompt:** "What are Dunford's 5 components of positioning, in order?"

**Expected:** Names all 5 (competitive alternatives, unique attributes, value, target market, market category) in that order. If the response doesn't reference the books at all, the knowledge upload may have failed.

Run this test in each workspace and confirm retrieval is working before proceeding.

---

## After setup

Record each workspace URL in a config file:

```yaml
# evals/browser/workspace_urls.yaml
custom_gpt: "https://chatgpt.com/g/g-XXXXXXXXX-pmm-advisor-eval-baseline"
gemini_gem: "https://gemini.google.com/gem/XXXXXXXXX"
claude_project: "https://claude.ai/project/XXXXXXXXX"
```

The browser runner scripts will read these URLs to navigate to the right workspace.
