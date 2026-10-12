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
    if (hostname === 'hqmerchant.xyz' || hostname.endsWith('.hqmerchant.xyz')) return true
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
  // Ne JAMAIS lire le premier maillon de X-Forwarded-For : il est écrit par le
  // client et donc falsifiable (contournement du rate limiting). Le proxy de
  // confiance (Vercel/Cloudflare) ajoute l'IP réelle en DERNIER ; on lit donc le
  // dernier maillon. À défaut, on retombe sur cf-connecting-ip, posé par
  // Cloudflare et non contrôlable par le client.
  const xff = req.headers.get('x-forwarded-for')
  if (xff) {
    const parts = xff.split(',').map((s) => s.trim()).filter(Boolean)
    if (parts.length) return parts[parts.length - 1]
  }
  return req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || 'unknown'
}

/**
 * Limite de débit simple (par clé) basée sur D1. Renvoie true si bloqué.
 * L'incrément et la décision tiennent dans UNE seule instruction atomique
 * (UPSERT ... RETURNING) : fini le TOCTOU lecture-puis-écriture qui laissait
 * passer des rafales concurrentes.
 */
export async function rateLimited(db, key, limit, windowSec) {
  const now = Date.now()
  const windowMs = windowSec * 1000
  const row = await db
    .prepare(
      `INSERT INTO rate_limits (key, count, window_start) VALUES (?, 1, ?)
       ON CONFLICT(key) DO UPDATE SET
         count = CASE WHEN ? - window_start < ? THEN count + 1 ELSE 1 END,
         window_start = CASE WHEN ? - window_start < ? THEN window_start ELSE ? END
       RETURNING count`
    )
    .bind(key, now, now, windowMs, now, windowMs, now)
    .first()
  return (row?.count ?? 0) > limit
}
