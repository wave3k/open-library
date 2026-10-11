// Comptage de mots / durée de lecture (présentation).
import type { Chapter } from './types'

export function countWords(text: string | undefined | null = ''): number {
  if (typeof text !== 'string') return 0
  const plain = text.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')
  return plain.trim().split(/\s+/).filter(Boolean).length
}

export function bookWords(book: { chapters?: Chapter[] }): number {
  return (book.chapters ?? []).reduce((s, c) => s + (typeof c?.word_count === 'number' && c.word_count > 0 ? c.word_count : countWords(c?.content)), 0)
}

export function readingMinutes(book: { chapters?: Chapter[] }): number {
  return Math.max(1, Math.round(bookWords(book) / 200))
}
