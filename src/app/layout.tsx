import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { PlumeProvider } from '@/components/plume-provider'
import { ThemeProvider } from '@/components/theme-provider'
import { SiteHeader } from '@/components/site-header'
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
      <body className={`${inter.variable} min-h-screen font-sans text-stone-900 antialiased dark:text-stone-100`}>
        <ThemeProvider>
          <PlumeProvider>
            <ScrollReset />
            <SiteHeader />
            <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
            <Toaster position="bottom-center" richColors={false} />
          </PlumeProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
