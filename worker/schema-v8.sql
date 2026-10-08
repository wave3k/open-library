-- Migration v8 : suivi des chapitres lus (pour les stats de lecture) + couleur de bannière.
CREATE TABLE IF NOT EXISTS chapter_reads (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  book_id TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  read_at TEXT NOT NULL,
  PRIMARY KEY (user_id, chapter_id)
);
CREATE INDEX IF NOT EXISTS idx_chapter_reads_user ON chapter_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_chapter_reads_book ON chapter_reads(book_id);

ALTER TABLE users ADD COLUMN banner_color TEXT NOT NULL DEFAULT 'amber';
