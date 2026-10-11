import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

// robots.txt : on autorise le crawl et l'indexation, y compris des bots IA
// (GPTBot, PerplexityBot, ClaudeBot, Google-Extended, Bingbot ne sont pas
// bloqués : on veut être cité). Seules les pages privées/outils sont exclues.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/bibliotheque',
          '/notifications',
          '/parametres',
          '/profil',
          '/onboarding',
          '/connexion',
          '/inscription',
          '/livres/nouveau',
          '/livres/*/ecrire',
          '/livres/*/lire',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
