'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LibraryBig, Plus, Settings, Bell, Search } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Avatar } from '@/components/avatar'
import { usePlume } from '@/components/plume-provider'
import { cn } from '@/lib/utils'

const BARE_ROUTES = ['/connexion', '/inscription', '/onboarding']

export function SiteHeader() {
  const { user, unread } = usePlume()
  const pathname = usePathname()
  const router = useRouter()
  const [ring, setRing] = useState(false)
  const prevUnread = useRef(unread)

  // Fait tinter la cloche quand de nouvelles notifications arrivent
  useEffect(() => {
    if (unread > prevUnread.current) {
      setRing(true)
      const t = setTimeout(() => setRing(false), 900)
      prevUnread.current = unread
      return () => clearTimeout(t)
    }
    prevUnread.current = unread
  }, [unread])

  if (BARE_ROUTES.includes(pathname)) return null

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <header className="bg-card/80 sticky top-0 z-20 border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4">
        <Link href={user ? '/bibliotheque' : '/'} className="group flex items-center gap-2" aria-label="Accueil Open Library">
          <span className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
            <LibraryBig size={18} />
          </span>
          <span className="text-xl font-bold tracking-tight">Open Library</span>
        </Link>

        <div className="ml-auto flex items-center gap-1 text-sm">
          {user ? (
            <>
              <Link
                href="/bibliotheque"
                data-active={isActive('/bibliotheque')}
                className={cn('nav-underline hidden rounded-lg px-3 py-2 font-medium transition-colors sm:block', isActive('/bibliotheque') ? 'text-stone-900 dark:text-stone-100' : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-100')}
              >
                Bibliothèque
              </Link>
              <Button size="sm" onClick={() => router.push('/livres/nouveau')}>
                <Plus size={16} /> Créer
              </Button>
              <Link href="/profil" className="group flex items-center gap-2 rounded-full py-1 pl-1 pr-1 transition-colors hover:bg-stone-100 md:pr-3" aria-label="Mon profil">
                <span className="rounded-full ring-2 ring-transparent transition group-hover:ring-amber-400">
                  <Avatar user={user} size={32} />
                </span>
                <span className="hidden max-w-[10rem] truncate font-semibold md:block">{user.display_name || user.name}</span>
              </Link>
              <Link
                href="/notifications"
                className={cn('text-muted-foreground relative rounded-lg p-2 transition-colors hover:bg-stone-100 hover:text-stone-800', ring && 'animate-bell')}
                title="Notifications"
                aria-label={`Notifications${unread ? ` (${unread} non lues)` : ''}`}
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span key={unread} className="animate-pop absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </Link>
              <Link
                href="/parametres"
                className="text-muted-foreground rounded-lg p-2 transition-colors hover:bg-stone-100 hover:text-stone-800"
                title="Paramètres"
                aria-label="Paramètres"
              >
                <Settings size={18} />
              </Link>
            </>
          ) : (
            <>
              <Link href="/recherche" className={cn('nav-underline hidden items-center gap-1.5 rounded-lg px-3 py-2 font-medium text-stone-500 transition-colors hover:text-stone-900 sm:flex', isActive('/recherche') && 'text-stone-900 dark:text-stone-100')} data-active={isActive('/recherche')}>
                <Search size={15} /> Explorer
              </Link>
              <Link href="/connexion" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                Se connecter
              </Link>
              <Link href="/inscription" className={buttonVariants({ size: 'sm' })}>
                Créer un compte
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
