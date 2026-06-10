/**
 * Pinned-tier token cap logic.
 *
 * The cap is enforced server-side in two places (document PATCH pin, text-doc
 * create with tier='pinned') — both delegate to canPinDocument, tested here.
 */

import { describe, it, expect } from 'vitest'
import { canPinDocument, PINNED_TIER_TOKEN_CAP } from '../limits'

describe('canPinDocument', () => {
  it('allows pinning when well under the cap', () => {
    expect(canPinDocument(0, 5_000)).toEqual({ ok: true })
    expect(canPinDocument(10_000, 5_000)).toEqual({ ok: true })
  })

  it('allows pinning exactly up to the cap', () => {
    expect(canPinDocument(PINNED_TIER_TOKEN_CAP - 1_000, 1_000)).toEqual({ ok: true })
    expect(canPinDocument(0, PINNED_TIER_TOKEN_CAP)).toEqual({ ok: true })
  })

  it('rejects pinning that would exceed the cap', () => {
    const result = canPinDocument(PINNED_TIER_TOKEN_CAP - 1_000, 1_001)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reason).toContain(PINNED_TIER_TOKEN_CAP.toLocaleString())
    }
  })

  it('rejects a single document larger than the whole cap', () => {
    const result = canPinDocument(0, PINNED_TIER_TOKEN_CAP + 1)
    expect(result.ok).toBe(false)
  })

  it('allows a zero-token document (edge case)', () => {
    expect(canPinDocument(PINNED_TIER_TOKEN_CAP, 0)).toEqual({ ok: true })
  })

  it('rejects negative inputs defensively', () => {
    expect(canPinDocument(-1, 100).ok).toBe(false)
    expect(canPinDocument(100, -1).ok).toBe(false)
  })
})
