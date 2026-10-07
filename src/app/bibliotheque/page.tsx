'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, BookOpen, Star, Play, Globe, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BookCover } from '@/components/book-cover'
import { BookFormDialog } from '@/components/book-form-dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { usePlume } from '@/components/plume-provider'
import { BooksAPI, GENRES, bookWords, readingMinutes, type Book, type BookInput } from '@/lib/plume'

const SORTS = [
  { id: 'recent', label: 'Récents' },
  { id: 'az', label: 'A → Z' },
  { id: 'longest', label: 'Plus longs' },
  { id: 'chapters', label: 'Plus de chapitres' },
] as const

export default function BibliothequePage() {
  const {
    user, mine, explore, loadingBooks, tab, setTab,
    favs, progress, toggleFav, prependMine,
  } = usePlume()
  const router = useRouter()
  const [q, setQ] = useState('')
  const [genre, setGenre] = useState('Tous')
  const [sort, setSort] = useState<(typeof SORTS)[number]['id']>('recent')
  const [onlyFav, setOnlyFav] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [toDelete, setToDelete] = useState<Book | null>(null)

  const books = tab === 'mine' ? mine : explore

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const filtered = books.filter((b) => {
      if (onlyFav && !favs.includes(b.id)) return false
      if (genre !== 'Tous' && b.genre !== genre) return false
      if (needle && !b.title.toLowerCase().includes(needle) && !b.author.toLowerCase().includes(needle)) return false
      return true
    })
    const arr = [...filtered]
    if (sort === 'az') arr.sort((a, b) => a.title.localeCompare(b.title, 'fr'))
    else if (sort === 'longest') arr.sort((a, b) => bookWords(b) - bookWords(a))
    else if (sort === 'chapters') arr.sort((a, b) => (b.chapters?.length ?? 0) - (a.chapters?.length ?? 0))
    else arr.sort((a, b) => (b.updated_at ?? b.created_at ?? '').localeCompare(a.updated_at ?? a.created_at ?? ''))
    return arr
  }, [books, q, genre, sort, onlyFav, favs])

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="font-semibold">Connecte-toi pour voir ta bibliothèque.</p>
        <div className="mt-4 flex justify-center gap-2">
          <a href="/connexion" className={buttonVariants()}>Se connecter</a>
          <a href="/inscription" className={buttonVariants({ variant: 'outline' })}>Créer un compte</a>
        </div>
      </div>
    )
  }

  const createBook = async (data: BookInput) => {
    try {
      const created = await BooksAPI.create({ ...data, is_public: true })
      prependMine(created)
      toast.success('Livre créé — écris ton premier chapitre !')
      router.push(`/livres/${created.id}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Création impossible.')
      throw err
    }
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    try {
      await BooksAPI.remove(toDelete.id)
      toast.success('Livre supprimé')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Suppression impossible.')
    } finally {
      setToDelete(null)
    }
  }

  const resumeBook = (id: string) => {
    const b = [...mine, ...explore].find((x) => x.id === id)
    if (!b) return
    const target = (b.chapters ?? []).some((c) => c.id === progress[id]) ? progress[id] : b.chapters?.[0]?.id
    if (target) router.push(`/livres/${id}/lire/${target}`)
    else router.push(`/livres/${id}`)
  }

  const favCount = books.filter((b) => favs.includes(b.id)).length

  return (
    <div className="space-y-5">
      <div className="bg-card flex w-fit rounded-xl p-1 shadow-sm">
        <button onClick={() => setTab('mine')} className={`rounded-lg px-5 py-2 text-sm font-semibold ${tab === 'mine' ? 'bg-stone-900 text-white' : 'text-stone-500'}`}>
          Mes livres ({mine.length})
        </button>
        <button onClick={() => setTab('explore')} className={`flex items-center gap-1.5 rounded-lg px-5 py-2 text-sm font-semibold ${tab === 'explore' ? 'bg-stone-900 text-white' : 'text-stone-500'}`}>
          <Globe size={14} /> Explorer ({explore.length})
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un titre, un auteur…" aria-label="Rechercher un livre" className="pl-9 pr-8" />
          {q && (
            <button onClick={() => setQ('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1.5 text-stone-400 hover:text-stone-700" aria-label="Effacer la recherche">×</button>
          )}
        </div>
        <Select value={genre} onValueChange={(v) => setGenre(v ?? 'Tous')}>
          <SelectTrigger className="w-36" aria-label="Filtrer par genre"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Tous">Tous genres</SelectItem>
            {GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={(v) => setSort((v ?? 'recent') as typeof sort)}>
          <SelectTrigger className="w-40" aria-label="Trier les livres"><SelectValue /></SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => <SelectItem key={s.id} value={s.id}>Tri : {s.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <button
          onClick={() => setOnlyFav((f) => !f)}
          aria-pressed={onlyFav}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium ${onlyFav ? 'border-amber-600 bg-amber-50 text-amber-800' : 'border-stone-200 bg-white text-stone-500'}`}
        >
          <Star size={15} fill={onlyFav ? 'currentColor' : 'none'} /> Favoris ({favCount})
        </button>
        {tab === 'mine' && (
          <Button onClick={() => setShowCreate(true)} className="ml-auto">
            <Plus size={16} /> Nouveau livre
          </Button>
        )}
      </div>

      {tab === 'explore' && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          Livres publiés par la communauté. Ouvre un livre pour le lire — seuls les propriétaires peuvent les modifier.
        </p>
      )}

      {loadingBooks && books.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-20 text-stone-500">
          <Loader2 size={20} className="animate-spin" /> Chargement de ta bibliothèque…
        </div>
      ) : (
        <>
          {books.length > 0 && list.length === 0 && (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-10 text-center">
              <BookOpen size={28} className="mx-auto text-stone-400" />
              <p className="mt-2 font-semibold text-stone-700">Aucun livre ne correspond</p>
              <p className="text-sm text-stone-500">Modifie la recherche ou les filtres.</p>
              <Button variant="outline" className="mt-4" onClick={() => { setQ(''); setGenre('Tous'); setOnlyFav(false) }}>
                Réinitialiser les filtres
              </Button>
            </div>
          )}

          {tab === 'mine' && books.length === 0 && (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-10 text-center">
              <BookOpen size={28} className="mx-auto text-stone-400" />
              <p className="mt-2 font-semibold text-stone-700">Tu n’as pas encore de livre</p>
              <p className="text-sm text-stone-500">Crée ton premier livre et écris son premier chapitre.</p>
              <Button className="mt-4" onClick={() => setShowCreate(true)}>Créer un livre</Button>
            </div>
          )}

          {tab === 'explore' && books.length === 0 && (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-10 text-center">
              <Globe size={28} className="mx-auto text-stone-400" />
              <p className="mt-2 font-semibold text-stone-700">Rien à explorer pour l’instant</p>
              <p className="text-sm text-stone-500">Aucun livre public d’autres auteurs. Sois le premier à publier !</p>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((b) => {
              const words = bookWords(b)
              const isFav = favs.includes(b.id)
              const lastIdx = (b.chapters ?? []).findIndex((c) => c.id === progress[b.id])
              const resumeLabel = lastIdx >= 0 ? `Reprendre · ch. ${lastIdx + 1}` : (b.chapters?.length ? 'Commencer' : null)
              return (
                <article
                  key={b.id}
                  className="book3d-lift group bg-card flex cursor-pointer gap-4 rounded-2xl border p-4 transition-shadow hover:shadow-lg"
                  onClick={() => router.push(`/livres/${b.id}`)}
                >
                  <div className="py-1 pl-1">
                    <BookCover book={b} title={b.title} author={b.author} genre={b.genre} size="md" />
                  </div>
                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">{b.genre}</span>
                      {!b.is_public && tab === 'mine' && (
                        <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[11px] font-semibold text-stone-600">Privé</span>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleFav(b.id) }}
                        aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                        aria-pressed={isFav}
                        className={`rounded-full p-1 ${isFav ? 'text-amber-500' : 'text-stone-300 hover:text-amber-400'}`}
                      >
                        <Star size={15} fill={isFav ? 'currentColor' : 'none'} />
                      </button>
                    </div>
                    <h3 className="mt-1.5 truncate font-bold">{b.title}</h3>
                    <p className="truncate text-sm text-stone-500">
                      par {b.author}
                      {b.owner_name && tab === 'explore' && <span> · publié par {b.owner_name}</span>}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-500">{b.description || 'Aucune description.'}</p>
                    <p className="mt-2 text-xs text-stone-400">
                      {(b.chapters ?? []).length} chapitre(s) · {words.toLocaleString('fr-FR')} mots · ~{readingMinutes(b)} min
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {resumeLabel && (
                        <button onClick={() => resumeBook(b.id)} className="flex items-center gap-1 rounded-lg bg-amber-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-600">
                          <Play size={12} /> {resumeLabel}
                        </button>
                      )}
                      <button onClick={() => router.push(`/livres/${b.id}`)} className="rounded-lg bg-stone-900 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-stone-700">
                        Fiche
                      </button>
                      {tab === 'mine' && (
                        <button onClick={() => setToDelete(b)} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-400 hover:bg-red-50 hover:text-red-600">
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </>
      )}

      <BookFormDialog open={showCreate} initial={null} onClose={() => setShowCreate(false)} onSave={createBook} />

      <ConfirmDialog
        open={!!toDelete}
        title={toDelete ? `Supprimer « ${toDelete.title} » ?` : ''}
        message={toDelete ? `Le livre et ses ${(toDelete.chapters ?? []).length} chapitre(s) seront définitivement supprimés.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
