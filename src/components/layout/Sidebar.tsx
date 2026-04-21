'use client'

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useConversations } from '@/hooks/useConversations'
import { useProfile } from '@/hooks/useSupabase'
import { useUIStore } from '@/stores/uiStore'
import { useChatStore } from '@/stores/chatStore'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  MessageSquare,
  History,
  BookOpen,
  Settings,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Trash2,
  Pencil,
  Check,
  X,
  MoreHorizontal,
  Zap,
  ArrowUpCircle,
  Infinity,
} from 'lucide-react'
import { FREE_TIER_MONTHLY_LIMIT } from '@/lib/constants'

// Helper to group conversations by date
function getDateGroup(date: Date): string {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const monthAgo = new Date(today)
  monthAgo.setDate(monthAgo.getDate() - 30)

  const convDate = new Date(date)

  if (convDate >= today) return 'Today'
  if (convDate >= yesterday) return 'Yesterday'
  if (convDate >= weekAgo) return 'Previous 7 Days'
  if (convDate >= monthAgo) return 'Previous 30 Days'
  return 'Older'
}

// Shared sidebar content
function SidebarContent({
  collapsed,
  setCollapsed,
  showCollapseButton = true,
  onNavigate,
}: {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  showCollapseButton?: boolean
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { conversations, deleteConversation, updateConversation } = useConversations()
  const { setPendingNewChat } = useChatStore()
  const { profile } = useProfile()

  // Rename state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpenId) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpenId])

  // Handle rename
  const handleStartRename = (convId: string, currentTitle: string) => {
    setEditingId(convId)
    setEditingTitle(currentTitle)
    setMenuOpenId(null)
  }

  const handleSaveRename = async () => {
    if (editingId && editingTitle.trim()) {
      await updateConversation(editingId, { title: editingTitle.trim() })
    }
    setEditingId(null)
    setEditingTitle('')
  }

  const handleCancelRename = () => {
    setEditingId(null)
    setEditingTitle('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveRename()
    } else if (e.key === 'Escape') {
      handleCancelRename()
    }
  }

  // Get initials for avatar fallback
  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : profile?.email?.[0]?.toUpperCase() || 'U'

  // Handle new chat click — clear state and navigate
  const chatStore = useChatStore()
  const handleNewChat = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    // Immediately clear chat state so welcome screen shows
    chatStore.clearMessages()
    chatStore.setConversationId(null)
    setPendingNewChat(true)
    onNavigate?.()
    // Force navigation even if already on /chat
    if (pathname.startsWith('/chat')) {
      router.replace(`/chat?t=${Date.now()}`)
    } else {
      router.push('/chat')
    }
  }, [chatStore, setPendingNewChat, router, onNavigate, pathname])

  // Group conversations by date
  const groupedConversations = useMemo(() => {
    const groups: Record<string, typeof conversations> = {}
    const sortedConvs = [...conversations].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )

    sortedConvs.forEach((conv) => {
      const group = getDateGroup(new Date(conv.updated_at))
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(conv)
    })

    return groups
  }, [conversations])

  const groupOrder = ['Today', 'Yesterday', 'Previous 7 Days', 'Previous 30 Days', 'Older']

  const navItems = [
    { href: '/chat', icon: MessageSquare, label: 'New Chat', isNewChat: true },
    { href: '/history', icon: History, label: 'History' },
    { href: '/guides', icon: BookOpen, label: 'Guides', highlighted: true },
    { href: '/settings/preferences', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 flex-shrink-0">
        {!showCollapseButton && (
          <span className="font-semibold text-base text-foreground">PMMSherpa</span>
        )}
        {showCollapseButton && (
          <>
            <div />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className={cn('hover:bg-sidebar-accent', collapsed && 'mx-auto')}
            >
              {collapsed ? (
                <PanelLeft className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
            </Button>
          </>
        )}
      </div>

      {/* New Chat Button — Precision Blue */}
      <div className="px-3 pb-3">
        <Button
          onClick={handleNewChat}
          className={cn(
            "w-full",
            !collapsed && "bg-[#0058be] hover:bg-[#004a9e] text-white shadow-none transition-all"
          )}
          variant={collapsed ? 'ghost' : 'default'}
        >
          <Plus className="h-4 w-4" />
          {!collapsed && <span className="ml-2">New Chat</span>}
        </Button>
      </div>

      {/* Conversations grouped by date */}
      {!collapsed && (
        <ScrollArea className="flex-1 min-h-0 overflow-hidden px-3">
          <div className="space-y-4 py-2">
            {groupOrder.map((groupName) => {
              const convs = groupedConversations[groupName]
              if (!convs || convs.length === 0) return null

              return (
                <div key={groupName}>
                  <p className="text-xs font-medium text-muted-foreground/70 px-2 py-1.5 uppercase tracking-wider">
                    {groupName}
                  </p>
                  <div className="space-y-0.5">
                    {convs.map((conv) => (
                      <div
                        key={conv.id}
                        className={cn(
                          'group relative flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-sidebar-accent transition-colors',
                          pathname === `/chat/${conv.id}` && 'bg-sidebar-accent'
                        )}
                      >
                        {editingId === conv.id ? (
                          // Inline editing mode
                          <div className="flex-1 flex items-center gap-1">
                            <Input
                              ref={inputRef}
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onBlur={handleSaveRename}
                              className="h-6 text-sm px-1.5 py-0"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 shrink-0"
                              onClick={handleSaveRename}
                            >
                              <Check className="h-3 w-3 text-green-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 shrink-0"
                              onClick={handleCancelRename}
                            >
                              <X className="h-3 w-3 text-red-500" />
                            </Button>
                          </div>
                        ) : (
                          // Normal display mode
                          <>
                            <Link
                              href={`/chat/${conv.id}`}
                              className="flex-1 truncate"
                              onClick={onNavigate}
                            >
                              {conv.title}
                            </Link>
                            {/* Three-dot menu — visible on hover or when open */}
                            <div className="relative shrink-0 ml-2" ref={menuOpenId === conv.id ? menuRef : undefined}>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setMenuOpenId(menuOpenId === conv.id ? null : conv.id)
                                }}
                                className={cn(
                                  'p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-opacity',
                                  menuOpenId === conv.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                )}
                                aria-label="Chat options"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>

                              {/* Dropdown */}
                              {menuOpenId === conv.id && (
                                <div className="absolute right-0 top-full mt-1 w-32 rounded-lg border border-border bg-popover shadow-md z-50 py-1">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      handleStartRename(conv.id, conv.title)
                                    }}
                                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-popover-foreground hover:bg-accent transition-colors"
                                  >
                                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                                    Rename
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      e.stopPropagation()
                                      setMenuOpenId(null)
                                      deleteConversation(conv.id)
                                    }}
                                    className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      )}

      {/* Navigation — no top border, uses spacing as divider */}
      <nav className="mt-auto p-3 pt-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                {item.isNewChat ? (
                  <button
                    onClick={handleNewChat}
                    className={cn(
                      'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      'text-sidebar-foreground',
                      collapsed && 'justify-center'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span className="ml-3">{item.label}</span>}
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                      isActive
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                        : item.highlighted
                          ? 'text-[#0058be] dark:text-[#a8c0f0]'
                          : 'text-sidebar-foreground',
                      collapsed && 'justify-center'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {!collapsed && <span className="ml-3">{item.label}</span>}
                  </Link>
                )}
              </li>
            )
          })}
        </ul>

        {/* Tier Badge + Upgrade */}
        {!collapsed && profile && profile.tier !== 'founder' && (
          <div className="mt-4 pt-4">
            {profile.tier === 'free' ? (
              <div className="px-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Free Plan</span>
                  <span className="text-xs text-muted-foreground">
                    {profile.messages_used_this_period}/{FREE_TIER_MONTHLY_LIMIT}
                  </span>
                </div>
                <div className="w-full bg-[#282b30] rounded-full h-1.5">
                  <div
                    className="bg-[#0058be] h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (profile.messages_used_this_period / FREE_TIER_MONTHLY_LIMIT) * 100)}%` }}
                  />
                </div>
                <Link href="/complete-profile" onClick={onNavigate}>
                  <Button
                    size="sm"
                    className="w-full bg-gradient-to-r from-[#0058be] to-[#3b82f6] hover:from-[#004a9e] hover:to-[#2563eb] text-white shadow-none text-xs h-8 mt-1"
                  >
                    <ArrowUpCircle className="h-3.5 w-3.5 mr-1.5" />
                    Upgrade to Starter
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="px-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0058be]/10">
                  <Zap className="h-3.5 w-3.5 text-[#0058be]" />
                  <span className="text-xs font-semibold text-[#0058be] dark:text-[#a8c0f0]">Starter</span>
                  <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                    <Infinity className="h-3 w-3" /> Unlimited
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Profile Section — spacing divider instead of border */}
        {!collapsed && profile && (
          <div className="mt-3 pt-3">
            <Link
              href="/settings"
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-sidebar-accent transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={profile.avatar_url || undefined}
                  alt={profile.full_name || ''}
                />
                <AvatarFallback className="text-xs bg-[#d8e2ff] text-[#0058be]">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {profile.full_name || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile.email}
                </p>
              </div>
            </Link>
          </div>
        )}
        {collapsed && profile && (
          <div className="mt-4 pt-4 flex justify-center">
            <Link href="/settings" onClick={onNavigate}>
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={profile.avatar_url || undefined}
                  alt={profile.full_name || ''}
                />
                <AvatarFallback className="text-xs bg-[#d8e2ff] text-[#0058be]">{initials}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        )}
      </nav>
    </div>
  )
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUIStore()
  const pathname = usePathname()

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [pathname, setMobileSidebarOpen])

  return (
    <>
      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <div className="flex flex-col h-full bg-sidebar">
            <SidebarContent
              collapsed={false}
              setCollapsed={setCollapsed}
              showCollapseButton={false}
              onNavigate={() => setMobileSidebarOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar — no border-r, uses background tonal shift */}
      <aside
        className={cn(
          'hidden md:flex flex-col h-full bg-sidebar transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          showCollapseButton={true}
        />
      </aside>
    </>
  )
}
