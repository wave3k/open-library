'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Feather, Heart } from 'lucide-react'
import { usePlume } from '@/components/plume-provider'

const BARE_ROUTES = ['/connexion', '/inscription', '/onboarding']

export function SiteFooter() {
  const pathname = usePathname()
  const { user } = usePlume()
  // L'année n'est lue que côté client : `new Date()` est interdit au prerender.
  const [year, setYear] = useState<number | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setYear(new Date().getFullYear())
  }, [])

  if (BARE_ROUTES.includes(pathname)) return null

  return (
    <footer className="mt-16 border-t bg-card/50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Marque */}
          <div className="lg:col-span-2">
            <Link href={user ? '/bibliotheque' : '/'} className="group inline-flex items-center gap-2">
              <span className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
                <Feather size={18} />
              </span>
              <span className="text-xl font-bold tracking-tight">Plume</span>
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
              <li><Link href="/genre/romance" className="text-muted-foreground transition-colors hover:text-amber-700">Livres de romance</Link></li>
              <li><Link href="/genre/fantastique" className="text-muted-foreground transition-colors hover:text-amber-700">Livres fantastiques</Link></li>
              <li><Link href="/genre/science-fiction" className="text-muted-foreground transition-colors hover:text-amber-700">Science-Fiction</Link></li>
            </ul>
          </div>

          {/* Écrire */}
          <div>
            <h3 className="text-sm font-bold">Écrire</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/ecrire-un-livre" className="text-muted-foreground transition-colors hover:text-amber-700">Écrire un livre en ligne</Link></li>
              <li><Link href="/publier-un-livre" className="text-muted-foreground transition-colors hover:text-amber-700">Publier un livre gratuitement</Link></li>
              <li><Link href="/alternative-wattpad" className="text-muted-foreground transition-colors hover:text-amber-700">Alternative à Wattpad</Link></li>
              {user ? (
                <>
                  <li><Link href="/bibliotheque" className="text-muted-foreground transition-colors hover:text-amber-700">Ma bibliothèque</Link></li>
                  <li><Link href="/notifications" className="text-muted-foreground transition-colors hover:text-amber-700">Notifications</Link></li>
                </>
              ) : (
                <>
                  <li><Link href="/inscription" className="text-muted-foreground transition-colors hover:text-amber-700">Créer un compte</Link></li>
                  <li><Link href="/connexion" className="text-muted-foreground transition-colors hover:text-amber-700">Se connecter</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="text-sm font-bold">Légal</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/mentions-legales" className="text-muted-foreground transition-colors hover:text-amber-700">Mentions légales</Link></li>
              <li><Link href="/confidentialite" className="text-muted-foreground transition-colors hover:text-amber-700">Confidentialité</Link></li>
              <li><Link href="/cgu" className="text-muted-foreground transition-colors hover:text-amber-700">CGU</Link></li>
            </ul>
          </div>
        </div>

        <div className="text-muted-foreground mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-xs sm:flex-row">
          <p>©{year ? ` ${year}` : ''} Plume — Publier et lire des livres gratuitement.</p>
          <p>
            Conçu &amp; développé par
            <span className="brand-hover ml-1 font-semibold text-stone-700 dark:text-stone-200">HQStudio</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
