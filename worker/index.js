// Point d'entrée du Worker : CORS, routeur et tâche planifiée.
// La logique métier vit dans worker/routes/* et worker/lib/*.
import { publicProfile } from './auth.js'
import { json, CORS_HEADERS, isAllowedOrigin } from './lib/http.js'
import { currentUser } from './lib/session.js'
import { mediaRoutes } from './routes/media.js'
import { authRoutes } from './routes/auth.js'
import { publicRoutes } from './routes/public.js'
import { profileRoutes } from './routes/profiles.js'
import { bookRoutes } from './routes/books.js'

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || ''
    let res
    try {
      res = await route(req, env)
    } catch (e) {
      console.error(e)
      res = json({ error: 'Erreur serveur, réessaie dans un instant.' }, 500)
    }
    const headers = new Headers(res.headers)
    if (isAllowedOrigin(origin)) headers.set('Access-Control-Allow-Origin', origin)
    headers.set('Vary', 'Origin')
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers })
  },

  // Purge périodique (cron) : sessions expirées + rate limits anciens.
  async scheduled(_event, env) {
    await env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(Date.now()).run()
    await env.DB.prepare('DELETE FROM rate_limits WHERE window_start < ?').bind(Date.now() - 86400000).run()
  },
}

async function route(req, env) {
  const url = new URL(req.url)
  const path = url.pathname
  const db = env.DB

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  // ---- Média (R2) ----
  if (path.startsWith('/api/media/')) {
    const res = await mediaRoutes({ req, env, path })
    if (res) return res
  }

  if (!path.startsWith('/api/')) {
    return json({ error: 'Not found' }, 404)
  }

  const meRow = await currentUser(db, req)
  const me = meRow ? publicProfile(meRow, { self: true }) : null
  const ctx = { req, env, db, url, path, meRow, me }

  const res =
    (await authRoutes(ctx)) ||
    (await publicRoutes(ctx)) ||
    (await profileRoutes(ctx))

  if (res) return res

  // À partir d'ici, tout exige un compte.
  if (!me) return json({ error: 'Connecte-toi pour continuer.' }, 401)

  return (await bookRoutes(ctx)) || json({ error: 'Not found' }, 404)
}
