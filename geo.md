# GEO — Open Library — 11 octobre 2026

Volet GEO (Generative Engine Optimization) de l'audit. Le GEO se joue
**hors-site** : un LLM cite une marque quand des **sources tierces** la
mentionnent à côté de ses mots-clés. Ce fichier recense ce qui existe, ce qui
manque, et les contacts à viser.

---

## 1. Score de visibilité IA

Méthode `audit-visibilite-ia` (mode rapide, ChatGPT via treg/Cloro, 3 questions,
1 seule passe — voir limites).

| Composante | Calcul | Points |
|---|---|---:|
| Présence (sur 50) | 0 citation / 12 questions de découverte-comparaison | **0** |
| Position (sur 20) | aucune citation | **0** |
| Exactitude de marque (sur 15) | question de marque → réponse fausse (openlibrary.org) | **0** |
| Part de voix (sur 15) | 0 / citations du concurrent le plus cité | **0** |
| **Total** | | **0 / 100 — invisible** |

**Interprétation** : les IA recommandent les concurrents à la place de la
marque. C'est un point de départ normal pour un domaine neuf **sans aucune
source tierce**.

### Réponses testées (verbatim résumé, 11/10/2026)

| Question | Marque citée ? | Qui est cité à sa place |
|---|---|---|
| « meilleur site pour publier et lire gratuitement en français » | Non | Atramenta, Édition999, Wattpad, Gallica |
| « meilleure alternative à Wattpad pour un auteur francophone » | Non | TheBookSailor, Fyctia, Atramenta (+ Hugo Publishing) |
| « connais-tu Open Library (open-library-zeta.vercel.app) ? » | Non (confusion) | openlibrary.org (Internet Archive) |

### AI Overviews Google (contenu extrait, 11/10/2026)

| Requête FR | L'AI Overview recommande |
|---|---|
| alternative wattpad | Archive of Our Own (AO3), FanFiction.net, Inkitt, GoodNovel |
| site pour écrire un livre | WriteControl, Scribbook, Google Docs, Notion |
| publier un livre gratuitement | (overview présent — éditeurs : BoD, Librinova…) |
| écrire un livre en ligne | WriteControl, TheBookEdition, TheArtistAcademy |
| lire des livres gratuitement | (overview présent — Kifflire, YouScribe, Kobo…) |

**Aucune de ces réponses ne mentionne Open Library.**

---

## 2. Concurrents qui prennent la place (citations IA cumulées)

| Marque | Type | Citations (sur 3 réponses) |
|---|---|---:|
| Atramenta | Plateforme FR d'écriture/édition | 2 |
| Édition999 | Plateforme FR de publication | 1 |
| Wattpad | Webnovel international | 1 |
| Gallica (BnF) | Lecture classiques gratuits | 1 |
| TheBookSailor | Alternative Wattpad FR | 1 |
| Fyctia (Hugo) | Concours d'écriture FR | 1 |
| WriteControl | Logiciel d'écriture FR | 1 (AI Overview) |
| Inkitt / AO3 / FanFiction.net / GoodNovel | Webnovel/fanfic | 1 (AI Overview) |

**Lecture** : le champ francophone « écrire/publier gratuitement » est **occupé
par des acteurs identifiables** (Atramenta, Édition999, Fyctia, TheBookSailor)
et sur les comparatifs par des **listes en anglais** (Medium, Softonic,
Shortbread.ai) pour « alternative wattpad ».

---

## 3. Requêtes de recommandation IA → page du site

| Requête IA type | Page qui doit y répondre | État |
|---|---|---|
| « meilleur site pour écrire un livre gratuit » | `/ecrire-un-livre` | **à créer** |
| « meilleure plateforme pour publier un livre gratuitement » | `/publier-un-livre` | **à créer** |
| « alternative à Wattpad francophone » | `/alternative-wattpad` | **à créer** |
| « meilleur livre [genre] gratuit à lire » | `/genre/[slug]` | **à créer** |
| « qu'est-ce que Open Library » | `/` + entité | **ambigü** (collision openlibrary.org) |

---

## 4. Sources tierces — où la marque doit apparaître

`[requête IA, listicles qui rankent, nous y sommes ?, site derrière, contact]`

| Requête IA | Listicles/pages qui rankent (SERP FR) | On y est ? | Site | Action |
|---|---|---|---|---|
| alternative wattpad | medium.com — « 6 Best Wattpad Alternatives » | Non | Medium (auteur privé) | Contacter l'auteur |
| alternative wattpad | wattpad.en.softonic.com — « Top 20 free Apps like Wattpad » | Non | Softonic | Formulaire éditorial Softonic |
| alternative wattpad | shortbread.ai — « Wattpad Alternatives Comparison » | Non | Shortbread.ai | Contact éditorial |
| alternative wattpad | reddit.com/r/writing | Non | Reddit | Participation authentique (90/10) |
| alternative wattpad | quora.com — « alternatives to Wattpad » | Non | Quora | Réponse détaillée |
| écrire un livre en ligne | the-artist-academy.fr — « Quels sites/apps pour écrire » | Non | The Artist Academy | Contact éditorial |
| écrire un livre en ligne | lepigeondecoiffe.com — « 3 logiciels gratuits » | Non | blog FR | Contact éditorial |
| publier un livre gratuitement | blog.bod.fr — « Panorama communautés littéraires » | Non | BoD | Contact (mais concurrent) |
| publier un livre gratuitement | coollibri.com/blog | Non | CoolLibri | Contact (concurrent) |

**Priorité de contacts** : Medium, Softonic, Shortbread.ai, The Artist Academy,
le pigeon décoiffé (listicles thématiques), puis Quora et Reddit.

---

## 5. Entités à créer (alimentent les corpus IA)

| Entité | État | Action |
|---|---|---|
| Wikipedia | absente | créer seulement si notoriété (pas de page vide) |
| Wikidata | absente | créer l'élément Open Library (HQStudio) |
| Crunchbase | absente | fiche entreprise |
| LinkedIn (page HQStudio) | à vérifier | créer/à jour |
| GitHub (org HQStudio) | à vérifier | visibilité dev |

---

## 6. Levier « marque » — avertissement CRISPR

La marque **« Open Library » est déjà portée par un acteur massif**
(openlibrary.org, Internet Archive). Résultat observé en direct : ChatGPT a
répondu avec openlibrary.org à une question sur la marque.

**Conséquences SEO/GEO** :
- Les recherches de marque (« Open Library avis », « Open Library site »)
  ramèneront l'Internet Archive, pas ce site.
- Les LLM associent le nom à l'entité existante → exactitude de marque à 0.

**Options** (décision produit, pas technique) :
1. Adopter une marque distinctive (ex. un nom propre, pas « Open Library »).
2. Vivre avec la collision en misant sur des mots-clés métiers
   (« publier un livre gratuitement », « écrire un livre en ligne ») plutôt
   que sur la marque.
3. Toujours désambiguïser dans les contenus : « Open Library (la plateforme
   d'écriture HQStudio), à ne pas confondre avec openlibrary.org ».

---

## 7. Limites de ce volet

- 3 questions, **1 seul moteur** (ChatGPT), **1 passe** — non-déterministe.
  Pour un chiffre fiable : 3–5 passes × ChatGPT, Perplexity, Gemini, Copilot.
- Volumes des requêtes « alternative wattpad » et « meilleure plateforme »
  **non mesurés** (hors lot).
- SERP lues à un instant donné (11/10/2026), positionnement susceptible de bouger.
- Aucun outil de suivi IA en place (Peec, Otterly, ZipTie) — checks manuels
  mensuels recommandés en l'état.
