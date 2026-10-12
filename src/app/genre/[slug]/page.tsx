import Link from 'next/link'
import type { Metadata } from 'next'
import { BookCover } from '@/components/book-cover'
import { JsonLd } from '@/components/json-ld'
import { pageMetadata, SITE_URL, SITE_NAME, NO_INDEX } from '@/lib/seo'
import { breadcrumbJsonLd } from '@/lib/jsonld'
import { fetchSearchBooks } from '@/lib/server-api'
import { GENRES } from '@/lib/plume'
import { genreSlug, genreFromSlug } from '@/lib/genres'

// Pages piliers par genre : rendues côté serveur, statiques, maillées entre elles.
export function generateStaticParams() {
  return GENRES.map((g) => ({ slug: genreSlug(g) }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const genre = genreFromSlug(slug)
  if (!genre) return { title: 'Genre introuvable — Open Library', robots: NO_INDEX }
  return pageMetadata({
    title: `Livres de ${genre} à lire gratuitement | Open Library`,
    description: `Découvre des livres de ${genre} à lire en ligne gratuitement sur Open Library. Histoires de la communauté, classées par popularité et nouveauté.`,
    path: `/genre/${slug}`,
  })
}

export default async function GenrePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const genre = genreFromSlug(slug)

  if (!genre) {
    return (
      <div className="space-y-6 py-10">
        <h1 className="text-2xl font-bold">Ce genre n’existe pas</h1>
        <p className="text-muted-foreground">Choisis un genre parmi ceux disponibles :</p>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <Link key={g} href={`/genre/${genreSlug(g)}`} className="bg-card rounded-full border px-4 py-2 text-sm font-medium hover:bg-stone-50">
              {g}
            </Link>
          ))}
        </div>
        <Link href="/recherche" className="inline-block rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800">
          Voir tous les livres
        </Link>
      </div>
    )
  }

  const books = await fetchSearchBooks('', genre)
  const others = GENRES.filter((g) => g !== genre).slice(0, 12)

  return (
    <div className="space-y-8 py-4">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `Livres de ${genre}`,
          url: `${SITE_URL}/genre/${slug}`,
          inLanguage: 'fr',
          isPartOf: { '@type': 'WebSite', url: SITE_URL, name: SITE_NAME },
        }}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Accueil', path: '/' },
          { name: 'Explorer', path: '/recherche' },
          { name: genre, path: `/genre/${slug}` },
        ])}
      />

      <nav aria-label="Fil d’Ariane" className="text-muted-foreground text-sm">
        <Link href="/" className="hover:text-amber-700">Accueil</Link>
        <span className="mx-1.5">›</span>
        <Link href="/recherche" className="hover:text-amber-700">Explorer</Link>
        <span className="mx-1.5">›</span>
        <span className="text-stone-700 dark:text-stone-200">{genre}</span>
      </nav>

      <header>
        <h1 className="text-3xl font-bold tracking-tight">Livres de {genre} à lire gratuitement</h1>
        <p className="text-muted-foreground mt-3 max-w-2xl leading-relaxed">
          Une sélection de livres de <strong>{genre}</strong> publiés sur Open Library, lisibles en ligne et
          gratuitement. Écris aussi les tiens, chapitre par chapitre.
        </p>
      </header>

      {books.length === 0 ? (
        <p className="rounded-2xl border border-dashed p-10 text-center text-sm text-stone-500">
          Aucun livre publié dans ce genre pour l’instant. Sois le premier à en écrire un !
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {books.map((b) => (
            <Link key={b.id} href={`/livres/${b.id}`} className="group">
              <div className="transition-transform duration-300 group-hover:-translate-y-1">
                <BookCover book={b} title={b.title} author={b.author} genre={b.genre} size="md" />
              </div>
              <p className="mt-3 truncate text-sm font-semibold group-hover:text-amber-700">{b.title}</p>
              <p className="truncate text-xs text-stone-500">{b.author}</p>
            </Link>
          ))}
        </div>
      )}

      <section>
        <h2 className="text-lg font-bold">Explorer d’autres genres</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {others.map((g) => (
            <Link
              key={g}
              href={`/genre/${genreSlug(g)}`}
              className="bg-card rounded-full border px-4 py-2 text-sm font-medium hover:bg-stone-50"
            >
              {g}
            </Link>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/recherche" className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-800">
          Voir tous les livres
        </Link>
        <Link href="/inscription" className="rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold hover:bg-stone-50">
          Publier mon livre
        </Link>
      </div>
    </div>
  )
}
