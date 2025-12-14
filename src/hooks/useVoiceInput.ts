'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface UseVoiceInputOptions {
  onTranscript: (text: string, isFinal: boolean) => void
  onError?: (error: Error) => void
}

// Extend Window interface for Web Speech API
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
  start: () => void
  stop: () => void
  abort: () => void
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
    try {
      setIsProcessing(true)

      // Check for browser support
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (!SpeechRecognition) {
        throw new Error('Speech recognition not supported in this browser. Try Chrome or Edge.')
      }

      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true })

      // Initialize Web Speech API
      const recognition = new SpeechRecognition()
      recognitionRef.current = recognition

      // Configure recognition
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      // Reset final transcript
      finalTranscriptRef.current = ''

      // Handle results
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i]
          const transcript = result[0].transcript

          if (result.isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        // Send final transcript
        if (finalTranscript) {
          finalTranscriptRef.current += finalTranscript
          onTranscript(finalTranscript, true)
        }

        // Send interim transcript
        if (interimTranscript) {
          onTranscript(interimTranscript, false)
        }
      }

      // Handle errors
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error)

        let errorMessage = 'Speech recognition error'
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access.'
            break
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.'
            break
          case 'network':
            errorMessage = 'Network error. Please check your connection.'
            break
          case 'aborted':
            // User stopped recording, not an error
            return
          default:
            errorMessage = `Speech recognition error: ${event.error}`
        }

        onError?.(new Error(errorMessage))
        setIsRecording(false)
        setIsProcessing(false)
      }

      // Handle end
      recognition.onend = () => {
        setIsRecording(false)
        setIsProcessing(false)
      }

      // Handle start
      recognition.onstart = () => {
        setIsProcessing(false)
        setIsRecording(true)
      }

      // Start recognition
      recognition.start()

    } catch (error) {
      console.error('Error starting recording:', error)
      setIsProcessing(false)

      if (error instanceof Error && error.name === 'NotAllowedError') {
        onError?.(new Error('Microphone access denied. Please allow microphone access in your browser settings.'))
      } else {
        onError?.(error as Error)
      }
    }
  }, [onTranscript, onError])

  const stopRecording = useCallback(async () => {
    setIsProcessing(true)

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    } catch (error) {
      console.error('Error stopping recognition:', error)
    }

    recognitionRef.current = null
    setIsRecording(false)
    setIsProcessing(false)
  }, [])

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording
  }
}
