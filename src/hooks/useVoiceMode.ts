'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useElevenLabsTTS } from './useElevenLabsTTS'

type VoiceModeState = 'idle' | 'listening' | 'processing' | 'speaking'

interface UseVoiceModeOptions {
  /** Called when STT returns a transcript — parent handles sending to chat API */
  onTranscript: (text: string) => void
  onError?: (error: Error) => void
  /** ElevenLabs voice ID — defaults to Eddie Stirling */
  voiceId?: string
  /** Audio level below which is considered silence (0-1). Default 0.015 */
  silenceThreshold?: number
  /** Milliseconds of sustained silence before finalizing recording. Default 2000 */
  silenceDuration?: number
}

const DEFAULT_VOICE_ID = 'VsQmyFHffusQDewmHB5v' // Eddie Stirling

export function useVoiceMode({
  onTranscript,
  onError,
  voiceId = DEFAULT_VOICE_ID,
  silenceThreshold = 0.015,
  silenceDuration = 2000,
}: UseVoiceModeOptions) {
  const [state, setState] = useState<VoiceModeState>('idle')
  const [audioLevel, setAudioLevel] = useState(0)
  const [transcript, setTranscript] = useState('')

  // Refs for recording pipeline
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const isCancelledRef = useRef(false)
  const autoResumeRef = useRef(false)

  // ElevenLabs TTS for playback
  const tts = useElevenLabsTTS({
    onPlaybackComplete: () => {
      setState('idle')
      // Auto-resume listening for continuous conversation
      if (autoResumeRef.current && !isCancelledRef.current) {
        // Small delay before re-listening to avoid picking up tail-end audio
        setTimeout(() => {
          if (!isCancelledRef.current) {
            startListeningInternal()
          }
        }, 300)
      }
    },
    onError: (error) => {
      console.error('[useVoiceMode] TTS error:', error)
      setState('idle')
      onError?.(error)
    },
  })

  // ------------------------------------------------------------------
  // Silence detection via AnalyserNode
  // ------------------------------------------------------------------
  const startSilenceDetection = useCallback(() => {
    const analyser = analyserRef.current
    if (!analyser) return

    const bufferLength = analyser.fftSize
    const dataArray = new Float32Array(bufferLength)

    const check = () => {
      if (isCancelledRef.current) return

      analyser.getFloatTimeDomainData(dataArray)

      // Calculate RMS
      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i] * dataArray[i]
      }
      const rms = Math.sqrt(sum / bufferLength)
      setAudioLevel(Math.min(1, rms * 5)) // Scale for UI visibility

      if (rms < silenceThreshold) {
        // Below threshold — start or continue silence timer
        if (!silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            // Sustained silence — finalize
            finalizeRecording()
          }, silenceDuration)
        }
      } else {
        // User is speaking — reset silence timer
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current)
          silenceTimerRef.current = null
        }
      }

      animFrameRef.current = requestAnimationFrame(check)
    }

    animFrameRef.current = requestAnimationFrame(check)
  }, [silenceThreshold, silenceDuration]) // finalizeRecording added below via ref

  // ------------------------------------------------------------------
  // Finalize recording: stop MediaRecorder, send to STT
  // ------------------------------------------------------------------
  const finalizeRecording = useCallback(async () => {
    if (isCancelledRef.current) return

    // Stop monitoring
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }

    setAudioLevel(0)
    setState('processing')

    // Stop the MediaRecorder — this triggers the final dataavailable + stop events
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      // Wait for the stop event so chunks are finalized
      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve()
        recorder.stop()
      })
    }

    // Stop mic stream tracks
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop())
    mediaStreamRef.current = null

    // Close the monitoring audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    analyserRef.current = null

    // Build blob and send to STT
    const chunks = chunksRef.current
    if (chunks.length === 0) {
      setState('idle')
      return
    }

    const audioBlob = new Blob(chunks, { type: 'audio/webm' })
    chunksRef.current = []

    // Skip very short recordings (likely just noise)
    if (audioBlob.size < 1000) {
      setState('idle')
      return
    }

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'recording.webm')

      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error')
        throw new Error(`STT API error (${response.status}): ${errorBody}`)
      }

      const { text } = await response.json()

      if (!text || !text.trim()) {
        // No speech detected
        setState('idle')
        return
      }

      if (isCancelledRef.current) return

      setTranscript(text.trim())
      onTranscript(text.trim())
      // State stays 'processing' — parent will call speakResponse when LLM responds
    } catch (error) {
      console.error('[useVoiceMode] STT error:', error)
      setState('idle')
      onError?.(error instanceof Error ? error : new Error('Transcription failed'))
    }
  }, [onTranscript, onError])

  // ------------------------------------------------------------------
  // Start listening (internal — handles mic setup + recording)
  // ------------------------------------------------------------------
  const startListeningInternal = useCallback(async () => {
    if (isCancelledRef.current) return

    try {
      setState('listening')
      chunksRef.current = []

      // Request microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })
      mediaStreamRef.current = stream

      if (isCancelledRef.current) {
        stream.getTracks().forEach((t) => t.stop())
        return
      }

      // Set up AudioContext + AnalyserNode for silence detection
      const ctx = new AudioContext()
      audioContextRef.current = ctx

      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.3
      source.connect(analyser)
      analyserRef.current = analyser

      // Set up MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4'

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.start(250) // Collect chunks every 250ms

      // Start silence detection loop
      startSilenceDetection()
    } catch (error) {
      console.error('[useVoiceMode] Mic/recording error:', error)
      setState('idle')

      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        onError?.(new Error('Microphone access denied. Please allow microphone access in your browser settings.'))
      } else if (error instanceof DOMException && error.name === 'NotFoundError') {
        onError?.(new Error('No microphone found. Please connect a microphone and try again.'))
      } else {
        onError?.(error instanceof Error ? error : new Error('Failed to start recording'))
      }
    }
  }, [startSilenceDetection, onError])

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  /** Start listening for user speech. Initiates continuous conversation loop. */
  const startListening = useCallback(() => {
    isCancelledRef.current = false
    autoResumeRef.current = true
    startListeningInternal()
  }, [startListeningInternal])

  /** Stop listening (does not cancel speaking if in progress). */
  const stopListening = useCallback(() => {
    autoResumeRef.current = false

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }

    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }

    mediaStreamRef.current?.getTracks().forEach((t) => t.stop())
    mediaStreamRef.current = null

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    analyserRef.current = null

    chunksRef.current = []
    setAudioLevel(0)

    if (state === 'listening') {
      setState('idle')
    }
  }, [state])

  /** Play an LLM response via ElevenLabs TTS. */
  const speakResponse = useCallback(async (text: string) => {
    if (!text || !text.trim()) return

    // Stop listening while speaking (avoid echo)
    stopListening()

    setState('speaking')
    await tts.speak(text, voiceId)
  }, [tts, voiceId, stopListening])

  /** Cancel everything — stop recording, stop playback, go idle. */
  const cancel = useCallback(() => {
    isCancelledRef.current = true
    autoResumeRef.current = false

    // Stop silence detection
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = null
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }

    // Stop recording
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop()
    }
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop())
    mediaStreamRef.current = null

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    analyserRef.current = null
    chunksRef.current = []

    // Stop TTS playback
    tts.stop()

    setAudioLevel(0)
    setState('idle')
  }, [tts])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isCancelledRef.current = true
      autoResumeRef.current = false

      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)

      const recorder = mediaRecorderRef.current
      if (recorder && recorder.state !== 'inactive') {
        try { recorder.stop() } catch { /* ignore */ }
      }
      mediaStreamRef.current?.getTracks().forEach((t) => t.stop())

      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close()
      }

      tts.stop()
    }
  }, [tts])

  return {
    state,
    audioLevel,
    transcript,
    startListening,
    stopListening,
    speakResponse,
    cancel,
    /** 0-1 amplitude of TTS playback for orb pulsing. Call in rAF loop. */
    getPlaybackAmplitude: tts.getAmplitude,
    /** Frequency data of TTS playback for orb visualization. Call in rAF loop. */
    getPlaybackFrequencyData: tts.getFrequencyData,
  }
}
