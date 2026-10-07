'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, BookOpen, PenLine, Pencil, Trash2, Plus,
  Star, Play, ChevronUp, ChevronDown, Download, FileText, Globe, Lock, Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { BookCover } from '@/components/book-cover'
import { BookFormDialog } from '@/components/book-form-dialog'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { usePlume } from '@/components/plume-provider'
import { BooksAPI, bookWords, countWords, readingMinutes, type BookInput, type Chapter } from '@/lib/plume'
import { exportBook } from '@/lib/export'

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const {
    user, mine, explore, favs, progress,
    toggleFav, applyBook, dropBook, markProgress, loadingBooks,
  } = usePlume()
  const [showEdit, setShowEdit] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [toDeleteBook, setToDeleteBook] = useState(false)
  const [toDeleteCh, setToDeleteCh] = useState<Chapter | null>(null)

  const book = [...mine, ...explore].find((b) => b.id === id) ?? null

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="font-semibold">Connecte-toi pour voir ce livre.</p>
        <a href="/connexion" className={buttonVariants({ className: 'mt-4' })}>Se connecter</a>
      </div>
    )
  }
  // Livres pas encore chargés : ne pas annoncer « introuvable » à tort
  if (!book && loadingBooks) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-stone-500">
        <Loader2 size={20} className="animate-spin" /> Chargement du livre…
      </div>
    )
  }
  if (!book) {
    return (
      <div className="py-20 text-center">
        <p className="font-semibold">Livre introuvable.</p>
        <a href="/bibliotheque" className={buttonVariants({ variant: 'outline', className: 'mt-4' })}>Retour à la bibliothèque</a>
      </div>
    )
  }

  const isOwner = book.owner_id === user.id
  const isFav = favs.includes(book.id)
  const chapters = book.chapters ?? []
  const maxWords = Math.max(1, ...chapters.map((c) => countWords(c.content)))
  const lastIdx = chapters.findIndex((c) => c.id === progress[book.id])

  const readChapter = (chId: string | undefined) => {
    const target = chId ?? chapters[0]?.id
    if (!target) return
    markProgress(book.id, target)
    router.push(`/livres/${book.id}/lire/${target}`)
  }

  const saveEdit = async (data: BookInput) => {
    try {
      applyBook(await BooksAPI.update(book.id, data))
      toast.success('Livre mis à jour')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Mise à jour impossible.')
      throw err
    }
  }

  const doDeleteBook = async () => {
    try {
      await BooksAPI.remove(book.id)
      dropBook(book.id)
      toast.success('Livre supprimé')
      router.push('/bibliotheque')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Suppression impossible.')
    } finally {
      setToDeleteBook(false)
    }
  }

  const moveChapter = async (chId: string, dir: -1 | 1) => {
    const arr = [...chapters]
    const i = arr.findIndex((c) => c.id === chId)
    const j = i + dir
    if (i < 0 || j < 0 || j >= arr.length) return
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    try {
      applyBook(await BooksAPI.reorder(book.id, arr.map((c) => c.id)))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Déplacement impossible.')
    }
  }

  return (
    <div className="space-y-5">
      <button onClick={() => router.push('/bibliotheque')} className="flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800">
        <ArrowLeft size={16} /> Retour à la bibliothèque
      </button>

      <div className="book3d-lift bg-card flex flex-col gap-6 rounded-2xl border p-6 sm:flex-row">
        <div className="mx-auto py-2 pl-2 sm:mx-0">
          <BookCover cover={book.cover} title={book.title} author={book.author} genre={book.genre} size="lg" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">{book.genre}</span>
            {isOwner ? (
              <button
                onClick={async () => {
                  try {
                    const updated = await BooksAPI.update(book.id, { is_public: !book.is_public })
                    applyBook(updated)
                    toast.success(updated.is_public ? 'Livre publié — visible par tout le monde' : 'Livre passé en privé')
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : 'Action impossible.')
                  }
                }}
                title={book.is_public ? 'Visible par tout le monde — cliquer pour passer en privé' : 'Privé — cliquer pour publier'}
                className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${book.is_public ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-stone-300 bg-stone-100 text-stone-600'}`}
              >
                {book.is_public ? <Globe size={13} /> : <Lock size={13} />}
                {book.is_public ? 'Public' : 'Privé'}
              </button>
            ) : (
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <Globe size={13} /> Public
              </span>
            )}
            <button
              onClick={() => toggleFav(book.id)}
              aria-pressed={isFav}
              className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${isFav ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-stone-200 text-stone-500 hover:border-amber-300'}`}
            >
              <Star size={13} fill={isFav ? 'currentColor' : 'none'} />
              {isFav ? 'Favori' : 'Ajouter aux favoris'}
            </button>
          </div>
          <h2 className="mt-2 break-words text-2xl font-bold">{book.title}</h2>
          <p className="text-stone-500">
            par {book.author}
            {book.owner_name && !isOwner && <span> · publié par {book.owner_name}</span>}
          </p>
          <p className="mt-3 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-stone-600">{book.description || 'Aucune description.'}</p>
          <p className="mt-2 text-xs text-stone-400">
            {chapters.length} chapitre(s) · {bookWords(book).toLocaleString('fr-FR')} mots · ~{readingMinutes(book)} min de lecture
            {lastIdx >= 0 && <span> · Reprise au chapitre {lastIdx + 1}</span>}
          </p>

          {chapters.length > 0 && (
            <div className="mt-4 max-w-xl rounded-xl bg-stone-50 p-3">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-stone-400">Longueur des chapitres</p>
              <div className="flex h-16 items-end gap-1.5">
                {chapters.map((c) => {
                  const w = countWords(c.content)
                  return (
                    <button
                      key={c.id}
                      onClick={() => readChapter(c.id)}
                      title={`${c.title} — ${w.toLocaleString('fr-FR')} mots`}
                      className={`min-w-0 flex-1 rounded-t ${c.id === progress[book.id] ? 'bg-amber-500' : 'bg-stone-300 hover:bg-amber-400'}`}
                      style={{ height: `${Math.max(8, Math.round((w / maxWords) * 100))}%` }}
                    />
                  )
                })}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {lastIdx >= 0 ? (
              <Button onClick={() => readChapter(progress[book.id])}>
                <Play size={16} /> Reprendre · ch. {lastIdx + 1}
              </Button>
            ) : (
              <Button onClick={() => readChapter(chapters[0]?.id)} disabled={!chapters.length}>
                <BookOpen size={16} /> Lire comme un livre
              </Button>
            )}
            {isOwner && (
              <>
                <Button onClick={() => router.push(`/livres/${book.id}/ecrire`)}>
                  <PenLine size={16} /> Écrire un chapitre
                </Button>
                <Button variant="outline" onClick={() => setShowEdit(true)}>
                  <Pencil size={15} /> Modifier
                </Button>
                <Button variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-600" onClick={() => setToDeleteBook(true)}>
                  <Trash2 size={15} /> Supprimer
                </Button>
              </>
            )}
            <div className="relative">
              <Button variant="outline" onClick={() => setShowExport((s) => !s)} aria-haspopup="menu" aria-expanded={showExport}>
                <Download size={15} /> Exporter
              </Button>
              {showExport && (
                <div className="bg-card absolute left-0 top-12 z-10 w-52 overflow-hidden rounded-xl border shadow-xl" role="menu">
                  {(['txt', 'md'] as const).map((fmt) => (
                    <button
                      key={fmt}
                      onClick={() => { exportBook(book, fmt); toast.success(`Livre exporté en .${fmt}`); setShowExport(false) }}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm hover:bg-stone-50"
                      role="menuitem"
                    >
                      <FileText size={15} /> Télécharger en .{fmt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold">Chapitres · {chapters.length}</h3>
          {isOwner && (
            <Button variant="secondary" size="sm" onClick={() => router.push(`/livres/${book.id}/ecrire`)}>
              <Plus size={13} /> Ajouter
            </Button>
          )}
        </div>
        {chapters.length === 0 && (
          <p className="py-6 text-center text-sm text-stone-500">
            {isOwner ? 'Aucun chapitre pour l’instant. Écris le premier !' : 'Ce livre n’a pas encore de chapitre.'}
          </p>
        )}
        <ol className="divide-y divide-stone-100">
          {chapters.map((ch, i) => (
            <li key={ch.id} className="flex cursor-pointer items-center gap-2.5 py-3 hover:bg-stone-50" onClick={() => readChapter(ch.id)}>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${ch.id === progress[book.id] ? 'bg-amber-200 text-amber-900' : 'bg-stone-100 text-stone-600'}`}>
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{ch.title || `Chapitre ${i + 1}`}</p>
                <p className="text-xs text-stone-400">
                  {countWords(ch.content).toLocaleString('fr-FR')} mots
                  {ch.id === progress[book.id] && <span className="ml-1.5 font-semibold text-amber-700">· en cours</span>}
                </p>
              </div>
              {isOwner && (
                <span className="flex shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button disabled={i === 0} onClick={() => moveChapter(ch.id, -1)} className="rounded p-1.5 text-stone-400 hover:bg-stone-200 disabled:opacity-30" aria-label={`Monter ${ch.title}`} title="Monter">
                    <ChevronUp size={15} />
                  </button>
                  <button disabled={i === chapters.length - 1} onClick={() => moveChapter(ch.id, 1)} className="rounded p-1.5 text-stone-400 hover:bg-stone-200 disabled:opacity-30" aria-label={`Descendre ${ch.title}`} title="Descendre">
                    <ChevronDown size={15} />
                  </button>
                </span>
              )}
              {isOwner && (
                <>
                  <button onClick={(e) => { e.stopPropagation(); router.push(`/livres/${book.id}/ecrire/${ch.id}`) }} className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-stone-500 hover:bg-stone-200">
                    Écrire
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); setToDeleteCh(ch) }} className="shrink-0 rounded-lg px-2 py-1.5 text-stone-300 hover:bg-red-50 hover:text-red-600" aria-label={`Supprimer ${ch.title}`}>
                    <Trash2 size={15} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ol>
      </div>

      <BookFormDialog open={showEdit} initial={book} onClose={() => setShowEdit(false)} onSave={saveEdit} />

      <ConfirmDialog
        open={toDeleteBook}
        title={`Supprimer « ${book.title} » ?`}
        message={`Le livre et ses ${chapters.length} chapitre(s) seront définitivement supprimés.`}
        onConfirm={doDeleteBook}
        onCancel={() => setToDeleteBook(false)}
      />
      <ConfirmDialog
        open={!!toDeleteCh}
        title="Supprimer ce chapitre ?"
        message={toDeleteCh ? `« ${toDeleteCh.title} » (${countWords(toDeleteCh.content).toLocaleString('fr-FR')} mots) sera définitivement supprimé.` : ''}
        onConfirm={async () => {
          if (!toDeleteCh) return
          try {
            applyBook(await BooksAPI.removeChapter(book.id, toDeleteCh.id))
            toast.success('Chapitre supprimé')
          } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Suppression impossible.')
          } finally {
            setToDeleteCh(null)
          }
        }}
        onCancel={() => setToDeleteCh(null)}
      />
    </div>
  )
}
