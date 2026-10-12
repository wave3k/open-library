import type { Book } from '@/lib/plume'
import { BookDetail } from '@/components/book-detail'
import { JsonLd } from '@/components/json-ld'
import { fetchPublicBook } from '@/lib/server-api'
import { bookJsonLd, breadcrumbJsonLd } from '@/lib/jsonld'

// Page livre rendue côté serveur : la fiche (titre, auteur, description,
// chapitres) est dans le HTML initial — indexable sans JavaScript.
export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const book = (await fetchPublicBook(id)) as Book | null

  return (
    <>
      {book && <JsonLd data={bookJsonLd(book)} />}
      {book && (
        <JsonLd
          data={breadcrumbJsonLd([
            { name: 'Accueil', path: '/' },
            { name: 'Explorer', path: '/recherche' },
            { name: book.title, path: `/livres/${book.id}` },
          ])}
        />
      )}
      <BookDetail initialBook={book} />
    </>
  )
}
