"use client";

import React, { useEffect, useState } from "react";
import { X, Mic, MicOff, Square } from "lucide-react";
import { VoiceOrb } from "./VoiceOrb";
import { VoiceWaveform } from "./VoiceWaveform";

type VoiceState = "idle" | "listening" | "processing" | "speaking";

interface VoiceModeOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  state: VoiceState;
  audioLevel: number;
  playbackAmplitude: number;
  playbackFrequencyData?: Uint8Array;
  transcript: string;
  responseText: string;
  onStartListening: () => void;
  onStopListening: () => void;
  onCancel: () => void;
}

export function VoiceModeOverlay({
  isOpen,
  onClose,
  state,
  audioLevel,
  playbackAmplitude,
  playbackFrequencyData,
  transcript,
  responseText,
  onStartListening,
  onStopListening,
  onCancel,
}: VoiceModeOverlayProps) {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  // Handle mount/unmount animation
  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      // Trigger enter animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimateIn(true);
        });
      });
    } else {
      setAnimateIn(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!visible) return null;

  const isListening = state === "listening";
  const isSpeaking = state === "speaking";
  const isProcessing = state === "processing";

  const handleMicClick = () => {
    if (isListening) {
      onStopListening();
    } else if (isSpeaking || isProcessing) {
      onCancel();
    } else {
      onStartListening();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{
        background: "linear-gradient(180deg, #0a0e1a 0%, #0d1425 50%, #0a0e1a 100%)",
        opacity: animateIn ? 1 : 0,
        transform: animateIn ? "scale(1)" : "scale(0.97)",
        transition: "opacity 300ms ease-out, transform 300ms ease-out",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {/* Subtle background particles / stars effect */}
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${1 + Math.random() * 2}px`,
              height: `${1 + Math.random() * 2}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: `rgba(148, 180, 230, ${0.08 + Math.random() * 0.12})`,
              animation: `voice-overlay-twinkle ${3 + Math.random() * 4}s ease-in-out ${Math.random() * 3}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Top bar */}
      <div className="relative flex items-center justify-between px-5 pt-4 pb-2" style={{ paddingTop: "max(env(safe-area-inset-top, 16px), 16px)" }}>
        <span className="text-xs font-medium tracking-widest uppercase" style={{ color: "rgba(148, 180, 230, 0.4)" }}>
          Voice Mode
        </span>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.06)",
            color: "rgba(200, 210, 230, 0.7)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.12)";
            e.currentTarget.style.color = "rgba(200, 210, 230, 1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
            e.currentTarget.style.color = "rgba(200, 210, 230, 0.7)";
          }}
          aria-label="Close voice mode"
        >
          <X size={20} />
        </button>
      </div>

      {/* Center: Orb */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <VoiceOrb
          state={state}
          amplitude={isSpeaking ? playbackAmplitude : undefined}
          frequencyData={isSpeaking ? playbackFrequencyData : undefined}
        />
      </div>

      {/* Transcript area */}
      <div className="px-6 pb-2 flex flex-col items-center gap-1.5 min-h-[72px]">
        {transcript && (
          <p
            className="text-center text-sm leading-relaxed line-clamp-2 max-w-md"
            style={{ color: "rgba(200, 215, 245, 0.55)" }}
          >
            {transcript}
          </p>
        )}
        {responseText && (
          <p
            className="text-center text-sm leading-relaxed line-clamp-3 max-w-md"
            style={{ color: "rgba(200, 215, 245, 0.85)" }}
          >
            {responseText}
          </p>
        )}
      </div>

      {/* Bottom: Waveform + mic */}
      <div className="flex flex-col items-center gap-4 px-4 pb-6">
        {/* Waveform */}
        <VoiceWaveform
          audioLevel={isListening ? audioLevel : isSpeaking ? playbackAmplitude * 0.5 : 0}
          isActive={isListening || isSpeaking}
        />

        {/* Mic button */}
        <button
          onClick={handleMicClick}
          className="relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200 active:scale-95"
          style={{
            backgroundColor: isListening
              ? "rgba(239, 68, 68, 0.9)"
              : isSpeaking || isProcessing
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 88, 190, 0.85)",
            boxShadow: isListening
              ? "0 0 24px rgba(239, 68, 68, 0.4), 0 0 48px rgba(239, 68, 68, 0.15)"
              : isSpeaking || isProcessing
              ? "0 0 16px rgba(255, 255, 255, 0.05)"
              : "0 0 24px rgba(0, 88, 190, 0.3), 0 0 48px rgba(0, 88, 190, 0.1)",
            color: "rgba(255, 255, 255, 0.95)",
          }}
          aria-label={
            isListening
              ? "Stop listening"
              : isSpeaking || isProcessing
              ? "Cancel"
              : "Start listening"
          }
        >
          {/* Listening pulse ring */}
          {isListening && (
            <span
              className="absolute inset-0 rounded-full"
              style={{
                border: "2px solid rgba(239, 68, 68, 0.5)",
                animation: "voice-mic-pulse 1.5s ease-out infinite",
              }}
            />
          )}

          {isListening ? (
            <MicOff size={24} />
          ) : isSpeaking || isProcessing ? (
            <Square size={20} />
          ) : (
            <Mic size={24} />
          )}
        </button>
      </div>

      {/* Keyframe styles */}
      <style jsx>{`
        @keyframes voice-overlay-twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes voice-mic-pulse {
          0% {
            transform: scale(1);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.6);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
