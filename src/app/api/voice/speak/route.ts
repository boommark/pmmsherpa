import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const maxDuration = 30

const VALID_VOICES: Record<string, string> = {
  VsQmyFHffusQDewmHB5v: 'Eddie Stirling',
  wWWn96OtTHu1sn8SRGEr: 'Hale',
  AXdMgz6evoL7OPd7eU12: 'Elizabeth',
  gJx1vCzNCD1EQHT212Ls: 'Ava',
  sB7vwSCyX0tQmU24cW2C: 'Jon',
  jqcCZkN6Knx8BJ5TBdYR: 'Zara',
}

const DEFAULT_VOICE_ID = 'VsQmyFHffusQDewmHB5v'
const DEFAULT_MODEL_ID = 'eleven_flash_v2_5'
const MAX_TEXT_LENGTH = 5000

function stripMarkdown(text: string): string {
  return text
    // Remove headers (# ## ### etc.)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold (**text** or __text__)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    // Remove italic (*text* or _text_)
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/(?<!\w)_(.*?)_(?!\w)/g, '$1')
    // Remove inline code (`code`)
    .replace(/`([^`]+)`/g, '$1')
    // Remove code blocks (```...```)
    .replace(/```[\s\S]*?```/g, '')
    // Remove links [text](url) → text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove unordered list markers (-, *, +)
    .replace(/^[\s]*[-*+]\s+/gm, '')
    // Remove ordered list markers (1. 2. etc.)
    .replace(/^[\s]*\d+\.\s+/gm, '')
    // Remove horizontal rules
    .replace(/^[-*_]{3,}\s*$/gm, '')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Collapse multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 500 }
      )
    }

    const { text, voiceId = DEFAULT_VOICE_ID, modelId = DEFAULT_MODEL_ID } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    if (typeof text !== 'string') {
      return NextResponse.json({ error: 'Text must be a string' }, { status: 400 })
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `Text too long (max ${MAX_TEXT_LENGTH} characters)` },
        { status: 400 }
      )
    }

    if (!VALID_VOICES[voiceId]) {
      return NextResponse.json(
        { error: 'Invalid voice ID' },
        { status: 400 }
      )
    }

    const cleanText = stripMarkdown(text)

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: cleanText,
          model_id: modelId,
          output_format: 'mp3_44100_128',
        }),
      }
    )

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('ElevenLabs TTS error:', response.status, errorBody)
      return NextResponse.json(
        { error: `Speech generation failed: ${response.statusText}` },
        { status: response.status }
      )
    }

    if (!response.body) {
      return NextResponse.json(
        { error: 'No audio stream received' },
        { status: 500 }
      )
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (error) {
    console.error('TTS error:', error)
    return NextResponse.json(
      { error: 'Speech generation failed' },
      { status: 500 }
    )
  }
}
