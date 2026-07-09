/**
 * /api/projects/[id]/setup — conversational project setup assistant (SSE).
 *
 * POST { messages: [{ role: 'user' | 'assistant', content: string }, ...] }
 *
 * The setup chat is ephemeral — the client holds the history and nothing is
 * persisted here (setup progress lands in projects.setup_state via PATCH).
 * No RAG: the model only needs a live project snapshot plus the thread.
 *
 * SSE events (same `data: {json}\n\n` framing as /api/chat):
 *   { type: 'text', content }                                    — text delta
 *   { type: 'action', action: 'propose_instructions'
 *                   | 'propose_document', payload }              — tool call
 *   { type: 'done' }
 *   { type: 'error', message }
 */

import { NextRequest, NextResponse } from 'next/server'
import { streamText, tool } from 'ai'
import { z } from 'zod'
import { waitUntil } from '@vercel/functions'
import { startActiveObservation } from '@langfuse/tracing'
import { LangfuseOtelSpanAttributes } from '@langfuse/core'
import { requireProject } from '@/lib/projects/auth'
import { getModel } from '@/lib/llm/provider-factory'
import { normalizeSetupState, SETUP_STEP_IDS } from '@/lib/projects/setup-state'
import { langfuseSpanProcessor } from '@/instrumentation'

export const runtime = 'nodejs'
export const maxDuration = 60

const MAX_HISTORY_MESSAGES = 30
const MAX_MESSAGE_CHARS = 8_000
const MAX_HISTORY_CHARS = 24_000
const MAX_SNAPSHOT_INSTRUCTIONS_CHARS = 1_500

type SetupMessage = { role: 'user' | 'assistant'; content: string }

function sanitizeMessages(raw: unknown): SetupMessage[] | null {
  if (!Array.isArray(raw)) return null
  const messages: SetupMessage[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const { role, content } = item as { role?: unknown; content?: unknown }
    if (role !== 'user' && role !== 'assistant') continue
    if (typeof content !== 'string' || !content.trim()) continue
    messages.push({ role, content: content.slice(0, MAX_MESSAGE_CHARS) })
  }
  // Keep the most recent turns within both the message and char budgets.
  const recent = messages.slice(-MAX_HISTORY_MESSAGES)
  let total = 0
  let start = recent.length
  while (start > 0 && total + recent[start - 1].content.length <= MAX_HISTORY_CHARS) {
    total += recent[start - 1].content.length
    start--
  }
  return recent.slice(start)
}

function buildSystemPrompt(
  project: { name: string; instructions: string | null; setup_state?: unknown },
  documents: Array<{ title: string; status: string }>,
): string {
  const state = normalizeSetupState(project.setup_state)
  const instructions = project.instructions?.trim()
  const snapshot = [
    `- Name: ${project.name}`,
    instructions
      ? `- Project instructions (already saved): """${instructions.slice(0, MAX_SNAPSHOT_INSTRUCTIONS_CHARS)}"""`
      : '- Project instructions: none yet',
    documents.length > 0
      ? `- Documents (${documents.length}): ${documents.map((d) => `"${d.title}" (${d.status})`).join(', ')}`
      : '- Documents: none yet',
    `- Setup progress: ${SETUP_STEP_IDS.map((id) => `${id}=${state.steps[id]}`).join(', ')}`,
  ].join('\n')

  return `You are PMM Sherpa's project setup assistant. You are helping a product marketer set up a project workspace so every future Sherpa chat inside it has the right context. You are warm, expert, and concise.

Conversation rules:
- Ask ONE question at a time. Never send a wall of questions.
- Keep replies to 2-4 short sentences, except inside tool-call drafts.
- Messages in [brackets] are system notes about UI events (steps skipped, drafts accepted, uploads), not user prose. Adapt silently and keep going — never quote them back.
- Don't redo steps that are already completed or skipped unless the user asks.

Setup flow (each step is skippable; adapt to the progress snapshot below):
1. describe — learn what the project is about: the product, the audience, the goal. Ask at most 1-2 smart follow-ups, then move on.
2. instructions — draft project instructions from the conversation (how Sherpa should behave in this project: company/product context, audience, tone, priorities, do's and don'ts) and propose them with the propose_instructions tool.
3. documents — ask whether they have documents to add (positioning doc, messaging, personas, competitive notes). They can upload files right here in the panel. If they'd rather have you draft a foundational document (e.g. a positioning brief built from this conversation), write it and propose it with the propose_document tool. Multiple documents are fine.
4. completion — once every step is completed or skipped, briefly summarize what's set up and hand off: tell them to start chatting in this project.

Tool rules:
- propose_instructions: call it when you're ready to propose project instructions. Write them as direct guidance to Sherpa (e.g. "The product is X, sold to Y. Use a direct, no-fluff voice."), roughly 100-250 words, under 2,000 characters.
- propose_document: call it ONLY when the user asks you to draft a document. content must be complete, well-structured markdown with headings — a document they'd actually keep, not an outline of one.
- Write a one-sentence lead-in before calling a tool, then call it. Never call more than one tool per turn, and never paste a draft as plain text instead of using the tool.
- After a tool call your turn ends; the user sees the draft as a card with accept/skip buttons.

Current project snapshot:
${snapshot}`
}

