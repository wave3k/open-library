import {
  hashPassword,
  verifyPassword,
  publicProfile,
  authorRef,
  randomHex,
  sha256Hex,
  slugUsername,
  SESSION_DAYS,
} from './auth.js'
import { recommend } from './recommend.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const USERNAME_RE = /^[a-z0-9_]{3,24}$/
const GENRES = [
  'Fantastique', 'Romance', 'Science-Fiction', 'Policier', 'Thriller', 'Aventure',
  'Horreur', 'Poésie', 'Éducatif', 'Programmation', 'Business', 'Développement personnel',
  'Histoire', 'Biographie', 'Cuisine', 'Voyage', 'Santé', 'Humour', 'Jeunesse',
  'Manga & BD', 'Science', 'Art & Musique', 'Sport', 'Religion & Spiritualité',
]
const COVERS = ['indigo', 'emerald', 'rose', 'sky', 'amber', 'slate']
const COVER_FONTS = ['serif', 'sans', 'mono', 'display', 'hand']
const COVER_PATTERNS = ['none', 'stripes', 'dots', 'grid', 'waves']
const COVER_LAYOUTS = ['classic', 'centered', 'minimal', 'band']
const REFERRALS = ['youtube', 'x', 'search', 'ia', 'friend', 'tiktok', 'instagram', 'other']

// Le front Next.js (dev local + Vercel) appelle l'API en cross-origin.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
}

function json(data, status = 200) {
  return Response.json(data, { status, headers: CORS_HEADERS })
}

async function readJson(req) {
  try {
    return await req.json()
  } catch {
    return null
  }
}

function parseArr(v, fallback = []) {
  try {
    const a = JSON.parse(v ?? '[]')
    return Array.isArray(a) ? a : fallback
  } catch {
    return fallback
  }
}

function parseObj(v, fallback = {}) {
  try {
    const o = JSON.parse(v ?? '{}')
    return o && typeof o === 'object' && !Array.isArray(o) ? o : fallback
  } catch {
    return fallback
  }
}

