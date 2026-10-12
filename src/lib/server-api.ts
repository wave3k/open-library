// Accès API côté serveur (SSR) : le front appelle /api en relatif dans le
// navigateur, mais un composant serveur doit viser le Worker en absolu.
const API = process.env.API_UPSTREAM || ''

export async function fetchPublicBook(id: string): Promise<Record<string, unknown> | null> {
  if (!API) return null
  try {
    const res = await fetch(`${API}/api/public/books/${encodeURIComponent(id)}`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    return ((await res.json()) as { book?: Record<string, unknown> }).book ?? null
  } catch {
    return null
  }
}

export type PublicProfileData = {
  restricted: boolean
  visibility: 'public' | 'followers' | 'private'
  user: { username?: string; display_name?: string; name?: string; bio?: string }
  stats: unknown
  books: unknown[]
  followers: number
  following: number
  is_following: boolean
  follow_status: 'accepted' | 'pending' | null
}

export async function fetchPublicProfile(username: string): Promise<PublicProfileData | null> {
  if (!API) return null
  try {
    const res = await fetch(`${API}/api/users/${encodeURIComponent(username)}`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    return (await res.json()) as PublicProfileData
  } catch {
    return null
  }
}

export type SearchBook = {
  id: string
  title: string
  author: string
  genre: string
  description?: string
  cover?: string
  cover_style?: {
    mode?: string
    preset?: string
    font?: string
    pattern?: string
    layout?: string
    emoji?: string
    textColor?: string
    image?: string
  } | null
  tags?: string[]
  views?: number
  likes?: number
  chapters?: unknown[]
}

export async function fetchSearchBooks(q: string, genre?: string): Promise<SearchBook[]> {
  if (!API) return []
  const params = new URLSearchParams()
  if (q) params.set('q', q)
  if (genre) params.set('genre', genre)
  try {
    const res = await fetch(`${API}/api/public/search?${params.toString()}`, { next: { revalidate: 300 } })
    if (!res.ok) return []
    return ((await res.json()) as { books?: SearchBook[] }).books ?? []
  } catch {
    return []
  }
}
