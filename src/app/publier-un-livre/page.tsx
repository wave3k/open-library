import Link from 'next/link'
import type { Metadata } from 'next'
import { buttonVariants } from '@/components/ui/button'
import { JsonLd } from '@/components/json-ld'
import { pageMetadata } from '@/lib/seo'
import { faqJsonLd } from '@/lib/jsonld'

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Publier un livre sur Open Library est-il vraiment gratuit ?',
    a: 'Oui. La création de compte, l’écriture et la publication sont gratuites, sans frais cachés ni abonnement.',
  },
  {
    q: 'Faut-il un logiciel pour publier ?',
    a: 'Non. Tout se fait dans le navigateur : tu écris tes chapitres en ligne puis tu publies le livre.',
  },
  {
    q: 'Puis-je publier un livre déjà écrit ailleurs ?',
    a: 'Oui. Tu peux recréer tes chapitres dans l’éditeur et publier le livre, ou importer un texte depuis une ancienne version.',
  },
  {
    q: 'Qui peut lire mon livre ?',
    a: 'Un livre publié est visible par tout le monde ; tu peux aussi le garder privé, ou réserver un profil à tes abonnés.',
  },
]

export const metadata: Metadata = pageMetadata({
  title: 'Publier un livre gratuitement en ligne | Open Library',
  description:
    'Publie ton livre gratuitement sur Open Library : écris tes chapitres, publie-les et fais-les lire. Sans frais, sans installation, droits d’auteur conservés.',
  path: '/publier-un-livre',
})

export default function PublierUnLivrePage() {
  return (
    <article className="mx-auto max-w-3xl space-y-10 py-6">
      <JsonLd data={faqJsonLd(FAQ)} />

      <header>
        <p className="text-sm font-semibold text-amber-700">Publication</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">Publier un livre gratuitement, en ligne</h1>
        <p className="text-muted-foreground mt-4 text-lg leading-relaxed">
          Open Library permet de <strong>publier un livre gratuitement</strong> : tu crées un compte, tu écris tes
          chapitres dans un éditeur en ligne, puis tu publies. Le livre devient lisible par tout le monde, sans frais
          et sans rien installer, et tu restes propriétaire de ton texte.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/inscription" className={buttonVariants({ size: 'lg' })}>Commencer à écrire</Link>
          <Link href="/recherche" className={buttonVariants({ size: 'lg', variant: 'outline' })}>Voir les livres publiés</Link>
        </div>
      </header>

      <section>
        <h2 className="text-2xl font-bold">Comment publier un livre gratuitement sur Open Library ?</h2>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          En quatre étapes, sans logiciel ni installation.
        </p>
        <ol className="mt-4 space-y-3">
          {[
            'Crée ton compte gratuit (e-mail et mot de passe).',
            'Crée un livre : titre, auteur, genre, description et couverture.',
            'Écris chaque chapitre dans l’éditeur — la sauvegarde est automatique.',
            'Publie le livre pour le rendre visible, ou garde-le privé le temps de l’écrire.',
          ].map((t, i) => (
            <li key={t} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-800">{i + 1}</span>
              <span className="leading-relaxed">{t}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Combien coûte la publication ?</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-4 font-semibold">Poste</th>
                <th className="py-2 font-semibold">Open Library</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b"><td className="py-2 pr-4">Créer un compte</td><td className="py-2">Gratuit</td></tr>
              <tr className="border-b"><td className="py-2 pr-4">Écrire et publier</td><td className="py-2">Gratuit</td></tr>
              <tr className="border-b"><td className="py-2 pr-4">Être lu par d’autres</td><td className="py-2">Inclus</td></tr>
              <tr><td className="py-2 pr-4">Droits sur ton texte</td><td className="py-2">Conservés</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Plateforme gratuite ou auto-édition classique ?</h2>
        <p className="text-muted-foreground mt-2 leading-relaxed">
          Les deux ne répondent pas au même besoin. Voici une comparaison honnête.
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 pr-4 font-semibold">Critère</th>
                <th className="py-2 pr-4 font-semibold">Plateforme gratuite (Open Library)</th>
                <th className="py-2 font-semibold">Auto-édition payante</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b"><td className="py-2 pr-4">Coût pour l’auteur</td><td className="py-2 pr-4">0 €</td><td className="py-2">Variable (mise en page, impression…)</td></tr>
              <tr className="border-b"><td className="py-2 pr-4">Délai de mise en ligne</td><td className="py-2 pr-4">Immédiat</td><td className="py-2">Jours à semaines</td></tr>
              <tr className="border-b"><td className="py-2 pr-4">Lecteurs</td><td className="py-2 pr-4">Communauté de la plateforme</td><td className="py-2">À trouver toi-même</td></tr>
              <tr><td className="py-2 pr-4">Idéal pour</td><td className="py-2 pr-4">Se faire lire, tester, écrire en ligne</td><td className="py-2">Vendre un livre imprimé</td></tr>
            </tbody>
          </table>
        </div>
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
        <h2 className="text-2xl font-bold">Prêt à publier ton livre ?</h2>
        <p className="mt-2 max-w-xl text-stone-300">Crée ton compte gratuitement et publie ton premier chapitre aujourd’hui.</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/inscription" className={buttonVariants({ className: 'bg-amber-500 text-stone-950 hover:bg-amber-400' })}>Créer un compte</Link>
          <Link href="/ecrire-un-livre" className={buttonVariants({ variant: 'outline', className: 'border-stone-600 bg-transparent text-white hover:bg-stone-800' })}>Guide pour écrire un livre</Link>
          <Link href="/alternative-wattpad" className="self-center text-sm text-stone-300 underline">Comparer avec Wattpad</Link>
        </div>
      </section>
    </article>
  )
}
