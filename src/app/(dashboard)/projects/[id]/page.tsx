'use client'

import { use, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useProject, type ProjectDocument } from '@/hooks/useProjects'
import { useChatStore } from '@/stores/chatStore'
import { PINNED_TIER_TOKEN_CAP } from '@/lib/projects/limits'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  ArrowLeft,
  Check,
  ClipboardPaste,
  FileText,
  Loader2,
  MessageSquare,
  Pencil,
  Pin,
  PinOff,
  RotateCw,
  Trash2,
  TriangleAlert,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

const ACCEPTED_EXTENSIONS =
  '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.odt,.ods,.odp,.rtf,.epub,.html,.txt,.csv,.md,.json'

function StatusChip({ doc }: { doc: ProjectDocument }) {
  if (doc.status === 'processing') {
    return (
      <Badge variant="outline" className="gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Processing
      </Badge>
    )
  }
  if (doc.status === 'failed') {
    return (
      <Badge
        variant="outline"
        className="gap-1 text-xs text-destructive border-destructive/40"
        title={doc.error_message || 'Processing failed'}
      >
        <TriangleAlert className="h-3 w-3" />
        Failed
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className="gap-1 text-xs text-green-600 dark:text-green-500 border-green-600/30">
      <Check className="h-3 w-3" />
      Ready
    </Badge>
  )
}

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const {
    project,
    loading,
    error,
    updateProject,
    uploadFile,
    addText,
    setDocumentTier,
    deleteDocument,
    retryDocument,
  } = useProject(id)
  const { setCurrentProject, setPendingNewChat, clearMessages } = useChatStore()

  // Inline name editing
  const [editingName, setEditingName] = useState(false)
  const [nameDraft, setNameDraft] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (editingName) {
      nameInputRef.current?.focus()
      nameInputRef.current?.select()
    }
  }, [editingName])

  // Instructions editor
  const [instructionsDraft, setInstructionsDraft] = useState<string | null>(null)
  const [savingInstructions, setSavingInstructions] = useState(false)

  // Uploads
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingCount, setUploadingCount] = useState(0)

  // Paste-text dialog
  const [pasteOpen, setPasteOpen] = useState(false)
  const [pasteTitle, setPasteTitle] = useState('')
  const [pasteContent, setPasteContent] = useState('')
  const [pasting, setPasting] = useState(false)

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<ProjectDocument | null>(null)
  const [pinBusyId, setPinBusyId] = useState<string | null>(null)

  const pinnedTokens = useMemo(
    () =>
      (project?.documents || [])
        .filter((d) => d.tier === 'pinned' && d.status === 'ready')
        .reduce((sum, d) => sum + (d.token_count || 0), 0),
    [project],
  )

  const handleSaveName = async () => {
    setEditingName(false)
    const next = nameDraft.trim()
    if (!project || !next || next === project.name) return
    try {
      await updateProject({ name: next })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to rename project')
    }
  }

  const handleSaveInstructions = async () => {
    if (!project || instructionsDraft === null) return
    setSavingInstructions(true)
    try {
      await updateProject({ instructions: instructionsDraft.trim() || null })
      setInstructionsDraft(null)
      toast.success('Instructions saved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save instructions')
    } finally {
      setSavingInstructions(false)
    }
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const list = Array.from(files)
    setUploadingCount((n) => n + list.length)
    for (const file of list) {
      try {
        await uploadFile(file)
      } catch (err) {
        toast.error(`${file.name}: ${err instanceof Error ? err.message : 'Upload failed'}`)
      } finally {
        setUploadingCount((n) => n - 1)
      }
    }
  }

  const handlePasteSubmit = async () => {
    if (!pasteTitle.trim() || !pasteContent.trim() || pasting) return
    setPasting(true)
    try {
      await addText(pasteTitle.trim(), pasteContent.trim())
      setPasteOpen(false)
      setPasteTitle('')
      setPasteContent('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add text')
    } finally {
      setPasting(false)
    }
  }

  const handleTogglePin = async (doc: ProjectDocument) => {
    setPinBusyId(doc.id)
    try {
      await setDocumentTier(doc.id, doc.tier === 'pinned' ? 'rag' : 'pinned')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update document')
    } finally {
      setPinBusyId(null)
    }
  }

  const handleStartChat = () => {
    if (!project) return
    clearMessages()
    setCurrentProject({ id: project.id, name: project.name })
    setPendingNewChat(true)
    router.push('/chat')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <p className="text-muted-foreground">{error || 'Project not found'}</p>
        <Link href="/projects">
          <Button variant="outline">Back to projects</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Back + header */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Projects
        </Link>

        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <Input
                  ref={nameInputRef}
                  value={nameDraft}
                  maxLength={100}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSaveName()
                    } else if (e.key === 'Escape') {
                      setEditingName(false)
                    }
                  }}
                  onBlur={handleSaveName}
                  className="h-9 text-xl font-bold max-w-md"
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={handleSaveName}>
                  <Check className="h-4 w-4 text-green-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => setEditingName(false)}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ) : (
              <div className="group flex items-center gap-2">
                <h1 className="text-2xl font-bold truncate">{project.name}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setNameDraft(project.name)
                    setEditingName(true)
                  }}
                  title="Rename project"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {project.documents.length} {project.documents.length === 1 ? 'document' : 'documents'} ·{' '}
              ~{project.totalTokenCount.toLocaleString()} tokens of knowledge
            </p>
          </div>
          <Button
            onClick={handleStartChat}
            className="bg-[#0058be] hover:bg-[#004a9e] text-white shadow-none shrink-0"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Start chat in this project
          </Button>
        </div>

        {/* Instructions */}
        <div className="mb-8">
          <Label htmlFor="instructions" className="text-sm font-medium">
            Project instructions
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5 mb-2">
            Sherpa follows these in every chat in this project — voice rules, product names, audience, do&apos;s and don&apos;ts.
          </p>
          <Textarea
            id="instructions"
            value={instructionsDraft ?? project.instructions ?? ''}
            onChange={(e) => setInstructionsDraft(e.target.value)}
            placeholder="e.g. Our product is Acme Pipeline. We sell to mid-market RevOps leaders. Direct, no-fluff voice."
            rows={4}
          />
          {instructionsDraft !== null && instructionsDraft !== (project.instructions ?? '') && (
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                onClick={handleSaveInstructions}
                disabled={savingInstructions}
                className="bg-[#0058be] hover:bg-[#004a9e] text-white shadow-none"
              >
                {savingInstructions ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
                Save instructions
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setInstructionsDraft(null)}>
                Discard
              </Button>
            </div>
          )}
        </div>

        {/* Documents */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold">Documents</h2>
            {/* Pinned capacity meter */}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-36 bg-muted rounded-full h-1.5">
                <div
                  className="bg-[#0058be] h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (pinnedTokens / PINNED_TIER_TOKEN_CAP) * 100)}%` }}
                />
              </div>
              <span className="text-[11px] text-muted-foreground">
                Pinned: {pinnedTokens.toLocaleString()} / {PINNED_TIER_TOKEN_CAP.toLocaleString()} tokens
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPasteOpen(true)}>
              <ClipboardPaste className="h-3.5 w-3.5 mr-1.5" />
              Paste text
            </Button>
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingCount > 0}
              className="bg-[#0058be] hover:bg-[#004a9e] text-white shadow-none"
            >
              {uploadingCount > 0 ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5 mr-1.5" />
              )}
              {uploadingCount > 0 ? `Uploading (${uploadingCount})...` : 'Upload files'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_EXTENSIONS}
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files)
                e.target.value = ''
              }}
            />
          </div>
        </div>

        {project.documents.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl py-12 flex flex-col items-center text-center">
            <FileText className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="font-medium mb-1">No documents yet</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Upload brand guides, messaging docs, ICPs, decks, or paste text. Pin the must-use ones so they&apos;re in every prompt.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {project.documents.map((doc) => (
              <div
                key={doc.id}
                className="group flex items-center gap-3 rounded-lg border border-border/60 bg-card px-3 py-2.5"
              >
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    {doc.tier === 'pinned' && (
                      <Badge className="gap-1 text-[10px] bg-[#0058be]/10 text-[#0058be] dark:text-[#a8c0f0] border-0 px-1.5">
                        <Pin className="h-2.5 w-2.5" />
                        Pinned
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {doc.status === 'failed' && doc.error_message
                      ? doc.error_message
                      : doc.synopsis ||
                        (doc.status === 'ready'
                          ? `~${(doc.token_count || 0).toLocaleString()} tokens`
                          : 'Parsing and indexing...')}
                  </p>
                </div>
                <StatusChip doc={doc} />
                <div className="flex items-center gap-0.5 shrink-0">
                  {doc.status === 'failed' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title="Retry processing"
                      onClick={() =>
                        retryDocument(doc.id).catch((err) =>
                          toast.error(err instanceof Error ? err.message : 'Retry failed'),
                        )
                      }
                    >
                      <RotateCw className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {doc.status === 'ready' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      disabled={pinBusyId === doc.id}
                      title={doc.tier === 'pinned' ? 'Unpin (back to searchable tier)' : 'Pin: include full text in every prompt'}
                      onClick={() => handleTogglePin(doc)}
                    >
                      {pinBusyId === doc.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : doc.tier === 'pinned' ? (
                        <PinOff className="h-3.5 w-3.5" />
                      ) : (
                        <Pin className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive"
                    title="Delete document"
                    onClick={() => setDeleteTarget(doc)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paste text dialog */}
        <Dialog open={pasteOpen} onOpenChange={setPasteOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Paste text</DialogTitle>
              <DialogDescription>
                Add content directly — messaging copy, notes, a doc you don&apos;t have as a file.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="paste-title">Title</Label>
                <Input
                  id="paste-title"
                  placeholder="e.g. Messaging house v2"
                  value={pasteTitle}
                  maxLength={200}
                  onChange={(e) => setPasteTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paste-content">Content</Label>
                <Textarea
                  id="paste-content"
                  placeholder="Paste your text here..."
                  value={pasteContent}
                  rows={10}
                  onChange={(e) => setPasteContent(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setPasteOpen(false)} disabled={pasting}>
                Cancel
              </Button>
              <Button
                onClick={handlePasteSubmit}
                disabled={!pasteTitle.trim() || !pasteContent.trim() || pasting}
                className="bg-[#0058be] hover:bg-[#004a9e] text-white shadow-none"
              >
                {pasting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Add document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete document confirm */}
        <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete document?</AlertDialogTitle>
              <AlertDialogDescription>
                &ldquo;{deleteTarget?.title}&rdquo; and its indexed content will be removed from this project.
                This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (deleteTarget) {
                    deleteDocument(deleteTarget.id).catch((err) =>
                      toast.error(err instanceof Error ? err.message : 'Failed to delete document'),
                    )
                  }
                  setDeleteTarget(null)
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
