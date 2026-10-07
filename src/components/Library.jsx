import { useMemo, useState } from 'react'
import { Search, Plus, BookOpen, Star, Play } from 'lucide-react'
import { GENRES } from '../data/seedBooks.js'
import { bookWords, readingMinutes } from '../lib/store.js'
import BookCover from './BookCover.jsx'

const SORTS = [
  { id: 'recent', label: 'Récents' },
  { id: 'az', label: 'A → Z' },
  { id: 'longest', label: 'Plus longs' },
  { id: 'chapters', label: 'Plus de chapitres' },
]

export default function Library({ books, onOpen, onCreate, onDeleteRequest, onToggleFav, onResume }) {
  const [q, setQ] = useState('')
  const [genre, setGenre] = useState('Tous')
  const [sort, setSort] = useState('recent')
  const [onlyFav, setOnlyFav] = useState(false)

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const filtered = books.filter((b) => {
      if (onlyFav && !b.favorite) return false
      if (genre !== 'Tous' && b.genre !== genre) return false
      if (needle && !b.title.toLowerCase().includes(needle) && !b.author.toLowerCase().includes(needle)) return false
      return true
    })
    const arr = [...filtered]
    if (sort === 'az') arr.sort((a, b) => a.title.localeCompare(b.title, 'fr'))
    else if (sort === 'longest') arr.sort((a, b) => bookWords(b) - bookWords(a))
    else if (sort === 'chapters') arr.sort((a, b) => (b.chapters?.length ?? 0) - (a.chapters?.length ?? 0))
    else arr.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
    return arr
  }, [books, q, genre, sort, onlyFav])

  const favCount = books.filter((b) => b.favorite).length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative w-full sm:w-72">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un titre, un auteur…"
            aria-label="Rechercher un livre"
            className="w-full rounded-xl border border-stone-200 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-amber-500"
          />
          {q && (
            <button onClick={() => setQ('')} className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1.5 text-stone-400 hover:text-stone-700" aria-label="Effacer la recherche">
              ×
            </button>
          )}
        </div>
        <select value={genre} onChange={(e) => setGenre(e.target.value)} aria-label="Filtrer par genre" className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm">
          <option>Tous</option>
          {GENRES.map((g) => (
            <option key={g}>{g}</option>
          ))}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Trier les livres" className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm">
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>Tri : {s.label}</option>
          ))}
        </select>
        <button
          onClick={() => setOnlyFav((f) => !f)}
          aria-pressed={onlyFav}
          className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium ${onlyFav ? 'border-amber-600 bg-amber-50 text-amber-800' : 'border-stone-200 bg-white text-stone-500'}`}
        >
          <Star size={15} fill={onlyFav ? 'currentColor' : 'none'} /> Favoris ({favCount})
        </button>
        <button
          onClick={onCreate}
          className="ml-auto flex items-center gap-1.5 rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600"
        >
          <Plus size={16} /> Nouveau livre
        </button>
      </div>

      {books.length > 0 && list.length === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-10 text-center">
          <BookOpen size={28} className="mx-auto text-stone-400" />
          <p className="mt-2 font-semibold text-stone-700">Aucun livre ne correspond</p>
          <p className="text-sm text-stone-500">Modifie la recherche ou les filtres.</p>
          <button onClick={() => { setQ(''); setGenre('Tous'); setOnlyFav(false) }} className="mt-4 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm font-semibold">
            Réinitialiser les filtres
          </button>
        </div>
      )}

      {books.length === 0 && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-10 text-center">
          <BookOpen size={28} className="mx-auto text-stone-400" />
          <p className="mt-2 font-semibold text-stone-700">Ta bibliothèque est vide</p>
          <p className="text-sm text-stone-500">Crée ton premier livre et écris son premier chapitre.</p>
          <button onClick={onCreate} className="mt-4 rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white">
            Créer un livre
          </button>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((b) => {
          const words = bookWords(b)
          const lastIdx = (b.chapters ?? []).findIndex((c) => c.id === b.lastRead)
          const resumeLabel = lastIdx >= 0 ? `Reprendre · ch. ${lastIdx + 1}` : (b.chapters?.length ? 'Commencer' : null)
          return (
            <article
              key={b.id}
              className="book3d-lift group flex cursor-pointer gap-4 rounded-2xl border border-stone-200 bg-white p-4 transition-shadow hover:shadow-lg"
              onClick={() => onOpen(b.id)}
            >
              <div className="py-1 pl-1">
                <BookCover cover={b.cover} title={b.title} author={b.author} genre={b.genre} size="md" />
              </div>
              <div className="min-w-0 flex-1 py-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                    {b.genre}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggleFav(b.id) }}
                    aria-label={b.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    aria-pressed={!!b.favorite}
                    className={`rounded-full p-1 ${b.favorite ? 'text-amber-500' : 'text-stone-300 hover:text-amber-400'}`}
                  >
                    <Star size={15} fill={b.favorite ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <h3 className="mt-1.5 truncate font-bold text-stone-900">{b.title}</h3>
                <p className="truncate text-sm text-stone-500">par {b.author}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-500">{b.description || 'Aucune description.'}</p>
                <p className="mt-2 text-xs text-stone-400">
                  {(b.chapters ?? []).length} chapitre(s) · {words.toLocaleString('fr-FR')} mots · ~{readingMinutes(b)} min
                </p>
                <div className="mt-2.5 flex flex-wrap gap-1.5" onClick={(e) => e.stopPropagation()}>
                  {resumeLabel && (
                    <button
                      onClick={() => onResume(b.id)}
                      className="flex items-center gap-1 rounded-lg bg-amber-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-amber-600"
                    >
                      <Play size={12} /> {resumeLabel}
                    </button>
                  )}
                  <button onClick={() => onOpen(b.id)} className="rounded-lg bg-stone-900 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-stone-700">
                    Fiche
                  </button>
                  <button onClick={() => onDeleteRequest(b)} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-400 hover:bg-red-50 hover:text-red-600">
                    Supprimer
                  </button>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
