'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { RealtimeClient, type RealtimeServerMessage } from '@speechmatics/real-time-client'

interface UseVoiceInputOptions {
  onTranscript: (text: string, isFinal: boolean) => void
  onError?: (error: Error) => void
}

export function useVoiceInput({ onTranscript, onError }: UseVoiceInputOptions) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const clientRef = useRef<RealtimeClient | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)

  // Cleanup function
  const cleanup = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    clientRef.current = null
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [cleanup])

  const startRecording = useCallback(async () => {
    try {
      setIsProcessing(true)

      // Get JWT token from our API
      const tokenResponse = await fetch('/api/voice/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'rt' })
      })

      if (!tokenResponse.ok) {
        throw new Error('Failed to get voice token')
      }

      const { jwt } = await tokenResponse.json()

      // Initialize Speechmatics client
      const client = new RealtimeClient()
      clientRef.current = client

      // Set up event listeners using the receiveMessage event
      client.addEventListener('receiveMessage', (event) => {
        const message = event.data as RealtimeServerMessage

        if (message.message === 'AddPartialTranscript') {
          const transcript = message.metadata?.transcript || ''
          if (transcript) {
            onTranscript(transcript, false)
          }
        } else if (message.message === 'AddTranscript') {
          const transcript = message.metadata?.transcript || ''
          if (transcript) {
            onTranscript(transcript, true)
          }
        } else if (message.message === 'Error') {
          console.error('Speechmatics error:', message)
          onError?.(new Error(message.reason || 'Speech recognition error'))
        }
      })

      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        }
      })
      streamRef.current = stream

      // Start Speechmatics session
      await client.start(jwt, {
        transcription_config: {
          language: 'en',
          enable_partials: true,
          operating_point: 'enhanced'
        },
        audio_format: {
          type: 'raw',
          encoding: 'pcm_f32le',
          sample_rate: 16000
        }
      })

      // Create AudioContext for processing
      const audioContext = new AudioContext({ sampleRate: 16000 })
      audioContextRef.current = audioContext

      const source = audioContext.createMediaStreamSource(stream)
      const processor = audioContext.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0)
        // Send Float32Array directly to Speechmatics
        if (clientRef.current) {
          clientRef.current.sendAudio(inputData.buffer)
        }
      }

      source.connect(processor)
      processor.connect(audioContext.destination)

      setIsRecording(true)
      setIsProcessing(false)

    } catch (error) {
      console.error('Error starting recording:', error)
      cleanup()
      setIsProcessing(false)
      onError?.(error as Error)
    }
  }, [onTranscript, onError, cleanup])

  const stopRecording = useCallback(async () => {
    setIsProcessing(true)

    try {
      // Signal end of audio to Speechmatics
      if (clientRef.current) {
        await clientRef.current.stopRecognition()
      }
    } catch (error) {
      console.error('Error stopping recognition:', error)
    }

    cleanup()
    setIsRecording(false)
    setIsProcessing(false)
  }, [cleanup])

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording
  }
}
