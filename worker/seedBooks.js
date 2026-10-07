export const GENRES = ['Fantastique', 'Romance', 'Science-Fiction', 'Policier', 'Aventure', 'Horreur', 'Poésie']

export const COVERS = [
  { id: 'indigo', bg: 'from-indigo-600 to-purple-700', emoji: '✨' },
  { id: 'emerald', bg: 'from-emerald-600 to-teal-700', emoji: '🌿' },
  { id: 'rose', bg: 'from-rose-500 to-orange-500', emoji: '🔥' },
  { id: 'sky', bg: 'from-sky-500 to-blue-700', emoji: '🌊' },
  { id: 'amber', bg: 'from-amber-500 to-red-600', emoji: '🌙' },
  { id: 'slate', bg: 'from-slate-700 to-slate-900', emoji: '📖' },
]

export const seedBooks = [
  {
    id: 'livre-1',
    title: 'La Cité des Brumes',
    author: 'Léa Moreau',
    genre: 'Fantastique',
    description:
      'Après la disparition de son frère, Inès découvre une cité cachée dans la brume où les souvenirs deviennent monnaie d’échange.',
    cover: 'indigo',
    createdAt: '2026-09-12',
    chapters: [
      {
        id: 'ch-1-1',
        title: 'Chapitre 1 — La brume',
        content: `Inès n’avait jamais cru aux histoires de sa grand-mère. Pas avant ce matin d’octobre où la brume a recouvert la vallée, épaisse comme du lait, silencieuse comme une promesse.\n\nSur le rebord de la fenêtre, une plume noire. En dessous, un mot de la main de son frère : « Ne me cherche pas. Sauf si la brume t’appelle, toi aussi. »\n\nElle enfila son manteau, glissa la plume dans sa poche, et descendit vers le vieux pont. Chaque pas faisait résonner les pavés humides. Au milieu du pont, là où d’habitude on voyait la rivière, il n’y avait plus que du blanc.\n\nEt dans ce blanc, une porte.`,
      },
      {
        id: 'ch-1-2',
        title: 'Chapitre 2 — La porte',
        content: `La porte était haute comme deux hommes, faite d’un bois sombre veiné de lumière bleue. Inès posa la main dessus : le bois était tiède, vivant.\n\n« Tu as apporté un souvenir ? » demanda une voix derrière elle.\n\nUn vieil homme au manteau rapiécé la regardait, un plateau de petites fioles à la main. Dans chacune flottait une image : un anniversaire, un premier baiser, un chien qui court.\n\n« Ici, on ne paie qu’en souvenirs », dit-il. « Qu’es-tu prête à oublier pour entrer ? »\n\nInès pensa à son frère, à son rire dans l’escalier. Elle sortit la plume noire. « Celui-ci », dit-elle. « Dites-moi où il est. »`,
      },
      {
        id: 'ch-1-3',
        title: 'Chapitre 3 — Le prix',
        content: `De l’autre côté de la porte, la cité s’étendait à perte de vue : des tours de verre terni, des marchés aux souvenirs, des lanternes qui ne s’éteignaient jamais.\n\nLe vieil homme lui tendit une fiole vide. « Souffle ton souvenir dedans. Un seul. Le plus fort. »\n\nInès ferma les yeux. Elle revit la cabane au fond du jardin, les deux enfants qui se promettaient de ne jamais grandir. Elle souffla. La fiole se remplit d’une lumière dorée.\n\nQuand elle rouvrit les yeux, quelque chose manquait — un prénom sur le bout de la langue, un visage flou. Mais devant elle, une rue s’ouvrait, et au bout de la rue, une silhouette familière.\n\n« Théo ? » murmura-t-elle.`,
      },
    ],
  },
  {
    id: 'livre-2',
    title: 'Orbital',
    author: 'Karim Haddad',
    genre: 'Science-Fiction',
    description:
      '2061. Une mécanicienne coincée sur une station en perdition doit choisir entre sauver l’équipage et révéler un secret qui changera tout.',
    cover: 'sky',
    createdAt: '2026-09-28',
    chapters: [
      {
        id: 'ch-2-1',
        title: 'Chapitre 1 — Alarme',
        content: `L’alarme arracha Nadia au sommeil à 03:14, heure station. Voyant rouge, sirène sourde, et la voix calme de l’IA : « Dépressurisation module C. Évacuation recommandée. »\n\nElle enfila sa combinaison en quarante secondes — record personnel — et se propulsa dans le couloir axial. Dehors, par le hublot, la Terre tournait, indifférente et magnifique.\n\n« Nadia, ici le commandant. On a perdu le module C. Et avec lui, la moitié de nos réserves d’oxygène. »\n\nElle serra les dents. Réparer l’irréparable : c’était exactement son travail.`,
      },
      {
        id: 'ch-2-2',
        title: 'Chapitre 2 — Le secret du module D',
        content: `Le module D était condamné depuis des années. Officiellement. Officieusement, Nadia y venait chaque semaine, parce que les conduites y chantaient d’une drôle de façon.\n\nDerrière un panneau qu’elle n’avait jamais ouvert, elle trouva une baie de serveurs encore chaude. Des données défilaient : des relevés atmosphériques d’une exoplanète, datés d’hier.\n\nImpossible. La station n’avait aucun télescope pointé vers Kepler-442. Sauf si quelqu’un l’avait installé en secret.\n\n« Tu n’aurais jamais dû voir ça », dit une voix dans son dos.`,
      },
    ],
  },
  {
    id: 'livre-3',
    title: 'Lettres à demain',
    author: 'Camille Petit',
    genre: 'Romance',
    description:
      'Deux inconnus s’écrivent chaque jour sans jamais se rencontrer. Jusqu’au jour où leurs lettres commencent à prédire l’avenir.',
    cover: 'rose',
    createdAt: '2026-10-02',
    chapters: [
      {
        id: 'ch-3-1',
        title: 'Chapitre 1 — La boîte jaune',
        content: `La boîte aux lettres jaune de la rue des Lilas n’aurait jamais dû contenir autre chose que des factures. Pourtant, ce mardi, Salomé y trouva une enveloppe sans timbre, à son nom, d’une écriture inconnue.\n\n« Chère inconnue, si tu lis ceci, c’est que la boîte a choisi. Écris-moi. Raconte-moi ta journée. — A. »\n\nElle rit, puis elle répondit. Parce qu’après tout, qu’avait-elle à perdre ? Une lettre, une seule.\n\nTrois jours plus tard, une réponse l’attendait. Et au bas de la lettre, une phrase qui lui glaça le sang : « Demain, il pleuvra, et tu oublieras ton parapluie au café. Prends-en un. »`,
      },
    ],
  },
]
