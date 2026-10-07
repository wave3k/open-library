-- Supprime tous les livres de démo (créés par le compte user-demo) et leurs dépendances.
DELETE FROM comments WHERE book_id IN (SELECT id FROM books WHERE owner_id = 'user-demo');
DELETE FROM likes WHERE book_id IN (SELECT id FROM books WHERE owner_id = 'user-demo');
DELETE FROM chapters WHERE book_id IN (SELECT id FROM books WHERE owner_id = 'user-demo');
DELETE FROM books WHERE owner_id = 'user-demo';
DELETE FROM sessions WHERE user_id = 'user-demo';
DELETE FROM users WHERE id = 'user-demo';
