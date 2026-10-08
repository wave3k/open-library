'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  AuthAPI,
  BooksAPI,
  ProfileAPI,
  clearSession,
  favKey,
  getStoredUser,
  progressKey,
  readLocal,
  setSession,
  updateStoredUser,
  writeLocal,
  type Book,
  type ProfileStats,
  type Recommendation,
  type User,
} from '@/lib/plume'

const SEED_IDS = new Set(['livre-1', 'livre-2', 'livre-3'])
const OLD_KEY = 'plume-books-v1'

interface PlumeCtx {
  user: User | null
  stats: ProfileStats | null
  mine: Book[]
  explore: Book[]
  recommended: Recommendation[]
  loadingBooks: boolean
  tab: 'mine' | 'explore' | 'for-you' | 'lectures'
  setTab: (t: 'mine' | 'explore' | 'for-you' | 'lectures') => void
  favs: string[]
  progress: Record<string, string>
  unread: number
  refreshBooks: () => Promise<void>
  refreshStats: () => Promise<void>
  login: (u: User, token: string) => Promise<void>
  logout: (expired?: boolean) => Promise<void>
  updateProfile: (patch: Partial<User>) => Promise<void>
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
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [ready, setReady] = useState(false)
  const [mine, setMine] = useState<Book[]>([])
  const [explore, setExplore] = useState<Book[]>([])
  const [recommended, setRecommended] = useState<Recommendation[]>([])
  const [loadingBooks, setLoadingBooks] = useState(false)
  const [tab, setTab] = useState<'mine' | 'explore' | 'for-you' | 'lectures'>('for-you')
  const [favs, setFavs] = useState<string[]>([])
  const [progress, setProgress] = useState<Record<string, string>>({})
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    // Lecture de localStorage après montage (pas d'accès au storage côté serveur)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getStoredUser())
    setReady(true)
  }, [])

  useEffect(() => {
    if (!user) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      setStats(null)
      setMine([])
      setExplore([])
      setRecommended([])
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
      const [m, e, rec] = await Promise.all([BooksAPI.mine(), BooksAPI.explore(), BooksAPI.recommendations(12)])
      setMine(m)
      setExplore(e)
      setRecommended(rec)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de chargement.'
      if (/Connecte-toi|Non connecté|Session/.test(msg)) logout(true)
      else toast.error(msg)
    } finally {
      setLoadingBooks(false)
    }
  }, [logout])

  const refreshStats = useCallback(async () => {
    if (!getStoredUser()) return
    try {
      const { user: u, stats: s, unread: n } = await AuthAPI.me()
      setUser(u)
      updateStoredUser(u)
      setStats(s)
      setUnread(n ?? 0)
    } catch (err) {
      const msg = err instanceof Error ? err.message : ''
      if (/Connecte-toi|Non connecté|Session/.test(msg)) logout(true)
    }
  }, [logout])

  useEffect(() => {
    if (user?.id) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      refreshBooks()
      refreshStats()
    }
    // On dépend de l'ID (stable), pas de l'objet user (remplacé à chaque fetch → boucle)
  }, [user?.id, refreshBooks, refreshStats])

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
      setTab('for-you')
      await importLocalOnce(u)
      refreshBooks()
      refreshStats()
      toast.success(`Bienvenue, ${u.display_name || u.name} !`)
    },
    [importLocalOnce, refreshBooks, refreshStats]
  )

  const updateProfile = useCallback(
    async (patch: Partial<User>) => {
      const { user: u } = await ProfileAPI.update(patch)
      setUser(u)
      updateStoredUser(u)
    },
    []
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
    setRecommended((prev) => prev.map((x) => (x.book.id === b.id ? { ...x, book: b } : x)))
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
      stats,
      mine,
      explore,
      recommended,
      loadingBooks,
      tab,
      setTab,
      favs,
      progress,
      unread,
      refreshBooks,
      refreshStats,
      login,
      logout,
      updateProfile,
      toggleFav,
      markProgress,
      applyBook,
      dropBook,
      prependMine,
    }),
    [user, stats, mine, explore, recommended, loadingBooks, tab, favs, progress, unread, refreshBooks, refreshStats, login, logout, updateProfile, toggleFav, markProgress, applyBook, dropBook, prependMine]
  )

  if (!ready) return null
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
