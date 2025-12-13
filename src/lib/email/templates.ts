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
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
            .field { margin-bottom: 16px; }
            .field-label { font-weight: 600; color: #6b7280; font-size: 12px; text-transform: uppercase; margin-bottom: 4px; }
            .field-value { color: #111827; font-size: 14px; }
            .use-cases { background: white; padding: 12px; border-radius: 8px; margin-top: 8px; }
            .use-case-item { padding: 4px 0; }
            .button { display: inline-block; background: #22c55e; color: white !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 10px 5px; }
            .button-secondary { background: #6366f1; }
            .buttons { text-align: center; margin-top: 24px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">New Access Request</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Someone wants to join PMMSherpa</p>
            </div>
            <div class="content">
              <div class="field">
                <div class="field-label">Name</div>
                <div class="field-value">${data.fullName}</div>
              </div>
              <div class="field">
                <div class="field-label">Email</div>
                <div class="field-value">${data.email}</div>
              </div>
              ${data.phone ? `
              <div class="field">
                <div class="field-label">Phone</div>
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
                <div class="field-label">LinkedIn</div>
                <div class="field-value"><a href="${data.linkedinUrl}">${data.linkedinUrl}</a></div>
              </div>
              ` : ''}
              <div class="field">
                <div class="field-label">Use Cases</div>
                <div class="use-cases">
                  ${data.useCases.map(u => `<div class="use-case-item">${u}</div>`).join('')}
                </div>
              </div>
              <div class="buttons">
                <a href="${APP_URL}/admin/approve?token=${data.approvalToken}" class="button">Approve Access</a>
                <a href="${APP_URL}/admin/requests" class="button button-secondary">View All Requests</a>
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

Approve Access: ${APP_URL}/admin/approve?token=${data.approvalToken}
View All Requests: ${APP_URL}/admin/requests
    `.trim()
  }
}

// Email sent to user when their access is approved - includes password setup link
export function getUserApprovalEmail(data: { fullName: string; email: string; passwordSetupLink: string }) {
  return {
    to: data.email,
    subject: 'Your PMMSherpa Access is Approved! Set Up Your Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
            .button { display: inline-block; background: #6366f1; color: white !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; }
            .buttons { text-align: center; margin-top: 24px; }
            .note { background: #fef3c7; border: 1px solid #f59e0b; padding: 12px; border-radius: 8px; margin-top: 20px; font-size: 14px; color: #92400e; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0; font-size: 24px;">You're In!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your access to PMMSherpa has been approved</p>
            </div>
            <div class="content">
              <p>Hi ${data.fullName},</p>
              <p>Great news! Your access to PMMSherpa has been approved.</p>
              <p>To get started, please set up your password by clicking the button below:</p>
              <div class="buttons">
                <a href="${data.passwordSetupLink}" class="button">Set Up Your Password</a>
              </div>
              <div class="note">
                <strong>Note:</strong> This link will expire in 24 hours. If it expires, you can request a new one from the login page using "Forgot password".
              </div>
              <p style="margin-top: 24px;">Once you've set your password, you can log in with your email: <strong>${data.email}</strong></p>
              <p>PMMSherpa is your AI-powered product marketing assistant, drawing from 1,280+ expert sources to help you with positioning, messaging, go-to-market strategy, and more.</p>
              <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">Welcome to the PMMSherpa community!</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
Hi ${data.fullName},

Great news! Your access to PMMSherpa has been approved.

To get started, please set up your password by visiting this link:
${data.passwordSetupLink}

Note: This link will expire in 24 hours. If it expires, you can request a new one from the login page using "Forgot password".

Once you've set your password, you can log in with your email: ${data.email}

Welcome to the PMMSherpa community!
    `.trim()
  }
}

// Welcome email draft for admin to send manually
export function getWelcomeEmailDraft(data: { fullName: string; email: string }) {
  const firstName = data.fullName.split(' ')[0]

  return {
    subject: 'Welcome to PMMSherpa - Your AI Product Marketing Partner',
    body: `Hi ${firstName},

Welcome to PMMSherpa! I'm excited to have you on board.

PMMSherpa is your AI-powered product marketing assistant, built from 1,280+ expert sources including PMM books, blogs, and AMAs from top product marketers.

Here's what you can do with PMMSherpa:

- Get expert advice on positioning and messaging strategy
- Create competitive battlecards and sales enablement content
- Plan your go-to-market strategy and product launches
- Conduct customer research and build personas
- Generate content like blog posts, case studies, and email sequences

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
