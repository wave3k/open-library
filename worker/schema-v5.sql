-- Migration v5 : bannière de profil + likes sur les commentaires + comptage de mots par chapitre.
ALTER TABLE users ADD COLUMN banner_image TEXT NOT NULL DEFAULT '';

ALTER TABLE chapters ADD COLUMN word_count INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id TEXT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  PRIMARY KEY (comment_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id);
