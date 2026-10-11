// Assainissement HTML côté Worker.
// La logique vit dans shared/sanitize.js, partagée avec le front (source unique).
import { sanitizeHtml } from '../shared/sanitize.js'

export { sanitizeHtml }

export function wordCountOf(html) {
  const text = String(html ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')
  return text.trim().split(/\s+/).filter(Boolean).length
}
