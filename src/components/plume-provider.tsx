'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  AuthAPI,
  BooksAPI,
  ProfileAPI,
  clearSession,
  getStoredUser,
  setSession,
  updateStoredUser,
  type Book,
  type ProfileStats,
  type Recommendation,
  type User,
} from '@/lib/plume'
import { useReadingPrefs } from '@/hooks/use-reading-prefs'
import { migrateLegacyBooks } from '@/lib/migrate'

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
  const [mine, setMine] = useState<Book[]>([])
  const [explore, setExplore] = useState<Book[]>([])
  const [recommended, setRecommended] = useState<Recommendation[]>([])
  const [loadingBooks, setLoadingBooks] = useState(false)
  const [tab, setTab] = useState<'mine' | 'explore' | 'for-you' | 'lectures'>('for-you')
  const [unread, setUnread] = useState(0)

  // Préférences de lecture locales (favoris + progression), isolées dans un hook.
  const { favs, progress, toggleFav, markProgress, reset: resetPrefs } = useReadingPrefs(user)

  useEffect(() => {
    // Lecture de localStorage après montage (pas d'accès au storage côté serveur)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUser(getStoredUser())
  }, [])

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
      resetPrefs()
      router.push('/')
      if (expired) toast.error('Session expirée, reconnecte-toi.')
    },
    [router, resetPrefs]
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

  const login = useCallback(
    async (u: User, token: string) => {
      setSession(u, token)
      setUser(u)
      setTab('for-you')
      await migrateLegacyBooks(u)
      refreshBooks()
      refreshStats()
      toast.success(`Bienvenue, ${u.display_name || u.name} !`)
    },
    [refreshBooks, refreshStats]
  )

  const updateProfile = useCallback(
    async (patch: Partial<User>) => {
      const { user: u } = await ProfileAPI.update(patch)
      setUser(u)
      updateStoredUser(u)
    },
    []
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

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
