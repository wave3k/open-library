import { useEffect, useState } from 'react'
import { seedBooks, GENRES, COVERS } from '../data/seedBooks.js'

const KEY = 'plume-books-v1'
const READER_KEY = 'plume-reader-v1'
const DRAFT_PREFIX = 'plume-draft-v1:'

export function uid(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

export function normalizeChapter(c, i = 0) {
  return {
    id: typeof c?.id === 'string' ? c.id : uid('ch'),
    title: typeof c?.title === 'string' ? c.title : `Chapitre ${i + 1}`,
    content: typeof c?.content === 'string' ? c.content : '',
  }
}

export function normalizeBook(b) {
  const chapters = Array.isArray(b?.chapters) ? b.chapters.map(normalizeChapter) : []
  const coverOk = COVERS.some((c) => c.id === b?.cover)
  return {
    id: typeof b?.id === 'string' ? b.id : uid('livre'),
    title: typeof b?.title === 'string' && b.title ? b.title : 'Sans titre',
    author: typeof b?.author === 'string' && b.author ? b.author : 'Anonyme',
    genre: typeof b?.genre === 'string' && b.genre ? b.genre : GENRES[0],
    description: typeof b?.description === 'string' ? b.description : '',
    cover: coverOk ? b.cover : COVERS[0].id,
    createdAt: typeof b?.createdAt === 'string' ? b.createdAt : todayISO(),
    favorite: b?.favorite === true,
    lastRead: typeof b?.lastRead === 'string' ? b.lastRead : null,
    chapters,
  }
}

function load() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return seedBooks.map(normalizeBook)
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return seedBooks.map(normalizeBook)
    return parsed.map(normalizeBook)
  } catch {
    return seedBooks.map(normalizeBook)
  }
}

export function useBooks() {
  const [books, setBooks] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(books))
    } catch {
      // stockage plein ou indisponible : on ignore
    }
  }, [books])

  return [books, setBooks]
}

/** Préférences du lecteur (taille du texte, thème), persistées. */
export function useReaderPrefs() {
  const [prefs, setPrefs] = useState(() => {
    try {
      const raw = localStorage.getItem(READER_KEY)
      if (raw) {
        const p = JSON.parse(raw)
        return {
          fontSize: Math.min(24, Math.max(14, Number(p.fontSize) || 17)),
          theme: ['papier', 'nuit', 'sepia'].includes(p.theme) ? p.theme : 'papier',
        }
      }
    } catch {
      // ignore
    }
    return { fontSize: 17, theme: 'papier' }
  })

  useEffect(() => {
    try {
      localStorage.setItem(READER_KEY, JSON.stringify(prefs))
    } catch {
      // ignore
    }
  }, [prefs])

  return [prefs, setPrefs]
}

/** Brouillon d’écriture autosauvegardé (anti-perte). */
export function loadDraft(bookId, chapterId) {
  try {
    const raw = localStorage.getItem(`${DRAFT_PREFIX}${bookId}:${chapterId}`)
    if (!raw) return null
    const d = JSON.parse(raw)
    if (typeof d?.content !== 'string') return null
    return { title: d.title ?? '', content: d.content ?? '', savedAt: d.savedAt ?? null }
  } catch {
    return null
  }
}

export function saveDraft(bookId, chapterId, data) {
  try {
    localStorage.setItem(
      `${DRAFT_PREFIX}${bookId}:${chapterId}`,
      JSON.stringify({ ...data, savedAt: new Date().toISOString() })
    )
  } catch {
    // ignore
  }
}

export function clearDraft(bookId, chapterId) {
  try {
    localStorage.removeItem(`${DRAFT_PREFIX}${bookId}:${chapterId}`)
  } catch {
    // ignore
  }
}

export function countWords(text = '') {
  if (typeof text !== 'string') return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function bookWords(book) {
  return (book.chapters ?? []).reduce((s, c) => s + countWords(c?.content), 0)
}

export function readingMinutes(book) {
  return Math.max(1, Math.round(bookWords(book) / 200))
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
