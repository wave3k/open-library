-- Migration v7 : visibilité du profil (public | followers | private).
ALTER TABLE users ADD COLUMN profile_visibility TEXT NOT NULL DEFAULT 'public';
