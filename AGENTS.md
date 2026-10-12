# Règles SEO & GEO — Plume

> Ces règles **priment sur les intuitions contraires**. Toute création ou
> modification d'une page passe par cette checklist avant d'être considérée
> comme terminée.
> Source : Guide SEO & GEO 2026 (Open Source / ChatSEO), restructuré en règles exécutables.

---

## 0. Principes non négociables

1. **L'intention d'achat bat le volume de trafic.** Une page qui vise un visiteur
   avec la carte bancaire à la main vaut mieux que dix pages de définitions.
   Si un mot-clé n'est ni transactionnel, ni comparatif, ni un tutoriel directement
   lié au problème que le produit résout → on ne le produit pas.
2. **Le chiffre d'affaires bat le Domain Rating.** Un DR de 70 sur des mots-clés
   sans valeur commerciale ne rapporte rien ; un DR 25 sur 10 requêtes
   transactionnelles rapporte. Ne jamais justifier un travail par un gain de DR seul.
3. **Le contenu doit porter des données propriétaires.** Cas clients, chiffres,
   captures, avis d'experts. Le contenu générique sans preuve est exposé aux
   mises à jour Google (Spam / Helpful Content) et ignoré par les LLM.
4. **Une intention = une page.** Jamais deux pages concurrentes sur la même
   intention de recherche.
5. **Règle des 60 jours.** Une page éditée dans les 60 derniers jours reste
   intacte : Google retarde délibérément l'effet des changements, une plongée
   juste après édition est normale, et annuler dans la panique lui apprend
   qu'on teste. Réviser au plus tôt à 60 jours.
6. **Une page par jour, au plus.** Sur un domaine neuf, publier quaraines de
   pages du même pattern dans la même journée crie l'automatisation. La
   régularité bat le volume.

---

## 1. Avant d'écrire une page : mots-clés & intention

### Étape 1 — Classer l'intention
Pour chaque page, écrire en tête de fichier l'intention ciblée, dans cet ordre de priorité :

1. **Transactionnel direct** : service, produit, tarif, devis, prix, « commander », « acheter ».
2. **Comparaison / décision** : « meilleur », « avis », « alternative à », « vs », « que choisir ».
3. **Informationnel lié au problème** : tutoriel, guide opérationnel qui mène
   directement à la solution (interdit : les sujets « éducatifs » sans lien commercial).

### Étape 2 — Extraire les mots-clés (sans payer)
- **Prompting** : faire lister par l'IA les requêtes que le persona tape à chaque
  étape d'achat (découverte → comparaison → achat), puis ne garder que les
  étapes 2 et 3.
- **Google Ads Keyword Planner** : volumes réels et concurrence, sans dépenser.
- **Concurrence** : identifier les pages concurrentes qui convertissent,
  analyser leur positionnement, cibler leurs failles.
- **Google Suggest** : requête graine + `*` à la fin, puis `*` au début — chaque
  position remonte un lot de variantes. Gratuit, et c'est là que naissent les patterns.

### Étape 2 bis — Lire la SERP pour trancher (aucun outil requis)
Pour chaque mot-clé candidat, Google le mot-clé et regarder ce qui rank :
- **pages de vente, tarifs, catégories avec prix, landing** → intention
  commerciale → cible.
- **articles de blog, encarts de définition, Wikipédia** → intention
  informationnelle → `DROPPED` pour les six premiers mois.

Google a déjà fait les tests d'intention : la SERP est le verdict, pas notre avis.

### Étape 3 — Refuser le trafic de vanité
Si la requête ne contient aucun signal de besoin commercial (définition pure,
histoire, curiosité) → marquer `DROPPED` plutôt que la produire.

---

## 2. On-page : obligatoire sur chaque page

### Balise `<title>` — levier n°1
- Mot-clé principal **au début** de la balise.
- Déclinaison ou synonyme juste après : `Consultant SEO Paris | Freelance SEO`.
- **Un seul mot peut décider** si la page rank sur une requête ou cinq : le
  title doit couvrir le pattern principal **et** sa déclinaison.
- **Mots-clés secondaires** : lister toutes les requêtes pour lesquelles le n°1
  actuel se positionne en top 5 — c'est la preuve que Google les considère
  comme relevant de la même page. Le title et la page doivent les couvrir tous.
