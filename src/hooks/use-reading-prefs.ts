'use client'

// Préférences de lecture locales (favoris + progression), isolées du reste de
// l'état global. Elles vivent dans localStorage, jamais côté serveur.
import { useCallback, useEffect, useState } from 'react'
import { favKey, progressKey, readLocal, writeLocal, type User } from '@/lib/plume'

export function useReadingPrefs(user: User | null) {
  const [favs, setFavs] = useState<string[]>([])
  const [progress, setProgress] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!user) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavs(readLocal<string[]>(favKey(user.id), []))
    setProgress(readLocal<Record<string, string>>(progressKey(user.id), {}))
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

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

  const reset = useCallback(() => {
    setFavs([])
    setProgress({})
  }, [])

  return { favs, progress, toggleFav, markProgress, reset }
}
