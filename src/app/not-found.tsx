import Link from 'next/link'
import { BookX } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="animate-fade-up flex flex-col items-center justify-center py-24 text-center">
      <span className="animate-float flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-100 text-amber-700">
        <BookX size={36} />
      </span>
      <h1 className="mt-6 text-3xl font-bold">Page introuvable</h1>
      <p className="text-muted-foreground mt-2 max-w-md">
        Cette page a peut-être été déplacée, ou l’histoire que tu cherches n’existe plus.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonVariants()}>Retour à l’accueil</Link>
        <Link href="/recherche" className={buttonVariants({ variant: 'outline' })}>Parcourir les livres</Link>
      </div>
    </div>
  )
}