- Longueur : 50–60 caractères (truncation = perte de clic).
- Un seul mot ajouté ou retiré peut faire bouger la page : jamais de title
  modifié sans noter l'ancien et la date (pour attribuer l'effet).

### CTR : travailler la SERP, pas seulement le classement
- Parenthèses/crochets : `[Guide 2026]`, `(Méthode testée)`.
- Preuve sociale dans le title : `+100 clients`, `5/5`.
- **La meta description ne fait presque pas ranker** : son unique métier est de
  vendre le clic (bénéfice concret + appel à l'action).
- Vérifier le rendu desktop **et** mobile.

### Liens internes — plancher, pas levier
- Google découvre les pages en cliquant : une page sans lien entrant interne
  n'existe quasiment pas.
- **Minimum 5 liens internes vers chaque nouvelle page**, depuis des pages de
  sujet proche, en texte courant (les mots autour du lien ajoutent du contexte).
- Pages d'argent → dans le **header**. Longue traîne → dans le **footer**.
  Les meilleurs → **dans le corps**, avec pour ancre le mot-clé exact.
- Cette liberté d'ancrage **s'arrête à son propre domaine** : sur les liens
  externes, ancre naturelle (marque, « ici », URL), exact-match rarement.

### Structure
- Un seul `<h1>`, contenant l'intention.
- Hiérarchie `<h2>`/`<h3>` sémantique, pas décorative.
- Réponses directes aux questions courantes placées **en haut** des sections
  (format FAQ / Answer Engine), pas enfouies.
- Listes et tableaux pour les données comparatives — les bots IA et les
  extraits enrichis lisent les structures, pas les paragraphes monolithes.

---

## 3. GEO — être cité par ChatGPT / Perplexity / Claude / AI Overviews

### Règle centrale
> Un LLM ne vous cite pas parce que vous le prétendez sur votre site. Il vous cite
> quand **des sources tierces** répètent votre marque à côté de vos mots-clés métiers.

### Ce que fait l'agent sur chaque nouveau site
1. **Cartographier les sources tierces** du secteur (presse spécialisée, blogs,
   annuaires d'autorité, comparatifs, podcasts, gouvernement/associations).
   Produire la liste en sortie d'audit.
2. **Vérifier la co-occurrence** : la marque apparaît-elle avec ses mots-clés
   hors de son propre domaine ? Si non → plan de mentions.
3. **Structurer pour l'extraction** : paragraphes de réponse directe, balises
   sémantiques, FAQ, données chiffrées citables (les LLM extraient les faits
   précis, pas le texte flou).
4. **Préparer les requêtes de recommandation** : identifier les formulations
   exactes qu'un utilisateur tape à l'IA (`meilleur X pour Y`, `alternative à X`,
   `X avis`) et s'assurer qu'une page de site répond à chacune.

### La mécanique du GEO = de la requête Google déguisée
Quand un LLM n'a pas la réponse, il **cherche sur Google** — et il ne cherche
pas la question posée à voix haute, il cherche quelque chose comme :
`meilleur <mot-clé argent> <année en cours>` (« best » parce que l'utilisateur
veut une recommandation, l'année parce qu'il veut des sources fraîches).

Donc, concrètement :
- **Ajouter « meilleur » + l'année en cours au title** des pages commerciales
  déjà existantes (en passant par la procédure de modification, jamais en direct).
- **Publier des classements** sur ces requêtes (`Meilleur X 2026`).
- **Le levier réel : se faire inclure dans les classements tierces.** Se
  positionner soi-même 1er sur son propre site ne fonctionne plus vraiment ;
  c'est **l'article externe qui liste et classe** que le LLM cite comme source.
  Lister les listicles du secteur qui ne nous mentionnent pas et préparer
  l'approche (une demande simple, sans argent, pour être inclus).

### Ce que l'agent ne fait PAS
- Il n'injecte pas de texte optimisé « pour l'IA » sans contenu réel.
- Il ne promet pas une citation : le GEO se joue sur l'autorité externe,
  pas sur une balise.

---

## 4. Technique : détection des pièges

### Cannibalisation
- Avant de créer une page : vérifier qu'aucune page existante ne cible la même
  intention. Si conflit → **fusionner** en un guide unique + redirection 301,
  jamais deux pages parallèles.
- En audit : croiser sitemap × mots-clés ciblés et lister les doublons d'intention.

### Netlinking & autorité
- Priorité absolue à la **pertinence thématique** du site référent.
- Un lien hors-sujet avec un DR élevé vaut moins qu'un lien on-topic avec un
  DR modeste. Refuser tout lien sans rapport avec la thématique.
- **Le scoreboard n'est pas le DR** : c'est Search Console — clics en hausse
  sur les mots-clés business, entrées en top 3. Un DR qui baisse avec des
  clics qui montent n'est pas un problème.
- **Attente** : après un changement, donner jusqu'à **deux mois** avant de
  conclure. Après 3 mois sur une page bonne → envisager des liens.
- **Avant d'acheter un lien** : la page qui lie doit elle-même ranker sur
  quelque chose, et être sur notre sujet. Ancre : majoritairement naturelle
  (marque, « ici », URL, « source ») ; l'ancre exacte réservée aux meilleurs
  liens — un mur d'ancres exactes est l'empreinte la plus facile à détecter.

### Multi-plateforme (les barres de recherche ne sont pas que Google)
- Chaque barre de recherche est un moteur : YouTube, TikTok, Amazon, ChatGPT.
  Partout : besoin utilisateur → métadonnées optimisées → signaux d'engagement.
- **YouTube × Google** : une vidéo ciblée sur un mot-clé compétitif capte
  deux emplacements en page 1 (site + carrousel vidéo). Prévoir ce levier
  sur les pages commerciales stratégiques.

### Automatisation
- L'IA sert à automatiser l'ennui : audit technique, suivi de positions,
  génération de titres, vérification de maillage.
- L'IA ne produit jamais de contenu final non relu : garder une touche humaine
  et des données propriétaires à chaque publication.

---

## 5. Porte de sécurité avant toute mise en ligne — le DIFF GATE

**Règle absolue** : un agent qui peut modifier une page en ligne peut aussi
supprimer en silence la chose pour laquelle la page existait (un tableau de
classement, un formulaire, un bloc de preuve). Ça s'est déjà produit.

Avant toute publication ou mise à jour d'une page :
1. Lister **chaque élément** présent dans l'ancienne version et **absent** de
   la nouvelle : tableaux, classements, formulaires, quiz, vidéos intégrées,
   images, liens internes, blocs de preuve.
2. **Montrer cette liste** à l'utilisateur.
3. Publier **uniquement après un oui explicite**. À défaut : brouillon,
   branche, ou brouillon CMS — jamais en direct.

Le jour où le filtre ne rattrape rien est le jour où on peut arrêter de
l'utiliser. Ce jour n'arrive pas : on le garde, même quand il ralentit.

---

## 6. Checklist de sortie — une page n'est « faite » que si

- [ ] Intention ciblée écrite et classée (transactionnelle / comparatif / info liée)
- [ ] Mot-clé principal en tête du `<title>`, 50–60 caractères
- [ ] Mots-clés secondaires du n°1 couverts (page + title)
- [ ] Meta description : vend le clic, avec CTA
- [ ] Minimum **5 liens internes** pointant vers cette page
- [ ] Page non éditée depuis moins de 60 jours (`WAIT` sinon)
- [ ] DIFF GATE : liste des éléments perdus montrée, oui explicite obtenu
- [ ] Un seul `<h1>` ; hiérarchie `<h2>`/`<h3>` sémantique
- [ ] Réponse directe en haut de chaque section clé
- [ ] Aucune autre page du site ne cible la même intention
- [ ] Au moins un élément de preuve propriétaire (chiffre, cas client, capture)
- [ ] Bloc FAQ / questions-réponses présent
- [ ] Données structurées lisibles (listes, tableaux)
- [ ] Hors-site : page identifiée pour les sources tierces / mentions GEO
- [ ] Requêtes « recommandation IA » couvertes par une page du site
- [ ] Si page commerciale stratégique : levier YouTube envisagé

---

## 7. Rappel de mesure

- Mesurer le **trafic monetizable** et les conversions, pas le DR, pas les
  backlinks bruts, pas le trafic total.
- Toute modification de `<title>` est datée pour pouvoir attribuer le mouvement
  de position.
- En cas de doute entre deux options → celle qui sert l'intention d'achat.

---

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
