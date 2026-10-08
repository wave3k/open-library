'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LibraryBig, Heart } from 'lucide-react'
import { usePlume } from '@/components/plume-provider'

const BARE_ROUTES = ['/connexion', '/inscription', '/onboarding']

export function SiteFooter() {
  const pathname = usePathname()
  const { user } = usePlume()

  if (BARE_ROUTES.includes(pathname)) return null

  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t bg-card/50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Marque */}
          <div className="lg:col-span-2">
            <Link href={user ? '/bibliotheque' : '/'} className="group inline-flex items-center gap-2">
              <span className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
                <LibraryBig size={18} />
              </span>
              <span className="text-xl font-bold tracking-tight">Open Library</span>
            </Link>
            <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed">
              La plateforme gratuite pour <strong>publier</strong> et <strong>lire</strong> des livres.
              Écris ton histoire chapitre par chapitre, partage-la et découvre celles des autres.
            </p>
            <p className="text-muted-foreground mt-4 inline-flex items-center gap-1.5 text-sm">
              Fait avec <Heart size={14} className="text-red-500" fill="currentColor" /> par
              <span className="brand-hover font-bold text-stone-800 dark:text-stone-100">HQStudio</span>
            </p>
          </div>

          {/* Découvrir */}
          <div>
            <h3 className="text-sm font-bold">Découvrir</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/recherche" className="text-muted-foreground transition-colors hover:text-amber-700">Explorer les livres</Link></li>
              <li><Link href="/recherche?q=Romance" className="text-muted-foreground transition-colors hover:text-amber-700">Romance</Link></li>
              <li><Link href="/recherche?q=Science-Fiction" className="text-muted-foreground transition-colors hover:text-amber-700">Science-Fiction</Link></li>
              <li><Link href="/recherche?q=Programmation" className="text-muted-foreground transition-colors hover:text-amber-700">Programmation</Link></li>
            </ul>
          </div>

          {/* Écrire */}
          <div>
            <h3 className="text-sm font-bold">Écrire</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {user ? (
                <>
                  <li><Link href="/bibliotheque" className="text-muted-foreground transition-colors hover:text-amber-700">Ma bibliothèque</Link></li>
                  <li><Link href="/livres/nouveau" className="text-muted-foreground transition-colors hover:text-amber-700">Écrire un livre</Link></li>
                  <li><Link href="/notifications" className="text-muted-foreground transition-colors hover:text-amber-700">Notifications</Link></li>
                  <li><Link href="/parametres" className="text-muted-foreground transition-colors hover:text-amber-700">Paramètres</Link></li>
                </>
              ) : (
                <>
                  <li><Link href="/inscription" className="text-muted-foreground transition-colors hover:text-amber-700">Créer un compte</Link></li>
                  <li><Link href="/connexion" className="text-muted-foreground transition-colors hover:text-amber-700">Se connecter</Link></li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="text-muted-foreground mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs sm:flex-row">
          <p>© {year} Open Library — Publier et lire des livres gratuitement.</p>
          <p>
            Conçu &amp; développé par
            <span className="brand-hover ml-1 font-semibold text-stone-700 dark:text-stone-200">HQStudio</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
