// Moteur de recommandation hybride.
// Combine : affinités (genres, tags, auteurs) + qualité (likes, commentaires,
// engagement) + popularité (vues) + fraîcheur + diversité, avec un peu
// d'exploration aléatoire. Chaque reco porte une "raison" lisible.

const W = {
  genrePref: 3.0,
  genreHistory: 2.2,
  tags: 2.4,
  author: 1.6,
  likes: 1.1,
  comments: 0.7,
  views: 0.45,
  engagement: 1.3,
  freshness: 0.9,
  alreadyRead: -1.4,
  jitter: 0.18,
}

const clamp01 = (x) => Math.max(0, Math.min(1, x))
const log1p = (x) => Math.log(1 + Math.max(0, x))

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

function daysSince(iso) {
  const t = Date.parse(iso || '')
  if (Number.isNaN(t)) return 365
  return Math.max(0, (Date.now() - t) / 86_400_000)
}

/** Construit le profil d'affinités d'un utilisateur. */
async function buildAffinity(db, userId, preferences) {
  const genreScore = new Map()
  const tagScore = new Map()
  const authorScore = new Map()

  const bump = (map, key, v) => {
    if (!key) return
    map.set(key, (map.get(key) || 0) + v)
  }

  // Genres déclarés à l'inscription / dans le profil
  for (const g of preferences || []) bump(genreScore, g, 1.0)

  // Likes (signal fort)
  const liked = await db
    .prepare(
      `SELECT b.genre, b.tags, b.owner_id FROM likes l JOIN books b ON b.id = l.book_id WHERE l.user_id = ?`
    )
    .bind(userId)
    .all()
  for (const r of liked.results || []) {
    bump(genreScore, r.genre, 2.0)
    bump(authorScore, r.owner_id, 2.0)
    for (const t of parseArr(r.tags, [])) bump(tagScore, t, 2.0)
  }

  // Lectures (signal moyen, pondéré par le nombre de lectures)
  const reads = await db
    .prepare(
      `SELECT b.genre, b.tags, b.owner_id, r.read_count FROM reads r JOIN books b ON b.id = r.book_id WHERE r.user_id = ?`
    )
    .bind(userId)
    .all()
  for (const r of reads.results || []) {
    const w = 1.2 * Math.min(3, r.read_count || 1)
    bump(genreScore, r.genre, w)
    bump(authorScore, r.owner_id, w)
    for (const t of parseArr(r.tags, [])) bump(tagScore, t, w)
  }

  const normalize = (map) => {
    const max = Math.max(1, ...map.values())
    const out = new Map()
    for (const [k, v] of map) out.set(k, v / max)
    return out
  }

  return {
    genre: normalize(genreScore),
    tag: normalize(tagScore),
    author: normalize(authorScore),
    hasHistory: (liked.results?.length || 0) + (reads.results?.length || 0) > 0,
    hasPrefs: (preferences || []).length > 0,
  }
}

/** Charge les candidats (livres publics d'autres auteurs) avec compteurs agrégés. */
async function loadCandidates(db, userId) {
  const res = await db
    .prepare(
      `SELECT b.id, b.title, b.author, b.genre, b.description, b.cover, b.cover_style, b.tags,
              b.is_public, b.created_at, b.updated_at, b.views, b.impressions, b.owner_id,
              u.username AS owner_username, u.display_name AS owner_display_name,
              u.avatar_emoji AS owner_avatar_emoji, u.avatar_color AS owner_avatar_color,
              u.avatar_image AS owner_avatar_image,
              (SELECT COUNT(*) FROM likes l WHERE l.book_id = b.id) AS like_count,
              (SELECT COUNT(*) FROM comments c WHERE c.book_id = b.id) AS comment_count,
              (SELECT COUNT(*) FROM chapters ch WHERE ch.book_id = b.id) AS chapter_count
       FROM books b LEFT JOIN users u ON u.id = b.owner_id
       WHERE b.is_public = 1 AND b.owner_id != ?
         AND EXISTS (SELECT 1 FROM chapters c WHERE c.book_id = b.id)
       ORDER BY b.updated_at DESC LIMIT 200`
    )
    .bind(userId)
    .all()
  return res.results || []
}

/** Charge les livres déjà vus (likés ou lus) par l'utilisateur. */
async function loadSeen(db, userId) {
  const [l, r] = await Promise.all([
    db.prepare('SELECT book_id FROM likes WHERE user_id = ?').bind(userId).all(),
    db.prepare('SELECT book_id FROM reads WHERE user_id = ?').bind(userId).all(),
  ])
  const seen = new Set()
  for (const x of l.results || []) seen.add(x.book_id)
  for (const x of r.results || []) seen.add(x.book_id)
  return seen
}

