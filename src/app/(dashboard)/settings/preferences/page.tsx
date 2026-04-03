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
import { Loader2, CheckCircle, Moon, Sun, Monitor, Brain, Zap, Volume2 } from 'lucide-react'
import { MODEL_CONFIG, getDbModelValue, type ModelProvider } from '@/lib/llm/provider-factory'
import type { ElevenLabsVoiceId } from '@/types/database'

// Available ElevenLabs TTS voices
const ELEVENLABS_VOICES: { id: ElevenLabsVoiceId; name: string; description: string }[] = [
  { id: 'VsQmyFHffusQDewmHB5v', name: 'Eddie Stirling', description: 'British corporate, clear & reliable' },
  { id: 'wWWn96OtTHu1sn8SRGEr', name: 'Hale', description: 'Expressive, deep & emotive' },
  { id: 'AXdMgz6evoL7OPd7eU12', name: 'Elizabeth', description: 'British, precise & natural' },
  { id: 'gJx1vCzNCD1EQHT212Ls', name: 'Ava', description: 'Warm, helpful & understanding' },
  { id: 'sB7vwSCyX0tQmU24cW2C', name: 'Jon', description: 'Natural authority, agent-like' },
  { id: 'jqcCZkN6Knx8BJ5TBdYR', name: 'Zara', description: 'Warm, real-world conversationalist' },
]

const DEFAULT_VOICE_ID: ElevenLabsVoiceId = 'VsQmyFHffusQDewmHB5v'

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

// Group models by provider for preferences
const modelGroups = {
  anthropic: {
    label: 'Anthropic',
    models: ['claude-sonnet'] as ModelProvider[],
  },
  google: {
    label: 'Google',
    models: ['gemini-3-pro'] as ModelProvider[],
  },
}

export default function PreferencesPage() {
  const { profile, loading, updateProfile } = useProfile()
  const [preferredModel, setPreferredModel] = useState<ModelProvider>('claude-sonnet')
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [voicePreference, setVoicePreference] = useState<ElevenLabsVoiceId>(DEFAULT_VOICE_ID)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPlayingPreview, setIsPlayingPreview] = useState(false)
  const previewAudioRef = useState<HTMLAudioElement | null>(null)

  // Initialize from profile
  useEffect(() => {
    if (profile) {
      // Map old db values to new model keys for backward compatibility
      const dbModel = profile.preferred_model
      if (dbModel === 'claude') setPreferredModel('claude-sonnet')
      else if (dbModel === 'gemini') setPreferredModel('gemini-3-pro')
      else setPreferredModel(dbModel as ModelProvider)
      setTheme(profile.theme)
      applyTheme(profile.theme)
      // Set ElevenLabs voice preference with fallback
      setVoicePreference((profile.elevenlabs_voice_id as ElevenLabsVoiceId) || DEFAULT_VOICE_ID)
    }
  }, [profile])

  // Handle theme change - apply immediately + persist to localStorage + save to DB
  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    applyTheme(newTheme)
    await updateProfile({ theme: newTheme })
  }

  // Preview voice
  const handleVoicePreview = async (voiceId: ElevenLabsVoiceId) => {
    if (isPlayingPreview) return

    setIsPlayingPreview(true)
    try {
      const voiceName = ELEVENLABS_VOICES.find(v => v.id === voiceId)?.name || 'your assistant'
      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `Hello! I'm ${voiceName}. This is how I sound as your PMM Sherpa voice assistant.`,
          voiceId: voiceId
        })
      })

      if (!response.ok) throw new Error('Failed to generate preview')

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)

      audio.onended = () => {
        setIsPlayingPreview(false)
        URL.revokeObjectURL(audioUrl)
      }
      audio.onerror = () => {
        setIsPlayingPreview(false)
        URL.revokeObjectURL(audioUrl)
      }

      await audio.play()
    } catch (err) {
      console.error('Voice preview error:', err)
      setIsPlayingPreview(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    // Store the provider family in DB for backward compatibility
    const dbModelValue = getDbModelValue(preferredModel)

    const { error } = await updateProfile({
      preferred_model: dbModelValue,
      elevenlabs_voice_id: voicePreference,
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

        {/* Voice Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Voice Settings</CardTitle>
            <CardDescription>
              Choose your preferred AI voice for voice chat
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Voice</Label>
              <div className="flex gap-2">
                <Select
                  value={voicePreference}
                  onValueChange={(v) => setVoicePreference(v as ElevenLabsVoiceId)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select voice" />
                  </SelectTrigger>
                  <SelectContent>
                    {ELEVENLABS_VOICES.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{voice.name}</span>
                          <span className="text-xs text-muted-foreground">{voice.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleVoicePreview(voicePreference)}
                  disabled={isPlayingPreview}
                  title="Preview voice"
                >
                  {isPlayingPreview ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Click the speaker icon to preview the selected voice
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
