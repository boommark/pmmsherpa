/**
 * Prompt Guard — input scanning and output filtering for prompt injection defense.
 * Detects extraction attempts before they reach the LLM and catches leaked content in output.
 */

// Canary token embedded in system prompt — if this appears in output, the prompt is leaking
export const CANARY_TOKEN = 'SHERPA-9f3a7c2e-CONFIDENTIAL'

// Patterns that indicate prompt extraction attempts (case-insensitive)
const EXTRACTION_PATTERNS = [
  // Direct extraction
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /ignore\s+(all\s+)?above\s+instructions/i,
  /disregard\s+(all\s+)?previous/i,
  /forget\s+(all\s+)?previous/i,
  /override\s+(your\s+)?instructions/i,
  /bypass\s+(your\s+)?instructions/i,

  // System prompt extraction
  /\b(repeat|output|print|show|display|reveal|tell me)\b.*\b(system\s*prompt|system\s*message|instructions?\s*above|initial\s*prompt|original\s*prompt|full\s*prompt|hidden\s*prompt)\b/i,
  /\bwhat\s+(are|is)\s+your\s+(system\s*)?(prompt|instructions|rules|guidelines|directives)\b/i,
  /\btranslate\s+your\s+(system\s*)?(prompt|instructions)/i,
  /\b(paste|copy|echo)\s+(the|your)\s+(system|initial|original)/i,

  // Role-play / persona switching for extraction
  /\byou\s+are\s+now\s+(DAN|a\s+developer|a\s+debugger|an?\s+AI\s+without)/i,
  /\bDo\s+Anything\s+Now\b/i,
  /\bjailbreak/i,
  /\bpretend\s+(you\s+are|to\s+be)\s+(a\s+)?(developer|engineer|admin)\s+(who|that|debugging)/i,
  /\bact\s+as\s+if\s+you\s+have\s+no\s+restrictions/i,

  // Architecture/KB probing
  /\bwhat\s+books?\s+(are\s+)?(in\s+)?your\s+knowledge\s*base\b/i,
  /\blist\s+(all\s+)?(your\s+)?(books?|sources?|amas?|articles?)\b/i,
  /\bhow\s+(do\s+)?you\s+(decide|choose|determine)\s+when\s+to\s+(search|use|query)/i,
  /\bwhat\s+(writing|voice|style)\s+rules?\s+do\s+you\s+follow/i,
  /\bdescribe\s+your\s+(architecture|system|retrieval|search|rag)/i,
  /\bhow\s+(does|do)\s+your\s+(retrieval|search|rag|knowledge|hybrid)/i,

  // Indirect/creative extraction
  /\btext\s+between\s+(the\s+)?(first|triple|back\s*tick)/i,
  /\beverything\s+(before|above)\s+(this|my)\s+(line|message|prompt)/i,
  /\bverbatim/i,
  /\bword\s+for\s+word/i,
]

// Patterns in output that suggest prompt leakage
const OUTPUT_LEAK_PATTERNS = [
  // Internal section headings from the system prompt
  /##\s*(Voice and Writing Style|Mode Detection|Conversational Flow|Written Craft|Sentence craft|Rhythm and flow|Artifact Creation|Your Dual Role|Conversation Context)/i,
  // Architecture references that should never appear in output
  /\bhybrid[_\s]search\b/i,
  /\bGemini\s+Flash\s+Lite\s+query\s+planner\b/i,
  /\b(70|30)%?\s*(semantic|keyword)\b/i,
  /\bmultiQueryRetrieve\b/i,
  /\bretrieveContext\b/i,
  /\bplanQueries\b/i,
  /\btoken[_\s]budget/i,
  // Canary token
  new RegExp(CANARY_TOKEN, 'i'),
]

export interface ScanResult {
  blocked: boolean
  reason: string | null
  matchedPattern: string | null
}

/**
 * Scan user input for prompt extraction attempts.
 * Returns blocked=true if the message looks like an extraction attempt.
 */
export function scanInput(message: string): ScanResult {
  for (const pattern of EXTRACTION_PATTERNS) {
    if (pattern.test(message)) {
      console.warn(`[PromptGuard] Blocked extraction attempt: ${pattern.source}`)
      return {
        blocked: true,
        reason: 'extraction_attempt',
        matchedPattern: pattern.source,
      }
    }
  }
  return { blocked: false, reason: null, matchedPattern: null }
}

/**
 * Scan a chunk of LLM output for leaked prompt content.
 * Returns true if the output appears to contain leaked system prompt material.
 */
export function scanOutput(text: string): boolean {
  for (const pattern of OUTPUT_LEAK_PATTERNS) {
    if (pattern.test(text)) {
      console.warn(`[PromptGuard] Output leak detected: ${pattern.source}`)
      return true
    }
  }
  return false
}

/**
 * Safe response to return when an extraction attempt is detected.
 */
export const SAFE_RESPONSE = "I'm here to help with product marketing. What can I work on with you? Whether it's positioning, competitive analysis, GTM strategy, or creating deliverables, I'm ready to dive in."
