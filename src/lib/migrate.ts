// Migration ponctuelle : importe les livres d'une ancienne version locale de
// l'app (clé `plume-books-v1`), une seule fois par utilisateur.
import { toast } from 'sonner'
import { BooksAPI, type User } from '@/lib/plume'

const SEED_IDS = new Set(['livre-1', 'livre-2', 'livre-3'])
const OLD_KEY = 'plume-books-v1'

export async function migrateLegacyBooks(u: User): Promise<void> {
  try {
    if (localStorage.getItem(`plume-imported:${u.id}`)) return
    const raw = localStorage.getItem(OLD_KEY)
    if (!raw) return
    const local = JSON.parse(raw) as unknown
    const arr = Array.isArray(local) ? local : []
    const own = arr.filter(
      (b): b is {
        id: string
        title: string
        author: string
        genre: string
        description: string
        cover: string
        chapters: { title: string; content: string }[]
      } => typeof b === 'object' && b !== null && !SEED_IDS.has((b as { id: string }).id)
    )
    if (own.length) {
      await BooksAPI.importLocal(
        own.map((b) => ({
          title: b.title,
          author: b.author,
          genre: b.genre,
          description: b.description,
          cover: b.cover,
          is_public: true,
          chapters: (b.chapters ?? []).map((c) => ({ title: c.title, content: c.content })),
        }))
      )
      toast.success(`${own.length} ancien(s) livre(s) importé(s) dans ton compte`)
    }
    localStorage.setItem(`plume-imported:${u.id}`, '1')
    localStorage.removeItem(OLD_KEY)
  } catch {
    // import non bloquant
  }
}
