// Version client du sanitizer (défense en profondeur au rendu).
// Même liste blanche que worker/sanitize.js.

const ALLOWED = new Set([
  'p', 'br', 'hr', 'h1', 'h2', 'h3', 'h4',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'mark', 'span',
])

export function sanitizeHtml(input: string): string {
  let out = String(input ?? '')
  out = out.replace(/<!--[\s\S]*?-->/g, '')
  out = out.replace(/<\s*(script|style|iframe|object|embed|svg|math|template|noscript|link|meta)\b[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
  out = out.replace(/<\s*(script|style|iframe|object|embed|svg|math|link|meta|base|form|input)\b[^>]*>/gi, '')
  out = out.replace(/<\s*(\/?)\s*([a-zA-Z0-9]+)(?:[^>]*)>/g, (_m, slash: string, tag: string) => {
    const t = String(tag).toLowerCase()
    if (!ALLOWED.has(t)) return ''
    return `<${slash ? '/' : ''}${t}>`
  })
  return out
}
