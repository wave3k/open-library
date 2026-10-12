import { Landing } from '@/components/landing'
import type { Book } from '@/lib/plume'
import { JsonLd } from '@/components/json-ld'
import { pageMetadata } from '@/lib/seo'
import { siteJsonLd, faqJsonLd } from '@/lib/jsonld'
import { HOME_FAQ } from '@/lib/faq'

export const metadata = pageMetadata({
  title: 'Open Library — Publier et lire des livres gratuitement',
  description:
    'Publie et lis des livres gratuitement. Écris ton histoire chapitre par chapitre, partage-la et découvre celles des autres sur Open Library.',
  path: '/',
})

// Rendu serveur : les tendances arrivent dans le HTML initial (LCP/SEO),
// puis le client prend le relais pour la recherche et les interactions.
export default async function HomePage() {
  const upstream = process.env.API_UPSTREAM || ''
  let initialTrending: Book[] = []
  if (upstream) {
    try {
      const res = await fetch(`${upstream}/api/public/trending`, { next: { revalidate: 60 } })
      if (res.ok) initialTrending = (await res.json()).books ?? []
    } catch {
      // silencieux : le client réessaiera
    }
  }
  return (
    <>
      <JsonLd data={siteJsonLd()} />
      <JsonLd data={faqJsonLd(HOME_FAQ)} />
      <Landing initialTrending={initialTrending} />
    </>
  )
}
