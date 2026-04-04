import { SUPER_ADMIN_EMAIL } from '@/lib/constants'

interface AccessRequestData {
  fullName: string
  email: string
  phone?: string
  profession?: string
  company?: string
  linkedinUrl?: string
  useCases: string[]
  approvalToken: string
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://pmmsherpa.com'
const LOGO_URL = 'https://pmmsherpa.com/email/logo-blue.png'

// Common email styles for consistent branding (blue #0058be)
const emailStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #1f2937;
    background-color: #f9fafb;
    margin: 0;
    padding: 20px;
  }
  .wrapper {
    max-width: 600px;
    margin: 0 auto;
  }
  .container {
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }
  .header {
    color: #1f2937;
    padding: 32px 30px 24px;
    text-align: center;
  }
  .header h1 {
    margin: 16px 0 0 0;
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
  }
  .header p {
    margin: 8px 0 0 0;
    color: #6b7280;
    font-size: 15px;
  }
  .content {
    padding: 0 32px 32px;
  }
  .field {
    margin-bottom: 16px;
    padding: 14px 16px;
    background: #f9fafb;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }
  .field-label {
    font-weight: 600;
    color: #0058be;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .field-value {
    color: #1f2937;
    font-size: 15px;
    font-weight: 500;
  }
  .field-value a {
    color: #0058be;
    text-decoration: none;
  }
  .use-cases {
    display: grid;
    gap: 6px;
    margin-top: 8px;
  }
  .use-case-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    background: white;
    border-radius: 6px;
    font-size: 14px;
    color: #374151;
  }
  .use-case-dot {
    width: 6px;
    height: 6px;
    background: #0058be;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .footer {
    padding: 20px 32px;
    text-align: center;
    font-size: 13px;
    color: #9ca3af;
    border-top: 1px solid #e5e7eb;
  }
  .footer a {
    color: #9ca3af;
    text-decoration: none;
  }
`

// Email sent to admin when someone requests access
export function getAdminNotificationEmail(data: AccessRequestData) {
  const useCasesFormatted = data.useCases.map(u => `  - ${u}`).join('\n')

  return {
    to: SUPER_ADMIN_EMAIL,
    subject: `New PMMSherpa Access Request: ${data.fullName}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${emailStyles}</style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <img src="${LOGO_URL}" alt="PMM Sherpa" width="48" height="48" style="border-radius: 10px;" />
                <h1>New Access Request</h1>
                <p>Someone wants to join PMM Sherpa</p>
              </div>
              <div class="content">
                <div class="field">
                  <div class="field-label">Full Name</div>
                  <div class="field-value">${data.fullName}</div>
                </div>
                <div class="field">
                  <div class="field-label">Email Address</div>
                  <div class="field-value">${data.email}</div>
                </div>
                ${data.phone ? `
                <div class="field">
                  <div class="field-label">Phone Number</div>
                  <div class="field-value">${data.phone}</div>
                </div>
                ` : ''}
                ${data.profession ? `
                <div class="field">
                  <div class="field-label">Profession</div>
                  <div class="field-value">${data.profession}</div>
                </div>
                ` : ''}
                ${data.company ? `
                <div class="field">
                  <div class="field-label">Company</div>
                  <div class="field-value">${data.company}</div>
                </div>
                ` : ''}
                ${data.linkedinUrl ? `
                <div class="field">
                  <div class="field-label">LinkedIn Profile</div>
                  <div class="field-value"><a href="${data.linkedinUrl}" target="_blank">${data.linkedinUrl}</a></div>
                </div>
                ` : ''}
                <div class="field">
                  <div class="field-label">Intended Use Cases</div>
                  <div class="use-cases">
                    ${data.useCases.map(u => `<div class="use-case-item"><span class="use-case-dot"></span>${u}</div>`).join('')}
                  </div>
                </div>
                <div style="text-align: center; margin-top: 28px;">
                  <p style="font-size: 14px; color: #6b7280; margin: 0 0 16px 0;">Click to approve or reject this user. They'll be unbanned and receive a welcome email automatically.</p>
                  <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                    <tr>
                      <td style="padding-right: 12px;">
                        <a href="${APP_URL}/api/approve-user?token=${data.approvalToken}&action=approve" class="button button-success" style="display: inline-block; background: #0058be; color: white !important; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 15px;">✓ Approve</a>
                      </td>
                      <td>
                        <a href="${APP_URL}/api/approve-user?token=${data.approvalToken}&action=reject" class="button button-outline" style="display: inline-block; background: white; color: #dc2626 !important; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 15px; border: 2px solid #e5e7eb;">✗ Reject</a>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
              <div class="footer">
                <p><a href="${APP_URL}">pmmsherpa.com</a></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
