/**
 * Projects feature limits — single source of truth for caps enforced
 * across the API routes and ingestion pipeline.
 */

/** Max projects a single user can create. */
export const MAX_PROJECTS_PER_USER = 20

/** Max documents per project. */
export const MAX_DOCS_PER_PROJECT = 100

/** Total token budget for the pinned tier (full text in every prompt). */
export const PINNED_TIER_TOKEN_CAP = 20_000

/** Per-file upload cap — also enforced by the storage bucket's file_size_limit. */
export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 // 25MB

/** Page cap per document. We can't always know exact pages post-parse, so the
 * ingestion pipeline enforces the token-equivalent cap below. */
export const MAX_DOC_PAGES = 300

/** Token-equivalent of the 300-page cap (~800 tokens/page). */
export const MAX_DOC_TOKENS = MAX_DOC_PAGES * 800

export type PinCheckResult = { ok: true } | { ok: false; reason: string }

/**
 * Can a document with `docTokenCount` tokens be pinned, given that the
 * project's OTHER pinned documents already total `currentPinnedTokens`?
 *
 * Callers must exclude the candidate doc itself from `currentPinnedTokens`
 * (relevant when re-pinning after a re-process changed its token count).
 */
export function canPinDocument(
  currentPinnedTokens: number,
  docTokenCount: number,
): PinCheckResult {
  if (docTokenCount < 0 || currentPinnedTokens < 0) {
    return { ok: false, reason: 'Invalid token counts' }
  }
  const total = currentPinnedTokens + docTokenCount
  if (total > PINNED_TIER_TOKEN_CAP) {
    return {
      ok: false,
      reason:
        `Pinning this document would put pinned content at ${total.toLocaleString()} tokens, ` +
        `over the ${PINNED_TIER_TOKEN_CAP.toLocaleString()}-token pinned limit. ` +
        `Unpin another document or keep this one in the searchable tier.`,
    }
  }
  return { ok: true }
}
