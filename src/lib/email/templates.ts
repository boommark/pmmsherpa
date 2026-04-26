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
    subject: `New PMMSherpa Signup: ${data.fullName}`,
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
                <h1>New User Signup</h1>
                <p>A new user has joined PMM Sherpa</p>
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
                  <p style="font-size: 14px; color: #16a34a; font-weight: 600; margin: 0;">Auto-approved — user can access chat immediately</p>
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
New PMMSherpa Signup (Auto-Approved)

Name: ${data.fullName}
Email: ${data.email}
${data.phone ? `Phone: ${data.phone}\n` : ''}${data.profession ? `Profession: ${data.profession}\n` : ''}${data.company ? `Company: ${data.company}\n` : ''}${data.linkedinUrl ? `LinkedIn: ${data.linkedinUrl}\n` : ''}
Use Cases:
${useCasesFormatted}
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

// Onboarding email — sent automatically on first profile completion.
// Two flavors: free (upgrade nudge) and starter (full access confirmation).
// Screenshots: upload to public/email/ — chat-home.png and guides.png
export function getOnboardingEmail(data: { fullName: string; email: string; referralCode: string; tier: 'free' | 'starter' }) {
  const referralLink = `${APP_URL}/signup?ref=${data.referralCode}`
  const isStarter = data.tier === 'starter'

  const CHAT_HOME_IMG = 'https://pmmsherpa.com/email/chat-home.png'
  const GUIDES_IMG = 'https://pmmsherpa.com/email/guides.png'

  const tierSection = isStarter ? `
    <!-- Starter: full access confirmation -->
    <tr>
      <td style="padding: 0 40px 28px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f0f6ff; border-radius: 10px; border: 1px solid #cce0ff;">
          <tr>
            <td style="padding: 20px 24px;">
              <p style="font-size: 13px; font-weight: 700; color: #0058be; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0;">Starter — Active</p>
              <p style="font-size: 15px; line-height: 1.6; color: #1f2937; margin: 0 0 10px 0;">200 messages per month. Every model — Claude Opus, Sonnet, Gemini. Live web research layered on top of the corpus for every response.</p>
              <p style="font-size: 14px; line-height: 1.7; color: #374151; margin: 0;">Use voice to think out loud — it works especially well when you're working through a positioning problem or a launch brief with a lot of moving pieces. Hit the mic in the chat bar and talk through it. Sherpa does the structuring.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  ` : `
    <!-- Free: upgrade nudge -->
    <tr>
      <td style="padding: 0 40px 28px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; border-radius: 10px; border: 1px solid #e5e7eb;">
          <tr>
            <td style="padding: 20px 24px;">
              <p style="font-size: 13px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0;">Starter — $9.99/month</p>
              <p style="font-size: 15px; line-height: 1.6; color: #1f2937; margin: 0 0 10px 0;">Free gives you 10 messages a month. Starter removes the ceiling: 200 messages, every model, and live web research on every response.</p>
              <p style="font-size: 14px; line-height: 1.6; color: #374151; margin: 0 0 12px 0;">When you're deep on a positioning brief or a launch plan, you don't want to watch a counter. Upgrade when the 10 messages aren't enough.</p>
              <a href="${APP_URL}/settings" style="font-size: 14px; color: #0058be; font-weight: 600; text-decoration: none;">Upgrade to Starter →</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `

  const referralSection = `
    <!-- Referral CTA -->
    <tr>
      <td style="padding: 0 40px 32px 40px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background: #f0f6ff; border-radius: 10px; border: 1px solid #cce0ff;">
          <tr>
            <td style="padding: 20px 24px;">
              <p style="font-size: 13px; font-weight: 700; color: #0058be; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 10px 0;">Refer 3 PMMs, earn a free month of Starter</p>
              <p style="font-size: 14px; line-height: 1.7; color: #374151; margin: 0 0 14px 0;">Know product marketers who are stuck on the same problems? Share your link. Every 3 people who sign up and complete their profile earns you 30 days of Starter — 200 messages, all models, live web research. Up to 90 days total.</p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background: #ffffff; border: 1px solid #cce0ff; border-radius: 8px; padding: 10px 16px;">
                    <p style="font-size: 13px; color: #0058be; font-family: monospace; margin: 0; word-break: break-all;">${referralLink}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `

  const gtmAreas = [
    'GTM Strategy — go-to-market planning and sequencing',
    'Positioning — differentiation and messaging hierarchy',
    'Launches — launch briefs, GTM readiness, expansion',
    'Pricing — strategy, tier design, competitive benchmarking',
    'Sales Enablement — battle cards, talk tracks, objection handling',
    'Asset Audits — landing pages, decks, messaging review',
    'Career Growth — interview prep, promotion narratives, strategy',
  ]

  const subject = isStarter ? 'Welcome to PMM Sherpa Starter' : 'Welcome to PMM Sherpa'

  const html = `
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
                    <img src="${LOGO_URL}" alt="PMM Sherpa" width="56" height="56" style="border-radius: 12px;" />
                  </td>
                </tr>
                <!-- Opening -->
                <tr>
                  <td style="padding: 0 40px 24px 40px;">
                    <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 16px 0;">Hi,</p>
                    <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 16px 0;">You're in. Welcome to PMM Sherpa.</p>
                    <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 16px 0;">Most conversations with generic AI start from zero. You explain your product, describe your market, establish context — and then hope the output isn't too shallow to use. Sherpa starts from a different place.</p>
                    <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0;">It's built on 38,000+ pieces of real PMM knowledge: April Dunford on positioning, Andy Raskin on strategic narrative, Elena Verna on PLG, 532 Sharebird AMAs from product marketers at Salesforce, Figma, Gong, Atlassian, and hundreds more. That knowledge is in every response — not cited at you, but woven into the advice.</p>
                  </td>
                </tr>
                <!-- Chat home screenshot -->
                <tr>
                  <td style="padding: 0 40px 28px 40px;">
                    <a href="${APP_URL}/chat" style="display: block; text-decoration: none;">
                      <img src="${CHAT_HOME_IMG}" alt="PMM Sherpa chat" width="520" style="max-width: 100%; border-radius: 10px; box-shadow: 0 4px 20px rgba(0, 88, 190, 0.12); display: block;" />
                    </a>
                  </td>
                </tr>
                <!-- Voice section -->
                <tr>
                  <td style="padding: 0 40px 24px 40px;">
                    <p style="font-size: 15px; font-weight: 700; color: #1f2937; margin: 0 0 10px 0;">Think out loud — Sherpa structures it</p>
                    <p style="font-size: 15px; line-height: 1.7; color: #374151; margin: 0;">The fastest way to use Sherpa is voice. Hit the mic in the chat bar and talk through the positioning problem you keep deferring, the battle card your sales team ignores, the launch brief with twelve open questions. You think out loud. Sherpa surfaces the relevant framework, the practitioner who's solved it, and a starting point you can actually use.</p>
                  </td>
                </tr>
                <!-- 7 GTM Areas -->
                <tr>
                  <td style="padding: 0 40px 24px 40px;">
                    <p style="font-size: 15px; font-weight: 700; color: #1f2937; margin: 0 0 14px 0;">7 areas covered:</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${gtmAreas.map(area => `
                      <tr>
                        <td style="padding: 7px 0; border-bottom: 1px solid #f3f4f6;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width: 16px; padding-top: 3px; vertical-align: top;">
                                <div style="width: 6px; height: 6px; background: #0058be; border-radius: 50%; margin-top: 1px;"></div>
                              </td>
                              <td style="font-size: 14px; color: #374151; line-height: 1.5;">${area}</td>
                            </tr>
                          </table>
                        </td>
                      </tr>`).join('')}
                    </table>
                  </td>
                </tr>
                <!-- Guides section with screenshot -->
                <tr>
                  <td style="padding: 0 40px 12px 40px;">
                    <p style="font-size: 15px; font-weight: 700; color: #1f2937; margin: 0 0 10px 0;">The fastest start: Guides</p>
                    <p style="font-size: 15px; line-height: 1.7; color: #374151; margin: 0 0 16px 0;">The <a href="${APP_URL}/guides" style="color: #0058be; text-decoration: none; font-weight: 600;">Guides section</a> has 21 ready-to-use prompts across all 7 areas, each with instructions on how to give Sherpa the right context. Use one on a real problem from this week.</p>
                    <a href="${APP_URL}/guides" style="display: block; text-decoration: none;">
                      <img src="${GUIDES_IMG}" alt="PMM Sherpa guides" width="520" style="max-width: 100%; border-radius: 10px; box-shadow: 0 4px 20px rgba(0, 88, 190, 0.12); display: block;" />
                    </a>
                  </td>
                </tr>
                <!-- Spacer -->
                <tr><td style="padding: 16px 0;"></td></tr>
                ${tierSection}
                ${referralSection}
                <!-- CTA -->
                <tr>
                  <td align="center" style="padding: 0 40px 32px 40px;">
                    <a href="${APP_URL}/chat" style="display: inline-block; background-color: #0058be; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Start your first conversation →</a>
                  </td>
                </tr>
                <!-- Sign off -->
                <tr>
                  <td style="padding: 0 40px 32px 40px;">
                    <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 4px 0;">With gratitude,</p>
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
  `

  const text = `Hi,

You're in. Welcome to PMM Sherpa.

Most conversations with generic AI start from zero. Sherpa starts from 38,000+ pieces of real PMM knowledge — April Dunford on positioning, Andy Raskin on narrative, Elena Verna on PLG, 532 Sharebird AMAs from PMMs at Salesforce, Figma, Gong, Atlassian, and hundreds more.

The fastest way to use it: voice. Hit the mic in the chat bar and talk through the problem. You think out loud. Sherpa structures it.

7 areas covered:
${gtmAreas.map(a => `- ${a}`).join('\n')}

The Guides section has 21 ready-to-use prompts across all 7 areas. Start there:
${APP_URL}/guides

${isStarter
  ? `Starter is active: 200 messages/month, every model, live web research on every response.`
  : `Free gives you 10 messages a month. Starter ($9.99/mo) removes the ceiling: 200 messages, every model, live web research: ${APP_URL}/settings`
}

Refer 3 PMMs, earn a free month of Starter (200 messages, all models, live web research):
${referralLink}

${APP_URL}/chat

With gratitude,
Abhishek
support@pmmsherpa.com`.trim()

  return { to: data.email, subject, html, text }
}

