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
    // Workers limite PBKDF2 à 100 000 itérations max
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
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

function parseJsonArr(v, fallback = []) {
  try {
    const a = JSON.parse(v ?? '[]')
    return Array.isArray(a) ? a : fallback
  } catch {
    return fallback
  }
}

/** Profil public d'un utilisateur (jamais l'e-mail pour un tiers). */
export function publicProfile(row, { self = false } = {}) {
  if (!row) return null
  return {
    id: row.id,
    username: row.username || row.id,
    display_name: row.display_name || row.name || 'Anonyme',
    name: row.display_name || row.name || 'Anonyme',
    bio: row.bio || '',
    avatar_emoji: row.avatar_emoji || '',
    avatar_color: row.avatar_color || 'amber',
    avatar_image: row.avatar_image || '',
    banner_image: row.banner_image || '',
    preferences: parseJsonArr(row.preferences),
    onboarded: row.onboarded === 1,
    created_at: row.created_at,
    ...(self ? { email: row.email, referral_source: row.referral_source || '' } : {}),
  }
}

/** Identité minimale de l'auteur, embarquée dans un livre. */
export function authorRef(row) {
  if (!row) return null
  return {
    id: row.id,
    username: row.owner_username || row.id,
    display_name: row.owner_display_name || row.name || 'Anonyme',
    avatar_emoji: row.owner_avatar_emoji || '',
    avatar_color: row.owner_avatar_color || 'amber',
    avatar_image: row.owner_avatar_image || '',
  }
}

export const SESSION_DAYS = 30

/** Génère un username unique à partir d'un nom. */
export function slugUsername(base, rand = randomHex(3)) {
  const clean = String(base || 'auteur')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 24)
  return `${clean || 'auteur'}_${rand.slice(0, 4)}`
}
