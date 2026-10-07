-- Migration v2 : profils, stats, likes, commentaires, tags, couverture avancée.
-- Idempotent autant que possible (ADD COLUMN échoue si déjà là, on tolère).

-- ---- users : identité enrichie ----
ALTER TABLE users ADD COLUMN username TEXT;
ALTER TABLE users ADD COLUMN display_name TEXT;
ALTER TABLE users ADD COLUMN bio TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN avatar_emoji TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN avatar_color TEXT NOT NULL DEFAULT 'amber';
ALTER TABLE users ADD COLUMN avatar_image TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN referral_source TEXT NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN preferences TEXT NOT NULL DEFAULT '[]';
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ---- books : tags, couverture riche, compteurs ----
ALTER TABLE books ADD COLUMN tags TEXT NOT NULL DEFAULT '[]';
ALTER TABLE books ADD COLUMN cover_style TEXT NOT NULL DEFAULT '{}';
ALTER TABLE books ADD COLUMN views INTEGER NOT NULL DEFAULT 0;
ALTER TABLE books ADD COLUMN impressions INTEGER NOT NULL DEFAULT 0;

-- ---- likes ----
CREATE TABLE IF NOT EXISTS likes (
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  PRIMARY KEY (book_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_likes_book ON likes(book_id);

-- ---- comments ----
CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_comments_book ON comments(book_id, created_at);