New PMMSherpa Access Request

Name: ${data.fullName}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}\n` : ''}${data.profession ? `Profession: ${data.profession}\n` : ''}${data.company ? `Company: ${data.company}\n` : ''}${data.linkedinUrl ? `LinkedIn: ${data.linkedinUrl}\n` : ''}
Use Cases:
${useCasesFormatted}

APPROVE OR REJECT:
Approve: ${APP_URL}/api/approve-user?token=${data.approvalToken}&action=approve
Reject: ${APP_URL}/api/approve-user?token=${data.approvalToken}&action=reject
    `.trim()
  }
}

// Email sent to user when their access is approved - they can now log in
export function getUserApprovalEmail(data: { fullName: string; email: string; passwordSetupLink: string }) {
  const firstName = data.fullName.split(' ')[0]

  return {
    to: data.email,
    subject: 'Your PMMSherpa Access is Approved!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${emailStyles}
            .header-approved {
              background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%);
            }
            .highlight {
              background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
              padding: 16px;
              border-radius: 12px;
              margin: 20px 0;
            }
            .email-highlight {
              font-weight: 600;
              color: #6366f1;
            }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header header-approved">
                <div class="logo">
                  <div class="logo-icon">✨</div>
                  <span class="logo-text">PMMSherpa</span>
                </div>
                <h1>You're In!</h1>
                <p>Your access to PMMSherpa has been approved</p>
              </div>
              <div class="content">
                <p style="font-size: 16px;">Hi ${firstName},</p>
                <p>Great news! Your access to PMMSherpa has been approved. You now have your own second brain for product marketing—expert knowledge, real-time research, and voice conversations at your fingertips.</p>

                <p><strong>You can now log in with the password you created during signup:</strong></p>

                <div class="buttons" style="margin: 28px 0;">
                  <a href="${data.passwordSetupLink}" class="button">Sign In to PMMSherpa →</a>
                </div>

                <div class="highlight">
                  <p style="margin: 0; font-size: 14px;">Log in with your email:</p>
                  <p style="margin: 8px 0 0 0;"><span class="email-highlight">${data.email}</span></p>
                </div>

                <div class="divider"></div>

                <p style="font-weight: 600; margin-bottom: 12px;">What you can do with PMMSherpa:</p>
                <div class="features">
                  <div class="feature-item">
                    <div class="feature-icon">🎯</div>
                    <div class="feature-text">Get expert advice on positioning and messaging strategy</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">⚔️</div>
                    <div class="feature-text">Create competitive battlecards and sales enablement content</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">🚀</div>
                    <div class="feature-text">Plan go-to-market strategies and product launches</div>
                  </div>
                  <div class="feature-item">
                    <div class="feature-icon">👥</div>
                    <div class="feature-text">Conduct customer research and build personas</div>
                  </div>
                </div>

                <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">Built on the collective wisdom of hundreds of leading PMM practitioners worldwide.</p>
              </div>
              <div class="footer">
                <p>Welcome to the PMMSherpa community!</p>
                <p style="margin-top: 8px;"><a href="${APP_URL}">pmmsherpa.com</a></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hi ${firstName},

Great news! Your access to PMMSherpa has been approved. You now have your own second brain for product marketing—expert knowledge, real-time research, and voice conversations at your fingertips.

You can now log in with the password you created during signup:
${data.passwordSetupLink}

Log in with your email: ${data.email}

What you can do with PMMSherpa:
- Get expert advice on positioning and messaging strategy
- Create competitive battlecards and sales enablement content
- Plan go-to-market strategies and product launches
- Conduct customer research and build personas

Built on the collective wisdom of hundreds of leading PMM practitioners worldwide.

Welcome to the PMMSherpa community!
    `.trim()
  }
}

// Welcome email draft for admin to send manually
export function getWelcomeEmailDraft(data: { fullName: string; email: string }) {
  const firstName = data.fullName.split(' ')[0]

  return {
    subject: '🚀 Welcome to PMMSherpa - Your AI Product Marketing Partner',
    body: `Hi ${firstName},

Welcome to PMMSherpa! I'm excited to have you on board.

PMMSherpa is your second brain for product marketing—combining 1,200+ expert resources with real-time market intelligence and voice conversations.

Here's what you can do with PMMSherpa:

🎯 Get expert advice on positioning and messaging strategy
⚔️ Create competitive battlecards and sales enablement content
🚀 Plan your go-to-market strategy and product launches
👥 Conduct customer research and build personas
📝 Generate content like blog posts, case studies, and email sequences

A few tips to get started:

1. Start with a specific question or task
2. Provide context about your product, market, and audience
3. Ask follow-up questions to refine the output
4. Save responses you find valuable for future reference

If you have any questions or feedback, just reply to this email - I'd love to hear from you!

Best,
Abhishek

P.S. Check out the "Try asking" suggestions on the chat page for inspiration!`
  }
}

// Celebratory welcome email sent when user is approved/unbanned
export function getCelebratoryWelcomeEmail(data: { fullName: string; email: string }) {
  const YOUTUBE_URL = 'https://youtu.be/i0YHeFcxI4U'

  return {
    to: data.email,
    subject: `You're approved — welcome to PMM Sherpa`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                  <!-- Logo -->
                  <tr>
                    <td align="center" style="padding: 32px 0 16px 0;">
                      <img src="https://pmmsherpa.com/email/logo-blue.png" alt="PMM Sherpa" width="56" height="56" style="border-radius: 12px;" />
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding: 0 40px 32px 40px;">
                      <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">Hey 👋</p>

                      <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">You signed up. That means more to me than you know. You're now approved to start using PMM Sherpa 🥳🚀</p>

                      <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">I've spent 16 years in product marketing at some of the most recognized companies in tech. And for most of that time, I had the same problem you probably have: the knowledge was there, but getting from brief to artifact quickly, without starting from zero every single time? That part never got easier.</p>

                      <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">So I built PMM Sherpa for myself.</p>

                      <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">Then I realized I wasn't the only one who needed it.</p>

                      <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 24px 0;">Before you dive in, I made a short video that shows exactly what Sherpa can do — positioning from scratch, a live battlecard build, and a head-to-head comparison with ChatGPT and Claude that will make a lot of sense the moment you see it.</p>

                      <!-- YouTube Thumbnail -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                        <tr>
                          <td align="center">
                            <a href="${YOUTUBE_URL}" target="_blank" style="display: block; text-decoration: none;">
                              <img src="https://pmmsherpa.com/email/yt-thumbnail.png" alt="Watch Walkthrough on YouTube" width="520" style="max-width: 100%; border-radius: 8px; display: block;" />
                            </a>
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="padding-top: 10px;">
                            <a href="${YOUTUBE_URL}" target="_blank" style="font-size: 14px; color: #0058be; text-decoration: none; font-weight: 500;">▶ Watch the demo — 5 minutes</a>
                          </td>
                        </tr>
                      </table>

                      <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;"><strong>Here's what I want you to do:</strong></p>

                      <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">Use it on a real problem. Not a test prompt, something you're actually working on right now. That's when it gets interesting.</p>

                      <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">Then tell me what happened.</p>

                      <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 20px 0;">What worked. What didn't. What you expected and what surprised you. I read every reply personally, and I genuinely mean that. You're here at the beginning, which means your feedback has an outsized impact on where this goes.</p>

                      <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 28px 0;">I want you to be successful. That's not a line, it's the whole reason this exists.</p>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center">
                            <a href="${APP_URL}/chat" style="display: inline-block; background-color: #0058be; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Try it now → pmmsherpa.com/chat</a>
                          </td>
                        </tr>
                      </table>

                      <!-- Sign off -->
                      <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 32px 0 4px 0;">With gratitude,</p>
                      <p style="font-size: 16px; color: #1f2937; margin: 0 0 4px 0;"><strong>Abhishek</strong></p>
                      <p style="font-size: 14px; color: #6b7280; margin: 0;"><a href="mailto:support@pmmsherpa.com" style="color: #6b7280; text-decoration: none;">support@pmmsherpa.com</a></p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
                      <p style="font-size: 13px; color: #9ca3af; margin: 0;"><a href="${APP_URL}" style="color: #9ca3af; text-decoration: none;">pmmsherpa.com</a></p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: `Hey 👋

You signed up. That means more to me than you know. You're now approved to start using PMM Sherpa 🥳🚀

I've spent 16 years in product marketing at some of the most recognized companies in tech. And for most of that time, I had the same problem you probably have: the knowledge was there, but getting from brief to artifact quickly, without starting from zero every single time? That part never got easier.

So I built PMM Sherpa for myself.

Then I realized I wasn't the only one who needed it.

Before you dive in, I made a short video that shows exactly what Sherpa can do — positioning from scratch, a live battlecard build, and a head-to-head comparison with ChatGPT and Claude that will make a lot of sense the moment you see it.

▶ Watch the demo — 5 minutes
${YOUTUBE_URL}

Here's what I want you to do:

Use it on a real problem. Not a test prompt, something you're actually working on right now. That's when it gets interesting.

Then tell me what happened.

What worked. What didn't. What you expected and what surprised you. I read every reply personally, and I genuinely mean that. You're here at the beginning, which means your feedback has an outsized impact on where this goes.

I want you to be successful. That's not a line, it's the whole reason this exists.

Try it now → ${APP_URL}/chat

With gratitude,
Abhishek
support@pmmsherpa.com`.trim()
  }
}

