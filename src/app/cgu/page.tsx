import type { Metadata } from 'next'
import Link from 'next/link'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Conditions générales d’utilisation | Plume',
  description: 'Les règles d’utilisation de Plume : compte, contenus publiés, contenus interdits, modération et responsabilité.',
  path: '/cgu',
})

const UPDATED = '12 octobre 2026'

export default function CguPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8 py-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Conditions générales d’utilisation</h1>
        <p className="text-muted-foreground mt-2 text-sm">Dernière mise à jour : {UPDATED}</p>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          En créant un compte et en utilisant Plume, tu acceptes les présentes conditions. Merci de les lire.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">1. Objet</h2>
        <p className="text-muted-foreground leading-relaxed">
          Plume est un service gratuit permettant d’<strong>écrire, publier et lire des livres en ligne</strong>. Le
          service est fourni « en l’état », sans garantie de disponibilité continue.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">2. Compte</h2>
        <p className="text-muted-foreground leading-relaxed">
          Tu dois fournir des informations exactes et garder ton mot de passe confidentiel. Tu es responsable de
          l’activité réalisée depuis ton compte. Un compte est réservé à un usage personnel ; l’usage automatique ou
          abusif (spam, scraping, contournement des limites) est interdit.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">3. Tes contenus et la licence</h2>
        <p className="text-muted-foreground leading-relaxed">
          <strong>Tu restes propriétaire de tes textes.</strong> En publiant un contenu, tu accordes à Plume une licence
          non exclusive, gratuite et mondiale, limitée à l’hébergement, au stockage et à la diffusion de ce contenu
          dans le cadre du service (y compris son affichage aux autres utilisateurs). Cette licence prend fin lorsque
          tu supprimes le contenu ou ton compte, sous réserve des copies techniques transitoires.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Tu garantis détenir les droits nécessaires sur ce que tu publies.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">4. Contenus interdits</h2>
        <p className="text-muted-foreground leading-relaxed">Il est interdit de publier :</p>
        <ul className="text-muted-foreground ml-5 list-disc space-y-1 leading-relaxed">
          <li>des contenus illicites, haineux, violents, harcelants ou portant atteinte à autrui ;</li>
          <li>des contenus protégés par le droit d’auteur d’un tiers sans autorisation (plagiat) ;</li>
          <li>des données personnelles d’autrui sans son consentement ;</li>
          <li>du spam, des contenus trompeurs ou des liens malveillants ;</li>
          <li>des contenus à caractère sexuel impliquant des mineurs, en toute hypothèse.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">5. Modération</h2>
        <p className="text-muted-foreground leading-relaxed">
          Nous pouvons retirer un contenu ou suspendre un compte qui ne respecte pas ces conditions ou la loi. Les
          signalements peuvent être envoyés à{' '}
          <a href="mailto:contact@hqmerchant.xyz" className="underline">contact@hqmerchant.xyz</a> ; nous agissons dans
          les meilleurs délais.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">6. Propriété intellectuelle de Plume</h2>
        <p className="text-muted-foreground leading-relaxed">
          Le nom, le logo, l’interface et les éléments graphiques de Plume sont protégés. Toute reproduction non
          autorisée est interdite.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">7. Responsabilité</h2>
        <p className="text-muted-foreground leading-relaxed">
          Plume héberge des contenus publiés par ses utilisateurs et n’exerce pas de contrôle a priori sur ceux-ci. Nous
          ne saurions être tenus responsables des contenus publiés par les utilisateurs, ni d’une indisponibilité
          temporaire du service.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">8. Résiliation</h2>
        <p className="text-muted-foreground leading-relaxed">
          Tu peux supprimer ton compte à tout moment depuis les paramètres. Nous pouvons suspendre ou résilier un
          compte en cas de manquement grave ou répété aux présentes conditions.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">9. Modification des conditions</h2>
        <p className="text-muted-foreground leading-relaxed">
          Ces conditions peuvent évoluer. En cas de changement important, nous t’en informerons dans l’application. La
          date de mise à jour figure en haut de cette page.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">10. Droit applicable</h2>
        <p className="text-muted-foreground leading-relaxed">
          Les présentes conditions sont soumises au <strong>droit français</strong>. En cas de litige, une solution
          amiable sera recherchée avant toute action ; à défaut, les tribunaux français seront compétents.
        </p>
      </section>

      <nav className="text-muted-foreground flex flex-wrap gap-4 border-t pt-6 text-sm">
        <Link href="/mentions-legales" className="underline">Mentions légales</Link>
        <Link href="/confidentialite" className="underline">Politique de confidentialité</Link>
      </nav>
    </article>
  )
}
