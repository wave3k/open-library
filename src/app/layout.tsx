import type { Metadata } from 'next'
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

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Open Library — Publier et lire des livres gratuitement',
  description: 'Publier et lire des livres gratuitement. Écris tes histoires chapitre par chapitre, partage-les et découvre celles des autres sur Open Library.',
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
            <ScrollReset />
            <SiteHeader />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
            <SiteFooter />
            <Toaster position="bottom-center" richColors={false} />
            <Analytics />
            <SpeedInsights />
          </PlumeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
