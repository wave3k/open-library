import { useState } from 'react'
import {
  ArrowLeft, BookOpen, PenLine, Pencil, Trash2, Plus,
  Star, Play, ChevronUp, ChevronDown, Download, FileText,
} from 'lucide-react'
import { bookWords, countWords, readingMinutes } from '../lib/store.js'
import BookCover from './BookCover.jsx'

export default function BookDetail({
  book, onBack, onRead, onResume, onEditBook, onDeleteRequest,
  onAddChapter, onEditChapter, onDeleteRequestChapter,
  onToggleFav, onMoveChapter, onExport,
}) {
  const [showExport, setShowExport] = useState(false)
  const chapters = book.chapters ?? []
  const maxWords = Math.max(1, ...chapters.map((c) => countWords(c.content)))
  const lastIdx = chapters.findIndex((c) => c.id === book.lastRead)

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800">
        <ArrowLeft size={16} /> Retour à la bibliothèque
      </button>

      <div className="book3d-lift flex flex-col gap-6 rounded-2xl border border-stone-200 bg-white p-6 sm:flex-row">
        <div className="mx-auto py-2 pl-2 sm:mx-0">
          <BookCover cover={book.cover} title={book.title} author={book.author} genre={book.genre} size="lg" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">{book.genre}</span>
            <button
              onClick={onToggleFav}
              aria-pressed={!!book.favorite}
              aria-label={book.favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${book.favorite ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-stone-200 text-stone-500 hover:border-amber-300'}`}
            >
              <Star size={13} fill={book.favorite ? 'currentColor' : 'none'} />
              {book.favorite ? 'Favori' : 'Ajouter aux favoris'}
            </button>
          </div>
          <h2 className="mt-2 break-words text-2xl font-bold text-stone-900">{book.title}</h2>
          <p className="text-stone-500">par {book.author}</p>
          <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-stone-600">{book.description || 'Aucune description.'}</p>
          <p className="mt-2 text-xs text-stone-400">
            {chapters.length} chapitre(s) · {bookWords(book).toLocaleString('fr-FR')} mots · ~{readingMinutes(book)} min de lecture
            {lastIdx >= 0 && <span> · Reprise au chapitre {lastIdx + 1}</span>}
          </p>

          {/* Statistique : mots par chapitre */}
          {chapters.length > 0 && (
            <div className="mt-4 max-w-xl rounded-xl bg-stone-50 p-3">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-stone-400">Longueur des chapitres</p>
              <div className="flex h-16 items-end gap-1.5">
                {chapters.map((c, i) => {
                  const w = countWords(c.content)
                  return (
                    <button
                      key={c.id}
                      onClick={() => onRead(c.id)}
                      title={`${c.title} — ${w.toLocaleString('fr-FR')} mots`}
                      className={`min-w-0 flex-1 rounded-t ${i === lastIdx ? 'bg-amber-500' : 'bg-stone-300 hover:bg-amber-400'}`}
                      style={{ height: `${Math.max(8, Math.round((w / maxWords) * 100))}%` }}
                    />
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {lastIdx >= 0 ? (
              <button onClick={onResume} className="flex items-center gap-1.5 rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600">
                <Play size={16} /> Reprendre · ch. {lastIdx + 1}
              </button>
            ) : (
              <button
                onClick={() => onRead(chapters[0]?.id)}
                disabled={!chapters.length}
                className="flex items-center gap-1.5 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-700 disabled:opacity-40"
              >
                <BookOpen size={16} /> Lire comme un livre
              </button>
            )}
            <button onClick={onAddChapter} className="flex items-center gap-1.5 rounded-xl bg-amber-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600">
              <PenLine size={16} /> Écrire un chapitre
            </button>
            <div className="relative">
              <button onClick={() => setShowExport((s) => !s)} className="flex items-center gap-1.5 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium hover:bg-stone-50" aria-haspopup="menu" aria-expanded={showExport}>
                <Download size={15} /> Exporter
              </button>
              {showExport && (
                <div className="absolute left-0 top-12 z-10 w-52 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl" role="menu">
                  <button onClick={() => { onExport('txt'); setShowExport(false) }} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-stone-50" role="menuitem">
                    <FileText size={15} /> Télécharger en .txt
                  </button>
                  <button onClick={() => { onExport('md'); setShowExport(false) }} className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-stone-50" role="menuitem">
                    <FileText size={15} /> Télécharger en .md
                  </button>
                </div>
              )}
            </div>
            <button onClick={onEditBook} className="flex items-center gap-1.5 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium hover:bg-stone-50">
              <Pencil size={15} /> Modifier
            </button>
            <button onClick={onDeleteRequest} className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50">
              <Trash2 size={15} /> Supprimer
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold text-stone-900">Chapitres · {chapters.length}</h3>
          <button onClick={onAddChapter} className="flex items-center gap-1 rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-semibold hover:bg-stone-200">
            <Plus size={13} /> Ajouter
          </button>
        </div>
        {chapters.length === 0 && (
          <p className="py-6 text-center text-sm text-stone-500">Aucun chapitre pour l’instant. Écris le premier !</p>
        )}
        <ol className="divide-y divide-stone-100">
          {chapters.map((ch, i) => (
            <li key={ch.id} className="flex cursor-pointer items-center gap-2.5 py-3 hover:bg-stone-50" onClick={() => onRead(ch.id)}>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${ch.id === book.lastRead ? 'bg-amber-200 text-amber-900' : 'bg-stone-100 text-stone-600'}`}>
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-stone-900">{ch.title || `Chapitre ${i + 1}`}</p>
                <p className="text-xs text-stone-400">
                  {countWords(ch.content).toLocaleString('fr-FR')} mots
                  {ch.id === book.lastRead && <span className="ml-1.5 font-semibold text-amber-700">· en cours</span>}
                </p>
              </div>
              <span className="flex shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                  disabled={i === 0}
                  onClick={() => onMoveChapter(ch.id, -1)}
                  className="rounded p-1.5 text-stone-400 hover:bg-stone-200 disabled:opacity-30"
                  aria-label={`Monter ${ch.title}`}
                  title="Monter"
                >
                  <ChevronUp size={15} />
                </button>
                <button
                  disabled={i === chapters.length - 1}
                  onClick={() => onMoveChapter(ch.id, 1)}
                  className="rounded p-1.5 text-stone-400 hover:bg-stone-200 disabled:opacity-30"
                  aria-label={`Descendre ${ch.title}`}
                  title="Descendre"
                >
                  <ChevronDown size={15} />
                </button>
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onEditChapter(ch.id) }}
                className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-500 hover:bg-stone-200"
              >
                Écrire
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteRequestChapter(ch) }}
                className="shrink-0 rounded-lg px-2 py-1.5 text-stone-300 hover:bg-red-50 hover:text-red-600"
                aria-label={`Supprimer ${ch.title}`}
              >
                <Trash2 size={15} />
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
