import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { conductResearch } from '@/lib/llm/perplexity-client'
import type { WebCitation, ExpandedResearch } from '@/types/chat'

export const runtime = 'nodejs'
export const maxDuration = 60 // Allow up to 60 seconds for deep research

interface ResearchRequest {
  messageId: string
  originalContent: string
  query: string
  deepResearch?: boolean
}

export async function POST(request: Request) {
  try {
    // Check authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Parse request body
    const body: ResearchRequest = await request.json()
    const { messageId, originalContent, query, deepResearch = false } = body

    if (!messageId || !query) {
      return NextResponse.json(
        { error: 'Missing required fields: messageId and query' },
        { status: 400 }
      )
    }

    // Check for Perplexity API key
    if (!process.env.PERPLEXITY_API_KEY) {
      return NextResponse.json(
        { error: 'Perplexity API key not configured' },
        { status: 500 }
      )
    }

    // Conduct research using Perplexity
    const result = await conductResearch(
      query,
      originalContent,
      {
        model: deepResearch ? 'sonar-deep-research' : 'sonar-pro',
        recencyFilter: deepResearch ? 'year' : 'month'
      }
    )

    // Format response
    const expandedResearch: ExpandedResearch = {
      content: result.content,
      webCitations: result.searchResults as WebCitation[],
      relatedQuestions: result.relatedQuestions,
      researchType: deepResearch ? 'deep' : 'quick'
    }

    // Log usage for monitoring (optional)
    if (result.usage) {
      console.log(`[Research] User ${user.id} - ${deepResearch ? 'Deep' : 'Quick'} research`, {
        messageId,
        tokens: result.usage.totalTokens,
        citations: result.searchResults.length
      })
    }

    return NextResponse.json({
      success: true,
      messageId,
      expandedResearch
    })

  } catch (error) {
    console.error('[Research API Error]', error)

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Invalid Perplexity API key' },
          { status: 401 }
        )
      }
      if (error.message.includes('rate limit')) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to conduct research' },
      { status: 500 }
    )
  }
}
