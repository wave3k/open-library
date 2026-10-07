import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Feather, LibraryBig, LogOut, Loader2 } from 'lucide-react'
import { getUser, setSession, clearSession, AuthAPI, BooksAPI } from './lib/api.js'
import { countWords } from './lib/store.js'
import { exportBook } from './lib/export.js'
import Landing from './components/Landing.jsx'
import Auth from './components/Auth.jsx'
import Library from './components/Library.jsx'
import BookModal from './components/BookModal.jsx'
import BookDetail from './components/BookDetail.jsx'
import ChapterEditor from './components/ChapterEditor.jsx'
import Reader from './components/Reader.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'

const SEED_IDS = new Set(['livre-1', 'livre-2', 'livre-3'])
const OLD_KEY = 'plume-books-v1'

function readLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export default function App() {
  const [user, setUser] = useState(getUser())
  const [authMode, setAuthMode] = useState('signup')
  const [route, setRoute] = useState({ view: getUser() ? 'library' : 'landing', bookId: null, chapterId: null })
  const [tab, setTab] = useState('mine')
  const [mine, setMine] = useState([])
  const [explore, setExplore] = useState([])
  const [loadingBooks, setLoadingBooks] = useState(false)
  const [favs, setFavs] = useState([])
  const [progress, setProgress] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [toast, setToast] = useState('')
  const [confirm, setConfirm] = useState(null)
  const toastTimer = useRef(null)

  const favKey = user ? `plume-favs:${user.id}` : null
  const progressKey = user ? `plume-progress:${user.id}` : null

  useEffect(() => {
    if (!user) return
    setFavs(readLocal(favKey, []))
    setProgress(readLocal(progressKey, {}))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const book = useMemo(
    () => [...mine, ...explore].find((b) => b.id === route.bookId) ?? null,
    [mine, explore, route.bookId]
  )
  const isOwner = !!book && !!user && book.owner_id === user.id

  const flash = (msg) => {
    setToast(msg)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(''), 2600)
  }

  const logout = useCallback(async (expired = false) => {
    try {
      await AuthAPI.logout()
    } catch {
      // ignore
    }
    clearSession()
    setUser(null)
    setMine([])
    setExplore([])
    setFavs([])
    setProgress({})
    setRoute({ view: 'landing', bookId: null, chapterId: null })
    if (expired) flash('Session expirée, reconnecte-toi.')
  }, [])

  const refreshBooks = useCallback(async () => {
    if (!getUser()) return
    setLoadingBooks(true)
    try {
      const [m, e] = await Promise.all([BooksAPI.mine(), BooksAPI.explore()])
      setMine(m)
      setExplore(e)
    } catch (err) {
      if (/Connecte-toi|Non connecté|401/.test(err.message)) logout(true)
      else flash(err.message)
    } finally {
      setLoadingBooks(false)
    }
  }, [logout])

  useEffect(() => {
    if (user) refreshBooks()
  }, [user, refreshBooks])

  // Import unique des anciens livres locaux (hors exemples) vers le compte
  const importLocalOnce = useCallback(
    async (u) => {
      try {
        if (localStorage.getItem(`plume-imported:${u.id}`)) return
        const raw = localStorage.getItem(OLD_KEY)
        if (!raw) return
        const local = JSON.parse(raw)
        const own = Array.isArray(local) ? local.filter((b) => b && !SEED_IDS.has(b.id)) : []
        if (!own.length) {
          localStorage.setItem(`plume-imported:${u.id}`, '1')
          return
        }
        await BooksAPI.importLocal(
          own.map((b) => ({
            title: b.title,
            author: b.author,
            genre: b.genre,
            description: b.description,
            cover: b.cover,
            is_public: true,
            chapters: (b.chapters ?? []).map((c) => ({ title: c.title, content: c.content })),
          }))
        )
        localStorage.setItem(`plume-imported:${u.id}`, '1')
        localStorage.removeItem(OLD_KEY)
        flash(`${own.length} ancien(s) livre(s) importé(s) dans ton compte`)
      } catch {
        // import non bloquant
      }
    },
    []
  )

  const handleAuthDone = async (u) => {
    setUser(u)
    setRoute({ view: 'library', bookId: null, chapterId: null })
    setTab('mine')
    await importLocalOnce(u)
    refreshBooks()
    flash(`Bienvenue, ${u.name} !`)
  }

  const applyBook = (updated) => {
    setMine((prev) => {
      if (!prev.some((b) => b.id === updated.id)) return prev
      return prev.map((b) => (b.id === updated.id ? updated : b))
    })
    setExplore((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
  }

  const goLibrary = () => setRoute({ view: 'library', bookId: null, chapterId: null })

  const markProgress = (bookId, chId) => {
    if (!chId || !progressKey) return
    setProgress((prev) => {
      const next = { ...prev, [bookId]: chId }
      try {
        localStorage.setItem(progressKey, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  const toggleFav = (id) => {
    if (!favKey) return
    setFavs((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
      try {
        localStorage.setItem(favKey, JSON.stringify(next))
      } catch {
        // ignore
      }
      return next
    })
  }

  const readChapter = (bookId, chId) => {
    markProgress(bookId, chId)
    setRoute({ view: 'read', bookId, chapterId: chId })
  }

  const resumeBook = (id) => {
    const b = [...mine, ...explore].find((x) => x.id === id)
    if (!b) return
    const target = (b.chapters ?? []).some((c) => c.id === progress[id]) ? progress[id] : b.chapters?.[0]?.id
    readChapter(id, target)
  }

  const saveBook = async (data) => {
    try {
      if (editingBook) {
        const updated = await BooksAPI.update(editingBook.id, data)
        applyBook(updated)
        flash('Livre mis à jour')
      } else {
        const created = await BooksAPI.create({ ...data, is_public: true })
        setMine((prev) => [created, ...prev])
        setRoute({ view: 'detail', bookId: created.id, chapterId: null })
        flash('Livre créé — écris ton premier chapitre !')
      }
      setShowModal(false)
      setEditingBook(null)
    } catch (err) {
      flash(err.message)
    }
  }

  const askDeleteBook = (b) => {
    setConfirm({
      title: `Supprimer « ${b.title} » ?`,
      message: `Le livre et ses ${(b.chapters ?? []).length} chapitre(s) seront définitivement supprimés.`,
      confirmLabel: 'Supprimer',
      onConfirm: async () => {
        try {
          await BooksAPI.remove(b.id)
          setMine((prev) => prev.filter((x) => x.id !== b.id))
          flash('Livre supprimé')
        } catch (err) {
          flash(err.message)
        }
        setConfirm(null)
        goLibrary()
      },
    })
  }

  const saveChapter = async ({ title, content }) => {
    try {
      const updated =
        route.chapterId === 'new'
          ? await BooksAPI.addChapter(route.bookId, { title, content })
          : await BooksAPI.updateChapter(route.bookId, route.chapterId, { title, content })
      applyBook(updated)
      const saved = updated.chapters.find((c) => c.title === title && c.content === content)
      if (saved) markProgress(route.bookId, saved.id)
      flash('Chapitre enregistré')
      setRoute({ view: 'detail', bookId: route.bookId, chapterId: null })
    } catch (err) {
      flash(err.message)
    }
  }

  const askDeleteChapter = (bookId, ch) => {
    setConfirm({
      title: 'Supprimer ce chapitre ?',
      message: `« ${ch.title} » (${countWords(ch.content).toLocaleString('fr-FR')} mots) sera définitivement supprimé.`,
      confirmLabel: 'Supprimer',
      onConfirm: async () => {
        try {
          const updated = await BooksAPI.removeChapter(bookId, ch.id)
          applyBook(updated)
          flash('Chapitre supprimé')
        } catch (err) {
          flash(err.message)
        }
        setConfirm(null)
      },
    })
  }

  const moveChapter = async (bookId, chId, dir) => {
    const b = mine.find((x) => x.id === bookId)
    if (!b) return
    const arr = [...(b.chapters ?? [])]
    const i = arr.findIndex((c) => c.id === chId)
    const j = i + dir
    if (i < 0 || j < 0 || j >= arr.length) return
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
    try {
      const updated = await BooksAPI.reorder(bookId, arr.map((c) => c.id))
      applyBook(updated)
    } catch (err) {
      flash(err.message)
    }
  }

  const visibleBooks = tab === 'mine' ? mine : explore
  const totalWords = [...mine, ...explore].reduce(
    (s, b) => s + (b.chapters ?? []).reduce((a, c) => a + countWords(c?.content), 0),
    0
  )

  const editingChapter =
    route.chapterId && route.chapterId !== 'new'
      ? book?.chapters?.find((c) => c.id === route.chapterId) ?? null
      : null
  const chapterIndex =
    route.chapterId === 'new'
      ? (book?.chapters?.length ?? 0)
      : Math.max(0, (book?.chapters ?? []).findIndex((c) => c.id === route.chapterId))

  return (
    <div className="min-h-screen bg-[#f3eee2] text-stone-900">
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-[#fbf7ec]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
          <button
            onClick={() => setRoute({ view: user ? 'library' : 'landing', bookId: null, chapterId: null })}
            className="flex items-center gap-2"
            aria-label="Accueil Plume"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-700 text-white">
              <Feather size={18} />
            </span>
            <span className="text-xl font-bold tracking-tight">Plume</span>
          </button>
          <span className="hidden text-sm text-stone-400 sm:block">Écris des livres, lis-les comme des livres</span>
          <div className="ml-auto flex items-center gap-2.5 text-sm">
            {user ? (
              <>
                <span className="hidden items-center gap-1.5 text-stone-500 sm:flex">
                  <LibraryBig size={15} /> {mine.length} livre(s) · {totalWords.toLocaleString('fr-FR')} mots
                </span>
                <span className="hidden rounded-full bg-amber-100 px-3 py-1.5 font-semibold text-amber-800 md:block">
                  {user.name}
                </span>
                <button
                  onClick={() => { setEditingBook(null); setShowModal(true) }}
                  className="rounded-xl bg-amber-700 px-4 py-2 font-semibold text-white hover:bg-amber-600"
                >
                  + Créer
                </button>
                <button
                  onClick={() => logout()}
                  className="flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3 py-2 font-medium text-stone-600 hover:bg-stone-50"
                  title="Se déconnecter"
                >
                  <LogOut size={15} /> <span className="hidden sm:inline">Quitter</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { setAuthMode('login'); setRoute({ view: 'auth', bookId: null, chapterId: null }) }}
                  className="rounded-xl px-4 py-2 font-semibold text-stone-600 hover:bg-stone-100"
                >
                  Se connecter
                </button>
                <button
                  onClick={() => { setAuthMode('signup'); setRoute({ view: 'auth', bookId: null, chapterId: null }) }}
                  className="rounded-xl bg-amber-700 px-4 py-2 font-semibold text-white hover:bg-amber-600"
                >
                  Créer un compte
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        {route.view === 'landing' && !user && (
          <Landing
            onSignup={() => { setAuthMode('signup'); setRoute({ view: 'auth', bookId: null, chapterId: null }) }}
            onLogin={() => { setAuthMode('login'); setRoute({ view: 'auth', bookId: null, chapterId: null }) }}
          />
        )}

        {route.view === 'auth' && !user && (
          <Auth mode={authMode} onMode={setAuthMode} onDone={handleAuthDone} />
        )}

        {user && (route.view === 'library' || ((route.view === 'detail' || route.view === 'write' || route.view === 'read') && !book)) && (
          loadingBooks && mine.length === 0 && explore.length === 0 ? (
            <div className="flex items-center justify-center gap-2 py-20 text-stone-500">
              <Loader2 size={20} className="animate-spin" /> Chargement de ta bibliothèque…
            </div>
          ) : (
            <Library
              books={visibleBooks}
              tab={tab}
              onTab={(t) => setTab(t)}
              mineCount={mine.length}
              exploreCount={explore.length}
              favIds={favs}
              onToggleFav={toggleFav}
              progress={progress}
              onResume={resumeBook}
              onOpen={(id) => setRoute({ view: 'detail', bookId: id, chapterId: null })}
              onCreate={() => { setEditingBook(null); setShowModal(true) }}
              onDeleteRequest={askDeleteBook}
            />
          )
        )}

        {user && route.view === 'detail' && book && (
          <BookDetail
            book={book}
            isOwner={isOwner}
            isFav={favs.includes(book.id)}
            lastReadId={progress[book.id]}
            onBack={goLibrary}
            onRead={(chId) => readChapter(book.id, chId ?? book.chapters?.[0]?.id)}
            onResume={() => resumeBook(book.id)}
            onEditBook={() => { setEditingBook(book); setShowModal(true) }}
            onDeleteRequest={() => askDeleteBook(book)}
            onAddChapter={() => setRoute({ view: 'write', bookId: book.id, chapterId: 'new' })}
            onEditChapter={(chId) => setRoute({ view: 'write', bookId: book.id, chapterId: chId })}
            onDeleteRequestChapter={(ch) => askDeleteChapter(book.id, ch)}
            onToggleFav={() => toggleFav(book.id)}
            onMoveChapter={(chId, dir) => moveChapter(book.id, chId, dir)}
            onExport={(fmt) => { exportBook(book, fmt); flash(`Livre exporté en .${fmt}`) }}
            onToggleVisibility={async () => {
              try {
                const updated = await BooksAPI.update(book.id, { is_public: !book.is_public })
                applyBook(updated)
                flash(updated.is_public ? 'Livre publié — visible par tout le monde' : 'Livre passé en privé')
              } catch (err) {
                flash(err.message)
              }
            }}
          />
        )}

        {user && route.view === 'write' && book && isOwner && (
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

        {user && route.view === 'read' && book && (
          <Reader
            book={book}
            chapterId={route.chapterId}
            onBack={() => setRoute({ view: 'detail', bookId: book.id, chapterId: null })}
            onChapter={(chId) => readChapter(book.id, chId)}
          />
        )}
      </main>

      {showModal && user && (
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
