// Profils, abonnements, notifications, lectures, analytics, recommandations.
import { publicProfile } from '../auth.js'
import { json, readJson } from '../lib/http.js'
import { BOOK_SELECT, serializeBookList, publicCard, followCounts, profileStats, notify } from '../lib/models.js'
import { recommend } from '../recommend.js'

export async function profileRoutes({ req, db, url, path, meRow, me }) {
  const method = req.method

  // ---------- Profil public ----------
  if (method === 'GET' && path.startsWith('/api/users/') && !path.endsWith('/follow')) {
    const handle = decodeURIComponent(path.slice('/api/users/'.length))
    const row = await db.prepare('SELECT * FROM users WHERE username = ? OR id = ?').bind(handle, handle).first()
    if (!row) return json({ error: 'Profil introuvable.' }, 404)
    const isSelf = me && me.id === row.id
    const visibility = row.profile_visibility || 'public'
    const fc = await followCounts(db, row.id)
    const followRow = me
      ? await db.prepare('SELECT status FROM follows WHERE follower_id = ? AND following_id = ?').bind(me.id, row.id).first()
      : null
    const followStatus = followRow ? followRow.status : null
    const isFollowing = followStatus === 'accepted'

    let allowed = !!isSelf || visibility === 'public'
    if (!allowed && visibility === 'followers' && me) allowed = isFollowing

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
        is_following: isFollowing,
        follow_status: followStatus,
      })
    }

    const stats = await profileStats(db, row.id)
    const res = await db
      .prepare(`${BOOK_SELECT} WHERE b.owner_id = ? ${isSelf ? '' : 'AND b.is_public = 1 AND EXISTS (SELECT 1 FROM chapters ch WHERE ch.book_id = b.id)'} ORDER BY b.updated_at DESC`)
      .bind(row.id)
      .all()
    const books = await serializeBookList(db, res.results || [], { lite: !isSelf })
    return json({
      restricted: false,
      visibility,
      user: publicProfile(row, { self: !!isSelf }),
      stats,
      books,
      followers: fc.followers,
      following: fc.following,
      is_following: isFollowing,
      follow_status: followStatus,
    })
  }

  // ---------- Suivre / ne plus suivre ----------
  const followMatch = path.match(/^\/api\/users\/([^/]+)\/follow$/)
  if (followMatch) {
    if (!me) return json({ error: 'Connecte-toi pour suivre des auteurs.' }, 401)
    const handle = decodeURIComponent(followMatch[1])
    const target = await db.prepare('SELECT id, profile_visibility FROM users WHERE username = ? OR id = ?').bind(handle, handle).first()
    if (!target) return json({ error: 'Profil introuvable.' }, 404)
    if (target.id === me.id) return json({ error: 'Tu ne peux pas te suivre toi-même.' }, 400)
    if (method === 'POST') {
      const needsApproval = (target.profile_visibility || 'public') === 'followers'
      const status = needsApproval ? 'pending' : 'accepted'
      await db
        .prepare('INSERT OR IGNORE INTO follows (follower_id, following_id, created_at, status) VALUES (?, ?, ?, ?)')
        .bind(me.id, target.id, new Date().toISOString(), status)
        .run()
      await notify(db, { userId: target.id, type: needsApproval ? 'follow_request' : 'follow', actorId: me.id })
    } else if (method === 'DELETE') {
      await db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').bind(me.id, target.id).run()
    }
    const fc = await followCounts(db, target.id)
    const row = await db.prepare('SELECT status FROM follows WHERE follower_id = ? AND following_id = ?').bind(me.id, target.id).first()
    const status = row ? row.status : null
    return json({ followers: fc.followers, following: fc.following, is_following: status === 'accepted', follow_status: status })
  }

  // ---------- Répondre à une demande d'abonnement ----------
  if (method === 'POST' && path === '/api/follows/respond') {
    if (!me) return json({ error: 'Connecte-toi pour continuer.' }, 401)
    const body = (await readJson(req)) || {}
    const followerId = String(body.follower_id ?? '')
    const accept = body.accept === true
    const row = await db
      .prepare('SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ? AND status = ?')
      .bind(followerId, me.id, 'pending')
      .first()
    if (!row) return json({ error: 'Demande introuvable.' }, 404)
    if (accept) {
      await db.prepare("UPDATE follows SET status = 'accepted' WHERE follower_id = ? AND following_id = ?").bind(followerId, me.id).run()
      await notify(db, { userId: followerId, type: 'follow_accepted', actorId: me.id })
    } else {
      await db.prepare('DELETE FROM follows WHERE follower_id = ? AND following_id = ?').bind(followerId, me.id).run()
    }
    return json({ ok: true })
  }

  // ---------- Demandes en attente ----------
  if (method === 'GET' && path === '/api/follows/requests') {
    if (!me) return json({ error: 'Connecte-toi pour continuer.' }, 401)
    const res = await db
      .prepare(
        `SELECT u.id, u.username, u.display_name, u.avatar_emoji, u.avatar_color, u.avatar_image
         FROM follows f JOIN users u ON u.id = f.follower_id
         WHERE f.following_id = ? AND f.status = 'pending' ORDER BY f.created_at DESC`
      )
      .bind(me.id)
      .all()
    const requests = (res.results || []).map((u) => ({
      id: u.id,
      username: u.username,
      display_name: u.display_name || 'Anonyme',
      avatar_emoji: u.avatar_emoji || '',
      avatar_color: u.avatar_color || 'amber',
      avatar_image: u.avatar_image || '',
    }))
    return json({ requests })
  }

  // À partir d'ici, l'authentification est requise.
  if (!me) return null

  // ---------- Notifications ----------
  if (method === 'GET' && path === '/api/notifications') {
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

  if (method === 'POST' && path === '/api/notifications/read') {
    await db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').bind(me.id).run()
    return json({ ok: true })
  }

  const notifOneMatch = path.match(/^\/api\/notifications\/([^/]+)\/read$/)
  if (method === 'POST' && notifOneMatch) {
    await db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?').bind(notifOneMatch[1], me.id).run()
    return json({ ok: true })
  }

  // ---------- Mes lectures ----------
  if (method === 'GET' && path === '/api/reading') {
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

  // ---------- Analytics ----------
  if (method === 'GET' && path === '/api/analytics') {
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

  // ---------- Recommandations ----------
  if (method === 'GET' && path === '/api/recommendations') {
    const limit = Math.min(30, Math.max(1, parseInt(url.searchParams.get('limit') || '12', 10)))
    const items = await recommend(db, meRow, limit)
    return json({ items })
  }

  return null
}
