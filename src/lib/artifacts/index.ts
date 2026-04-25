import { generateText } from 'ai'
import { getAnthropicClient } from '@/lib/llm/provider-factory'
import { multiQueryRetrieve, formatContextForPrompt } from '@/lib/rag/retrieval'
import { renderMarkdownToHtml } from './renderer'
import { getArtifactConfig, type ArtifactType } from './prompts/index'
import { createServiceClient } from '@/lib/supabase/server'

interface GenerateDeckOptions {
  artifactType: ArtifactType
  userId: string
  conversationId: string
  userContext: string
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
}

export interface GenerateDeckResult {
  deckId: string
  title: string
  artifactType: ArtifactType
  format: 'slide' | 'document'
  storagePath: string
  slideCount?: number
  pageCount?: number
}

export async function generateDeck(opts: GenerateDeckOptions): Promise<GenerateDeckResult> {
  const { artifactType, userId, conversationId, userContext, conversationHistory } = opts

  const config = getArtifactConfig(artifactType)
  if (!config) throw new Error(`Unknown artifact type: ${artifactType}`)

  // 1. RAG retrieval with artifact-specific query
  const ragQuery = `${userContext} ${config.displayName} PMM framework`
  const ragResult = await multiQueryRetrieve([ragQuery], 8)
  const ragContext = formatContextForPrompt(ragResult.chunks)

  // 2. Build conversation context (last 6 messages)
  const recentHistory = conversationHistory.slice(-6)
  const historyText = recentHistory
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n')

  // 3. Build user prompt
  const userPrompt = [
    '## Conversation context',
    historyText || '(No prior conversation)',
    '',
    '## User request',
    userContext,
    '',
    '## Relevant PMM knowledge (RAG)',
    ragContext || '(No RAG context retrieved)',
    '',
    `Generate a complete ${config.displayName} as valid MARP markdown. Fill every section with real, specific content based on the context above. Do not use placeholder brackets.`,
  ].join('\n')

  // 4. Generate MARP markdown via Claude
  const anthropic = getAnthropicClient()
  const { text: markdown } = await generateText({
    model: anthropic('claude-sonnet-4-6'),
    system: config.systemPrompt,
    prompt: userPrompt,
    maxOutputTokens: 4000,
  })

  // 5. Render to HTML via marp-cli
  const html = await renderMarkdownToHtml(markdown, config.themeFile)

  // 6. Upload HTML to Supabase Storage
  const supabase = await createServiceClient()
  const deckId = crypto.randomUUID()
  const storagePath = `${userId}/${deckId}.html`

  const { error: uploadError } = await supabase.storage
    .from('decks')
    .upload(storagePath, Buffer.from(html, 'utf8'), {
      contentType: 'text/html',
      upsert: false,
    })

  if (uploadError) throw new Error(`Storage upload failed: ${uploadError.message}`)

  // 7. Auto-generate title from context
  const title = generateTitle(userContext, config.displayName)

  // 8. Save record to decks table
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: dbError } = await (supabase as any)
    .from('decks')
    .insert({
      id: deckId,
      user_id: userId,
      conversation_id: conversationId,
      title,
      artifact_type: artifactType,
      format: config.format,
      markdown_content: markdown,
      storage_path: storagePath,
    })

  if (dbError) throw new Error(`DB insert failed: ${dbError.message}`)

  return {
    deckId,
    title,
    artifactType,
    format: config.format,
    storagePath,
    slideCount: config.slideCount,
    pageCount: config.pageCount,
  }
}

function generateTitle(userContext: string, displayName: string): string {
  const words = userContext.trim().split(/\s+/).slice(0, 6).join(' ')
  const truncated = words.length > 40 ? words.slice(0, 40) : words
  return `${truncated} — ${displayName}`
}
