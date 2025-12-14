'use client'

import { useState, useEffect } from 'react'
import { useProfile } from '@/hooks/useSupabase'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, CheckCircle, Moon, Sun, Monitor, Brain, Zap } from 'lucide-react'
import { MODEL_CONFIG, getDbModelValue, type ModelProvider } from '@/lib/llm/provider-factory'

// Apply theme to document
function applyTheme(theme: 'light' | 'dark' | 'system') {
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

// Group models by provider for preferences
const modelGroups = {
  anthropic: {
    label: 'Anthropic',
    models: ['claude-opus', 'claude-sonnet'] as ModelProvider[],
  },
  google: {
    label: 'Google',
    models: ['gemini-3-pro', 'gemini-2.5-thinking'] as ModelProvider[],
  },
}

export default function PreferencesPage() {
  const { profile, loading, updateProfile } = useProfile()
  const [preferredModel, setPreferredModel] = useState<ModelProvider>('claude-opus')
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize from profile
  useEffect(() => {
    if (profile) {
      // Map old db values to new model keys for backward compatibility
      const dbModel = profile.preferred_model
      if (dbModel === 'claude') setPreferredModel('claude-opus')
      else if (dbModel === 'gemini') setPreferredModel('gemini-3-pro')
      else setPreferredModel(dbModel as ModelProvider)
      setTheme(profile.theme)
      applyTheme(profile.theme)
    }
  }, [profile])

  // Handle theme change - apply immediately and save to DB
  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    applyTheme(newTheme)
    // Save to profile in background
    await updateProfile({ theme: newTheme })
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    // Store the provider family in DB for backward compatibility
    const dbModelValue = getDbModelValue(preferredModel)

    const { error } = await updateProfile({
      preferred_model: dbModelValue,
    })

    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
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
                onValueChange={(v) => setPreferredModel(v as ModelProvider)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(modelGroups).map(([key, group]) => (
                    <SelectGroup key={key}>
                      <SelectLabel className="text-xs text-muted-foreground">{group.label}</SelectLabel>
                      {group.models.map((modelKey) => {
                        const config = MODEL_CONFIG[modelKey]
                        return (
                          <SelectItem key={modelKey} value={modelKey}>
                            <div className="flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${config.color}`} />
                              <span>{config.name}</span>
                              {config.isThinking ? (
                                <Brain className="h-3 w-3 text-purple-500" />
                              ) : (
                                <Zap className="h-3 w-3 text-yellow-500" />
                              )}
                            </div>
                          </SelectItem>
                        )
                      })}
                    </SelectGroup>
                  ))}
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

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Preferences
        </Button>
      </div>
    </div>
  )
}
