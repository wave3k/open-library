import { useMemo, useRef, useState } from 'react'
import { Feather, LibraryBig } from 'lucide-react'
import { useBooks, uid, todayISO, countWords } from './lib/store.js'
import { exportBook } from './lib/export.js'
import Library from './components/Library.jsx'
import BookModal from './components/BookModal.jsx'
import BookDetail from './components/BookDetail.jsx'
import ChapterEditor from './components/ChapterEditor.jsx'
import Reader from './components/Reader.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'

export default function App() {
  const [books, setBooks] = useBooks()
  const [route, setRoute] = useState({ view: 'library', bookId: null, chapterId: null })
  const [showModal, setShowModal] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [toast, setToast] = useState('')
  const [confirm, setConfirm] = useState(null)
  const toastTimer = useRef(null)

  const book = useMemo(
    () => books.find((b) => b.id === route.bookId) ?? null,
    [books, route.bookId]
  )

  // Toast sans chevauchement de timers (correction bug)
  const flash = (msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2600)
  }

  const patchBook = (id, fn) => {
    setBooks((prev) => prev.map((b) => (b.id === id ? fn(b) : b)))
  }

  const goLibrary = () => setRoute({ view: 'library', bookId: null, chapterId: null })
  const openBook = (id) => setRoute({ view: 'detail', bookId: id, chapterId: null })

  const readChapter = (bookId, chId) => {
    patchBook(bookId, (b) => ({ ...b, lastRead: chId ?? b.chapters?.[0]?.id ?? null }))
    setRoute({ view: 'read', bookId, chapterId: chId })
  }

  const resumeBook = (id) => {
    const b = books.find((x) => x.id === id)
    if (!b) return
    const target = (b.chapters ?? []).some((c) => c.id === b.lastRead)
      ? b.lastRead
      : b.chapters?.[0]?.id
    readChapter(id, target)
  }

  const saveBook = (data) => {
    if (editingBook) {
      patchBook(editingBook.id, (b) => ({ ...b, ...data }))
      flash('Livre mis à jour')
    } else {
      const nb = { id: uid('livre'), ...data, createdAt: todayISO(), favorite: false, lastRead: null, chapters: [] }
      setBooks((prev) => [nb, ...prev])
      setRoute({ view: 'detail', bookId: nb.id, chapterId: null })
      flash('Livre créé — écris ton premier chapitre !')
    }
    setShowModal(false)
    setEditingBook(null)
  }

  const askDeleteBook = (b) => {
    setConfirm({
      title: `Supprimer « ${b.title} » ?`,
      message: `Le livre et ses ${(b.chapters ?? []).length} chapitre(s) seront définitivement supprimés.`,
      confirmLabel: 'Supprimer',
      onConfirm: () => {
        setBooks((prev) => prev.filter((x) => x.id !== b.id))
        setConfirm(null)
        goLibrary()
        flash('Livre supprimé')
      },
    })
  }

  const saveChapter = ({ title, content }) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== route.bookId) return b
        if (route.chapterId === 'new') {
          const ch = { id: uid('ch'), title, content }
          return { ...b, chapters: [...(b.chapters ?? []), ch], lastRead: ch.id }
        }
        return {
          ...b,
          chapters: (b.chapters ?? []).map((c) => (c.id === route.chapterId ? { ...c, title, content } : c)),
        }
      })
    )
    flash('Chapitre enregistré')
    setRoute({ view: 'detail', bookId: route.bookId, chapterId: null })
  }

  const askDeleteChapter = (bookId, ch) => {
    setConfirm({
      title: 'Supprimer ce chapitre ?',
      message: `« ${ch.title} » (${countWords(ch.content).toLocaleString('fr-FR')} mots) sera définitivement supprimé.`,
      confirmLabel: 'Supprimer',
      onConfirm: () => {
        setBooks((prev) =>
          prev.map((b) =>
            b.id === bookId
              ? {
                  ...b,
                  chapters: (b.chapters ?? []).filter((c) => c.id !== ch.id),
                  lastRead: b.lastRead === ch.id ? null : b.lastRead,
                }
              : b
          )
        )
        setConfirm(null)
        flash('Chapitre supprimé')
      },
    })
  }

  const moveChapter = (bookId, chId, dir) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== bookId) return b
        const arr = [...(b.chapters ?? [])]
        const i = arr.findIndex((c) => c.id === chId)
        const j = i + dir
        if (i < 0 || j < 0 || j >= arr.length) return b
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
        return { ...b, chapters: arr }
      })
    )
  }

  const editingChapter =
    route.chapterId && route.chapterId !== 'new'
      ? book?.chapters?.find((c) => c.id === route.chapterId) ?? null
      : null
  const chapterIndex =
    route.chapterId === 'new'
      ? (book?.chapters?.length ?? 0)
      : Math.max(0, (book?.chapters ?? []).findIndex((c) => c.id === route.chapterId))

  const totalWords = books.reduce(
    (s, b) => s + (b.chapters ?? []).reduce((a, c) => a + countWords(c?.content), 0),
    0
  )

  return (
    <div className="min-h-screen bg-[#f3eee2] text-stone-900">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-[#fbf7ec]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <button onClick={goLibrary} className="flex items-center gap-2" aria-label="Retour à la bibliothèque">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-700 text-white">
              <Feather size={18} />
            </span>
            <span className="text-xl font-bold tracking-tight">Plume</span>
          </button>
          <span className="hidden text-sm text-stone-400 sm:block">Écris des livres, lis-les comme des livres</span>
          <div className="ml-auto flex items-center gap-3 text-sm text-stone-500">
            <span className="hidden items-center gap-1.5 sm:flex">
              <LibraryBig size={15} /> {books.length} livre(s) · {totalWords.toLocaleString('fr-FR')} mots
            </span>
            <button
              onClick={() => { setEditingBook(null); setShowModal(true) }}
              className="rounded-xl bg-amber-700 px-4 py-2 font-semibold text-white hover:bg-amber-600"
            >
              + Créer
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {route.view === 'library' && (
          <Library
            books={books}
            onOpen={openBook}
            onCreate={() => { setEditingBook(null); setShowModal(true) }}
            onDeleteRequest={askDeleteBook}
            onToggleFav={(id) => patchBook(id, (b) => ({ ...b, favorite: !b.favorite }))}
            onResume={resumeBook}
          />
        )}

        {route.view === 'detail' && book && (
          <BookDetail
            book={book}
            onBack={goLibrary}
            onRead={(chId) => readChapter(book.id, chId ?? book.chapters?.[0]?.id)}
            onResume={() => resumeBook(book.id)}
            onEditBook={() => { setEditingBook(book); setShowModal(true) }}
            onDeleteRequest={() => askDeleteBook(book)}
            onAddChapter={() => setRoute({ view: 'write', bookId: book.id, chapterId: 'new' })}
            onEditChapter={(chId) => setRoute({ view: 'write', bookId: book.id, chapterId: chId })}
            onDeleteRequestChapter={(ch) => askDeleteChapter(book.id, ch)}
            onToggleFav={() => patchBook(book.id, (b) => ({ ...b, favorite: !b.favorite }))}
            onMoveChapter={(chId, dir) => moveChapter(book.id, chId, dir)}
            onExport={(fmt) => { exportBook(book, fmt); flash(`Livre exporté en .${fmt}`) }}
          />
        )}

        {route.view === 'write' && book && (
          <ChapterEditor
            key={`${book.id}:${route.chapterId}`}
            bookId={book.id}
            bookTitle={book.title}
            chapter={editingChapter}
            index={chapterIndex}
            onBack={() => setRoute({ view: 'detail', bookId: book.id, chapterId: null })}
            onSave={saveChapter}
          />
        )}

        {route.view === 'read' && book && (
          <Reader
            book={book}
            chapterId={route.chapterId}
            onBack={() => setRoute({ view: 'detail', bookId: book.id, chapterId: null })}
            onChapter={(chId) => readChapter(book.id, chId)}
          />
        )}
      </main>

      {showModal && (
        <BookModal
          key={editingBook?.id ?? 'new'}
          initial={editingBook}
          onClose={() => { setShowModal(false); setEditingBook(null) }}
          onSave={saveBook}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-full bg-stone-900 px-5 py-2.5 text-sm font-medium text-white shadow-xl" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}
