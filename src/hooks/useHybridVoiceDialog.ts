'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import type { TTSVoice } from '@/types/database'
import type { ModelProvider } from '@/lib/llm/provider-factory'

interface HybridVoiceMessage {
  role: 'user' | 'assistant'
  content: string
}

interface UseHybridVoiceDialogOptions {
  conversationId?: string
  model?: ModelProvider
  voice?: TTSVoice
  onMessage?: (message: HybridVoiceMessage) => void
  onError?: (error: Error) => void
}

type DialogState = 'idle' | 'connecting' | 'listening' | 'processing' | 'generating' | 'speaking'

export function useHybridVoiceDialog({
  conversationId,
  model = 'claude-sonnet',
  voice = 'nova',
  onMessage,
  onError
}: UseHybridVoiceDialogOptions = {}) {
  const [isActive, setIsActive] = useState(false)
  const [dialogState, setDialogState] = useState<DialogState>('idle')
  const [transcript, setTranscript] = useState('')
  const [aiResponse, setAiResponse] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)
  const isActiveRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Cleanup function
  const cleanup = useCallback(() => {
    isActiveRef.current = false

    // Abort any ongoing fetch requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // Stop media recorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    mediaRecorderRef.current = null

    // Stop microphone stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    // Stop audio playback
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    // Revoke audio URL
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current)
      audioUrlRef.current = null
    }

    audioChunksRef.current = []
    setIsActive(false)
    setDialogState('idle')
    setTranscript('')
    setAiResponse('')
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  // Start recording audio
  const startRecording = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      })
      streamRef.current = stream

      // Determine best supported mime type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onerror = () => {
        onError?.(new Error('Recording failed'))
        cleanup()
      }

      // Start recording
      mediaRecorder.start(100)
      setDialogState('listening')
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          onError?.(new Error('Microphone access denied. Please allow microphone access.'))
        } else if (error.name === 'NotFoundError') {
          onError?.(new Error('No microphone found. Please connect a microphone.'))
        } else {
          onError?.(error)
        }
      }
      cleanup()
    }
  }, [onError, cleanup])

  // Stop recording and process
  const stopRecordingAndProcess = useCallback(async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      return
    }

    setDialogState('processing')

    return new Promise<void>((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!

      mediaRecorder.onstop = async () => {
        // Stop microphone stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }

        const mimeType = mediaRecorder.mimeType
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })
        audioChunksRef.current = []

        if (audioBlob.size === 0) {
          onError?.(new Error('No audio recorded. Please try again.'))
          if (isActiveRef.current) {
            setDialogState('listening')
            startRecording()
          }
          resolve()
          return
        }

        try {
          // Step 1: Transcribe audio with Whisper
          const formData = new FormData()
          const extension = mimeType.includes('webm') ? 'webm' : 'mp4'
          formData.append('audio', audioBlob, `recording.${extension}`)

          abortControllerRef.current = new AbortController()

          const transcribeResponse = await fetch('/api/voice/transcribe', {
            method: 'POST',
            body: formData,
            signal: abortControllerRef.current.signal
          })

          if (!transcribeResponse.ok) {
            throw new Error('Transcription failed')
          }

          const { text: transcribedText } = await transcribeResponse.json()

          if (!transcribedText || !transcribedText.trim()) {
            onError?.(new Error('No speech detected. Please try again.'))
            if (isActiveRef.current) {
              setDialogState('listening')
              startRecording()
            }
            resolve()
            return
          }

          // Update transcript and notify
          setTranscript(transcribedText.trim())
          onMessage?.({ role: 'user', content: transcribedText.trim() })

          // Step 2: Send to Claude/RAG via chat API
          setDialogState('generating')
          setAiResponse('')

          abortControllerRef.current = new AbortController()

          const chatResponse = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: transcribedText.trim(),
              conversationId,
              model,
              webSearchEnabled: false,
              perplexityEnabled: false
            }),
            signal: abortControllerRef.current.signal
          })

          if (!chatResponse.ok) {
            throw new Error('Failed to get AI response')
          }

          // Parse streaming response
          const reader = chatResponse.body?.getReader()
          const decoder = new TextDecoder()
          let fullResponse = ''

          if (reader) {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break

              const chunk = decoder.decode(value, { stream: true })
              const lines = chunk.split('\n')

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.slice(6))
                    if (data.type === 'text' && data.content) {
                      fullResponse += data.content
                      setAiResponse(fullResponse)
                    } else if (data.type === 'done') {
                      // Response complete
                    }
                  } catch {
                    // Ignore parse errors for incomplete chunks
                  }
                }
              }
            }
          }

          if (!fullResponse.trim()) {
            throw new Error('Empty response from AI')
          }

          onMessage?.({ role: 'assistant', content: fullResponse.trim() })

          // Step 3: Convert response to speech
          setDialogState('speaking')

          // Clean up text for TTS (strip markdown)
          const cleanText = fullResponse
            .replace(/#{1,6}\s/g, '')
            .replace(/\*\*(.+?)\*\*/g, '$1')
            .replace(/\*(.+?)\*/g, '$1')
            .replace(/`{1,3}[^`]*`{1,3}/g, '')
            .replace(/\[(.+?)\]\(.+?\)/g, '$1')
            .replace(/^\s*[-*+]\s/gm, '')
            .replace(/^\s*\d+\.\s/gm, '')
            .replace(/\n+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()

          // Truncate if too long
          const truncatedText = cleanText.length > 4000
            ? cleanText.substring(0, 4000) + '...'
            : cleanText

          abortControllerRef.current = new AbortController()

          const ttsResponse = await fetch('/api/voice/speak', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: truncatedText, voice }),
            signal: abortControllerRef.current.signal
          })

          if (!ttsResponse.ok) {
            throw new Error('Speech generation failed')
          }

          const audioResponseBlob = await ttsResponse.blob()
          const audioUrl = URL.createObjectURL(audioResponseBlob)

          // Clean up previous audio URL
          if (audioUrlRef.current) {
            URL.revokeObjectURL(audioUrlRef.current)
          }
          audioUrlRef.current = audioUrl

          const audio = new Audio(audioUrl)
          audioRef.current = audio

          audio.onended = () => {
            // After speaking, start listening again if still active
            if (isActiveRef.current) {
              setTranscript('')
              setAiResponse('')
              startRecording()
            }
          }

          audio.onerror = () => {
            onError?.(new Error('Audio playback failed'))
            if (isActiveRef.current) {
              setTranscript('')
              setAiResponse('')
              startRecording()
            }
          }

          await audio.play()

        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            // Request was aborted, don't show error
            resolve()
            return
          }
          console.error('Voice dialog error:', error)
          onError?.(error instanceof Error ? error : new Error('Voice dialog failed'))

          // Try to continue if still active
          if (isActiveRef.current) {
            setDialogState('listening')
            startRecording()
          }
        }

        resolve()
      }

      mediaRecorder.stop()
    })
  }, [conversationId, model, voice, onMessage, onError, startRecording])

  // Start the voice dialog session
  const startDialog = useCallback(async () => {
    try {
      setDialogState('connecting')
      isActiveRef.current = true
      setIsActive(true)

      // Start recording
      await startRecording()
    } catch (error) {
      console.error('Error starting voice dialog:', error)
      cleanup()
      onError?.(error instanceof Error ? error : new Error('Failed to start voice chat'))
    }
  }, [startRecording, cleanup, onError])

  // End the voice dialog session
  const endDialog = useCallback(() => {
    cleanup()
  }, [cleanup])

  // Toggle listening (for push-to-talk style)
  const toggleListening = useCallback(async () => {
    if (dialogState === 'listening') {
      await stopRecordingAndProcess()
    } else if (dialogState === 'idle' && isActive) {
      await startRecording()
    }
  }, [dialogState, isActive, startRecording, stopRecordingAndProcess])

  // Computed states for backward compatibility with VoiceDialogOverlay
  const isConnecting = dialogState === 'connecting'
  const isListening = dialogState === 'listening'
  const isProcessing = dialogState === 'processing'
  const isGenerating = dialogState === 'generating'
  const isSpeaking = dialogState === 'speaking'

  return {
    isActive,
    isConnecting,
    isListening,
    isProcessing,
    isGenerating,
    isSpeaking,
    dialogState,
    transcript,
    aiResponse,
    startDialog,
    endDialog,
    toggleListening,
    stopRecordingAndProcess
  }
}
