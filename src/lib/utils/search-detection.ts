/**
 * Utility functions for intelligently detecting when web search should be auto-invoked
 */

// URL detection regex - matches http/https URLs
const URL_REGEX = /https?:\/\/[^\s<>\"{}|\\^`[\]]+/gi

// Research/current information trigger words and phrases
const RESEARCH_TRIGGERS = [
  // Explicit research requests
  'search for', 'search the web', 'look up', 'find information',
  'research', 'investigate', 'explore online',

  // Current/recent information
  'latest', 'recent', 'current', 'today', 'this week', 'this month',
  'this year', '2024', '2025', 'now', 'right now', 'currently',
  'up to date', 'up-to-date', 'newest', 'most recent',

  // News and events
  'news', 'announcement', 'announced', 'released', 'launched',
  'update', 'updates', 'what happened', 'what\'s happening',

  // Comparisons requiring current data
  'compare prices', 'best deals', 'cheapest', 'where to buy',
  'availability', 'in stock', 'price of',

  // Live/real-time data
  'stock price', 'weather', 'score', 'results', 'standings',
  'exchange rate', 'crypto price', 'bitcoin price',

  // Market/competitive intelligence
  'competitor analysis', 'market share', 'industry trends',
  'market trends', 'competitive landscape', 'market data',

  // Questions about specific companies/products
  'what does', 'who is', 'how does', 'tell me about',
]

// PMM-specific topics that may benefit from current web data
const PMM_RESEARCH_TRIGGERS = [
  // Competitive analysis
  'competitors', 'competing products', 'competitive analysis',
  'market positioning', 'how does X compare',

  // Industry trends
  'saas trends', 'b2b trends', 'marketing trends', 'industry report',
  'analyst report', 'gartner', 'forrester', 'g2 crowd',

  // Pricing intelligence
  'pricing page', 'pricing strategy', 'how much does',
  'subscription model', 'freemium',

  // Product launches
  'product launch', 'go-to-market', 'gtm strategy',
  'launch announcement', 'press release',
]

/**
 * Detects URLs in a message
 */
export function detectUrls(message: string): string[] {
  const matches = message.match(URL_REGEX)
  return matches || []
}

/**
 * Checks if a message contains URLs
 */
export function hasUrls(message: string): boolean {
  return URL_REGEX.test(message)
}

/**
 * Checks if the message contains research trigger words/phrases
 */
export function hasResearchTriggers(message: string): boolean {
  const lowerMessage = message.toLowerCase()

  // Check general research triggers
  for (const trigger of RESEARCH_TRIGGERS) {
    if (lowerMessage.includes(trigger.toLowerCase())) {
      return true
    }
  }

  // Check PMM-specific triggers
  for (const trigger of PMM_RESEARCH_TRIGGERS) {
    if (lowerMessage.includes(trigger.toLowerCase())) {
      return true
    }
  }

  return false
}

/**
 * Checks if a message is asking a question that might need web search
 */
export function isWebSearchQuestion(message: string): boolean {
  const lowerMessage = message.toLowerCase().trim()

  // Questions starting with certain words often need current info
  const questionStarters = [
    'what is the latest',
    'what are the latest',
    'what\'s new',
    'what happened',
    'when did',
    'when was',
    'how much does',
    'how much is',
    'where can i find',
    'where can i buy',
    'who announced',
    'who released',
  ]

  for (const starter of questionStarters) {
    if (lowerMessage.startsWith(starter)) {
      return true
    }
  }

  return false
}

/**
 * Main function to determine if web search should be auto-enabled
 * Returns an object with the detection results
 */
export function shouldAutoEnableWebSearch(message: string): {
  shouldEnable: boolean
  reason: 'url' | 'research_trigger' | 'question' | null
  urls: string[]
} {
  // Check for URLs first - highest priority
  const urls = detectUrls(message)
  if (urls.length > 0) {
    return {
      shouldEnable: true,
      reason: 'url',
      urls,
    }
  }

  // Check for research trigger words
  if (hasResearchTriggers(message)) {
    return {
      shouldEnable: true,
      reason: 'research_trigger',
      urls: [],
    }
  }

  // Check for web search questions
  if (isWebSearchQuestion(message)) {
    return {
      shouldEnable: true,
      reason: 'question',
      urls: [],
    }
  }

  return {
    shouldEnable: false,
    reason: null,
    urls: [],
  }
}
