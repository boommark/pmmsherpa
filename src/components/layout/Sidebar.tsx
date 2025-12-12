'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useConversations } from '@/hooks/useConversations'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
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

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { conversations, deleteConversation } = useConversations()

  const navItems = [
    { href: '/chat', icon: MessageSquare, label: 'New Chat' },
    { href: '/history', icon: History, label: 'History' },
    { href: '/saved', icon: Bookmark, label: 'Saved' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <aside
      className={cn(
        'flex flex-col border-r bg-sidebar transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <Link href="/chat" className="font-semibold text-lg">
            PMMSherpa
          </Link>
        )}
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
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <Link href="/chat">
          <Button className="w-full" variant={collapsed ? 'ghost' : 'default'}>
            <Plus className="h-4 w-4" />
            {!collapsed && <span className="ml-2">New Chat</span>}
          </Button>
        </Link>
      </div>

      {/* Conversations */}
      {!collapsed && (
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 py-2">
            <p className="text-xs font-medium text-muted-foreground px-2 py-1">
              Recent Conversations
            </p>
            {conversations.slice(0, 10).map((conv) => (
              <div
                key={conv.id}
                className={cn(
                  'group flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent',
                  pathname === `/chat/${conv.id}` && 'bg-sidebar-accent'
                )}
              >
                <Link
                  href={`/chat/${conv.id}`}
                  className="flex-1 truncate"
                >
                  {conv.title}
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
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
                  className={cn(
                    'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
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
      </nav>
    </aside>
  )
}
