// Vocabulaire de présentation (genres, couvertures, dégradés, emojis).
// Séparé de l'accès données : un changement de palette ne touche pas l'API.

export const GENRES = [
  'Fantastique', 'Romance', 'Science-Fiction', 'Policier', 'Thriller', 'Aventure',
  'Horreur', 'Poésie', 'Éducatif', 'Programmation', 'Business', 'Développement personnel',
  'Histoire', 'Biographie', 'Cuisine', 'Voyage', 'Santé', 'Humour', 'Jeunesse',
  'Manga & BD', 'Science', 'Art & Musique', 'Sport', 'Religion & Spiritualité',
]

export const REFERRAL_SOURCES = [
  { id: 'youtube', label: 'YouTube' },
  { id: 'x', label: 'X (Twitter)' },
  { id: 'search', label: 'Moteur de recherche' },
  { id: 'ia', label: 'IA (ChatGPT, etc.)' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'instagram', label: 'Instagram' },
  { id: 'friend', label: 'Un ami' },
  { id: 'other', label: 'Autre' },
]

// Palettes de couvertures : id → dégradé Tailwind (swatch) + fond CSS (couverture) + emoji
export const COVERS = [
  { id: 'indigo', bg: 'from-indigo-600 to-purple-700', css: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 55%,#c026d3 100%)', emoji: '✨' },
  { id: 'emerald', bg: 'from-emerald-600 to-teal-700', css: 'linear-gradient(135deg,#059669 0%,#0d9488 55%,#0891b2 100%)', emoji: '🌿' },
  { id: 'rose', bg: 'from-rose-500 to-orange-500', css: 'linear-gradient(135deg,#e11d48 0%,#db2777 50%,#f97316 100%)', emoji: '🔥' },
  { id: 'sky', bg: 'from-sky-500 to-blue-700', css: 'linear-gradient(135deg,#0284c7 0%,#2563eb 55%,#4338ca 100%)', emoji: '🌊' },
  { id: 'amber', bg: 'from-amber-500 to-red-600', css: 'linear-gradient(135deg,#f59e0b 0%,#ea580c 55%,#dc2626 100%)', emoji: '🌙' },
  { id: 'slate', bg: 'from-slate-700 to-slate-900', css: 'linear-gradient(135deg,#334155 0%,#0f172a 60%,#020617 100%)', emoji: '📖' },
  { id: 'sunset', bg: 'from-rose-400 to-amber-400', css: 'linear-gradient(135deg,#fb7185 0%,#f59e0b 100%)', emoji: '🌅' },
  { id: 'ocean', bg: 'from-sky-400 to-teal-400', css: 'linear-gradient(135deg,#0ea5e9 0%,#14b8a6 100%)', emoji: '🐚' },
  { id: 'forest', bg: 'from-green-700 to-lime-600', css: 'linear-gradient(135deg,#166534 0%,#4d7c0f 100%)', emoji: '🌲' },
  { id: 'royal', bg: 'from-indigo-900 to-fuchsia-700', css: 'linear-gradient(135deg,#312e81 0%,#6d28d9 60%,#be185d 100%)', emoji: '👑' },
  { id: 'candy', bg: 'from-pink-400 to-violet-400', css: 'linear-gradient(135deg,#f472b6 0%,#a78bfa 100%)', emoji: '🍬' },
  { id: 'mono', bg: 'from-gray-700 to-gray-900', css: 'linear-gradient(135deg,#1f2937 0%,#111827 60%,#4b5563 100%)', emoji: '🖤' },
]

/** Dégradés disponibles pour avatar / bannière (id → CSS). */
export const BRAND_GRADIENTS = [
  { id: 'amber', label: 'Ambre', css: 'linear-gradient(135deg,#f59e0b,#ef4444)' },
  { id: 'indigo', label: 'Indigo', css: 'linear-gradient(135deg,#6366f1,#a855f7)' },
  { id: 'emerald', label: 'Émeraude', css: 'linear-gradient(135deg,#10b981,#0d9488)' },
  { id: 'rose', label: 'Rose', css: 'linear-gradient(135deg,#f43f5e,#fb923c)' },
  { id: 'sky', label: 'Ciel', css: 'linear-gradient(135deg,#0ea5e9,#2563eb)' },
  { id: 'sunset', label: 'Coucher de soleil', css: 'linear-gradient(135deg,#fb7185,#f59e0b)' },
  { id: 'royal', label: 'Royal', css: 'linear-gradient(135deg,#4338ca,#be185d)' },
  { id: 'forest', label: 'Forêt', css: 'linear-gradient(135deg,#15803d,#84cc16)' },
  { id: 'slate', label: 'Ardoise', css: 'linear-gradient(135deg,#475569,#0f172a)' },
  { id: 'mono', label: 'Nuit', css: 'linear-gradient(135deg,#1f2937,#4b5563)' },
]

export const COVER_FONTS = [
  { id: 'serif', label: 'Serif', className: 'font-serif' },
  { id: 'sans', label: 'Sans', className: 'font-sans' },
  { id: 'mono', label: 'Mono', className: 'font-mono' },
  { id: 'display', label: 'Display', className: 'cover-font-display' },
  { id: 'hand', label: 'Manuscrite', className: 'cover-font-hand' },
]

export const COVER_PATTERNS = [
  { id: 'none', label: 'Aucun' },
  { id: 'stripes', label: 'Rayures' },
  { id: 'dots', label: 'Points' },
  { id: 'grid', label: 'Grille' },
  { id: 'waves', label: 'Vagues' },
]

export const COVER_LAYOUTS = [
  { id: 'classic', label: 'Classique' },
  { id: 'centered', label: 'Centré' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'band', label: 'Bandeau' },
]

export const EMOJI_CHOICES = ['✨', '🌿', '🔥', '🌊', '🌙', '📖', '🛰️', '🗡️', '❤️', '👑', '🐉', '🚀', '🌌', '🔮', '🕯️', '🏰', '⚔️', '🧭', '🗝️', '🦋', '🌹', '☀️', '🌧️', '⚡']

export const COVER_COLORS = ['#ffffff', '#fde68a', '#a7f3d0', '#bfdbfe', '#fecaca', '#e9d5ff', '#111827']
