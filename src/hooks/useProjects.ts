'use client'

/**
 * Client data layer for the Projects feature — thin wrappers over
 * /api/projects/**. Mirrors the useConversations conventions: local state,
 * optimistic-ish updates via refetch, errors surfaced to the caller.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface ProjectSummary {
  id: string
  name: string
  instructions: string | null
  totalTokenCount: number
  documentCount: number
  createdAt: string
  updatedAt: string
}

export interface ProjectDocument {
  id: string
  title: string
  file_name: string | null
  mime_type: string | null
  source_type: 'file' | 'text'
  tier: 'pinned' | 'rag'
  status: 'processing' | 'ready' | 'failed'
  error_message: string | null
  synopsis: string | null
  token_count: number
  created_at: string
}

export interface ProjectDetail {
  id: string
  name: string
  instructions: string | null
  totalTokenCount: number
  createdAt: string
  updatedAt: string
  documents: ProjectDocument[]
}

async function readError(res: Response, fallback: string): Promise<string> {
  try {
    const json = (await res.json()) as { error?: string }
    return json?.error || fallback
  } catch {
    return fallback
  }
}

/** List + create. Used by /projects and the chat project selector. */
export function useProjects() {
  const [projects, setProjects] = useState<ProjectSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/projects')
      if (!res.ok) {
        setError(await readError(res, 'Failed to load projects'))
        return
      }
      const data = (await res.json()) as { projects: ProjectSummary[] }
      setProjects(data.projects || [])
    } catch (err) {
      console.error('[useProjects] fetch failed:', err)
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const createProject = useCallback(
    async (name: string, instructions?: string): Promise<ProjectSummary> => {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, instructions: instructions || null }),
      })
      if (!res.ok) {
        throw new Error(await readError(res, 'Failed to create project'))
      }
      const project = (await res.json()) as ProjectSummary
      setProjects((prev) => [project, ...prev])
      return project
    },
    [],
  )

  const deleteProject = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      throw new Error(await readError(res, 'Failed to delete project'))
    }
    setProjects((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return { projects, loading, error, refetch: fetchProjects, createProject, deleteProject }
}

const POLL_INTERVAL_MS = 4000

/** Detail + documents. Polls while any document is processing. */
export function useProject(projectId: string | null) {
  const [project, setProject] = useState<ProjectDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchProject = useCallback(async () => {
    if (!projectId) return
    try {
      const res = await fetch(`/api/projects/${projectId}`)
      if (!res.ok) {
        setError(await readError(res, 'Failed to load project'))
        return
      }
      setError(null)
      setProject((await res.json()) as ProjectDetail)
    } catch (err) {
      console.error('[useProject] fetch failed:', err)
      setError('Failed to load project')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    setLoading(true)
    setProject(null)
    fetchProject()
  }, [fetchProject])

  // Poll while any document is processing (simple interval refetch).
  const hasProcessing = project?.documents.some((d) => d.status === 'processing') ?? false
  useEffect(() => {
    if (!hasProcessing) return
    pollRef.current = setInterval(fetchProject, POLL_INTERVAL_MS)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [hasProcessing, fetchProject])

  const updateProject = useCallback(
    async (updates: { name?: string; instructions?: string | null }) => {
      if (!projectId) return
      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })
      if (!res.ok) {
        throw new Error(await readError(res, 'Failed to update project'))
      }
      await fetchProject()
    },
    [projectId, fetchProject],
  )

  /**
   * Upload a file: init-upload → direct PUT to the signed URL (bypasses
   * Vercel's body cap, same pattern as chat attachments) → finalize.
   */
  const uploadFile = useCallback(
    async (file: File) => {
      if (!projectId) return
      const initRes = await fetch(`/api/projects/${projectId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'init-upload',
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          fileSize: file.size,
        }),
      })
      if (!initRes.ok) {
        throw new Error(await readError(initRes, 'Failed to start upload'))
      }
      const { documentId, storagePath, token } = (await initRes.json()) as {
        documentId: string
        storagePath: string
        token: string
      }

      const supabase = createClient()
      const { error: uploadErr } = await supabase.storage
        .from('project-documents')
        .uploadToSignedUrl(storagePath, token, file, { contentType: file.type })
      if (uploadErr) {
        throw new Error(uploadErr.message || 'Storage upload failed')
      }

      const finalizeRes = await fetch(`/api/projects/${projectId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'finalize', documentId }),
      })
      if (!finalizeRes.ok) {
        throw new Error(await readError(finalizeRes, 'Failed to finalize upload'))
      }
      await fetchProject()
    },
    [projectId, fetchProject],
  )

  const addText = useCallback(
    async (title: string, content: string) => {
      if (!projectId) return
      const res = await fetch(`/api/projects/${projectId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'text', title, content }),
      })
      if (!res.ok) {
        throw new Error(await readError(res, 'Failed to add text'))
      }
      await fetchProject()
    },
    [projectId, fetchProject],
  )

  const setDocumentTier = useCallback(
    async (docId: string, tier: 'pinned' | 'rag') => {
      if (!projectId) return
      const res = await fetch(`/api/projects/${projectId}/documents/${docId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })
      if (!res.ok) {
        throw new Error(await readError(res, 'Failed to update document'))
      }
      await fetchProject()
    },
    [projectId, fetchProject],
  )

  const deleteDocument = useCallback(
    async (docId: string) => {
      if (!projectId) return
      const res = await fetch(`/api/projects/${projectId}/documents/${docId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        throw new Error(await readError(res, 'Failed to delete document'))
      }
      await fetchProject()
    },
    [projectId, fetchProject],
  )

  const retryDocument = useCallback(
    async (docId: string) => {
      if (!projectId) return
      const res = await fetch(`/api/projects/${projectId}/documents/${docId}`, {
        method: 'POST',
      })
      if (!res.ok) {
        throw new Error(await readError(res, 'Failed to retry document'))
      }
      await fetchProject()
    },
    [projectId, fetchProject],
  )

  return {
    project,
    loading,
    error,
    refetch: fetchProject,
    updateProject,
    uploadFile,
    addText,
    setDocumentTier,
    deleteDocument,
    retryDocument,
  }
}
