import { describe, it, expect } from 'vitest'
import {
  detectUrls,
  hasUrls,
  hasResearchTriggers,
  isWebSearchQuestion,
  shouldAutoEnableWebSearch,
} from '../search-detection'

// ---------------------------------------------------------------------------
// detectUrls
// ---------------------------------------------------------------------------
describe('detectUrls', () => {
  it('extracts http URLs', () => {
    expect(detectUrls('visit http://example.com today')).toEqual([
      'http://example.com',
    ])
  })

  it('extracts https URLs', () => {
    expect(detectUrls('see https://example.com/page?q=1')).toEqual([
      'https://example.com/page?q=1',
    ])
  })

  it('extracts multiple URLs', () => {
    const urls = detectUrls(
      'compare https://a.com and https://b.com/pricing'
    )
    expect(urls).toHaveLength(2)
    expect(urls).toContain('https://a.com')
    expect(urls).toContain('https://b.com/pricing')
  })

  it('returns empty array when no URLs present', () => {
    expect(detectUrls('no links here')).toEqual([])
  })

  it('returns empty array for empty string', () => {
    expect(detectUrls('')).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// hasUrls
// ---------------------------------------------------------------------------
describe('hasUrls', () => {
  it('returns true when message contains a URL', () => {
    expect(hasUrls('check https://example.com')).toBe(true)
  })

  it('returns false when no URL present', () => {
    expect(hasUrls('just plain text')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// hasResearchTriggers
// ---------------------------------------------------------------------------
describe('hasResearchTriggers', () => {
  it.each([
    'search for competitor pricing',
    'What are the latest SaaS trends',
    'competitor analysis for my product',
    'market trends in B2B',
    'What is the current market share?',
    'any news about the launch?',
    'gtm strategy for Q1',
    'how much does HubSpot cost',
    'pricing page comparison',
  ])('returns true for: "%s"', (msg) => {
    expect(hasResearchTriggers(msg)).toBe(true)
  })

  it('is case insensitive', () => {
    expect(hasResearchTriggers('LATEST TRENDS')).toBe(true)
    expect(hasResearchTriggers('Search For something')).toBe(true)
  })

  it('matches year references', () => {
    expect(hasResearchTriggers('2026 trends in marketing')).toBe(true)
    expect(hasResearchTriggers('trends from 2025')).toBe(true)
  })

  it('returns false for pure PMM knowledge queries', () => {
    expect(hasResearchTriggers('What is a value proposition?')).toBe(false)
    expect(hasResearchTriggers('Create a battlecard for my product')).toBe(false)
    expect(hasResearchTriggers('Explain the Mom Test approach')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// isWebSearchQuestion
// ---------------------------------------------------------------------------
describe('isWebSearchQuestion', () => {
  it.each([
    'What is the latest pricing for Slack?',
    'What are the latest AI trends?',
    'How much does HubSpot cost?',
    'Where can I find competitive data?',
    "What's new in product marketing?",
    'When did Slack launch their new plan?',
  ])('returns true for: "%s"', (msg) => {
    expect(isWebSearchQuestion(msg)).toBe(true)
  })

  it('is case insensitive', () => {
    expect(isWebSearchQuestion('WHAT IS THE LATEST news?')).toBe(true)
    expect(isWebSearchQuestion('How Much Does it cost?')).toBe(true)
  })

  it('returns false for non-question messages', () => {
    expect(isWebSearchQuestion('Create a positioning canvas')).toBe(false)
    expect(isWebSearchQuestion('Tell me about messaging')).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// shouldAutoEnableWebSearch — URL detection
// ---------------------------------------------------------------------------
describe('shouldAutoEnableWebSearch — URL detection', () => {
  it('enables for http URL with reason "url"', () => {
    const result = shouldAutoEnableWebSearch('analyze http://example.com')
    expect(result.shouldEnable).toBe(true)
    expect(result.reason).toBe('url')
    expect(result.urls).toContain('http://example.com')
  })

  it('enables for https URL with reason "url"', () => {
    const result = shouldAutoEnableWebSearch(
      'check https://competitor.com/pricing'
    )
    expect(result.shouldEnable).toBe(true)
    expect(result.reason).toBe('url')
    expect(result.urls).toContain('https://competitor.com/pricing')
  })

  it('returns all detected URLs in the urls array', () => {
    const result = shouldAutoEnableWebSearch(
      'compare https://a.com and https://b.com'
    )
    expect(result.urls).toHaveLength(2)
  })
})

// ---------------------------------------------------------------------------
// shouldAutoEnableWebSearch — research triggers
// ---------------------------------------------------------------------------
describe('shouldAutoEnableWebSearch — research triggers', () => {
  it('enables for "What are the latest SaaS trends"', () => {
    const result = shouldAutoEnableWebSearch(
      'What are the latest SaaS trends'
    )
    expect(result.shouldEnable).toBe(true)
    expect(result.reason).toBe('research_trigger')
    expect(result.urls).toEqual([])
  })

  it('enables for "Search for competitor pricing"', () => {
    const result = shouldAutoEnableWebSearch('Search for competitor pricing')
    expect(result.shouldEnable).toBe(true)
    expect(result.reason).toBe('research_trigger')
  })

  it('enables for "competitor analysis for my product"', () => {
    const result = shouldAutoEnableWebSearch(
      'competitor analysis for my product'
    )
    expect(result.shouldEnable).toBe(true)
    expect(result.reason).toBe('research_trigger')
  })

  it('enables for "market trends in B2B"', () => {
    const result = shouldAutoEnableWebSearch('market trends in B2B')
    expect(result.shouldEnable).toBe(true)
    expect(result.reason).toBe('research_trigger')
  })

  it('enables for year references like "2026 trends"', () => {
    const result = shouldAutoEnableWebSearch('2026 trends in product marketing')
    expect(result.shouldEnable).toBe(true)
    expect(result.reason).toBe('research_trigger')
  })
})

// ---------------------------------------------------------------------------
// shouldAutoEnableWebSearch — web search questions
// ---------------------------------------------------------------------------
describe('shouldAutoEnableWebSearch — web search questions', () => {
  it('enables for "What is the latest pricing for Slack?"', () => {
    const result = shouldAutoEnableWebSearch(
      'What is the latest pricing for Slack?'
    )
    expect(result.shouldEnable).toBe(true)
    // Could match either research_trigger ("latest") or question — both valid
    expect(['research_trigger', 'question']).toContain(result.reason)
  })

  it('enables for "How much does HubSpot cost?"', () => {
    const result = shouldAutoEnableWebSearch('How much does HubSpot cost?')
    expect(result.shouldEnable).toBe(true)
    expect(['research_trigger', 'question']).toContain(result.reason)
  })

  it('enables for "Where can I find competitive data?"', () => {
    const result = shouldAutoEnableWebSearch(
      'Where can I find competitive data?'
    )
    expect(result.shouldEnable).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// shouldAutoEnableWebSearch — should NOT enable (pure PMM queries)
// ---------------------------------------------------------------------------
describe('shouldAutoEnableWebSearch — pure PMM knowledge queries', () => {
  it('does not enable for "What is April Dunford\'s positioning framework?"', () => {
    const result = shouldAutoEnableWebSearch(
      "What is April Dunford's positioning framework?"
    )
    expect(result.shouldEnable).toBe(false)
    expect(result.reason).toBeNull()
    expect(result.urls).toEqual([])
  })

  it('does not enable for "How do I write a value proposition?"', () => {
    const result = shouldAutoEnableWebSearch(
      'How do I write a value proposition?'
    )
    expect(result.shouldEnable).toBe(false)
  })

  it('does not enable for "Create a battlecard for my product"', () => {
    const result = shouldAutoEnableWebSearch(
      'Create a battlecard for my product'
    )
    expect(result.shouldEnable).toBe(false)
  })

  it('does not enable for "Explain the Mom Test approach"', () => {
    const result = shouldAutoEnableWebSearch('Explain the Mom Test approach')
    expect(result.shouldEnable).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// shouldAutoEnableWebSearch — priority: URL > research > question
// ---------------------------------------------------------------------------
describe('shouldAutoEnableWebSearch — priority', () => {
  it('URL detection takes priority over research triggers', () => {
    const result = shouldAutoEnableWebSearch(
      'search for the latest info at https://example.com'
    )
    expect(result.shouldEnable).toBe(true)
    expect(result.reason).toBe('url')
    expect(result.urls).toContain('https://example.com')
  })

  it('research trigger takes priority over question detection', () => {
    // "What is the latest" would match both research_trigger (via "latest")
    // and question (via "what is the latest" starter). Research triggers
    // are checked first, so reason should be 'research_trigger'.
    const result = shouldAutoEnableWebSearch('What is the latest news?')
    expect(result.shouldEnable).toBe(true)
    expect(result.reason).toBe('research_trigger')
  })
})

// ---------------------------------------------------------------------------
// shouldAutoEnableWebSearch — edge cases
// ---------------------------------------------------------------------------
describe('shouldAutoEnableWebSearch — edge cases', () => {
  it('returns shouldEnable false for empty string', () => {
    const result = shouldAutoEnableWebSearch('')
    expect(result.shouldEnable).toBe(false)
    expect(result.reason).toBeNull()
    expect(result.urls).toEqual([])
  })

  it('is case insensitive for research triggers', () => {
    const result = shouldAutoEnableWebSearch('LATEST TRENDS in SaaS')
    expect(result.shouldEnable).toBe(true)
    expect(result.reason).toBe('research_trigger')
  })

  it('is case insensitive for question detection', () => {
    const result = shouldAutoEnableWebSearch('HOW MUCH DOES Slack cost?')
    expect(result.shouldEnable).toBe(true)
  })

  it('handles whitespace-only input', () => {
    const result = shouldAutoEnableWebSearch('   ')
    expect(result.shouldEnable).toBe(false)
  })
})
