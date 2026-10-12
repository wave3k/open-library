// Composant d'injection JSON-LD (données structurées schema.org).
// Rend un <script type="application/ld+json"> dans le HTML SSR.
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
