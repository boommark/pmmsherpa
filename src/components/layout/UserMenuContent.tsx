'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProfile, useSignOut } from '@/hooks/useSupabase'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { LogOut, User, Settings, Mail, Zap, BookOpen, CreditCard } from 'lucide-react'

type Props = {
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  onNavigate?: () => void
}

export function UserMenuContent({ align = 'end', side, onNavigate }: Props) {
  const { profile } = useProfile()
  const signOut = useSignOut()
  const router = useRouter()
  const [upgrading, setUpgrading] = useState(false)

  const go = (path: string) => {
    onNavigate?.()
    router.push(path)
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.assign('/login')
  }

  const handleUpgrade = async () => {
    setUpgrading(true)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.assign(data.url)
        return
      }
    } catch {
      // fall through to billing page
    }
    setUpgrading(false)
    go('/settings/billing')
  }

  return (
    <DropdownMenuContent className="w-60" align={align} side={side} forceMount>
      <DropdownMenuLabel className="font-normal">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium">{profile?.full_name || 'User'}</p>
          <p className="text-xs text-muted-foreground">{profile?.email}</p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />

      {/* Billing & credits — top, prominent */}
      <DropdownMenuItem
        onClick={() => go('/settings/billing')}
        className="text-[#0058be] dark:text-[#a8c0f0] font-medium focus:text-[#0058be] dark:focus:text-[#a8c0f0]"
      >
        <CreditCard className="mr-2 h-4 w-4" />
        Billing & credits
      </DropdownMenuItem>

      {profile?.tier === 'free' && (
        <DropdownMenuItem
          onClick={handleUpgrade}
          disabled={upgrading}
          className="text-[#0058be] dark:text-[#a8c0f0] focus:text-[#0058be] dark:focus:text-[#a8c0f0]"
        >
          <Zap className="mr-2 h-4 w-4" />
          {upgrading ? 'Redirecting…' : 'Upgrade to Starter — $9.99/mo'}
        </DropdownMenuItem>
      )}

      <DropdownMenuSeparator />

      <DropdownMenuItem onClick={() => go('/settings')}>
        <User className="mr-2 h-4 w-4" />
        Profile
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => go('/settings/preferences')}>
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => go('/docs')}>
        <BookOpen className="mr-2 h-4 w-4" />
        Docs
      </DropdownMenuItem>

      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <a href="mailto:support@pmmsherpa.com" className="cursor-pointer">
          <Mail className="mr-2 h-4 w-4" />
          Contact Us
        </a>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleSignOut}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
}
