-- Migration v3 : historique de lecture par utilisateur (pour les recommandations).
CREATE TABLE IF NOT EXISTS reads (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  read_count INTEGER NOT NULL DEFAULT 1,
  last_read_at TEXT NOT NULL,
  PRIMARY KEY (user_id, book_id)
);
CREATE INDEX IF NOT EXISTS idx_reads_user ON reads(user_id);
CREATE INDEX IF NOT EXISTS idx_reads_book ON reads(book_id);
