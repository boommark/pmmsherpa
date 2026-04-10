import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { trackCost } from '@/lib/cost-tracker'
import { startJob as startLlamaParseJob } from '@/lib/llamaparse'

export const runtime = 'nodejs'
// We no longer block on LlamaParse inside this handler — parsing is kicked
// off as a background job and finalized lazily by the chat route. 30s is
// plenty for: auth + Supabase Storage upload + LlamaParse job creation.
export const maxDuration = 30

// Supported file types and their max sizes.
// LlamaParse v2 handles everything in the 'document' category; text/csv/md
// are extracted inline; images & video are stored and handed to vision/LLMs.
const SUPPORTED_FILE_TYPES: Record<string, { maxSize: number; category: string }> = {
  // PDFs + Office
  'application/pdf': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'application/msword': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'application/vnd.ms-powerpoint': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'application/vnd.ms-excel': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { maxSize: 10 * 1024 * 1024, category: 'document' },
  // LibreOffice / OpenDocument
  'application/vnd.oasis.opendocument.text': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'application/vnd.oasis.opendocument.spreadsheet': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'application/vnd.oasis.opendocument.presentation': { maxSize: 10 * 1024 * 1024, category: 'document' },
  // Rich / structured docs
  'application/rtf': { maxSize: 5 * 1024 * 1024, category: 'document' },
  'text/rtf': { maxSize: 5 * 1024 * 1024, category: 'document' },
  'application/epub+zip': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'text/html': { maxSize: 5 * 1024 * 1024, category: 'document' },
  // Plain text formats (extracted inline, no LlamaParse needed)
  'text/plain': { maxSize: 5 * 1024 * 1024, category: 'document' },
  'text/csv': { maxSize: 5 * 1024 * 1024, category: 'document' },
  'text/markdown': { maxSize: 5 * 1024 * 1024, category: 'document' },
  'text/x-markdown': { maxSize: 5 * 1024 * 1024, category: 'document' },
  'application/json': { maxSize: 5 * 1024 * 1024, category: 'document' },
  // Images — stored and handed to vision models
  'image/png': { maxSize: 5 * 1024 * 1024, category: 'image' },
  'image/jpeg': { maxSize: 5 * 1024 * 1024, category: 'image' },
  'image/gif': { maxSize: 5 * 1024 * 1024, category: 'image' },
  'image/webp': { maxSize: 5 * 1024 * 1024, category: 'image' },
  'image/heic': { maxSize: 5 * 1024 * 1024, category: 'image' },
  // Video
  'video/mp4': { maxSize: 50 * 1024 * 1024, category: 'video' },
  'video/webm': { maxSize: 50 * 1024 * 1024, category: 'video' },
  'video/quicktime': { maxSize: 50 * 1024 * 1024, category: 'video' },
}

// Types we send to LlamaParse v2 (anything in 'document' that isn't plain text).
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

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const conversationId = formData.get('conversationId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const typeConfig = SUPPORTED_FILE_TYPES[file.type]
    if (!typeConfig) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > typeConfig.maxSize) {
      const maxSizeMB = typeConfig.maxSize / (1024 * 1024)
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSizeMB}MB` },
        { status: 400 }
      )
    }

    // Generate storage path: user_id/conversation_id or user_id/temp/file_id
    const fileId = crypto.randomUUID()
    const fileExtension = file.name.split('.').pop() || ''
    const sanitizedFileName = `${fileId}${fileExtension ? '.' + fileExtension : ''}`
    const storagePath = conversationId
      ? `${user.id}/${conversationId}/${sanitizedFileName}`
      : `${user.id}/temp/${sanitizedFileName}`

    // Buffer once — used for both Supabase upload and LlamaParse
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)
    const uint8Array = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('conversation-files')
      .upload(storagePath, uint8Array, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      )
    }

    // Public URL for the stored file
    const { data: urlData } = supabase.storage
      .from('conversation-files')
      .getPublicUrl(storagePath)

    // Resolve extracted text strategy
    //   - INLINE_TEXT_TYPES: read the bytes right here, done
    //   - LLAMA_PARSE_TYPES: kick off a v2 job, save job_id, finish later
    //   - everything else (images/video): nothing to extract
    let extractedText: string | null = null
    let llamaparseJobId: string | null = null
    let processingStatus: 'pending' | 'processing' | 'completed' | 'failed' = 'pending'

    if (INLINE_TEXT_TYPES.has(file.type)) {
      try {
        extractedText = await file.text()
        processingStatus = 'completed'
      } catch (err) {
        console.warn('Failed to read text file inline:', err)
        processingStatus = 'failed'
      }
    } else if (LLAMA_PARSE_TYPES.has(file.type)) {
      try {
        llamaparseJobId = await startLlamaParseJob(fileBuffer, file.name, file.type)
        if (llamaparseJobId) {
          processingStatus = 'processing'
          trackCost({
            userId: user.id,
            service: 'llamaparse',
            operation: 'doc_parse',
            units: 1,
            unitType: 'pages',
            metadata: { fileName: file.name, fileType: file.type, fileSize: file.size },
          })
        } else {
          processingStatus = 'failed'
        }
      } catch (err) {
        console.error('[Upload] LlamaParse start failed:', err)
        processingStatus = 'failed'
      }
    } else {
      // Images, video — nothing to parse
      processingStatus = 'completed'
    }

    // Create attachment record
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: attachment, error: dbError } = await (supabase.from('conversation_attachments') as any)
      .insert({
        conversation_id: conversationId || null,
        user_id: user.id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        storage_path: urlData.publicUrl,
        extracted_text: extractedText,
        llamaparse_job_id: llamaparseJobId,
        processing_status: processingStatus,
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      await supabase.storage.from('conversation-files').remove([storagePath])
      return NextResponse.json(
        { error: 'Failed to save attachment record' },
        { status: 500 }
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
      { status: 500 }
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

    const storagePathMatch = attachment.storage_path.match(/conversation-files\/(.+)$/)
    if (storagePathMatch) {
      const storagePath = storagePathMatch[1]
      await supabase.storage.from('conversation-files').remove([storagePath])
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
      { status: 500 }
    )
  }
}
