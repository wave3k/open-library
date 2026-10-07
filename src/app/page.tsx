import Link from 'next/link'
import { Feather, PenLine, BookOpen, Users, Sparkles, ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { BookCover } from '@/components/book-cover'

const FEATURES = [
  {
    icon: PenLine,
    title: 'Écris chapitre par chapitre',
    text: 'Éditeur simple, aperçu fidèle, brouillon autosauvegardé : ne perds plus jamais une ligne.',
  },
  {
    icon: BookOpen,
    title: 'Relis comme un vrai livre',
    text: 'Lettrine, sommaire, thèmes papier, nuit et sépia, progression sauvegardée.',
  },
  {
    icon: Users,
    title: 'Partage et découvre',
    text: 'Tes livres t’appartiennent. Publie-les pour que d’autres les lisent, et explore les leurs.',
  },
]

export default function LandingPage() {
  return (
    <div className="space-y-14 pb-8">
      <section className="grid items-center gap-8 pt-6 lg:grid-cols-2">
        <div>
          <span className="bg-secondary text-secondary-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold">
            <Sparkles size={13} /> La bibliothèque dont tu es l’auteur
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Écris des livres.
            <br />
            Lis-les <span className="text-amber-700">comme des livres.</span>
          </h1>
          <p className="text-muted-foreground mt-4 max-w-lg text-lg leading-relaxed">
            Open Library, c’est ton atelier d’écriture façon Wattpad : crée un compte, écris tes
            histoires chapitre par chapitre, publie-les pour les partager — et dévore
            celles des autres dans un vrai mode lecture.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/inscription" className={buttonVariants({ size: 'lg' })}>Créer un compte gratuit <ArrowRight size={17} /></Link>
            <Link href="/connexion" className={buttonVariants({ size: 'lg', variant: 'outline' })}>Se connecter</Link>
          </div>
          <p className="text-muted-foreground mt-3 text-xs">Gratuit · Tes livres restent à toi · Export .txt / .md inclus</p>
        </div>

        <div className="book3d-lift from-card to-muted flex items-end justify-center gap-5 rounded-3xl border bg-gradient-to-b p-8">
          <div className="mb-6 hidden sm:block">
            <BookCover cover="sky" title="Orbital" author="Karim Haddad" genre="Science-Fiction" size="md" />
          </div>
          <div className="mb-0">
            <BookCover cover="indigo" title="La Cité des Brumes" author="Léa Moreau" genre="Fantastique" size="lg" />
          </div>
          <div className="mb-6 hidden sm:block">
            <BookCover cover="rose" title="Lettres à demain" author="Camille Petit" genre="Romance" size="md" />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="bg-card rounded-2xl border p-6">
            <span className="bg-secondary text-secondary-foreground flex h-11 w-11 items-center justify-center rounded-xl">
              <Icon size={20} />
            </span>
            <h3 className="mt-3 font-bold">{title}</h3>
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">{text}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl bg-stone-900 p-8 text-white sm:p-10">
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Feather size={22} className="text-amber-400" /> Comment ça marche ?
        </h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            ['1. Crée ton compte', 'Ton nom de plume, ton e-mail, un mot de passe. Trente secondes.'],
            ['2. Écris ton livre', 'Titre, couverture, chapitres. Tout est sauvegardé automatiquement.'],
            ['3. Publie et explore', 'Tes livres publics rejoignent la bibliothèque commune. Lis ceux des autres.'],
          ].map(([t, d]) => (
            <li key={t}>
              <p className="font-bold text-amber-300">{t}</p>
              <p className="mt-1 text-sm leading-relaxed text-stone-300">{d}</p>
            </li>
          ))}
        </ol>
        <Link href="/inscription" className={buttonVariants({ className: 'mt-8 bg-amber-500 text-stone-950 hover:bg-amber-400' })}>
          Commencer à écrire
        </Link>
      </section>
    </div>
  )
}
