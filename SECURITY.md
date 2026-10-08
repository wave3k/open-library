# Sécurité

## Signaler une vulnérabilité

Merci de **ne pas ouvrir d'issue publique** pour une faille. Contacte le mainteneur en privé (voir le profil GitHub du dépôt) avec : description, étapes de reproduction, impact estimé.

## Mesures en place

- **Mots de passe** : PBKDF2-SHA256, 100 000 itérations (limite Workers), sel par utilisateur.
- **Sessions** : jeton aléatoire de 256 bits, stocké **haché** (SHA-256) en base, expiration 30 jours, purge quotidienne (cron).
- **Contenu des chapitres** : assaini (**liste blanche** de balises, aucun attribut) à l'écriture *et* au rendu.
- **Contrôles d'accès** : vérifiés côté Worker (propriété des livres, visibilité des profils, accessibilité des interactions).
- **Upload** : 8 Mo max, type vérifié par **magic bytes**.
- **Rate limiting** : inscription, connexion et changement de mot de passe.
- **Suppression de compte** : exige le mot de passe.
- **CORS** : origines autorisées uniquement.
- **En-têtes** : CSP, `X-Content-Type-Options`, `Referrer-Policy`, `frame-ancestors 'none'`.

## Bonnes pratiques pour les contributions

- Ne jamais faire confiance aux entrées client : revalider côté Worker.
- Ne jamais exposer l'e-mail d'un tiers (`publicProfile` l'exclut déjà).
- Utiliser des requêtes paramétrées (`.bind()`), jamais de concaténation SQL.
