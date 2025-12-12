import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const EMBEDDING_MODEL = 'text-embedding-3-small'
const EMBEDDING_DIMENSIONS = 512

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    input: text,
    model: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
  })

  return response.data[0].embedding
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    input: texts,
    model: EMBEDDING_MODEL,
    dimensions: EMBEDDING_DIMENSIONS,
  })

  return response.data.map((item) => item.embedding)
}

// PMM-specific query expansion
const PMM_ACRONYMS: Record<string, string> = {
  pmm: 'product marketing manager',
  gtm: 'go to market',
  jtbd: 'jobs to be done',
  tam: 'total addressable market',
  sam: 'serviceable addressable market',
  som: 'serviceable obtainable market',
  mrr: 'monthly recurring revenue',
  arr: 'annual recurring revenue',
  cac: 'customer acquisition cost',
  ltv: 'lifetime value',
  nps: 'net promoter score',
  pql: 'product qualified lead',
  icp: 'ideal customer profile',
  plg: 'product led growth',
  roi: 'return on investment',
  kpi: 'key performance indicator',
  b2b: 'business to business',
  b2c: 'business to consumer',
  saas: 'software as a service',
  vp: 'value proposition',
}

export function expandQuery(query: string): string {
  let expandedQuery = query.toLowerCase()

  // Expand common PMM acronyms
  for (const [acronym, expansion] of Object.entries(PMM_ACRONYMS)) {
    const regex = new RegExp(`\\b${acronym}\\b`, 'gi')
    if (regex.test(expandedQuery)) {
      expandedQuery = `${expandedQuery} ${expansion}`
    }
  }

  return expandedQuery
}
