/**
 * Category 1: Schema & registration.
 *
 * Asserts the public tools/list surface is exactly what's documented.
 * Locks down the set: ask_sherpa, draft_artifact, get_feedback.
 * search_corpus is DEPRECATED and must NOT appear.
 *
 * If this file fails after the rename ships, the rename was incomplete.
 */

import { describe, it, expect } from 'vitest'
import { listToolsForRpc, tools } from '../tools'

const EXPECTED_TOOLS = [
  'ask_sherpa',
  'draft_artifact',
  'get_feedback',
  'scope_pmm_research',
] as const
const DEPRECATED_TOOLS = ['search_corpus', 'query_pmm_sherpa', 'validate_artifact']

describe('schema: tools/list registry', () => {
  it('returns exactly 4 tools', () => {
    const list = listToolsForRpc()
    expect(list).toHaveLength(4)
  })

  it('returns the canonical tool name set', () => {
    const names = listToolsForRpc().map((t) => t.name).sort()
    expect(names).toEqual([...EXPECTED_TOOLS].sort())
  })

  it.each(DEPRECATED_TOOLS)('does NOT expose deprecated tool: %s', (deprecatedName) => {
    const names = listToolsForRpc().map((t) => t.name)
    expect(names).not.toContain(deprecatedName)
  })

  it('has no duplicate names', () => {
    const names = listToolsForRpc().map((t) => t.name)
    const set = new Set(names)
    expect(set.size).toBe(names.length)
  })

  it('registry keys match tool.name fields', () => {
    for (const [key, tool] of Object.entries(tools)) {
      expect(tool.name).toBe(key)
    }
  })
})

describe('schema: per-tool shape', () => {
  it.each(EXPECTED_TOOLS)('%s has non-empty name', (name) => {
    const t = listToolsForRpc().find((x) => x.name === name)
    expect(t).toBeDefined()
    expect(t!.name.length).toBeGreaterThan(0)
  })

  it.each(EXPECTED_TOOLS)('%s has a description >= 40 chars', (name) => {
    const t = listToolsForRpc().find((x) => x.name === name)
    expect(t).toBeDefined()
    expect(t!.description.length).toBeGreaterThanOrEqual(40)
  })

  it.each(EXPECTED_TOOLS)('%s has a valid JSON Schema inputSchema', (name) => {
    const t = listToolsForRpc().find((x) => x.name === name)
    expect(t).toBeDefined()
    const schema = t!.inputSchema as Record<string, unknown>
    expect(schema).toBeDefined()
    expect(schema.type).toBe('object')
    expect(schema.properties).toBeDefined()
    expect(typeof schema.properties).toBe('object')
    // `required` must be an array of strings if present
    if (schema.required !== undefined) {
      expect(Array.isArray(schema.required)).toBe(true)
      for (const r of schema.required as unknown[]) {
        expect(typeof r).toBe('string')
      }
    }
  })
})

describe('schema: per-tool required fields', () => {
  it('ask_sherpa requires `query`', () => {
    const t = listToolsForRpc().find((x) => x.name === 'ask_sherpa')!
    const required = (t.inputSchema as { required?: string[] }).required ?? []
    expect(required).toContain('query')
  })

  it('get_feedback requires `content`', () => {
    const t = listToolsForRpc().find((x) => x.name === 'get_feedback')!
    const required = (t.inputSchema as { required?: string[] }).required ?? []
    expect(required).toContain('content')
  })

  it('draft_artifact requires `artifact_type`', () => {
    const t = listToolsForRpc().find((x) => x.name === 'draft_artifact')!
    const required = (t.inputSchema as { required?: string[] }).required ?? []
    expect(required).toContain('artifact_type')
  })

  it('scope_pmm_research requires `question`', () => {
    const t = listToolsForRpc().find((x) => x.name === 'scope_pmm_research')!
    const required = (t.inputSchema as { required?: string[] }).required ?? []
    expect(required).toContain('question')
  })
})

describe('schema: draft_artifact enumerates the 39 templates', () => {
  it('artifact_type enum is non-empty (registry has at least 30 templates)', () => {
    const t = listToolsForRpc().find((x) => x.name === 'draft_artifact')
    if (!t) return // covered by name-set assertion above
    const props = (t.inputSchema as { properties: Record<string, { enum?: string[] }> }).properties
    const enumValues = props.artifact_type?.enum ?? []
    expect(enumValues.length).toBeGreaterThanOrEqual(30)
  })
})
