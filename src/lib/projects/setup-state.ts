/**
 * Setup-state model for the interactive project setup assistant.
 *
 * Persisted in projects.setup_state (JSONB, nullable). Clients must tolerate
 * a missing column / NULL value — `normalizeSetupState` maps anything
 * malformed to a clean default state; `validateSetupState` is the strict
 * gate used by the PATCH route.
 */

export const SETUP_STEP_IDS = ['describe', 'instructions', 'documents'] as const
export type SetupStepId = (typeof SETUP_STEP_IDS)[number]

export const SETUP_STEP_STATUSES = ['pending', 'completed', 'skipped'] as const
export type SetupStepStatus = (typeof SETUP_STEP_STATUSES)[number]

export interface SetupState {
  version: 1
  steps: Record<SetupStepId, SetupStepStatus>
  dismissed: boolean
  completed_at: string | null
}

export const SETUP_STATE_MAX_JSON_LENGTH = 2_000

export function defaultSetupState(): SetupState {
  return {
    version: 1,
    steps: { describe: 'pending', instructions: 'pending', documents: 'pending' },
    dismissed: false,
    completed_at: null,
  }
}

function isStepStatus(value: unknown): value is SetupStepStatus {
  return SETUP_STEP_STATUSES.includes(value as SetupStepStatus)
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Lenient: any malformed or missing value becomes a well-formed state. */
export function normalizeSetupState(raw: unknown): SetupState {
  const state = defaultSetupState()
  if (!isPlainObject(raw) || raw.version !== 1) return state
  if (isPlainObject(raw.steps)) {
    for (const id of SETUP_STEP_IDS) {
      const status = raw.steps[id]
      if (isStepStatus(status)) state.steps[id] = status
    }
  }
  if (typeof raw.dismissed === 'boolean') state.dismissed = raw.dismissed
  if (typeof raw.completed_at === 'string') state.completed_at = raw.completed_at
  return state
}

export type SetupStateValidation =
  | { ok: true; state: SetupState }
  | { ok: false; error: string }

const ALLOWED_TOP_LEVEL_KEYS = new Set(['version', 'steps', 'dismissed', 'completed_at'])

/** Strict validation for PATCH input. Returns the canonical state to store. */
export function validateSetupState(raw: unknown): SetupStateValidation {
  if (!isPlainObject(raw)) {
    return { ok: false, error: 'setup_state must be an object' }
  }
  let serialized: string
  try {
    serialized = JSON.stringify(raw)
  } catch {
    return { ok: false, error: 'setup_state must be JSON-serializable' }
  }
  if (serialized.length > SETUP_STATE_MAX_JSON_LENGTH) {
    return { ok: false, error: 'setup_state payload is too large' }
  }
  for (const key of Object.keys(raw)) {
    if (!ALLOWED_TOP_LEVEL_KEYS.has(key)) {
      return { ok: false, error: `setup_state has unknown key '${key}'` }
    }
  }
  if (raw.version !== 1) {
    return { ok: false, error: 'setup_state.version must be 1' }
  }
  if (!isPlainObject(raw.steps)) {
    return { ok: false, error: 'setup_state.steps must be an object' }
  }
  for (const [key, value] of Object.entries(raw.steps)) {
    if (!SETUP_STEP_IDS.includes(key as SetupStepId)) {
      return { ok: false, error: `setup_state.steps has unknown step '${key}'` }
    }
    if (!isStepStatus(value)) {
      return {
        ok: false,
        error: `setup_state.steps.${key} must be one of: ${SETUP_STEP_STATUSES.join(', ')}`,
      }
    }
  }
  if (raw.dismissed !== undefined && typeof raw.dismissed !== 'boolean') {
    return { ok: false, error: 'setup_state.dismissed must be a boolean' }
  }
  if (raw.completed_at !== undefined && raw.completed_at !== null) {
    if (
      typeof raw.completed_at !== 'string' ||
      raw.completed_at.length > 64 ||
      Number.isNaN(Date.parse(raw.completed_at))
    ) {
      return { ok: false, error: 'setup_state.completed_at must be null or an ISO timestamp' }
    }
  }

  const state = defaultSetupState()
  for (const id of SETUP_STEP_IDS) {
    const status = raw.steps[id]
    if (isStepStatus(status)) state.steps[id] = status
  }
  state.dismissed = raw.dismissed === true
  state.completed_at = typeof raw.completed_at === 'string' ? raw.completed_at : null
  return { ok: true, state }
}

export function isStepResolved(status: SetupStepStatus): boolean {
  return status !== 'pending'
}

/** First pending step in order, or null when every step is resolved. */
export function currentSetupStep(state: SetupState): SetupStepId | null {
  for (const id of SETUP_STEP_IDS) {
    if (state.steps[id] === 'pending') return id
  }
  return null
}

export function resolvedStepCount(state: SetupState): number {
  return SETUP_STEP_IDS.filter((id) => isStepResolved(state.steps[id])).length
}

export function isSetupComplete(state: SetupState): boolean {
  return currentSetupStep(state) === null
}

/** Mark a step's outcome; stamps completed_at once every step is resolved. */
export function advanceSetupStep(
  state: SetupState,
  step: SetupStepId,
  status: 'completed' | 'skipped',
): SetupState {
  const next: SetupState = {
    ...state,
    steps: { ...state.steps, [step]: status },
  }
  next.completed_at = isSetupComplete(next)
    ? next.completed_at ?? new Date().toISOString()
    : null
  return next
}
