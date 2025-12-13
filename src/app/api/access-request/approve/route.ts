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

// POST: Approve the request and create user account
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

    // Create user in Supabase Auth using the stored password hash
    // Note: We need to create with a temp password then update
    // because createUser doesn't accept a hash directly
    const tempPassword = `temp_${Date.now()}_${Math.random().toString(36)}`

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: accessRequest.email,
      password: tempPassword,
      email_confirm: true, // Auto-confirm email since we verified during request
      user_metadata: {
        full_name: accessRequest.full_name,
      },
    })

    if (createError || !newUser.user) {
      console.error('Error creating user:', createError)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Update the user's password to the original one they provided
    // We need to use the stored hash - but Supabase doesn't support direct hash update
    // So we'll need to use a workaround: update via raw SQL or keep the bcrypt hash for manual validation
    // For now, let's generate a secure random password and include it in the approval email
    // Actually, let's just let them use the password they provided during signup
    // We'll need to store it temporarily or use password reset flow

    // Better approach: Store the plain password encrypted, or use password reset
    // For MVP: Let's use password reset flow - send them a password reset email

    // Actually, the cleanest solution is to let them log in with their original password
    // We stored the bcrypt hash, so we need to either:
    // 1. Update Supabase auth.users directly (requires direct DB access)
    // 2. Use a custom login that checks our hash (more work)
    // 3. Send password reset email (cleanest for MVP)

    // For now, let's update the user with a known password flow
    // The user will need to reset their password on first login
    // OR we update the password hash directly in the database

    // Create profile for the user
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: newUser.user.id,
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
      // Don't fail - user is created, profile can be fixed
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

    // Generate password setup link (using recovery link type which allows setting password)
    const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: accessRequest.email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?redirect_to=/set-password`,
      },
    })

    if (resetError) {
      console.error('Error generating password setup link:', resetError)
    }

    // The action_link from generateLink points to Supabase's /auth/v1/verify endpoint
    // which will validate the token and redirect to our callback URL
    const passwordSetupLink = resetData?.properties?.action_link || `${process.env.NEXT_PUBLIC_APP_URL}/login`

    // Send approval email to user with password setup link
    const emailTemplate = getUserApprovalEmail({
      fullName: accessRequest.full_name,
      email: accessRequest.email,
      passwordSetupLink,
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
      message: 'User approved and account created successfully',
      user: {
        id: newUser.user.id,
        email: accessRequest.email,
        fullName: accessRequest.full_name,
      },
      passwordResetLink: resetData?.properties?.action_link || null,
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
