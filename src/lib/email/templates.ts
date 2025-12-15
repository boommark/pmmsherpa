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

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://pmmsherpa.vercel.app'

// Common email styles for consistent branding
const emailStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #1f2937;
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%);
    margin: 0;
    padding: 20px;
  }
  .wrapper {
    max-width: 600px;
    margin: 0 auto;
  }
  .container {
    background: rgba(255, 255, 255, 0.9);
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(255, 255, 255, 0.5);
  }
  .header {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
    color: white;
    padding: 40px 30px;
    text-align: center;
  }
  .logo {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 16px;
  }
  .logo-icon {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .logo-text {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  .header h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  .header p {
    margin: 12px 0 0 0;
    opacity: 0.9;
    font-size: 16px;
  }
  .content {
    padding: 32px;
  }
  .field {
    margin-bottom: 20px;
    padding: 16px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
    border-radius: 12px;
    border: 1px solid rgba(99, 102, 241, 0.1);
  }
  .field-label {
    font-weight: 600;
    color: #6366f1;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
  }
  .field-value {
    color: #1f2937;
    font-size: 15px;
    font-weight: 500;
  }
  .field-value a {
    color: #6366f1;
    text-decoration: none;
  }
  .field-value a:hover {
    text-decoration: underline;
  }
  .use-cases {
    display: grid;
    gap: 8px;
    margin-top: 8px;
  }
  .use-case-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: white;
    border-radius: 8px;
    font-size: 14px;
    color: #374151;
  }
  .use-case-dot {
    width: 6px;
    height: 6px;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    border-radius: 50%;
    flex-shrink: 0;
  }
  .button {
    display: inline-block;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white !important;
    text-decoration: none;
    padding: 16px 32px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 15px;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);
  }
  .button-success {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
  }
  .button-outline {
    background: white;
    color: #6366f1 !important;
    border: 2px solid #e5e7eb;
    box-shadow: none;
  }
  .buttons {
    text-align: center;
    margin-top: 28px;
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }
  .note {
    background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.1) 100%);
    border: 1px solid rgba(245, 158, 11, 0.3);
    padding: 16px;
    border-radius: 12px;
    margin-top: 24px;
    font-size: 14px;
    color: #92400e;
  }
  .note strong {
    color: #78350f;
  }
  .features {
    margin: 24px 0;
  }
  .feature-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #f3f4f6;
  }
  .feature-item:last-child {
    border-bottom: none;
  }
  .feature-icon {
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: #6366f1;
    font-size: 12px;
  }
  .feature-text {
    font-size: 14px;
    color: #374151;
  }
  .footer {
    padding: 24px 32px;
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%);
    text-align: center;
    font-size: 13px;
    color: #6b7280;
    border-top: 1px solid rgba(99, 102, 241, 0.1);
  }
  .footer a {
    color: #6366f1;
    text-decoration: none;
  }
  .divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.2), transparent);
    margin: 24px 0;
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
                <div class="logo">
                  <div class="logo-icon">✨</div>
                  <span class="logo-text">PMMSherpa</span>
                </div>
                <h1>New Access Request</h1>
                <p>Someone wants to join PMMSherpa</p>
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
                <div class="note" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%); border: 1px solid rgba(16, 185, 129, 0.3); color: #065f46;">
                  <strong>How to approve this user:</strong>
                  <ol style="margin: 12px 0 0 0; padding-left: 20px; font-size: 14px; line-height: 1.8;">
                    <li>Click the green "Approve in Supabase" button below</li>
                    <li>You'll see the user <strong>${data.email}</strong> in the list (already filtered)</li>
                    <li>Click on the user row to open their details panel on the right</li>
                    <li>Scroll down in the panel and look for <strong>"User banned until..."</strong></li>
                    <li>Click the <strong>"Remove ban"</strong> button to activate their account</li>
                    <li>The user can now log in with the password they set during signup!</li>
                  </ol>
                  <p style="margin-top: 12px; font-size: 13px; color: #047857;"><strong>Note:</strong> The user already set their password when requesting access. Once you remove the ban, they can immediately log in at <a href="${APP_URL}/login" style="color: #047857;">${APP_URL}/login</a></p>
                </div>
                <div class="buttons">
                  <a href="https://supabase.com/dashboard/project/nhwcpjfjsjsslxuqpuoy/auth/users?search=${encodeURIComponent(data.email)}" class="button button-success">✓ Approve in Supabase</a>
                  <a href="${APP_URL}/admin/requests" class="button button-outline">View All Requests</a>
                </div>
              </div>
              <div class="footer">
                <p>This notification was sent from <a href="${APP_URL}">PMMSherpa</a></p>
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

HOW TO APPROVE:
1. Click the Supabase link below
2. Search for ${data.email}
3. Click on the user row
4. Click "Remove ban" to activate their account

Approve in Supabase: https://supabase.com/dashboard/project/nhwcpjfjsjsslxuqpuoy/auth/users?search=${encodeURIComponent(data.email)}
View All Requests: ${APP_URL}/admin/requests
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
