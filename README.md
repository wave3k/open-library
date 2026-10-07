# Plume — Open Library

**Plume** est une application web (façon Wattpad) pour **écrire des livres et les relire comme de vrais livres** : bibliothèque, éditeur de chapitres avec brouillon auto-sauvegardé, et mode lecture avec lettrine, sommaire, thèmes papier / nuit / sépia.

## Fonctionnalités

- 📚 Bibliothèque : recherche, filtre par genre, tri, favoris, reprise de lecture
- ✍️ Création de livre : titre, auteur, genre, résumé, couverture 3D façon vrai livre
- 📝 Éditeur de chapitres : aperçu, compteur de mots, `Ctrl+S`, brouillon restauré en cas de perte
- 📖 Lecture : lettrine, sommaire, navigation clavier (← →), taille du texte, progression persistée
- 📊 Stats par livre (mots par chapitre), réorganisation des chapitres, export `.txt` / `.md`
- 💾 Sauvegarde automatique dans le navigateur (localStorage)

## Démarrage

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # build de production
```

## Stack

React 19 + Vite + Tailwind CSS v4 + lucide-react
