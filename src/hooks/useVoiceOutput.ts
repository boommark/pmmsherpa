'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface UseVoiceOutputOptions {
  onPlaybackComplete?: () => void
  onError?: (error: Error) => void
}

export function useVoiceOutput({
  onPlaybackComplete,
  onError
}: UseVoiceOutputOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const isCancelledRef = useRef(false)

  // Check if native speech synthesis is available
  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
      }
    }
  }, [isSupported])

  const speak = useCallback(async (text: string) => {
    if (!text || !text.trim()) {
      onError?.(new Error('No text provided for speech'))
      return
    }

    if (!isSupported) {
      onError?.(new Error('Speech synthesis is not supported in this browser'))
      return
    }

    try {
      setIsLoading(true)
      isCancelledRef.current = false

      // Stop any currently playing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel()
      }

      // Strip markdown formatting for cleaner speech
      const cleanText = text
        .replace(/#{1,6}\s/g, '')           // Headers
        .replace(/\*\*(.+?)\*\*/g, '$1')    // Bold
        .replace(/\*(.+?)\*/g, '$1')        // Italic
        .replace(/`{1,3}[^`]*`{1,3}/g, '')  // Code blocks and inline code
        .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Links - keep text
        .replace(/^\s*[-*+]\s/gm, '')       // List markers
        .replace(/^\s*\d+\.\s/gm, '')       // Numbered list markers
        .replace(/\n+/g, ' ')               // Newlines to spaces
        .replace(/\s+/g, ' ')               // Multiple spaces to single
        .trim()

      // Create speech utterance
      const utterance = new SpeechSynthesisUtterance(cleanText)
      utteranceRef.current = utterance

      // Configure speech settings
      utterance.rate = 1.0
      utterance.pitch = 1.0
      utterance.volume = 1.0
      utterance.lang = 'en-US'

      // Try to get a natural-sounding voice
      const voices = window.speechSynthesis.getVoices()

      // Prefer higher quality voices (often those with "enhanced" or "premium" in name)
      // On iOS/macOS, look for "Samantha" or similar high-quality voices
      // On Android/Chrome, look for "Google" voices
      const preferredVoice = voices.find(v =>
        v.name.includes('Samantha') ||
        v.name.includes('Karen') ||
        v.name.includes('Daniel') ||
        v.name.includes('Google US English') ||
        (v.lang.startsWith('en') && v.localService)
      ) || voices.find(v => v.lang.startsWith('en'))

      if (preferredVoice) {
        utterance.voice = preferredVoice
      }

      utterance.onstart = () => {
        if (!isCancelledRef.current) {
          setIsLoading(false)
          setIsPlaying(true)
        }
      }

      utterance.onend = () => {
        setIsPlaying(false)
        setIsLoading(false)
        if (!isCancelledRef.current) {
          onPlaybackComplete?.()
        }
      }

      utterance.onerror = (event) => {
        // Don't report error if we cancelled intentionally
        if (event.error === 'canceled' || isCancelledRef.current) {
          setIsPlaying(false)
          setIsLoading(false)
          return
        }

        console.error('Speech synthesis error:', event.error)
        setIsPlaying(false)
        setIsLoading(false)
        onError?.(new Error(`Speech synthesis failed: ${event.error}`))
      }

      // Some browsers need a small delay after cancel
      setTimeout(() => {
        if (!isCancelledRef.current) {
          window.speechSynthesis.speak(utterance)
        }
      }, 50)

    } catch (error) {
      console.error('TTS error:', error)
      setIsLoading(false)
      setIsPlaying(false)
      onError?.(error instanceof Error ? error : new Error('Speech synthesis failed'))
    }
  }, [isSupported, onPlaybackComplete, onError])

  const stop = useCallback(() => {
    isCancelledRef.current = true
    if (isSupported && window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
    setIsLoading(false)
  }, [isSupported])

  const pause = useCallback(() => {
    if (isSupported && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause()
      setIsPlaying(false)
    }
  }, [isSupported])

  const resume = useCallback(() => {
    if (isSupported && window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
      setIsPlaying(true)
    }
  }, [isSupported])

  return {
    isPlaying,
    isLoading,
    speak,
    stop,
    pause,
    resume,
    isSupported
  }
}
