'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import 'highlight.js/styles/github-dark.css'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function flattenChildren(children: React.ReactNode): string {
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(flattenChildren).join('')
  if (children && typeof children === 'object' && 'props' in children) {
    // @ts-expect-error react node shape
    return flattenChildren(children.props?.children ?? '')
  }
  return ''
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code)
          setCopied(true)
          setTimeout(() => setCopied(false), 1600)
        } catch {
          /* ignore */
        }
      }}
      className={'copy-btn' + (copied ? ' copied' : '')}
      aria-label="Copy code"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

function PreBlock({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) {
  const code = flattenChildren(children)
  return (
    <div className="code-block-wrapper">
      <pre {...props}>{children}</pre>
      <CopyButton code={code} />
    </div>
  )
}

function Heading({ level, children }: { level: 2 | 3; children: React.ReactNode }) {
  const text = flattenChildren(children)
  const id = slugify(text)
  const Tag = `h${level}` as 'h2' | 'h3'
  return (
    <Tag id={id}>
      {children}
      <a href={`#${id}`} className="heading-anchor" aria-label={`Link to ${text}`}>
        #
      </a>
    </Tag>
  )
}

export function DocContent({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug, rehypeHighlight]}
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
        pre: ({ children, ...props }) => <PreBlock {...props}>{children}</PreBlock>,
        h2: ({ children }) => <Heading level={2}>{children}</Heading>,
        h3: ({ children }) => <Heading level={3}>{children}</Heading>,
      }}
    >
      {markdown}
    </ReactMarkdown>
  )
}
