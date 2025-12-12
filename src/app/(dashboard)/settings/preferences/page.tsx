'use client'

import { useState } from 'react'
import { useProfile } from '@/hooks/useSupabase'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, CheckCircle, Moon, Sun, Monitor } from 'lucide-react'
import { MODEL_CONFIG } from '@/lib/llm/provider-factory'

export default function PreferencesPage() {
  const { profile, loading, updateProfile } = useProfile()
  const [preferredModel, setPreferredModel] = useState<'claude' | 'gemini'>('claude')
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize from profile
  useState(() => {
    if (profile) {
      setPreferredModel(profile.preferred_model)
      setTheme(profile.theme)
    }
  })

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    const { error } = await updateProfile({
      preferred_model: preferredModel,
      theme,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)

      // Apply theme
      if (theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark')
      } else {
        // System preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
    }

    setSaving(false)
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
        {/* AI Model Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>AI Model</CardTitle>
            <CardDescription>
              Choose your default AI model for conversations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Preferences saved successfully!</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label>Default Model</Label>
              <Select
                value={preferredModel}
                onValueChange={(v) => setPreferredModel(v as 'claude' | 'gemini')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="claude">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500" />
                      {MODEL_CONFIG.claude.name}
                    </div>
                  </SelectItem>
                  <SelectItem value="gemini">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      {MODEL_CONFIG.gemini.name}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                You can always switch models during a conversation
              </p>
            </div>
          </CardContent>
        </Card>

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
                onValueChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}
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
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Preferences
        </Button>
      </div>
    </div>
  )
}
