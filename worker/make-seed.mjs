// Génère worker/seed.sql : 5 comptes, 3 livres chacun (genres variés),
// chapitres HTML, likes et abonnements. Mot de passe commun : "openlibrary".
import { pbkdf2Sync, randomBytes } from 'node:crypto'
import { writeFileSync } from 'node:fs'

const PASSWORD = 'openlibrary'
const esc = (s) => String(s ?? '').replace(/'/g, "''")
const words = (html) => String(html).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim().split(/\s+/).filter(Boolean).length

const authors = [
  {
    id: 'auth-lea', username: 'lea_moreau', name: 'Léa Moreau',
    emoji: '🌸', color: 'rose', bio: 'Romance contemporaine et rencontres qui changent une vie.',
    prefs: ['Romance', 'Poésie'],
    books: [
      {
        title: "Lettres à demain", genre: 'Romance', cover: 'rose',
        style: { preset: 'rose', font: 'serif', pattern: 'none', layout: 'classic', emoji: '💌', textColor: '#ffffff' },
        tags: ['épistolaire', 'slow burn', 'seconde chance'],
        desc: "Deux inconnus s'écrivent chaque jour sans se voir. Jusqu'au jour où leurs lettres prédisent l'avenir.",
        chapters: [
          ["Chapitre 1 — La boîte jaune", "<p>La boîte aux lettres du 12 rue des Lilas n'aurait jamais dû contenir autre chose que des factures. Pourtant, ce mardi, Salomé y trouva une enveloppe sans timbre, à son nom, d'une écriture inconnue.</p><p>« Chère inconnue, si tu lis ceci, c'est que la boîte a choisi. Écris-moi. — A. »</p><p>Elle rit, puis elle répondit. Après tout, qu'avait-elle à perdre ?</p>"],
          ["Chapitre 2 — Le café de la gare", "<p>Trois jours plus tard, une réponse l'attendait. Au bas de la lettre, une phrase lui glaça le sang : <em>« Demain, il pleuvra, et tu oublieras ton parapluie au café. Prends-en un. »</em></p><p>Il pleuvait. Elle avait oublié le parapluie. Sur la table du café, un homme lisait, un carnet à la main.</p>"],
        ],
      },
      {
        title: "Nos étés suspendus", genre: 'Romance', cover: 'amber',
        style: { preset: 'amber', font: 'hand', pattern: 'dots', layout: 'centered', emoji: '🌻', textColor: '#fde68a' },
        tags: ['vacances', 'amis to lovers'],
        desc: "Chaque été, ils se promettaient de ne jamais tomber amoureux. Cet été-là, la promesse vacilla.",
        chapters: [["Chapitre 1 — Le ponton", "<p>Ils avaient grandi sur ce ponton, entre les rires et les plongeons. « On ne tombera jamais amoureux », avaient-ils juré, les doigts croisés derrière le dos.</p><p>Puis vint cet été où tout changea.</p>"]],
      },
      {
        title: "Le Théorème du cœur", genre: 'Romance', cover: 'sky',
        style: { preset: 'sky', font: 'sans', pattern: 'grid', layout: 'band', emoji: '📐', textColor: '#e0f2fe' },
        tags: ['science', 'colocataires'],
        desc: "Une mathématicienne, un musicien, et une colocation qui ne devait durer qu'un semestre.",
        chapters: [["Chapitre 1 — Inconnus", "<p>La colocation était une variable d'ajustement : loyer trop cher, ville trop grande. Elle posa ses cartons, il accordait sa guitare.</p>"]],
      },
    ],
  },
  {
    id: 'auth-karim', username: 'karim_haddad', name: 'Karim Haddad',
    emoji: '🚀', color: 'sky', bio: 'Science-fiction, stations orbitales et fins du monde douces.',
    prefs: ['Science-Fiction', 'Science'],
    books: [
      {
        title: 'Orbital', genre: 'Science-Fiction', cover: 'sky',
        style: { preset: 'sky', font: 'mono', pattern: 'grid', layout: 'centered', emoji: '🛰️', textColor: '#e0f2fe' },
        tags: ['espace', 'IA', 'survie'],
        desc: "2061. Une mécanicienne coincée sur une station en perdition doit choisir entre sauver l'équipage et révéler un secret.",
        chapters: [
          ["Chapitre 1 — Alarme", "<p>L'alarme arracha Nadia au sommeil à 03:14, heure station. Voyant rouge, sirène sourde, et la voix calme de l'IA : <em>« Dépressurisation module C. »</em></p><p>Elle enfila sa combinaison en quarante secondes — record personnel.</p>"],
          ["Chapitre 2 — Le secret du module D", "<p>Derrière un panneau qu'elle n'avait jamais ouvert, une baie de serveurs encore chaude. Des relevés atmosphériques d'une exoplanète, datés d'hier.</p><p>« Tu n'aurais jamais dû voir ça », dit une voix dans son dos.</p>"],
        ],
      },
      {
        title: 'La Dernière Bibliothèque', genre: 'Science-Fiction', cover: 'slate',
        style: { preset: 'slate', font: 'serif', pattern: 'waves', layout: 'classic', emoji: '📚', textColor: '#ffffff' },
        tags: ['post-apo', 'livres', 'mémoire'],
        desc: "Après le Grand Silence, une archiviste parcourt le monde pour sauver les derniers livres.",
        chapters: [["Chapitre 1 — Cendres", "<p>Il ne restait que des cendres et des pages à moitié brûlées. Mais une page suffit parfois à rallumer un monde.</p>"]],
      },
      {
        title: 'Protocole Écho', genre: 'Science-Fiction', cover: 'emerald',
        style: { preset: 'emerald', font: 'display', pattern: 'stripes', layout: 'minimal', emoji: '📡', textColor: '#a7f3d0' },
        tags: ['thriller', 'temps', 'mystère'],
        desc: "Un signal venu du futur. Un seul message : ne répondez pas.",
        chapters: [["Chapitre 1 — Le signal", "<p>Le radiotélescope capta la séquence à 04:02. Elle durait exactement soixante secondes, et répétait trois mots : <strong>ne répondez pas</strong>.</p>"]],
      },
    ],
  },
  {
    id: 'auth-camille', username: 'camille_petit', name: 'Camille Petit',
    emoji: '🐉', color: 'indigo', bio: 'Fantastique, brumes et cités oubliées.',
    prefs: ['Fantastique', 'Horreur'],
    books: [
      {
        title: 'La Cité des Brumes', genre: 'Fantastique', cover: 'indigo',
        style: { preset: 'indigo', font: 'serif', pattern: 'waves', layout: 'classic', emoji: '🌫️', textColor: '#ffffff' },
        tags: ['magie', 'souvenirs', 'quête'],
        desc: "Après la disparition de son frère, Inès découvre une cité cachée où les souvenirs deviennent monnaie d'échange.",
        chapters: [
          ["Chapitre 1 — La brume", "<p>Inès n'avait jamais cru aux histoires de sa grand-mère. Pas avant ce matin d'octobre où la brume a recouvert la vallée, épaisse comme du lait.</p><p>Sur le rebord de la fenêtre, une plume noire.</p>"],
          ["Chapitre 2 — La porte", "<p>La porte était haute comme deux hommes, faite d'un bois veiné de lumière bleue. « Ici, on ne paie qu'en souvenirs », dit le vieil homme.</p>"],
        ],
      },
      {
        title: 'Le Chant des Rois Oubliés', genre: 'Fantastique', cover: 'amber',
        style: { preset: 'amber', font: 'display', pattern: 'none', layout: 'band', emoji: '👑', textColor: '#fde68a' },
        tags: ['épopée', 'couronne', 'prophétie'],
        desc: "Une couronne sans roi, un royaume qui chante, et une héritière qui refuse son destin.",
        chapters: [["Chapitre 1 — Le couronnement", "<p>On ne choisit pas d'être reine, disait-on. Pourtant, quand la couronne s'illumina, tout le royaume sut son nom.</p>"]],
      },
      {
        title: 'Les Jardins de Verre', genre: 'Fantastique', cover: 'emerald',
        style: { preset: 'emerald', font: 'serif', pattern: 'dots', layout: 'centered', emoji: '🌿', textColor: '#a7f3d0' },
        tags: ['nature', 'secrets', 'famille'],
        desc: "Dans une serre qui ne devrait pas exister, chaque plante garde un secret de famille.",
        chapters: [["Chapitre 1 — La serre", "<p>La clé rouilla dans sa main. Derrière la porte, des plantes que personne n'avait arrosées depuis vingt ans fleurissaient encore.</p>"]],
      },
    ],
  },
  {
    id: 'auth-ibrahim', username: 'ibrahim_sow', name: 'Ibrahim Sow',
    emoji: '💻', color: 'slate', bio: 'Programmation, tech et apprentissage accessible à tous.',
    prefs: ['Programmation', 'Éducatif'],
    books: [
      {
        title: 'Apprendre à coder de zéro', genre: 'Programmation', cover: 'slate',
        style: { preset: 'slate', font: 'mono', pattern: 'grid', layout: 'classic', emoji: '💻', textColor: '#e2e8f0' },
        tags: ['débutant', 'javascript', 'pratique'],
        desc: "Un guide pratique pour écrire ses premières lignes de code sans prérequis, avec des exercices concrets.",
        chapters: [
          ["Chapitre 1 — Votre premier programme", "<p>Un programme, c'est une recette. Voici la plus simple : <code>console.log('Bonjour le monde')</code>. Exécutez-la, et vous êtes développeur.</p>"],
          ["Chapitre 2 — Variables et conditions", "<p>Une variable est une boîte étiquetée. Une condition, un carrefour : <code>if (age &gt; 18) … </code></p>"],
        ],
      },
      {
        title: 'Le Web expliqué simplement', genre: 'Éducatif', cover: 'sky',
        style: { preset: 'sky', font: 'sans', pattern: 'grid', layout: 'minimal', emoji: '🌐', textColor: '#e0f2fe' },
        tags: ['html', 'réseau', 'bases'],
        desc: "HTTPS, DNS, navigateurs : comprendre comment Internet fonctionne vraiment, sans jargon.",
        chapters: [["Chapitre 1 — Que se passe-t-il quand on tape une adresse ?", "<p>Avant qu'une page apparaisse, une dizaine de machines se parlent en quelques millisecondes. Décortiquons ce voyage.</p>"]],
      },
      {
        title: 'Algorithmes du quotidien', genre: 'Éducatif', cover: 'indigo',
        style: { preset: 'indigo', font: 'mono', pattern: 'dots', layout: 'centered', emoji: '🧮', textColor: '#ffffff' },
        tags: ['logique', 'résolution', 'informatique'],
        desc: "Les algorithmes ne vivent pas que dans les ordinateurs : trier, chercher, optimiser au quotidien.",
        chapters: [["Chapitre 1 — Trier une pile de cartes", "<p>Comment trier 100 cartes le plus vite possible ? La réponse n'est pas celle qu'on croit.</p>"]],
      },
    ],
  },
  {
    id: 'auth-nadia', username: 'nadia_belkacem', name: 'Nadia Belkacem',
    emoji: '🌿', color: 'emerald', bio: 'Développement personnel, business et cuisine du cœur.',
    prefs: ['Développement personnel', 'Cuisine'],
    books: [
      {
        title: "L'Art de commencer petit", genre: 'Développement personnel', cover: 'emerald',
        style: { preset: 'emerald', font: 'hand', pattern: 'waves', layout: 'centered', emoji: '🌱', textColor: '#a7f3d0' },
        tags: ['habitudes', 'motivation', 'productivité'],
        desc: "Et si la clé n'était pas d'en faire plus, mais de commencer par un geste minuscule ?",
        chapters: [
          ["Chapitre 1 — Une minute par jour", "<p>On surestime ce qu'on peut faire en un jour et on sous-estime ce qu'on peut faire en un an. Commencez par une minute.</p>"],
          ["Chapitre 2 — La règle des deux jours", "<p>Ne jamais manquer deux fois de suite. C'est la seule règle qui compte vraiment.</p>"],
        ],
      },
      {
        title: 'Entreprendre sans se brûler', genre: 'Business', cover: 'amber',
        style: { preset: 'amber', font: 'sans', pattern: 'stripes', layout: 'band', emoji: '🔥', textColor: '#fde68a' },
        tags: ['startup', 'équilibre', 'gestion'],
        desc: "Construire un projet ambitieux sans y perdre sa santé ni ses proches.",
        chapters: [["Chapitre 1 — Le mythe du fondateur héroïque", "<p>On célèbre les nuits blanches. On oublie les vies blanches. Autre voie possible : la constance.</p>"]],
      },
      {
        title: 'Cuisiner ses souvenirs', genre: 'Cuisine', cover: 'rose',
        style: { preset: 'rose', font: 'serif', pattern: 'dots', layout: 'classic', emoji: '🍲', textColor: '#ffffff' },
        tags: ['recettes', 'mémoire', 'famille'],
        desc: "Quinze recettes transmises de génération en génération, et les histoires qui vont avec.",
        chapters: [["Chapitre 1 — Le pain du dimanche", "<p>Ma grand-mère ne mesurait jamais. « À la main », disait-elle. Voici la recette, et la patience qu'elle exige.</p>"]],
      },
    ],
  },
]

const lines = []
lines.push('-- Seed Open Library : 5 comptes x 3 livres. Mot de passe : openlibrary')
lines.push("DELETE FROM comment_likes; DELETE FROM comments; DELETE FROM likes; DELETE FROM reads; DELETE FROM follows; DELETE FROM notifications; DELETE FROM chapters; DELETE FROM books; DELETE FROM sessions; DELETE FROM users;")

const now = '2026-10-01T10:00:00.000Z'
for (const a of authors) {
  const salt = randomBytes(16).toString('hex')
  const hash = pbkdf2Sync(PASSWORD, Buffer.from(salt, 'hex'), 100_000, 32, 'sha256').toString('hex')
  lines.push(`INSERT INTO users (id, name, email, password_hash, salt, created_at, username, display_name, bio, avatar_emoji, avatar_color, preferences, onboarded) VALUES ('${a.id}', '${esc(a.name)}', '${a.username}@openlibrary.app', '${hash}', '${salt}', '${now}', '${a.username}', '${esc(a.name)}', '${esc(a.bio)}', '${a.emoji}', '${a.color}', '${esc(JSON.stringify(a.prefs))}', 1);`)

  a.books.forEach((b, bi) => {
    const bid = `${a.id}-b${bi + 1}`
    lines.push(`INSERT INTO books (id, owner_id, title, author, genre, description, cover, cover_style, tags, is_public, created_at, updated_at, views, impressions) VALUES ('${bid}', '${a.id}', '${esc(b.title)}', '${esc(a.name)}', '${esc(b.genre)}', '${esc(b.desc)}', '${esc(b.cover)}', '${esc(JSON.stringify(b.style))}', '${esc(JSON.stringify(b.tags))}', 1, '${now}', '${now}', ${120 + bi * 40}, ${300 + bi * 120});`)
    b.chapters.forEach(([ct, cc], ci) => {
      lines.push(`INSERT INTO chapters (id, book_id, title, content, position, updated_at, word_count) VALUES ('${bid}-c${ci + 1}', '${bid}', '${esc(ct)}', '${esc(cc)}', ${ci}, '${now}', ${words(cc)});`)
    })
  })
}

// Likes croisés (chaque auteur aime 2 livres d'autres auteurs)
const likePairs = [
  ['auth-lea', 'auth-karim-b1'], ['auth-lea', 'auth-camille-b1'],
  ['auth-karim', 'auth-lea-b1'], ['auth-karim', 'auth-ibrahim-b1'],
  ['auth-camille', 'auth-lea-b1'], ['auth-camille', 'auth-karim-b2'],
  ['auth-ibrahim', 'auth-nadia-b1'], ['auth-ibrahim', 'auth-karim-b1'],
  ['auth-nadia', 'auth-lea-b1'], ['auth-nadia', 'auth-camille-b2'],
]
for (const [u, b] of likePairs) lines.push(`INSERT OR IGNORE INTO likes (book_id, user_id, created_at) VALUES ('${b}', '${u}', '${now}');`)

// Abonnements (chaque auteur suit 2 autres)
const follows = [
  ['auth-lea', 'auth-camille'], ['auth-lea', 'auth-nadia'],
  ['auth-karim', 'auth-ibrahim'], ['auth-karim', 'auth-lea'],
  ['auth-camille', 'auth-lea'], ['auth-camille', 'auth-karim'],
  ['auth-ibrahim', 'auth-karim'], ['auth-ibrahim', 'auth-nadia'],
  ['auth-nadia', 'auth-lea'], ['auth-nadia', 'auth-camille'],
]
for (const [f, g] of follows) lines.push(`INSERT OR IGNORE INTO follows (follower_id, following_id, created_at) VALUES ('${f}', '${g}', '${now}');`)

writeFileSync(new URL('./seed.sql', import.meta.url), lines.join('\n') + '\n')
console.log(`seed.sql généré : ${lines.length} instructions, ${authors.length} comptes, ${authors.length * 3} livres`)
