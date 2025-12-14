'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

type TTSVoice = 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'fable' | 'nova' | 'onyx' | 'sage' | 'shimmer'

interface UseVoiceOutputOptions {
  voice?: TTSVoice
  onPlaybackComplete?: () => void
  onError?: (error: Error) => void
}

export function useVoiceOutput({
  voice = 'nova',
  onPlaybackComplete,
  onError
}: UseVoiceOutputOptions = {}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioUrlRef = useRef<string | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
        audioUrlRef.current = null
      }
    }
  }, [])

  const speak = useCallback(async (text: string) => {
    if (!text || !text.trim()) {
      onError?.(new Error('No text provided for speech'))
      return
    }

    try {
      setIsLoading(true)

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }

      // Revoke previous audio URL to free memory
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current)
        audioUrlRef.current = null
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

      // Truncate if too long (4096 char limit)
      const truncatedText = cleanText.length > 4000
        ? cleanText.substring(0, 4000) + '...'
        : cleanText

      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: truncatedText, voice })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Speech generation failed')
      }

      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      audioUrlRef.current = audioUrl

      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setIsPlaying(false)
        onPlaybackComplete?.()
      }

      audio.onerror = () => {
        setIsPlaying(false)
        setIsLoading(false)
        onError?.(new Error('Audio playback failed'))
      }

      audio.oncanplaythrough = () => {
        setIsLoading(false)
        setIsPlaying(true)
        audio.play().catch((e) => {
          setIsPlaying(false)
          onError?.(new Error(`Playback failed: ${e.message}`))
        })
      }

      // Load the audio
      audio.load()

    } catch (error) {
      console.error('TTS error:', error)
      setIsLoading(false)
      setIsPlaying(false)
      onError?.(error instanceof Error ? error : new Error('Speech generation failed'))
    }
  }, [voice, onPlaybackComplete, onError])

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setIsPlaying(false)
    setIsLoading(false)
  }, [])

  const pause = useCallback(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    }
  }, [isPlaying])

  const resume = useCallback(() => {
    if (audioRef.current && !isPlaying) {
      audioRef.current.play().then(() => {
        setIsPlaying(true)
      }).catch((e) => {
        onError?.(new Error(`Resume failed: ${e.message}`))
      })
    }
  }, [isPlaying, onError])

  return {
    isPlaying,
    isLoading,
    speak,
    stop,
    pause,
    resume
  }
}
