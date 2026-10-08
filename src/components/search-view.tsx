'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, BookOpen, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BookCover } from '@/components/book-cover'
import { BookGridSkeleton } from '@/components/skeleton'
import { PublicAPI, type Book } from '@/lib/plume'

export function SearchView() {
  const router = useRouter()
  const [q, setQ] = useState('')
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const inited = useRef(false)

  const run = useCallback((term: string) => {
    setLoading(true)
    PublicAPI.search(term)
      .then(setBooks)
      .catch(() => setBooks([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (inited.current) return
    inited.current = true
    const term = new URLSearchParams(window.location.search).get('q') || ''
    setQ(term)
    run(term)
  }, [run])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const term = q.trim()
    window.history.replaceState(null, '', term ? `/recherche?q=${encodeURIComponent(term)}` : '/recherche')
    run(term)
  }

  return (
    <div className="space-y-6">
      <button onClick={() => router.push('/')} className="flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800">
        <ArrowLeft size={16} /> Accueil
      </button>

      <div>
        <h1 className="text-2xl font-bold">{q ? `Résultats pour « ${q} »` : 'Parcourir les livres'}</h1>
        <p className="text-muted-foreground text-sm">
          {loading ? 'Recherche…' : `${books.length} livre(s) trouvé(s)`} · la lecture nécessite un compte gratuit
        </p>
      </div>

      <form onSubmit={submit} className="relative max-w-xl" role="search">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Rechercher un titre, un auteur, un genre…"
          className="h-12 rounded-2xl pl-11 pr-28 text-base"
          aria-label="Rechercher un livre"
          autoFocus
        />
        <Button type="submit" className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-xl">Rechercher</Button>
      </form>

      {loading ? (
        <BookGridSkeleton count={8} />
      ) : books.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-12 text-center">
          <BookOpen size={28} className="mx-auto text-stone-400" />
          <p className="mt-2 font-semibold">Aucun livre trouvé</p>
          <p className="text-muted-foreground text-sm">Essaie un autre titre, auteur ou genre.</p>
        </div>
      ) : (
        <div className="stagger grid gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {books.map((b) => (
            <article
              key={b.id}
              className="book3d-lift hover-lift group bg-card flex cursor-pointer flex-col gap-3 rounded-2xl border p-4"
              onClick={() => router.push(`/livres/${b.id}`)}
            >
              <div className="flex justify-center pt-1">
                <BookCover book={b} title={b.title} author={b.author} genre={b.genre} size="md" />
              </div>
              <div className="min-w-0">
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">{b.genre}</span>
                <h3 className="mt-1.5 truncate font-bold">{b.title}</h3>
                <p className="truncate text-sm text-stone-500">par {b.author}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-500">{b.description || 'Aucune description.'}</p>
                <p className="mt-1.5 text-xs text-stone-400">{b.chapter_count ?? 0} chapitre(s) · {b.likes} likes</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