/** Nombre de mots dans du HTML ou du texte brut. */
function wordCountOf(html) {
  const text = String(html ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')
  return text.trim().split(/\s+/).filter(Boolean).length
}

async function currentUser(db, req) {
  const auth = req.headers.get('Authorization') || ''
  const m = auth.match(/^Bearer\s+(.+)$/i)
  if (!m) return null
  const tokenHash = await sha256Hex(m[1].trim())
  const row = await db
    .prepare(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`
    )
    .bind(tokenHash, Date.now())
    .first()
  return row || null
}

async function issueSession(db, userId) {
  const token = randomHex(32)
  const tokenHash = await sha256Hex(token)
  const expires = Date.now() + SESSION_DAYS * 24 * 3600 * 1000
  await db
    .prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(tokenHash, userId, expires)
    .run()
  return token
}

function cleanCoverStyle(raw) {
  const o = raw && typeof raw === 'object' ? raw : {}
  const pick = (v, list, def) => (list.includes(v) ? v : def)
  return {
    mode: pick(o.mode, ['design', 'image'], 'design'),
    preset: pick(o.preset, COVERS, 'indigo'),
    font: pick(o.font, COVER_FONTS, 'serif'),
    pattern: pick(o.pattern, COVER_PATTERNS, 'none'),
    layout: pick(o.layout, COVER_LAYOUTS, 'classic'),
    emoji: String(o.emoji ?? '').slice(0, 8),
    textColor: /^#[0-9a-fA-F]{3,8}$/.test(o.textColor ?? '') ? o.textColor : '#ffffff',
    image: /^https?:\/\//.test(o.image ?? '') || String(o.image ?? '').startsWith('/api/media/') ? String(o.image).slice(0, 500) : '',
  }
}

function cleanTags(raw) {
  if (!Array.isArray(raw)) return []
  return [...new Set(raw.map((t) => String(t).trim().slice(0, 20)).filter(Boolean))].slice(0, 5)
}

function serializeBook(book, chapters, extra = {}) {  return {
    id: book.id,
    owner_id: book.owner_id,
    owner_name: book.owner_display_name || book.owner_name || 'Anonyme',
    author: book.author,
    title: book.title,
    genre: book.genre,
    description: book.description || '',
    cover: book.cover,
    cover_style: parseObj(book.cover_style, {}),
    tags: parseArr(book.tags, []),
    is_public: book.is_public === 1,
    created_at: book.created_at,
    updated_at: book.updated_at,
    views: book.views || 0,
    impressions: book.impressions || 0,
    likes: extra.likes ?? 0,
    comments: extra.comments ?? 0,
    owner: authorRef(book),
    chapters: (chapters || []).map((c) => ({ id: c.id, title: c.title, content: c.content || '' })),
  }
}

/** Carte publique allégée (sans contenu de chapitre) pour landing/recherche. */
function publicCard(b) {
  return {
    id: b.id,
    owner_id: b.owner_id,
    owner_name: b.owner_display_name || 'Anonyme',
    author: b.author,
    title: b.title,
    genre: b.genre,
    description: b.description || '',
    cover: b.cover,
    cover_style: parseObj(b.cover_style, {}),
    tags: parseArr(b.tags, []),
    is_public: true,
    created_at: b.created_at,
    updated_at: b.updated_at,
    views: b.views || 0,
    impressions: b.impressions || 0,
    likes: b.like_count || 0,
    comments: b.comment_count || 0,
    chapter_count: b.chapter_count || 0,
    owner: {
      id: b.owner_id,
      username: b.owner_username || b.owner_id,
      display_name: b.owner_display_name || 'Anonyme',
      avatar_emoji: b.owner_avatar_emoji || '',
      avatar_color: b.owner_avatar_color || 'amber',
      avatar_image: b.owner_avatar_image || '',
    },
    chapters: [],
  }
}

const BOOK_SELECT = `SELECT b.*, u.username AS owner_username, u.display_name AS owner_display_name,
  u.avatar_emoji AS owner_avatar_emoji, u.avatar_color AS owner_avatar_color, u.avatar_image AS owner_avatar_image
  FROM books b LEFT JOIN users u ON u.id = b.owner_id`

async function bookCounts(db, bookId) {
  const [l, c] = await Promise.all([
    db.prepare('SELECT COUNT(*) AS n FROM likes WHERE book_id = ?').bind(bookId).first(),
    db.prepare('SELECT COUNT(*) AS n FROM comments WHERE book_id = ?').bind(bookId).first(),
  ])
  return { likes: l?.n ?? 0, comments: c?.n ?? 0 }
}

/** Crée une notification (sauf si l'acteur est le destinataire). */
async function notify(db, { userId, type, actorId, bookId = null, commentId = null }) {
  if (!userId || userId === actorId) return
  await db
    .prepare('INSERT INTO notifications (id, user_id, type, actor_id, book_id, comment_id, read, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)')
    .bind(crypto.randomUUID(), userId, type, actorId, bookId, commentId, new Date().toISOString())
    .run()
}

async function followCounts(db, userId) {
  const [f, g] = await Promise.all([
    db.prepare('SELECT COUNT(*) AS n FROM follows WHERE following_id = ?').bind(userId).first(),
    db.prepare('SELECT COUNT(*) AS n FROM follows WHERE follower_id = ?').bind(userId).first(),
  ])
  return { followers: f?.n ?? 0, following: g?.n ?? 0 }
}

async function loadBook(db, id) {
  const book = await db.prepare(`${BOOK_SELECT} WHERE b.id = ?`).bind(id).first()
  if (!book) return null
  const { results } = await db
    .prepare('SELECT * FROM chapters WHERE book_id = ? ORDER BY position ASC, rowid ASC')
    .bind(id)
    .all()
  const counts = await bookCounts(db, id)
  return serializeBook(book, results || [], counts)
}

function cleanBookInput(body, partial = false) {
  const out = {}
  if (body.title !== undefined || !partial) out.title = String(body.title ?? '').trim().slice(0, 80)
  if (body.author !== undefined || !partial) out.author = String(body.author ?? '').trim().slice(0, 40)
  if (body.genre !== undefined || !partial) {
    const g = String(body.genre ?? 'Aventure')
    out.genre = GENRES.includes(g) ? g : 'Aventure'
  }
  if (body.description !== undefined || !partial)
    out.description = String(body.description ?? '').trim().slice(0, 2000)
  if (body.cover !== undefined || !partial) {
    const c = String(body.cover ?? 'indigo')
    out.cover = COVERS.includes(c) ? c : 'indigo'
  }
  if (body.cover_style !== undefined || !partial) out.cover_style = JSON.stringify(cleanCoverStyle(body.cover_style))
  if (body.tags !== undefined) out.tags = JSON.stringify(cleanTags(body.tags))
  if (body.is_public !== undefined) out.is_public = body.is_public === true || body.is_public === 1 ? 1 : 0
  else if (!partial) out.is_public = 1
  return out
}

async function profileStats(db, userId) {
  const books = await db
    .prepare(
      `SELECT COUNT(*) AS n,
              COALESCE(SUM(views),0) AS views,
              COALESCE(SUM(impressions),0) AS impressions,
              COALESCE(SUM(CASE WHEN EXISTS (SELECT 1 FROM chapters c WHERE c.book_id = books.id) THEN 1 ELSE 0 END),0) AS published
       FROM books WHERE owner_id = ?`
    )
    .bind(userId)
    .first()
  const words = await db
    .prepare(
      `SELECT COALESCE(SUM(c.word_count),0) AS w
       FROM chapters c JOIN books b ON b.id = c.book_id WHERE b.owner_id = ?`
    )
    .bind(userId)
    .first()
  const likes = await db
    .prepare('SELECT COUNT(*) AS n FROM likes l JOIN books b ON b.id = l.book_id WHERE b.owner_id = ?')
    .bind(userId)
    .first()
  const comments = await db
    .prepare('SELECT COUNT(*) AS n FROM comments c JOIN books b ON b.id = c.book_id WHERE b.owner_id = ?')
    .bind(userId)
    .first()
  const commentLikes = await db
    .prepare('SELECT COUNT(*) AS n FROM comment_likes cl JOIN comments c ON c.id = cl.comment_id WHERE c.user_id = ?')
    .bind(userId)
    .first()
  const chapters = await db
    .prepare('SELECT COUNT(*) AS n FROM chapters c JOIN books b ON b.id = c.book_id WHERE b.owner_id = ?')
    .bind(userId)
    .first()
  const reading = await db
    .prepare(
      `SELECT COUNT(DISTINCT cr.book_id) AS books, COALESCE(SUM(ch.word_count),0) AS words
       FROM chapter_reads cr JOIN chapters ch ON ch.id = cr.chapter_id WHERE cr.user_id = ?`
    )
    .bind(userId)
    .first()
  return {
    books: books?.n ?? 0,
    published: books?.published ?? 0,
    drafts: (books?.n ?? 0) - (books?.published ?? 0),
    chapters: chapters?.n ?? 0,
    words: words?.w ?? 0,
    booksRead: reading?.books ?? 0,
    wordsRead: reading?.words ?? 0,
    views: books?.views ?? 0,
    impressions: books?.impressions ?? 0,
    likes: likes?.n ?? 0,
    commentLikes: commentLikes?.n ?? 0,
    likesReceived: (likes?.n ?? 0) + (commentLikes?.n ?? 0),
    comments: comments?.n ?? 0,
  }
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url)
    const path = url.pathname
    const db = env.DB

    if (req.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    // ---- Media (R2) ----
    if (path.startsWith('/api/media/') && req.method === 'GET') {
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

    if (!path.startsWith('/api/')) {
      return json({ error: 'Not found' }, 404)
    }

    try {
      // ---------- AUTH ----------
      if (req.method === 'POST' && path === '/api/auth/signup') {
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
        if (!username) {
          username = slugUsername(name || email.split('@')[0])
        }
        // garantir l'unicité
        for (let i = 0; i < 5; i++) {
          const taken = await db.prepare('SELECT id FROM users WHERE username = ?').bind(username).first()
          if (!taken) break
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

      if (req.method === 'POST' && path === '/api/auth/login') {
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

      if (req.method === 'POST' && path === '/api/auth/logout') {
        const auth = req.headers.get('Authorization') || ''
        const m = auth.match(/^Bearer\s+(.+)$/i)
        if (m) {
          await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256Hex(m[1].trim())).run()
        }
        return json({ ok: true })
      }

      // Disponibilité d'un username (public, pour le formulaire)
      if (req.method === 'GET' && path === '/api/username-available') {
        const u = String(url.searchParams.get('username') ?? '').trim().toLowerCase()
        if (!USERNAME_RE.test(u)) return json({ available: false, reason: 'format' })
        const taken = await db.prepare('SELECT id FROM users WHERE username = ?').bind(u).first()
        return json({ available: !taken })
      }

      const meRow = await currentUser(db, req)
      const me = meRow ? publicProfile(meRow, { self: true }) : null

      if (req.method === 'GET' && path === '/api/me') {
        if (!me) return json({ error: 'Non connecté.' }, 401)
        const stats = await profileStats(db, me.id)
        const unread = await db.prepare('SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND read = 0').bind(me.id).first()
        return json({ user: me, stats, unread: unread?.n ?? 0 })
      }

      if (req.method === 'PUT' && path === '/api/profile') {
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
        if (body.bio !== undefined) {
          sets.push('bio = ?')
          vals.push(String(body.bio).trim().slice(0, 300))
        }
        if (body.avatar_emoji !== undefined) {
          sets.push('avatar_emoji = ?')
          vals.push(String(body.avatar_emoji).slice(0, 8))
        }
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
        if (body.banner_color !== undefined) {
          sets.push('banner_color = ?')
          vals.push(String(body.banner_color).slice(0, 30))
        }
        if (body.preferences !== undefined) {
          sets.push('preferences = ?')
          vals.push(JSON.stringify(cleanTags(body.preferences).filter((g) => GENRES.includes(g)).slice(0, 7)))
        }
        if (body.referral_source !== undefined) {
          sets.push('referral_source = ?')
          vals.push(REFERRALS.includes(String(body.referral_source)) ? String(body.referral_source) : 'other')
        }
        if (body.onboarded !== undefined) {
          sets.push('onboarded = ?')
          vals.push(body.onboarded ? 1 : 0)
        }
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

      // ---------- PROFILS PUBLICS ----------
      if (req.method === 'GET' && path.startsWith('/api/users/') && !path.endsWith('/follow')) {
        const handle = decodeURIComponent(path.slice('/api/users/'.length))
        const row = await db.prepare('SELECT * FROM users WHERE username = ? OR id = ?').bind(handle, handle).first()
        if (!row) return json({ error: 'Profil introuvable.' }, 404)
        const isSelf = me && me.id === row.id
        const visibility = row.profile_visibility || 'public'
        const fc = await followCounts(db, row.id)
        const isFollowing = me
          ? await db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?').bind(me.id, row.id).first()
          : null

        let allowed = !!isSelf || visibility === 'public'
        if (!allowed && visibility === 'followers' && me) {
          allowed = !!isFollowing
        }

        if (!allowed) {
          return json({
            restricted: true,
            visibility,
            user: {
              id: row.id,
              username: row.username || row.id,
              display_name: row.display_name || row.name || 'Anonyme',
              name: row.display_name || row.name || 'Anonyme',
              avatar_emoji: row.avatar_emoji || '',
              avatar_color: row.avatar_color || 'amber',
              avatar_image: row.avatar_image || '',
              banner_image: row.banner_image || '',
              profile_visibility: visibility,
              bio: '',
            },
            stats: null,
            books: [],
            followers: fc.followers,
            following: fc.following,
            is_following: !!isFollowing,
          })
        }

        const stats = await profileStats(db, row.id)
        const res = await db
          .prepare(`${BOOK_SELECT} WHERE b.owner_id = ? ${isSelf ? '' : 'AND b.is_public = 1 AND EXISTS (SELECT 1 FROM chapters ch WHERE ch.book_id = b.id)'} ORDER BY b.updated_at DESC`)
          .bind(row.id)
          .all()
        const books = []
        for (const b of res.results || []) {
          const ch = await db.prepare('SELECT * FROM chapters WHERE book_id = ? ORDER BY position ASC, rowid ASC').bind(b.id).all()
          books.push(serializeBook(b, ch.results || [], await bookCounts(db, b.id)))
        }
        return json({
          restricted: false,
          visibility,
          user: publicProfile(row, { self: !!isSelf }),
          stats,
          books,
          followers: fc.followers,
          following: fc.following,
          is_following: !!isFollowing,
        })
      }

      // Suivre / ne plus suivre un auteur
      const followMatch = path.match(/^\/api\/users\/([^/]+)\/follow$/)
      if (followMatch) {
        if (!me) return json({ error: 'Connecte-toi pour suivre des auteurs.' }, 401)
        const handle = decodeURIComponent(followMatch[1])
        const target = await db.prepare('SELECT id FROM users WHERE username = ? OR id = ?').bind(handle, handle).first()
        if (!target) return json({ error: 'Profil introuvable.' }, 404)
        if (target.id === me.id) return json({ error: 'Tu ne peux pas te suivre toi-même.' }, 400)
        if (req.method === 'POST') {
          await db
            .prepare('INSERT OR IGNORE INTO follows (follower_id, following_id, created_at) VALUES (?, ?, ?)')
            .bind(me.id, target.id, new Date().toISOString())
            .run()
          await notify(db, { userId: target.id, type: 'follow', actorId: me.id })
        } else if (req.method === 'DELETE') {
          await db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').bind(me.id, target.id).run()
        }
        const fc = await followCounts(db, target.id)
        return json({ followers: fc.followers, following: fc.following, is_following: req.method === 'POST' })
      }

      // ---------- PUBLIC (sans authentification) ----------
      if (req.method === 'GET' && path === '/api/public/trending') {
        const res = await db
          .prepare(
            `SELECT b.id, b.title, b.author, b.genre, b.description, b.cover, b.cover_style, b.tags,
                    b.views, b.impressions, b.owner_id,
                    u.username AS owner_username, u.display_name AS owner_display_name,
                    u.avatar_emoji AS owner_avatar_emoji, u.avatar_color AS owner_avatar_color, u.avatar_image AS owner_avatar_image,
                    (SELECT COUNT(*) FROM likes l WHERE l.book_id = b.id) AS like_count,
                    (SELECT COUNT(*) FROM comments cm WHERE cm.book_id = b.id) AS comment_count,
                    (SELECT COUNT(*) FROM chapters ch WHERE ch.book_id = b.id) AS chapter_count
             FROM books b LEFT JOIN users u ON u.id = b.owner_id
             WHERE b.is_public = 1 AND EXISTS (SELECT 1 FROM chapters ch WHERE ch.book_id = b.id)
             ORDER BY (like_count * 5 + comment_count * 3 + b.views) DESC, b.updated_at DESC LIMIT 12`
          )
          .all()
        return json({ books: (res.results || []).map((b) => publicCard(b)) })
      }

      if (req.method === 'GET' && path === '/api/public/search') {
        const q = String(url.searchParams.get('q') ?? '').trim().slice(0, 60)
        let res
        if (!q) {
          res = await db
            .prepare(
              `SELECT b.*, u.username AS owner_username, u.display_name AS owner_display_name,
                      u.avatar_emoji AS owner_avatar_emoji, u.avatar_color AS owner_avatar_color, u.avatar_image AS owner_avatar_image,
                      (SELECT COUNT(*) FROM likes l WHERE l.book_id = b.id) AS like_count,
                      (SELECT COUNT(*) FROM comments cm WHERE cm.book_id = b.id) AS comment_count,
                      (SELECT COUNT(*) FROM chapters ch WHERE ch.book_id = b.id) AS chapter_count
               FROM books b LEFT JOIN users u ON u.id = b.owner_id
               WHERE b.is_public = 1 AND EXISTS (SELECT 1 FROM chapters ch WHERE ch.book_id = b.id)
               ORDER BY b.updated_at DESC LIMIT 24`
            )
            .all()
        } else {
          const like = `%${q.toLowerCase()}%`
          res = await db
            .prepare(
              `SELECT b.*, u.username AS owner_username, u.display_name AS owner_display_name,
                      u.avatar_emoji AS owner_avatar_emoji, u.avatar_color AS owner_avatar_color, u.avatar_image AS owner_avatar_image,
                      (SELECT COUNT(*) FROM likes l WHERE l.book_id = b.id) AS like_count,
                      (SELECT COUNT(*) FROM comments cm WHERE cm.book_id = b.id) AS comment_count,
                      (SELECT COUNT(*) FROM chapters ch WHERE ch.book_id = b.id) AS chapter_count
               FROM books b LEFT JOIN users u ON u.id = b.owner_id
               WHERE b.is_public = 1 AND EXISTS (SELECT 1 FROM chapters ch WHERE ch.book_id = b.id)
                 AND (LOWER(b.title) LIKE ? OR LOWER(b.author) LIKE ? OR LOWER(b.description) LIKE ? OR LOWER(b.tags) LIKE ? OR LOWER(b.genre) LIKE ?)
               ORDER BY b.views DESC LIMIT 24`
            )
            .bind(like, like, like, like, like)
            .all()
        }
        return json({ books: (res.results || []).map((b) => publicCard(b)), query: q })
      }

      // Fiche publique d'un livre (accessible sans compte, lecture non incluse)
      const pubBookMatch = path.match(/^\/api\/public\/books\/([^/]+)$/)
      if (req.method === 'GET' && pubBookMatch) {
        const bid = pubBookMatch[1]
        const b = await db.prepare(`${BOOK_SELECT} WHERE b.id = ?`).bind(bid).first()
        if (!b || b.is_public !== 1) return json({ error: 'Livre introuvable.' }, 404)
        const ch = await db.prepare('SELECT * FROM chapters WHERE book_id = ? ORDER BY position ASC, rowid ASC').bind(bid).all()
        if (!(ch.results || []).length) return json({ error: 'Livre introuvable.' }, 404)
        return json({ book: serializeBook(b, ch.results || [], await bookCounts(db, bid)) })
      }

      // Commentaires publics (lecture seule) d'un livre
      const pubCommentsMatch = path.match(/^\/api\/public\/books\/([^/]+)\/comments$/)
      if (req.method === 'GET' && pubCommentsMatch) {
        const bid = pubCommentsMatch[1]
        const res = await db
          .prepare(
            `SELECT c.id, c.content, c.created_at, c.user_id,
                    u.username, u.display_name, u.name, u.avatar_emoji, u.avatar_color, u.avatar_image,
                    (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id) AS like_count
             FROM comments c JOIN users u ON u.id = c.user_id
             WHERE c.book_id = ? ORDER BY c.created_at DESC LIMIT 200`
          )
          .bind(bid)
          .all()
        const comments = (res.results || []).map((c) => ({
          id: c.id,
          content: c.content,
          created_at: c.created_at,
          user_id: c.user_id,
          likes: c.like_count || 0,
          liked: false,
          author: {
            id: c.user_id,
            username: c.username,
            display_name: c.display_name || c.name || 'Anonyme',
            avatar_emoji: c.avatar_emoji || '',
            avatar_color: c.avatar_color || 'amber',
            avatar_image: c.avatar_image || '',
          },
        }))
        return json({ comments })
      }

      if (!me) return json({ error: 'Connecte-toi pour continuer.' }, 401)

      if (req.method === 'POST' && path === '/api/profile/password') {
        if (!me) return json({ error: 'Connecte-toi pour continuer.' }, 401)
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
        // invalider les autres sessions
        const auth = req.headers.get('Authorization') || ''
        const m = auth.match(/^Bearer\s+(.+)$/i)
        if (m) {
          await db.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash != ?').bind(me.id, await sha256Hex(m[1].trim())).run()
        }
        return json({ ok: true })
      }

      if (req.method === 'DELETE' && path === '/api/account') {
        if (!me) return json({ error: 'Connecte-toi pour continuer.' }, 401)
        await db.prepare('DELETE FROM users WHERE id = ?').bind(me.id).run()
        return json({ ok: true })
      }

      // ---------- NOTIFICATIONS ----------
      if (req.method === 'GET' && path === '/api/notifications') {
        const res = await db
          .prepare(
            `SELECT n.id, n.type, n.read, n.created_at, n.book_id, n.comment_id, n.actor_id,
                    u.username AS actor_username, u.display_name AS actor_display_name,
                    u.avatar_emoji AS actor_avatar_emoji, u.avatar_color AS actor_avatar_color, u.avatar_image AS actor_avatar_image,
                    b.title AS book_title
             FROM notifications n
             LEFT JOIN users u ON u.id = n.actor_id
             LEFT JOIN books b ON b.id = n.book_id
             WHERE n.user_id = ? ORDER BY n.created_at DESC LIMIT 100`
          )
          .bind(me.id)
          .all()
        const notifications = (res.results || []).map((n) => ({
          id: n.id,
          type: n.type,
          read: n.read === 1,
          created_at: n.created_at,
          book_id: n.book_id,
          book_title: n.book_title || null,
          actor: n.actor_id
            ? {
                id: n.actor_id,
                username: n.actor_username,
                display_name: n.actor_display_name || 'Anonyme',
                avatar_emoji: n.actor_avatar_emoji || '',
                avatar_color: n.actor_avatar_color || 'amber',
                avatar_image: n.actor_avatar_image || '',
              }
            : null,
        }))
        return json({ notifications, unread: notifications.filter((n) => !n.read).length })
      }

      if (req.method === 'POST' && path === '/api/notifications/read') {
        await db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').bind(me.id).run()
        return json({ ok: true })
      }

      // ---------- MES LECTURES ----------
      if (req.method === 'GET' && path === '/api/reading') {
        const res = await db
          .prepare(
            `SELECT b.*, u.username AS owner_username, u.display_name AS owner_display_name,
                    u.avatar_emoji AS owner_avatar_emoji, u.avatar_color AS owner_avatar_color, u.avatar_image AS owner_avatar_image,
                    r.last_read_at, r.read_count,
                    (SELECT COUNT(*) FROM chapters c WHERE c.book_id = b.id) AS chapter_count,
                    (SELECT COUNT(*) FROM chapter_reads cr WHERE cr.book_id = b.id AND cr.user_id = ?) AS chapters_read,
                    (SELECT COUNT(*) FROM likes l WHERE l.book_id = b.id) AS like_count,
                    (SELECT COUNT(*) FROM comments cm WHERE cm.book_id = b.id) AS comment_count
             FROM reads r JOIN books b ON b.id = r.book_id
             LEFT JOIN users u ON u.id = b.owner_id
             WHERE r.user_id = ?
             ORDER BY r.last_read_at DESC`
          )
          .bind(me.id, me.id)
          .all()
        const books = (res.results || []).map((b) => ({
          ...publicCard(b),
          last_read_at: b.last_read_at,
          read_count: b.read_count || 0,
          chapters_read: b.chapters_read || 0,
          finished: (b.chapter_count || 0) > 0 && (b.chapters_read || 0) >= (b.chapter_count || 0),
        }))
        return json({ books })
      }

      // ---------- ANALYTICS (propriétaire uniquement) ----------
      if (req.method === 'GET' && path === '/api/analytics') {
        const summary = await profileStats(db, me.id)
        const res = await db
          .prepare(
            `SELECT b.id, b.title, b.genre, b.is_public, b.cover, b.cover_style, b.updated_at,
                    (SELECT COUNT(*) FROM chapters c WHERE c.book_id = b.id) AS chapters,
                    (SELECT COALESCE(SUM(c.word_count),0) FROM chapters c WHERE c.book_id = b.id) AS words,
                    b.views, b.impressions,
                    (SELECT COUNT(*) FROM likes l WHERE l.book_id = b.id) AS likes,
                    (SELECT COUNT(*) FROM comments cm WHERE cm.book_id = b.id) AS comments
             FROM books b WHERE b.owner_id = ? ORDER BY b.views DESC`
          )
          .bind(me.id)
          .all()
        const days = 30
        const since = new Date(Date.now() - days * 86400000).toISOString()
        const [bookLikes, commLikes] = await Promise.all([
          db.prepare('SELECT substr(l.created_at,1,10) AS day, COUNT(*) AS n FROM likes l JOIN books b ON b.id = l.book_id WHERE b.owner_id = ? AND l.created_at >= ? GROUP BY day').bind(me.id, since).all(),
          db.prepare('SELECT substr(cl.created_at,1,10) AS day, COUNT(*) AS n FROM comment_likes cl JOIN comments c ON c.id = cl.comment_id WHERE c.user_id = ? AND cl.created_at >= ? GROUP BY day').bind(me.id, since).all(),
        ])
        const byDay = new Map()
        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10)
          byDay.set(d, 0)
        }
        for (const r of bookLikes.results || []) if (byDay.has(r.day)) byDay.set(r.day, (byDay.get(r.day) || 0) + r.n)
        for (const r of commLikes.results || []) if (byDay.has(r.day)) byDay.set(r.day, (byDay.get(r.day) || 0) + r.n)
        const likesTrend = [...byDay.entries()].map(([day, n]) => ({ day, likes: n }))
        return json({
          summary,
          books: (res.results || []).map((b) => ({
            id: b.id,
            title: b.title,
            genre: b.genre,
            is_public: b.is_public === 1,
            published: (b.chapters || 0) > 0,
            chapters: b.chapters || 0,
            words: b.words || 0,
            views: b.views || 0,
            impressions: b.impressions || 0,
            likes: b.likes || 0,
            comments: b.comments || 0,
          })),
          likesTrend,
        })
      }

      // ---------- RECOMMANDATIONS ----------
      if (req.method === 'GET' && path === '/api/recommendations') {
        const limit = Math.min(30, Math.max(1, parseInt(url.searchParams.get('limit') || '12', 10)))
        const items = await recommend(db, meRow, limit)
        return json({ items })
      }

      // ---------- UPLOAD (R2) ----------
      if (req.method === 'POST' && path === '/api/upload') {
        if (!env.MEDIA) return json({ error: 'Stockage média indisponible.' }, 503)
        const ct = req.headers.get('content-type') || ''
        if (!/^image\/(png|jpe?g|webp|gif)$/.test(ct)) return json({ error: 'Format d’image non supporté (png, jpg, webp, gif).' }, 400)
        const buf = await req.arrayBuffer()
        if (buf.byteLength > 8 * 1024 * 1024) return json({ error: 'Image trop lourde (8 Mo max).' }, 400)
        const ext = ct.split('/')[1].replace('jpeg', 'jpg')
        const key = `u/${me.id}/${Date.now()}-${randomHex(4)}.${ext}`
        await env.MEDIA.put(key, buf, { httpMetadata: { contentType: ct } })
        return json({ url: `/api/media/${key}` }, 201)
      }

      // ---------- BOOKS ----------
      if (req.method === 'GET' && path === '/api/books') {
        const scope = url.searchParams.get('scope') || 'mine'
        let rows
        if (scope === 'explore') {
          const res = await db
            .prepare(`${BOOK_SELECT} WHERE b.is_public = 1 AND b.owner_id != ? AND EXISTS (SELECT 1 FROM chapters ch WHERE ch.book_id = b.id) ORDER BY b.updated_at DESC LIMIT 100`)
            .bind(me.id)
            .all()
          rows = res.results || []
        } else {
          const res = await db
            .prepare(`${BOOK_SELECT} WHERE b.owner_id = ? ORDER BY b.updated_at DESC`)
            .bind(me.id)
            .all()
          rows = res.results || []
        }
        const out = []
        for (const b of rows) {
          const ch = await db.prepare('SELECT * FROM chapters WHERE book_id = ? ORDER BY position ASC, rowid ASC').bind(b.id).all()
          out.push(serializeBook(b, ch.results || [], await bookCounts(db, b.id)))
        }
        return json({ books: out })
      }

      if (req.method === 'POST' && path === '/api/books') {
        const body = (await readJson(req)) || {}
        const data = cleanBookInput(body)
        if (data.title.length < 2) return json({ error: 'Le titre est obligatoire (2 caractères minimum).' }, 400)
        if (data.author.length < 2) return json({ error: 'Le nom de l’auteur est obligatoire.' }, 400)
        const id = crypto.randomUUID()
        const now = new Date().toISOString()
        await db
          .prepare(
            `INSERT INTO books (id, owner_id, title, author, genre, description, cover, cover_style, tags, is_public, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(id, me.id, data.title, data.author, data.genre, data.description, data.cover, data.cover_style ?? '{}', data.tags ?? '[]', data.is_public, now, now)
          .run()
        return json({ book: await loadBook(db, id) }, 201)
      }

      if (req.method === 'POST' && path === '/api/books/import') {
        const body = (await readJson(req)) || {}
        const list = Array.isArray(body.books) ? body.books.slice(0, 50) : []
        const stmts = []
        const now = new Date().toISOString()
        for (const item of list) {
          const data = cleanBookInput(item || {})
          if (data.title.length < 2) continue
          const bookId = crypto.randomUUID()
          stmts.push(
            db
              .prepare(
                `INSERT INTO books (id, owner_id, title, author, genre, description, cover, cover_style, tags, is_public, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
              )
              .bind(bookId, me.id, data.title, data.author || me.name, data.genre, data.description, data.cover, data.cover_style ?? '{}', data.tags ?? '[]', data.is_public, now, now)
          )
          const chs = Array.isArray(item.chapters) ? item.chapters.slice(0, 200) : []
          chs.forEach((c, i) => {
            stmts.push(
              db
                .prepare('INSERT INTO chapters (id, book_id, title, content, position, updated_at, word_count) VALUES (?, ?, ?, ?, ?, ?, ?)')
                .bind(crypto.randomUUID(), bookId, String(c.title || `Chapitre ${i + 1}`).slice(0, 80), String(c.content || ''), i, now, wordCountOf(c.content))
            )
          })
        }
        if (stmts.length) await db.batch(stmts)
        return json({ imported: true })
      }

      const bookMatch = path.match(/^\/api\/books\/([^/]+)(\/.*)?$/)
      if (bookMatch) {
        const bookId = bookMatch[1]
        const rest = bookMatch[2] || ''

        // ---- Interactions publiques (likes, commentaires, stats) ----
        if (rest === '/like') {
          if (req.method === 'POST') {
            const ins = await db
              .prepare('INSERT OR IGNORE INTO likes (book_id, user_id, created_at) VALUES (?, ?, ?)')
              .bind(bookId, me.id, new Date().toISOString())
              .run()
            if (ins.meta.changes) {
              const bk = await db.prepare('SELECT owner_id FROM books WHERE id = ?').bind(bookId).first()
              if (bk) await notify(db, { userId: bk.owner_id, type: 'like', actorId: me.id, bookId })
            }
          } else if (req.method === 'DELETE') {
            await db.prepare('DELETE FROM likes WHERE book_id = ? AND user_id = ?').bind(bookId, me.id).run()
          }
          const counts = await bookCounts(db, bookId)
          const liked = await db.prepare('SELECT 1 FROM likes WHERE book_id = ? AND user_id = ?').bind(bookId, me.id).first()
          return json({ likes: counts.likes, liked: !!liked })
        }

        if (rest === '/stat') {
          if (req.method === 'POST') {
            const body = (await readJson(req)) || {}
            const type = body.type === 'view' ? 'views' : 'impressions'
            await db.prepare(`UPDATE books SET ${type} = ${type} + 1 WHERE id = ?`).bind(bookId).run()
            // Historique de lecture par utilisateur (pour les recommandations + stats de lecture)
            if (type === 'views') {
              const now = new Date().toISOString()
              await db
                .prepare(
                  `INSERT INTO reads (user_id, book_id, read_count, last_read_at) VALUES (?, ?, 1, ?)
                   ON CONFLICT(user_id, book_id) DO UPDATE SET read_count = read_count + 1, last_read_at = excluded.last_read_at`
                )
                .bind(me.id, bookId, now)
                .run()
              const chapterId = body.chapterId ? String(body.chapterId) : ''
              if (chapterId) {
                await db
                  .prepare(
                    `INSERT OR IGNORE INTO chapter_reads (user_id, chapter_id, book_id, read_at) VALUES (?, ?, ?, ?)`
                  )
                  .bind(me.id, chapterId, bookId, now)
                  .run()
              }
            }
          }
          return json({ ok: true })
        }

        if (rest === '/comments') {
          if (req.method === 'GET') {
            const res = await db
              .prepare(
                `SELECT c.id, c.content, c.created_at, c.user_id,
                        u.username, u.display_name, u.name, u.avatar_emoji, u.avatar_color, u.avatar_image,
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id) AS like_count,
                        (SELECT COUNT(*) FROM comment_likes cl WHERE cl.comment_id = c.id AND cl.user_id = ?) AS liked_by_me
                 FROM comments c JOIN users u ON u.id = c.user_id
                 WHERE c.book_id = ? ORDER BY c.created_at DESC LIMIT 200`
              )
              .bind(me.id, bookId)
              .all()
            const comments = (res.results || []).map((c) => ({
              id: c.id,
              content: c.content,
              created_at: c.created_at,
              user_id: c.user_id,
              likes: c.like_count || 0,
              liked: (c.liked_by_me || 0) > 0,
              author: {
                id: c.user_id,
                username: c.username,
                display_name: c.display_name || c.name || 'Anonyme',
                avatar_emoji: c.avatar_emoji || '',
                avatar_color: c.avatar_color || 'amber',
                avatar_image: c.avatar_image || '',
              },
            }))
            return json({ comments })
          }
          if (req.method === 'POST') {
            const body = (await readJson(req)) || {}
            const content = String(body.content ?? '').trim().slice(0, 1000)
            if (content.length < 1) return json({ error: 'Le commentaire est vide.' }, 400)
            const id = crypto.randomUUID()
            await db
              .prepare('INSERT INTO comments (id, book_id, user_id, content, created_at) VALUES (?, ?, ?, ?, ?)')
              .bind(id, bookId, me.id, content, new Date().toISOString())
              .run()
            const bk = await db.prepare('SELECT owner_id FROM books WHERE id = ?').bind(bookId).first()
            if (bk) await notify(db, { userId: bk.owner_id, type: 'comment', actorId: me.id, bookId, commentId: id })
            return json({ ok: true, id }, 201)
          }
        }

        const commLikeMatch = rest.match(/^\/comments\/([^/]+)\/like$/)
        if (commLikeMatch) {
          const cid = commLikeMatch[1]
          const exists = await db.prepare('SELECT id FROM comments WHERE id = ? AND book_id = ?').bind(cid, bookId).first()
          if (!exists) return json({ error: 'Commentaire introuvable.' }, 404)
          if (req.method === 'POST') {
            const ins = await db
              .prepare('INSERT OR IGNORE INTO comment_likes (comment_id, user_id, created_at) VALUES (?, ?, ?)')
              .bind(cid, me.id, new Date().toISOString())
              .run()
            if (ins.meta.changes) {
              const cowner = await db.prepare('SELECT user_id FROM comments WHERE id = ?').bind(cid).first()
              if (cowner) await notify(db, { userId: cowner.user_id, type: 'comment_like', actorId: me.id, bookId, commentId: cid })
            }
          } else if (req.method === 'DELETE') {
            await db.prepare('DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?').bind(cid, me.id).run()
          }
          const n = await db.prepare('SELECT COUNT(*) AS n FROM comment_likes WHERE comment_id = ?').bind(cid).first()
          const liked = await db.prepare('SELECT 1 FROM comment_likes WHERE comment_id = ? AND user_id = ?').bind(cid, me.id).first()
          return json({ likes: n?.n ?? 0, liked: !!liked })
        }

        const commMatch = rest.match(/^\/comments\/([^/]+)$/)
        if (commMatch && req.method === 'DELETE') {
          const cid = commMatch[1]
          const row = await db.prepare('SELECT user_id FROM comments WHERE id = ? AND book_id = ?').bind(cid, bookId).first()
          if (!row) return json({ error: 'Commentaire introuvable.' }, 404)
          const book = await db.prepare('SELECT owner_id FROM books WHERE id = ?').bind(bookId).first()
          if (row.user_id !== me.id && book?.owner_id !== me.id) return json({ error: 'Non autorisé.' }, 403)
          await db.prepare('DELETE FROM comments WHERE id = ?').bind(cid).run()
          return json({ ok: true })
        }

        // ---- Gestion propriétaire ----
        const owned = await db.prepare('SELECT * FROM books WHERE id = ? AND owner_id = ?').bind(bookId, me.id).first()
        if (!owned) {
          const any = await db.prepare('SELECT id FROM books WHERE id = ?').bind(bookId).first()
          return json({ error: any ? 'Ce livre ne t’appartient pas.' : 'Livre introuvable.' }, any ? 403 : 404)
        }

        if (req.method === 'PUT' && rest === '') {
          const body = (await readJson(req)) || {}
          const data = cleanBookInput(body, true)
          const sets = []
          const vals = []
          for (const [k, v] of Object.entries(data)) {
            sets.push(`${k} = ?`)
            vals.push(v)
          }
          if (!sets.length) return json({ error: 'Rien à mettre à jour.' }, 400)
          sets.push('updated_at = ?')
          vals.push(new Date().toISOString())
          await db.prepare(`UPDATE books SET ${sets.join(', ')} WHERE id = ?`).bind(...vals, bookId).run()
          return json({ book: await loadBook(db, bookId) })
        }

        if (req.method === 'DELETE' && rest === '') {
          await db.prepare('DELETE FROM books WHERE id = ?').bind(bookId).run()
          return json({ ok: true })
        }

        if (req.method === 'POST' && rest === '/chapters') {
          const body = (await readJson(req)) || {}
          const title = String(body.title ?? '').trim().slice(0, 80) || 'Sans titre'
          const content = String(body.content ?? '')
          if (wordCountOf(content) < 1) {
            return json({ error: 'Écris au moins un mot avant d’enregistrer.' }, 400)
          }
          const max = await db.prepare('SELECT MAX(position) AS m FROM chapters WHERE book_id = ?').bind(bookId).first()
          const pos = (max?.m ?? -1) + 1
          const now = new Date().toISOString()
          await db
            .prepare('INSERT INTO chapters (id, book_id, title, content, position, updated_at, word_count) VALUES (?, ?, ?, ?, ?, ?, ?)')
            .bind(crypto.randomUUID(), bookId, title, content, pos, now, wordCountOf(content))
            .run()
          await db.prepare('UPDATE books SET updated_at = ? WHERE id = ?').bind(now, bookId).run()
          return json({ book: await loadBook(db, bookId) }, 201)
        }

        if (req.method === 'POST' && rest === '/chapters/reorder') {
          const body = (await readJson(req)) || {}
          const ids = Array.isArray(body.ids) ? body.ids : []
          const existing = await db.prepare('SELECT id FROM chapters WHERE book_id = ?').bind(bookId).all()
          const valid = new Set((existing.results || []).map((r) => r.id))
          const stmts = []
          ids.forEach((id, i) => {
            if (valid.has(id)) stmts.push(db.prepare('UPDATE chapters SET position = ? WHERE id = ?').bind(i, id))
          })
          if (stmts.length) await db.batch(stmts)
          await db.prepare('UPDATE books SET updated_at = ? WHERE id = ?').bind(new Date().toISOString(), bookId).run()
          return json({ book: await loadBook(db, bookId) })
        }

        const chMatch = rest.match(/^\/chapters\/([^/]+)$/)
        if (chMatch) {
          const chId = chMatch[1]
          if (req.method === 'PUT') {
            const body = (await readJson(req)) || {}
            const title = String(body.title ?? '').trim().slice(0, 80) || 'Sans titre'
            const content = String(body.content ?? '')
            const now = new Date().toISOString()
            const r = await db
              .prepare('UPDATE chapters SET title = ?, content = ?, updated_at = ?, word_count = ? WHERE id = ? AND book_id = ?')
              .bind(title, content, now, wordCountOf(content), chId, bookId)
              .run()
            if (!r.meta.changes) return json({ error: 'Chapitre introuvable.' }, 404)
            await db.prepare('UPDATE books SET updated_at = ? WHERE id = ?').bind(now, bookId).run()
            return json({ book: await loadBook(db, bookId) })
          }
          if (req.method === 'DELETE') {
            const r = await db.prepare('DELETE FROM chapters WHERE id = ? AND book_id = ?').bind(chId, bookId).run()
            if (!r.meta.changes) return json({ error: 'Chapitre introuvable.' }, 404)
            await db.prepare('UPDATE books SET updated_at = ? WHERE id = ?').bind(new Date().toISOString(), bookId).run()
            return json({ book: await loadBook(db, bookId) })
          }
        }
      }

      return json({ error: 'Not found' }, 404)
    } catch (e) {
      console.error(e)
      return json({ error: 'Erreur serveur, réessaie dans un instant.' }, 500)
    }
  },
}
