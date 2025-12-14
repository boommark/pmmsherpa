import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { conversationId } = body

    // Generate ephemeral token for client-side WebRTC
    const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-realtime-preview-2024-12-17',
        voice: 'verse',
        instructions: `You are PMMSherpa, an AI assistant specialized in Product Marketing.
You help product marketing managers with positioning, messaging, go-to-market strategy,
competitive analysis, and customer research. Be concise in voice responses.
Keep responses under 30 seconds when spoken. Be warm, helpful, and professional.`,
        input_audio_transcription: {
          model: 'whisper-1'
        },
        turn_detection: {
          type: 'server_vad',
          threshold: 0.5,
          prefix_padding_ms: 300,
          silence_duration_ms: 500
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('OpenAI Realtime API error:', errorText)
      throw new Error('Failed to create realtime session')
    }

    const session = await response.json()

    return NextResponse.json({
      client_secret: session.client_secret,
      expires_at: session.expires_at,
      conversationId
    })
  } catch (error) {
    console.error('Realtime token error:', error)
    return NextResponse.json(
      { error: 'Failed to create voice session' },
      { status: 500 }
    )
  }
}
