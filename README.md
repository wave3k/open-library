# Open Library

Application web **gratuite** pour **publier et lire des livres** (façon Wattpad) : profils, bibliothèque personnelle + exploration, éditeur de chapitres enrichi, mode lecture soigné, recommandations, abonnements et notifications.

🌍 **En ligne : https://open-library-zeta.vercel.app** (front) — API : `https://open-library.lirostudio.workers.dev`

## Stack

- **Front** : React 19 + **Next.js 16** (App Router) + Tailwind CSS v4
- **Back** : Cloudflare **Workers** + **D1** (SQLite) + **R2** (images)
- **Gestionnaire de paquets** : **bun** (`bun.lock`)

## Fonctionnalités

- Landing publique (recherche + tendances), recherche sans compte, **fiches livres et profils publics**
- Comptes : inscription (mot de passe confirmé) → **onboarding** (source + genres), connexion, sessions 30 jours
- Profils : `@username` + nom d'affichage, bio, avatar/bannière (image **ou** dégradé), **visibilité public / abonnés / privé**
- Écrire : création de livre **sur une page dédiée**, couverture (design 12 palettes ou image recadrée), tags, éditeur riche (gras, italique, titres, listes…)
- Publication conditionnelle : un livre sans chapitre reste **brouillon**
- Lecture : lettrine, sommaire, thèmes papier/nuit/sépia, progression
- Social : likes, commentaires (+ likes de commentaires), **abonnements** (avec approbation si profil « abonnés »), notifications
- Stats profil + **tableau de bord analytics** (réservé au propriétaire)
- Vercel Analytics + Speed Insights

## Démarrage

```bash
bun install

# API locale (Worker + D1 + R2 locaux) → http://127.0.0.1:8787
bunx wrangler dev

# Front Next.js → http://localhost:3000 (proxy /api vers le Worker)
bun run dev
```

Variables d'environnement :

| Variable | Où | Valeur |
|---|---|---|
| `API_UPSTREAM` | `.env.local` / Vercel | local `http://127.0.0.1:8787` · staging `https://open-library-staging.lirostudio.workers.dev` · prod `https://open-library.lirostudio.workers.dev` |

## Environnements

| Étape | Commande | Cible |
|---|---|---|
| Local | `bunx wrangler dev` + `bun run dev` | D1/R2 locaux |
| Staging | `bunx wrangler deploy --env staging` | `open-library-staging…`, `plume-db-staging` |
| Prod | `bunx wrangler deploy` — **sur feu vert explicite** | `open-library…`, `plume-db` |

Le front se déploie sur **Vercel** (déploiement Git sur `main`). Ne jamais déployer en prod sans validation.

## Base de données

Migrations à appliquer **dans l'ordre** (`bunx wrangler d1 execute <DB> --remote --file=…`) :

| Fichier | Contenu |
|---|---|
| `worker/schema.sql` | schéma initial (users, sessions, books, chapters) |
| `worker/schema-v2.sql` | profils, likes, commentaires, tags, compteurs |
| `worker/schema-v3.sql` | historique de lecture (`reads`) |
| `worker/schema-v4.sql` | `onboarded` |
| `worker/schema-v5.sql` | bannière, likes de commentaires, `word_count` |
| `worker/schema-v6.sql` | abonnements (`follows`), notifications |
| `worker/schema-v7.sql` | `profile_visibility` |
| `worker/schema-v8.sql` | chapitres lus (`chapter_reads`), `banner_color` |
| `worker/schema-v9.sql` | `rate_limits`, `follows.status` (approbation) |

⚠️ `worker/cleanup-accounts.sql` **supprime tous les comptes** (outil de maintenance, à manier avec précaution).
Seed de démonstration : `node worker/make-seed.mjs` puis exécuter `worker/seed.sql`.

## Stockage média (R2)

Les buckets et bindings `MEDIA` sont déjà configurés (`wrangler.toml`, prod + staging). Créer les buckets R2 dans le dashboard Cloudflare puis déployer. L'upload est limité à 8 Mo et vérifié par signature binaire.

## Étapes suivantes

- Découper le Worker monolithique en modules par domaine
- Rendu serveur (SSR) des pages publiques (landing, recherche, fiches)
- Recherche full-text (FTS5)

## Licence

Aucune licence définie pour l'instant — voir `CONTRIBUTING.md`.
