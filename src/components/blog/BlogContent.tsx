'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import 'highlight.js/styles/github-dark.css'

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

/**
 * Blog images: rounded, full-width, with the alt text rendered as a caption.
 * Spans (display:block via CSS) because react-markdown emits images inside
 * <p> — a <figure> there would be invalid HTML and break hydration.
 */
function BlogImage({ src, alt }: { src?: string | Blob; alt?: string }) {
  const url = typeof src === 'string' ? src : undefined
  if (!url) return null
  return (
    <span className="blog-img-wrap">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt={alt ?? ''} loading="lazy" />
      {alt ? <span className="blog-img-caption">{alt}</span> : null}
    </span>
  )
}

export function BlogContent({ markdown }: { markdown: string }) {
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
              {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {children}
            </a>
          )
        },
        pre: ({ children, ...props }) => <PreBlock {...props}>{children}</PreBlock>,
        img: ({ src, alt }) => <BlogImage src={src} alt={alt} />,
      }}
    >
      {markdown}
    </ReactMarkdown>
  )
}
