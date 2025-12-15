'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface UseVoiceInputOptions {
  onTranscript: (text: string, isFinal: boolean) => void
  onError?: (error: Error) => void
}

// Extend Window interface to include SpeechRecognition
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message?: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export function useVoiceInput({ onTranscript, onError }: UseVoiceInputOptions) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const finalTranscriptRef = useRef<string>('')

  // Check if native speech recognition is available
  const isSupported = typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
        recognitionRef.current = null
      }
    }
  }, [])

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      onError?.(new Error('Speech recognition is not supported in this browser. Please use Chrome, Safari, or Edge.'))
      return
    }

    try {
      setIsProcessing(true)
      finalTranscriptRef.current = ''

      // Create native speech recognition instance
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognitionAPI()
      recognitionRef.current = recognition

      // Configure for continuous recognition with interim results
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsProcessing(false)
        setIsRecording(true)
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        // If we have final results, add to accumulated transcript
        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript
          onTranscript(finalTranscriptRef.current, true)
        } else if (interimTranscript) {
          // Show interim results (partial transcript)
          onTranscript(finalTranscriptRef.current + interimTranscript, false)
        }
      }

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
        setIsProcessing(false)

        switch (event.error) {
          case 'not-allowed':
            onError?.(new Error('Microphone access denied. Please allow microphone access in your browser settings.'))
            break
          case 'no-speech':
            // This is common when user stops without speaking - don't show error
            break
          case 'audio-capture':
            onError?.(new Error('No microphone found. Please connect a microphone and try again.'))
            break
          case 'network':
            onError?.(new Error('Network error. Please check your connection.'))
            break
          default:
            if (event.error !== 'aborted') {
              onError?.(new Error(`Speech recognition error: ${event.error}`))
            }
        }
      }

      recognition.onend = () => {
        setIsRecording(false)
        setIsProcessing(false)

        // If we have accumulated transcript, send final result
        if (finalTranscriptRef.current.trim()) {
          onTranscript(finalTranscriptRef.current.trim(), true)
        }
      }

      // Start recognition
      recognition.start()
    } catch (error) {
      console.error('Error starting speech recognition:', error)
      setIsProcessing(false)
      onError?.(error instanceof Error ? error : new Error('Failed to start speech recognition'))
    }
  }, [isSupported, onTranscript, onError])

  const stopRecording = useCallback(async () => {
    if (!recognitionRef.current) {
      return
    }

    setIsProcessing(true)

    try {
      recognitionRef.current.stop()
    } catch (error) {
      console.error('Error stopping recognition:', error)
      setIsRecording(false)
      setIsProcessing(false)
    }
  }, [])

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    isSupported
  }
}
