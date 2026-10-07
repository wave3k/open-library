'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

const KEY = 'plume-theme'

interface ThemeCtx {
  theme: Theme
  resolved: 'light' | 'dark'
  setTheme: (t: Theme) => void
}

const Ctx = createContext<ThemeCtx | null>(null)

export function useTheme(): ThemeCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useTheme doit être utilisé dans <ThemeProvider>')
  return ctx
}

function systemPrefersDark() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [resolved, setResolved] = useState<'light' | 'dark'>('light')

  const apply = useCallback((t: Theme) => {
    const dark = t === 'dark' || (t === 'system' && systemPrefersDark())
    document.documentElement.classList.toggle('dark', dark)
    setResolved(dark ? 'dark' : 'light')
  }, [])

  useEffect(() => {
    const stored = (localStorage.getItem(KEY) as Theme | null) || 'system'
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(stored)
    apply(stored)

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const cur = (localStorage.getItem(KEY) as Theme | null) || 'system'
      if (cur === 'system') apply('system')
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [apply])

  const setTheme = useCallback(
    (t: Theme) => {
      localStorage.setItem(KEY, t)
      setThemeState(t)
      apply(t)
    },
    [apply]
  )

  const value = useMemo(() => ({ theme, resolved, setTheme }), [theme, resolved, setTheme])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
