// Sessions : résolution de l'utilisateur courant et émission de jetons.
import { randomHex, sha256Hex, SESSION_DAYS } from '../auth.js'

export async function currentUser(db, req) {
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

export async function issueSession(db, userId) {
  const token = randomHex(32)
  const tokenHash = await sha256Hex(token)
  const expires = Date.now() + SESSION_DAYS * 24 * 3600 * 1000
  await db
    .prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)')
    .bind(tokenHash, userId, expires)
    .run()
  return token
}
