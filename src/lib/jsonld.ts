// Générateurs JSON-LD (schema.org) — source unique pour les données structurées.
import { SITE_URL, SITE_NAME } from './seo'

type BookLike = {
  id: string
  title: string
  author: string
  genre?: string
  description?: string
  created_at?: string
  updated_at?: string
  owner_id?: string
  owner?: { username?: string }
  chapters?: unknown[]
}

/** Livre : alimente les résultats enrichis « Livre » et la compréhension par les IA. */
export function bookJsonLd(book: BookLike) {
  const url = `${SITE_URL}/livres/${book.id}`
  const author = book.owner?.username
    ? { '@type': 'Person', name: book.author, url: `${SITE_URL}/u/${book.owner.username}` }
    : { '@type': 'Person', name: book.author }
  return {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author,
    inLanguage: 'fr',
    ...(book.genre ? { genre: book.genre } : {}),
    ...(book.description ? { description: book.description.slice(0, 500) } : {}),
    ...(book.created_at ? { datePublished: book.created_at } : {}),
    ...(book.updated_at ? { dateModified: book.updated_at } : {}),
    bookFormat: 'https://schema.org/EBook',
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    url,
  }
}

/** Profil : page de profil + personne (entité auteur). */
export function profileJsonLd(p: {
  username: string
  displayName: string
  bio?: string
  avatarImage?: string
}) {
  const url = `${SITE_URL}/u/${p.username}`
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    url,
    mainEntity: {
      '@type': 'Person',
      name: p.displayName,
      alternateName: `@${p.username}`,
      url,
      ...(p.bio ? { description: p.bio.slice(0, 300) } : {}),
      ...(p.avatarImage ? { image: p.avatarImage } : {}),
    },
  }
}

/** Fil d'Ariane (liste d'éléments ordonnés). */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  }
}

/** Identité du site : Organization + WebSite avec recherche. */
export function siteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/icon.svg`,
      },
      {
        '@type': 'WebSite',
        name: SITE_NAME,
        url: SITE_URL,
        inLanguage: 'fr',
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/recherche?q={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  }
}

/** FAQ : questions/réponses réellement visibles sur la page. */
export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  }
}
