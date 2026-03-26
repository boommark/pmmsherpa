'use client'

export function BlobBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Soft blue mist — top right */}
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-30 dark:opacity-15 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(216,226,255,1) 0%, rgba(216,226,255,0) 70%)',
        }}
      />

      {/* Cool slate wash — bottom left */}
      <div
        className="absolute -bottom-48 -left-32 w-[600px] h-[600px] rounded-full opacity-25 dark:opacity-10 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(226,232,240,1) 0%, rgba(226,232,240,0) 70%)',
        }}
      />

      {/* Faint sapphire glow — center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-15 dark:opacity-8 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(168,192,240,1) 0%, rgba(168,192,240,0) 70%)',
        }}
      />

      {/* Subtle warm neutral accent — upper area */}
      <div
        className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-15 dark:opacity-8 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(242,244,247,1) 0%, rgba(242,244,247,0) 70%)',
        }}
      />
    </div>
  )
}
