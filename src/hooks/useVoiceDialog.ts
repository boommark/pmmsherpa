'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface VoiceDialogMessage {
  role: 'user' | 'assistant'
  content: string
}

interface UseVoiceDialogOptions {
  conversationId?: string
  onMessage?: (message: VoiceDialogMessage) => void
  onError?: (error: Error) => void
}

interface ServerEvent {
  type: string
  transcript?: string
  delta?: string
  error?: {
    message?: string
  }
}

export function useVoiceDialog({
  conversationId,
  onMessage,
  onError
}: UseVoiceDialogOptions = {}) {
  const [isActive, setIsActive] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')

  const peerConnectionRef = useRef<RTCPeerConnection | null>(null)
  const dataChannelRef = useRef<RTCDataChannel | null>(null)
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const currentTranscriptRef = useRef('')

  // Cleanup function
  const cleanup = useCallback(() => {
    // Close data channel
    if (dataChannelRef.current) {
      dataChannelRef.current.close()
      dataChannelRef.current = null
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close()
      peerConnectionRef.current = null
    }

    // Stop audio playback
    if (audioElementRef.current) {
      audioElementRef.current.srcObject = null
      audioElementRef.current = null
    }

    // Stop microphone stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }

    setIsActive(false)
    setIsConnecting(false)
    setIsListening(false)
    setIsSpeaking(false)
    setTranscript('')
    currentTranscriptRef.current = ''
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  // Handle server events from the Realtime API
  const handleServerEvent = useCallback((event: ServerEvent) => {
    switch (event.type) {
      case 'input_audio_buffer.speech_started':
        setIsListening(true)
        setIsSpeaking(false)
        currentTranscriptRef.current = ''
        setTranscript('')
        break

      case 'input_audio_buffer.speech_stopped':
        setIsListening(false)
        break

      case 'conversation.item.input_audio_transcription.completed':
        if (event.transcript) {
          setTranscript(event.transcript)
          onMessage?.({ role: 'user', content: event.transcript })
        }
        break

      case 'response.audio_transcript.delta':
        if (event.delta) {
          currentTranscriptRef.current += event.delta
          setTranscript(currentTranscriptRef.current)
        }
        break

      case 'response.audio_transcript.done':
        if (event.transcript) {
          onMessage?.({ role: 'assistant', content: event.transcript })
        }
        currentTranscriptRef.current = ''
        setTranscript('')
        break

      case 'response.audio.started':
        setIsSpeaking(true)
        setIsListening(false)
        break

      case 'response.audio.done':
        setIsSpeaking(false)
        setIsListening(true)
        break

      case 'error':
        console.error('Realtime API error:', event.error)
        onError?.(new Error(event.error?.message || 'Voice dialog error'))
        break

      case 'session.created':
      case 'session.updated':
        // Session established successfully
        setIsListening(true)
        break
    }
  }, [onMessage, onError])

  const startDialog = useCallback(async () => {
    try {
      setIsConnecting(true)

      // Get ephemeral token from our server
      const tokenResponse = await fetch('/api/voice/realtime-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId })
      })

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to get voice session token')
      }

      const { client_secret } = await tokenResponse.json()

      // Create peer connection with STUN servers
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' }
        ]
      })
      peerConnectionRef.current = pc

      // Set up audio element for AI responses
      const audioEl = document.createElement('audio')
      audioEl.autoplay = true
      audioElementRef.current = audioEl

      // Handle incoming audio track from the AI
      pc.ontrack = (event) => {
        audioEl.srcObject = event.streams[0]
      }

      // Get user microphone
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      })
      streamRef.current = stream

      // Add microphone track to peer connection
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream)
      })

      // Create data channel for events
      const dc = pc.createDataChannel('oai-events')
      dataChannelRef.current = dc

      dc.onopen = () => {
        console.log('Data channel opened')
      }

      dc.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleServerEvent(data)
        } catch (e) {
          console.error('Failed to parse server event:', e)
        }
      }

      dc.onerror = (error) => {
        console.error('Data channel error:', error)
        onError?.(new Error('Voice connection error'))
      }

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          onError?.(new Error('Voice connection lost'))
          cleanup()
        }
      }

      // Create and set local description (SDP offer)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Wait for ICE gathering to complete or timeout
      await new Promise<void>((resolve) => {
        if (pc.iceGatheringState === 'complete') {
          resolve()
        } else {
          const timeout = setTimeout(resolve, 2000)
          pc.onicegatheringstatechange = () => {
            if (pc.iceGatheringState === 'complete') {
              clearTimeout(timeout)
              resolve()
            }
          }
        }
      })

      // Send offer to OpenAI Realtime API
      const sdpResponse = await fetch(
        'https://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${client_secret}`,
            'Content-Type': 'application/sdp'
          },
          body: pc.localDescription?.sdp
        }
      )

      if (!sdpResponse.ok) {
        const errorText = await sdpResponse.text()
        console.error('SDP response error:', errorText)
        throw new Error('Failed to establish voice connection')
      }

      // Set remote description from OpenAI's answer
      const answerSdp = await sdpResponse.text()
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp })

      setIsConnecting(false)
      setIsActive(true)
      setIsListening(true)

    } catch (error) {
      console.error('Error starting voice dialog:', error)
      setIsConnecting(false)
      cleanup()

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          onError?.(new Error('Microphone access denied. Please allow microphone access.'))
        } else {
          onError?.(error)
        }
      } else {
        onError?.(new Error('Failed to start voice chat'))
      }
    }
  }, [conversationId, handleServerEvent, onError, cleanup])

  const endDialog = useCallback(() => {
    cleanup()
  }, [cleanup])

  return {
    isActive,
    isConnecting,
    isListening,
    isSpeaking,
    transcript,
    startDialog,
    endDialog
  }
}