// Password reset email
export function getPasswordResetEmail(data: { fullName: string; email: string; resetLink: string }) {
  const firstName = data.fullName.split(' ')[0]

  return {
    to: data.email,
    subject: 'Reset Your PMMSherpa Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${emailStyles}</style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <div class="logo">
                  <div class="logo-icon">✨</div>
                  <span class="logo-text">PMMSherpa</span>
                </div>
                <h1>Password Reset</h1>
                <p>Let's get you back into your account</p>
              </div>
              <div class="content">
                <p style="font-size: 16px;">Hi ${firstName},</p>
                <p>We received a request to reset your password for your PMMSherpa account.</p>
                <p>Click the button below to create a new password:</p>

                <div class="buttons" style="margin: 28px 0;">
                  <a href="${data.resetLink}" class="button">Reset Password →</a>
                </div>

                <div class="note">
                  <strong>⏰ Note:</strong> This link will expire in 1 hour for security reasons. If you didn't request this reset, you can safely ignore this email.
                </div>

                <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="font-size: 12px; color: #6366f1; word-break: break-all;">${data.resetLink}</p>
              </div>
              <div class="footer">
                <p>Need help? Reply to this email and we'll assist you.</p>
                <p style="margin-top: 8px;"><a href="${APP_URL}">pmmsherpa.vercel.app</a></p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hi ${firstName},

We received a request to reset your password for your PMMSherpa account.

Click the link below to create a new password:
${data.resetLink}

Note: This link will expire in 1 hour for security reasons. If you didn't request this reset, you can safely ignore this email.

Need help? Reply to this email and we'll assist you.
    `.trim()
  }
}
