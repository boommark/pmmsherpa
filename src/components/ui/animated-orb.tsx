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

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full animate-pulse opacity-50 blur-xl"
        style={{
          background: 'linear-gradient(135deg, #818cf8 0%, #a78bfa 50%, #c4b5fd 100%)',
        }}
      />

      {/* Main orb with gradient */}
      <div
        className="absolute inset-0 rounded-full shadow-lg animate-[float_6s_ease-in-out_infinite]"
        style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 30%, #a78bfa 70%, #c4b5fd 100%)',
        }}
      />

      {/* Inner highlight */}
      <div
        className="absolute inset-2 rounded-full opacity-60"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%)',
        }}
      />

      {/* Animated shine effect */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
          animation: 'shine 3s ease-in-out infinite',
        }}
      />

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
            transform: translateX(-100%);
          }
          50%, 100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  )
}