type RouteParams = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const guard = await requireProject(id)
    if (!guard.ok) return guard.response
    const { service, project } = guard

    let body: { messages?: unknown }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Expected JSON body with { messages }' }, { status: 400 })
    }

    const messages = sanitizeMessages(body.messages)
    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'messages must be a non-empty array of { role, content }' },
        { status: 400 },
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: documents, error: docsError } = await (service.from('project_documents') as any)
      .select('title, status')
      .eq('project_id', project.id)
      .order('created_at', { ascending: true })
    if (docsError) {
      console.error('[ProjectSetup] documents fetch failed:', docsError)
      return NextResponse.json({ error: 'Failed to load project documents' }, { status: 500 })
    }

    const system = buildSystemPrompt(project, documents || [])

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        const send = (payload: unknown) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
        }
        // Wrap the turn in a parent span so streamText's telemetry attaches to
        // a trace carrying the mandated surface:* tag (see project CLAUDE.md).
        await startActiveObservation('sherpa.project-setup.request', async (span) => {
          span.otelSpan.setAttribute(LangfuseOtelSpanAttributes.TRACE_NAME, 'sherpa.project-setup.request')
          span.otelSpan.setAttribute(LangfuseOtelSpanAttributes.TRACE_USER_ID, guard.userId)
          span.otelSpan.setAttribute(LangfuseOtelSpanAttributes.TRACE_TAGS, ['surface:web'])
          span.update({ metadata: { userId: guard.userId, projectId: project.id, surface: 'web', endpoint: '/api/projects/[id]/setup' } })
          try {
          const result = streamText({
            model: getModel('claude-sonnet'),
            system,
            messages,
            maxOutputTokens: 8192,
            temperature: 0.7,
            // No execute on either tool: the turn ends after the tool call
            // (default single step) and the client renders the proposal card.
            tools: {
              propose_instructions: tool({
                description:
                  'Propose project instructions for this project. Call when you have enough context to draft how Sherpa should behave in every chat here.',
                inputSchema: z.object({
                  instructions: z
                    .string()
                    .min(1)
                    .max(10_000)
                    .describe('The full proposed project instructions, plain text.'),
                }),
              }),
              propose_document: tool({
                description:
                  'Propose a foundational document (e.g. positioning brief) drafted from this conversation. Call only when the user asks you to draft a document.',
                inputSchema: z.object({
                  title: z.string().min(1).max(200).describe('Short document title.'),
                  content: z
                    .string()
                    .min(1)
                    .max(60_000)
                    .describe('Complete, well-structured markdown document.'),
                }),
              }),
            },
            experimental_telemetry: {
              isEnabled: true,
              functionId: 'projects.setup.streamText',
              metadata: { userId: guard.userId, projectId: project.id },
            },
          })

          for await (const part of result.fullStream) {
            if (part.type === 'text-delta') {
              send({ type: 'text', content: part.text })
            } else if (part.type === 'tool-call') {
              send({ type: 'action', action: part.toolName, payload: part.input })
            } else if (part.type === 'error') {
              throw part.error
            }
          }
          send({ type: 'done' })
          } catch (error) {
            console.error('[ProjectSetup] stream error:', error)
            send({ type: 'error', message: 'Something went wrong. Please try again.' })
          } finally {
            controller.close()
          }
        })
        // Keep the lambda alive until the Langfuse OTLP export completes.
        waitUntil(langfuseSpanProcessor.forceFlush())
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[ProjectSetup] POST /api/projects/[id]/setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
