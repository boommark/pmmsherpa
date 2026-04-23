import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mountain path points parsed from: M2 20L7 10l5 6 4-10 6 14
// Points on 24x24 grid: (2,20) (7,10) (12,16) (16,6) (22,20)
// Scaled to 400x400 canvas (within 512x512 with padding)
const SIZE = 512;
const PAD = 56;
const INNER = SIZE - PAD * 2; // 400
const scale = INNER / 24;

const pts = [[2,20],[7,10],[12,16],[16,6],[22,20]]
  .map(([x,y]) => `${PAD + x * scale},${PAD + y * scale}`)
  .join(' ');

const RADIUS = 96; // rounded corner radius
const STROKE = Math.round(scale * 2.2); // ~36px

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#a855f7"/>
    </linearGradient>
  </defs>
  <rect width="${SIZE}" height="${SIZE}" rx="${RADIUS}" ry="${RADIUS}" fill="url(#g)"/>
  <polyline
    points="${pts}"
    fill="none"
    stroke="white"
    stroke-width="${STROKE}"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>`;

const outPath = path.join(__dirname, '../public/pmmsherpa-logo.png');

await sharp(Buffer.from(svg))
  .png()
  .toFile(outPath);

console.log('Done:', outPath);
