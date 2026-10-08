# Contribuer

## Prérequis

- **bun** (gestionnaire officiel du projet), Node 22+.
- Compte Cloudflare (Workers, D1, R2) pour déployer l'API.

## Mise en route

```bash
bun install
bunx wrangler dev   # API locale :8787
bun run dev         # front Next.js :3000
```

## Conventions

- Langue du projet : **français** (UI, messages, commentaires de code).
- Style : TypeScript, composants fonctionnels, Tailwind v4.
- Avant de proposer une modification : `bun run lint` et `bun run build` doivent passer.

## Processus

1. Travaille sur une branche.
2. Teste **en local puis sur staging** (`bunx wrangler deploy --env staging`).
3. **Ne déploie jamais en production sans validation explicite.**

## Bonnes pratiques de sécurité

Voir `SECURITY.md`. En résumé : tout contenu utilisateur est assaini côté serveur, les contrôles d'accès sont vérifiés côté Worker, jamais côté client.
