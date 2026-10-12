import type { Metadata } from 'next'
import type { Book } from '@/lib/plume'
import { SITE_URL, SITE_NAME, NO_INDEX } from '@/lib/seo'
import { fetchPublicBook } from '@/lib/server-api'

// Métadonnées d'un livre : le composant de page est client, mais le layout
// serveur fournit titre/description/canonique à partir du livre réel.
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const fallback: Metadata = { title: 'Livre — Plume', robots: NO_INDEX }
  const book = (await fetchPublicBook(id)) as Book | null
  if (!book) return fallback // livre privé ou inexistant → non indexable
  const title = `${book.title} — ${book.author} | Lire en ligne | Plume`
  const description =
    (book.description || '').slice(0, 155) ||
    `Lis « ${book.title} » de ${book.author} gratuitement et en ligne sur ${SITE_NAME}.`
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/livres/${book.id}` },
    openGraph: { title, description, url: `${SITE_URL}/livres/${book.id}`, siteName: SITE_NAME, locale: 'fr_FR', type: 'book' },
  }
}

export default function BookLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
