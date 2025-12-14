'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface UseVoiceInputOptions {
  onTranscript: (text: string, isFinal: boolean) => void
  onError?: (error: Error) => void
}

export function useVoiceInput({ onTranscript, onError }: UseVoiceInputOptions) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop()
      }
    }
  }, [])

  const startRecording = useCallback(async () => {
    try {
      setIsProcessing(true)

      // Request microphone permission and get stream
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

      mediaRecorder.onstart = () => {
        setIsProcessing(false)
        setIsRecording(true)
      }

      mediaRecorder.onerror = () => {
        setIsRecording(false)
        setIsProcessing(false)
        onError?.(new Error('Recording failed'))
      }

      // Start recording with timeslice for streaming chunks
      mediaRecorder.start(100)
    } catch (error) {
      console.error('Error starting recording:', error)
      setIsProcessing(false)

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          onError?.(new Error('Microphone access denied. Please allow microphone access in your browser settings.'))
        } else if (error.name === 'NotFoundError') {
          onError?.(new Error('No microphone found. Please connect a microphone and try again.'))
        } else {
          onError?.(error)
        }
      }
    }
  }, [onError])

  const stopRecording = useCallback(async () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
      return
    }

    setIsProcessing(true)

    return new Promise<void>((resolve) => {
      const mediaRecorder = mediaRecorderRef.current!

      mediaRecorder.onstop = async () => {
        // Stop all tracks to release the microphone
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }

        // Create audio blob from collected chunks
        const mimeType = mediaRecorder.mimeType
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType })

        // Check if we have any audio data
        if (audioBlob.size === 0) {
          setIsRecording(false)
          setIsProcessing(false)
          onError?.(new Error('No audio recorded. Please try again.'))
          resolve()
          return
        }

        try {
          // Send to Whisper API for transcription
          const formData = new FormData()

          // Determine file extension based on mime type
          const extension = mimeType.includes('webm') ? 'webm' : 'mp4'
          formData.append('audio', audioBlob, `recording.${extension}`)

          const response = await fetch('/api/voice/transcribe', {
            method: 'POST',
            body: formData
          })

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new Error(errorData.error || 'Transcription failed')
          }

          const { text } = await response.json()

          if (text && text.trim()) {
            onTranscript(text.trim(), true)
          } else {
            onError?.(new Error('No speech detected. Please try again.'))
          }
        } catch (error) {
          console.error('Transcription error:', error)
          onError?.(error instanceof Error ? error : new Error('Transcription failed'))
        } finally {
          setIsRecording(false)
          setIsProcessing(false)
          audioChunksRef.current = []
          resolve()
        }
      }

      mediaRecorder.stop()
    })
  }, [onTranscript, onError])

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording
  }
}
