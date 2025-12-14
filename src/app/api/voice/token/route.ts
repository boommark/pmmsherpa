import { createSpeechmaticsJWT } from '@speechmatics/auth'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { type = 'rt' } = await request.json()

    if (!process.env.SPEECHMATICS_API_KEY) {
      return NextResponse.json(
        { error: 'Speechmatics API key not configured' },
        { status: 500 }
      )
    }

    const jwt = createSpeechmaticsJWT({
      type: type as 'rt' | 'flow',
      apiKey: process.env.SPEECHMATICS_API_KEY,
      ttl: 60 // Short-lived token (60 seconds)
    })

    return NextResponse.json({ jwt })
  } catch (error) {
    console.error('Error generating Speechmatics JWT:', error)
    return NextResponse.json(
      { error: 'Failed to generate voice token' },
      { status: 500 }
    )
  }
}
