'use client'

import { useCallback, useRef } from 'react'
import { Paperclip } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Supported file types and their max sizes
export const SUPPORTED_FILE_TYPES = {
  // Documents
  'application/pdf': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'application/msword': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'text/plain': { maxSize: 5 * 1024 * 1024, category: 'document' },
  // Images
  'image/png': { maxSize: 5 * 1024 * 1024, category: 'image' },
  'image/jpeg': { maxSize: 5 * 1024 * 1024, category: 'image' },
  'image/gif': { maxSize: 5 * 1024 * 1024, category: 'image' },
  'image/webp': { maxSize: 5 * 1024 * 1024, category: 'image' },
  // Videos
  'video/mp4': { maxSize: 50 * 1024 * 1024, category: 'video' },
  'video/webm': { maxSize: 50 * 1024 * 1024, category: 'video' },
} as const

export type SupportedMimeType = keyof typeof SUPPORTED_FILE_TYPES

export interface UploadedFile {
  id: string
  file: File
  preview?: string
  status: 'pending' | 'uploading' | 'completed' | 'error'
  progress: number
  error?: string
  storagePath?: string
  extractedText?: string
}

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
  maxFiles?: number
}

export function FileUpload({ onFilesSelected, disabled, maxFiles = 5 }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const validateFile = useCallback((file: File): { valid: boolean; error?: string } => {
    const fileType = file.type as SupportedMimeType
    const typeConfig = SUPPORTED_FILE_TYPES[fileType]

    if (!typeConfig) {
      return {
        valid: false,
        error: `Unsupported file type: ${file.type || 'unknown'}. Supported: PDF, DOC, DOCX, TXT, PNG, JPG, GIF, WEBP, MP4, WEBM`
      }
    }

    if (file.size > typeConfig.maxSize) {
      const maxSizeMB = typeConfig.maxSize / (1024 * 1024)
      return {
        valid: false,
        error: `File too large. Max size for ${typeConfig.category}s is ${maxSizeMB}MB`
      }
    }

    return { valid: true }
  }, [])

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (files.length === 0) return

    // Limit number of files
    const filesToProcess = files.slice(0, maxFiles)

    // Validate each file
    const validFiles: File[] = []
    const errors: string[] = []

    for (const file of filesToProcess) {
      const validation = validateFile(file)
      if (validation.valid) {
        validFiles.push(file)
      } else {
        errors.push(`${file.name}: ${validation.error}`)
      }
    }

    // Show errors if any
    if (errors.length > 0) {
      console.warn('File validation errors:', errors)
      // Could show a toast notification here
    }

    if (validFiles.length > 0) {
      onFilesSelected(validFiles)
    }

    // Reset input
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }, [onFilesSelected, maxFiles, validateFile])

  const handleClick = useCallback(() => {
    inputRef.current?.click()
  }, [])

  // Build accept string from supported types
  const acceptTypes = Object.keys(SUPPORTED_FILE_TYPES).join(',')

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={acceptTypes}
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleClick}
        disabled={disabled}
        className="h-10 w-10 rounded-xl shrink-0 text-muted-foreground hover:text-foreground hover:bg-white/50 dark:hover:bg-zinc-800/50"
        title="Attach files (PDF, images, documents)"
      >
        <Paperclip className="h-5 w-5" />
      </Button>
    </>
  )
}

// Helper to get file category
export function getFileCategory(mimeType: string): 'document' | 'image' | 'video' | 'unknown' {
  const config = SUPPORTED_FILE_TYPES[mimeType as SupportedMimeType]
  return config?.category || 'unknown'
}

// Helper to format file size
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
