"use client";

import React, { useMemo } from "react";
import Image from "next/image";

type OrbState = "idle" | "listening" | "processing" | "speaking";

interface VoiceOrbProps {
  state: OrbState;
  amplitude?: number;
  frequencyData?: Uint8Array;
}

const STATE_LABELS: Record<OrbState, string> = {
  idle: "Click to start",
  listening: "Listening...",
  processing: "Thinking...",
  speaking: "Speaking...",
};

export function VoiceOrb({ state, amplitude = 0, frequencyData }: VoiceOrbProps) {
  // Map amplitude (0-1) to scale and glow for speaking state
  const speakingScale = 1.0 + amplitude * 0.3;
  const speakingGlowOpacity = 0.35 + amplitude * 0.45;

  // Compute frequency ring segments for speaking state
  const frequencyRing = useMemo(() => {
    if (state !== "speaking" || !frequencyData || frequencyData.length === 0) return null;

    const segmentCount = 48;
    const step = Math.max(1, Math.floor(frequencyData.length / segmentCount));
    const segments: number[] = [];
    for (let i = 0; i < segmentCount; i++) {
      const idx = Math.min(i * step, frequencyData.length - 1);
      segments.push(frequencyData[idx] / 255);
    }

    return (
      <div
        className="absolute inset-0 rounded-full"
        style={{ animation: "voice-orb-freq-spin 8s linear infinite" }}
      >
        {segments.map((value, i) => {
          const angle = (i / segmentCount) * 360;
          const barHeight = 8 + value * 24;
          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2"
              style={{
                width: "2px",
                height: `${barHeight}px`,
                background: `linear-gradient(to top, rgba(0, 88, 190, ${0.3 + value * 0.7}), rgba(168, 192, 240, ${0.2 + value * 0.6}))`,
                borderRadius: "1px",
                transform: `rotate(${angle}deg) translateY(-${60}px)`,
                transformOrigin: "0 0",
                transition: "height 80ms ease-out",
              }}
            />
          );
        })}
      </div>
    );
  }, [state, frequencyData]);

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Orb container */}
      <div className="relative flex items-center justify-center w-[200px] h-[200px] md:w-[240px] md:h-[240px]">
        {/* Outer ambient glow */}
        <div
          className="absolute rounded-full"
          style={{
            width: "140%",
            height: "140%",
            background: `radial-gradient(circle, rgba(0, 88, 190, ${
              state === "speaking" ? 0.12 + amplitude * 0.15 : state === "processing" ? 0.1 : 0.08
            }) 0%, transparent 70%)`,
            transition: "all 300ms ease-out",
          }}
        />

        {/* Processing orbital ring */}
        {state === "processing" && (
          <div
            className="absolute rounded-full border border-blue-400/30"
            style={{
              width: "130%",
              height: "130%",
              animation: "voice-orb-spin 3s linear infinite",
            }}
          >
            <div
              className="absolute w-2 h-2 rounded-full bg-blue-400/70"
              style={{ top: "-4px", left: "50%", marginLeft: "-4px" }}
            />
            <div
              className="absolute w-1.5 h-1.5 rounded-full bg-indigo-400/50"
              style={{ bottom: "-3px", left: "50%", marginLeft: "-3px" }}
            />
          </div>
        )}

        {/* Second processing orbital */}
        {state === "processing" && (
          <div
            className="absolute rounded-full border border-indigo-400/20"
            style={{
              width: "115%",
              height: "115%",
              animation: "voice-orb-spin-reverse 4.5s linear infinite",
            }}
          >
            <div
              className="absolute w-1.5 h-1.5 rounded-full bg-purple-400/60"
              style={{ top: "-3px", left: "50%", marginLeft: "-3px" }}
            />
          </div>
        )}

        {/* Frequency ring for speaking */}
        {frequencyRing}

        {/* Main orb */}
        <div
          className="relative rounded-full w-[160px] h-[160px] md:w-[200px] md:h-[200px]"
          style={{
            background:
              state === "processing"
                ? "radial-gradient(circle at 40% 35%, #6366f1, #4338ca 40%, #1e1b4b 80%)"
                : "radial-gradient(circle at 40% 35%, #3b82f6, #0058be 40%, #0a2a5e 80%)",
            boxShadow:
              state === "speaking"
                ? `0 0 ${30 + amplitude * 50}px rgba(0, 88, 190, ${speakingGlowOpacity}),
                   0 0 ${60 + amplitude * 80}px rgba(0, 88, 190, ${speakingGlowOpacity * 0.5}),
                   inset 0 -8px 24px rgba(0, 0, 0, 0.3),
                   inset 0 4px 16px rgba(168, 192, 240, 0.15)`
                : state === "processing"
                ? `0 0 35px rgba(99, 102, 241, 0.4),
                   0 0 70px rgba(99, 102, 241, 0.15),
                   inset 0 -8px 24px rgba(0, 0, 0, 0.3),
                   inset 0 4px 16px rgba(168, 192, 240, 0.12)`
                : state === "listening"
                ? `0 0 20px rgba(0, 88, 190, 0.2),
                   0 0 40px rgba(0, 88, 190, 0.08),
                   inset 0 -8px 24px rgba(0, 0, 0, 0.3),
                   inset 0 4px 16px rgba(168, 192, 240, 0.1)`
                : `0 0 30px rgba(0, 88, 190, 0.3),
                   0 0 60px rgba(0, 88, 190, 0.12),
                   inset 0 -8px 24px rgba(0, 0, 0, 0.3),
                   inset 0 4px 16px rgba(168, 192, 240, 0.15)`,
            transform:
              state === "speaking"
                ? `scale(${speakingScale})`
                : undefined,
            animation:
              state === "idle"
                ? "voice-orb-breathe 4s ease-in-out infinite"
                : state === "listening"
                ? "voice-orb-listen 2s ease-in-out infinite"
                : state === "processing"
                ? "voice-orb-think 2s ease-in-out infinite"
                : undefined,
            transition: state === "speaking" ? "transform 100ms ease-out, box-shadow 100ms ease-out" : "all 400ms ease-out",
          }}
        >
          {/* Shimmer highlight */}
          <div
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.12) 0%, transparent 50%, rgba(255,255,255,0.04) 100%)",
              animation:
                state === "processing"
                  ? "voice-orb-shimmer 2.5s ease-in-out infinite"
                  : "voice-orb-shimmer 5s ease-in-out infinite",
            }}
          />

          {/* Inner highlight dot */}
          <div
            className="absolute rounded-full"
            style={{
              width: "30%",
              height: "30%",
              top: "18%",
              left: "22%",
              background: "radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)",
              filter: "blur(6px)",
            }}
          />

          {/* PMMSherpa logo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/pmmsherpa-logo.png"
              alt="PMMSherpa"
              width={72}
              height={72}
              className="w-[52px] h-[52px] md:w-[72px] md:h-[72px] opacity-90 drop-shadow-lg"
              style={{ filter: "brightness(1.3)" }}
            />
          </div>
        </div>
      </div>

      {/* State label */}
      <span
        className="text-sm font-medium tracking-wide"
        style={{
          color:
            state === "processing"
              ? "rgba(165, 168, 240, 0.8)"
              : "rgba(148, 180, 230, 0.7)",
          animation:
            state === "listening" || state === "processing"
              ? "voice-orb-label-pulse 2s ease-in-out infinite"
              : undefined,
        }}
      >
        {STATE_LABELS[state]}
      </span>

      {/* Keyframe styles */}
      <style jsx>{`
        @keyframes voice-orb-breathe {
          0%, 100% { transform: scale(0.95); }
          50% { transform: scale(1.05); }
        }
        @keyframes voice-orb-listen {
          0%, 100% { transform: scale(0.92); }
          50% { transform: scale(0.97); }
        }
        @keyframes voice-orb-think {
          0%, 100% { transform: scale(0.98); }
          50% { transform: scale(1.04); }
        }
        @keyframes voice-orb-shimmer {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes voice-orb-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes voice-orb-spin-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes voice-orb-freq-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes voice-orb-label-pulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
