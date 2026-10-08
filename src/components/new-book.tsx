'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, BookText } from 'lucide-react'
import { toast } from 'sonner'
import { BookForm } from '@/components/book-form'
import { usePlume } from '@/components/plume-provider'
import { BooksAPI, type BookInput } from '@/lib/plume'
import { buttonVariants } from '@/components/ui/button'

export function NewBookPage() {
  const router = useRouter()
  const { user, prependMine } = usePlume()

  useEffect(() => {
    if (user === null && typeof window !== 'undefined') {
      const t = setTimeout(() => {
        if (!window.localStorage.getItem('plume-user')) router.replace('/connexion?next=/livres/nouveau')
      }, 300)
      return () => clearTimeout(t)
    }
  }, [user, router])

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="font-semibold">Connecte-toi pour créer un livre.</p>
        <a href="/connexion?next=/livres/nouveau" className={buttonVariants({ className: 'mt-4' })}>Se connecter</a>
      </div>
    )
  }

  const create = async (data: BookInput) => {
    try {
      const created = await BooksAPI.create(data)
      prependMine(created)
      toast.success('Livre créé — écris ton premier chapitre !')
      router.push(`/livres/${created.id}/ecrire`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Création impossible.')
      throw err
    }
  }

  return (
    <div className="animate-fade-up space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800">
        <ArrowLeft size={16} /> Retour
      </button>

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><BookText size={24} className="text-amber-600" /> Nouveau livre</h1>
        <p className="text-muted-foreground text-sm">Donne un titre, une couverture, et lance-toi. Tu écriras ton premier chapitre juste après.</p>
      </div>

      <BookForm initial={null} submitLabel="Créer et écrire" onSubmit={create} onCancel={() => router.back()} />
    </div>
  )
}
