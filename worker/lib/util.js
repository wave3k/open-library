// Utilitaires génériques.

export function parseArr(v, fallback = []) {
  try {
    const a = JSON.parse(v ?? '[]')
    return Array.isArray(a) ? a : fallback
  } catch {
    return fallback
  }
}

export function parseObj(v, fallback = {}) {
  try {
    const o = JSON.parse(v ?? '{}')
    return o && typeof o === 'object' && !Array.isArray(o) ? o : fallback
  } catch {
    return fallback
  }
}

/** Détecte le type d'image par ses magic bytes. Retourne 'png'|'jpg'|'gif'|'webp'|null. */
export function detectImage(bytes) {
  const b = new Uint8Array(bytes.slice(0, 12))
  if (b.length < 12) return null
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png'
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpg'
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return 'gif'
  if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return 'webp'
  return null
}
