'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useProjects, type ProjectSummary } from '@/hooks/useProjects'
import { useProfile } from '@/hooks/useSupabase'
import { getEffectiveTier } from '@/lib/constants'
import {
  isSetupComplete,
  normalizeSetupState,
  resolvedStepCount,
  SETUP_STEP_IDS,
} from '@/lib/projects/setup-state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { FolderKanban, Plus, FileText, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

/**
 * "Setup 2/3" chip label — null when setup is complete, dismissed, or the
 * project predates the assistant and already has content.
 */
function setupChipLabel(project: ProjectSummary): string | null {
  const state = normalizeSetupState(project.setupState)
  if (state.dismissed || isSetupComplete(state)) return null
  if (project.setupState == null && (project.documentCount > 0 || project.instructions)) return null
  return `Setup ${resolvedStepCount(state)}/${SETUP_STEP_IDS.length}`
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}

export default function ProjectsPage() {
  const router = useRouter()
  const { profile } = useProfile()
  const { projects, loading, error, createProject } = useProjects()
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [instructions, setInstructions] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!name.trim() || creating) return
    setCreating(true)
    try {
      const project = await createProject(name.trim(), instructions.trim() || undefined)
      setCreateOpen(false)
      setName('')
      setInstructions('')
      router.push(`/projects/${project.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  // Projects is a paid feature — show an upgrade prompt to free-tier users
  // (the API enforces the same gate server-side).
  const upgradeRequired =
    !!profile && getEffectiveTier(profile.tier, profile.starter_access_until) === 'free'

  if (upgradeRequired) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <Card className="max-w-md text-center">
          <CardHeader>
            <FolderKanban className="h-10 w-10 mx-auto text-muted-foreground" />
            <CardTitle>Projects is a Starter feature</CardTitle>
            <CardDescription className="space-y-2">
              <span className="block">
                Load your positioning docs, launch plans, and research into a
                project once — every chat inside it answers with your product,
                your market, and your voice already in context. No re-uploading,
                no re-explaining.
              </span>
              <span className="block">
                Starter includes up to 20 projects with 100 documents each —
                room for your whole GTM library.
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/settings/billing">Upgrade to Starter</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Projects</h1>
            <p className="text-muted-foreground">
              Give Sherpa your company context — brand voice, messaging, ICPs, past assets — and chat with it applied
            </p>
          </div>
          <Button
            onClick={() => setCreateOpen(true)}
            className="bg-[#0058be] hover:bg-[#004a9e] text-white shadow-none shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {error && <p className="text-sm text-destructive mb-4">{error}</p>}

        {projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FolderKanban className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="font-medium mb-1">No projects yet</p>
              <p className="text-muted-foreground text-sm max-w-md">
                Create a project, add your company documents, and every chat in that project will know your product, voice, and market.
              </p>
              <Button
                className="mt-4 bg-[#0058be] hover:bg-[#004a9e] text-white shadow-none"
                onClick={() => setCreateOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create your first project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projects.map((project) => {
              const chipLabel = setupChipLabel(project)
              return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="h-full hover:bg-accent/50 hover:border-[#0058be]/30 transition-colors cursor-pointer">
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-2">
                      <FolderKanban className="h-4 w-4 text-[#0058be] shrink-0" />
                      <CardTitle className="text-base font-medium line-clamp-1">
                        {project.name}
                      </CardTitle>
                      {chipLabel && (
                        <Badge
                          variant="outline"
                          className="ml-auto shrink-0 gap-1 border-[#0058be]/30 text-[10px] text-[#0058be] dark:text-[#a8c0f0]"
                        >
                          <Sparkles className="h-2.5 w-2.5" />
                          {chipLabel}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {project.documentCount} {project.documentCount === 1 ? 'document' : 'documents'}
                      </span>
                      <span>•</span>
                      <span>Updated {formatDate(project.updatedAt)}</span>
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
              )
            })}
          </div>
        )}

        {/* Create project dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New project</DialogTitle>
              <DialogDescription>
                Name your project and optionally add instructions Sherpa should always follow in it.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="project-name">Name</Label>
                <Input
                  id="project-name"
                  placeholder="e.g. Acme Q3 Launch"
                  value={name}
                  maxLength={100}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleCreate()
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project-instructions">Instructions (optional)</Label>
                <Textarea
                  id="project-instructions"
                  placeholder="e.g. We sell to mid-market RevOps leaders. Always write in a direct, no-fluff voice. Our product is called Acme Pipeline."
                  value={instructions}
                  rows={4}
                  onChange={(e) => setInstructions(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setCreateOpen(false)} disabled={creating}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!name.trim() || creating}
                className="bg-[#0058be] hover:bg-[#004a9e] text-white shadow-none"
              >
                {creating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Create project
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
