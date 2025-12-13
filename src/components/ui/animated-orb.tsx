'use client'

import { cn } from '@/lib/utils'

interface AnimatedOrbProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AnimatedOrb({ size = 'md', className }: AnimatedOrbProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  }

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Outer glow - indigo/purple */}
      <div
        className="absolute inset-0 rounded-full animate-pulse opacity-60 blur-xl"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
        }}
      />

      {/* Secondary glow ring */}
      <div
        className="absolute -inset-2 rounded-full opacity-30 blur-lg animate-[glow_4s_ease-in-out_infinite]"
        style={{
          background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)',
        }}
      />

      {/* Main orb container with gradient and float animation */}
      <div
        className="absolute inset-0 rounded-full shadow-lg animate-[float_6s_ease-in-out_infinite] flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
        }}
      >
        {/* Mountain peak icon */}
        <svg
          viewBox="0 0 24 24"
          className={cn(iconSizes[size], 'text-white')}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 20L7 10l5 6 4-10 6 14" />
        </svg>
      </div>

      {/* Animated shine sweep effect */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden pointer-events-none"
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
            animation: 'shine 3s ease-in-out infinite',
          }}
        />
      </div>

      {/* Sparkle dots - purple/indigo theme */}
      <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-violet-300 animate-[sparkle_2s_ease-in-out_infinite]" />
      <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 rounded-full bg-indigo-300 animate-[sparkle_2s_ease-in-out_infinite_0.5s]" />
      <div className="absolute top-1/4 -right-2 w-1 h-1 rounded-full bg-white animate-[sparkle_2s_ease-in-out_infinite_1s]" />

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-8px) scale(1.02);
          }
        }
        @keyframes shine {
          0% {
            transform: translateX(-150%);
          }
          50%, 100% {
            transform: translateX(150%);
          }
        }
        @keyframes glow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.1);
          }
        }
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}
