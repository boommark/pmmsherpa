import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'
export const maxDuration = 60

// Supported file types and their max sizes
const SUPPORTED_FILE_TYPES: Record<string, { maxSize: number; category: string }> = {
  'application/pdf': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'application/msword': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { maxSize: 10 * 1024 * 1024, category: 'document' },
  'text/plain': { maxSize: 5 * 1024 * 1024, category: 'document' },
  'image/png': { maxSize: 5 * 1024 * 1024, category: 'image' },
  'image/jpeg': { maxSize: 5 * 1024 * 1024, category: 'image' },
  'image/gif': { maxSize: 5 * 1024 * 1024, category: 'image' },
  'image/webp': { maxSize: 5 * 1024 * 1024, category: 'image' },
  'video/mp4': { maxSize: 50 * 1024 * 1024, category: 'video' },
  'video/webm': { maxSize: 50 * 1024 * 1024, category: 'video' },
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

    // Convert File to ArrayBuffer for upload
    const arrayBuffer = await file.arrayBuffer()
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

    // Extract text for documents (basic text extraction for .txt files)
    let extractedText: string | null = null
    if (file.type === 'text/plain') {
      try {
        extractedText = await file.text()
      } catch {
        console.warn('Failed to extract text from file')
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
