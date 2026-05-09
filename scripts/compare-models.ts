/**
 * Ad-hoc model comparison: run the same PMM Sherpa MCP-style query through
 * Sonnet 4.6, Haiku 4.5, GPT-4o-mini, and Gemini 2.5 Flash with the SAME
 * retrieved RAG context + system prompt. Times each, captures token counts,
 * writes results to /tmp/model-compare-<ts>.md.
 *
 *   npx tsx --env-file=.env.local scripts/compare-models.ts "your question"
 */

import { generateText } from 'ai'
import { createAnthropic } from '@ai-sdk/anthropic'
import { createOpenAI } from '@ai-sdk/openai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { multiQueryRetrieve, extractCitations, formatContextForPrompt } from '../src/lib/rag/retrieval'
import { planQueries } from '../src/lib/rag/query-planner'
import { getSystemPromptParts } from '../src/lib/llm/system-prompt'
import { writeFileSync } from 'node:fs'

const QUERY = process.argv[2] || 'How should I think about positioning a developer tool against an entrenched open-source incumbent — copy them, niche down, or pick a fight on a different axis?'

const MODELS = [
  { key: 'sonnet-4-6',     label: 'Claude Sonnet 4.6',  build: () => createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })('claude-sonnet-4-6') },
  { key: 'haiku-4-5',      label: 'Claude Haiku 4.5',   build: () => createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })('claude-haiku-4-5') },
  { key: 'gpt-4o-mini',    label: 'OpenAI GPT-4o-mini', build: () => createOpenAI({ apiKey: process.env.OPENAI_API_KEY! })('gpt-4o-mini') },
  { key: 'gemini-flash',   label: 'Gemini 2.5 Flash',   build: () => createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_API_KEY! })('gemini-2.5-flash') },
] as const

interface RunResult {
  key: string
  label: string
  ms: number
  inputTokens: number
  outputTokens: number
  text: string
  error?: string
}

async function runOne(m: typeof MODELS[number], systemMessages: any[], userMsg: string): Promise<RunResult> {
  const start = Date.now()
  try {
    const result = await generateText({
      model: m.build(),
      messages: [...systemMessages, { role: 'user', content: userMsg }],
      maxOutputTokens: 2048,
      temperature: 0.7,
    })
    return {
      key: m.key,
      label: m.label,
      ms: Date.now() - start,
      inputTokens: result.usage?.inputTokens ?? 0,
      outputTokens: result.usage?.outputTokens ?? 0,
      text: result.text,
    }
  } catch (err) {
    return {
      key: m.key,
      label: m.label,
      ms: Date.now() - start,
      inputTokens: 0,
      outputTokens: 0,
      text: '',
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

async function main() {
  const ADMIN_USER_ID = process.env.SUPER_ADMIN_USER_ID || '00000000-0000-0000-0000-000000000000'

  console.log(`\n=== Query ===\n${QUERY}\n`)
  console.log('Phase 1: planning queries...')
  const plan = await planQueries({ message: QUERY, conversationHistory: [] }, ADMIN_USER_ID)
  console.log(`  intent=${plan.intent}, ${plan.ragQueries.length} sub-queries`)

  console.log('Phase 2: retrieving chunks...')
  const ragResult = await multiQueryRetrieve(plan.ragQueries, 10, ADMIN_USER_ID, plan.intent)
  console.log(`  ${ragResult.chunks.length} chunks retrieved`)

  if (ragResult.chunks.length === 0) {
    console.error('No chunks retrieved — aborting')
    process.exit(1)
  }

  const retrievedContext = formatContextForPrompt(ragResult.chunks)
  const citations = extractCitations(ragResult.chunks)

  // Use the same system prompt + context for every model (claude-sonnet keying is fine —
  // the prompt body doesn't differ by provider; only Anthropic gets prompt-cache control,
  // which we skip here for an apples-to-apples comparison).
  const systemParts = getSystemPromptParts(retrievedContext, 'claude-sonnet')
  const systemMessages = [
    { role: 'system' as const, content: systemParts.staticPart },
    { role: 'system' as const, content: systemParts.dynamicPart },
  ]

  console.log(`\nPhase 3: running ${MODELS.length} models in parallel...\n`)
  const results = await Promise.all(MODELS.map((m) => runOne(m, systemMessages, QUERY)))

  for (const r of results) {
    console.log(`  ${r.label.padEnd(26)} ${r.error ? `ERROR: ${r.error.slice(0, 80)}` : `${r.ms}ms  in:${r.inputTokens} out:${r.outputTokens}  tok/s:${r.outputTokens > 0 ? (r.outputTokens / (r.ms / 1000)).toFixed(1) : 'n/a'}`}`)
  }

  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const outPath = `/tmp/model-compare-${ts}.md`
  const md = [
    `# Model comparison — ${new Date().toISOString()}`,
    ``,
    `## Query`,
    `> ${QUERY}`,
    ``,
    `## Retrieval`,
    `- Intent: \`${plan.intent}\``,
    `- Sub-queries: ${plan.ragQueries.length}`,
    `- Chunks retrieved: ${ragResult.chunks.length}`,
    `- Unique sources: ${new Set(citations.map((c) => c.source)).size}`,
    ``,
    `## Timing`,
    ``,
    `| Model | Latency | Input toks | Output toks | tok/s |`,
    `|---|---:|---:|---:|---:|`,
    ...results.map((r) => `| ${r.label} | ${r.ms}ms | ${r.inputTokens} | ${r.outputTokens} | ${r.outputTokens > 0 ? (r.outputTokens / (r.ms / 1000)).toFixed(1) : 'n/a'} |`),
    ``,
    `## Responses`,
    ``,
    ...results.flatMap((r) => [
      `---`,
      ``,
      `### ${r.label}`,
      ``,
      r.error ? `**ERROR:** \`${r.error}\`` : r.text,
      ``,
    ]),
  ].join('\n')

  writeFileSync(outPath, md)
  console.log(`\nFull output: ${outPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
