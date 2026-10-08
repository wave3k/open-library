// Livres : liste, création, import, et routes imbriquées (chapitres, likes, commentaires, stats).
// Ces routes exigent un utilisateur authentifié (le routeur renvoie 401 sinon).
import { json, readJson } from '../lib/http.js'
import { BOOK_SELECT, cleanBookInput, loadBook, serializeBookList, bookCounts, notify } from '../lib/models.js'
import { sanitizeHtml, wordCountOf } from '../sanitize.js'

export async function bookRoutes({ req, db, url, path, env, me }) {
  const method = req.method

  if (method === 'GET' && path === '/api/books') {
    const scope = url.searchParams.get('scope') || 'mine'
    let rows
    let lite = false
    if (scope === 'explore') {
      const res = await db
        .prepare(`${BOOK_SELECT} WHERE b.is_public = 1 AND b.owner_id != ? AND EXISTS (SELECT 1 FROM chapters ch WHERE ch.book_id = b.id) ORDER BY b.updated_at DESC LIMIT 100`)
        .bind(me.id)
        .all()
      rows = res.results || []
      lite = true // liste : on n'envoie pas le texte des chapitres
    } else {
      const res = await db
        .prepare(`${BOOK_SELECT} WHERE b.owner_id = ? ORDER BY b.updated_at DESC`)
        .bind(me.id)
        .all()
      rows = res.results || []
    }
    return json({ books: await serializeBookList(db, rows, { lite }) })
  }

  // Livre complet (propriétaire ou public) — utilisé pour lire/éditer à la demande.
  if (method === 'GET' && path.match(/^\/api\/books\/[^/]+$/) && !path.startsWith('/api/books/import')) {
    const bid = path.slice('/api/books/'.length)
    const bk = await db.prepare('SELECT owner_id, is_public FROM books WHERE id = ?').bind(bid).first()
    if (!bk) return json({ error: 'Livre introuvable.' }, 404)
    if (bk.is_public !== 1 && bk.owner_id !== me.id) return json({ error: 'Livre introuvable.' }, 404)
    return json({ book: await loadBook(db, bid) })
  }

  if (method === 'POST' && path === '/api/books') {
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

  if (method === 'POST' && path === '/api/books/import') {
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
        const chtml = sanitizeHtml(String(c?.content ?? '').slice(0, 200_000))
        stmts.push(
          db
            .prepare('INSERT INTO chapters (id, book_id, title, content, position, updated_at, word_count) VALUES (?, ?, ?, ?, ?, ?, ?)')
            .bind(crypto.randomUUID(), bookId, String(c.title || `Chapitre ${i + 1}`).slice(0, 80), chtml, i, now, wordCountOf(chtml))
        )
      })
    }
    if (stmts.length) await db.batch(stmts)
    return json({ imported: true })
  }

  const bookMatch = path.match(/^\/api\/books\/([^/]+)(\/.*)?$/)
  if (!bookMatch) return null

  const bookId = bookMatch[1]
  const rest = bookMatch[2] || ''

  // Les interactions exigent un livre existant et accessible (public, ou le mien).
  if (rest === '/like' || rest === '/stat' || rest === '/comments' || rest.startsWith('/comments/')) {
    const access = await db.prepare('SELECT owner_id, is_public FROM books WHERE id = ?').bind(bookId).first()
    if (!access || (access.is_public !== 1 && access.owner_id !== me.id)) {
      return json({ error: 'Livre introuvable.' }, 404)
    }
  }

  if (rest === '/like') {
    if (method === 'POST') {
      const ins = await db
        .prepare('INSERT OR IGNORE INTO likes (book_id, user_id, created_at) VALUES (?, ?, ?)')
        .bind(bookId, me.id, new Date().toISOString())
        .run()
      if (ins.meta.changes) {
        const bk = await db.prepare('SELECT owner_id FROM books WHERE id = ?').bind(bookId).first()
        if (bk) await notify(db, { userId: bk.owner_id, type: 'like', actorId: me.id, bookId })
      }
    } else if (method === 'DELETE') {
      await db.prepare('DELETE FROM likes WHERE book_id = ? AND user_id = ?').bind(bookId, me.id).run()
    }
    const counts = await bookCounts(db, bookId)
    const liked = await db.prepare('SELECT 1 FROM likes WHERE book_id = ? AND user_id = ?').bind(bookId, me.id).first()
    return json({ likes: counts.likes, liked: !!liked })
  }

  if (rest === '/stat') {
    if (method === 'POST') {
      const body = (await readJson(req)) || {}
      const type = body.type === 'view' ? 'views' : 'impressions'
      await db.prepare(`UPDATE books SET ${type} = ${type} + 1 WHERE id = ?`).bind(bookId).run()
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
            .prepare('INSERT OR IGNORE INTO chapter_reads (user_id, chapter_id, book_id, read_at) VALUES (?, ?, ?, ?)')
            .bind(me.id, chapterId, bookId, now)
            .run()
        }
      }
    }
    return json({ ok: true })
  }

  if (rest === '/comments') {
    if (method === 'GET') {
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
    if (method === 'POST') {
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
    if (method === 'POST') {
      const ins = await db
        .prepare('INSERT OR IGNORE INTO comment_likes (comment_id, user_id, created_at) VALUES (?, ?, ?)')
        .bind(cid, me.id, new Date().toISOString())
        .run()
      if (ins.meta.changes) {
        const cowner = await db.prepare('SELECT user_id FROM comments WHERE id = ?').bind(cid).first()
        if (cowner) await notify(db, { userId: cowner.user_id, type: 'comment_like', actorId: me.id, bookId, commentId: cid })
      }
    } else if (method === 'DELETE') {
      await db.prepare('DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?').bind(cid, me.id).run()
    }
    const n = await db.prepare('SELECT COUNT(*) AS n FROM comment_likes WHERE comment_id = ?').bind(cid).first()
    const liked = await db.prepare('SELECT 1 FROM comment_likes WHERE comment_id = ? AND user_id = ?').bind(cid, me.id).first()
    return json({ likes: n?.n ?? 0, liked: !!liked })
  }

  const commMatch = rest.match(/^\/comments\/([^/]+)$/)
  if (commMatch && method === 'DELETE') {
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

  if (method === 'PUT' && rest === '') {
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

  if (method === 'DELETE' && rest === '') {
    await db.prepare('DELETE FROM books WHERE id = ?').bind(bookId).run()
    return json({ ok: true })
  }

  if (method === 'POST' && rest === '/chapters') {
    const body = (await readJson(req)) || {}
    const title = String(body.title ?? '').trim().slice(0, 80) || 'Sans titre'
    const content = sanitizeHtml(String(body.content ?? '').slice(0, 200_000))
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

  if (method === 'POST' && rest === '/chapters/reorder') {
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
    if (method === 'PUT') {
      const body = (await readJson(req)) || {}
      const title = String(body.title ?? '').trim().slice(0, 80) || 'Sans titre'
      const content = sanitizeHtml(String(body.content ?? '').slice(0, 200_000))
      const now = new Date().toISOString()
      const r = await db
        .prepare('UPDATE chapters SET title = ?, content = ?, updated_at = ?, word_count = ? WHERE id = ? AND book_id = ?')
        .bind(title, content, now, wordCountOf(content), chId, bookId)
        .run()
      if (!r.meta.changes) return json({ error: 'Chapitre introuvable.' }, 404)
      await db.prepare('UPDATE books SET updated_at = ? WHERE id = ?').bind(now, bookId).run()
      return json({ book: await loadBook(db, bookId) })
    }
    if (method === 'DELETE') {
      const r = await db.prepare('DELETE FROM chapters WHERE id = ? AND book_id = ?').bind(chId, bookId).run()
      if (!r.meta.changes) return json({ error: 'Chapitre introuvable.' }, 404)
      await db.prepare('UPDATE books SET updated_at = ? WHERE id = ?').bind(new Date().toISOString(), bookId).run()
      return json({ book: await loadBook(db, bookId) })
    }
  }

  return null
}
