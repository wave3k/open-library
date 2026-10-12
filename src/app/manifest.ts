import type { MetadataRoute } from 'next'
import { SITE_NAME } from '@/lib/seo'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Publier et lire des livres gratuitement`,
    short_name: 'Plume',
    description: 'Publie et lis des livres gratuitement. Écris ton histoire chapitre par chapitre et découvre celles des autres.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#b45309',
    lang: 'fr',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
  }
}
