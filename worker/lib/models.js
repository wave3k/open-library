// Constantes de domaine + (dé)sérialisation + statistiques.
import { authorRef } from '../auth.js'
import { parseArr, parseObj } from './util.js'

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
export const USERNAME_RE = /^[a-z0-9_]{3,24}$/

export const GENRES = [
  'Fantastique', 'Romance', 'Science-Fiction', 'Policier', 'Thriller', 'Aventure',
  'Horreur', 'Poésie', 'Éducatif', 'Programmation', 'Business', 'Développement personnel',
  'Histoire', 'Biographie', 'Cuisine', 'Voyage', 'Santé', 'Humour', 'Jeunesse',
  'Manga & BD', 'Science', 'Art & Musique', 'Sport', 'Religion & Spiritualité',
]
export const COVERS = ['indigo', 'emerald', 'rose', 'sky', 'amber', 'slate']
export const COVER_FONTS = ['serif', 'sans', 'mono', 'display', 'hand']
export const COVER_PATTERNS = ['none', 'stripes', 'dots', 'grid', 'waves']
export const COVER_LAYOUTS = ['classic', 'centered', 'minimal', 'band']
export const REFERRALS = ['youtube', 'x', 'search', 'ia', 'friend', 'tiktok', 'instagram', 'other']

export function cleanCoverStyle(raw) {
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

export function cleanTags(raw) {
  if (!Array.isArray(raw)) return []
  return [...new Set(raw.map((t) => String(t).trim().slice(0, 20)).filter(Boolean))].slice(0, 5)
}

export function serializeBook(book, chapters, extra = {}) {
  const lite = extra.lite === true
  return {
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
    chapters: (chapters || []).map((c) => ({
      id: c.id,
      title: c.title,
      content: lite ? '' : c.content || '',
      word_count: c.word_count || 0,
    })),
  }
}

/** Carte publique allégée (sans contenu de chapitre) pour landing/recherche/lectures. */
export function publicCard(b) {
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

export const BOOK_SELECT = `SELECT b.*, u.username AS owner_username, u.display_name AS owner_display_name,
  u.avatar_emoji AS owner_avatar_emoji, u.avatar_color AS owner_avatar_color, u.avatar_image AS owner_avatar_image
  FROM books b LEFT JOIN users u ON u.id = b.owner_id`

export async function bookCounts(db, bookId) {
  const [l, c] = await Promise.all([
    db.prepare('SELECT COUNT(*) AS n FROM likes WHERE book_id = ?').bind(bookId).first(),
    db.prepare('SELECT COUNT(*) AS n FROM comments WHERE book_id = ?').bind(bookId).first(),
  ])
  return { likes: l?.n ?? 0, comments: c?.n ?? 0 }
}

/** Sérialise une liste de livres en 3 requêtes au total (au lieu de 3 par livre). */
export async function serializeBookList(db, rows, { lite = false } = {}) {
  if (!rows.length) return []
  const ids = rows.map((r) => r.id)
  const ph = ids.map(() => '?').join(',')
  const [chRes, lkRes, cmRes] = await Promise.all([
    db.prepare(`SELECT * FROM chapters WHERE book_id IN (${ph}) ORDER BY position ASC, rowid ASC`).bind(...ids).all(),
    db.prepare(`SELECT book_id, COUNT(*) AS n FROM likes WHERE book_id IN (${ph}) GROUP BY book_id`).bind(...ids).all(),
    db.prepare(`SELECT book_id, COUNT(*) AS n FROM comments WHERE book_id IN (${ph}) GROUP BY book_id`).bind(...ids).all(),
  ])
  const chaptersByBook = new Map()
  for (const c of chRes.results || []) {
    if (!chaptersByBook.has(c.book_id)) chaptersByBook.set(c.book_id, [])
    chaptersByBook.get(c.book_id).push(c)
  }
  const likes = new Map((lkRes.results || []).map((r) => [r.book_id, r.n]))
  const comments = new Map((cmRes.results || []).map((r) => [r.book_id, r.n]))
  return rows.map((b) =>
    serializeBook(b, chaptersByBook.get(b.id) || [], {
      likes: likes.get(b.id) || 0,
      comments: comments.get(b.id) || 0,
      lite,
    })
  )
}

/** Crée une notification (sauf si l'acteur est le destinataire). */
export async function notify(db, { userId, type, actorId, bookId = null, commentId = null }) {
  if (!userId || userId === actorId) return
  await db
    .prepare('INSERT INTO notifications (id, user_id, type, actor_id, book_id, comment_id, read, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)')
    .bind(crypto.randomUUID(), userId, type, actorId, bookId, commentId, new Date().toISOString())
    .run()
}

export async function followCounts(db, userId) {
  const [f, g] = await Promise.all([
    db.prepare("SELECT COUNT(*) AS n FROM follows WHERE following_id = ? AND status = 'accepted'").bind(userId).first(),
    db.prepare("SELECT COUNT(*) AS n FROM follows WHERE follower_id = ? AND status = 'accepted'").bind(userId).first(),
  ])
  return { followers: f?.n ?? 0, following: g?.n ?? 0 }
}

export async function loadBook(db, id) {
  const book = await db.prepare(`${BOOK_SELECT} WHERE b.id = ?`).bind(id).first()
  if (!book) return null
  const { results } = await db
    .prepare('SELECT * FROM chapters WHERE book_id = ? ORDER BY position ASC, rowid ASC')
    .bind(id)
    .all()
  const counts = await bookCounts(db, id)
  return serializeBook(book, results || [], counts)
}

export function cleanBookInput(body, partial = false) {
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

export async function profileStats(db, userId) {
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
