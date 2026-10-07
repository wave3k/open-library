import { hashPassword, verifyPassword, publicUser, randomHex, sha256Hex, SESSION_DAYS } from './auth.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function json(data, status = 200) {
  return Response.json(data, { status })
}

async function readJson(req) {
  try {
    return await req.json()
  } catch {
    return null
  }
}

async function currentUser(db, req) {
  const auth = req.headers.get('Authorization') || ''
  const m = auth.match(/^Bearer\s+(.+)$/i)
  if (!m) return null
  const tokenHash = await sha256Hex(m[1].trim())
  const row = await db
    .prepare(
      `SELECT u.id, u.name, u.email, u.created_at FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`
    )
    .bind(tokenHash, Date.now())
    .first()
  return publicUser(row)
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

async function loadBook(db, id, withOwner = true) {
  const book = await db
    .prepare(
      `SELECT b.*, u.name AS owner_name FROM books b
       LEFT JOIN users u ON u.id = b.owner_id WHERE b.id = ?`
    )
    .bind(id)
    .first()
  if (!book) return null
  const { results } = await db
    .prepare('SELECT * FROM chapters WHERE book_id = ? ORDER BY position ASC, rowid ASC')
    .bind(id)
    .all()
  return serializeBook(book, results || []);
}

function serializeBook(book, chapters) {
  return {
    id: book.id,
    owner_id: book.owner_id,
    owner_name: book.owner_name || 'Anonyme',
    title: book.title,
    author: book.author,
    genre: book.genre,
    description: book.description || '',
    cover: book.cover,
    is_public: book.is_public === 1,
    created_at: book.created_at,
    updated_at: book.updated_at,
    chapters: (chapters || []).map((c) => ({ id: c.id, title: c.title, content: c.content || '' })),
  }
}

function cleanBookInput(body, partial = false) {
  const out = {}
  if (body.title !== undefined || !partial) out.title = String(body.title ?? '').trim().slice(0, 80)
  if (body.author !== undefined || !partial) out.author = String(body.author ?? '').trim().slice(0, 40)
  if (body.genre !== undefined || !partial) out.genre = String(body.genre ?? 'Aventure').slice(0, 30)
  if (body.description !== undefined || !partial)
    out.description = String(body.description ?? '').trim().slice(0, 2000)
  if (body.cover !== undefined || !partial) out.cover = String(body.cover ?? 'indigo').slice(0, 20)
  if (body.is_public !== undefined) out.is_public = body.is_public ? 1 : 0
  else if (!partial) out.is_public = 1
  return out
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url)
    const path = url.pathname
    const db = env.DB

    if (!path.startsWith('/api/')) {
      return json({ error: 'Not found' }, 404)
    }

    try {
      // ---------- AUTH ----------
      if (req.method === 'POST' && path === '/api/auth/signup') {
        const body = (await readJson(req)) || {}
        const name = String(body.name ?? '').trim().slice(0, 40)
        const email = String(body.email ?? '').trim().toLowerCase()
        const password = String(body.password ?? '')
        if (name.length < 2) return json({ error: 'Indique ton nom (2 caractères minimum).' }, 400)
        if (!EMAIL_RE.test(email)) return json({ error: 'Adresse e-mail invalide.' }, 400)
        if (password.length < 8) return json({ error: 'Mot de passe : 8 caractères minimum.' }, 400)
        const exists = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
        if (exists) return json({ error: 'Un compte existe déjà avec cet e-mail.' }, 409)
        const { salt, hash } = await hashPassword(password)
        const id = crypto.randomUUID()
        const now = new Date().toISOString()
        await db
          .prepare('INSERT INTO users (id, name, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?, ?)')
          .bind(id, name, email, hash, salt, now)
          .run()
        const token = await issueSession(db, id)
        return json({ user: { id, name, email, created_at: now }, token }, 201)
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
        return json({ user: publicUser(row), token })
      }

      if (req.method === 'POST' && path === '/api/auth/logout') {
        const auth = req.headers.get('Authorization') || ''
        const m = auth.match(/^Bearer\s+(.+)$/i)
        if (m) {
          await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256Hex(m[1].trim())).run()
        }
        return json({ ok: true })
      }

      const me = await currentUser(db, req)

      if (req.method === 'GET' && path === '/api/me') {
        if (!me) return json({ error: 'Non connecté.' }, 401)
        return json({ user: me })
      }

      if (!me) return json({ error: 'Connecte-toi pour continuer.' }, 401)

      // ---------- BOOKS ----------
      if (req.method === 'GET' && path === '/api/books') {
        const scope = url.searchParams.get('scope') || 'mine'
        let rows
        if (scope === 'explore') {
          const res = await db
            .prepare(
              `SELECT b.*, u.name AS owner_name FROM books b
               LEFT JOIN users u ON u.id = b.owner_id
               WHERE b.is_public = 1 AND b.owner_id != ?
               ORDER BY b.updated_at DESC LIMIT 100`
            )
            .bind(me.id)
            .all()
          rows = res.results || []
        } else {
          const res = await db
            .prepare(
              `SELECT b.*, u.name AS owner_name FROM books b
               LEFT JOIN users u ON u.id = b.owner_id
               WHERE b.owner_id = ? ORDER BY b.updated_at DESC`
            )
            .bind(me.id)
            .all()
          rows = res.results || []
        }
        const out = []
        for (const b of rows) {
          const ch = await db
            .prepare('SELECT * FROM chapters WHERE book_id = ? ORDER BY position ASC, rowid ASC')
            .bind(b.id)
            .all()
          out.push(serializeBook(b, ch.results || []))
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
            'INSERT INTO books (id, owner_id, title, author, genre, description, cover, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
          )
          .bind(id, me.id, data.title, data.author, data.genre, data.description, data.cover, data.is_public, now, now)
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
                'INSERT INTO books (id, owner_id, title, author, genre, description, cover, is_public, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
              )
              .bind(bookId, me.id, data.title, data.author || me.name, data.genre, data.description, data.cover, data.is_public, now, now)
          )
          const chs = Array.isArray(item.chapters) ? item.chapters.slice(0, 200) : []
          chs.forEach((c, i) => {
            stmts.push(
              db
                .prepare('INSERT INTO chapters (id, book_id, title, content, position, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
                .bind(crypto.randomUUID(), bookId, String(c.title || `Chapitre ${i + 1}`).slice(0, 80), String(c.content || ''), i, now)
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
          if (!content.trim() || content.trim().split(/\s+/).length < 5) {
            return json({ error: 'Écris au moins 5 mots avant d’enregistrer.' }, 400)
          }
          const max = await db.prepare('SELECT MAX(position) AS m FROM chapters WHERE book_id = ?').bind(bookId).first()
          const pos = (max?.m ?? -1) + 1
          const chId = crypto.randomUUID()
          const now = new Date().toISOString()
          await db
            .prepare('INSERT INTO chapters (id, book_id, title, content, position, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
            .bind(chId, bookId, title, content, pos, now)
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
              .prepare('UPDATE chapters SET title = ?, content = ?, updated_at = ? WHERE id = ? AND book_id = ?')
              .bind(title, content, now, chId, bookId)
              .run()
            if (!r.meta.changes) return json({ error: 'Chapitre introuvable.' }, 404)
            await db.prepare('UPDATE books SET updated_at = ? WHERE id = ?').bind(now, bookId).run()
            return json({ book: await loadBook(db, bookId) })
          }
          if (req.method === 'DELETE') {
            await db.prepare('DELETE FROM chapters WHERE id = ? AND book_id = ?').bind(chId, bookId).run()
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
