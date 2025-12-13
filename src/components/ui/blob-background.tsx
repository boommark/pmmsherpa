'use client'

export function BlobBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Soft peach/cream blob - top right */}
      <div
        className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-40 dark:opacity-20 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(255,237,213,1) 0%, rgba(255,237,213,0) 70%)',
        }}
      />

      {/* Soft mint/green blob - bottom left */}
      <div
        className="absolute -bottom-48 -left-32 w-[600px] h-[600px] rounded-full opacity-30 dark:opacity-15 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(209,250,229,1) 0%, rgba(209,250,229,0) 70%)',
        }}
      />

      {/* Soft lavender blob - center */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-20 dark:opacity-10 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(233,213,255,1) 0%, rgba(233,213,255,0) 70%)',
        }}
      />

      {/* Additional subtle blue accent blob */}
      <div
        className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-20 dark:opacity-10 blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(191,219,254,1) 0%, rgba(191,219,254,0) 70%)',
        }}
      />
    </div>
  )
}
