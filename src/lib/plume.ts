// Types + client API + helpers partagés d'Open Library.

export interface Chapter {
  id: string
  title: string
  content: string
}

export interface AuthorRef {
  id: string
  username: string
  display_name: string
  avatar_emoji: string
  avatar_color: string
  avatar_image: string
}

export interface CoverStyle {
  preset: string
  font: string
  pattern: string
  layout: string
  emoji: string
  textColor: string
  image: string
}

export interface Book {
  id: string
  owner_id: string
  owner_name: string
  author: string
  title: string
  genre: string
  description: string
  cover: string
  cover_style: Partial<CoverStyle>
  tags: string[]
  is_public: boolean
  created_at: string
  updated_at: string
  views: number
  impressions: number
  likes: number
  comments: number
  chapter_count?: number
  chapters: Chapter[]
  owner: AuthorRef
}

export interface Recommendation {
  book: Book
  reason: string
  score: number
}

export interface User {
  id: string
  username: string
  display_name: string
  name: string
  bio: string
  avatar_emoji: string
  avatar_color: string
  avatar_image: string
  banner_image: string
  preferences: string[]
  onboarded: boolean
  created_at: string
  email?: string
  referral_source?: string
}

export interface ProfileStats {
  books: number
  published: number
  drafts: number
  chapters: number
  words: number
  views: number
  impressions: number
  likes: number
  commentLikes: number
  likesReceived: number
  comments: number
}

export interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  likes: number
  liked: boolean
  author: AuthorRef
}

export interface AnalyticsBook {
  id: string
  title: string
  genre: string
  is_public: boolean
  published: boolean
  chapters: number
  words: number
  views: number
  impressions: number
  likes: number
  comments: number
}

export interface Analytics {
  summary: ProfileStats
  books: AnalyticsBook[]
  likesTrend: { day: string; likes: number }[]
}

export const GENRES = ['Fantastique', 'Romance', 'Science-Fiction', 'Policier', 'Aventure', 'Horreur', 'Poésie']

export const REFERRAL_SOURCES = [
  { id: 'youtube', label: 'YouTube' },
  { id: 'x', label: 'X (Twitter)' },
  { id: 'search', label: 'Moteur de recherche' },
  { id: 'ia', label: 'IA (ChatGPT, etc.)' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'friend', label: 'Un ami' },
  { id: 'other', label: 'Autre' },
]

// Palettes de couvertures : id → classes de dégradé Tailwind
export const COVERS = [
  { id: 'indigo', bg: 'from-indigo-600 to-purple-700', emoji: '✨' },
  { id: 'emerald', bg: 'from-emerald-600 to-teal-700', emoji: '🌿' },
  { id: 'rose', bg: 'from-rose-500 to-orange-500', emoji: '🔥' },
  { id: 'sky', bg: 'from-sky-500 to-blue-700', emoji: '🌊' },
  { id: 'amber', bg: 'from-amber-500 to-red-600', emoji: '🌙' },
  { id: 'slate', bg: 'from-slate-700 to-slate-900', emoji: '📖' },
]

export const COVER_FONTS = [
  { id: 'serif', label: 'Serif', className: 'font-serif' },
  { id: 'sans', label: 'Sans', className: 'font-sans' },
  { id: 'mono', label: 'Mono', className: 'font-mono' },
  { id: 'display', label: 'Display', className: 'cover-font-display' },
  { id: 'hand', label: 'Manuscrite', className: 'cover-font-hand' },
]

export const COVER_PATTERNS = [
  { id: 'none', label: 'Aucun' },
  { id: 'stripes', label: 'Rayures' },
  { id: 'dots', label: 'Points' },
  { id: 'grid', label: 'Grille' },
  { id: 'waves', label: 'Vagues' },
]

export const COVER_LAYOUTS = [
  { id: 'classic', label: 'Classique' },
  { id: 'centered', label: 'Centré' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'band', label: 'Bandeau' },
]

export const EMOJI_CHOICES = ['✨', '🌿', '🔥', '🌊', '🌙', '📖', '🛰️', '🗡️', '❤️', '👑', '🐉', '🚀', '🌌', '🔮', '🕯️', '🏰', '⚔️', '🧭', '🗝️', '🦋', '🌹', '☀️', '🌧️', '⚡']

export const COVER_COLORS = ['#ffffff', '#fde68a', '#a7f3d0', '#bfdbfe', '#fecaca', '#e9d5ff', '#111827']

const TOKEN_KEY = 'plume-token'
const USER_KEY = 'plume-user'

// L'API est appelée en relatif (/api/...) : Next la proxifie côté serveur
// vers le Worker (rewrite API_UPSTREAM). Pas de variable build-time.
const API_URL = ''

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

