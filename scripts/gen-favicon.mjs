import sharp from 'sharp';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const svgPath = path.join(root, 'public/pmmsherpa-logo-round.svg');
const appDir = path.join(root, 'src/app');
const publicIcons = path.join(root, 'public/icons');

const svg = await readFile(svgPath);

async function renderPng(size) {
  return await sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();
}

const targets = [
  { buf: await renderPng(32),  out: path.join(appDir, 'icon.png') },
  { buf: await renderPng(180), out: path.join(appDir, 'apple-icon.png') },
  { buf: await renderPng(192), out: path.join(publicIcons, 'pwa-192.png') },
  { buf: await renderPng(512), out: path.join(publicIcons, 'pwa-512.png') },
];

for (const { buf, out } of targets) {
  await writeFile(out, buf);
  console.log('wrote', path.relative(root, out), `(${buf.length} bytes)`);
}

// Multi-size favicon.ico (PNG-embedded). Sizes: 16, 32, 48.
const icoSizes = [16, 32, 48];
const icoPngs = await Promise.all(icoSizes.map(renderPng));

const HEADER = 6;
const ENTRY = 16;
const dirSize = HEADER + ENTRY * icoPngs.length;

const dir = Buffer.alloc(dirSize);
dir.writeUInt16LE(0, 0);                  // reserved
dir.writeUInt16LE(1, 2);                  // type = icon
dir.writeUInt16LE(icoPngs.length, 4);     // count

let offset = dirSize;
icoPngs.forEach((png, i) => {
  const e = HEADER + i * ENTRY;
  const size = icoSizes[i];
  dir.writeUInt8(size === 256 ? 0 : size, e + 0); // width
  dir.writeUInt8(size === 256 ? 0 : size, e + 1); // height
  dir.writeUInt8(0, e + 2);                       // color count
  dir.writeUInt8(0, e + 3);                       // reserved
  dir.writeUInt16LE(1, e + 4);                    // planes
  dir.writeUInt16LE(32, e + 6);                   // bit count
  dir.writeUInt32LE(png.length, e + 8);           // bytes in res
  dir.writeUInt32LE(offset, e + 12);              // image offset
  offset += png.length;
});

const ico = Buffer.concat([dir, ...icoPngs]);
const icoOut = path.join(appDir, 'favicon.ico');
await writeFile(icoOut, ico);
console.log('wrote', path.relative(root, icoOut), `(${ico.length} bytes, sizes: ${icoSizes.join('/')})`);
