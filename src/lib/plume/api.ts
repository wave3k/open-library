// Client HTTP typé vers l'API (appelée en relatif : Next proxifie /api côté serveur).
import { getToken } from './storage'
import type {
  Analytics,
  AuthorRef,
  Book,
  BookInput,
  Comment,
  Notification,
  ProfileStats,
  ReadingBook,
  Recommendation,
  User,
} from './types'

// L'API est appelée en relatif (/api/...) : Next la proxifie côté serveur
// vers le Worker (rewrite API_UPSTREAM). Pas de variable build-time.
const API_URL = ''

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

export const BooksAPI = {
  mine: () => request<{ books: Book[] }>('/api/books?scope=mine').then((d) => d.books),
  explore: () => request<{ books: Book[] }>('/api/books?scope=explore').then((d) => d.books),
  get: (id: string) => request<{ book: Book }>(`/api/books/${encodeURIComponent(id)}`).then((d) => d.book),
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
