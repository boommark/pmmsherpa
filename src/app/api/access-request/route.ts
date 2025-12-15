import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { getAdminNotificationEmail } from '@/lib/email/templates'

// Use service role for inserting access requests
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Lazy initialization of Resend to avoid build-time errors
let resend: Resend | null = null
function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }
  return resend
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      fullName,
      email,
      password,
      phone,
      profession,
      company,
      linkedinUrl,
      useCases,
    } = body

    // Validate required fields
    if (!fullName || !email || !password || !linkedinUrl || !useCases || useCases.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Validate LinkedIn URL format
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/i
    if (!linkedinRegex.test(linkedinUrl)) {
      return NextResponse.json(
        { error: 'Invalid LinkedIn profile URL' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if email already exists in access_requests or auth
    const { data: existingRequest } = await supabase
      .from('access_requests')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .single()

    if (existingRequest) {
      if (existingRequest.status === 'pending') {
        return NextResponse.json(
          { error: 'An access request for this email is already pending. Please wait for approval.' },
          { status: 400 }
        )
      } else if (existingRequest.status === 'approved') {
        return NextResponse.json(
          { error: 'This email has already been approved. Please log in.' },
          { status: 400 }
        )
      }
      // If rejected, allow them to try again (will create new user below)
    }

    // Create user in Supabase Auth immediately, but as banned (pending approval)
    const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password: password,
      email_confirm: true, // Skip email confirmation since admin will verify
      user_metadata: {
        full_name: fullName,
        phone: phone || null,
        profession: profession || null,
        company: company || null,
        linkedin_url: linkedinUrl,
      },
      ban_duration: '876000h', // Ban for ~100 years (essentially forever until approved)
    })

    if (createUserError) {
      console.error('Error creating user:', createUserError)
      // Check if user already exists
      if (createUserError.message?.includes('already')) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please log in or contact support.' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
        { status: 500 }
      )
    }

    // Insert access request record linking to the new user
    const { data: accessRequest, error: insertError } = await supabase
      .from('access_requests')
      .insert({
        full_name: fullName,
        email: email.toLowerCase(),
        phone: phone || null,
        profession: profession || null,
        company: company || null,
        linkedin_url: linkedinUrl,
        use_cases: useCases,
        status: 'pending',
        user_id: newUser.user?.id, // Link to the created user
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting access request:', insertError)
      // Clean up: delete the created user since the request record failed
      if (newUser.user?.id) {
        await supabase.auth.admin.deleteUser(newUser.user.id)
      }
      return NextResponse.json(
        { error: 'Failed to submit access request' },
        { status: 500 }
      )
    }

    // Send notification email to admin
    const emailTemplate = getAdminNotificationEmail({
      fullName,
      email: email.toLowerCase(),
      phone,
      profession,
      company,
      linkedinUrl,
      useCases,
      approvalToken: accessRequest.approval_token,
    })

    try {
      await getResend().emails.send({
        from: 'PMMSherpa <noreply@pmmsherpa.com>',
        to: emailTemplate.to,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      })
    } catch (emailError) {
      // Log error but don't fail the request - admin can see in database
      console.error('Error sending admin notification email:', emailError)
    }

    return NextResponse.json({
      success: true,
      message: 'Access request submitted successfully',
    })
  } catch (error) {
    console.error('Error processing access request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
