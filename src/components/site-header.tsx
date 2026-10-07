'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LibraryBig, LogOut, Plus } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { usePlume } from '@/components/plume-provider'
import { bookWords } from '@/lib/plume'

export function SiteHeader({ onCreate }: { onCreate?: () => void }) {
  const { user, mine, logout } = usePlume()
  const router = useRouter()
  const totalWords = [...mine].reduce(
    (s, b) => s + (b.chapters ?? []).reduce((a, c) => a + (c.content ?? '').trim().split(/\s+/).filter(Boolean).length, 0),
    0
  )

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
              <span className="text-muted-foreground hidden items-center gap-1.5 sm:flex">
                <LibraryBig size={15} /> {mine.length} livre(s) · {totalWords.toLocaleString('fr-FR')} mots
              </span>
              <span className="bg-secondary hidden rounded-full px-3 py-1.5 font-semibold md:block">{user.name}</span>
              {onCreate && (
                <Button onClick={onCreate} size="sm" className="rounded-xl">
                  <Plus size={16} /> Créer
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => {
                  logout()
                  router.push('/')
                }}
                title="Se déconnecter"
              >
                <LogOut size={15} /> <span className="hidden sm:inline">Quitter</span>
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

export { bookWords }
