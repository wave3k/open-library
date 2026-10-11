# Audit SEO & GEO — Open Library — 11 octobre 2026

Audit réalisé avec les skills : `seo-audit` (orchestrateur), `ai-seo`,
`audit-visibilite-ia`, `site-architecture`, `schema`, `llms-txt-schema`,
`chasseur-questions-ia`, `brief-anti-concurrents`, `reecriture-citable-ia`,
`programmatic-seo`, `directory-submissions`. Données externes réelles via treg
(SERP Google FR, volumes, backlinks, réponses ChatGPT).

---

## Résumé exécutif (5 lignes)

1. **Le site n'est pas indexable aujourd'hui** : `/robots.txt` et `/sitemap.xml`
   renvoient 404, et **les 15 pages partagent le même `<title>`** — Google ne
   peut ni les découvrir proprement ni les distinguer.
2. **Les deux pages « argent » (livre et profil auteur) sont des coquilles vides
   côté serveur** : `/livres/[id]` et `/u/[username]` font 4,2 Ko de HTML sans
   une seule phrase de contenu (composants `'use client'`).
3. **Zéro donnée structurée, zéro OpenGraph, zéro canonique** sur tout le site.
4. **Visibilité IA = 0/100** : sur 3 questions posées à ChatGPT, la marque n'est
   jamais citée (Atramenta, Édition999, TheBookSailor, Fyctia, Wattpad sont
   recommandés à sa place), et sur une question de marque ChatGPT **confond
   « Open Library » avec openlibrary.org** (Internet Archive).
5. **0 backlink** (vérifié) et le site vit sur un domaine `*.vercel.app` —
   deux plafonds au classement et à la citation, à traiter en priorité.

---

## 1. Inventaire technique

Lecture du HTML réellement servi (curl, 11/10/2026). Le site est
`https://open-library-zeta.vercel.app` (domaine Vercel, pas de domaine propre).

| Page | Titre (identique partout) | H1 | HTTP | Problème principal |
|---|---|---|---|---|
| `/` | Open Library — Publier et lire… | 1 | 200 | Titre non spécifique ; 547 mots ; pas de FAQ ; pas d'OG |
| `/recherche` | idem | 1 | 200 | Titre dupliqué ; contenu résultats client-side |
| `/recherche?q=romance` | idem | 1 | 200 | Titre dupliqué ; paramètre d'URL indexable sans canonique |
| `/connexion` | idem | **0** | 200 | Aucun H1 ; pas de `noindex` |
| `/inscription` | idem | **0** | 200 | Aucun H1 ; pas de `noindex` |
| `/u/lea_moreau` | idem | **0** | 200 | **Aucun contenu SSR** ; titre dupliqué ; profil non indexable |
| `/u/karim_haddad` | idem | **0** | 200 | idem |
| `/livres/auth-ibrahim-b3` | idem | **0** | 200 | **Aucun contenu SSR** ; page produit invisible |
| `/bibliotheque` | idem | **0** | 200 | Page privée exposée sans `noindex` |
| `/notifications` | idem | **0** | 200 | Page privée exposée sans `noindex` |
| `/parametres` | idem | **0** | 200 | Page privée exposée sans `noindex` |
| `/profil` | idem | **0** | 200 | Page privée exposée sans `noindex` |
| `/onboarding` | idem | **0** | 200 | Page privée exposée sans `noindex` |
| `/livres/nouveau` | idem | **0** | 200 | Page privée exposée sans `noindex` |
| `/robots.txt` | — | 1 | **404** | Fichier absent |
| `/sitemap.xml` | — | 1 | **404** | Fichier absent |
| `/llms.txt` | — | — | **404** | Fichier absent |
| `/manifest.webmanifest` | — | — | **404** | Fichier absent |
| page inexistante | — | 1 | **404** | Correct (404 + `noindex`) |

**Éléments techniques confirmés absents** (comptés dans le HTML) :
`canonical` = 0 · `og:*` = 0 · `twitter:*` = 0 · `application/ld+json` = 0 ·
`author` = 0.

