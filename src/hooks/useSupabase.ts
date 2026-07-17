'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  return { user, loading }
}

// Module-level profile cache shared by every useProfile() instance.
// useProfile is called per-component (Header, Sidebar, UserMenu, and — most
// importantly — EVERY MessageBubble), so without this a 20-message
// conversation mounted 20+ independent fetchers that re-fired on each
// remount/auth event, hammering /rest/v1/profiles at ~4 req/sec
// (incident 2026-07-17). One fetch now serves all instances for the TTL.
const PROFILE_CACHE_TTL_MS = 30_000
let profileCache: { userId: string; profile: Profile | null; fetchedAt: number } | null = null
let profileInFlight: { userId: string; promise: Promise<Profile | null> } | null = null

export function useProfile() {
  const { user, loading: userLoading } = useUser()
  const userId = user?.id ?? null
  const [profile, setProfile] = useState<Profile | null>(() =>
    userId && profileCache?.userId === userId ? profileCache.profile : null
  )
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (userLoading) return
    if (!userId) {
      setProfile(null)
      setLoading(false)
      return
    }

    if (
      profileCache &&
      profileCache.userId === userId &&
      Date.now() - profileCache.fetchedAt < PROFILE_CACHE_TTL_MS
    ) {
      setProfile(profileCache.profile)
      setLoading(false)
      return
    }

    let cancelled = false

    if (!profileInFlight || profileInFlight.userId !== userId) {
      const promise: Promise<Profile | null> = (async () => {
        try {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
          profileCache = { userId, profile: data ?? null, fetchedAt: Date.now() }
          return data ?? null
        } catch {
          return null
        } finally {
          profileInFlight = null
        }
      })()
      profileInFlight = { userId, promise }
    }

    profileInFlight.promise.then((p) => {
      if (!cancelled) {
        setProfile(p)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
    // Depend on the user's id, not the user object — auth events emit fresh
    // object references for the same user, which retriggered fetches.
  }, [userId, userLoading, supabase])

  const updateProfile = async (updates: Partial<Profile>): Promise<{ data: Profile | null; error: { message: string } | null }> => {
    if (!user) return { data: null, error: { message: 'Not authenticated' } }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.from('profiles') as any)
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (!error && data) {
      setProfile(data)
      profileCache = { userId: user.id, profile: data, fetchedAt: Date.now() }
    }

    return { data, error: error ? { message: error.message } : null }
  }

  return { profile, loading: loading || userLoading, updateProfile }
}

export function useSignOut() {
  const supabase = createClient()

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return signOut
}
