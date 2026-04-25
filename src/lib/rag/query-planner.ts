/**
 * Intelligent RAG Query Planner
 *
 * Uses Gemini Flash Lite to analyze the full context of a user's request
 * and generate targeted retrieval queries + auto-decide on web research.
 */

import { generateText } from 'ai'
import { getFlashLiteModel } from '@/lib/llm/provider-factory'
import { trackCost } from '@/lib/cost-tracker'

export interface QueryPlan {
  ragQueries: string[]
  webResearch: {
    needed: boolean
    query: string | null
    reason: string | null
  }
  webSearch: {
    needed: boolean
    query: string | null
    reason: string | null
  }
  intent: 'guidance' | 'deliverable' | 'review' | 'career' | 'general'
  contextSummary: string
}

interface QueryPlannerInput {
  message: string
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>
  scrapedUrlContent?: string
  attachmentContext?: string
}

const QUERY_PLANNER_PROMPT = `You are the query planner for PMMSherpa, an AI product marketing advisor backed by a curated knowledge base.

## Your Knowledge Base
Three source types, each serving a different purpose:

**Books:** Foundational theory and craft expertise covering positioning, GTM strategy, customer insight, communication craft, persuasion, marketing fundamentals, PMM-specific methodology, and leadership.

**Practitioner AMAs:** Real-world war stories from PMM leaders at major tech companies. Covers: messaging, launches, GTM, sales enablement, competitive positioning, pricing, stakeholder management, team building, career growth, AI in PMM. These are opinionated, specific, and contextual.

**Industry Articles:** How-to guides, templates, case studies, thought leadership, expert interviews, career advice, emerging trends. Includes case studies from real companies and step-by-step tactical playbooks.

## What the Knowledge Base is Strong On
- Frameworks, methodology, and mental models
- Practitioner war stories and "how I actually did it"
- Craft knowledge (writing, storytelling, negotiation, persuasion)
- Strategic thinking and organizational dynamics
- Templates, structures, and deliverable formats
- Career guidance and team building
- Case studies from named companies

## What the Knowledge Base Does NOT Have
- Current market data for specific companies (pricing, features, recent launches)
- Real-time competitive intelligence
- Recent news, announcements, or market events
- Live benchmarks, salary surveys, or industry statistics from this year
- Information about the user's specific company or product (unless they provided it)

## Your Task
Given the user's message and context, generate:

1. **2-3 RAG queries** — Each should target a DIFFERENT dimension of knowledge that would be useful:
   - Don't generate near-duplicate queries
   - Don't just rephrase the user's message — extract the underlying PMM concepts
   - Target different knowledge types when relevant (e.g., one for frameworks, one for practitioner experience, one for tactical how-to)
   - Strip away conversational fluff ("can you help me with", "I was wondering about")
   - Incorporate relevant context from conversation history, URLs, or attachments

2. **Web research decision** — Should we invoke Perplexity for synthesized research?
   - YES when: current market data needed, recent events referenced, pricing/benchmarks requested, "latest"/"current"/"2026" trends asked about, competitive landscape analysis, OR creating any deliverable (positioning, battlecard, messaging, GTM plan) for a **specific named company or product** where knowing their current offerings, market position, or competitive context is required
   - NO when: asking about frameworks/methodology, requesting generic deliverables without a specific company, career advice, reviewing their own work, conceptual questions the KB covers well
   - If YES, generate a query optimized for Perplexity that targets what the KB CANNOT provide

3. **Web search decision** — Should we search the web and fetch specific pages?
   - YES when: user asks to "look for," "find," "search for," or "research" specific content (blog posts, articles, company pages, documentation), mentions a specific company/product/person they want current info on, asks about a company's current positioning/pricing/features, wants to analyze a competitor's website or content
   - NO when: the question is about frameworks, methodology, career advice, or is clearly answerable from the KB or from Perplexity synthesis alone
   - If YES, generate a precise search query. Include company names, product names, and specific terms. "Protopia AI enterprise data security blog" not "data security best practices"
   - Web search finds and reads actual web pages. Perplexity synthesizes across the web. Use web search when the user wants specific pages. Use Perplexity when they want a synthesized answer about market trends.

4. **Intent classification** — What type of response does the user need?
   - "guidance": teaching, explaining, advising
   - "deliverable": create an artifact (positioning statement, battlecard, etc.)
   - "review": evaluating/critiquing user's work
   - "career": career advice, growth, team management
   - "general": other

4. **Context summary** — One sentence capturing the user's situation and need

## Output Format
Respond ONLY with valid JSON, no markdown fences:
{"ragQueries":["query1","query2","query3"],"webResearch":{"needed":false,"query":null,"reason":null},"webSearch":{"needed":false,"query":null,"reason":null},"intent":"guidance","contextSummary":"summary"}`

