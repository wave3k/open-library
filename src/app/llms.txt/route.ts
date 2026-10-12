import { SITE_URL } from '@/lib/seo'

// llms.txt : contexte du site pour les moteurs IA. Généré depuis SITE_URL pour
// suivre automatiquement le domaine courant (pas d'URL en dur).
export function GET() {
  const body = `# Plume

> Plateforme française gratuite pour écrire, publier et lire des livres en ligne, chapitre par chapitre. Publier y est gratuit et l'auteur conserve ses droits.

Plume permet de créer un livre, d'écrire ses chapitres dans un éditeur en ligne, de le publier publiquement et de le faire lire. Les lecteurs suivent des auteurs, commentent et reçoivent des recommandations. La lecture nécessite un compte gratuit ; l'exploration des livres et les fiches sont publiques.

## Services
- [Publier un livre gratuitement](${SITE_URL}/publier-un-livre) : créer et publier un livre sans frais
- [Écrire un livre en ligne](${SITE_URL}/ecrire-un-livre) : guide des outils gratuits, éditeur par chapitres
- [Alternative à Wattpad](${SITE_URL}/alternative-wattpad) : comparatif pour un auteur francophone

## Explorer
- [Rechercher des livres](${SITE_URL}/recherche) : catalogue public par genre et popularité
- [Livres de romance](${SITE_URL}/genre/romance)
- [Livres fantastiques](${SITE_URL}/genre/fantastique)
- [Science-Fiction](${SITE_URL}/genre/science-fiction)

## À propos
- Plume est un projet indépendant conçu par HQStudio. [À COMPLÉTER : contact, mentions légales]

## Optional
- [Créer un compte](${SITE_URL}/inscription) : inscription gratuite
`
  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  })
}
