import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { trackCost } from '@/lib/cost-tracker'

export const runtime = 'nodejs'
export const maxDuration = 60 // Vercel Hobby plan cap

// Supported file types and their max sizes
const SUPPORTED_FILE_TYPES: Record<string, { maxSize: number; category: string }> = {
  'application/pdf': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'application/msword': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'application/vnd.ms-powerpoint': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'application/vnd.ms-excel': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'text/plain': { maxSize: 5 * 1024 * 1024, category: 'document' },
  'text/csv': { maxSize: 5 * 1024 * 1024, category: 'document' },
  'image/png': { maxSize: 5 * 1024 * 1024, category: 'image' },
  'image/jpeg': { maxSize: 5 * 1024 * 1024, category: 'image' },
  'image/gif': { maxSize: 5 * 1024 * 1024, category: 'image' },
  'image/webp': { maxSize: 5 * 1024 * 1024, category: 'image' },
  'video/mp4': { maxSize: 50 * 1024 * 1024, category: 'video' },
  'video/webm': { maxSize: 50 * 1024 * 1024, category: 'video' },
}

const LLAMA_PARSE_BASE = 'https://api.cloud.llamaindex.ai'

// Uses the LlamaParse v1 REST API (the stable, production API used by the
// official Python and TypeScript clients). The v2 paths that previously
// lived here do not exist and every parse job was 404ing.
// Endpoints:
//   POST /api/v1/parsing/upload                       -> { id }
//   GET  /api/v1/parsing/job/{id}                     -> { status }
//   GET  /api/v1/parsing/job/{id}/result/markdown     -> { markdown }
// Status values: PENDING, SUCCESS, ERROR, CANCELED
async function parseWithLlamaParse(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string | null> {
  const apiKey = process.env.LLAMA_CLOUD_API_KEY
  if (!apiKey) {
    console.warn('[LlamaParse] LLAMA_CLOUD_API_KEY not set, skipping document parsing')
    return null
  }

  // Step 1: Upload file and start parse job
  const uploadForm = new FormData()
  const blob = new Blob([new Uint8Array(fileBuffer)], { type: mimeType })
  uploadForm.append('file', blob, fileName)
  // v1 parsing config — flat form fields, not a JSON configuration blob
  uploadForm.append('parsing_instruction', '')
  uploadForm.append('result_type', 'markdown')
  uploadForm.append('annotate_links', 'true')
  uploadForm.append('output_tables_as_HTML', 'false')

  const uploadRes = await fetch(`${LLAMA_PARSE_BASE}/api/v1/parsing/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}` },
    body: uploadForm,
  })

  if (!uploadRes.ok) {
    const err = await uploadRes.text()
    console.error(`[LlamaParse] Upload failed for ${fileName}: status=${uploadRes.status} body=${err.slice(0, 500)}`)
    return null
  }

  const uploadJson = await uploadRes.json()
  const jobId: string = uploadJson.id
  if (!jobId) {
    console.error(`[LlamaParse] Upload returned no job ID for ${fileName}:`, JSON.stringify(uploadJson).slice(0, 500))
    return null
  }
  console.log(`[LlamaParse] Job created: ${jobId} for ${fileName}`)

  // Step 2: Poll for completion.
  // Vercel Hobby caps functions at 60s. Upload + cold start burns a few
  // seconds, so budget ~50s for polling: 25 attempts × 2s = 50s max.
  const maxAttempts = 25
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 2000))

    const pollRes = await fetch(`${LLAMA_PARSE_BASE}/api/v1/parsing/job/${jobId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })

    if (!pollRes.ok) {
      const err = await pollRes.text()
      console.error(`[LlamaParse] Poll ${i + 1}/${maxAttempts} failed for ${jobId}: status=${pollRes.status} body=${err.slice(0, 300)}`)
      continue
    }

    const pollData = await pollRes.json()
    const status: string = pollData.status
    console.log(`[LlamaParse] Poll ${i + 1}/${maxAttempts} for ${jobId}: status=${status}`)

    if (status === 'SUCCESS') {
      // Step 3: Fetch markdown result
      const resultRes = await fetch(
        `${LLAMA_PARSE_BASE}/api/v1/parsing/job/${jobId}/result/markdown`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      )

      if (!resultRes.ok) {
        const err = await resultRes.text()
        console.error(`[LlamaParse] Result fetch failed for ${jobId}: status=${resultRes.status} body=${err.slice(0, 300)}`)
        return null
      }

      const result = await resultRes.json()
      const markdown: string | undefined = result.markdown

      if (markdown && markdown.trim()) {
        console.log(`[LlamaParse] Successfully parsed ${fileName}: ${markdown.length} chars`)
        return markdown
      }
      console.warn(`[LlamaParse] SUCCESS but empty markdown for ${fileName}:`, JSON.stringify(result).slice(0, 500))
      return null
    }

    if (status === 'ERROR' || status === 'CANCELED') {
      const errorMsg = pollData.error_message || pollData.error_code || 'Unknown error'
      console.error(`[LlamaParse] Job ${status} for ${fileName}: ${errorMsg}`)
      return null
    }
  }

  console.error(`[LlamaParse] Timed out after ~50s polling job ${jobId} (${fileName})`)
  return null
}

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

    // Buffer the file once — used for both Supabase upload and LlamaParse
    const arrayBuffer = await file.arrayBuffer()
    const fileBuffer = Buffer.from(arrayBuffer)
    const uint8Array = new Uint8Array(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
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

    // Get public URL for the file
    const { data: urlData } = supabase.storage
      .from('conversation-files')
      .getPublicUrl(storagePath)

    // Extract text from documents
    let extractedText: string | null = null
    const PARSEABLE_TYPES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ]

    if (file.type === 'text/plain' || file.type === 'text/csv') {
      try {
        extractedText = await file.text()
      } catch {
        console.warn('Failed to extract text from text file')
      }
    } else if (PARSEABLE_TYPES.includes(file.type)) {
      try {
        extractedText = await parseWithLlamaParse(fileBuffer, file.name, file.type)
        if (extractedText) {
          trackCost({
            userId: user.id,
            service: 'llamaparse',
            operation: 'doc_parse',
            units: 1,
            unitType: 'pages',
            metadata: { fileName: file.name, fileType: file.type, fileSize: file.size },
          })
        }
      } catch (err) {
        console.error('LlamaParse extraction failed:', err)
      }
    }

    // Create attachment record in database
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
        processing_status: extractedText ? 'completed' : 'pending',
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      // Try to clean up the uploaded file
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

    // Get attachment to verify ownership and get storage path
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: attachment, error: fetchError } = await (supabase.from('conversation_attachments') as any)
      .select('*')
      .eq('id', attachmentId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !attachment) {
      return NextResponse.json({ error: 'Attachment not found' }, { status: 404 })
    }

    // Extract the storage path from the URL
    const storagePathMatch = attachment.storage_path.match(/conversation-files\/(.+)$/)
    if (storagePathMatch) {
      const storagePath = storagePathMatch[1]
      await supabase.storage.from('conversation-files').remove([storagePath])
    }

    // Delete from database
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
