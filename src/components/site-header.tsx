'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LibraryBig, Plus, Settings, Bell } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Avatar } from '@/components/avatar'
import { usePlume } from '@/components/plume-provider'

// Pages sans barre de navigation (parcours d'entrée)
const BARE_ROUTES = ['/connexion', '/inscription', '/onboarding']

export function SiteHeader() {
  const { user, unread } = usePlume()
  const pathname = usePathname()

  if (BARE_ROUTES.includes(pathname)) return null

  return (
    <header className="bg-card/95 sticky top-0 z-20 border-b backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link href={user ? '/bibliotheque' : '/'} className="flex items-center gap-2" aria-label="Accueil Open Library">
          <span className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-xl">
            <LibraryBig size={18} />
          </span>
          <span className="text-xl font-bold tracking-tight">Open Library</span>
        </Link>

        <div className="ml-auto flex items-center gap-2.5 text-sm">
          {user ? (
            <>
              <Link href="/bibliotheque" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                Bibliothèque
              </Link>
              <Link href="/bibliotheque" className={buttonVariants({ size: 'sm' })}>
                <Plus size={16} /> Créer
              </Link>
              <Link href="/profil" className="flex items-center gap-2 rounded-full py-1 pl-1 pr-1 hover:bg-stone-100 md:pr-3" aria-label="Mon profil">
                <Avatar user={user} size={32} />
                <span className="hidden max-w-[10rem] truncate font-semibold md:block">{user.display_name || user.name}</span>
              </Link>
              <Link
                href="/notifications"
                className="text-muted-foreground relative rounded-lg p-2 hover:bg-stone-100 hover:text-stone-800"
                title="Notifications"
                aria-label={`Notifications${unread ? ` (${unread} non lues)` : ''}`}
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </Link>
              <Link
                href="/parametres"
                className="text-muted-foreground rounded-lg p-2 hover:bg-stone-100 hover:text-stone-800"
                title="Paramètres"
                aria-label="Paramètres"
              >
                <Settings size={18} />
              </Link>
            </>
          ) : (
            <>
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
