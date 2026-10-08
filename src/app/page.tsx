import { Landing } from '@/components/landing'
import type { Book } from '@/lib/plume'

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
  return <Landing initialTrending={initialTrending} />
}
