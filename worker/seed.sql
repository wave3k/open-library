INSERT OR IGNORE INTO users (id, name, email, password_hash, salt, created_at) VALUES ('user-demo', 'Communauté Plume', 'demo@plume.local', '3b6d249727e0751a90d27843e1860fe74020866f099ef064c55b846805757b3d', '8580409d9ff3b5aeda87f5f530fef4a6', '2026-09-01');
INSERT OR IGNORE INTO books (id, owner_id, title, author, genre, description, cover, is_public, created_at, updated_at) VALUES ('livre-1', 'user-demo', 'La Cité des Brumes', 'Léa Moreau', 'Fantastique', 'Après la disparition de son frère, Inès découvre une cité cachée dans la brume où les souvenirs deviennent monnaie d’échange.', 'indigo', 1, '2026-09-12', '2026-09-12');
INSERT OR IGNORE INTO chapters (id, book_id, title, content, position, updated_at) VALUES ('ch-1-1', 'livre-1', 'Chapitre 1 — La brume', 'Inès n’avait jamais cru aux histoires de sa grand-mère. Pas avant ce matin d’octobre où la brume a recouvert la vallée, épaisse comme du lait, silencieuse comme une promesse.

Sur le rebord de la fenêtre, une plume noire. En dessous, un mot de la main de son frère : « Ne me cherche pas. Sauf si la brume t’appelle, toi aussi. »

Elle enfila son manteau, glissa la plume dans sa poche, et descendit vers le vieux pont. Chaque pas faisait résonner les pavés humides. Au milieu du pont, là où d’habitude on voyait la rivière, il n’y avait plus que du blanc.

Et dans ce blanc, une porte.', 0, '2026-09-12');
INSERT OR IGNORE INTO chapters (id, book_id, title, content, position, updated_at) VALUES ('ch-1-2', 'livre-1', 'Chapitre 2 — La porte', 'La porte était haute comme deux hommes, faite d’un bois sombre veiné de lumière bleue. Inès posa la main dessus : le bois était tiède, vivant.

« Tu as apporté un souvenir ? » demanda une voix derrière elle.

Un vieil homme au manteau rapiécé la regardait, un plateau de petites fioles à la main. Dans chacune flottait une image : un anniversaire, un premier baiser, un chien qui court.

« Ici, on ne paie qu’en souvenirs », dit-il. « Qu’es-tu prête à oublier pour entrer ? »

Inès pensa à son frère, à son rire dans l’escalier. Elle sortit la plume noire. « Celui-ci », dit-elle. « Dites-moi où il est. »', 1, '2026-09-12');
INSERT OR IGNORE INTO chapters (id, book_id, title, content, position, updated_at) VALUES ('ch-1-3', 'livre-1', 'Chapitre 3 — Le prix', 'De l’autre côté de la porte, la cité s’étendait à perte de vue : des tours de verre terni, des marchés aux souvenirs, des lanternes qui ne s’éteignaient jamais.

Le vieil homme lui tendit une fiole vide. « Souffle ton souvenir dedans. Un seul. Le plus fort. »

Inès ferma les yeux. Elle revit la cabane au fond du jardin, les deux enfants qui se promettaient de ne jamais grandir. Elle souffla. La fiole se remplit d’une lumière dorée.

Quand elle rouvrit les yeux, quelque chose manquait — un prénom sur le bout de la langue, un visage flou. Mais devant elle, une rue s’ouvrait, et au bout de la rue, une silhouette familière.

« Théo ? » murmura-t-elle.', 2, '2026-09-12');
INSERT OR IGNORE INTO books (id, owner_id, title, author, genre, description, cover, is_public, created_at, updated_at) VALUES ('livre-2', 'user-demo', 'Orbital', 'Karim Haddad', 'Science-Fiction', '2061. Une mécanicienne coincée sur une station en perdition doit choisir entre sauver l’équipage et révéler un secret qui changera tout.', 'sky', 1, '2026-09-28', '2026-09-28');
INSERT OR IGNORE INTO chapters (id, book_id, title, content, position, updated_at) VALUES ('ch-2-1', 'livre-2', 'Chapitre 1 — Alarme', 'L’alarme arracha Nadia au sommeil à 03:14, heure station. Voyant rouge, sirène sourde, et la voix calme de l’IA : « Dépressurisation module C. Évacuation recommandée. »

Elle enfila sa combinaison en quarante secondes — record personnel — et se propulsa dans le couloir axial. Dehors, par le hublot, la Terre tournait, indifférente et magnifique.

« Nadia, ici le commandant. On a perdu le module C. Et avec lui, la moitié de nos réserves d’oxygène. »

Elle serra les dents. Réparer l’irréparable : c’était exactement son travail.', 0, '2026-09-28');
INSERT OR IGNORE INTO chapters (id, book_id, title, content, position, updated_at) VALUES ('ch-2-2', 'livre-2', 'Chapitre 2 — Le secret du module D', 'Le module D était condamné depuis des années. Officiellement. Officieusement, Nadia y venait chaque semaine, parce que les conduites y chantaient d’une drôle de façon.

Derrière un panneau qu’elle n’avait jamais ouvert, elle trouva une baie de serveurs encore chaude. Des données défilaient : des relevés atmosphériques d’une exoplanète, datés d’hier.

Impossible. La station n’avait aucun télescope pointé vers Kepler-442. Sauf si quelqu’un l’avait installé en secret.

« Tu n’aurais jamais dû voir ça », dit une voix dans son dos.', 1, '2026-09-28');
INSERT OR IGNORE INTO books (id, owner_id, title, author, genre, description, cover, is_public, created_at, updated_at) VALUES ('livre-3', 'user-demo', 'Lettres à demain', 'Camille Petit', 'Romance', 'Deux inconnus s’écrivent chaque jour sans jamais se rencontrer. Jusqu’au jour où leurs lettres commencent à prédire l’avenir.', 'rose', 1, '2026-10-02', '2026-10-02');
INSERT OR IGNORE INTO chapters (id, book_id, title, content, position, updated_at) VALUES ('ch-3-1', 'livre-3', 'Chapitre 1 — La boîte jaune', 'La boîte aux lettres jaune de la rue des Lilas n’aurait jamais dû contenir autre chose que des factures. Pourtant, ce mardi, Salomé y trouva une enveloppe sans timbre, à son nom, d’une écriture inconnue.

« Chère inconnue, si tu lis ceci, c’est que la boîte a choisi. Écris-moi. Raconte-moi ta journée. — A. »

Elle rit, puis elle répondit. Parce qu’après tout, qu’avait-elle à perdre ? Une lettre, une seule.

Trois jours plus tard, une réponse l’attendait. Et au bas de la lettre, une phrase qui lui glaça le sang : « Demain, il pleuvra, et tu oublieras ton parapluie au café. Prends-en un. »', 0, '2026-10-02');
