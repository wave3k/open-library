import { ImageResponse } from 'next/og'
import { SITE_NAME } from '@/lib/seo'

// Image OpenGraph par défaut (partagée sur les réseaux et lue par les IA).
export const alt = 'Open Library — publier et lire des livres gratuitement'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #c026d3 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 700, opacity: 0.85 }}>{SITE_NAME}</div>
        <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, marginTop: 20, maxWidth: 900 }}>
          Écris ton histoire. Dévore celle des autres.
        </div>
        <div style={{ fontSize: 34, marginTop: 32, opacity: 0.9 }}>
          Publier et lire des livres gratuitement
        </div>
      </div>
    ),
    { ...size }
  )
}
