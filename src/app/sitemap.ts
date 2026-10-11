import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

// Le sitemap liste les pages publiques indexables : accueil + livres publiés
// + profils publics. Les données viennent du Worker (API_UPSTREAM) ; en cas
// d'échec, on renvoie au moins l'accueil (jamais de sitemap vide).
const API = process.env.API_UPSTREAM || ''

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
  ]

  if (!API) return entries

  try {
    const res = await fetch(`${API}/api/public/sitemap`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = (await res.json()) as {
        books?: { id: string; updated_at?: string }[]
        users?: string[]
      }
      for (const b of data.books ?? []) {
        entries.push({
          url: `${SITE_URL}/livres/${b.id}`,
          lastModified: b.updated_at ? new Date(b.updated_at) : now,
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
      for (const u of data.users ?? []) {
        entries.push({
          url: `${SITE_URL}/u/${u}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.5,
        })
      }
    }
  } catch {
    // silencieux : on garde au moins l'accueil
  }

  return entries
}
