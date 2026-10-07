'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  AuthAPI,
  BooksAPI,
  clearSession,
  favKey,
  getStoredUser,
  progressKey,
  readLocal,
  setSession,
  writeLocal,
  type Book,
  type User,
} from '@/lib/plume'

const SEED_IDS = new Set(['livre-1', 'livre-2', 'livre-3'])
const OLD_KEY = 'plume-books-v1'

interface PlumeCtx {
  user: User | null
  mine: Book[]
  explore: Book[]
  loadingBooks: boolean
  tab: 'mine' | 'explore'
  setTab: (t: 'mine' | 'explore') => void
  favs: string[]
  progress: Record<string, string>
  refreshBooks: () => Promise<void>
  login: (u: User, token: string) => Promise<void>
  logout: (expired?: boolean) => Promise<void>
  toggleFav: (id: string) => void
  markProgress: (bookId: string, chId: string | undefined) => void
  applyBook: (b: Book) => void
  dropBook: (id: string) => void
  prependMine: (b: Book) => void
}

const Ctx = createContext<PlumeCtx | null>(null)

export function usePlume(): PlumeCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePlume doit être utilisé dans <PlumeProvider>')
  return ctx
}

export function PlumeProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [mine, setMine] = useState<Book[]>([])
  const [explore, setExplore] = useState<Book[]>([])
  const [loadingBooks, setLoadingBooks] = useState(false)
  const [tab, setTab] = useState<'mine' | 'explore'>('mine')
  const [favs, setFavs] = useState<string[]>([])
  const [progress, setProgress] = useState<Record<string, string>>({})

  useEffect(() => {
    setUser(getStoredUser())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!user) return
    setFavs(readLocal<string[]>(favKey(user.id), []))
    setProgress(readLocal<Record<string, string>>(progressKey(user.id), {}))
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const logout = useCallback(
    async (expired = false) => {
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
      router.push('/')
      if (expired) toast.error('Session expirée, reconnecte-toi.')
    },
    [router]
  )

  const refreshBooks = useCallback(async () => {
    if (!getStoredUser()) return
    setLoadingBooks(true)
    try {
      const [m, e] = await Promise.all([BooksAPI.mine(), BooksAPI.explore()])
      setMine(m)
      setExplore(e)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de chargement.'
      if (/Connecte-toi|Non connecté|Session/.test(msg)) logout(true)
      else toast.error(msg)
    } finally {
      setLoadingBooks(false)
    }
  }, [logout])

  useEffect(() => {
    if (user) refreshBooks()
  }, [user, refreshBooks])

  const importLocalOnce = useCallback(async (u: User) => {
    try {
      if (localStorage.getItem(`plume-imported:${u.id}`)) return
      const raw = localStorage.getItem(OLD_KEY)
      if (!raw) return
      const local = JSON.parse(raw) as unknown
      const arr = Array.isArray(local) ? local : []
      const own = arr.filter(
        (b): b is {
          id: string
          title: string
          author: string
          genre: string
          description: string
          cover: string
          chapters: { title: string; content: string }[]
        } => typeof b === 'object' && b !== null && !SEED_IDS.has((b as { id: string }).id)
      )
      if (own.length) {
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
        toast.success(`${own.length} ancien(s) livre(s) importé(s) dans ton compte`)
      }
      localStorage.setItem(`plume-imported:${u.id}`, '1')
      localStorage.removeItem(OLD_KEY)
    } catch {
      // import non bloquant
    }
  }, [])

  const login = useCallback(
    async (u: User, token: string) => {
      setSession(u, token)
      setUser(u)
      setTab('mine')
      await importLocalOnce(u)
      refreshBooks()
      toast.success(`Bienvenue, ${u.name} !`)
    },
    [importLocalOnce, refreshBooks]
  )

  const toggleFav = useCallback(
    (id: string) => {
      if (!user) return
      setFavs((prev) => {
        const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
        writeLocal(favKey(user.id), next)
        return next
      })
    },
    [user]
  )

  const markProgress = useCallback(
    (bookId: string, chId: string | undefined) => {
      if (!chId || !user) return
      setProgress((prev) => {
        const next = { ...prev, [bookId]: chId }
        writeLocal(progressKey(user.id), next)
        return next
      })
    },
    [user]
  )

  const applyBook = useCallback((b: Book) => {
    setMine((prev) => (prev.some((x) => x.id === b.id) ? prev.map((x) => (x.id === b.id ? b : x)) : prev))
    setExplore((prev) => prev.map((x) => (x.id === b.id ? b : x)))
  }, [])

  const dropBook = useCallback((id: string) => {
    setMine((prev) => prev.filter((x) => x.id !== id))
  }, [])

  const prependMine = useCallback((b: Book) => {
    setMine((prev) => [b, ...prev])
  }, [])

  const value = useMemo(
    () => ({
      user,
      mine,
      explore,
      loadingBooks,
      tab,
      setTab,
      favs,
      progress,
      refreshBooks,
      login,
      logout,
      toggleFav,
      markProgress,
      applyBook,
      dropBook,
      prependMine,
    }),
    [user, mine, explore, loadingBooks, tab, favs, progress, refreshBooks, login, logout, toggleFav, markProgress, applyBook, dropBook, prependMine]
  )

  if (!ready) return null
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
