// Génère worker/seed.sql depuis les livres d'exemple (échappement SQL sûr).
import { pbkdf2Sync, randomBytes } from 'node:crypto'
import { writeFileSync } from 'node:fs'
import { seedBooks } from '../src/data/seedBooks.js'

const esc = (s) => String(s ?? '').replace(/'/g, "''")

// Compte démo propriétaire des livres publics (mot de passe aléatoire, jamais partagé)
const salt = randomBytes(16).toString('hex')
const hash = pbkdf2Sync('demo-never-login-' + salt, Buffer.from(salt, 'hex'), 100_000, 32, 'sha256').toString('hex')

const lines = []
lines.push(`INSERT OR IGNORE INTO users (id, name, email, password_hash, salt, created_at) VALUES ('user-demo', 'Communauté Plume', 'demo@plume.local', '${hash}', '${salt}', '2026-09-01');`)

for (const b of seedBooks) {
  lines.push(
    `INSERT OR IGNORE INTO books (id, owner_id, title, author, genre, description, cover, is_public, created_at, updated_at) VALUES ('${b.id}', 'user-demo', '${esc(b.title)}', '${esc(b.author)}', '${esc(b.genre)}', '${esc(b.description)}', '${esc(b.cover)}', 1, '${b.createdAt}', '${b.createdAt}');`
  )
  b.chapters.forEach((c, i) => {
    lines.push(
      `INSERT OR IGNORE INTO chapters (id, book_id, title, content, position, updated_at) VALUES ('${c.id}', '${b.id}', '${esc(c.title)}', '${esc(c.content)}', ${i}, '${b.createdAt}');`
    )
  })
}

writeFileSync(new URL('./seed.sql', import.meta.url), lines.join('\n') + '\n')
console.log(`seed.sql généré : ${lines.length} instructions`)
