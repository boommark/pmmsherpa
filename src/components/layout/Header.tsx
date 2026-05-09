'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useProfile } from '@/hooks/useSupabase'
import { useChatStore } from '@/stores/chatStore'
import { useUIStore } from '@/stores/uiStore'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { UserMenuContent } from '@/components/layout/UserMenuContent'
import { Menu } from 'lucide-react'

export function Header() {
  const { profile } = useProfile()
  const router = useRouter()
  const { clearMessages, setConversationId } = useChatStore()
  const { toggleMobileSidebar } = useUIStore()

  // Handle clicking the logo to start a new chat — single click, no scroll flash
  const handleNewChat = (e: React.MouseEvent) => {
    e.preventDefault()
    setConversationId(null)
    clearMessages()
    // Always use replace to /chat to force a clean navigation
    // Adding a timestamp param busts the router cache when already on /chat
    router.replace(`/chat?t=${Date.now()}`)
  }

  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : profile?.email?.[0]?.toUpperCase() || 'U'

  return (
    <header className="flex items-center justify-between px-3 md:px-6 py-2.5 md:py-3 bg-background">
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0 h-8 w-8 hover:bg-accent"
          onClick={toggleMobileSidebar}
        >
          <Menu className="h-4 w-4" />
        </Button>
        <Link href="/chat" onClick={handleNewChat} className="hidden sm:flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="w-7 h-7 rounded-md bg-[#0058be] flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 20L7 10l5 6 4-10 6 14" />
            </svg>
          </div>
          <h1 className="text-base md:text-lg font-semibold text-[#0058be] dark:text-[#a8c0f0]">PMMSherpa</h1>
        </Link>
        {/* Model selector hidden — defaulting to Claude Sonnet */}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full shrink-0">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name || ''} />
              <AvatarFallback className="bg-[#d8e2ff] text-[#0058be] text-xs">{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <UserMenuContent align="end" />
      </DropdownMenu>
    </header>
  )
}
