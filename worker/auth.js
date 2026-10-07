// Helpers crypto (WebCrypto, compatible Workers + Node 19+).
const enc = new TextEncoder()

export function randomHex(bytes = 32) {
  const b = crypto.getRandomValues(new Uint8Array(bytes))
  return [...b].map((x) => x.toString(16).padStart(2, '0')).join('')
}

export async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(text))
  return [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, '0')).join('')
}

async function pbkdf2(password, saltHex) {
  const salt = new Uint8Array(saltHex.match(/../g).map((h) => parseInt(h, 16)))
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 200_000, hash: 'SHA-256' },
    key,
    256
  )
  return [...new Uint8Array(bits)].map((x) => x.toString(16).padStart(2, '0')).join('')
}

export async function hashPassword(password) {
  const salt = randomHex(16)
  const hash = await pbkdf2(password, salt)
  return { salt, hash }
}

export async function verifyPassword(password, salt, expected) {
  const hash = await pbkdf2(password, salt)
  return hash === expected
}

export function publicUser(row) {
  if (!row) return null
  return { id: row.id, name: row.name, email: row.email, created_at: row.created_at }
}

export const SESSION_DAYS = 30
