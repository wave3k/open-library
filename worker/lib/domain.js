// Règles métier transverses : limites nommées et contrôles d'autorisation.
// Objectif : sortir ces décisions des handlers HTTP pour qu'elles soient
// réutilisables et testables, sans dépendre du transport ni de D1 côté logique.

/** Limites nommées (rate limiting, tailles de champs, plafonds de requêtes). */
export const LIMITS = {
  RATE_SIGNUP: { limit: 10, windowSec: 3600 },
  RATE_LOGIN: { limit: 20, windowSec: 900 },
  RATE_PASSWORD: { limit: 10, windowSec: 900 },
  RATE_STAT: { limit: 60, windowSec: 3600 },
  MAX_UPLOAD_BYTES: 8 * 1024 * 1024,
  MAX_CHAPTER_CHARS: 200_000,
  MAX_COMMENT_CHARS: 1000,
  MAX_TITLE: 80,
  MAX_AUTHOR: 40,
  MAX_NAME: 40,
  MAX_BIO: 300,
  MAX_IMPORT_BOOKS: 50,
  MAX_IMPORT_CHAPTERS: 200,
  EXPLORE_LIMIT: 100,
  COMMENTS_LIMIT: 200,
}

/**
 * Charge un livre et indique s'il est accessible à cet utilisateur
 * (public, ou bien dont il est propriétaire). Renvoie null s'il n'existe pas.
 */
export async function loadAccessibleBook(db, bookId, userId) {
  const row = await db.prepare('SELECT owner_id, is_public FROM books WHERE id = ?').bind(bookId).first()
  if (!row) return null
  return { ...row, allowed: row.is_public === 1 || row.owner_id === userId }
}

/**
 * Un commentaire peut-il être supprimé par cet utilisateur ?
 * Autorisé pour l'auteur du commentaire OU le propriétaire du livre.
 */
export async function canDeleteComment(db, commentId, bookId, userId) {
  const row = await db
    .prepare('SELECT user_id FROM comments WHERE id = ? AND book_id = ?')
    .bind(commentId, bookId)
    .first()
  if (!row) return { found: false, allowed: false }
  if (row.user_id === userId) return { found: true, allowed: true }
  const book = await db.prepare('SELECT owner_id FROM books WHERE id = ?').bind(bookId).first()
  return { found: true, allowed: book?.owner_id === userId }
}

/** Prochaine position d'un chapitre (après le dernier). */
export async function nextChapterPosition(db, bookId) {
  const max = await db.prepare('SELECT MAX(position) AS m FROM chapters WHERE book_id = ?').bind(bookId).first()
  return (max?.m ?? -1) + 1
}

/** Détermine si un visiteur peut voir le contenu d'un profil. */
export function canViewProfileContent({ isSelf, visibility, isFollowing }) {
  if (isSelf) return true
  if (visibility === 'public') return true
  if (visibility === 'followers') return !!isFollowing
  return false
}
