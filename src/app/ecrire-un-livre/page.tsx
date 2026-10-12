import Link from 'next/link'
import type { Metadata } from 'next'
import { buttonVariants } from '@/components/ui/button'
import { JsonLd } from '@/components/json-ld'
import { pageMetadata } from '@/lib/seo'
import { faqJsonLd } from '@/lib/jsonld'

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Peut-on écrire un livre entièrement en ligne et gratuitement ?',
    a: 'Oui. Avec un éditeur en ligne comme celui d’Open Library, tu écris et organises tes chapitres dans le navigateur, sans rien installer. Créer un compte et écrire sont gratuits.',
  },
  {
    q: 'Quel est le meilleur outil pour écrire un livre ?',
    a: 'Tout dépend de ton objectif : un traitement de texte suffit pour un manuscrit, mais une plateforme comme Open Library ajoute l’organisation par chapitres, la sauvegarde automatique et la publication pour être lu.',
  },
  {
    q: 'Puis-je écrire un livre sur mon téléphone ?',
    a: 'Oui. L’éditeur d’Open Library est conçu pour le mobile : écrire, publier et lire fonctionnent depuis le navigateur du téléphone.',
  },
  {
    q: 'Comment structurer les chapitres d’un roman ?',
    a: 'Découpe l’histoire en chapitres courts (une scène ou un objectif par chapitre), garde un fil conducteur et écris une fin qui relance. L’éditeur permet de réordonner les chapitres facilement.',
  },
  {
    q: 'Et une fois le livre écrit, comment le publier ?',
    a: 'Sur Open Library, un livre se publie en un clic depuis sa fiche. Il devient alors lisible par les autres lecteurs de la plateforme.',
  },
]

export const metadata: Metadata = pageMetadata({
  title: 'Écrire un livre en ligne : outils gratuits (2026) | Open Library',
  description:
    'Comment écrire un livre en ligne gratuitement : les meilleurs outils, comment structurer ses chapitres et se faire lire. Guide pratique Open Library.',
  path: '/ecrire-un-livre',
})

const TOOLS = [
  { name: 'Open Library', price: 'Gratuit', publishing: 'Oui (lecteurs inclus)', community: 'Oui', note: 'Écrire, publier et être lu au même endroit.' },
  { name: 'Traitement de texte (Word, Google Docs)', price: 'Gratuit ou payant', publishing: 'Non', community: 'Non', note: 'Parfait pour le manuscrit, mais pas pour être lu.' },
  { name: 'Logiciels d’écriture dédiés', price: 'Souvent payant', publishing: 'Non', community: 'Non', note: 'Fiches personnages, objectifs de mots ; orientés manuscrit.' },
  { name: 'Plateformes communautaires', price: 'Gratuit (souvent)', publishing: 'Oui', community: 'Oui', note: 'Publient chapitre par chapitre, avec commentaires.' },
]

export default function EcrireUnLivrePage() {
  return (
    <article className="mx-auto max-w-3xl space-y-10 py-6">
      <JsonLd data={faqJsonLd(FAQ)} />

      <header>
        <p className="text-sm font-semibold text-amber-700">Guide</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Écrire un livre en ligne : le guide des outils gratuits</h1>
        <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
          Écrire un livre en ligne est possible <strong>sans installer de logiciel</strong> : un navigateur, un compte
          gratuit et un éditeur par chapitres suffisent. Le vrai enjeu n’est pas d’écrire, mais d’<strong>être lu</strong> —
          c’est là que les outils se différencient.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/inscription" className={buttonVariants({ size: 'lg' })}>Écrire mon premier chapitre</Link>
          <Link href="/publier-un-livre" className={buttonVariants({ size: 'lg', variant: 'outline' })}>Publier un livre gratuitement</Link>
        </div>
      </header>

      <section>
        <h2 className="text-2xl font-bold">Peut-on écrire un livre entièrement en ligne et gratuitement ?</h2>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          Oui. Un éditeur en ligne suffit pour écrire un livre : tu crées des chapitres, tu les réordonnes et la
          sauvegarde est automatique. La différence se joue après le manuscrit — sur la possibilité de publier et
          d’avoir des lecteurs sans changer d’outil.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Les meilleurs outils pour écrire un livre en 2026</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-4 font-semibold">Outil</th>
                <th className="py-2 pr-4 font-semibold">Prix</th>
                <th className="py-2 pr-4 font-semibold">Publication incluse</th>
                <th className="py-2 pr-4 font-semibold">Communauté</th>
                <th className="py-2 font-semibold">À retenir</th>
              </tr>
            </thead>
            <tbody>
              {TOOLS.map((t) => (
                <tr key={t.name} className="border-b">
                  <td className="py-2 pr-4 font-medium">{t.name}</td>
                  <td className="py-2 pr-4">{t.price}</td>
                  <td className="py-2 pr-4">{t.publishing}</td>
                  <td className="py-2 pr-4">{t.community}</td>
                  <td className="py-2 text-stone-500">{t.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Écrire avec Open Library</h2>
        <ul className="text-muted-foreground mt-2 space-y-2 leading-relaxed">
          <li>• Un <strong>éditeur par chapitres</strong> (gras, italique, listes, titres) dans le navigateur.</li>
          <li>• <strong>Sauvegarde automatique</strong> : tu ne perds jamais une ligne.</li>
          <li>• <strong>Publication en un clic</strong> pour rendre le livre lisible.</li>
          <li>• <strong>Suivi de lecture</strong> : vues, likes et commentaires par livre.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Comment trouver des lecteurs ?</h2>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          La plupart des outils s’arrêtent au manuscrit. Sur Open Library, publier un chapitre le rend visible dans
          l’exploration et les tendances, où d’autres lecteurs le découvrent, l’aiment et le commentent. C’est le
          levier le plus concret pour un primo-auteur : être lu sans prospection.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Et les droits d’auteur ?</h2>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          Tu restes propriétaire de ton texte. Publier sur Open Library ne transfère aucun droit : tu peux retirer ou
          dépublier ton livre quand tu le souhaites.
        </p>
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
        <h2 className="text-2xl font-bold">Écris ton premier chapitre</h2>
        <p className="mt-2 max-w-xl text-stone-300">Crée ton compte gratuitement et commence à écrire en ligne dès maintenant.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/inscription" className={buttonVariants({ className: 'bg-amber-500 text-stone-950 hover:bg-amber-400' })}>Créer un compte</Link>
          <Link href="/recherche" className={buttonVariants({ variant: 'outline', className: 'border-stone-600 bg-transparent text-white hover:bg-stone-800' })}>Explorer les livres</Link>
          <Link href="/alternative-wattpad" className="self-center text-sm text-stone-300 underline">Open Library face à Wattpad</Link>
        </div>
      </section>
    </article>
  )
}
