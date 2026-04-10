import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { trackCost } from '@/lib/cost-tracker'
import { startJobFromUrl } from '@/lib/llamaparse'

export const runtime = 'nodejs'
// No file buffering happens here any more — the client uploaded straight to
// Supabase Storage, and LlamaParse pulls the bytes itself via a signed URL.
// 30s is massive overkill; we're just minting a URL and making one API call.
export const maxDuration = 30

// Mirror of client-side SUPPORTED_FILE_TYPES — kept in sync with
// src/components/chat/FileUpload.tsx. The server validates too so a
// hand-crafted request can't bypass the client checks.
const SUPPORTED_FILE_TYPES: Record<string, { maxSize: number; category: string }> = {
  // PDFs + Office
  'application/pdf': { maxSize: 50 * 1024 * 1024, category: 'document' },
  'application/msword': { maxSize: 25 * 1024 * 1024, category: 'document' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { maxSize: 25 * 1024 * 1024, category: 'document' },
  'application/vnd.ms-powerpoint': { maxSize: 50 * 1024 * 1024, category: 'document' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { maxSize: 50 * 1024 * 1024, category: 'document' },
  'application/vnd.ms-excel': { maxSize: 25 * 1024 * 1024, category: 'document' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { maxSize: 25 * 1024 * 1024, category: 'document' },
  // LibreOffice / OpenDocument
  'application/vnd.oasis.opendocument.text': { maxSize: 25 * 1024 * 1024, category: 'document' },
  'application/vnd.oasis.opendocument.spreadsheet': { maxSize: 25 * 1024 * 1024, category: 'document' },
  'application/vnd.oasis.opendocument.presentation': { maxSize: 50 * 1024 * 1024, category: 'document' },
  // Rich / structured docs
  'application/rtf': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'text/rtf': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'application/epub+zip': { maxSize: 25 * 1024 * 1024, category: 'document' },
  'text/html': { maxSize: 10 * 1024 * 1024, category: 'document' },
  // Plain text formats
  'text/plain': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'text/csv': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'text/markdown': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'text/x-markdown': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'application/json': { maxSize: 10 * 1024 * 1024, category: 'document' },
  // Images
  'image/png': { maxSize: 10 * 1024 * 1024, category: 'image' },
  'image/jpeg': { maxSize: 10 * 1024 * 1024, category: 'image' },
  'image/gif': { maxSize: 10 * 1024 * 1024, category: 'image' },
  'image/webp': { maxSize: 10 * 1024 * 1024, category: 'image' },
  'image/heic': { maxSize: 10 * 1024 * 1024, category: 'image' },
  // Video
  'video/mp4': { maxSize: 100 * 1024 * 1024, category: 'video' },
  'video/webm': { maxSize: 100 * 1024 * 1024, category: 'video' },
  'video/quicktime': { maxSize: 100 * 1024 * 1024, category: 'video' },
}

const INLINE_TEXT_TYPES = new Set<string>([
  'text/plain',
  'text/csv',
  'text/markdown',
  'text/x-markdown',
  'application/json',
])

const LLAMA_PARSE_TYPES = new Set<string>([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
  'application/rtf',
  'text/rtf',
  'application/epub+zip',
  'text/html',
])

const BUCKET = 'conversation-files'

/**
 * Turn a Supabase public URL (or any variant) back into the raw object path
 * within the bucket. We accept either:
 *   - `${user.id}/temp/abc.pdf`                         (object path)
 *   - `https://.../storage/v1/object/public/conversation-files/${path}`
 */
function extractObjectPath(input: string): string | null {
  if (!input) return null
  const marker = `/object/public/${BUCKET}/`
  const idx = input.indexOf(marker)
  if (idx !== -1) return decodeURIComponent(input.slice(idx + marker.length))
  // Assume it's already a bucket-relative path
  return input
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // New contract: JSON body with metadata about a file the client has
    // already uploaded to Supabase Storage. No more FormData = no more
    // 4.5 MB Vercel request-body cap.
    let body: {
      storagePath?: string
      fileName?: string
      fileType?: string
      fileSize?: number
      conversationId?: string | null
      // Optional: inline text for text/plain/csv/md/json — client reads
      // these directly since they're tiny, and sends the content so we
      // skip a round-trip to storage.
      inlineText?: string
    }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Expected JSON body with { storagePath, fileName, fileType, fileSize }' },
        { status: 400 },
      )
    }

    const { storagePath: rawPath, fileName, fileType, fileSize, conversationId, inlineText } = body

    if (!rawPath || !fileName || !fileType || typeof fileSize !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: storagePath, fileName, fileType, fileSize' },
        { status: 400 },
      )
    }

    const objectPath = extractObjectPath(rawPath)
    if (!objectPath) {
      return NextResponse.json({ error: 'Invalid storagePath' }, { status: 400 })
    }

    // Security: object path must start with the caller's user id. Without
    // this a malicious client could claim someone else's file.
    if (!objectPath.startsWith(`${user.id}/`)) {
      return NextResponse.json(
        { error: 'storagePath does not belong to the authenticated user' },
        { status: 403 },
      )
    }

    // Validate file type
    const typeConfig = SUPPORTED_FILE_TYPES[fileType]
    if (!typeConfig) {
      return NextResponse.json({ error: `Unsupported file type: ${fileType}` }, { status: 400 })
    }
    if (fileSize > typeConfig.maxSize) {
      const maxSizeMB = typeConfig.maxSize / (1024 * 1024)
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSizeMB}MB` },
        { status: 400 },
      )
    }

    // Verify the file actually exists in storage under the claimed path.
    // Supabase doesn't expose a single-object HEAD, so we list the prefix.
    const lastSlash = objectPath.lastIndexOf('/')
    const folder = lastSlash > -1 ? objectPath.slice(0, lastSlash) : ''
    const basename = lastSlash > -1 ? objectPath.slice(lastSlash + 1) : objectPath
    const { data: listed, error: listErr } = await supabase.storage
      .from(BUCKET)
      .list(folder, { search: basename, limit: 1 })
    if (listErr || !listed || listed.length === 0 || listed[0].name !== basename) {
      return NextResponse.json(
        { error: 'File not found in storage at the given path' },
        { status: 404 },
      )
    }

    // Public URL for display / vision models. The bucket is public, but we
    // still mint a signed URL for LlamaParse below so it keeps working if
    // the bucket is locked down later.
    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(objectPath)
    const publicUrl = urlData.publicUrl

    // Resolve text strategy
    let extractedText: string | null = null
    let llamaparseJobId: string | null = null
    let processingStatus: 'pending' | 'processing' | 'completed' | 'failed' = 'pending'

    if (INLINE_TEXT_TYPES.has(fileType)) {
      if (typeof inlineText === 'string' && inlineText.length > 0) {
        extractedText = inlineText
        processingStatus = 'completed'
      } else {
        processingStatus = 'pending'
      }
    } else if (LLAMA_PARSE_TYPES.has(fileType)) {
      // Signed URL with 1h TTL — plenty for a parse job, and short enough
      // that a leaked URL isn't a long-term exposure.
      const { data: signed, error: signErr } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(objectPath, 60 * 60)

      if (signErr || !signed?.signedUrl) {
        console.error('[Upload] createSignedUrl failed:', signErr)
        processingStatus = 'failed'
      } else {
        try {
          llamaparseJobId = await startJobFromUrl(signed.signedUrl, fileName)
          if (llamaparseJobId) {
            processingStatus = 'processing'
            trackCost({
              userId: user.id,
              service: 'llamaparse',
              operation: 'doc_parse',
              units: 1,
              unitType: 'pages',
              metadata: { fileName, fileType, fileSize },
            })
          } else {
            processingStatus = 'failed'
          }
        } catch (err) {
          console.error('[Upload] LlamaParse start failed:', err)
          processingStatus = 'failed'
        }
      }
    } else {
      // Images, video — nothing to parse, just record the row
      processingStatus = 'completed'
    }

    // Create attachment record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: attachment, error: dbError } = await (supabase.from('conversation_attachments') as any)
      .insert({
        conversation_id: conversationId || null,
        user_id: user.id,
        file_name: fileName,
        file_type: fileType,
        file_size: fileSize,
        storage_path: publicUrl,
        extracted_text: extractedText,
        llamaparse_job_id: llamaparseJobId,
        processing_status: processingStatus,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      // Clean up the stored file so we don't leave an orphan
      await supabase.storage.from(BUCKET).remove([objectPath])
      return NextResponse.json(
        { error: 'Failed to save attachment record' },
        { status: 500 },
      )
    }

    return NextResponse.json({
      id: attachment.id,
      fileName: attachment.file_name,
      fileType: attachment.file_type,
      fileSize: attachment.file_size,
      storagePath: attachment.storage_path,
      extractedText: attachment.extracted_text,
      processingStatus: attachment.processing_status,
    })
  } catch (error) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}

// Delete attachment endpoint
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const attachmentId = searchParams.get('id')

    if (!attachmentId) {
      return NextResponse.json({ error: 'Attachment ID required' }, { status: 400 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: attachment, error: fetchError } = await (supabase.from('conversation_attachments') as any)
      .select('*')
      .eq('id', attachmentId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 })
    }

    const objectPath = extractObjectPath(attachment.storage_path)
    if (objectPath) {
      await supabase.storage.from(BUCKET).remove([objectPath])
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('conversation_attachments') as any)
      .delete()
      .eq('id', attachmentId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete attachment error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    )
  }
}
