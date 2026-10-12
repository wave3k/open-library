import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'
import { GENRES } from '@/lib/plume'
import { genreSlug } from '@/lib/genres'

// Le sitemap liste les pages publiques indexables : pages éditoriales, pages
// de genre, livres publiés et profils publics. Les données dynamiques viennent
// du Worker (API_UPSTREAM) ; en cas d'échec, on renvoie au moins les pages fixes.
const API = process.env.API_UPSTREAM || ''

const FIXED_PAGES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/publier-un-livre', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/ecrire-un-livre', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/alternative-wattpad', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/mentions-legales', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/confidentialite', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/cgu', priority: 0.3, changeFrequency: 'yearly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const entries: MetadataRoute.Sitemap = FIXED_PAGES.map((p) => ({
    url: `${SITE_URL}${p.path}`,
    lastModified: now,
    changeFrequency: p.changeFrequency,
    priority: p.priority,
  }))

  for (const g of GENRES) {
    entries.push({
      url: `${SITE_URL}/genre/${genreSlug(g)}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    })
  }

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
    // silencieux : on garde au moins les pages fixes
  }

  return entries
}
