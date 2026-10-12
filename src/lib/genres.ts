import { GENRES } from './plume'

/** Transforme un genre en slug d'URL : « Science-Fiction » → « science-fiction ». */
export function genreSlug(genre: string): string {
  return genre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Retrouve le libellé d'un genre depuis son slug (ou null). */
export function genreFromSlug(slug: string): string | null {
  return GENRES.find((g) => genreSlug(g) === slug) ?? null
}

/** Quelques genres mis en avant (liens internes, pages piliers). */
export const FEATURED_GENRES = ['Romance', 'Fantastique', 'Science-Fiction', 'Thriller', 'Aventure', 'Programmation']
