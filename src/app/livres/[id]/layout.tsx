import type { Metadata } from 'next'
import { SITE_URL, SITE_NAME, NO_INDEX } from '@/lib/seo'

const API = process.env.API_UPSTREAM || ''

// Métadonnées d'un livre : le composant de page reste client, mais le layout
// serveur fournit titre/description/canonique à partir du livre réel.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const fallback: Metadata = { title: 'Livre — Open Library', robots: NO_INDEX }
  if (!API) return fallback
  try {
    const res = await fetch(`${API}/api/public/books/${id}`, { next: { revalidate: 300 } })
    if (!res.ok) return fallback // livre privé ou inexistant → non indexable
    const { book } = (await res.json()) as { book: { id: string; title: string; author: string; description?: string } }
    const title = `${book.title} — ${book.author} | Lire en ligne | Open Library`
    const description =
      (book.description || '').slice(0, 155) ||
      `Lis « ${book.title} » de ${book.author} gratuitement et en ligne sur ${SITE_NAME}.`
    return {
      title,
      description,
      alternates: { canonical: `${SITE_URL}/livres/${book.id}` },
      openGraph: { title, description, url: `${SITE_URL}/livres/${book.id}`, siteName: SITE_NAME, locale: 'fr_FR', type: 'book' },
    }
  } catch {
    return fallback
  }
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
