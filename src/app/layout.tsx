import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { PlumeProvider } from '@/components/plume-provider'
import { SiteHeader } from '@/components/site-header'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Plume — Écris et lis des livres',
  description: 'Crée des livres, écris-les chapitre par chapitre et relis-les comme de vrais livres. Partage-les avec la communauté.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} min-h-screen bg-[#f3eee2] font-sans text-stone-900 antialiased`}>
        <PlumeProvider>
          <SiteHeader />
          <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
          <Toaster position="bottom-center" richColors={false} />
        </PlumeProvider>
      </body>
    </html>
  )
}
