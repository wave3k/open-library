// Génère les favicons/icônes raster (Plume) à partir de src/app/icon.svg.
// Usage : node scripts/gen-icons.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(root, 'src/app/icon.svg'))

const out = join(root, 'public/icons')
import { mkdirSync } from 'node:fs'
mkdirSync(out, { recursive: true })

// Favicons aux tailles multiples de 48 exigées par Google (+ tailles utiles).
const sizes = [48, 96, 144, 192, 512]
for (const s of sizes) {
  const png = await sharp(svg, { density: 384 }).resize(s, s).png().toBuffer()
  writeFileSync(join(out, `icon-${s}.png`), png)
  console.log(`icon-${s}.png`)
}

// Apple touch icon (180).
writeFileSync(join(out, 'apple-touch-icon.png'), await sharp(svg, { density: 384 }).resize(180, 180).png().toBuffer())
console.log('apple-touch-icon.png')

// Logo carré 512 (Organization.logo pour Google).
writeFileSync(join(root, 'public/logo.png'), await sharp(svg, { density: 384 }).resize(512, 512).png().toBuffer())
console.log('logo.png')

// favicon.ico : conteneur ICO embarquant un PNG 32x32 (supporté par navigateurs et Google).
const png32 = await sharp(svg, { density: 384 }).resize(32, 32).png().toBuffer()
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0) // reserved
header.writeUInt16LE(1, 2) // type icon
header.writeUInt16LE(1, 4) // count
const entry = Buffer.alloc(16)
entry.writeUInt8(32, 0) // width
entry.writeUInt8(32, 1) // height
entry.writeUInt8(0, 2) // palette
entry.writeUInt8(0, 3) // reserved
entry.writeUInt16LE(1, 4) // planes
entry.writeUInt16LE(32, 6) // bpp
entry.writeUInt32LE(png32.length, 8) // size
entry.writeUInt32LE(22, 12) // offset
writeFileSync(join(root, 'public/favicon.ico'), Buffer.concat([header, entry, png32]))
console.log('favicon.ico')
