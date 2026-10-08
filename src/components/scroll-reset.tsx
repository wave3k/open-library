'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/** Remet la page en haut à chaque changement de route. */
export function ScrollReset() {
  const pathname = usePathname()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}
