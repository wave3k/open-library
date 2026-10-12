import { NewBookPage } from '@/components/new-book'
import { privateMetadata } from '@/lib/seo'

export const metadata = privateMetadata('Créer un livre — Plume')

export default function Page() {
  return <NewBookPage />
}
