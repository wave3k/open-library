import { Feather, PenLine, BookOpen, Users, Sparkles, ArrowRight } from 'lucide-react'
import BookCover from './BookCover.jsx'

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

export default function Landing({ onSignup, onLogin }) {
  return (
    <div className="space-y-14 pb-8">
      {/* Hero */}
      <section className="grid items-center gap-8 pt-6 lg:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            <Sparkles size={13} /> La bibliothèque dont tu es l’auteur
          </span>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-stone-900 sm:text-5xl">
            Écris des livres.
            <br />
            Lis-les <span className="text-amber-700">comme des livres.</span>
          </h1>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-stone-600">
            Plume, c’est ton atelier d’écriture façon Wattpad : crée un compte, écris tes
            histoires chapitre par chapitre, publie-les pour les partager — et dévore
            celles des autres dans un vrai mode lecture.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onSignup}
              className="flex items-center gap-1.5 rounded-xl bg-amber-700 px-6 py-3 font-semibold text-white shadow-lg shadow-amber-700/20 hover:bg-amber-600"
            >
              Créer un compte gratuit <ArrowRight size={17} />
            </button>
            <button
              onClick={onLogin}
              className="rounded-xl border border-stone-300 bg-white px-6 py-3 font-semibold text-stone-700 hover:bg-stone-50"
            >
              Se connecter
            </button>
          </div>
          <p className="mt-3 text-xs text-stone-400">Gratuit · Tes livres restent à toi · Export .txt / .md inclus</p>
        </div>

        {/* Vitrine de couvertures 3D */}
        <div className="book3d-lift flex items-end justify-center gap-5 rounded-3xl border border-stone-200 bg-gradient-to-b from-white to-[#efe7d3] p-8">
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

      {/* Fonctionnalités */}
      <section className="grid gap-4 md:grid-cols-3">
        {FEATURES.map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border border-stone-200 bg-white p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
              <Icon size={20} />
            </span>
            <h3 className="mt-3 font-bold text-stone-900">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-600">{text}</p>
          </div>
        ))}
      </section>

      {/* Comment ça marche */}
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
        <button
          onClick={onSignup}
          className="mt-8 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-stone-950 hover:bg-amber-400"
        >
          Commencer à écrire
        </button>
      </section>
    </div>
  )
}
