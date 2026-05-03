/**
 * Shared types for artifact templates used by the draft_artifact MCP
 * tool. Each template lives in its own file to
 * keep corpus-basis comments paired with its skeleton.
 */

export interface ArtifactTemplate {
  /** Stable enum value used in tool input schemas. snake_case. */
  artifactType: string
  /** Human title for headings and references. */
  title: string
  /**
   * Appended to the LLM system prompt when this artifact is being generated
   * (or validated). Should encode the corpus's failure modes as negative
   * guidance — telling the model what NOT to do is more effective than
   * positive guidance for these high-craft documents.
   */
  systemPromptFragment: string
  /**
   * Markdown skeleton with bracketed inline prompts. The LLM fills in the
   * brackets; the section structure stays. Each section's purpose is one or
   * two sentences max so the prompt budget doesn't bloat.
   */
  skeleton: string
}
