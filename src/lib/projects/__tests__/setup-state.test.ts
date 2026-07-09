import { describe, it, expect } from 'vitest'
import {
  advanceSetupStep,
  currentSetupStep,
  defaultSetupState,
  isSetupComplete,
  normalizeSetupState,
  resolvedStepCount,
  validateSetupState,
  SETUP_STATE_MAX_JSON_LENGTH,
  type SetupState,
} from '../setup-state'

function state(overrides: Partial<SetupState> = {}): SetupState {
  return { ...defaultSetupState(), ...overrides }
}

describe('validateSetupState (PATCH gate)', () => {
  it('accepts a full valid state', () => {
    const result = validateSetupState({
      version: 1,
      steps: { describe: 'completed', instructions: 'skipped', documents: 'pending' },
      dismissed: false,
      completed_at: null,
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.state.steps.describe).toBe('completed')
      expect(result.state.steps.instructions).toBe('skipped')
      expect(result.state.dismissed).toBe(false)
      expect(result.state.completed_at).toBeNull()
    }
  })

  it('fills missing steps with pending and defaults dismissed', () => {
    const result = validateSetupState({ version: 1, steps: { describe: 'completed' } })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.state.steps.instructions).toBe('pending')
      expect(result.state.steps.documents).toBe('pending')
      expect(result.state.dismissed).toBe(false)
      expect(result.state.completed_at).toBeNull()
    }
  })

  it('accepts an ISO completed_at and dismissed true', () => {
    const result = validateSetupState({
      version: 1,
      steps: {},
      dismissed: true,
      completed_at: '2026-07-09T12:00:00.000Z',
    })
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.state.dismissed).toBe(true)
      expect(result.state.completed_at).toBe('2026-07-09T12:00:00.000Z')
    }
  })

  it.each([null, undefined, 'string', 42, [], true])('rejects non-object %s', (value) => {
    expect(validateSetupState(value).ok).toBe(false)
  })

  it('rejects a wrong version', () => {
    const result = validateSetupState({ version: 2, steps: {} })
    expect(result).toEqual({ ok: false, error: 'setup_state.version must be 1' })
  })

  it('rejects missing version', () => {
    expect(validateSetupState({ steps: {} }).ok).toBe(false)
  })

  it('rejects unknown top-level keys', () => {
    const result = validateSetupState({ version: 1, steps: {}, extra: true })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain("unknown key 'extra'")
  })

  it('rejects unknown step names', () => {
    const result = validateSetupState({ version: 1, steps: { publish: 'pending' } })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain("unknown step 'publish'")
  })

  it('rejects invalid step statuses', () => {
    const result = validateSetupState({ version: 1, steps: { describe: 'done' } })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('setup_state.steps.describe')
  })

  it('rejects non-object steps', () => {
    expect(validateSetupState({ version: 1, steps: 'nope' }).ok).toBe(false)
    expect(validateSetupState({ version: 1, steps: ['describe'] }).ok).toBe(false)
  })

  it('rejects non-boolean dismissed', () => {
    const result = validateSetupState({ version: 1, steps: {}, dismissed: 'yes' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('dismissed')
  })

  it('rejects a non-timestamp completed_at', () => {
    const result = validateSetupState({ version: 1, steps: {}, completed_at: 'later' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('completed_at')
  })

  it('rejects oversized payloads', () => {
    const result = validateSetupState({
      version: 1,
      steps: {},
      completed_at: 'x'.repeat(SETUP_STATE_MAX_JSON_LENGTH),
    })
    expect(result).toEqual({ ok: false, error: 'setup_state payload is too large' })
  })
})

describe('normalizeSetupState', () => {
  it('returns the default state for null / undefined / junk', () => {
    for (const value of [null, undefined, 'x', 7, [], { version: 3 }]) {
      expect(normalizeSetupState(value)).toEqual(defaultSetupState())
    }
  })

  it('keeps valid fields and repairs invalid ones', () => {
    const normalized = normalizeSetupState({
      version: 1,
      steps: { describe: 'completed', instructions: 'nonsense' },
      dismissed: 'true',
      completed_at: null,
    })
    expect(normalized.steps.describe).toBe('completed')
    expect(normalized.steps.instructions).toBe('pending')
    expect(normalized.steps.documents).toBe('pending')
    expect(normalized.dismissed).toBe(false)
  })
})

describe('step progression helpers', () => {
  it('currentSetupStep walks steps in order', () => {
    let s = state()
    expect(currentSetupStep(s)).toBe('describe')
    s = advanceSetupStep(s, 'describe', 'completed')
    expect(currentSetupStep(s)).toBe('instructions')
    s = advanceSetupStep(s, 'instructions', 'skipped')
    expect(currentSetupStep(s)).toBe('documents')
    s = advanceSetupStep(s, 'documents', 'completed')
    expect(currentSetupStep(s)).toBeNull()
  })

  it('resolvedStepCount counts completed and skipped steps', () => {
    let s = state()
    expect(resolvedStepCount(s)).toBe(0)
    s = advanceSetupStep(s, 'instructions', 'skipped')
    expect(resolvedStepCount(s)).toBe(1)
    s = advanceSetupStep(s, 'describe', 'completed')
    expect(resolvedStepCount(s)).toBe(2)
  })

  it('advanceSetupStep stamps completed_at only when every step resolves', () => {
    let s = advanceSetupStep(state(), 'describe', 'completed')
    expect(s.completed_at).toBeNull()
    expect(isSetupComplete(s)).toBe(false)
    s = advanceSetupStep(s, 'instructions', 'completed')
    s = advanceSetupStep(s, 'documents', 'skipped')
    expect(isSetupComplete(s)).toBe(true)
    expect(s.completed_at).toBeTruthy()
    expect(Number.isNaN(Date.parse(s.completed_at as string))).toBe(false)
  })

  it('advanceSetupStep preserves an existing completed_at', () => {
    const done = advanceSetupStep(
      advanceSetupStep(advanceSetupStep(state(), 'describe', 'completed'), 'instructions', 'completed'),
      'documents',
      'completed',
    )
    const stamped = done.completed_at
    const again = advanceSetupStep(done, 'documents', 'skipped')
    expect(again.completed_at).toBe(stamped)
  })

  it('advanceSetupStep does not mutate its input', () => {
    const original = state()
    advanceSetupStep(original, 'describe', 'completed')
    expect(original.steps.describe).toBe('pending')
  })
})
