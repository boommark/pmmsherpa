'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github.css'

/**
 * Renders the body of a docs page. Headings, lists, tables, and code blocks
 * are styled via the `.prose-docs` selector defined in globals.css. Code
 * blocks get syntax highlighting via rehype-highlight.
 */
export function DocContent({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
      components={{
        a: ({ href, children, ...props }) => {
          const isExternal = href?.startsWith('http')
          return (
            <a
              href={href}
              {...props}
              {...(isExternal ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              {children}
            </a>
          )
        },
      }}
    >
      {markdown}
    </ReactMarkdown>
  )
}
