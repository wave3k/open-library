# Contenus SEO & GEO — questions et briefs

Livrables des skills `chasseur-questions-ia`, `brief-anti-concurrents` et
`reecriture-citable-ia`. S'appuie sur les SERP FR réelles (treg, 11/10/2026).

---

## 1. Questions IA prioritaires (`chasseur-questions-ia`)

Formulations réelles issues des **recherches associées Google** et des pages
qui rankent (marquées `[réelle]`) ; les autres sont générées `[générée]`.
Le site ne répond aujourd'hui à **aucune** de ces questions par une page dédiée.

### Top 10 à traiter en priorité

| # | Question | Intention | Potentiel | Format | Source |
|---|---|---|---|---|---|
| 1 | Où publier un livre gratuitement en français ? | Acheter/agir | **Fort** | Page service `/publier-un-livre` | réelle |
| 2 | Quel est le meilleur site pour écrire un livre en ligne ? | Comparer | **Fort** | Page comparatif `/ecrire-un-livre` | réelle |
| 3 | Quelle alternative à Wattpad pour un auteur francophone ? | Comparer | **Fort** | Comparatif `/alternative-wattpad` | réelle |
| 4 | Comment écrire un livre en ligne gratuitement ? | Résoudre | Moyen | Guide dans `/ecrire-un-livre` | réelle |
| 5 | Quel logiciel gratuit pour écrire un livre ? | Comparer | Moyen | Section outils + tableau | réelle |
| 6 | Où lire des livres gratuitement en français ? | S'informer | Fort | Landing `/lire-des-livres-gratuits` | réelle |
| 7 | Comment publier un livre sans éditeur ? | Résoudre | Moyen | Section `/publier-un-livre` | réelle |
| 8 | Comment se faire lire quand on écrit son premier roman ? | Résoudre | Moyen | Guide (funnel auteurs) | générée |
| 9 | Faut-il une application pour écrire un livre sur téléphone ? | Comparer | Faible | FAQ | générée |
| 10 | Peut-on garder les droits d'auteur en publiant gratuitement ? | Décider | **Fort** | FAQ `/publier-un-livre` | générée |

### Par étape

- **Découverte** : « j'ai envie d'écrire un livre, par où commencer ? », « est-ce
  que je peux écrire un livre sur mon téléphone ? », « comment trouver une idée
  de roman ? ».
- **Problème** : « je n'arrive pas à finir mon premier roman », « comment
  structurer les chapitres ? », « comment se faire relire ? ».
- **Comparaison** : « Wattpad ou autre plateforme ? », « meilleur site pour
  écrire », « logiciel payant ou gratuit ? », « auto-édition ou plateforme ? ».
- **Décision** : « publier un livre gratuitement », « garder ses droits d'auteur »,
  « combien coûte l'auto-édition ? (0 € ici) », « où publier une nouvelle ? ».
- **Local** : non pertinent (service en ligne, cible francophone globale).

### Décomposition de la question clé n°2 (« meilleur site pour écrire »)

Sous-questions qu'une IA explore pour construire sa réponse :
1. **Prix** — gratuit vs abonnement (WriteControl, Scribbook…).
2. **Fonctions** — gestion des chapitres, personnages, objectifs de mots,
   correcteur, sauvegarde.
3. **Publication incluse ou non** — écrire ≠ publier ; beaucoup d'outils
   s'arrêtent au manuscrit.
4. **Communauté / lecteurs** — là où le manuscrit trouve un public.
5. **Droits d'auteur** — ce que la plateforme s'approprie.
6. **Alternatives** — Wattpad, Google Docs, Notion, Word.

→ Une page qui couvre ces 6 sous-questions **et** apporte une donnée que les
autres n'ont pas (ex. « combien de livres publiés sur la plateforme ») a le
profil pour être citée.

---

## 2. Brief — page prioritaire `/ecrire-un-livre` (`brief-anti-concurrents`)

### Matrice de couverture (concurrents lus dans la SERP FR)

| Sujet | WriteControl | TheArtistAcademy | jecrisunroman | Speechify | Reddit | **Nous (cible)** |
|---|:--:|:--:|:--:|:--:|:--:|:--:|
| Comparatif outil par outil | ✗ | ✓ | ✗ | ✓ | ✗ | ✓ |
| Prix / gratuité détaillée | ✗ | ~ | ✓ | ~ | ✗ | ✓ |
| Écriture **et** publication | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| Trouver des lecteurs | ✗ | ✗ | ✗ | ✗ | ~ | ✓ |
| Droits d'auteur | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ |
| Données propriétaires | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ (à produire) |

**Trou identifié** : personne ne relie « écrire » à « avoir des lecteurs ».
Tous s'arrêtent au manuscrit. Plume peut occuper ce trou.

### Brief

- **Intention** : comparatif / info-liée. Lecteur = primo-auteur francophone,
  cherche un outil gratuit et veut être lu.
- **Angle différenciant** : le seul guide qui va de l'idée à **lecteurs réels**,
  sans installation ni abonnement, en français, avec conservation des droits.
- **H1** : « Écrire un livre en ligne : le guide des outils gratuits en 2026 »
  (alternatives : « Quel site pour écrire un livre gratuitement ? » /
  « Écrire et publier un livre sans rien payer »).
- **Plan** :
  - H2 *Peut-on écrire un livre entièrement en ligne et gratuitement ?* →
    réponse directe 40–60 mots (oui, sans installation).
  - H2 *Les meilleurs outils pour écrire un livre en 2026* → **tableau**
    (outil, prix, fonctions, publication incluse, communauté).
  - H2 *Écrire avec Plume* → éditeur de chapitres, brouillons,
    publication, suivi.
  - H2 *Comment trouver des lecteurs ?* → le point que personne ne traite.
  - H2 *Et les droits d'auteur ?* → réponse claire.
  - FAQ (5 Q/R) + JSON-LD `FAQPage`.
- **Éléments à apporter que les concurrents n'ont pas** : nombre de livres
  publiés, temps moyen de mise en ligne d'un chapitre, captures de l'éditeur,
  témoignage d'un auteur.
- **Longueur indicative** : 1 200–1 800 mots (les concurrents sont courts ;
  inutile de faire 4 000).
- **Meta** : Title ≤ 60 car. — *Écrire un livre en ligne : outils gratuits
  2026* ; Description ≤ 155 car. avec CTA *« Publie ton premier chapitre
  gratuitement »*.

---

## 3. `reecriture-citable-ia` — non applicable en l'état

Le site ne possède **aucun article de blog** à réécrire. Ce skill s'activera
dès la première page éditoriale publiée (diagnostic de citabilité sur 10, puis
réécriture « réponse d'abord / intertitres en questions »). En attendant, la
structure recommandée dans le brief ci-dessus applique déjà ses règles.

---

## 4. Rythme (`programmatic-seo` + règle 60 jours)

- **Une page par jour maximum** sur ce domaine neuf.
- **Une seule page de pattern par exécution** : ne pas créer les 12 pages de
  genre le même jour.
- Ordre : `/publier-un-livre` et `/ecrire-un-livre` d'abord (intentions
  transactionnelles), puis `/alternative-wattpad`, puis `/genre/[slug]`.
