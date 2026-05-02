/**
 * Corpus research helper. Calls the same RAG → LLM pipeline as MCP's
 * query_pmm_sherpa tool to fetch best-practices answers grounded in the
 * PMM Sherpa knowledge corpus.
 *
 * Used for template research: e.g. "what makes a strong positioning
 * statement?" — the synthesized answer + citations drive the structure
 * of generate_artifact templates so they reflect canon, not training-data
 * generic.
 *
 * Usage:
 *   ./node_modules/.bin/tsx scripts/corpus-query.ts "your question here"
 *
 *   # Save output to a file:
 *   ./node_modules/.bin/tsx scripts/corpus-query.ts "..." > out.json
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env.local first (Next.js convention), then fall back to .env
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

import { runSherpaChat } from '@/lib/mcp/helpers'
import { createServiceClient } from '@/lib/supabase/server'
import { SUPER_ADMIN_EMAIL } from '@/lib/constants'

async function getFounderUserId(): Promise<string> {
  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', SUPER_ADMIN_EMAIL)
    .single()
  if (error || !data) {
    throw new Error(`could not find founder profile: ${error?.message}`)
  }
  return data.id as string
}

async function main() {
  const query = process.argv.slice(2).join(' ').trim()
  if (!query) {
    console.error('Usage: tsx scripts/corpus-query.ts "your question"')
    process.exit(1)
  }

  const userId = await getFounderUserId()
  const result = await runSherpaChat({ message: query, userId })

  // Output JSON for downstream consumption (template research).
  console.log(
    JSON.stringify(
      {
        query,
        text: result.text,
        intent: result.intent,
        citation_count: result.citations.length,
        citations: result.citations.map((c) => ({
          title: c.title,
          source_type: c.source_type,
          author: c.author,
          url: c.url,
          page_number: c.page_number,
          section_title: c.section_title,
        })),
        usage: result.usage,
      },
      null,
      2,
    ),
  )
}

main().catch((e) => {
  console.error('FAIL:', e)
  process.exit(1)
})
