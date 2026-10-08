'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, BookOpen, Star, Play, Globe, Sparkles, Heart, Eye, MessageSquare, BookMarked, CheckCircle2 } from 'lucide-react'
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
import { ConfirmDialog } from '@/components/confirm-dialog'
import { BookGridSkeleton } from '@/components/skeleton'
import { usePlume } from '@/components/plume-provider'
import { BooksAPI, ReadingAPI, GENRES, bookWords, type Book, type ReadingBook } from '@/lib/plume'

const SORTS = [
  { id: 'recent', label: 'Récents' },
  { id: 'az', label: 'A → Z' },
  { id: 'longest', label: 'Plus longs' },
  { id: 'chapters', label: 'Plus de chapitres' },
] as const

type Tab = 'for-you' | 'mine' | 'explore' | 'lectures'

function chapterCount(b: Book) {
  return b.chapter_count ?? (b.chapters?.length ?? 0)
}

export default function BibliothequePage() {
  const {
    user, mine, explore, recommended, loadingBooks, tab, setTab,
    favs, progress, toggleFav,
  } = usePlume()
  const router = useRouter()
  const [q, setQ] = useState('')
  const [genre, setGenre] = useState('Tous')
  const [sort, setSort] = useState<(typeof SORTS)[number]['id']>('recent')
  const [onlyFav, setOnlyFav] = useState(false)
  const [toDelete, setToDelete] = useState<Book | null>(null)
  const [reading, setReading] = useState<ReadingBook[]>([])
  const [loadingReading, setLoadingReading] = useState(false)
  const activeTab = tab as Tab

  useEffect(() => {
    if (activeTab !== 'lectures' || !user) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingReading(true)
    ReadingAPI.list()
      .then(setReading)
      .catch(() => setReading([]))
      .finally(() => setLoadingReading(false))
  }, [activeTab, user])

  const sourceBooks: Book[] = useMemo(
    () => (activeTab === 'mine' ? mine : activeTab === 'explore' ? explore : activeTab === 'for-you' ? recommended.map((r) => r.book) : []),
    [activeTab, mine, explore, recommended]
  )

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const filtered = sourceBooks.filter((b) => {
      if (onlyFav && !favs.includes(b.id)) return false
      if (genre !== 'Tous' && b.genre !== genre) return false
      if (needle && !b.title.toLowerCase().includes(needle) && !b.author.toLowerCase().includes(needle)) return false
      return true
    })
    const arr = [...filtered]
    if (sort === 'az') arr.sort((a, b) => a.title.localeCompare(b.title, 'fr'))
    else if (sort === 'longest') arr.sort((a, b) => bookWords(b) - bookWords(a))
    else if (sort === 'chapters') arr.sort((a, b) => chapterCount(b) - chapterCount(a))
    else if (activeTab !== 'for-you') arr.sort((a, b) => (b.updated_at ?? b.created_at ?? '').localeCompare(a.updated_at ?? a.created_at ?? ''))
    return arr
  }, [sourceBooks, q, genre, sort, onlyFav, favs, activeTab])

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
    const b = [...mine, ...explore, ...recommended.map((r) => r.book)].find((x) => x.id === id)
    if (!b) return
    const target = (b.chapters ?? []).some((c) => c.id === progress[id]) ? progress[id] : b.chapters?.[0]?.id
    if (target) router.push(`/livres/${id}/lire/${target}`)
    else router.push(`/livres/${id}`)
  }

  const favCount = sourceBooks.filter((b) => favs.includes(b.id)).length

  const TABS: { id: Tab; label: string; icon?: typeof Globe; count?: number }[] = [
    { id: 'for-you', label: 'Pour toi', icon: Sparkles },
    { id: 'lectures', label: 'Lectures', icon: BookMarked, count: reading.length },
    { id: 'mine', label: 'Mes livres', count: mine.length },
    { id: 'explore', label: 'Explorer', icon: Globe, count: explore.length },
  ]

  const inProgress = reading.filter((b) => !b.finished)
  const finished = reading.filter((b) => b.finished)

  const renderCard = (b: Book, extra?: { reason?: string; chaptersRead?: number; finished?: boolean }) => {
    const isFav = favs.includes(b.id)
    const lastIdx = (b.chapters ?? []).findIndex((c) => c.id === progress[b.id])
    const resumeLabel = lastIdx >= 0 ? `Reprendre · ch. ${lastIdx + 1}` : (chapterCount(b) ? 'Commencer' : null)
    const readPct = extra && chapterCount(b) > 0 ? Math.round(((extra.chaptersRead ?? 0) / chapterCount(b)) * 100) : 0
    return (
      <article key={b.id} className="book3d-lift hover-lift group bg-card flex cursor-pointer gap-4 rounded-2xl border p-4" onClick={() => router.push(`/livres/${b.id}`)}>
        <div className="py-1 pl-1">
          <BookCover book={b} title={b.title} author={b.author} genre={b.genre} size="md" />
        </div>
        <div className="min-w-0 flex-1 py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">{b.genre}</span>
            {chapterCount(b) === 0 ? (
              <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[11px] font-semibold text-stone-600">Brouillon</span>
            ) : !b.is_public && activeTab === 'mine' ? (
              <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[11px] font-semibold text-stone-600">Privé</span>
            ) : null}
            <button onClick={(e) => { e.stopPropagation(); toggleFav(b.id) }} aria-label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'} aria-pressed={isFav} className={`rounded-full p-1 ${isFav ? 'text-amber-500' : 'text-stone-300 hover:text-amber-400'}`}>
              <Star size={15} fill={isFav ? 'currentColor' : 'none'} />
            </button>
          </div>
          <h3 className="mt-1.5 truncate font-bold">{b.title}</h3>
          <p className="truncate text-sm text-stone-500">
            par {b.author}
            {b.owner_name && activeTab !== 'mine' && <span> · publié par {b.owner_name}</span>}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-500">{b.description || 'Aucune description.'}</p>
          {extra?.reason && (
            <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
              <Sparkles size={11} /> {extra.reason}
            </p>
          )}
          {activeTab === 'lectures' && chapterCount(b) > 0 && (
            <div className="mt-2">
              <div className="h-1.5 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
                <div className={`h-full rounded-full ${extra?.finished ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${extra?.finished ? 100 : readPct}%` }} />
              </div>
              <p className="mt-1 text-[11px] text-stone-400">
                {extra?.finished ? 'Terminé' : `${extra?.chaptersRead ?? 0}/${chapterCount(b)} chapitre(s) lus`}
              </p>
            </div>
          )}
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-400">
            <span>{chapterCount(b)} chapitre(s)</span>
            <span className="inline-flex items-center gap-1"><Eye size={12} /> {b.views}</span>
            <span className="inline-flex items-center gap-1"><Heart size={12} /> {b.likes}</span>
            <span className="inline-flex items-center gap-1"><MessageSquare size={12} /> {b.comments}</span>
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
            {activeTab === 'mine' && (
              <button onClick={() => setToDelete(b)} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-400 hover:bg-red-50 hover:text-red-600">
                Supprimer
              </button>
            )}
          </div>
        </div>
      </article>
    )
  }

  return (
    <div className="space-y-5">
      <div className="bg-card flex w-fit flex-wrap rounded-xl p-1 shadow-sm">
        {TABS.map(({ id, label, icon: Icon, count }) => (
          <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${activeTab === id ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-800'}`}>
            {Icon && <Icon size={14} />} {label}{typeof count === 'number' ? ` (${count})` : ''}
          </button>
        ))}
      </div>

      {activeTab !== 'lectures' && (
        <>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative w-full sm:w-72">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un titre, un auteur…" aria-label="Rechercher un livre" className="pl-9 pr-8" />
              {q && <button onClick={() => setQ('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1.5 text-stone-400 hover:text-stone-700" aria-label="Effacer la recherche">×</button>}
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
            <button onClick={() => setOnlyFav((f) => !f)} aria-pressed={onlyFav} className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium ${onlyFav ? 'border-amber-600 bg-amber-50 text-amber-800' : 'border-stone-200 bg-white text-stone-500'}`}>
              <Star size={15} fill={onlyFav ? 'currentColor' : 'none'} /> Favoris ({favCount})
            </button>
            {activeTab === 'mine' && (
              <Button onClick={() => router.push('/livres/nouveau')} className="ml-auto">
                <Plus size={16} /> Nouveau livre
              </Button>
            )}
          </div>

          {loadingBooks && sourceBooks.length === 0 ? (
            <BookGridSkeleton count={6} />
          ) : (
            <>
              {activeTab !== 'for-you' && sourceBooks.length > 0 && list.length === 0 && (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-10 text-center">
                  <BookOpen size={28} className="mx-auto text-stone-400" />
                  <p className="mt-2 font-semibold text-stone-700">Aucun livre ne correspond</p>
                  <Button variant="outline" className="mt-4" onClick={() => { setQ(''); setGenre('Tous'); setOnlyFav(false) }}>Réinitialiser les filtres</Button>
                </div>
              )}
              {activeTab === 'mine' && sourceBooks.length === 0 && (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-10 text-center">
                  <BookOpen size={28} className="mx-auto text-stone-400" />
                  <p className="mt-2 font-semibold text-stone-700">Tu n’as pas encore de livre</p>
                  <Button className="mt-4" onClick={() => router.push('/livres/nouveau')}>Créer un livre</Button>
                </div>
              )}
              {activeTab === 'for-you' && recommended.length === 0 && (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-10 text-center">
                  <Sparkles size={28} className="mx-auto text-stone-400" />
                  <p className="mt-2 font-semibold text-stone-700">Pas encore de recommandations</p>
                  <p className="text-sm text-stone-500">Ajoute des genres préférés à ton profil, ou explore quelques livres.</p>
                  <Button variant="outline" className="mt-4" onClick={() => router.push('/profil')}>Compléter mon profil</Button>
                </div>
              )}
              {activeTab === 'explore' && sourceBooks.length === 0 && (
                <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-10 text-center">
                  <Globe size={28} className="mx-auto text-stone-400" />
                  <p className="mt-2 font-semibold text-stone-700">Rien à explorer pour l’instant</p>
                </div>
              )}

              <div className="stagger grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((b) => renderCard(b, activeTab === 'for-you' ? { reason: recommended.find((r) => r.book.id === b.id)?.reason } : undefined))}
              </div>
            </>
          )}
        </>
      )}

      {activeTab === 'lectures' && (
        loadingReading ? (
          <BookGridSkeleton count={4} />
        ) : reading.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-10 text-center">
            <BookMarked size={28} className="mx-auto text-stone-400" />
            <p className="mt-2 font-semibold text-stone-700">Aucune lecture pour l’instant</p>
            <p className="text-sm text-stone-500">Les livres que tu commences apparaîtront ici.</p>
            <Button variant="outline" className="mt-4" onClick={() => setTab('explore')}>Explorer des livres</Button>
          </div>
        ) : (
          <div className="space-y-8">
            {inProgress.length > 0 && (
              <section>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><BookOpen size={18} className="text-amber-600" /> En cours ({inProgress.length})</h2>
                <div className="stagger grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {inProgress.map((b) => renderCard(b, { chaptersRead: b.chapters_read, finished: false }))}
                </div>
              </section>
            )}
            {finished.length > 0 && (
              <section>
                <h2 className="mb-3 flex items-center gap-2 text-lg font-bold"><CheckCircle2 size={18} className="text-emerald-600" /> Terminés ({finished.length})</h2>
                <div className="stagger grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {finished.map((b) => renderCard(b, { chaptersRead: b.chapters_read, finished: true }))}
                </div>
              </section>
            )}
          </div>
        )
      )}

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
