import Link from 'next/link'
import type { Metadata } from 'next'
import { buttonVariants } from '@/components/ui/button'
import { JsonLd } from '@/components/json-ld'
import { pageMetadata } from '@/lib/seo'
import { faqJsonLd } from '@/lib/jsonld'

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Plume est-il vraiment une alternative à Wattpad ?',
    a: 'Oui pour l’essentiel : publier des histoires chapitre par chapitre, être lu et recevoir des retours. Wattpad reste plus grand et plus orienté fanfictions et romance à épisodes.',
  },
  {
    q: 'Faut-il payer sur Plume ?',
    a: 'Non. Créer un compte, écrire et publier sont gratuits, sans abonnement.',
  },
  {
    q: 'Puis-je importer mes histoires depuis une autre plateforme ?',
    a: 'Tu peux recréer tes chapitres dans l’éditeur en ligne. Il n’y a pas d’import automatique depuis Wattpad.',
  },
  {
    q: 'Qui peut lire mes histoires ?',
    a: 'Un livre publié est visible par tout le monde. Tu peux aussi le garder privé ou réserver ton profil à tes abonnés.',
  },
]

export const metadata: Metadata = pageMetadata({
  title: 'Alternative à Wattpad pour écrire et lire, en français | Plume',
  description:
    'Cherches-tu une alternative à Wattpad ? Compare Wattpad et Plume : prix, publication, communauté, langue et droits d’auteur. Publier gratuitement.',
  path: '/alternative-wattpad',
})

export default function AlternativeWattpadPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-10 py-6">
      <JsonLd data={faqJsonLd(FAQ)} />

      <header>
        <p className="text-sm font-semibold text-amber-700">Comparatif</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Une alternative à Wattpad, en français</h1>
        <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
          Wattpad est la référence des romans à épisodes et des fanfictions. Plume vise autre chose :
          <strong> écrire et publier un livre entièrement en français, gratuitement</strong>, dans un format « livre »
          (chapitres, sommaire, lecture immersive) plutôt que flux infini.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/inscription" className={buttonVariants({ size: 'lg' })}>Publier sur Plume</Link>
          <Link href="/recherche" className={buttonVariants({ size: 'lg', variant: 'outline' })}>Voir les livres</Link>
        </div>
      </header>

      <section>
        <h2 className="text-2xl font-bold">Wattpad ou Plume : le comparatif</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-4 font-semibold">Critère</th>
                <th className="py-2 pr-4 font-semibold">Wattpad</th>
                <th className="py-2 font-semibold">Plume</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b"><td className="py-2 pr-4">Prix</td><td className="py-2 pr-4">Gratuit (options payantes)</td><td className="py-2">Gratuit</td></tr>
              <tr className="border-b"><td className="py-2 pr-4">Langue</td><td className="py-2 pr-4">Internationale (anglais dominant)</td><td className="py-2">Français</td></tr>
              <tr className="border-b"><td className="py-2 pr-4">Format</td><td className="py-2 pr-4">Flux, épisodes, fanfictions</td><td className="py-2">Livre : chapitres + lecteur</td></tr>
              <tr className="border-b"><td className="py-2 pr-4">Publication</td><td className="py-2 pr-4">Chapitre par chapitre</td><td className="py-2">Chapitre par chapitre</td></tr>
              <tr className="border-b"><td className="py-2 pr-4">Communauté</td><td className="py-2 pr-4">Très large</td><td className="py-2">Plus petite, en croissance</td></tr>
              <tr><td className="py-2 pr-4">Droits d’auteur</td><td className="py-2 pr-4">À vérifier selon les conditions</td><td className="py-2">Conservés</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-muted-foreground mt-3 text-sm">
          Comparaison honnête : Wattpad a l’avantage de la taille et de la culture fanfiction ; Plume mise sur
          la langue française et une expérience de lecture « livre ».
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Pour qui Plume est-il le meilleur choix ?</h2>
        <ul className="text-muted-foreground mt-2 space-y-2 leading-relaxed">
          <li>• Tu écris <strong>en français</strong> et veux toucher un lectorat francophone.</li>
          <li>• Tu préfères un format <strong>livre</strong> (chapitres, sommaire) à un flux d’épisodes.</li>
          <li>• Tu ne veux <strong>rien payer ni installer</strong>.</li>
          <li>• Tu veux <strong>publier vite</strong> et suivre tes lectures (vues, likes, commentaires).</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Questions fréquentes</h2>
        <div className="mt-3 space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="bg-card rounded-2xl border p-5">
              <summary className="cursor-pointer list-none font-semibold marker:hidden">{item.q}</summary>
              <p className="text-muted-foreground mt-3 text-sm leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-stone-900 p-8 text-white sm:p-10">
        <h2 className="text-2xl font-bold">Essaie Plume</h2>
        <p className="mt-2 max-w-xl text-stone-300">Crée ton compte gratuitement et publie ta première histoire en français.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/inscription" className={buttonVariants({ className: 'bg-amber-500 text-stone-950 hover:bg-amber-400' })}>Créer un compte</Link>
          <Link href="/ecrire-un-livre" className={buttonVariants({ variant: 'outline', className: 'border-stone-600 bg-transparent text-white hover:bg-stone-800' })}>Guide pour écrire</Link>
        </div>
      </section>
    </article>
  )
}
