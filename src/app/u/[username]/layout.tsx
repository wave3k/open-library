import type { Metadata } from 'next'
import { SITE_URL, NO_INDEX } from '@/lib/seo'

const API = process.env.API_UPSTREAM || ''

type PublicProfile = {
  restricted: boolean
  visibility: 'public' | 'followers' | 'private'
  user: { username?: string; display_name?: string; name?: string; bio?: string }
}

// Métadonnées d'un profil public (la page elle-même est un composant client).
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  const fallback: Metadata = { title: 'Profil — Open Library', robots: NO_INDEX }
  if (!API) return fallback
  try {
    const res = await fetch(`${API}/api/users/${encodeURIComponent(username)}`, { next: { revalidate: 300 } })
    if (!res.ok) return fallback
    const data = (await res.json()) as PublicProfile
    const name = data.user?.display_name || data.user?.name || username
    const handle = data.user?.username || username
    if (data.visibility === 'private') return { title: `${name} — Open Library`, robots: NO_INDEX }
    const title = `${name} (@${handle}) — livres et histoires | Open Library`
    const description = (data.user?.bio || '').slice(0, 155) || `Découvre les livres et histoires de ${name} sur Open Library.`
    return {
      title,
      description,
      alternates: { canonical: `${SITE_URL}/u/${handle}` },
      openGraph: { title, description, url: `${SITE_URL}/u/${handle}`, locale: 'fr_FR', type: 'profile' },
    }
  } catch {
    return fallback
  }
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
