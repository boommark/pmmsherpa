'use client'

import { useCallback } from 'react'
import { X, FileText, Image as ImageIcon, Video, File, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { type UploadedFile, getFileCategory, formatFileSize } from './FileUpload'

interface AttachmentPreviewProps {
  files: UploadedFile[]
  onRemove: (id: string) => void
  disabled?: boolean
}

export function AttachmentPreview({ files, onRemove, disabled }: AttachmentPreviewProps) {
  if (files.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 px-3 pb-2">
      {files.map((file) => (
        <AttachmentItem
          key={file.id}
          file={file}
          onRemove={() => onRemove(file.id)}
          disabled={disabled}
        />
      ))}
    </div>
  )
}

interface AttachmentItemProps {
  file: UploadedFile
  onRemove: () => void
  disabled?: boolean
}

function AttachmentItem({ file, onRemove, disabled }: AttachmentItemProps) {
  const category = getFileCategory(file.file.type)

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onRemove()
  }, [onRemove])

  // Get the appropriate icon
  const Icon = getIconForCategory(category)

  // Determine status styles
  const getStatusStyles = () => {
    switch (file.status) {
      case 'uploading':
        return 'border-indigo-300 dark:border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30'
      case 'completed':
        return 'border-green-300 dark:border-green-600 bg-green-50/50 dark:bg-green-950/30'
      case 'error':
        return 'border-red-300 dark:border-red-600 bg-red-50/50 dark:bg-red-950/30'
      default:
        return 'border-white/30 dark:border-zinc-700/50 bg-white/50 dark:bg-zinc-800/50'
    }
  }

  return (
    <div
      className={`group relative flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${getStatusStyles()}`}
    >
      {/* Preview or icon */}
      <div className="flex-shrink-0">
        {file.preview && category === 'image' ? (
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={file.preview}
              alt={file.file.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconBgColor(category)}`}>
            <Icon className={`h-5 w-5 ${getIconColor(category)}`} />
          </div>
        )}
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0 pr-6">
        <p className="text-sm font-medium truncate max-w-[150px]" title={file.file.name}>
          {file.file.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {file.status === 'uploading' && file.progress < 100
            ? `Uploading... ${file.progress}%`
            : file.status === 'error'
            ? file.error || 'Upload failed'
            : formatFileSize(file.file.size)}
        </p>
      </div>

      {/* Loading indicator or remove button */}
      {file.status === 'uploading' ? (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
        </div>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          disabled={disabled}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 dark:hover:bg-red-950"
        >
          <X className="h-3 w-3 text-red-500" />
        </Button>
      )}
    </div>
  )
}

function getIconForCategory(category: 'document' | 'image' | 'video' | 'unknown') {
  switch (category) {
    case 'document':
      return FileText
    case 'image':
      return ImageIcon
    case 'video':
      return Video
    default:
      return File
  }
}

function getIconBgColor(category: 'document' | 'image' | 'video' | 'unknown') {
  switch (category) {
    case 'document':
      return 'bg-blue-100 dark:bg-blue-900/30'
    case 'image':
      return 'bg-purple-100 dark:bg-purple-900/30'
    case 'video':
      return 'bg-pink-100 dark:bg-pink-900/30'
    default:
      return 'bg-zinc-100 dark:bg-zinc-800'
  }
}

function getIconColor(category: 'document' | 'image' | 'video' | 'unknown') {
  switch (category) {
    case 'document':
      return 'text-blue-600 dark:text-blue-400'
    case 'image':
      return 'text-purple-600 dark:text-purple-400'
    case 'video':
      return 'text-pink-600 dark:text-pink-400'
    default:
      return 'text-zinc-600 dark:text-zinc-400'
  }
}

// Component for displaying attachments in message bubbles
interface MessageAttachmentProps {
  fileName: string
  fileType: string
  fileSize: number
  storagePath: string
  thumbnailPath?: string | null
}

export function MessageAttachment({
  fileName,
  fileType,
  fileSize,
  storagePath,
  thumbnailPath,
}: MessageAttachmentProps) {
  const category = getFileCategory(fileType)
  const Icon = getIconForCategory(category)

  const handleClick = useCallback(() => {
    // Open file in new tab or trigger download
    window.open(storagePath, '_blank')
  }, [storagePath])

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 rounded-xl border border-white/20 dark:border-zinc-700/50 bg-white/30 dark:bg-zinc-800/30 px-3 py-2 hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors text-left"
    >
      {thumbnailPath && category === 'image' ? (
        <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailPath}
            alt={fileName}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconBgColor(category)}`}>
          <Icon className={`h-5 w-5 ${getIconColor(category)}`} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium truncate max-w-[200px]" title={fileName}>
          {fileName}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(fileSize)}
        </p>
      </div>
    </button>
  )
}