**Éléments corrects** : HTTPS, HSTS, `lang="fr"`, viewport mobile,
`not-found.tsx` (404 réel avec `noindex`), en-têtes de sécurité
(CSP, nosniff, Referrer-Policy, X-Frame-Options), `icon.svg` en favicon.

**Source** : un seul `export const metadata` (dans `layout.tsx`). Aucun
`generateMetadata` sur aucune route → une seule balise title pour tout le site.

---

## 2. Mots-clés & intentions

Volumes et difficultés mesurés via treg (Serpstat, base `g_fr`, 11/10/2026).
**Toutes les requêtes cibles affichent un AI Overview Google.**

| Requête | Volume/mois | Difficulté | Intention | Page existante | Décision |
|---|---:|---:|---|---|---|
| lire des livres gratuitement | 1 600 | 38 | Info-liée + transactionnel | `/recherche` (shell) | **P0** — créer une vraie landing publique |
| site pour écrire un livre | 210 | 13 | Comparatif | aucune | **P1** — créer `/ecrire-un-livre` |
| écrire un livre en ligne | 140 | 10 | Info-liée | aucune | **P1** — même page (couvrir la variante) |
| publier un livre gratuitement | 110 | 5 | Transactionnel | aucune | **P0** — créer `/publier-un-livre` |
| application écrire livre | 70 | 10 | Comparatif | aucune | **P1** — absorbe par `/ecrire-un-livre` |
| alternative wattpad | (non mesuré) | — | Comparatif | aucune | **P2** — page `/alternative-wattpad` |

