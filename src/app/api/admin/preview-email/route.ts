import { NextRequest, NextResponse } from 'next/server'
import { getCelebratoryWelcomeEmail } from '@/lib/email/templates'

/**
 * Preview the celebratory welcome email in browser
 * Visit: /api/admin/preview-email
 */
export async function GET(request: NextRequest) {
  const email = getCelebratoryWelcomeEmail({
    fullName: 'John Smith',
    email: 'john.smith@example.com',
  })

  return new NextResponse(email.html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}
