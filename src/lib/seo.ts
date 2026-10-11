// Constantes SEO partagées (URL canonique du site, nom, helpers de métadonnées).
// L'URL est configurable par variable d'environnement pour basculer sur un
// domaine propre le jour où il sera choisi (voir seo-audit-report.md §P0.6).
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.SITE_URL ||
  'https://open-library-zeta.vercel.app'
).replace(/\/$/, '')

export const SITE_NAME = 'Open Library'

/** Métadonnées d'une page privée ou non indexable. */
export const NO_INDEX = { index: false, follow: false } as const

/** Métadonnées d'une page privée (titre propre + noindex). */
export function privateMetadata(title: string) {
  return { title, robots: NO_INDEX }
}

/** Construit les métadonnées d'une page publique indexable. */
export function pageMetadata(opts: { title: string; description: string; path: string; index?: boolean }) {
  const canonical = `${SITE_URL}${opts.path}`
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical },
    robots: opts.index === false ? NO_INDEX : undefined,
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: canonical,
      siteName: SITE_NAME,
      locale: 'fr_FR',
      type: 'website' as const,
    },
  }
}
