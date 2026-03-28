'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface UseElevenLabsTTSOptions {
  onPlaybackComplete?: () => void
  onError?: (error: Error) => void
}

/**
 * Strip markdown formatting from text for cleaner TTS output.
 */
function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s/g, '')           // Headers
    .replace(/\*\*(.+?)\*\*/g, '$1')    // Bold
    .replace(/\*(.+?)\*/g, '$1')        // Italic
    .replace(/`{1,3}[^`]*`{1,3}/g, '')  // Code blocks and inline code
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // Links — keep text
    .replace(/^\s*[-*+]\s/gm, '')       // List markers
    .replace(/^\s*\d+\.\s/gm, '')       // Numbered list markers
    .replace(/\n+/g, ' ')               // Newlines to spaces
    .replace(/\s+/g, ' ')               // Collapse whitespace
    .trim()
}

export function useElevenLabsTTS({
  onPlaybackComplete,
  onError,
}: UseElevenLabsTTSOptions = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const isCancelledRef = useRef(false)
  const frequencyDataRef = useRef<Uint8Array<ArrayBuffer>>(new Uint8Array(new ArrayBuffer(0)))

  // Lazily create or resume AudioContext (must be triggered by user gesture)
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = new AudioContext()
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }
    return audioContextRef.current
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isCancelledRef.current = true
      abortControllerRef.current?.abort()
      sourceRef.current?.stop()
      sourceRef.current?.disconnect()
      analyserRef.current?.disconnect()
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }
    }
  }, [])

  /**
   * Fetch streaming audio from /api/voice/speak and play it via Web Audio API.
   */
  const speak = useCallback(async (text: string, voiceId?: string) => {
    if (!text || !text.trim()) {
      onError?.(new Error('No text provided for speech'))
      return
    }

    // Cancel any in-progress playback
    abortControllerRef.current?.abort()
    sourceRef.current?.stop()
    sourceRef.current?.disconnect()

    isCancelledRef.current = false
    setIsLoading(true)
    setIsPlaying(false)

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const cleanText = stripMarkdown(text)

      const response = await fetch('/api/voice/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          ...(voiceId && { voiceId }),
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error')
        throw new Error(`TTS API error (${response.status}): ${errorBody}`)
      }

      if (!response.body) {
        throw new Error('No response body from TTS API')
      }

      // Read the full stream into an ArrayBuffer
      const reader = response.body.getReader()
      const chunks: Uint8Array[] = []
      let totalLength = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (isCancelledRef.current) return
        chunks.push(value)
        totalLength += value.length
      }

      if (isCancelledRef.current) return

      // Merge chunks into a single ArrayBuffer
      const merged = new Uint8Array(totalLength)
      let offset = 0
      for (const chunk of chunks) {
        merged.set(chunk, offset)
        offset += chunk.length
      }

      // Decode and play via Web Audio API
      const ctx = getAudioContext()
      const arrayBuffer = merged.buffer.slice(merged.byteOffset, merged.byteOffset + merged.byteLength) as ArrayBuffer
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer)

      if (isCancelledRef.current) return

      // Set up analyser for visualization
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      analyserRef.current = analyser
      frequencyDataRef.current = new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount))

      // Create source and connect through analyser
      const source = ctx.createBufferSource()
      source.buffer = audioBuffer
      source.connect(analyser)
      analyser.connect(ctx.destination)
      sourceRef.current = source

      setIsLoading(false)
      setIsPlaying(true)

      source.onended = () => {
        setIsPlaying(false)
        source.disconnect()
        analyser.disconnect()
        sourceRef.current = null
        analyserRef.current = null
        if (!isCancelledRef.current) {
          onPlaybackComplete?.()
        }
      }

      source.start(0)
    } catch (error) {
      if (isCancelledRef.current) return
      if (error instanceof DOMException && error.name === 'AbortError') return

      console.error('[useElevenLabsTTS] Error:', error)
      setIsLoading(false)
      setIsPlaying(false)
      onError?.(error instanceof Error ? error : new Error('TTS playback failed'))
    }
  }, [getAudioContext, onPlaybackComplete, onError])

  /**
   * Stop playback immediately.
   */
  const stop = useCallback(() => {
    isCancelledRef.current = true
    abortControllerRef.current?.abort()

    try {
      sourceRef.current?.stop()
    } catch {
      // source may already be stopped
    }
    sourceRef.current?.disconnect()
    analyserRef.current?.disconnect()
    sourceRef.current = null
    analyserRef.current = null

    setIsLoading(false)
    setIsPlaying(false)
  }, [])

  /**
   * Get current amplitude (0-1 normalized) for orb visualization pulsing.
   * Call this in a requestAnimationFrame loop.
   */
  const getAmplitude = useCallback((): number => {
    const analyser = analyserRef.current
    if (!analyser) return 0

    const data = frequencyDataRef.current
    analyser.getByteTimeDomainData(data)

    // Calculate RMS amplitude from waveform data
    let sum = 0
    for (let i = 0; i < data.length; i++) {
      const normalized = (data[i] - 128) / 128 // Center around 0, range -1 to 1
      sum += normalized * normalized
    }
    const rms = Math.sqrt(sum / data.length)

    // Clamp to 0-1
    return Math.min(1, rms * 2.5) // Scale up for visibility
  }, [])

  /**
   * Get frequency data (Uint8Array) for waveform visualization.
   * Call this in a requestAnimationFrame loop.
   */
  const getFrequencyData = useCallback((): Uint8Array => {
    const analyser = analyserRef.current
    if (!analyser) return new Uint8Array(0)

    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(data)
    return data
  }, [])

  return {
    isLoading,
    isPlaying,
    speak,
    stop,
    getAmplitude,
    getFrequencyData,
  }
}
