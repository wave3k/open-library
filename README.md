# Open Library

**Open Library** est une application web (façon Wattpad) pour **écrire des livres et les relire comme de vrais livres** : landing page, comptes utilisateurs, bibliothèque personnelle + exploration des livres publics, éditeur de chapitres et mode lecture soigné.

🌍 **En ligne : https://open-library.lirostudio.workers.dev**

## Fonctionnalités

- 🏠 Landing page de présentation
- 🔐 Comptes : inscription en 3 étapes (compte, « comment nous as-tu connus ? », genres préférés), connexion (mot de passe PBKDF2, sessions 30 jours)
- 👤 Profils : `@username` unique + nom d’affichage, bio, avatar (emoji / couleur / photo R2), stats (livres, mots, impressions, lectures, likes, commentaires), catalogue, préférences
- 🔗 Profil de l’auteur accessible depuis chaque livre
- 📚 « Mes livres » (privés ou publics) + « Explorer » (livres publics des autres)
- ✍️ Création de livre : éditeur de couverture avancé (5 polices, dispositions, motifs, palette, couleur de texte, emoji, image), tags
- ❤️ Likes, 💬 commentaires (modération par l’auteur), 📊 stats par livre (impressions, lectures)
- 📝 Éditeur de chapitres : aperçu, compteur de mots, `Ctrl+S`, brouillon autosauvegardé, réorganisation
- 📖 Lecture : lettrine, sommaire, thèmes papier / nuit / sépia, progression, navigation clavier
- 💾 Backend Cloudflare Workers + D1 + R2

## Stockage média (R2)

L’upload d’images (avatar, couverture) utilise un bucket R2. Pour l’activer :
1. Activer R2 dans le dashboard Cloudflare (`R2 Object Storage` → Enable R2)
2. Créer les buckets `open-library-media` (prod) et `open-library-media-staging`
3. Décommenter les blocs `[[r2_buckets]]` dans `wrangler.toml`, puis redéployer

## Base de données

- `worker/schema.sql` — schéma initial
- `worker/schema-v2.sql` — profils, likes, commentaires, tags, compteurs
- `node worker/make-seed.mjs` puis `worker/seed.sql` — livres d’exemple (optionnel)
- `worker/remove-demo.sql` — supprime les livres de démo


## Démarrage

```bash
npm install
npm run dev              # front Vite http://localhost:5173 (+ proxy /api)
npx wrangler dev         # API + front http://localhost:8787
npm run build
```

## Environnements (ne jamais balancer direct en prod)

| Étape | Commande | URL / base |
|-------|----------|------------|
| Local | `npx wrangler dev` | :8787, D1 locale |
| Staging | `npx wrangler deploy --env staging` | open-library-staging.workers.dev, `plume-db-staging` |
| Prod | `npx wrangler deploy` — **uniquement sur feu vert explicite** | open-library.workers.dev, `plume-db` |

Règle : toute modification est testée sur staging d’abord (signup, livre, chapitre, explore).
La prod ne bouge que quand c’est demandé clairement.

La base D1 se gère avec `npx wrangler d1 execute plume-db --remote --command "..."`.
Schéma : `worker/schema.sql`. Seed des livres d’exemple : `node worker/make-seed.mjs` puis exécuter `worker/seed.sql`.

## Stack

React 19 + Vite + Tailwind CSS v4 + lucide-react · Cloudflare Workers + D1
