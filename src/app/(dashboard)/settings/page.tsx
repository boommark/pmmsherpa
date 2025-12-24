'use client'

import { useState, useEffect, useRef } from 'react'
import { useProfile, useUser } from '@/hooks/useSupabase'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, CheckCircle, Moon, Sun, Monitor, Upload, X, Mail, Shield } from 'lucide-react'

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

export default function SettingsPage() {
  const { profile, loading, updateProfile } = useProfile()
  const { user } = useUser()
  const [fullName, setFullName] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [sendingEmails, setSendingEmails] = useState(false)
  const [emailResult, setEmailResult] = useState<{ success?: string; error?: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Check if current user is admin (check both profile email and auth user email)
  const userEmail = profile?.email || user?.email
  const isAdmin = userEmail?.toLowerCase().trim() === 'abhishekratna@gmail.com'

  // Initialize form when profile loads
  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name)
    }
    if (profile?.theme) {
      setTheme(profile.theme)
      applyTheme(profile.theme)
    }
  }, [profile])

  // Handle theme change - apply immediately and save to DB and localStorage
  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    applyTheme(newTheme)
    // Save to localStorage for immediate theme on next page load
    localStorage.setItem('theme', newTheme)
    // Save to profile in background
    await updateProfile({ theme: newTheme })
  }

  // Handle avatar file selection
  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type)) {
      setError('Please select a valid image file (PNG, JPEG, GIF, or WebP)')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Upload avatar to Supabase storage
  const handleAvatarUpload = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file || !profile?.id) return

    setUploadingAvatar(true)
    setError(null)

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${profile.id}/avatar.${fileExt}`

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Add cache-busting parameter
      const avatarUrl = `${publicUrl}?t=${Date.now()}`

      // Update profile with new avatar URL
      const { error: updateError } = await updateProfile({ avatar_url: avatarUrl })

      if (updateError) throw updateError

      setAvatarPreview(null)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Remove avatar
  const handleRemoveAvatar = async () => {
    if (!profile?.id) return

    setUploadingAvatar(true)
    setError(null)

    try {
      // List files in user's folder
      const { data: files } = await supabase.storage
        .from('avatars')
        .list(profile.id)

      // Delete all avatar files for this user
      if (files && files.length > 0) {
        const filePaths = files.map(f => `${profile.id}/${f.name}`)
        await supabase.storage.from('avatars').remove(filePaths)
      }

      // Update profile to remove avatar URL
      await updateProfile({ avatar_url: null })

      setAvatarPreview(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Cancel avatar preview
  const handleCancelAvatarPreview = () => {
    setAvatarPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
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

  // Send approval emails (admin only)
  const handleSendApprovalEmails = async () => {
    if (!isAdmin) return

    setSendingEmails(true)
    setEmailResult(null)

    try {
      const response = await fetch('/api/admin/send-approval-emails', {
        method: 'POST',
      })
      const data = await response.json()

      if (response.ok) {
        if (data.sent > 0) {
          setEmailResult({ success: `Sent ${data.sent} welcome email(s) successfully!` })
        } else {
          setEmailResult({ success: 'No new users to send emails to.' })
        }
      } else {
        setEmailResult({ error: data.error || 'Failed to send emails' })
      }
    } catch (err) {
      setEmailResult({ error: err instanceof Error ? err.message : 'Failed to send emails' })
    } finally {
      setSendingEmails(false)
      // Clear result after 5 seconds
      setTimeout(() => setEmailResult(null), 5000)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    const { error } = await updateProfile({ full_name: fullName })

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
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Profile updated successfully!</AlertDescription>
              </Alert>
            )}

            {/* Avatar Upload Section */}
            <div className="space-y-3">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-border">
                  <AvatarImage
                    src={avatarPreview || profile?.avatar_url || undefined}
                    alt={profile?.full_name || ''}
                  />
                  <AvatarFallback className="text-xl">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/gif,image/webp"
                    onChange={handleAvatarSelect}
                    className="hidden"
                    id="avatar-upload"
                  />
                  {avatarPreview ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleAvatarUpload}
                        disabled={uploadingAvatar}
                      >
                        {uploadingAvatar ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="mr-2 h-4 w-4" />
                        )}
                        Upload
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelAvatarPreview}
                        disabled={uploadingAvatar}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Change Photo
                      </Button>
                      {profile?.avatar_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={handleRemoveAvatar}
                          disabled={uploadingAvatar}
                          className="text-destructive hover:text-destructive"
                        >
                          {uploadingAvatar ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Remove'
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF or WebP. Max 5MB.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile?.email || ''}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Email cannot be changed
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName || profile?.full_name || ''}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
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

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Member since</p>
                <p className="font-medium">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Account ID</p>
                <p className="font-mono text-xs truncate">
                  {profile?.id || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Section - Only visible to abhishekratna@gmail.com */}
        {isAdmin && (
          <Card className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                <CardTitle>Admin Tools</CardTitle>
              </div>
              <CardDescription>
                Administrative functions for managing the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {emailResult?.success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{emailResult.success}</AlertDescription>
                </Alert>
              )}
              {emailResult?.error && (
                <Alert variant="destructive">
                  <AlertDescription>{emailResult.error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Send Approval Emails</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Send welcome emails to newly unbanned users who haven&apos;t received one yet
                </p>
                <Button
                  onClick={handleSendApprovalEmails}
                  disabled={sendingEmails}
                  variant="outline"
                  className="border-amber-500/50 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                >
                  {sendingEmails ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Mail className="mr-2 h-4 w-4" />
                  )}
                  {sendingEmails ? 'Sending...' : 'Send Approval Emails'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
