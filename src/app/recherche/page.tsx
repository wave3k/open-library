import { SearchView } from '@/components/search-view'
import { privateMetadata } from '@/lib/seo'

export const metadata = privateMetadata('Explorer des livres gratuits — Open Library')

export default function RecherchePage() {
  return <SearchView />
}
