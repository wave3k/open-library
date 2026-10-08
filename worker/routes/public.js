// Routes publiques (accessibles sans authentification).
import { json, cacheJson } from '../lib/http.js'
import { BOOK_SELECT, publicCard, serializeBook, bookCounts } from '../lib/models.js'

export async function publicRoutes({ req, db, url, path }) {
  const method = req.method

  if (method === 'GET' && path === '/api/public/trending') {
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
    return cacheJson({ books: (res.results || []).map((b) => publicCard(b)) }, 60)
  }

  if (method === 'GET' && path === '/api/public/search') {
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
      // Recherche full-text (FTS5) avec repli sur LIKE.
      const ftsQuery = q
        .split(/\s+/)
        .filter(Boolean)
        .map((t) => `"${t.replace(/"/g, '')}"*`)
        .join(' AND ')
      try {
        res = await db
          .prepare(
            `SELECT b.*, u.username AS owner_username, u.display_name AS owner_display_name,
                    u.avatar_emoji AS owner_avatar_emoji, u.avatar_color AS owner_avatar_color, u.avatar_image AS owner_avatar_image,
                    (SELECT COUNT(*) FROM likes l WHERE l.book_id = b.id) AS like_count,
                    (SELECT COUNT(*) FROM comments cm WHERE cm.book_id = b.id) AS comment_count,
                    (SELECT COUNT(*) FROM chapters ch WHERE ch.book_id = b.id) AS chapter_count
             FROM books_fts f JOIN books b ON b.id = f.book_id
             LEFT JOIN users u ON u.id = b.owner_id
             WHERE f MATCH ? AND b.is_public = 1 AND EXISTS (SELECT 1 FROM chapters ch WHERE ch.book_id = b.id)
             ORDER BY f.rank LIMIT 24`
          )
          .bind(ftsQuery)
          .all()
      } catch {
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
    }
    return cacheJson({ books: (res.results || []).map((b) => publicCard(b)), query: q }, 30)
  }

  const pubBookMatch = path.match(/^\/api\/public\/books\/([^/]+)$/)
  if (method === 'GET' && pubBookMatch) {
    const bid = pubBookMatch[1]
    const b = await db.prepare(`${BOOK_SELECT} WHERE b.id = ?`).bind(bid).first()
    if (!b || b.is_public !== 1) return json({ error: 'Livre introuvable.' }, 404)
    const ch = await db.prepare('SELECT * FROM chapters WHERE book_id = ? ORDER BY position ASC, rowid ASC').bind(bid).all()
    if (!(ch.results || []).length) return json({ error: 'Livre introuvable.' }, 404)
    return json({ book: serializeBook(b, ch.results || [], await bookCounts(db, bid)) })
  }

  const pubCommentsMatch = path.match(/^\/api\/public\/books\/([^/]+)\/comments$/)
  if (method === 'GET' && pubCommentsMatch) {
    const bid = pubCommentsMatch[1]
    const bk = await db.prepare('SELECT is_public FROM books WHERE id = ?').bind(bid).first()
    if (!bk || bk.is_public !== 1) return json({ comments: [] })
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

  return null
}
