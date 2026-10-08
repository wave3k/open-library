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
  mode?: string
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
  banner_color: string
  preferences: string[]
  onboarded: boolean
  profile_visibility: 'public' | 'followers' | 'private'
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
  booksRead: number
  wordsRead: number
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

export interface ReadingBook extends Book {
  last_read_at: string
  read_count: number
  chapters_read: number
  finished: boolean
}

export interface Notification {
  id: string
  type: 'like' | 'comment' | 'comment_like' | 'follow' | 'follow_request' | 'follow_accepted'
  read: boolean
  created_at: string
  book_id: string | null
  book_title: string | null
  actor: AuthorRef | null
}

export const GENRES = [
  'Fantastique', 'Romance', 'Science-Fiction', 'Policier', 'Thriller', 'Aventure',
  'Horreur', 'Poésie', 'Éducatif', 'Programmation', 'Business', 'Développement personnel',
  'Histoire', 'Biographie', 'Cuisine', 'Voyage', 'Santé', 'Humour', 'Jeunesse',
  'Manga & BD', 'Science', 'Art & Musique', 'Sport', 'Religion & Spiritualité',
]

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

// Palettes de couvertures : id → dégradé Tailwind (swatch) + fond CSS (couverture) + emoji
export const COVERS = [
  { id: 'indigo', bg: 'from-indigo-600 to-purple-700', css: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 55%,#c026d3 100%)', emoji: '✨' },
  { id: 'emerald', bg: 'from-emerald-600 to-teal-700', css: 'linear-gradient(135deg,#059669 0%,#0d9488 55%,#0891b2 100%)', emoji: '🌿' },
  { id: 'rose', bg: 'from-rose-500 to-orange-500', css: 'linear-gradient(135deg,#e11d48 0%,#db2777 50%,#f97316 100%)', emoji: '🔥' },
  { id: 'sky', bg: 'from-sky-500 to-blue-700', css: 'linear-gradient(135deg,#0284c7 0%,#2563eb 55%,#4338ca 100%)', emoji: '🌊' },
  { id: 'amber', bg: 'from-amber-500 to-red-600', css: 'linear-gradient(135deg,#f59e0b 0%,#ea580c 55%,#dc2626 100%)', emoji: '🌙' },
  { id: 'slate', bg: 'from-slate-700 to-slate-900', css: 'linear-gradient(135deg,#334155 0%,#0f172a 60%,#020617 100%)', emoji: '📖' },
  { id: 'sunset', bg: 'from-rose-400 to-amber-400', css: 'linear-gradient(135deg,#fb7185 0%,#f59e0b 100%)', emoji: '🌅' },
  { id: 'ocean', bg: 'from-sky-400 to-teal-400', css: 'linear-gradient(135deg,#0ea5e9 0%,#14b8a6 100%)', emoji: '🐚' },
  { id: 'forest', bg: 'from-green-700 to-lime-600', css: 'linear-gradient(135deg,#166534 0%,#4d7c0f 100%)', emoji: '🌲' },
  { id: 'royal', bg: 'from-indigo-900 to-fuchsia-700', css: 'linear-gradient(135deg,#312e81 0%,#6d28d9 60%,#be185d 100%)', emoji: '👑' },
  { id: 'candy', bg: 'from-pink-400 to-violet-400', css: 'linear-gradient(135deg,#f472b6 0%,#a78bfa 100%)', emoji: '🍬' },
  { id: 'mono', bg: 'from-gray-700 to-gray-900', css: 'linear-gradient(135deg,#1f2937 0%,#111827 60%,#4b5563 100%)', emoji: '🖤' },
]

/** Dégradés disponibles pour avatar / bannière (id → CSS). */
export const BRAND_GRADIENTS = [
  { id: 'amber', label: 'Ambre', css: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
  { id: 'indigo', label: 'Indigo', css: 'linear-gradient(135deg,#6366f1,#a855f7)' },
  { id: 'emerald', label: 'Émeraude', css: 'linear-gradient(135deg,#10b981,#0d9488)' },
  { id: 'rose', label: 'Rose', css: 'linear-gradient(135deg,#f43f5e,#fb923c)' },
  { id: 'sky', label: 'Ciel', css: 'linear-gradient(135deg,#0ea5e9,#2563eb)' },
  { id: 'sunset', label: 'Coucher de soleil', css: 'linear-gradient(135deg,#fb7185,#f59e0b)' },
  { id: 'royal', label: 'Royal', css: 'linear-gradient(135deg,#4338ca,#be185d)' },
  { id: 'forest', label: 'Forêt', css: 'linear-gradient(135deg,#15803d,#84cc16)' },
  { id: 'slate', label: 'Ardoise', css: 'linear-gradient(135deg,#475569,#0f172a)' },
  { id: 'mono', label: 'Nuit', css: 'linear-gradient(135deg,#1f2937,#4b5563)' },
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
    signal: AbortSignal.timeout(15000),
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
  me: () => request<{ user: User; stats: ProfileStats; unread: number }>('/api/me'),
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
  stat: (bookId: string, type: 'view' | 'impression', chapterId?: string) =>
    request<{ ok: boolean }>(`/api/books/${bookId}/stat`, { method: 'POST', body: { type, chapterId } }).catch(() => ({ ok: false })),
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

export const NotificationsAPI = {
  list: () => request<{ notifications: Notification[]; unread: number }>('/api/notifications'),
  markRead: (id: string) => request<{ ok: boolean }>(`/api/notifications/${id}/read`, { method: 'POST' }).catch(() => ({ ok: false })),
  markAllRead: () => request<{ ok: boolean }>('/api/notifications/read', { method: 'POST' }),
}

export const ReadingAPI = {
  list: () => request<{ books: ReadingBook[] }>('/api/reading').then((d) => d.books),
}

export const FollowsAPI = {
  requests: () =>
    request<{ requests: AuthorRef[] }>('/api/follows/requests').then((d) => d.requests),
  respond: (followerId: string, accept: boolean) =>
    request<{ ok: boolean }>('/api/follows/respond', { method: 'POST', body: { follower_id: followerId, accept } }),
}

export const PublicAPI = {
  trending: () => request<{ books: Book[] }>('/api/public/trending', { auth: false }).then((d) => d.books),
  search: (q: string) =>
    request<{ books: Book[]; query: string }>(`/api/public/search?q=${encodeURIComponent(q)}`, { auth: false }).then(
      (d) => d.books
    ),
  book: (id: string) => request<{ book: Book }>(`/api/public/books/${encodeURIComponent(id)}`, { auth: false }).then((d) => d.book),
  comments: (id: string) =>
    request<{ comments: Comment[] }>(`/api/public/books/${encodeURIComponent(id)}/comments`, { auth: false }).then((d) => d.comments),
}

export const ProfileAPI = {
  get: (username: string) =>
    request<{
      user: User
      stats: ProfileStats | null
      books: Book[]
      followers: number
      following: number
      is_following: boolean
      follow_status: 'accepted' | 'pending' | null
      restricted: boolean
      visibility: 'public' | 'followers' | 'private'
    }>(`/api/users/${encodeURIComponent(username)}`),
  follow: (username: string) =>
    request<{ followers: number; following: number; is_following: boolean; follow_status: string | null }>(
      `/api/users/${encodeURIComponent(username)}/follow`,
      { method: 'POST' }
    ),
  unfollow: (username: string) =>
    request<{ followers: number; following: number; is_following: boolean; follow_status: string | null }>(
      `/api/users/${encodeURIComponent(username)}/follow`,
      { method: 'DELETE' }
    ),
  update: (p: Partial<Pick<User, 'display_name' | 'username' | 'bio' | 'avatar_emoji' | 'avatar_color' | 'avatar_image' | 'banner_image' | 'banner_color' | 'preferences' | 'referral_source' | 'onboarded' | 'profile_visibility'>>) =>
    request<{ user: User; stats: ProfileStats }>('/api/profile', { method: 'PUT', body: p }),
  changePassword: (current_password: string, new_password: string) =>
    request<{ ok: boolean }>('/api/profile/password', { method: 'POST', body: { current_password, new_password } }),
  deleteAccount: (password: string) => request<{ ok: boolean }>('/api/account', { method: 'DELETE', body: { password } }),
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
