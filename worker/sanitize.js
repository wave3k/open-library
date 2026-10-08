// Assainissement HTML conservateur : liste blanche de balises, AUCUN attribut.
// Le contenu des chapitres est produit par l'éditeur (TipTap StarterKit) ;
// on n'accepte que ces balises et on retire tout attribut (donc tout vecteur XSS).

const ALLOWED = new Set([
  'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'mark', 'span',
])

export function sanitizeHtml(input) {
  let out = String(input ?? '')
  // Commentaires
  out = out.replace(/<!--[\s\S]*?-->/g, '')
  // Éléments dangereux : on retire la balise ET son contenu
  out = out.replace(/<\s*(script|style|iframe|object|embed|svg|math|template|noscript|link|meta)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
  // Balises auto-fermantes dangereuses
  out = out.replace(/<\s*(script|style|iframe|object|embed|svg|math|link|meta|base|form|input)\b[^>]*>/gi, '')
  // Ne garder que les balises autorisées, sans attributs
  out = out.replace(/<\s*(\/?)\s*([a-zA-Z0-9]+)(?:[^>]*)>/g, (_m, slash, tag) => {
    const t = String(tag).toLowerCase()
    if (!ALLOWED.has(t)) return ''
    return `<${slash ? '/' : ''}${t}>`
  })
  return out
}

export function wordCountOf(html) {
  const text = String(html ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')
  return text.trim().split(/\s+/).filter(Boolean).length
}
