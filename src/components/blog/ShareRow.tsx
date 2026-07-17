'use client'

import { useState } from 'react'
import { Linkedin, Link2, Check } from 'lucide-react'

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const shareBtnClass =
  'inline-flex items-center gap-2 rounded-full border border-[#e2e5ea] bg-white px-4 py-2 text-sm font-medium text-[#4a4f57] transition-colors hover:border-[#0058be]/40 hover:text-[#0058be] dark:border-white/[0.12] dark:bg-white/[0.04] dark:text-[#c8d0e0] dark:hover:border-[#5a9cf5]/50 dark:hover:text-[#5a9cf5]'

export function ShareRow({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false)

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  const xUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm font-semibold text-[#191c1e] dark:text-white mr-1">Share</span>
      <a
        href={linkedinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={shareBtnClass}
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
        LinkedIn
      </a>
      <a
        href={xUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={shareBtnClass}
        aria-label="Share on X"
      >
        <XIcon className="h-3.5 w-3.5" />X
      </a>
      <button type="button" onClick={copyLink} className={shareBtnClass} aria-label="Copy link">
        {copied ? (
          <>
            <Check className="h-4 w-4 text-[#16a34a] dark:text-[#4ade80]" />
            Copied
          </>
        ) : (
          <>
            <Link2 className="h-4 w-4" />
            Copy link
          </>
        )}
      </button>
    </div>
  )
}
