/**
 * GET /api/cron/schedule-pending-broadcasts
 *
 * Daily cron endpoint (Vercel Cron) that schedules any onboarding-series
 * broadcasts that are now within Resend's 30-day scheduling window.
 *
 * Background: Resend's `broadcasts.send({ scheduledAt })` rejects timestamps
 * more than 30 days in the future (422 validation_error). For multi-month
 * campaigns we create the broadcast objects up front (they become drafts)
 * and rely on this cron to flip each one to scheduled once its target send
 * date falls inside the 30-day window.
 *
 * Adding a new pending broadcast: append to PENDING_BROADCASTS below with
 * its Resend broadcast id and target ISO scheduled_at. The job is
 * idempotent — once Resend reports status !== 'draft', the entry is
 * skipped on subsequent runs.
 *
 * Auth: optional CRON_SECRET (matches /api/cron/reset-monthly-credits).
 */

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PENDING_BROADCASTS = [
  // Onboarding series — created 2026-06-07
  { id: '196b121b-3ce7-49ba-8ff9-52e6cf662abc', scheduledAt: '2026-07-21T14:00:00Z', label: 'Onboarding Day 4 (Tue 2026-07-21 07:00 PT)' },
  { id: '359707aa-8c7b-4812-931f-e34c934d26de', scheduledAt: '2026-08-04T14:00:00Z', label: 'Onboarding Day 5 (Tue 2026-08-04 07:00 PT)' },
  { id: '5e15aaf2-7c4a-4fa4-8d9b-b37a7b75a981', scheduledAt: '2026-08-18T14:00:00Z', label: 'Onboarding Day 6 (Tue 2026-08-18 07:00 PT)' },
  { id: '0cc59b83-56b9-49a1-beb7-62b5b588d7c1', scheduledAt: '2026-09-02T14:00:00Z', label: 'Onboarding Day 7 (Wed 2026-09-02 07:00 PT)' },
]

// Stay a day inside the Resend 30-day window so a clock-skew between Vercel
// and Resend can't push us to the wrong side of the cutoff.
const SCHEDULE_WITHIN_DAYS = 29

interface ScheduleResult {
  id: string
  label: string
  scheduledAt: string
  action: 'scheduled' | 'already-handled' | 'too-far-out' | 'past-due' | 'error'
  detail?: string
}

export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET
  if (expected) {
    const auth = request.headers.get('authorization') ?? ''
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
  }
  const resend = new Resend(apiKey)

  const now = Date.now()
  const windowMs = SCHEDULE_WITHIN_DAYS * 24 * 60 * 60 * 1000
  const results: ScheduleResult[] = []

  for (const entry of PENDING_BROADCASTS) {
    const targetTs = Date.parse(entry.scheduledAt)
    const msUntil = targetTs - now

    if (msUntil <= 0) {
      results.push({ ...entry, action: 'past-due', detail: 'target time has already passed' })
      continue
    }
    if (msUntil > windowMs) {
      results.push({ ...entry, action: 'too-far-out', detail: `${Math.round(msUntil / (24 * 60 * 60 * 1000))} days out` })
      continue
    }

    // Within window — check current status (idempotency)
    const status = await resend.broadcasts.get(entry.id)
    if (status.error) {
      results.push({ ...entry, action: 'error', detail: `get failed: ${status.error.message ?? 'unknown'}` })
      continue
    }
    const currentStatus = status.data?.status
    if (currentStatus && currentStatus !== 'draft') {
      results.push({ ...entry, action: 'already-handled', detail: `status=${currentStatus}` })
      continue
    }

    // Draft + within window → schedule it.
    const scheduled = await resend.broadcasts.send(entry.id, { scheduledAt: entry.scheduledAt })
    if (scheduled.error) {
      results.push({ ...entry, action: 'error', detail: `schedule failed: ${scheduled.error.message ?? 'unknown'}` })
      continue
    }
    results.push({ ...entry, action: 'scheduled' })
  }

  const scheduledCount = results.filter((r) => r.action === 'scheduled').length
  const errorCount = results.filter((r) => r.action === 'error').length

  return NextResponse.json({
    ok: errorCount === 0,
    checked: results.length,
    scheduled: scheduledCount,
    errors: errorCount,
    results,
  })
}