// Referral reward email — sent when a user crosses a 3-referral milestone.
// Tells them what they unlocked, when it was activated, and when it expires.
export function getReferralRewardEmail(data: {
  fullName: string
  email: string
  referralCount: number
  unlockedAt: string
  accessUntil: string
}) {
  const milestone = Math.floor(data.referralCount / 3)

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const unlockedFormatted = fmt(data.unlockedAt)
  const accessUntilFormatted = fmt(data.accessUntil)

  const html = `
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
                    <img src="${LOGO_URL}" alt="PMM Sherpa" width="56" height="56" style="border-radius: 12px;" />
                  </td>
                </tr>
                <!-- Opening -->
                <tr>
                  <td style="padding: 0 40px 24px 40px;">
                    <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 16px 0;">Hi,</p>
                    <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 16px 0;">${data.referralCount} people have signed up with your link. That's milestone ${milestone}.</p>
                    <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0;">You just earned 30 days of Starter access. It's active now.</p>
                  </td>
                </tr>
                <!-- Access details -->
                <tr>
                  <td style="padding: 0 40px 24px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f0f6ff; border-radius: 10px; border: 1px solid #cce0ff;">
                      <tr>
                        <td style="padding: 20px 24px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 6px 0; border-bottom: 1px solid #dbeafe;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="font-size: 13px; color: #6b7280;">Unlocked</td>
                                    <td align="right" style="font-size: 14px; font-weight: 600; color: #1f2937;">${unlockedFormatted}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 6px 0;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                  <tr>
                                    <td style="font-size: 13px; color: #6b7280;">Starter access until</td>
                                    <td align="right" style="font-size: 14px; font-weight: 600; color: #0058be;">${accessUntilFormatted}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- What Starter gives -->
                <tr>
                  <td style="padding: 0 40px 24px 40px;">
                    <p style="font-size: 15px; font-weight: 700; color: #1f2937; margin: 0 0 12px 0;">What you now have:</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 7px 0; border-bottom: 1px solid #f3f4f6;">
                          <table cellpadding="0" cellspacing="0"><tr>
                            <td style="width: 16px; padding-top: 3px; vertical-align: top;"><div style="width: 6px; height: 6px; background: #0058be; border-radius: 50%; margin-top: 1px;"></div></td>
                            <td style="font-size: 14px; color: #374151; line-height: 1.5;"><strong>200 messages per month</strong> — no more watching the counter mid-project</td>
                          </tr></table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0; border-bottom: 1px solid #f3f4f6;">
                          <table cellpadding="0" cellspacing="0"><tr>
                            <td style="width: 16px; padding-top: 3px; vertical-align: top;"><div style="width: 6px; height: 6px; background: #0058be; border-radius: 50%; margin-top: 1px;"></div></td>
                            <td style="font-size: 14px; color: #374151; line-height: 1.5;"><strong>Every model</strong> — Claude Opus, Sonnet, and Gemini, switch per task</td>
                          </tr></table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 7px 0;">
                          <table cellpadding="0" cellspacing="0"><tr>
                            <td style="width: 16px; padding-top: 3px; vertical-align: top;"><div style="width: 6px; height: 6px; background: #0058be; border-radius: 50%; margin-top: 1px;"></div></td>
                            <td style="font-size: 14px; color: #374151; line-height: 1.5;"><strong>Live web research</strong> — current competitor moves, recent pricing shifts, live market context layered on top of the corpus</td>
                          </tr></table>
                        </td>
                      </tr>
                    </table>
                    <p style="font-size: 14px; line-height: 1.7; color: #374151; margin: 14px 0 0 0;">The corpus doesn't change by tier — 38,000+ chunks are always there. Starter just removes the limits that would otherwise break your flow mid-project.</p>
                  </td>
                </tr>
                <!-- Voice reminder -->
                <tr>
                  <td style="padding: 0 40px 24px 40px;">
                    <p style="font-size: 14px; line-height: 1.7; color: #374151; margin: 0;">While you have full access: try voice. Hit the mic in the chat bar and talk through a positioning problem or a launch brief. Thinking out loud is faster than typing, and Sherpa structures what comes out. It's the feature that changes how people actually use the tool.</p>
                  </td>
                </tr>
                <!-- Referral progress -->
                <tr>
                  <td style="padding: 0 40px 24px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" style="background: #f9fafb; border-radius: 10px; border: 1px solid #e5e7eb;">
                      <tr>
                        <td style="padding: 16px 20px;">
                          <p style="font-size: 14px; line-height: 1.7; color: #6b7280; margin: 0;">Every 3 referrals earns another 30 days, up to 90 days total. ${data.referralCount < 6 ? `${6 - data.referralCount} more signups gets you milestone 2.` : data.referralCount < 9 ? `${9 - data.referralCount} more gets you milestone 3 — the maximum.` : `You've reached the maximum. Thank you for sharing Sherpa.`}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <!-- CTA -->
                <tr>
                  <td align="center" style="padding: 0 40px 32px 40px;">
                    <a href="${APP_URL}/chat" style="display: inline-block; background-color: #0058be; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">Go to PMM Sherpa →</a>
                  </td>
                </tr>
                <!-- Sign off -->
                <tr>
                  <td style="padding: 0 40px 32px 40px;">
                    <p style="font-size: 16px; line-height: 1.7; color: #1f2937; margin: 0 0 4px 0;">With gratitude,</p>
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
  `

  const text = `Hi,

${data.referralCount} people have signed up with your link. That's milestone ${milestone}. You just earned 30 days of Starter access — active now.

Unlocked: ${unlockedFormatted}
Starter access until: ${accessUntilFormatted}

What you now have:
- 200 messages per month
- Every model: Claude Opus, Sonnet, Gemini
- Live web research on every response

The corpus (38,000+ chunks) is always there regardless of tier. Starter removes the limits.

While you have full access: try voice. Hit the mic in the chat bar and talk through a positioning problem. Sherpa structures what comes out.

Every 3 referrals earns another 30 days, up to 90 days total.

${APP_URL}/chat

With gratitude,
Abhishek
support@pmmsherpa.com`.trim()

  return {
    to: data.email,
    subject: `You earned 30 days of Starter — active until ${accessUntilFormatted}`,
    html,
    text,
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
