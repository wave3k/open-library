import { privateMetadata } from '@/lib/seo'

export const metadata = privateMetadata('Ma bibliothèque — Open Library')

export default function BibliothequeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
