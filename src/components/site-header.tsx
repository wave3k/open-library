'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LibraryBig, LogOut, Plus } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Avatar } from '@/components/avatar'
import { usePlume } from '@/components/plume-provider'

// Pages sans barre de navigation (parcours d'entrée)
const BARE_ROUTES = ['/connexion', '/inscription', '/onboarding']

export function SiteHeader() {
  const { user, mine, logout } = usePlume()
  const router = useRouter()
  const pathname = usePathname()
  const totalWords = mine.reduce(
    (s, b) => s + (b.chapters ?? []).reduce((a, c) => a + (c.content ?? '').trim().split(/\s+/).filter(Boolean).length, 0),
    0
  )

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
        <span className="text-muted-foreground hidden text-sm sm:block">Écris des livres, lis-les comme des livres</span>
        <div className="ml-auto flex items-center gap-2.5 text-sm">
          {user ? (
            <>
              <span className="text-muted-foreground hidden items-center gap-1.5 lg:flex">
                <LibraryBig size={15} /> {mine.length} livre(s) · {totalWords.toLocaleString('fr-FR')} mots
              </span>
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
              <Button
                variant="ghost"
                size="icon-sm"
                className="text-stone-500"
                onClick={() => {
                  logout()
                  router.push('/')
                }}
                title="Se déconnecter"
                aria-label="Se déconnecter"
              >
                <LogOut size={16} />
              </Button>
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
