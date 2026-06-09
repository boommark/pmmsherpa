/**
 * redirect_uri matching for the MCP OAuth flow.
 *
 * Native apps (Codex CLI, and other loopback-based MCP clients) follow
 * RFC 8252 §7.3 "Loopback Interface Redirection": they bind an ephemeral
 * local port and register a redirect like `http://127.0.0.1:<port>/callback`.
 * The port is NOT stable — the listener that the client lands on at
 * authorize/token time is frequently a different port than the one it
 * registered with. RFC 8252 §7.3 therefore requires the authorization
 * server to permit "any port" when matching loopback redirect URIs:
 *
 *   "The authorization server MUST allow any port to be specified at the
 *    time of the request for loopback IP redirect URIs, to accommodate
 *    clients that obtain an available ephemeral port from the operating
 *    system at the time of the request."
 *
 * A naive exact-string comparison breaks these clients (registration
 * echoes the URI, but authorize then rejects it as "not registered")
 * while web/desktop clients with a stable redirect (e.g. Claude) pass.
 *
 * This module implements that rule: loopback hosts match on
 * scheme + host + path (port ignored); everything else is exact.
 */

/** Loopback hosts per RFC 8252 §7.3. `localhost` is included for clients
 * that use it even though the RFC prefers literal IPs. */
const LOOPBACK_HOSTS = new Set(['127.0.0.1', '::1', '[::1]', 'localhost'])

function isLoopbackHost(hostname: string): boolean {
  // URL.hostname strips brackets from IPv6, so `[::1]` arrives as `::1`.
  return LOOPBACK_HOSTS.has(hostname.toLowerCase())
}

/**
 * True when two redirect URIs are equivalent under the OAuth matching rules:
 * exact string match for non-loopback URIs, port-insensitive match (scheme +
 * host + path + query) for loopback URIs per RFC 8252 §7.3.
 *
 * Invalid URIs only ever match by exact string (we never loosen matching
 * for something we can't parse).
 */
export function redirectUriEquals(registered: string, candidate: string): boolean {
  if (registered === candidate) return true

  let reg: URL
  let cand: URL
  try {
    reg = new URL(registered)
    cand = new URL(candidate)
  } catch {
    return false
  }

  // Only loopback gets port-flexible treatment, and only when BOTH sides are
  // loopback on the same host (don't let a loopback registration authorize a
  // non-loopback redirect or vice versa).
  if (!isLoopbackHost(reg.hostname) || !isLoopbackHost(cand.hostname)) {
    return false
  }

  return (
    reg.protocol === cand.protocol &&
    reg.hostname === cand.hostname &&
    reg.pathname === cand.pathname &&
    reg.search === cand.search
  )
}

/**
 * True when `candidate` matches any of the client's `registered` redirect URIs.
 * Empty registration lists are treated as "no constraint" by callers; this
 * helper only answers the membership question.
 */
export function redirectUriMatches(
  registered: readonly string[],
  candidate: string,
): boolean {
  return registered.some((uri) => redirectUriEquals(uri, candidate))
}
