// Types + client API + helpers partagés de Plume.

export interface Chapter {
  id: string
  title: string
  content: string
}

export interface Book {
  id: string
  owner_id: string
  owner_name: string
  title: string
  author: string
  genre: string
  description: string
  cover: string
  is_public: boolean
  created_at: string
  updated_at: string
  chapters: Chapter[]
}

export interface User {
  id: string
  name: string
  email: string
  created_at: string
}

export const GENRES = ['Fantastique', 'Romance', 'Science-Fiction', 'Policier', 'Aventure', 'Horreur', 'Poésie']

export const COVERS = [
  { id: 'indigo', bg: 'from-indigo-600 to-purple-700', emoji: '✨' },
  { id: 'emerald', bg: 'from-emerald-600 to-teal-700', emoji: '🌿' },
  { id: 'rose', bg: 'from-rose-500 to-orange-500', emoji: '🔥' },
  { id: 'sky', bg: 'from-sky-500 to-blue-700', emoji: '🌊' },
  { id: 'amber', bg: 'from-amber-500 to-red-600', emoji: '🌙' },
  { id: 'slate', bg: 'from-slate-700 to-slate-900', emoji: '📖' },
]

// L'API est appelée en relatif (/api/...) : Next la proxifie côté serveur
// vers le Worker (rewrite API_UPSTREAM). Pas de variable build-time,
// donc aucun risque d'URL vide injectée au build.
const API_URL = ''

const TOKEN_KEY = 'plume-token'
const USER_KEY = 'plume-user'

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

export function setSession(user: User, token: string) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearSession() {
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(TOKEN_KEY)
}

async function request<T>(path: string, opts: { method?: string; body?: unknown; auth?: boolean } = {}): Promise<T> {
  const { method = 'GET', body, auth = true } = opts
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (auth) {
    const t = getToken()
    if (t) headers.Authorization = `Bearer ${t}`
  }
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  let data: { error?: string } & Record<string, unknown> = {}
  try {
    data = (await res.json()) as typeof data
  } catch {
    // réponse non-JSON
  }
  if (!res.ok) {
    throw new Error(typeof data.error === 'string' && data.error ? data.error : `Erreur ${res.status}, réessaie.`)
  }
  return data as T
}

export const AuthAPI = {
  signup: (p: { name: string; email: string; password: string }) =>
    request<{ user: User; token: string }>('/api/auth/signup', { method: 'POST', body: p, auth: false }),
  login: (p: { email: string; password: string }) =>
    request<{ user: User; token: string }>('/api/auth/login', { method: 'POST', body: p, auth: false }),
  logout: () => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }).catch(() => ({ ok: true })),
  me: () => request<{ user: User }>('/api/me'),
}

export interface BookInput {
  title: string
  author: string
  genre: string
  description: string
  cover: string
  is_public?: boolean
}

export const BooksAPI = {
  mine: () => request<{ books: Book[] }>('/api/books?scope=mine').then((d) => d.books),
  explore: () => request<{ books: Book[] }>('/api/books?scope=explore').then((d) => d.books),
  create: (p: BookInput) => request<{ book: Book }>('/api/books', { method: 'POST', body: p }).then((d) => d.book),
  update: (id: string, p: Partial<BookInput>) =>
    request<{ book: Book }>(`/api/books/${id}`, { method: 'PUT', body: p }).then((d) => d.book),
  remove: (id: string) => request<{ ok: boolean }>(`/api/books/${id}`, { method: 'DELETE' }),
  importLocal: (books: (BookInput & { chapters: { title: string; content: string }[] })[]) =>
    request<{ imported: boolean }>('/api/books/import', { method: 'POST', body: { books } }),
  addChapter: (bookId: string, p: { title: string; content: string }) =>
    request<{ book: Book }>(`/api/books/${bookId}/chapters`, { method: 'POST', body: p }).then((d) => d.book),
  updateChapter: (bookId: string, chId: string, p: { title: string; content: string }) =>
    request<{ book: Book }>(`/api/books/${bookId}/chapters/${chId}`, { method: 'PUT', body: p }).then((d) => d.book),
  removeChapter: (bookId: string, chId: string) =>
    request<{ book: Book }>(`/api/books/${bookId}/chapters/${chId}`, { method: 'DELETE' }).then((d) => d.book),
  reorder: (bookId: string, ids: string[]) =>
    request<{ book: Book }>(`/api/books/${bookId}/chapters/reorder`, { method: 'POST', body: { ids } }).then(
      (d) => d.book
    ),
}

export function countWords(text: string | undefined | null = ''): number {
  if (typeof text !== 'string') return 0
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function bookWords(book: Pick<Book, 'chapters'>): number {
  return (book.chapters ?? []).reduce((s, c) => s + countWords(c?.content), 0)
}

export function readingMinutes(book: Pick<Book, 'chapters'>): number {
  return Math.max(1, Math.round(bookWords(book) / 200))
}

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeLocal(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // stockage indisponible
  }
}

export const favKey = (uid: string) => `plume-favs:${uid}`
export const progressKey = (uid: string) => `plume-progress:${uid}`
export { readLocal, writeLocal }
