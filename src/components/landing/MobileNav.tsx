'use client'

/**
 * Mobile hamburger menu for the landing page header. The desktop nav links
 * are hidden below md; this mirrors them in a dropdown panel. Client
 * component so the landing page itself can stay a server component.
 */

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { href: '#why-sherpa', label: 'Why Sherpa' },
  { href: '#projects', label: 'Projects' },
  { href: '#how-it-works', label: 'How It Works' },
  { href: '#who-its-for', label: "Who It's For" },
  { href: '#pricing', label: 'Pricing' },
  { href: '#mcp', label: 'MCP' },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center w-10 h-10 rounded-lg text-[#5f6368] hover:text-[#191c1e] hover:bg-[#f2f4f7] transition-colors"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-16 z-50 bg-white border-b border-[#e8ecf4] shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
          <nav className="max-w-6xl mx-auto px-5 py-3 flex flex-col">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 text-[15px] font-medium text-[#3a3f47] hover:text-[#0058be] border-b border-[#f0f2f5] last:border-b-0 transition-colors"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/docs"
              onClick={() => setOpen(false)}
              className="py-3 text-[15px] font-medium text-[#3a3f47] hover:text-[#0058be] border-b border-[#f0f2f5] transition-colors"
            >
              Docs
            </Link>
            <Link
              href="/blog"
              onClick={() => setOpen(false)}
              className="py-3 text-[15px] font-medium text-[#3a3f47] hover:text-[#0058be] transition-colors"
            >
              Blog
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
}
