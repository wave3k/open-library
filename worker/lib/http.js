// Helpers HTTP : CORS, réponses JSON, lecture de corps, rate limiting.

export const CORS_HEADERS = {
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

/** On ne renvoie Allow-Origin que pour les origines connues. */
export function isAllowedOrigin(origin) {
  if (!origin) return false
  try {
    const { hostname, protocol } = new URL(origin)
    if (protocol !== 'https:' && protocol !== 'http:') return false
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true
    if (hostname.endsWith('.vercel.app')) return true
    if (hostname.endsWith('.lirostudio.workers.dev')) return true
    return false
  } catch {
    return false
  }
}

export function json(data, status = 200) {
  return Response.json(data, { status, headers: CORS_HEADERS })
}

/** Réponse publique mise en cache (CDN). */
export function cacheJson(data, maxAge = 60) {
  return Response.json(data, {
    headers: { ...CORS_HEADERS, 'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=300` },
  })
}

export async function readJson(req) {
  try {
    return await req.json()
  } catch {
    return null
  }
}

export function clientIp(req) {
  return req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for') || 'unknown'
}

/** Limite de débit simple (par clé) basée sur D1. Renvoie true si bloqué. */
export async function rateLimited(db, key, limit, windowSec) {
  const now = Date.now()
  const row = await db.prepare('SELECT count, window_start FROM rate_limits WHERE key = ?').bind(key).first()
  if (row && now - row.window_start < windowSec * 1000) {
    if (row.count >= limit) return true
    await db.prepare('UPDATE rate_limits SET count = count + 1 WHERE key = ?').bind(key).run()
    return false
  }
  await db
    .prepare('INSERT INTO rate_limits (key, count, window_start) VALUES (?, 1, ?) ON CONFLICT(key) DO UPDATE SET count = 1, window_start = excluded.window_start')
    .bind(key, now)
    .run()
  return false
}
