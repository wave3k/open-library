// Tâches de maintenance planifiées (cron), sorties du point d'entrée HTTP.

/** Purge les sessions expirées et les entrées de rate limiting anciennes (> 24 h). */
export async function purgeExpired(db) {
  const now = Date.now()
  await db.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(now).run()
  await db.prepare('DELETE FROM rate_limits WHERE window_start < ?').bind(now - 86400000).run()
}
