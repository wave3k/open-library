# Plume — Open Library

**Plume** est une application web (façon Wattpad) pour **écrire des livres et les relire comme de vrais livres** : landing page, comptes utilisateurs, bibliothèque personnelle + exploration des livres publics, éditeur de chapitres et mode lecture soigné.

🌍 **En ligne : https://open-library.lirostudio.workers.dev**

## Fonctionnalités

- 🏠 Landing page de présentation
- 🔐 Comptes : inscription / connexion (mot de passe hashé PBKDF2, sessions 30 jours)
- 📚 « Mes livres » (privés ou publics) + « Explorer » (livres publics des autres)
- ✍️ Création de livre : titre, auteur, genre, résumé, couverture 3D façon vrai livre
- 📝 Éditeur de chapitres : aperçu, compteur de mots, `Ctrl+S`, brouillon autosauvegardé, réorganisation
- 📖 Lecture : lettrine, sommaire, thèmes papier / nuit / sépia, progression sauvegardée, navigation clavier
- 📊 Stats par livre, export `.txt` / `.md`, favoris
- 💾 Backend Cloudflare Workers + D1 (les anciens livres locaux sont importés à la première connexion)

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
