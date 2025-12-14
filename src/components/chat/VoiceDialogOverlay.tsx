'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, PhoneOff, Mic, Volume2, Brain, Sparkles, Square } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceDialogOverlayProps {
  isActive: boolean
  isConnecting: boolean
  isListening: boolean
  isProcessing?: boolean
  isGenerating?: boolean
  isSpeaking: boolean
  transcript: string
  aiResponse?: string
  onEnd: () => void
  onStopRecording?: () => void
}

export function VoiceDialogOverlay({
  isActive,
  isConnecting,
  isListening,
  isProcessing = false,
  isGenerating = false,
  isSpeaking,
  transcript,
  aiResponse,
  onEnd,
  onStopRecording
}: VoiceDialogOverlayProps) {
  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (isActive || isConnecting) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isActive, isConnecting])

  // Handle Escape key to end dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onEnd()
      }
    }
    if (isActive || isConnecting) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActive, isConnecting, onEnd])

  if (!isActive && !isConnecting) return null

  // Determine current state for styling
  const currentState = isConnecting ? 'connecting'
    : isListening ? 'listening'
    : isProcessing ? 'processing'
    : isGenerating ? 'generating'
    : isSpeaking ? 'speaking'
    : 'idle'

  const stateColors = {
    connecting: { bg: 'bg-yellow-500', gradient: 'from-yellow-400 to-yellow-600', ring: 'bg-yellow-500' },
    listening: { bg: 'bg-blue-500', gradient: 'from-blue-400 to-blue-600', ring: 'bg-blue-500' },
    processing: { bg: 'bg-orange-500', gradient: 'from-orange-400 to-orange-600', ring: 'bg-orange-500' },
    generating: { bg: 'bg-emerald-500', gradient: 'from-emerald-400 to-emerald-600', ring: 'bg-emerald-500' },
    speaking: { bg: 'bg-purple-500', gradient: 'from-purple-400 to-purple-600', ring: 'bg-purple-500' },
    idle: { bg: 'bg-gray-500', gradient: 'from-gray-400 to-gray-600', ring: 'bg-gray-500' }
  }

  const colors = stateColors[currentState]

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col items-center justify-center p-6">
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-20 transition-all duration-1000',
            colors.bg,
            (isListening || isProcessing || isGenerating) && 'animate-pulse',
            isSpeaking && 'scale-125'
          )}
        />
      </div>

      {/* Status indicator orb */}
      <div className="relative mb-8 z-10">
        {/* Outer ring - pulsing */}
        <div
          className={cn(
            'absolute inset-0 rounded-full transition-all duration-500',
            `${colors.ring}/20`,
            isConnecting && 'animate-ping',
            (isListening || isProcessing || isGenerating || isSpeaking) && 'animate-pulse'
          )}
          style={{ width: '160px', height: '160px', marginLeft: '-16px', marginTop: '-16px' }}
        />

        <div
          className={cn(
            'w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300',
            `${colors.bg}/20`
          )}
        >
          <div
            className={cn(
              'w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300',
              `${colors.bg}/30`
            )}
          >
            <div
              className={cn(
                'w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 bg-gradient-to-br',
                colors.gradient
              )}
            >
              {isConnecting ? (
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              ) : isListening ? (
                <Mic className="h-8 w-8 text-white animate-pulse" />
              ) : isProcessing ? (
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              ) : isGenerating ? (
                <Brain className="h-8 w-8 text-white animate-pulse" />
              ) : isSpeaking ? (
                <Volume2 className="h-8 w-8 text-white" />
              ) : (
                <Sparkles className="h-8 w-8 text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Sound wave indicators when speaking */}
        {isSpeaking && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-purple-500 rounded-full animate-pulse"
                  style={{
                    height: `${20 + Math.random() * 20}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '0.5s'
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status text */}
      <p className="text-lg font-medium text-foreground mb-2 z-10">
        {isConnecting && 'Connecting...'}
        {isListening && 'Listening...'}
        {isProcessing && 'Transcribing...'}
        {isGenerating && 'Thinking...'}
        {isSpeaking && 'Speaking...'}
      </p>

      <p className="text-sm text-muted-foreground mb-6 z-10">
        {isConnecting && 'Setting up your voice session'}
        {isListening && 'Speak naturally, tap the button when done'}
        {isProcessing && 'Converting your speech to text'}
        {isGenerating && 'Generating response with Claude'}
        {isSpeaking && 'Please wait while I respond'}
      </p>

      {/* Tap to stop recording button */}
      {isListening && onStopRecording && (
        <Button
          variant="outline"
          size="lg"
          onClick={onStopRecording}
          className="gap-2 mb-4 z-10 border-blue-500/50 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
        >
          <Square className="h-4 w-4" />
          Tap when done speaking
        </Button>
      )}

      {/* User transcript */}
      {transcript && (
        <div className="max-w-md w-full text-center mb-4 p-4 bg-muted/50 rounded-xl border border-border/50 z-10">
          <p className="text-sm text-muted-foreground mb-1">You said:</p>
          <p className="text-foreground leading-relaxed">{transcript}</p>
        </div>
      )}

      {/* AI response (streaming) */}
      {aiResponse && (isGenerating || isSpeaking) && (
        <div className="max-w-md w-full text-center mb-4 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30 z-10">
          <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">AI response:</p>
          <p className="text-foreground leading-relaxed text-sm">
            {aiResponse.length > 300 ? aiResponse.slice(0, 300) + '...' : aiResponse}
          </p>
        </div>
      )}

      {/* Placeholder when no transcript */}
      {!transcript && !aiResponse && !isConnecting && !isProcessing && !isGenerating && (
        <div className="max-w-md w-full text-center mb-8 p-4 z-10">
          <p className="text-sm text-muted-foreground italic">
            Ask me anything about product marketing...
          </p>
        </div>
      )}

      {/* End call button */}
      <Button
        variant="destructive"
        size="lg"
        onClick={onEnd}
        className="gap-2 shadow-lg z-10 mt-4"
      >
        <PhoneOff className="h-5 w-5" />
        End Voice Chat
      </Button>

      {/* Instructions */}
      <p className="text-xs text-muted-foreground mt-8 text-center max-w-sm z-10">
        {isListening
          ? 'Speak clearly, then tap the button when done. Your conversation will be saved to this chat.'
          : 'Your conversation will be saved to this chat.'}
      </p>

      {/* Keyboard shortcut hint */}
      <p className="text-xs text-muted-foreground/60 mt-2 z-10">
        Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">Esc</kbd> to end
      </p>
    </div>
  )
}
