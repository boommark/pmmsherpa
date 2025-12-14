'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface UseVoiceOutputOptions {
  onPlaybackComplete?: () => void
  onError?: (error: Error) => void
}

export function useVoiceOutput({ onPlaybackComplete, onError }: UseVoiceOutputOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const speak = useCallback((text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      onError?.(new Error('Speech synthesis not supported in this browser'))
      return
    }

    try {
      setIsLoading(true)

      // Cancel any ongoing speech
      window.speechSynthesis.cancel()

      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(text)
      utteranceRef.current = utterance

      // Configure voice settings
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0

      // Try to use a natural-sounding voice
      const voices = window.speechSynthesis.getVoices()
      const preferredVoice = voices.find(
        voice =>
          voice.name.includes('Samantha') || // macOS
          voice.name.includes('Google US English') || // Chrome
          voice.name.includes('Microsoft') && voice.lang === 'en-US' // Edge
      ) || voices.find(voice => voice.lang.startsWith('en'))

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      // Event handlers
      utterance.onstart = () => {
        setIsLoading(false)
        setIsPlaying(true)
      }

      utterance.onend = () => {
        setIsPlaying(false)
        utteranceRef.current = null
        onPlaybackComplete?.()
      }

      utterance.onerror = (event) => {
        // Ignore 'interrupted' errors from cancel()
        if (event.error !== 'interrupted') {
          console.error('Speech synthesis error:', event)
          onError?.(new Error(`Speech synthesis failed: ${event.error}`))
        }
        setIsLoading(false)
        setIsPlaying(false)
        utteranceRef.current = null
      }

      // Voices might not be loaded yet, wait for them
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          const newVoices = window.speechSynthesis.getVoices()
          const voice = newVoices.find(
            v =>
              v.name.includes('Samantha') ||
              v.name.includes('Google US English') ||
              (v.name.includes('Microsoft') && v.lang === 'en-US')
          ) || newVoices.find(v => v.lang.startsWith('en'))

          if (voice) {
            utterance.voice = voice
          }
          window.speechSynthesis.speak(utterance)
        }
      } else {
        window.speechSynthesis.speak(utterance)
      }

    } catch (error) {
      console.error('Error starting speech:', error)
      setIsLoading(false)
      setIsPlaying(false)
      onError?.(error as Error)
    }
  }, [onPlaybackComplete, onError])

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
    setIsLoading(false)
    utteranceRef.current = null
  }, [])

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.pause()
    }
  }, [])

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.resume()
    }
  }, [])

  return {
    isPlaying,
    isLoading,
    speak,
    stop,
    pause,
    resume
  }
}
