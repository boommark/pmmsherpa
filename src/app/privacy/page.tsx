import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for PMMSherpa, operated by DBAR LLC.',
}

const EFFECTIVE_DATE = 'April 22, 2026'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#111418] text-[#191c1e] dark:text-[#e2e4e8]">
      <header className="border-b border-[#f0f2f5] dark:border-[#2a2d32]">
        <div className="max-w-3xl mx-auto px-5 md:px-8 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#0058be] to-[#2170e4]" />
            <span className="font-medium">PMMSherpa</span>
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Back to home
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-5 md:px-8 py-10 md:py-14">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Effective: {EFFECTIVE_DATE}</p>

        <div className="space-y-8 text-[15px] leading-relaxed text-[#3f4246] dark:text-[#c7cad0]">
          <section>
            <p>
              This Privacy Policy explains how <strong>DBAR LLC</strong>, doing business as &ldquo;PMMSHERPA&rdquo;
              (&ldquo;<strong>we</strong>,&rdquo; &ldquo;<strong>us</strong>,&rdquo; or &ldquo;<strong>our</strong>&rdquo;),
              collects, uses, and shares information when you use PMMSherpa (the &ldquo;<strong>Service</strong>&rdquo;).
              If you have questions, email{' '}
              <a href="mailto:support@pmmsherpa.com" className="text-[#0058be] dark:text-[#a8c0f0] hover:underline">
                support@pmmsherpa.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#191c1e] dark:text-[#e2e4e8] mb-3">1. Information We Collect</h2>

            <h3 className="font-semibold mt-4 mb-2">Information you provide</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account information:</strong> name, email address, and password (stored as a hash by our authentication provider) or Google OAuth identifier.</li>
              <li><strong>Profile information:</strong> your LinkedIn URL and your consent to receive product and promotional communications.</li>
              <li><strong>Chat content:</strong> messages, file uploads, URLs, and other inputs you submit, together with the AI-generated responses.</li>
              <li><strong>Billing information:</strong> when you subscribe, Stripe collects and processes your payment details. We receive only a customer identifier, subscription status, and the last four digits of your card.</li>
              <li><strong>Support communications:</strong> messages you send to support@pmmsherpa.com.</li>
            </ul>

            <h3 className="font-semibold mt-5 mb-2">Information we collect automatically</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Usage data:</strong> model used, input and output token counts, latency, feature interactions, and timestamps.</li>
              <li><strong>Device and log data:</strong> IP address, browser type, device type, pages viewed, and referrer.</li>
              <li><strong>Cookies and similar technologies:</strong> used to keep you signed in, remember preferences, and for product analytics (see Section 5).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#191c1e] dark:text-[#e2e4e8] mb-3">2. How We Use Information</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, operate, and improve the Service, including generating responses to your queries.</li>
              <li>To authenticate you, manage your account, and enforce usage limits.</li>
              <li>To process payments and send subscription-related notices.</li>
              <li>To send transactional email (welcome messages, password resets, billing receipts) and, if you consented, product and promotional updates. You can opt out of promotional email at any time.</li>
              <li>To monitor, secure, and prevent abuse of the Service.</li>
              <li>To comply with legal obligations and enforce our{' '}
                <Link href="/terms" className="text-[#0058be] dark:text-[#a8c0f0] hover:underline">Terms of Service</Link>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#191c1e] dark:text-[#e2e4e8] mb-3">3. How We Share Information &mdash; Sub-processors</h2>
            <p className="mb-3">
              We do not sell your personal information. We share information with the following service
              providers (&ldquo;sub-processors&rdquo;) only as needed to operate the Service:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-[#e5e7eb] dark:border-[#3a3d42] rounded-lg overflow-hidden">
                <thead className="bg-[#f6f8fc] dark:bg-[#1e2125]">
                  <tr>
                    <th className="text-left px-4 py-2 font-semibold">Provider</th>
                    <th className="text-left px-4 py-2 font-semibold">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#3a3d42]">
                  <tr><td className="px-4 py-2">Supabase</td><td className="px-4 py-2">Hosting, authentication, and database</td></tr>
                  <tr><td className="px-4 py-2">Vercel</td><td className="px-4 py-2">Application hosting and delivery</td></tr>
                  <tr><td className="px-4 py-2">Anthropic</td><td className="px-4 py-2">Claude large-language model inference</td></tr>
                  <tr><td className="px-4 py-2">Google</td><td className="px-4 py-2">Gemini model inference and Google OAuth</td></tr>
                  <tr><td className="px-4 py-2">OpenAI</td><td className="px-4 py-2">Text embeddings for knowledge retrieval</td></tr>
                  <tr><td className="px-4 py-2">Perplexity</td><td className="px-4 py-2">Real-time web research</td></tr>
                  <tr><td className="px-4 py-2">Brave Search</td><td className="px-4 py-2">Web search results</td></tr>
                  <tr><td className="px-4 py-2">Stripe</td><td className="px-4 py-2">Payment processing and subscription management</td></tr>
                  <tr><td className="px-4 py-2">Resend</td><td className="px-4 py-2">Transactional and product email delivery</td></tr>
                  <tr><td className="px-4 py-2">PostHog</td><td className="px-4 py-2">Product analytics and error monitoring</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              We may also disclose information (a) to comply with a lawful request or court order, (b) to protect
              the rights, property, or safety of users, the public, or DBAR LLC, or (c) as part of a merger,
              acquisition, or sale of assets, with notice to affected users.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#191c1e] dark:text-[#e2e4e8] mb-3">4. AI Model Training</h2>
            <p>
              <strong>We do not train AI models on your content, and we do not allow our AI providers to train their
              models on your inputs or outputs.</strong> Anthropic, Google, and OpenAI process your content under
              their API terms, which prohibit use of API data for model training. We may use aggregated, de-identified
              usage data (such as counts, latency, and feature usage) to operate and improve the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#191c1e] dark:text-[#e2e4e8] mb-3">5. Cookies and Analytics</h2>
            <p>
              We use strictly necessary cookies to keep you signed in, remember preferences (such as theme and model
              choice), and secure the Service. We use PostHog to measure product usage and diagnose errors; this may
              set cookies or use similar storage. You can control cookies through your browser settings; disabling
              non-essential storage may affect functionality.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#191c1e] dark:text-[#e2e4e8] mb-3">6. Data Retention</h2>
            <p>
              We retain your account data and chat history for as long as your account is active. If you delete
              your account, we delete or anonymize personal data within 90 days, except where we are required to
              retain it for legal, tax, accounting, or fraud-prevention purposes. Aggregated, de-identified data
              may be retained indefinitely.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#191c1e] dark:text-[#e2e4e8] mb-3">7. Your Choices and Rights</h2>
            <p className="mb-3">You can:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Access, update, or correct your profile from your account settings.</li>
              <li>Delete specific conversations from your chat history.</li>
              <li>Export a copy of your data by emailing{' '}
                <a href="mailto:support@pmmsherpa.com" className="text-[#0058be] dark:text-[#a8c0f0] hover:underline">support@pmmsherpa.com</a>.
              </li>
              <li>Close your account and request deletion of your personal data.</li>
              <li>Opt out of promotional email via the unsubscribe link in any message.</li>
            </ul>
            <p className="mt-3">
              Depending on where you live, you may have additional rights under laws such as the California
              Consumer Privacy Act (CCPA) or the EU/UK General Data Protection Regulation (GDPR), including the
              right to access, delete, correct, or port your data, or to object to or restrict certain processing.
              To exercise these rights, email{' '}
              <a href="mailto:support@pmmsherpa.com" className="text-[#0058be] dark:text-[#a8c0f0] hover:underline">
                support@pmmsherpa.com
              </a>
              . We do not &ldquo;sell&rdquo; personal information as defined under the CCPA.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#191c1e] dark:text-[#e2e4e8] mb-3">8. International Users</h2>
            <p>
              The Service is operated from the United States. If you access the Service from outside the U.S.,
              you understand that your information will be transferred to, stored, and processed in the U.S. by
              us and our sub-processors. Where required, transfers from the EU/UK rely on Standard Contractual
              Clauses or equivalent safeguards with our sub-processors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#191c1e] dark:text-[#e2e4e8] mb-3">9. Children</h2>
            <p>
              The Service is not directed to children under 18, and we do not knowingly collect personal
              information from anyone under 18. If you believe a child has provided us personal information,
              email{' '}
              <a href="mailto:support@pmmsherpa.com" className="text-[#0058be] dark:text-[#a8c0f0] hover:underline">
                support@pmmsherpa.com
              </a>{' '}
              and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#191c1e] dark:text-[#e2e4e8] mb-3">10. Security</h2>
            <p>
              We use encryption in transit (TLS), encrypted storage, access controls, and reputable cloud
              infrastructure to protect your data. No system is perfectly secure; if we become aware of a
              breach affecting your personal information, we will notify you as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#191c1e] dark:text-[#e2e4e8] mb-3">11. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. If changes are material, we will notify you
              by email or in-product notice. The &ldquo;Effective&rdquo; date at the top indicates the latest revision.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-[#191c1e] dark:text-[#e2e4e8] mb-3">12. Contact</h2>
            <p>
              Questions, requests, or privacy concerns? Email{' '}
              <a href="mailto:support@pmmsherpa.com" className="text-[#0058be] dark:text-[#a8c0f0] hover:underline">
                support@pmmsherpa.com
              </a>
              .
            </p>
            <p className="mt-3 text-sm text-muted-foreground">
              DBAR LLC d/b/a PMMSHERPA &middot; State of Washington, U.S.A.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-[#f0f2f5] dark:border-[#2a2d32] flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
          <a href="mailto:support@pmmsherpa.com" className="hover:text-foreground">Contact Us</a>
          <Link href="/" className="hover:text-foreground">Home</Link>
        </div>
      </main>
    </div>
  )
}
