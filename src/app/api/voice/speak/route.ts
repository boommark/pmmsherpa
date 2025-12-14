import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

type TTSVoice = 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'fable' | 'nova' | 'onyx' | 'sage' | 'shimmer'

const VALID_VOICES: TTSVoice[] = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'fable', 'nova', 'onyx', 'sage', 'shimmer']

export async function POST(request: Request) {
  try {
    const { text, voice = 'nova' } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 })
    }

    // Validate voice parameter
    if (!VALID_VOICES.includes(voice)) {
      return NextResponse.json({ error: 'Invalid voice parameter' }, { status: 400 })
    }

    // Limit text length to prevent abuse (TTS is priced per character)
    if (text.length > 4096) {
      return NextResponse.json({ error: 'Text too long (max 4096 characters)' }, { status: 400 })
    }

    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: voice as TTSVoice,
      input: text,
      response_format: 'mp3'
    })

    // Return audio as stream
    const arrayBuffer = await response.arrayBuffer()
    return new Response(arrayBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': arrayBuffer.byteLength.toString()
      }
    })
  } catch (error) {
    console.error('TTS error:', error)

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `Speech generation failed: ${error.message}` },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { error: 'Speech generation failed' },
      { status: 500 }
    )
  }
}
