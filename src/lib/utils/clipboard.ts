/**
 * Clipboard utilities for copying content in different formats
 */

/**
 * Copy text as Markdown (preserves formatting)
 */
export async function copyAsMarkdown(content: string): Promise<void> {
  await navigator.clipboard.writeText(content)
}

/**
 * Copy text as plain text (strips markdown formatting)
 */
export async function copyAsPlainText(content: string): Promise<void> {
  // Strip markdown formatting
  const plainText = content
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold
    .replace(/\*\*(.+?)\*\*/g, '$1')
    // Remove italic
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove inline code
    .replace(/`([^`]+)`/g, '$1')
    // Remove code blocks (preserve content)
    .replace(/```[\w]*\n?([\s\S]*?)```/g, '$1')
    // Remove links but keep text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Convert bullet lists to simple bullets
    .replace(/^\s*[-*+]\s+/gm, '• ')
    // Remove numbered list formatting but keep numbers
    .replace(/^\s*(\d+)\.\s+/gm, '$1. ')
    // Remove blockquotes
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules
    .replace(/^---+$/gm, '')
    // Remove images
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Clean up multiple newlines
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  await navigator.clipboard.writeText(plainText)
}

/**
 * Copy as rich text (HTML) for Google Docs compatibility
 * Uses ClipboardItem API to write HTML that Google Docs can paste with formatting
 */
export async function copyForGoogleDocs(content: string): Promise<void> {
  // Convert markdown to HTML
  const html = markdownToHtml(content)

  // Create clipboard item with both HTML and plain text fallback
  const htmlBlob = new Blob([html], { type: 'text/html' })
  const textBlob = new Blob([content], { type: 'text/plain' })

  const clipboardItem = new ClipboardItem({
    'text/html': htmlBlob,
    'text/plain': textBlob
  })

  await navigator.clipboard.write([clipboardItem])
}

/**
 * Markdown to HTML converter optimized for Google Docs paste
 * Produces clean, semantic HTML that Google Docs renders well
 */
function markdownToHtml(markdown: string): string {
  let html = markdown

  // Escape HTML entities first
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Process code blocks first (before other transformations)
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const trimmedCode = code.trim()
    return `<pre style="background-color: #f5f5f5; padding: 12px; border-radius: 4px; font-family: monospace; white-space: pre-wrap; overflow-x: auto;"><code>${trimmedCode}</code></pre>`
  })

  // Headers (process in order from h6 to h1)
  html = html
    .replace(/^###### (.+)$/gm, '<h6 style="margin: 16px 0 8px 0; font-weight: bold;">$1</h6>')
    .replace(/^##### (.+)$/gm, '<h5 style="margin: 16px 0 8px 0; font-weight: bold;">$1</h5>')
    .replace(/^#### (.+)$/gm, '<h4 style="margin: 16px 0 8px 0; font-weight: bold;">$1</h4>')
    .replace(/^### (.+)$/gm, '<h3 style="margin: 16px 0 8px 0; font-weight: bold; font-size: 1.1em;">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 style="margin: 20px 0 10px 0; font-weight: bold; font-size: 1.25em;">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 style="margin: 24px 0 12px 0; font-weight: bold; font-size: 1.5em;">$1</h1>')

  // Bold and italic (process bold first, then italic)
  html = html
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/_(.+?)_/g, '<em>$1</em>')

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code style="background-color: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: monospace;">$1</code>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #1a73e8; text-decoration: underline;">$1</a>')

  // Images (convert to linked text since Google Docs doesn't paste images well from HTML)
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '[Image: $1]')

  // Blockquotes
  html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote style="border-left: 4px solid #ddd; margin: 12px 0; padding-left: 16px; color: #666;">$1</blockquote>')

  // Horizontal rules
  html = html.replace(/^---+$/gm, '<hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;">')

  // Process lists
  html = processLists(html)

  // Convert remaining line breaks to paragraphs
  // Split by double newlines for paragraphs
  const blocks = html.split(/\n\n+/)
  html = blocks.map(block => {
    // Don't wrap if already an HTML element
    if (block.match(/^<(h[1-6]|p|ul|ol|li|pre|blockquote|hr|div)/i)) {
      return block
    }
    // Don't wrap empty blocks
    if (!block.trim()) {
      return ''
    }
    // Wrap plain text in paragraphs
    return `<p style="margin: 8px 0;">${block.replace(/\n/g, '<br>')}</p>`
  }).join('\n')

  // Wrap in a div with base styles
  return `<div style="font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.5;">${html}</div>`
}

/**
 * Process markdown lists into HTML lists
 */
function processLists(html: string): string {
  const lines = html.split('\n')
  const result: string[] = []
  let inUnorderedList = false
  let inOrderedList = false

  for (const line of lines) {
    const unorderedMatch = line.match(/^(\s*)[-*+]\s+(.+)$/)
    const orderedMatch = line.match(/^(\s*)(\d+)\.\s+(.+)$/)

    if (unorderedMatch) {
      if (!inUnorderedList) {
        if (inOrderedList) {
          result.push('</ol>')
          inOrderedList = false
        }
        result.push('<ul style="margin: 8px 0; padding-left: 24px;">')
        inUnorderedList = true
      }
      result.push(`<li style="margin: 4px 0;">${unorderedMatch[2]}</li>`)
    } else if (orderedMatch) {
      if (!inOrderedList) {
        if (inUnorderedList) {
          result.push('</ul>')
          inUnorderedList = false
        }
        result.push('<ol style="margin: 8px 0; padding-left: 24px;">')
        inOrderedList = true
      }
      result.push(`<li style="margin: 4px 0;">${orderedMatch[3]}</li>`)
    } else {
      if (inUnorderedList) {
        result.push('</ul>')
        inUnorderedList = false
      }
      if (inOrderedList) {
        result.push('</ol>')
        inOrderedList = false
      }
      result.push(line)
    }
  }

  // Close any open lists
  if (inUnorderedList) result.push('</ul>')
  if (inOrderedList) result.push('</ol>')

  return result.join('\n')
}
