'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
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
import {
  MessageSquare,
  History,
  Bookmark,
  Settings,
  Plus,
  PanelLeftClose,
  PanelLeft,
  Trash2,
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
  const { conversations, deleteConversation } = useConversations()
  const { clearMessages, setConversationId } = useChatStore()
  const { profile } = useProfile()

  // Get initials for avatar fallback
  const initials = profile?.full_name
    ? profile.full_name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : profile?.email?.[0]?.toUpperCase() || 'U'

  // Handle new chat click - clear state and navigate
  const handleNewChat = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    // Clear the chat store state
    clearMessages()
    setConversationId(null)
    // Navigate to /chat
    router.push('/chat')
    // Call onNavigate callback (for closing mobile sidebar)
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
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <a href="/chat" className="flex items-center gap-2 cursor-pointer" onClick={handleNewChat}>
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
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
            <span className="font-semibold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">PMMSherpa</span>
          </a>
        )}
        {showCollapseButton && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(collapsed && 'mx-auto')}
          >
            {collapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Button
          onClick={handleNewChat}
          className={cn(
            "w-full",
            !collapsed && "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all"
          )}
          variant={collapsed ? 'ghost' : 'default'}
        >
          <Plus className="h-4 w-4" />
          {!collapsed && <span className="ml-2">New Chat</span>}
        </Button>
      </div>

      {/* Conversations grouped by date */}
      {!collapsed && (
        <ScrollArea className="flex-1 px-3">
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
                          'group flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-sidebar-accent/50 transition-colors',
                          pathname === `/chat/${conv.id}` && 'bg-sidebar-accent'
                        )}
                      >
                        <Link
                          href={`/chat/${conv.id}`}
                          className="flex-1 truncate"
                          onClick={onNavigate}
                        >
                          {conv.title}
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.preventDefault()
                            deleteConversation(conv.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      )}

      {/* Navigation */}
      <nav className="mt-auto border-t p-3">
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
                    'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
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

        {/* User Profile Section */}
        {!collapsed && profile && (
          <div className="mt-3 pt-3 border-t">
            <Link
              href="/settings"
              onClick={onNavigate}
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-sidebar-accent/50 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={profile.avatar_url || undefined}
                  alt={profile.full_name || ''}
                />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
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
          <div className="mt-3 pt-3 border-t flex justify-center">
            <Link href="/settings" onClick={onNavigate}>
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={profile.avatar_url || undefined}
                  alt={profile.full_name || ''}
                />
                <AvatarFallback className="text-xs">{initials}</AvatarFallback>
              </Avatar>
            </Link>
          </div>
        )}
      </nav>
    </>
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

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col border-r bg-sidebar transition-all duration-300',
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
