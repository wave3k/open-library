// Routes d'authentification, profil, mot de passe, compte et upload.
import { hashPassword, verifyPassword, publicProfile, randomHex, sha256Hex, slugUsername } from '../auth.js'
import { json, readJson, clientIp, rateLimited } from '../lib/http.js'
import { issueSession } from '../lib/session.js'
import { detectImage } from '../lib/util.js'
import { EMAIL_RE, USERNAME_RE, GENRES, COVERS, REFERRALS, cleanTags, profileStats } from '../lib/models.js'

export async function authRoutes(ctx) {
  const { req, env, db, url, path, me } = ctx
  const method = req.method

  if (method === 'POST' && path === '/api/auth/signup') {
    if (await rateLimited(db, `signup:${clientIp(req)}`, 10, 3600)) {
      return json({ error: 'Trop de tentatives. Réessaie dans une heure.' }, 429)
    }
    const body = (await readJson(req)) || {}
    const name = String(body.display_name ?? body.name ?? '').trim().slice(0, 40)
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    let username = String(body.username ?? '').trim().toLowerCase()
    const referral = REFERRALS.includes(String(body.referral_source)) ? String(body.referral_source) : 'other'
    const preferences = cleanTags(body.preferences).filter((g) => GENRES.includes(g)).slice(0, 7)

    if (name.length < 2) return json({ error: 'Indique ton nom d’affichage (2 caractères minimum).' }, 400)
    if (!EMAIL_RE.test(email)) return json({ error: 'Adresse e-mail invalide.' }, 400)
    if (password.length < 8) return json({ error: 'Mot de passe : 8 caractères minimum.' }, 400)
    if (username && !USERNAME_RE.test(username)) {
      return json({ error: 'Nom d’utilisateur : 3 à 24 caractères, lettres minuscules, chiffres et _ uniquement.' }, 400)
    }
    const exists = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
    if (exists) return json({ error: 'Un compte existe déjà avec cet e-mail.' }, 409)
    if (!username) username = slugUsername(name || email.split('@')[0])
    let attempts = 0
    while (await db.prepare('SELECT id FROM users WHERE username = ?').bind(username).first()) {
      if (++attempts > 10) return json({ error: 'Nom d’utilisateur indisponible, réessaie dans un instant.' }, 409)
      username = slugUsername(name || email.split('@')[0])
    }
    const { salt, hash } = await hashPassword(password)
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    await db
      .prepare(
        `INSERT INTO users (id, name, email, password_hash, salt, created_at, username, display_name, referral_source, preferences)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(id, name, email, hash, salt, now, username, name, referral, JSON.stringify(preferences))
      .run()
    const token = await issueSession(db, id)
    return json({ user: { id, username, display_name: name, name, email, created_at: now }, token }, 201)
  }

  if (method === 'POST' && path === '/api/auth/login') {
    if (await rateLimited(db, `login:${clientIp(req)}`, 20, 900)) {
      return json({ error: 'Trop de tentatives. Réessaie dans quelques minutes.' }, 429)
    }
    const body = (await readJson(req)) || {}
    const email = String(body.email ?? '').trim().toLowerCase()
    const password = String(body.password ?? '')
    const row = await db.prepare('SELECT * FROM users WHERE email = ?').bind(email).first()
    if (!row || !(await verifyPassword(password, row.salt, row.password_hash))) {
      return json({ error: 'E-mail ou mot de passe incorrect.' }, 401)
    }
    const token = await issueSession(db, row.id)
    return json({ user: publicProfile(row, { self: true }), token })
  }

  if (method === 'POST' && path === '/api/auth/logout') {
    const auth = req.headers.get('Authorization') || ''
    const m = auth.match(/^Bearer\s+(.+)$/i)
    if (m) {
      await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256Hex(m[1].trim())).run()
    }
    return json({ ok: true })
  }

  if (method === 'GET' && path === '/api/username-available') {
    const u = String(url.searchParams.get('username') ?? '').trim().toLowerCase()
    if (!USERNAME_RE.test(u)) return json({ available: false, reason: 'format' })
    const taken = await db.prepare('SELECT id FROM users WHERE username = ?').bind(u).first()
    return json({ available: !taken })
  }

  if (method === 'GET' && path === '/api/me') {
    if (!me) return json({ error: 'Non connecté.' }, 401)
    const stats = await profileStats(db, me.id)
    const unread = await db.prepare('SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND read = 0').bind(me.id).first()
    return json({ user: me, stats, unread: unread?.n ?? 0 })
  }

  if (method === 'PUT' && path === '/api/profile') {
    if (!me) return json({ error: 'Connecte-toi pour continuer.' }, 401)
    const body = (await readJson(req)) || {}
    const sets = []
    const vals = []
    if (body.display_name !== undefined) {
      const dn = String(body.display_name).trim().slice(0, 40)
      if (dn.length < 2) return json({ error: 'Le nom d’affichage doit faire au moins 2 caractères.' }, 400)
      sets.push('display_name = ?', 'name = ?')
      vals.push(dn, dn)
    }
    if (body.bio !== undefined) { sets.push('bio = ?'); vals.push(String(body.bio).trim().slice(0, 300)) }
    if (body.avatar_emoji !== undefined) { sets.push('avatar_emoji = ?'); vals.push(String(body.avatar_emoji).slice(0, 8)) }
    if (body.avatar_color !== undefined) {
      sets.push('avatar_color = ?')
      vals.push(COVERS.includes(String(body.avatar_color)) ? String(body.avatar_color) : 'amber')
    }
    if (body.avatar_image !== undefined) {
      const img = String(body.avatar_image)
      sets.push('avatar_image = ?')
      vals.push(/^(\/api\/media\/|https?:\/\/)/.test(img) ? img.slice(0, 500) : '')
    }
    if (body.banner_image !== undefined) {
      const img = String(body.banner_image)
      sets.push('banner_image = ?')
      vals.push(/^(\/api\/media\/|https?:\/\/)/.test(img) ? img.slice(0, 500) : '')
    }
    if (body.banner_color !== undefined) { sets.push('banner_color = ?'); vals.push(String(body.banner_color).slice(0, 30)) }
    if (body.preferences !== undefined) {
      sets.push('preferences = ?')
      vals.push(JSON.stringify(cleanTags(body.preferences).filter((g) => GENRES.includes(g)).slice(0, 7)))
    }
    if (body.referral_source !== undefined) {
      sets.push('referral_source = ?')
      vals.push(REFERRALS.includes(String(body.referral_source)) ? String(body.referral_source) : 'other')
    }
    if (body.onboarded !== undefined) { sets.push('onboarded = ?'); vals.push(body.onboarded ? 1 : 0) }
    if (body.profile_visibility !== undefined) {
      const v = String(body.profile_visibility)
      sets.push('profile_visibility = ?')
      vals.push(['public', 'followers', 'private'].includes(v) ? v : 'public')
    }
    if (body.username !== undefined) {
      const u = String(body.username).trim().toLowerCase()
      if (!USERNAME_RE.test(u)) return json({ error: 'Nom d’utilisateur invalide.' }, 400)
      if (u !== me.username) {
        const taken = await db.prepare('SELECT id FROM users WHERE username = ? AND id != ?').bind(u, me.id).first()
        if (taken) return json({ error: 'Ce nom d’utilisateur est déjà pris.' }, 409)
        sets.push('username = ?')
        vals.push(u)
      }
    }
    if (!sets.length) return json({ error: 'Rien à mettre à jour.' }, 400)
    await db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).bind(...vals, me.id).run()
    const updated = await db.prepare('SELECT * FROM users WHERE id = ?').bind(me.id).first()
    return json({ user: publicProfile(updated, { self: true }), stats: await profileStats(db, me.id) })
  }

  if (method === 'POST' && path === '/api/profile/password') {
    if (!me) return json({ error: 'Connecte-toi pour continuer.' }, 401)
    if (await rateLimited(db, `pwd:${me.id}`, 10, 900)) {
      return json({ error: 'Trop de tentatives. Réessaie plus tard.' }, 429)
    }
    const body = (await readJson(req)) || {}
    const current = String(body.current_password ?? '')
    const next = String(body.new_password ?? '')
    if (next.length < 8) return json({ error: 'Nouveau mot de passe : 8 caractères minimum.' }, 400)
    const row = await db.prepare('SELECT salt, password_hash FROM users WHERE id = ?').bind(me.id).first()
    if (!row || !(await verifyPassword(current, row.salt, row.password_hash))) {
      return json({ error: 'Mot de passe actuel incorrect.' }, 401)
    }
    const { salt, hash } = await hashPassword(next)
    await db.prepare('UPDATE users SET salt = ?, password_hash = ? WHERE id = ?').bind(salt, hash, me.id).run()
    const auth = req.headers.get('Authorization') || ''
    const m = auth.match(/^Bearer\s+(.+)$/i)
    if (m) {
      await db.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash != ?').bind(me.id, await sha256Hex(m[1].trim())).run()
    }
    return json({ ok: true })
  }

  if (method === 'DELETE' && path === '/api/account') {
    if (!me) return json({ error: 'Connecte-toi pour continuer.' }, 401)
    const body = (await readJson(req)) || {}
    const row = await db.prepare('SELECT salt, password_hash FROM users WHERE id = ?').bind(me.id).first()
    if (!row || !(await verifyPassword(String(body.password ?? ''), row.salt, row.password_hash))) {
      return json({ error: 'Mot de passe incorrect.' }, 401)
    }
    await db.prepare('DELETE FROM users WHERE id = ?').bind(me.id).run()
    return json({ ok: true })
  }

  if (method === 'POST' && path === '/api/upload') {
    if (!me) return json({ error: 'Connecte-toi pour continuer.' }, 401)
    if (!env.MEDIA) return json({ error: 'Stockage média indisponible.' }, 503)
    const MAX = 8 * 1024 * 1024
    const declared = Number(req.headers.get('content-length') || 0)
    if (declared && declared > MAX) return json({ error: 'Image trop lourde (8 Mo max).' }, 413)
    const buf = await req.arrayBuffer()
    if (buf.byteLength > MAX) return json({ error: 'Image trop lourde (8 Mo max).' }, 413)
    const kind = detectImage(buf)
    if (!kind) return json({ error: 'Fichier image invalide (png, jpg, webp, gif).' }, 400)
    const mime = kind === 'jpg' ? 'image/jpeg' : `image/${kind}`
    const key = `u/${me.id}/${Date.now()}-${randomHex(4)}.${kind}`
    await env.MEDIA.put(key, buf, { httpMetadata: { contentType: mime } })
    return json({ url: `/api/media/${key}` }, 201)
  }

  return null
}