function scoreBook(book, aff, ctx) {
  const genrePref = aff.genre.get(book.genre) || 0
  const tags = parseArr(book.tags, [])
  const tagHit = tags.reduce((s, t) => s + (aff.tag.get(t) || 0), 0)
  const tagMatch = tags.length ? clamp01(tagHit / Math.min(3, tags.length)) : 0
  const author = aff.author.get(book.owner_id) || 0

  const likes = book.like_count || 0
  const comments = book.comment_count || 0
  const views = book.views || 0
  const impressions = book.impressions || 0

  const likesN = clamp01(likes / Math.max(1, ctx.maxLikes))
  const commentsN = clamp01(comments / Math.max(1, ctx.maxComments))
  const viewsN = clamp01(log1p(views) / Math.max(1, log1p(ctx.maxViews)))
  // engagement = qualité perçue (beaucoup de likes/commentaires pour peu de vues)
  const engagement = clamp01((likes * 2 + comments * 3) / Math.max(5, views * 0.5 + impressions * 0.15))
  const freshness = Math.exp(-daysSince(book.updated_at || book.created_at) / 30)

  const base =
    W.genrePref * genrePref +
    W.tags * tagMatch +
    W.author * author +
    W.likes * likesN +
    W.comments * commentsN +
    W.views * viewsN +
    W.engagement * engagement +
    W.freshness * freshness

  const seenPenalty = ctx.seen.has(book.id) ? W.alreadyRead : 0
  const jitter = (Math.random() - 0.5) * W.jitter

  return {
    score: base + seenPenalty + jitter,
    parts: { genrePref, tagMatch, author, likesN, commentsN, viewsN, engagement, freshness, likes, comments, views },
    tags,
  }
}

function reasonFor(book, parts, aff, ctx) {
  const tags = parseArr(book.tags, [])
  const topTag = tags
    .map((t) => ({ t, s: aff.tag.get(t) || 0 }))
    .sort((a, b) => b.s - a.s)[0]
  if (parts.author > 0.5) return `Tu suis ${book.owner_display_name || book.author}`
  if (parts.genrePref >= 0.6 && topTag && topTag.s > 0) return `Parce que tu aimes ${book.genre} et #${topTag.t}`
  if (parts.genrePref >= 0.6) return `Parce que tu aimes ${book.genre}`
  if (topTag && topTag.s > 0.4) return `Dans la veine de tes lectures · #${topTag.t}`
  if (parts.engagement > 0.5 || parts.likesN > 0.6) return 'Très apprécié des lecteurs'
  if (parts.freshness > 0.7) return 'Nouveau sur Open Library'
  if (ctx.seen.has(book.id)) return 'À relire'
  return 'À découvrir'
}

/** Re-classement pour la diversité (évite 5 livres du même genre/auteur d'affilée). */
function diversify(ranked, limit) {
  const out = []
  const genreCount = new Map()
  const authorCount = new Map()
  const pool = [...ranked]
  while (out.length < limit && pool.length) {
    let bestIdx = 0
    let bestVal = -Infinity
    for (let i = 0; i < pool.length; i++) {
      const c = pool[i]
      const penalty =
        0.5 * (genreCount.get(c.book.genre) || 0) + 0.7 * (authorCount.get(c.book.owner_id) || 0)
      const val = c.score - penalty
      if (val > bestVal) {
        bestVal = val
        bestIdx = i
      }
    }
    const [picked] = pool.splice(bestIdx, 1)
    out.push(picked)
    genreCount.set(picked.book.genre, (genreCount.get(picked.book.genre) || 0) + 1)
    authorCount.set(picked.book.owner_id, (authorCount.get(picked.book.owner_id) || 0) + 1)
  }
  return out
}

/**
 * Recommandations personnalisées.
 * @returns {Promise<Array<{book:object, reason:string, score:number}>>}
 */
export async function recommend(db, user, limit = 12) {
  const preferences = parseArr(user.preferences, [])
  const aff = await buildAffinity(db, user.id, preferences)
  const candidates = await loadCandidates(db, user.id)
  const seen = await loadSeen(db, user.id)

  if (!candidates.length) return []

  const ctx = {
    seen,
    maxLikes: Math.max(1, ...candidates.map((b) => b.like_count || 0)),
    maxComments: Math.max(1, ...candidates.map((b) => b.comment_count || 0)),
    maxViews: Math.max(1, ...candidates.map((b) => b.views || 0)),
  }

  const ranked = candidates.map((book) => {
    const { score, parts } = scoreBook(book, aff, ctx)
    return { book, parts, score }
  })
  ranked.sort((a, b) => b.score - a.score)

  const picked = diversify(ranked, limit)

  return picked.map((c) => ({
    book: serializeCandidate(c.book, c.parts),
    reason: reasonFor(c.book, c.parts, aff, ctx),
    score: Math.round(c.score * 1000) / 1000,
  }))
}

/** Transforme une ligne candidate en objet "book" attendu par le front. */
function serializeCandidate(b, parts) {
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
    is_public: b.is_public === 1,
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
    // pas de contenu de chapitre ici (liste allégée) :
    chapters: [],
  }
}
