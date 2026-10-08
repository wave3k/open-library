'use client'

import { useState } from 'react'

// Images Apple Emoji servies localement pour notre sélection,
// et via le CDN jsDelivr pour tout autre emoji.
const APPLE_CDN = 'https://cdn.jsdelivr.net/npm/emoji-datasource-apple@15.1.2/img/apple/64'

const LOCAL = new Set([
  '2728', '1f33f', '1f525', '1f30a', '1f319', '1f4d6', '1f6f0-fe0f', '1f5e1-fe0f',
  '2764-fe0f', '1f451', '1f409', '1f680', '1f30c', '1f52e', '1f56f-fe0f', '1f3f0',
  '2694-fe0f', '1f9ed', '1f5dd-fe0f', '1f98b', '1f339', '2600-fe0f', '1f327-fe0f', '26a1',
])

function unified(char: string): string {
  return [...char].map((c) => c.codePointAt(0)!.toString(16)).join('-')
}

export function appleEmojiUrl(char: string): string {
  const u = unified(char)
  return LOCAL.has(u) ? `/emoji/${u}.png` : `${APPLE_CDN}/${u}.png`
}

/** Affiche un emoji au style Apple ; repli sur l'emoji natif si l'image échoue. */
export function Emoji({ char, size = 20, className }: { char: string; size?: number; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (!char) return null
  if (failed) {
    return <span className={className} style={{ fontSize: size, lineHeight: 1 }} aria-hidden="true">{char}</span>
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={appleEmojiUrl(char)}
      alt={char}
      draggable={false}
      className={className}
      style={{ width: size, height: size, display: 'inline-block', objectFit: 'contain' }}
      onError={() => setFailed(true)}
    />
  )
}
