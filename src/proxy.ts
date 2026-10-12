import { NextResponse, type NextRequest } from 'next/server'

// Domaine canonique de production.
const CANONICAL_HOST = 'plume.hqmerchant.xyz'

// Anciens domaines techniques : redirigés en 308 vers le domaine canonique pour
// éviter le contenu dupliqué (et consolider les éventuels liens déjà créés).
const LEGACY_HOSTS = new Set(['open-library.vercel.app', 'open-library-zeta.vercel.app'])

export function proxy(req: NextRequest) {
  const host = (req.headers.get('host') || '').split(':')[0].toLowerCase()
  if (LEGACY_HOSTS.has(host)) {
    const url = req.nextUrl.clone()
    url.protocol = 'https:'
    url.host = CANONICAL_HOST
    url.port = ''
    return NextResponse.redirect(url, 308)
  }
  return NextResponse.next()
}

// On applique à tout sauf aux ressources statiques Next (aucun intérêt à les rediriger).
export const config = {
  matcher: ['/((?!_next/).*)'],
}