export function updateStoredUser(user: User) {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
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
  signup: (p: {
    display_name: string
    username?: string
    email: string
    password: string
    referral_source?: string
    preferences?: string[]
  }) => request<{ user: User; token: string }>('/api/auth/signup', { method: 'POST', body: p, auth: false }),
  login: (p: { email: string; password: string }) =>
    request<{ user: User; token: string }>('/api/auth/login', { method: 'POST', body: p, auth: false }),
  logout: () => request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }).catch(() => ({ ok: true })),
  me: () => request<{ user: User; stats: ProfileStats }>('/api/me'),
  usernameAvailable: (username: string) =>
    request<{ available: boolean }>(`/api/username-available?username=${encodeURIComponent(username)}`, { auth: false }),
}

export interface BookInput {
  title: string
  author: string
  genre: string
  description: string
  cover: string
  cover_style?: Partial<CoverStyle>
  tags?: string[]
  is_public?: boolean
}

export const BooksAPI = {
  mine: () => request<{ books: Book[] }>('/api/books?scope=mine').then((d) => d.books),
  explore: () => request<{ books: Book[] }>('/api/books?scope=explore').then((d) => d.books),
  recommendations: (limit = 12) =>
    request<{ items: Recommendation[] }>(`/api/recommendations?limit=${limit}`).then((d) => d.items),
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
  like: (bookId: string) =>
    request<{ likes: number; liked: boolean }>(`/api/books/${bookId}/like`, { method: 'POST' }),
  unlike: (bookId: string) =>
    request<{ likes: number; liked: boolean }>(`/api/books/${bookId}/like`, { method: 'DELETE' }),
  stat: (bookId: string, type: 'view' | 'impression') =>
    request<{ ok: boolean }>(`/api/books/${bookId}/stat`, { method: 'POST', body: { type } }).catch(() => ({ ok: false })),
  comments: (bookId: string) =>
    request<{ comments: Comment[] }>(`/api/books/${bookId}/comments`).then((d) => d.comments),
  addComment: (bookId: string, content: string) =>
    request<{ ok: boolean; id: string }>(`/api/books/${bookId}/comments`, { method: 'POST', body: { content } }),
  removeComment: (bookId: string, commentId: string) =>
    request<{ ok: boolean }>(`/api/books/${bookId}/comments/${commentId}`, { method: 'DELETE' }),
  likeComment: (bookId: string, commentId: string) =>
    request<{ likes: number; liked: boolean }>(`/api/books/${bookId}/comments/${commentId}/like`, { method: 'POST' }),
  unlikeComment: (bookId: string, commentId: string) =>
    request<{ likes: number; liked: boolean }>(`/api/books/${bookId}/comments/${commentId}/like`, { method: 'DELETE' }),
}

export const AnalyticsAPI = {
  get: () => request<Analytics>('/api/analytics'),
}

export const ProfileAPI = {
  get: (username: string) =>
    request<{ user: User; stats: ProfileStats; books: Book[] }>(`/api/users/${encodeURIComponent(username)}`),
  update: (p: Partial<Pick<User, 'display_name' | 'username' | 'bio' | 'avatar_emoji' | 'avatar_color' | 'avatar_image' | 'banner_image' | 'preferences' | 'referral_source' | 'onboarded'>>) =>
    request<{ user: User; stats: ProfileStats }>('/api/profile', { method: 'PUT', body: p }),
  changePassword: (current_password: string, new_password: string) =>
    request<{ ok: boolean }>('/api/profile/password', { method: 'POST', body: { current_password, new_password } }),
  deleteAccount: () => request<{ ok: boolean }>('/api/account', { method: 'DELETE' }),
}

export const MediaAPI = {
  /** Envoie une image (binaire brut) au Worker qui la stocke dans R2. */
  upload: async (blob: Blob): Promise<{ url: string }> => {
    const headers: Record<string, string> = { 'Content-Type': blob.type || 'image/jpeg' }
    const t = getToken()
    if (t) headers.Authorization = `Bearer ${t}`
    const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', headers, body: blob })
    const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string }
    if (!res.ok) throw new Error(data.error || 'Envoi de l’image impossible.')
    return { url: data.url as string }
  },
}

export function countWords(text: string | undefined | null = ''): number {
  if (typeof text !== 'string') return 0
  const plain = text.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')
  return plain.trim().split(/\s+/).filter(Boolean).length
}

export function bookWords(book: { chapters?: Chapter[] }): number {
  return (book.chapters ?? []).reduce((s, c) => s + countWords(c?.content), 0)
}

export function readingMinutes(book: { chapters?: Chapter[] }): number {
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
