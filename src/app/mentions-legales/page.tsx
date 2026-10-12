import type { Metadata } from 'next'
import Link from 'next/link'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Mentions légales | Plume',
  description: 'Mentions légales du site Plume : éditeur, directeur de la publication, hébergeurs et propriété intellectuelle.',
  path: '/mentions-legales',
})

const UPDATED = '12 octobre 2026'

export default function MentionsLegalesPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8 py-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Mentions légales</h1>
        <p className="text-muted-foreground mt-2 text-sm">Dernière mise à jour : {UPDATED}</p>
      </header>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">Éditeur du site</h2>
        <p className="text-muted-foreground leading-relaxed">
          Le site <strong>Plume</strong> (accessible à l’adresse{' '}
          <a href="https://plume.hqmerchant.xyz" className="underline">plume.hqmerchant.xyz</a>) est édité par :
        </p>
        <ul className="text-muted-foreground ml-5 list-disc space-y-1 leading-relaxed">
          <li>Éditeur : <strong>Enzo Izinga</strong> (personne physique)</li>
          <li>Pays d’établissement : <strong>République démocratique du Congo</strong></li>
          <li>Statut : édition à titre <strong>non professionnel</strong></li>
          <li>Représentant légal : <strong>Paulette Sankinka</strong></li>
          <li>Immatriculation (registre du commerce) : sans objet</li>
          <li>N° de TVA : sans objet</li>
          <li>E-mail de contact : <a href="mailto:contact@hqmerchant.xyz" className="underline">contact@hqmerchant.xyz</a></li>
        </ul>
        <p className="text-muted-foreground leading-relaxed">
          Directeur de la publication : <strong>Enzo Izinga</strong>.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          L’éditeur étant une personne physique, son adresse personnelle n’est pas publiée : il peut être contacté à
          l’adresse e-mail ci-dessus. Les coordonnées des hébergeurs figurent ci-dessous.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">Hébergement</h2>
        <p className="text-muted-foreground leading-relaxed">
          Le site est hébergé par les prestataires suivants :
        </p>
        <ul className="text-muted-foreground ml-5 list-disc space-y-1 leading-relaxed">
          <li>
            <strong>Vercel Inc.</strong> — 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis —{' '}
            <a href="https://vercel.com" className="underline">vercel.com</a> (hébergement du site web)
          </li>
          <li>
            <strong>Cloudflare, Inc.</strong> — 101 Townsend St, San Francisco, CA 94107, États-Unis —{' '}
            <a href="https://www.cloudflare.com" className="underline">cloudflare.com</a> (API, base de données et stockage média)
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">Propriété intellectuelle</h2>
        <p className="text-muted-foreground leading-relaxed">
          La marque, le nom, les logos, l’interface et les éléments graphiques de Plume sont protégés par le droit de la
          propriété intellectuelle. Toute reproduction non autorisée est interdite.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Les <strong>textes publiés par les utilisateurs restent leur propriété</strong>. Ils en concèdent simplement à
          Plume les droits nécessaires à l’hébergement et à la diffusion (voir les{' '}
          <Link href="/cgu" className="underline">CGU</Link>).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">Signalement</h2>
        <p className="text-muted-foreground leading-relaxed">
          Pour signaler un contenu illicite ou une atteinte à un droit, écris à{' '}
          <a href="mailto:contact@hqmerchant.xyz" className="underline">contact@hqmerchant.xyz</a> en précisant l’URL
          concernée et le motif.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">Droit applicable</h2>
        <p className="text-muted-foreground leading-relaxed">
          L’éditeur étant établi en République démocratique du Congo, le présent site et les présentes mentions sont
          soumis au <strong>droit congolais</strong>.
        </p>
      </section>

      <nav className="text-muted-foreground flex flex-wrap gap-4 border-t pt-6 text-sm">
        <Link href="/confidentialite" className="underline">Politique de confidentialité</Link>
        <Link href="/cgu" className="underline">Conditions générales d’utilisation</Link>
      </nav>
    </article>
  )
}
