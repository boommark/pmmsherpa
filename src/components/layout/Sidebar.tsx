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
  Bookmark,
  Settings,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Trash2,
  Pencil,
  Check,
  X,
} from 'lucide-react'

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
  const { clearMessages, setConversationId } = useChatStore()
  const { profile } = useProfile()

  // Rename state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  // Handle rename
  const handleStartRename = (convId: string, currentTitle: string) => {
    setEditingId(convId)
    setEditingTitle(currentTitle)
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

  // Handle new chat click - single click, no scroll flash
  const handleNewChat = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setConversationId(null)
    clearMessages()
    router.replace(`/chat?t=${Date.now()}`)
    onNavigate?.()
  }, [clearMessages, setConversationId, router, onNavigate])

  // Group conversations by date
  const groupedConversations = useMemo(() => {
    const groups: Record<string, typeof conversations> = {}
    const sortedConvs = [...conversations].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )

    sortedConvs.slice(0, 15).forEach((conv) => {
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
    { href: '/chat', icon: MessageSquare, label: 'New Chat' },
    { href: '/history', icon: History, label: 'History' },
    { href: '/saved', icon: Bookmark, label: 'Saved' },
    { href: '/settings', icon: Settings, label: 'Settings' },
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
                          'group flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-sidebar-accent transition-colors',
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
                            <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.preventDefault()
                                  handleStartRename(conv.id, conv.title)
                                }}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.preventDefault()
                                  deleteConversation(conv.id)
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
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
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground',
                    collapsed && 'justify-center'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* User Profile Section — spacing divider instead of border */}
        {!collapsed && profile && (
          <div className="mt-4 pt-4">
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
