"use client";

import React, { useRef, useEffect, useCallback } from "react";

interface VoiceWaveformProps {
  audioLevel: number;
  isActive: boolean;
}

const BAR_COUNT = 28;
const BAR_WIDTH = 3;
const BAR_GAP = 4;
const MIN_BAR_HEIGHT = 3;
const MAX_BAR_HEIGHT = 80;
const CANVAS_HEIGHT = 100;

// Pre-computed distribution: bars in the center are taller
function barScale(index: number, total: number): number {
  const center = (total - 1) / 2;
  const distance = Math.abs(index - center) / center;
  return 1 - distance * 0.6;
}

export function VoiceWaveform({ audioLevel, isActive }: VoiceWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const barHeightsRef = useRef<number[]>(new Array(BAR_COUNT).fill(MIN_BAR_HEIGHT));
  const targetHeightsRef = useRef<number[]>(new Array(BAR_COUNT).fill(MIN_BAR_HEIGHT));
  const timeRef = useRef(0);
  const audioLevelRef = useRef(audioLevel);
  const isActiveRef = useRef(isActive);

  // Keep refs in sync
  audioLevelRef.current = audioLevel;
  isActiveRef.current = isActive;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Resize canvas for DPR if needed
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    }

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    timeRef.current += 0.02;
    const level = audioLevelRef.current;
    const active = isActiveRef.current;

    // Calculate target heights
    for (let i = 0; i < BAR_COUNT; i++) {
      const scale = barScale(i, BAR_COUNT);
      if (active && level > 0.02) {
        // Reactive to voice: add some randomized organic movement
        const noise =
          Math.sin(timeRef.current * 3 + i * 0.8) * 0.3 +
          Math.sin(timeRef.current * 5.5 + i * 1.3) * 0.2 +
          Math.cos(timeRef.current * 2.1 + i * 0.5) * 0.15;
        const randomFactor = 0.6 + noise * 0.4;
        targetHeightsRef.current[i] =
          MIN_BAR_HEIGHT + (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT) * level * scale * randomFactor;
      } else {
        // Idle: subtle ambient wave
        const idleWave =
          Math.sin(timeRef.current * 1.5 + i * 0.4) * 0.3 +
          Math.sin(timeRef.current * 0.8 + i * 0.7) * 0.2;
        targetHeightsRef.current[i] = MIN_BAR_HEIGHT + (active ? 4 : 2) * (0.5 + idleWave * 0.5) * scale;
      }
    }

    // Smooth interpolation toward targets
    const smoothing = level > 0.02 ? 0.18 : 0.08;
    for (let i = 0; i < BAR_COUNT; i++) {
      barHeightsRef.current[i] +=
        (targetHeightsRef.current[i] - barHeightsRef.current[i]) * smoothing;
    }

    // Draw bars
    const totalWidth = BAR_COUNT * BAR_WIDTH + (BAR_COUNT - 1) * BAR_GAP;
    const startX = (width - totalWidth) / 2;

    for (let i = 0; i < BAR_COUNT; i++) {
      const barHeight = barHeightsRef.current[i];
      const x = startX + i * (BAR_WIDTH + BAR_GAP);
      const y = height - barHeight;

      // Create gradient for each bar
      const gradient = ctx.createLinearGradient(x, y, x, height);
      const intensity = barHeight / MAX_BAR_HEIGHT;
      gradient.addColorStop(0, `rgba(168, 192, 240, ${0.5 + intensity * 0.5})`);
      gradient.addColorStop(0.5, `rgba(0, 88, 190, ${0.6 + intensity * 0.4})`);
      gradient.addColorStop(1, `rgba(0, 58, 140, ${0.3 + intensity * 0.3})`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      // Rounded top
      const radius = BAR_WIDTH / 2;
      ctx.moveTo(x, height);
      ctx.lineTo(x, y + radius);
      ctx.arcTo(x, y, x + radius, y, radius);
      ctx.arcTo(x + BAR_WIDTH, y, x + BAR_WIDTH, y + radius, radius);
      ctx.lineTo(x + BAR_WIDTH, height);
      ctx.closePath();
      ctx.fill();
    }

    animationFrameRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [draw]);

  return (
    <div
      className="w-full flex justify-center px-4"
      style={{
        background: "linear-gradient(180deg, transparent 0%, rgba(0, 88, 190, 0.04) 30%, rgba(0, 88, 190, 0.08) 100%)",
        borderRadius: "16px",
        padding: "8px 16px",
        maxWidth: "400px",
        margin: "0 auto",
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full max-w-[320px]"
        style={{ height: `${CANVAS_HEIGHT}px` }}
      />
    </div>
  );
}
