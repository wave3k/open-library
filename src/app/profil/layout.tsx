import { privateMetadata } from '@/lib/seo'

// Espace personnel (profil + statistiques) : non indexable.
export const metadata = privateMetadata('Mon profil — Open Library')

export default function ProfilLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
