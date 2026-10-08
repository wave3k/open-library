import type { KeyboardEvent } from 'react'

/**
 * Rend un conteneur cliquable accessible au clavier (Entrée/Espace),
 * à utiliser avec un `onClick` existant.
 */
export function clickableProps(action: () => void) {
  return {
    role: 'link' as const,
    tabIndex: 0,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        action()
      }
    },
  }
}
