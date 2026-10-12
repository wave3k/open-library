import type { Metadata } from 'next'
import { SITE_URL, NO_INDEX } from '@/lib/seo'
import { fetchPublicProfile } from '@/lib/server-api'

// Métadonnées d'un profil public (la page elle-même est un composant client).
export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params
  const fallback: Metadata = { title: 'Profil — Plume', robots: NO_INDEX }
  const data = await fetchPublicProfile(username)
  if (!data) return fallback
  const name = data.user?.display_name || data.user?.name || username
  const handle = data.user?.username || username
  if (data.visibility === 'private') return { title: `${name} — Plume`, robots: NO_INDEX }
  const title = `${name} (@${handle}) — livres et histoires | Plume`
  const description = (data.user?.bio || '').slice(0, 155) || `Découvre les livres et histoires de ${name} sur Plume.`
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/u/${handle}` },
    openGraph: { title, description, url: `${SITE_URL}/u/${handle}`, locale: 'fr_FR', type: 'profile' },
  }
}

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
