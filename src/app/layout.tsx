import type { Metadata, Viewport } from 'next'
import { Suspense } from 'react'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { PlumeProvider } from '@/components/plume-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ScrollReset } from '@/components/scroll-reset'
import { SITE_URL } from '@/lib/seo'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Plume — Publier et lire des livres gratuitement',
  description: 'Publier et lire des livres gratuitement. Écris tes histoires chapitre par chapitre, partage-les et découvre celles des autres sur Plume.',
  applicationName: 'Plume',
  // Favicons : Google exige un format supporté et une taille multiple de 48px.
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icons/icon-48.png', type: 'image/png', sizes: '48x48' },
      { url: '/icons/icon-96.png', type: 'image/png', sizes: '96x96' },
      { url: '/icons/icon-144.png', type: 'image/png', sizes: '144x144' },
      { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    siteName: 'Plume',
    locale: 'fr_FR',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: '#FDC700',
}

// Applique le thème avant le premier rendu pour éviter le flash.
const themeScript = `(function(){try{var t=localStorage.getItem('plume-theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} flex min-h-screen flex-col font-sans text-stone-900 antialiased dark:text-stone-100`}>
        <ThemeProvider>
          <PlumeProvider>
            <Suspense fallback={null}>
              <ScrollReset />
            </Suspense>
            <a href="#main" className="skip-link">Aller au contenu</a>
            <Suspense fallback={<div className="h-16 border-b" />}>
              <SiteHeader />
            </Suspense>
            <main id="main" className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
              <Suspense fallback={null}>{children}</Suspense>
            </main>
            <Suspense fallback={null}>
              <SiteFooter />
            </Suspense>
            <Toaster position="bottom-center" richColors={false} />
            <Analytics />
            <SpeedInsights />
          </PlumeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
