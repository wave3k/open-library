-- Migration v10 : index de recherche full-text (FTS5) sur les livres.
CREATE VIRTUAL TABLE IF NOT EXISTS books_fts USING fts5(
  book_id UNINDEXED,
  title,
  author,
  description,
  tags,
  genre
);

-- Backfill initial
INSERT INTO books_fts (book_id, title, author, description, tags, genre)
SELECT id, title, author, description, tags, genre FROM books
WHERE id NOT IN (SELECT book_id FROM books_fts);

-- Synchronisation
CREATE TRIGGER IF NOT EXISTS books_fts_ai AFTER INSERT ON books BEGIN
  INSERT INTO books_fts (book_id, title, author, description, tags, genre)
  VALUES (new.id, new.title, new.author, new.description, new.tags, new.genre);
END;
CREATE TRIGGER IF NOT EXISTS books_fts_ad AFTER DELETE ON books BEGIN
  DELETE FROM books_fts WHERE book_id = old.id;
END;
CREATE TRIGGER IF NOT EXISTS books_fts_au AFTER UPDATE ON books BEGIN
  DELETE FROM books_fts WHERE book_id = old.id;
  INSERT INTO books_fts (book_id, title, author, description, tags, genre)
  VALUES (new.id, new.title, new.author, new.description, new.tags, new.genre);
END;
