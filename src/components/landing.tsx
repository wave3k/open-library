'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Search, Sparkles, PenLine, BookOpen, Users, Lock, Loader2, ArrowRight, Flame,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BookCover } from '@/components/book-cover'
import { PublicAPI, GENRES, type Book } from '@/lib/plume'

function BookCard({ book, onOpen }: { book: Book; onOpen: (b: Book) => void }) {
  return (
    <article className="book3d-lift hover-lift group bg-card flex cursor-pointer flex-col gap-3 rounded-2xl border p-4" onClick={() => onOpen(book)}>
      <div className="flex justify-center pt-1">
        <BookCover book={book} title={book.title} author={book.author} genre={book.genre} size="md" />
      </div>
      <div className="min-w-0">
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">{book.genre}</span>
        <h3 className="mt-1.5 truncate font-bold">{book.title}</h3>
        <p className="truncate text-sm text-stone-500">par {book.author}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-500">{book.description || 'Aucune description.'}</p>
        <p className="mt-1.5 text-xs text-stone-400">
          {book.chapter_count ?? 0} chapitre(s) · {book.likes} likes · {book.views} lectures
        </p>
      </div>
    </article>
  )
}

export function Landing() {
  const router = useRouter()
  const [trending, setTrending] = useState<Book[]>([])
  const [query, setQuery] = useState('')
  const [loadingTrending, setLoadingTrending] = useState(true)

  useEffect(() => {
    PublicAPI.trending()
      .then(setTrending)
      .catch(() => {})
      .finally(() => setLoadingTrending(false))
  }, [])

  // Redirige vers la page de recherche (résultats complets)
  const goSearch = (q: string) => {
    const term = q.trim()
    if (!term) return
    router.push(`/recherche?q=${encodeURIComponent(term)}`)
  }

  const openBook = (b: Book) => router.push(`/livres/${b.id}`)
  const signup = () => router.push('/inscription')
  const login = () => router.push('/connexion')

  return (
    <div className="space-y-16 pb-10">
      {/* HERO */}
      <section className="relative grid items-center gap-10 pt-8 lg:grid-cols-2">
        <div>
          <span className="bg-secondary text-secondary-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
            <Sparkles size={13} /> Publier et lire des livres, gratuitement
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Écris ton histoire.
            <br />
            Dévore celle des <span className="text-amber-700">autres.</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-lg text-lg leading-relaxed">
            Open Library est la plateforme gratuite pour <strong>publier</strong> tes livres chapitre par chapitre
            et les <strong>lire</strong> comme de vrais livres. Rejoins la communauté d’auteurs et de lecteurs.
          </p>

          {/* Recherche publique → page de résultats */}
          <form
            onSubmit={(e) => { e.preventDefault(); goSearch(query) }}
            className="relative mt-6 max-w-lg"
            role="search"
          >
            <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un livre, un auteur, un genre…"
              className="h-12 rounded-2xl pl-11 pr-28 text-base"
              aria-label="Rechercher un livre"
            />
            <Button type="submit" className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-xl" disabled={!query.trim()}>
              Rechercher
            </Button>
          </form>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button size="lg" onClick={signup}>Commencer à écrire <ArrowRight size={17} /></Button>
            <Button size="lg" variant="outline" onClick={login}>J’ai déjà un compte</Button>
          </div>
          <p className="text-muted-foreground mt-3 flex items-center gap-1.5 text-xs">
            <Lock size={12} /> La lecture nécessite un compte gratuit — la recherche et les fiches sont libres.
          </p>
        </div>

        <div className="book3d-lift from-card to-muted flex items-end justify-center gap-5 rounded-3xl border bg-gradient-to-b p-8">
          <div className="mb-6 hidden sm:block">
            <BookCover book={{ cover: 'sky', cover_style: { preset: 'sky', emoji: '🚀' } }} title="Orbital" author="Karim Haddad" size="md" />
          </div>
          <div className="animate-float">
            <BookCover book={{ cover: 'indigo', cover_style: { preset: 'indigo', emoji: '✨' } }} title="La Cité des Brumes" author="Léa Moreau" size="lg" />
          </div>
          <div className="mb-6 hidden sm:block">
            <BookCover book={{ cover: 'rose', cover_style: { preset: 'rose', emoji: '❤️' } }} title="Lettres à demain" author="Camille Petit" size="md" />
          </div>
        </div>
      </section>

      {/* Tendances */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-2xl font-bold">
            <Flame size={22} className="text-amber-600" /> Tendances en ce moment
          </h2>
          <Link href="/recherche" className="text-sm font-semibold text-amber-700 hover:underline">Tout parcourir →</Link>
        </div>

        {loadingTrending ? (
          <div className="flex items-center justify-center gap-2 py-16 text-stone-400">
            <Loader2 size={20} className="animate-spin" /> Chargement des tendances…
          </div>
        ) : trending.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-12 text-center">
            <BookOpen size={28} className="mx-auto text-stone-400" />
            <p className="mt-2 font-semibold">Pas encore de livres publiés</p>
            <p className="text-muted-foreground text-sm">Sois le premier à publier une histoire !</p>
          </div>
        ) : (
          <div className="stagger grid gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {trending.slice(0, 8).map((b) => <BookCard key={b.id} book={b} onOpen={openBook} />)}
          </div>
        )}
      </section>

      {/* Genres */}
      <section>
        <h2 className="mb-4 text-2xl font-bold">Tous les genres, tous les goûts</h2>
        <div className="flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => goSearch(g)}
              className="bg-card rounded-full border px-4 py-2 text-sm font-medium hover:bg-stone-50"
            >
              {g}
            </button>
          ))}
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="grid gap-4 md:grid-cols-3">
        {[
          { icon: PenLine, title: 'Écris chapitre par chapitre', text: 'Éditeur riche (gras, italique, titres…), brouillon autosauvegardé, tu ne perds jamais une ligne.' },
          { icon: BookOpen, title: 'Lis comme un vrai livre', text: 'Lettrine, sommaire, thèmes papier/nuit/sépia, progression sauvegardée.' },
          { icon: Users, title: 'Suis tes auteurs favoris', text: 'Abonne-toi, reçois des notifications, découvre ce que lisent les autres.' },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="bg-card rounded-2xl border p-6">
            <span className="bg-secondary text-secondary-foreground flex h-11 w-11 items-center justify-center rounded-xl"><Icon size={20} /></span>
            <h3 className="mt-3 font-bold">{title}</h3>
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{text}</p>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="rounded-3xl bg-stone-900 p-8 text-white sm:p-12">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl"><Sparkles size={24} className="text-amber-400" /> Prêt à publier ton premier livre ?</h2>
            <p className="mt-2 max-w-xl text-stone-300">Crée ton compte gratuitement, écris, publie, et rejoins la communauté Open Library.</p>
          </div>
          <div className="flex shrink-0 gap-3">
            <Button className="bg-amber-500 text-stone-950 hover:bg-amber-400" onClick={signup}>Créer un compte</Button>
            <Button variant="outline" className="border-stone-600 bg-transparent text-white hover:bg-stone-800" onClick={login}>Se connecter</Button>
          </div>
        </div>
      </section>

      <p className="text-muted-foreground text-center text-xs">
        Open Library — <Link href="/inscription" className="underline">Publier et lire des livres gratuitement</Link>
      </p>
    </div>
  )
}