**Ce que la SERP dit** (verdict d'intention, lu le 11/10/2026) :
- *« publier un livre gratuitement »* → BoD, Librinova, PublierSonLivre,
  CoolLibri (pages de service/éditeurs) → **intention commerciale**, cible.
- *« site pour écrire un livre »* → WriteControl, jecrisunroman, Speechify,
  Reddit → **comparatif**, cible.
- *« écrire un livre en ligne »* → WriteControl, TheBookEdition, TheArtistAcademy
  → **info-liée**, cible.
- *« lire des livres gratuitement »* → Kifflire, YouScribe, e-Librairie Leclerc,
  Kobo → **transactionnel/info-liée**, cible.

**Requêtes « recommandation IA » (fan-out à couvrir)** — extraites des
recherches associées Google réelles :
« logiciel pour écrire un livre gratuit », « application pour écrire un livre
gratuit », « créer un livre gratuit », « meilleur site pour écrire un livre »,
« meilleure plateforme d'écriture en ligne », « livre romance en français
gratuit », « roman à lire en ligne ».

**Constat** : le site ne possède **aucune page éditoriale**. Il répond
partiellement à « lire des livres gratuitement » (via tendances/genres) mais
à **aucune** des requêtes d'écriture et de publication, qui sont pourtant les
plus proches de la conversion (créer un compte pour publier).

---

## 3. Cannibalisation & maillage

**Cannibalisation** : aucune page ne cible deux fois la même intention — le
problème est inverse, **aucune intention n'est ciblée**. Risque immédiat :
`/` et `/recherche` partagent exactement le même titre → elles se
cannibalisent par défaut.

**Maillage interne** :
- Depuis la landing : **19 liens internes** — correct pour une seule page.
- **Plancher de 5 liens internes par page** : actuellement **1 seul point
  d'entrée** (`/`, `/recherche`, `/connexion`, `/inscription` depuis le footer).
  Toute nouvelle page éditoriale devra recevoir **≥ 5 liens internes** depuis
  des pages de sujet proche.
- **Pages orphelines** : `/u/[username]` et `/livres/[id]` ne reçoivent de lien
  interne que depuis les listes client-side (donc invisibles pour un crawler
  sans JS).
- **Ancres** : correctes et descriptives (« Explorer les livres », « Romance »…).

**Règle des 60 jours (`WAIT`)** : le site est neuf, aucune page ne positionne.
La règle ne s'applique pas à ce stade — à appliquer dès qu'une page commencera
à ranker.

---

## 4. GEO — présence hors-site

Détail complet dans `geo.md`. Synthèse :

- **Backlinks : 0** (Serpstat : « No data found for requested domain »).
- **Citations IA : 0**. Sur 3 questions posées à ChatGPT (11/10/2026) :
  - *« meilleur site pour publier et lire gratuitement »* → Atramenta,
    Édition999, Wattpad, Gallica. **Open Library absent.**
  - *« alternative à Wattpad pour un auteur francophone »* → TheBookSailor,
    Fyctia, Atramenta. **Absent.**
  - *« connais-tu Open Library (open-library-zeta.vercel.app) ? »* → ChatGPT
    décrit **openlibrary.org** (Internet Archive) et déclare ne pas trouver
    d'information fiable sur le domaine cité.
- **AI Overviews** : présents sur toutes les requêtes cibles ; ils citent
  AO3, FanFiction.net, Inkitt, GoodNovel, WriteControl, Scribbook, Google Docs.
  **Le site n'y figure pas.**
- **Entités** : la marque n'existe ni sur Wikidata, ni sur Crunchbase, ni sur
  LinkedIn. Aucune co-occurrence marque ↔ mots-clés métiers hors du domaine.

---

## 5. Propositions priorisées

### P0 — bloquant (à faire pour exister)

| # | Action | Page / fichier | Impact attendu | Effort |
|---|---|---|---|---|
| P0.1 | Ajouter `app/robots.ts` (autoriser l'indexation + bots IA, déclarer le sitemap) | `src/app/robots.ts` | Débloque le crawl | 15 min |
| P0.2 | Ajouter `app/sitemap.ts` dynamique (livres publics + profils + genres + pages fixes) | `src/app/sitemap.ts` | Découverte de toutes les pages | 1 h |
| P0.3 | **Rendre `/livres/[id]` et `/u/[username]` en SSR** (split serveur/client, `generateMetadata`) | `src/app/livres/[id]/page.tsx`, `src/app/u/[username]/page.tsx` | Rend indexables les pages à plus fort volume | 1–2 j |
| P0.4 | **Un `<title>` et une meta description par page** (`generateMetadata`) | toutes les routes | Fin des titres dupliqués | 0,5 j |
| P0.5 | `noindex` sur les pages privées (`/bibliotheque`, `/notifications`, `/parametres`, `/profil`, `/onboarding`, `/livres/nouveau`, `/livres/…/ecrire`) | métadonnées de ces routes | Évite d'indexer des pages vides/privées | 1 h |
| P0.6 | Trancher un **domaine propre** (le domaine `*.vercel.app` + collision de marque `Open Library`/openlibrary.org plafonnent tout) | DNS / branding | Débloque marque + confiance | décision |

### P1 — gain rapide

| # | Action | Détail | Effort |
|---|---|---|---|
| P1.1 | OpenGraph + Twitter Cards (image d'aperçu par livre/profil) | `generateMetadata` + `opengraph-image` | 0,5 j |
| P1.2 | JSON-LD `Organization` + `WebSite` (+ `SearchAction`) sur `/` | voir section 7 | 2 h |
| P1.3 | JSON-LD `Book` sur `/livres/[id]`, `ProfilePage`/`Person` sur `/u/[username]`, `BreadcrumbList` | voir section 7 | 1 j |
| P1.4 | Créer `/publier-un-livre` (intention transactionnelle, 110/mois, difficulté 5) | contenu + CTA inscription | 1 j |
| P1.5 | Créer `/ecrire-un-livre` (couvre « site pour écrire », « écrire en ligne », « application ») + FAQ | page éditoriale + `FAQPage` | 1 j |
| P1.6 | Landing : ajouter un **bloc FAQ** (5 questions) + JSON-LD `FAQPage` | `/` | 0,5 j |
| P1.7 | `h1` manquant sur `/connexion` et `/inscription` | corriger la hiérarchie | 30 min |

### P2 — structure & GEO (long terme)

| # | Action | Détail |
|---|---|---|
| P2.1 | Pages de genre programmatiques `/genre/[slug]` (12 genres, SSR + sitemap + JSON-LD `CollectionPage`) | playbook « Locations/Curation » de `programmatic-seo` |
| P2.2 | Page `/alternative-wattpad` (comparatif honnête, tableaux) | citée par les LLM sur les requêtes « alternative » |
| P2.3 | Se faire **inclure dans les listicles tiers** (voir `geo.md`) — le vrai levier GEO |
| P2.4 | `llms.txt` + `manifest.webmanifest` | fichiers machine (section 7) |
| P2.5 | Créer les entités Wikidata / Crunchbase / LinkedIn HQStudio | alimente les corpus IA |
| P2.6 | Annuaire de soumission (voir `directory-submissions`) : destinations d'abord |

### P3 — cosmétique

- `x-powered-by: Next.js` (masquer), image OG par défaut, dates « dernière mise à jour ».

---

## 6. Ce que je n'ai PAS pu mesurer

- **Positions Google réelles du site** : le site n'est pas indexé, donc aucune
  position mesurable.
- **Volumes des requêtes « alternative wattpad », « meilleure plateforme… »** :
  non incluses dans le lot mesuré (budget), à confirmer.
- **ChatGPT** : 3 questions seulement (mode rapide), **un seul moteur**, une
  seule passe — l'AI non-déterminisme impose 3–5 passes par question pour un
  chiffre fiable. Les scores IA ci-dessus sont **indicatifs**.
- **Gemini / Perplexity / Copilot** : non testés.
- **Google AI Overview** : présence détectée (oui/non) mais **contenu de
  l'Overview non extrait mot à mot** pour chaque requête.
- **Search Console / Analytics** : non connectés — aucun clic/impression réel.
- **Trafic concurrent** : non mesuré.
- **`openlibrary.app`** (domaine suggéré par les e-mails du site) : disponibilité
  non vérifiée.

---

## 7. Artefacts prêts à installer (non déployés — cf. DIFF GATE)

### 7.1 `src/app/robots.ts`

```ts
import type { MetadataRoute } from 'next'

const BASE = process.env.SITE_URL || 'https://open-library-zeta.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/bibliotheque', '/notifications', '/parametres', '/profil', '/onboarding', '/livres/nouveau', '/livres/*/ecrire'] },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  }
}
```

> Les bots IA (GPTBot, PerplexityBot, ClaudeBot, Google-Extended, Bingbot) ne
> sont **pas** bloqués → on veut être cité. Bloquer seulement CCBot (entraînement
> seul) reste un choix, à décider.

### 7.2 `src/app/sitemap.ts` (esquisse)

```ts
import type { MetadataRoute } from 'next'
const BASE = process.env.SITE_URL || 'https://open-library-zeta.vercel.app'
const API = process.env.API_UPSTREAM!

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixed = ['', '/recherche', '/publier-un-livre', '/ecrire-un-livre'].map((p) => ({
    url: `${BASE}${p}`, changeFrequency: 'weekly' as const, priority: p === '' ? 1 : 0.8,
  }))
  const books = await fetch(`${API}/api/public/trending`).then((r) => r.json()).then((d) => d.books as {id:string;updated_at:string}[]).catch(() => [])
  return [
    ...fixed,
    ...books.map((b) => ({ url: `${BASE}/livres/${b.id}`, lastModified: new Date(b.updated_at), priority: 0.6 })),
  ]
}
```

### 7.3 `llms.txt` (racine ou `public/llms.txt`)

```markdown
# Open Library

> Plateforme française gratuite pour écrire, publier et lire des livres en ligne,
> chapitre par chapitre. Publier y est gratuit et l'auteur conserve ses droits.

Open Library permet de créer un livre, d'écrire ses chapitres dans un éditeur
en ligne, de le publier publiquement et de le faire lire. Les lecteurs suivent
des auteurs, commentent et reçoivent des recommandations.

## Services
- [Publier un livre gratuitement](https://SITE/publier-un-livre) : créer et publier un livre sans frais
- [Écrire un livre en ligne](https://SITE/ecrire-un-livre) : éditeur de chapitres, brouillons, publication
- [Explorer les livres](https://SITE/recherche) : catalogue public par genre et popularité

## Ressources
- [Tendances](https://SITE/) : livres les plus lus du moment

## À propos
- Open Library est un projet indépendant conçu par HQStudio. [À COMPLÉTER : contact, mentions légales]
```

### 7.4 JSON-LD à insérer

- **`/`** : `Organization` (name, url, logo=icon.svg) + `WebSite` avec
  `potentialAction: SearchAction` (target `${BASE}/recherche?q={search_term_string}`)
  + `FAQPage` une fois la FAQ ajoutée.
- **`/livres/[id]`** : `Book` — `name`, `author` (Person), `inLanguage:"fr"`,
  `genre`, `description`, `url`, `datePublished`/`dateModified`, `bookFormat`.
- **`/u/[username]`** : `ProfilePage` + `Person` — `name`, `alternateName`
  (=username), `description` (bio), `image` (avatar).
- **Fil d'Ariane** : `BreadcrumbList` (Accueil › Genres › Genre › Livre).

### 7.5 Métadonnées par page (stratégie `title`)

| Route | Title cible (50–60 car.) |
|---|---|
| `/` | Open Library — Publier et lire des livres gratuitement |
| `/publier-un-livre` | Publier un livre gratuitement en ligne \| Open Library |
| `/ecrire-un-livre` | Écrire un livre en ligne : sites et outils (2026) \| Open Library |
| `/livres/[id]` | {titre} — {auteur} \| Lire en ligne \| Open Library |
| `/u/[username]` | {nom} — livres et histoires \| Open Library |
| `/recherche` | Explorer des livres gratuits par genre \| Open Library |

---

## 8. Porte de sécurité — DIFF GATE (à valider avant toute mise en ligne)

**Aucune modification n'a été publiée.** Ce qui suit liste ce qui serait ajouté
et ce qui ne doit **pas** disparaître lors du passage en SSR des pages publiques
(risque identifié par la règle DIFF GATE).

### Éléments à ne pas perdre en rendant `/livres/[id]` et `/u/[username]` SSR

- `/livres/[id]` : titre, auteur, couverture, description, **liste des chapitres**,
  boutons **Lire / Suivre / J'aime**, section **commentaires**, actions
  propriétaire (modifier, supprimer, écrire un chapitre), compteur de vues.
- `/u/[username]` : bannière, avatar, nom, bio, **stats**, **liste des livres**,
  bouton **Suivre**, demandes d'abonnement, visibilité restreinte du profil.
- `/` : barre de recherche, grille des genres, cartes de tendances, CTA
  inscription/connexion, footer (liens genres, HQStudio).

### Ce que l'audit ajoute (nouveau)

- 2 fichiers (`robots.ts`, `sitemap.ts`), 1 fichier (`llms.txt`),
  2 pages éditoriales, du JSON-LD, des métadonnées par page.

> **Rien n'est déployé.** Merci de répondre **oui explicitement** avant toute
> publication, ou de demander une branche / un aperçu staging.

---

## 9. Plan d'exécution recommandé (ordre d'activation)

1. **Semaine 1** — P0.1, P0.2, P0.4, P0.5 (fichiers + métadonnées) : débloque l'indexation.
2. **Semaine 2** — P0.3 (SSR livre + profil) : rend indexable le cœur du site.
3. **Semaine 3** — P1.4 + P1.5 + P1.6 + P1.7 (pages éditoriales + FAQ).
4. **Semaine 4** — P1.2, P1.3 (JSON-LD), P2.4 (`llms.txt`, manifest).
5. **Mois 2–3** — P2.1, P2.2, P2.3 (GEO hors-site, listicles), P2.5, P2.6.

**Règles à respecter** : une intention = une page ; une page de pattern par
exécution (jamais un lot le même jour sur un domaine neuf) ; `WAIT` 60 jours
dès qu'une page commencera à ranker ; mesurer les **clics business** en Search
Console, pas le DR.
