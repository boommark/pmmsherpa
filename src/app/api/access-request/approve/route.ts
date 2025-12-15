import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { Resend } from 'resend'
import { getUserApprovalEmail, getWelcomeEmailDraft } from '@/lib/email/templates'
import { SUPER_ADMIN_EMAIL } from '@/lib/constants'

// Use service role for admin operations
const supabaseAdmin = createClient(
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

// GET: Verify token and return request details for confirmation page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Missing approval token' },
        { status: 400 }
      )
    }

    // Fetch the access request by token
    const { data: accessRequest, error: fetchError } = await supabaseAdmin
      .from('access_requests')
      .select('*')
      .eq('approval_token', token)
      .single()

    if (fetchError || !accessRequest) {
      return NextResponse.json(
        { error: 'Invalid or expired approval token' },
        { status: 404 }
      )
    }

    if (accessRequest.status === 'approved') {
      return NextResponse.json(
        { error: 'This request has already been approved' },
        { status: 400 }
      )
    }

    if (accessRequest.status === 'rejected') {
      return NextResponse.json(
        { error: 'This request has been rejected' },
        { status: 400 }
      )
    }

    // Return request details (excluding sensitive data)
    return NextResponse.json({
      id: accessRequest.id,
      fullName: accessRequest.full_name,
      email: accessRequest.email,
      phone: accessRequest.phone,
      profession: accessRequest.profession,
      company: accessRequest.company,
      linkedinUrl: accessRequest.linkedin_url,
      useCases: accessRequest.use_cases,
      createdAt: accessRequest.created_at,
    })
  } catch (error) {
    console.error('Error fetching access request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST: Approve the request - simply unban the already-created user
export async function POST(request: NextRequest) {
  try {
    // Verify the requester is a super admin
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.email !== SUPER_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized. Only super admin can approve requests.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json(
        { error: 'Missing approval token' },
        { status: 400 }
      )
    }

    // Fetch the access request
    const { data: accessRequest, error: fetchError } = await supabaseAdmin
      .from('access_requests')
      .select('*')
      .eq('approval_token', token)
      .single()

    if (fetchError || !accessRequest) {
      return NextResponse.json(
        { error: 'Invalid or expired approval token' },
        { status: 404 }
      )
    }

    if (accessRequest.status !== 'pending') {
      return NextResponse.json(
        { error: `This request has already been ${accessRequest.status}` },
        { status: 400 }
      )
    }

    // Check if user_id exists (new flow - user already created during request)
    if (!accessRequest.user_id) {
      // Legacy request without user_id - need to create user
      // This handles any requests made before the new flow was implemented
      return NextResponse.json(
        { error: 'This is a legacy request. Please ask the user to submit a new access request.' },
        { status: 400 }
      )
    }

    // Unban the user - this is all we need to do!
    // The user was created with their password during the access request
    const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(
      accessRequest.user_id,
      { ban_duration: 'none' } // Removes the ban
    )

    if (updateUserError) {
      console.error('Error unbanning user:', updateUserError)
      return NextResponse.json(
        { error: 'Failed to activate user account' },
        { status: 500 }
      )
    }

    // Create/update profile for the user
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: accessRequest.user_id,
        full_name: accessRequest.full_name,
        email: accessRequest.email,
        phone: accessRequest.phone,
        profession: accessRequest.profession,
        company: accessRequest.company,
        linkedin_url: accessRequest.linkedin_url,
        use_cases: accessRequest.use_cases,
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Don't fail - user is activated, profile can be fixed
    }

    // Update access request status
    const { error: updateError } = await supabaseAdmin
      .from('access_requests')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.id,
      })
      .eq('id', accessRequest.id)

    if (updateError) {
      console.error('Error updating access request:', updateError)
    }

    // Send approval email to user - they can now log in with their password
    const loginLink = `${process.env.NEXT_PUBLIC_APP_URL}/login`
    const emailTemplate = getUserApprovalEmail({
      fullName: accessRequest.full_name,
      email: accessRequest.email,
      passwordSetupLink: loginLink, // Just link to login - they already have their password
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
      console.error('Error sending approval email:', emailError)
    }

    // Get welcome email draft for admin
    const welcomeEmailDraft = getWelcomeEmailDraft({
      fullName: accessRequest.full_name,
      email: accessRequest.email,
    })

    return NextResponse.json({
      success: true,
      message: 'User approved and access granted successfully',
      user: {
        id: accessRequest.user_id,
        email: accessRequest.email,
        fullName: accessRequest.full_name,
      },
      welcomeEmailDraft,
    })
  } catch (error) {
    console.error('Error approving access request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
