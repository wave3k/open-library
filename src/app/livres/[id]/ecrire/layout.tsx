import { privateMetadata } from '@/lib/seo'

// Écriture d'un chapitre : espace privé, non indexable.
export const metadata = privateMetadata('Écrire un chapitre — Plume')

export default function EcrireLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
