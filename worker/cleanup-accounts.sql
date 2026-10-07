-- Supprime TOUS les comptes (et tout ce qui leur appartient via cascade).
DELETE FROM comment_likes;
DELETE FROM comments;
DELETE FROM likes;
DELETE FROM reads;
DELETE FROM chapters;
DELETE FROM books;
DELETE FROM sessions;
DELETE FROM users;
