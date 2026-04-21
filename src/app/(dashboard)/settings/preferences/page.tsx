'use client'

import { useState, useEffect } from 'react'
import { useProfile } from '@/hooks/useSupabase'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Moon, Sun, Monitor } from 'lucide-react'

// Apply theme to document and persist to localStorage
function applyTheme(theme: 'light' | 'dark' | 'system') {
  const resolvedTheme = theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme
  if (resolvedTheme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('theme', theme)
}

export default function PreferencesPage() {
  const { profile, loading, updateProfile } = useProfile()
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')

  // Initialize from profile
  useEffect(() => {
    if (profile) {
      setTheme(profile.theme)
      applyTheme(profile.theme)
    }
  }, [profile])

  // Handle theme change - apply immediately + persist to localStorage + save to DB
  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    applyTheme(newTheme)
    await updateProfile({ theme: newTheme })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Preferences</h1>
        <p className="text-muted-foreground">
          Customize your PMMSherpa experience
        </p>
      </div>

      <div className="space-y-6">
        {/* Theme Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Customize how PMMSherpa looks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme</Label>
              <Select
                value={theme}
                onValueChange={(v) => handleThemeChange(v as 'light' | 'dark' | 'system')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Theme changes are applied instantly
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
