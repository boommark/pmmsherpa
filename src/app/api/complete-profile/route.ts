import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { linkedinUrl, consentGiven } = body

    if (!linkedinUrl) {
      return NextResponse.json({ error: 'LinkedIn profile URL is required' }, { status: 400 })
    }

    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i
    if (!linkedinRegex.test(linkedinUrl)) {
      return NextResponse.json({ error: 'Invalid LinkedIn profile URL' }, { status: 400 })
    }

    if (!consentGiven) {
      return NextResponse.json({ error: 'Communication consent is required' }, { status: 400 })
    }

    const serviceClient = await createServiceClient()
    const { error: updateError } = await serviceClient
      .from('profiles')
      .update({
        linkedin_url: linkedinUrl,
        consent_given: true,
        profile_completed: true,
      } as never)
      .eq('id', user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error completing profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
