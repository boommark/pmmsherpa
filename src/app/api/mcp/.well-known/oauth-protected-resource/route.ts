/**
 * RFC 9728 — OAuth 2.0 Protected Resource Metadata.
 *
 * The MCP transport at /api/mcp returns
 *   WWW-Authenticate: Bearer resource_metadata="<this URL>"
 * on a 401, and clients fetch this document to discover the authorization
 * server (us, since we wrap Supabase Auth).
 */

import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, '') ??
    'https://pmmsherpa.com'
  )
}

export async function GET() {
  const base = appUrl()
  return NextResponse.json(
    {
      resource: `${base}/api/mcp`,
      authorization_servers: [base],
      bearer_methods_supported: ['header'],
      resource_documentation: `${base}/docs/mcp`,
      scopes_supported: ['mcp:read', 'mcp:query', 'offline_access'],
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    },
  )
}
