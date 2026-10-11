import { privateMetadata } from '@/lib/seo'

// Lecture d'un chapitre : le contenu est rendu côté client, non indexable.
// (La page publique indexable d'un livre est /livres/[id].)
export const metadata = privateMetadata('Lecture — Open Library')

export default function LireLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
