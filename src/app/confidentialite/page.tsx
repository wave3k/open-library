import type { Metadata } from 'next'
import Link from 'next/link'
import { pageMetadata } from '@/lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Politique de confidentialité | Plume',
  description: 'Quelles données Plume collecte, pourquoi, combien de temps et comment exercer tes droits (RGPD).',
  path: '/confidentialite',
})

const UPDATED = '12 octobre 2026'

export default function ConfidentialitePage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8 py-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Politique de confidentialité</h1>
        <p className="text-muted-foreground mt-2 text-sm">Dernière mise à jour : {UPDATED}</p>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          Plume respecte ta vie privée. Cette page explique, simplement, quelles données sont collectées, pourquoi,
          combien de temps elles sont conservées et comment exercer tes droits.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">1. Responsable de traitement</h2>
        <p className="text-muted-foreground leading-relaxed">
          Le responsable du traitement est <strong>Enzo Izinga</strong>, éditeur de Plume (représenté par son
          représentant légal, <strong>Paulette Sankinka</strong>), joignable à{' '}
          <a href="mailto:contact@hqmerchant.xyz" className="underline">contact@hqmerchant.xyz</a>.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">2. Données collectées</h2>
        <ul className="text-muted-foreground ml-5 list-disc space-y-1 leading-relaxed">
          <li><strong>Compte</strong> : nom d’affichage, nom d’utilisateur, adresse e-mail, mot de passe (stocké <em>haché</em>, jamais en clair), bio et avatar/bannière si tu les ajoutes.</li>
          <li><strong>Contenus</strong> : livres, chapitres, commentaires, mentions « j’aime », abonnements et notifications.</li>
          <li><strong>Données techniques</strong> : adresse IP et horodatage, utilisés pour la sécurité (limitation des tentatives abusives et prévention du spam).</li>
          <li><strong>Mesure d’audience</strong> : statistiques agrégées et anonymes (Vercel Analytics / Speed Insights), sans profilage publicitaire.</li>
          <li><strong>Stockage local (dans ton navigateur)</strong> : jeton de session, thème, préférences de lecture, favoris et progression de lecture. Ces données restent sur ton appareil.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">3. Pourquoi ces données ? (finalités et bases légales)</h2>
        <ul className="text-muted-foreground ml-5 list-disc space-y-1 leading-relaxed">
          <li><strong>Fournir le service</strong> (compte, publication, lecture, interactions) — exécution du contrat.</li>
          <li><strong>Assurer la sécurité</strong> et lutter contre les abus — intérêt légitime.</li>
          <li><strong>Mesurer l’audience</strong> de façon agrégée — intérêt légitime (ou consentement selon les cas).</li>
          <li><strong>Te contacter</strong> au sujet de ton compte — exécution du contrat.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">4. Durées de conservation</h2>
        <ul className="text-muted-foreground ml-5 list-disc space-y-1 leading-relaxed">
          <li><strong>Compte et contenus</strong> : jusqu’à la suppression de ton compte (que tu peux faire toi-même depuis les paramètres).</li>
          <li><strong>Session</strong> : jusqu’à expiration ou déconnexion.</li>
          <li><strong>Données anti-abus (IP)</strong> : purge automatique sous 24 h.</li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">5. Destinataires et sous-traitants</h2>
        <p className="text-muted-foreground leading-relaxed">
          Tes données ne sont <strong>ni vendues ni louées</strong>. Elles sont traitées par nos prestataires
          techniques : <strong>Vercel Inc.</strong> (hébergement du site) et <strong>Cloudflare, Inc.</strong> (API,
          base de données, stockage des images). Voir les <Link href="/mentions-legales" className="underline">mentions légales</Link>.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">6. Transferts hors Union européenne</h2>
        <p className="text-muted-foreground leading-relaxed">
          Ces prestataires étant établis aux États-Unis, un transfert de données hors Union européenne peut avoir lieu.
          Il est encadré par les garanties prévues par le RGPD (clauses contractuelles types et/ou mécanismes de
          conformité équivalents).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">7. Cookies et stockage local</h2>
        <p className="text-muted-foreground leading-relaxed">
          Plume n’utilise <strong>aucun cookie publicitaire ni traceur tiers de profilage</strong>. Le site utilise
          uniquement le stockage local de ton navigateur pour faire fonctionner ta session et tes préférences. Tu peux
          les effacer à tout moment depuis les réglages de ton navigateur (cela te déconnectera).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">8. Tes droits</h2>
        <p className="text-muted-foreground leading-relaxed">
          Conformément au RGPD, tu disposes des droits d’<strong>accès</strong>, de <strong>rectification</strong>, d’
          <strong>effacement</strong>, de <strong>portabilité</strong>, de <strong>limitation</strong> et d’
          <strong>opposition</strong>. Tu peux modifier tes informations depuis les paramètres et supprimer ton compte
          directement dans l’application. Pour toute demande, écris à{' '}
          <a href="mailto:contact@hqmerchant.xyz" className="underline">contact@hqmerchant.xyz</a>.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Si tu estimes que tes droits ne sont pas respectés, tu peux saisir la <strong>CNIL</strong> (
          <a href="https://www.cnil.fr" className="underline">cnil.fr</a>).
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-xl font-bold">9. Sécurité</h2>
        <p className="text-muted-foreground leading-relaxed">
          Les mots de passe sont stockés <strong>hachés</strong>, les échanges sont chiffrés (HTTPS) et l’accès aux
          données est limité au strict nécessaire. Aucun système n’étant infaillible, nous te recommandons un mot de
          passe unique.
        </p>
      </section>

      <nav className="text-muted-foreground flex flex-wrap gap-4 border-t pt-6 text-sm">
        <Link href="/mentions-legales" className="underline">Mentions légales</Link>
        <Link href="/cgu" className="underline">Conditions générales d’utilisation</Link>
      </nav>
    </article>
  )
}
