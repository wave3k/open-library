// GET /api/media/:key — sert un objet R2.
import { json, CORS_HEADERS } from '../lib/http.js'

export async function mediaRoutes({ req, env, path }) {
  if (!path.startsWith('/api/media/') || req.method !== 'GET') return null
  if (!env.MEDIA) return json({ error: 'Stockage média indisponible.' }, 503)
  const key = decodeURIComponent(path.slice('/api/media/'.length))
  const obj = await env.MEDIA.get(key)
  if (!obj) return json({ error: 'Introuvable.' }, 404)
  const headers = new Headers(CORS_HEADERS)
  obj.writeHttpMetadata(headers)
  headers.set('etag', obj.httpEtag)
  headers.set('Cache-Control', 'public, max-age=31536000, immutable')
  return new Response(obj.body, { headers })
}
