import fs from 'node:fs'
import path from 'node:path'
import { ImageResponse } from 'next/og'
import { getPost } from '@/lib/blog'

export const alt = 'PMM Sherpa blog post'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

/** Read a raster hero (jpg/png/webp under public/) as a data URI, if present. */
function heroDataUri(heroImage: string | undefined): string | null {
  if (!heroImage || !heroImage.startsWith('/')) return null
  const ext = path.extname(heroImage).toLowerCase()
  const mime = MIME_BY_EXT[ext]
  if (!mime) return null
  try {
    const publicDir = path.join(process.cwd(), 'public')
    const full = path.join(publicDir, heroImage.replace(/^\//, ''))
    if (!full.startsWith(publicDir)) return null
    const data = fs.readFileSync(full)
    return `data:${mime};base64,${data.toString('base64')}`
  } catch {
    return null
  }
}

function MountainMark() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 56,
        height: 56,
        borderRadius: 14,
        background: 'linear-gradient(135deg, #0058be 0%, #2170e4 100%)',
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="30"
        height="30"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 20L7 10l5 6 4-10 6 14" />
      </svg>
    </div>
  )
}

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getPost(slug)
  const title = post?.frontmatter.title ?? 'PMM Sherpa Blog'
  const authorName = post?.author.name ?? 'PMM Sherpa'
  const hero = heroDataUri(post?.frontmatter.heroImage)

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          position: 'relative',
          background: hero
            ? '#0a1628'
            : 'linear-gradient(135deg, #0a1628 0%, #0058be 60%, #2170e4 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {hero ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero}
            alt=""
            width={size.width}
            height={size.height}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : null}
        {/* Scrim so the overlay text stays readable on any hero */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            background: hero
              ? 'linear-gradient(180deg, rgba(10,22,40,0.45) 0%, rgba(10,22,40,0.78) 50%, rgba(10,22,40,0.97) 100%)'
              : 'linear-gradient(180deg, rgba(10,22,40,0) 0%, rgba(10,22,40,0.35) 100%)',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            padding: '0 72px 64px',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <MountainMark />
            <div
              style={{
                display: 'flex',
                color: 'white',
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: '-0.01em',
              }}
            >
              PMM Sherpa
            </div>
          </div>
          <div
            style={{
              display: 'block',
              color: 'white',
              fontSize: 62,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              lineClamp: 3,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: 'flex',
              color: 'rgba(255,255,255,0.78)',
              fontSize: 26,
              fontWeight: 500,
            }}
          >
            {authorName}
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