function buildPlannerInput(input: QueryPlannerInput): string {
  const parts: string[] = []

  parts.push(`**User message:** ${input.message}`)

  if (input.conversationHistory && input.conversationHistory.length > 0) {
    // Include last 4 turns max to keep context focused
    const recentHistory = input.conversationHistory.slice(-4)
    const historyText = recentHistory
      .map((msg) => `${msg.role}: ${msg.content.substring(0, 300)}${msg.content.length > 300 ? '...' : ''}`)
      .join('\n')
    parts.push(`**Recent conversation:**\n${historyText}`)
  }

  if (input.scrapedUrlContent) {
    // Extract key themes from URL content (first 1500 chars to keep planner fast)
    const urlPreview = input.scrapedUrlContent.substring(0, 1500)
    parts.push(`**URL content (preview):**\n${urlPreview}${input.scrapedUrlContent.length > 1500 ? '...' : ''}`)
  }

  if (input.attachmentContext) {
    const attachPreview = input.attachmentContext.substring(0, 1000)
    parts.push(`**Attachment content (preview):**\n${attachPreview}${input.attachmentContext.length > 1000 ? '...' : ''}`)
  }

  return parts.join('\n\n')
}

export async function planQueries(input: QueryPlannerInput, userId?: string): Promise<QueryPlan> {
  const startTime = Date.now()

  try {
    const model = getFlashLiteModel()
    const userContent = buildPlannerInput(input)

    const result = await generateText({
      model,
      system: QUERY_PLANNER_PROMPT,
      messages: [{ role: 'user', content: userContent }],
      maxOutputTokens: 512,
      temperature: 0.3,
    })

    const elapsed = Date.now() - startTime
    console.log(`[QueryPlanner] Flash Lite responded in ${elapsed}ms`)

    if (userId) {
      trackCost({
        userId,
        service: 'gemini_flash_lite',
        operation: 'query_plan',
        inputTokens: result.usage?.inputTokens || 0,
        outputTokens: result.usage?.outputTokens || 0,
      })
    }

    // Parse JSON response
    const text = result.text.trim()
    // Strip markdown fences if present
    const jsonText = text.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')
    const plan = JSON.parse(jsonText) as QueryPlan

    // Validate and sanitize
    if (!plan.ragQueries || !Array.isArray(plan.ragQueries) || plan.ragQueries.length === 0) {
      throw new Error('No RAG queries returned')
    }

    // Ensure 2-3 queries
    plan.ragQueries = plan.ragQueries.slice(0, 3)

    // Ensure webSearch field exists (Flash Lite may omit it)
    if (!plan.webSearch) {
      plan.webSearch = { needed: false, query: null, reason: null }
    }

    // Fallback: detect search intent from the message if planner missed it
    const msg = input.message.toLowerCase()
    const searchIntentPatterns = [
      /\b(?:look for|find|search for|look up|research|find me)\b.*\b(?:blogs?|articles?|posts?|pages?|websites?|sites?|docs?|documentation)\b/,
      /\b(?:look for|find|search for|look up|research|find me)\b.*\b(?:company|products?|competitors?|pricing|features?|content|info|information)\b/,
      /\b(?:go to|check out|pull up|read|browse)\b.*(?:\.com|\.io|\.ai|\.org|\.net|http)/,
      /\b(?:latest|recent|newest)\b.*\b(?:blogs?|articles?|posts?|content|news)\b.*\b(?:from|by|on|about)\b/,
    ]
    if (!plan.webSearch.needed && searchIntentPatterns.some(p => p.test(msg))) {
      plan.webSearch = {
        needed: true,
        query: input.message.replace(/["""]/g, '').slice(0, 200),
        reason: 'Search intent detected from message',
      }
      console.log(`[QueryPlanner] Fallback: search intent detected from message`)
    }

    // Fallback: explicit research requests should trigger Perplexity web research
    // Catches "do research", "do some research", "do your research", "research on X", etc.
    const explicitResearchPatterns = [
      /\b(?:do|run|conduct|perform)\s+(?:some|your|the|more)?\s*research\b/,
      /\bresearch\s+(?:on|about|into|this|and)\b/,
      /\b(?:look it up|find out|search online|research online)\b/,
    ]
    if (!plan.webResearch.needed && explicitResearchPatterns.some(p => p.test(msg))) {
      // Build a research query from conversation context — use the topic being discussed
      const topicFromContext = plan.contextSummary || input.message
      plan.webResearch = {
        needed: true,
        query: topicFromContext.slice(0, 200),
        reason: 'Explicit research request detected from message',
      }
      console.log(`[QueryPlanner] Fallback: explicit research request detected, query: "${plan.webResearch.query}"`)
    }

    console.log(`[QueryPlanner] Generated ${plan.ragQueries.length} RAG queries, web research: ${plan.webResearch?.needed ? 'YES' : 'NO'}, web search: ${plan.webSearch?.needed ? 'YES' : 'NO'}`)
    console.log(`[QueryPlanner] Queries: ${JSON.stringify(plan.ragQueries)}`)
    if (plan.webResearch?.needed) {
      console.log(`[QueryPlanner] Perplexity query: "${plan.webResearch.query}"`)
    }
    if (plan.webSearch?.needed) {
      console.log(`[QueryPlanner] Brave search query: "${plan.webSearch.query}"`)
    }

    return plan
  } catch (error) {
    console.error('[QueryPlanner] Error:', error)
    const elapsed = Date.now() - startTime
    console.log(`[QueryPlanner] Falling back to raw message after ${elapsed}ms`)

    // Fallback: use the raw message as a single query, no web research
    return {
      ragQueries: [input.message],
      webResearch: { needed: false, query: null, reason: null },
      webSearch: { needed: false, query: null, reason: null },
      intent: 'general',
      contextSummary: input.message.substring(0, 100),
    }
  }
}
