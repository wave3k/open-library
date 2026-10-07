'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ChevronLeft, ChevronRight, List, Type, Moon, Sun, BookOpen } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { usePlume } from '@/components/plume-provider'

const THEMES = {
  papier: 'bg-[#f6f1e5] text-stone-900',
  nuit: 'bg-stone-950 text-stone-200',
  sepia: 'bg-[#e8dcc3] text-[#4a3f2a]',
} as const

type Theme = keyof typeof THEMES
const SCROLL_ID = 'reader-scroll'

function loadPrefs(): { fontSize: number; theme: Theme } {
  try {
    const raw = localStorage.getItem('plume-reader-v1')
    if (raw) {
      const p = JSON.parse(raw) as { fontSize?: number; theme?: string }
      return {
        fontSize: Math.min(24, Math.max(14, Number(p.fontSize) || 17)),
        theme: (['papier', 'nuit', 'sepia'] as Theme[]).includes(p.theme as Theme) ? (p.theme as Theme) : 'papier',
      }
    }
  } catch {
    // ignore
  }
  return { fontSize: 17, theme: 'papier' }
}

export default function ReaderPage() {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>()
  const router = useRouter()
  const { user, mine, explore, markProgress } = usePlume()
  const book = [...mine, ...explore].find((b) => b.id === id) ?? null

  const chapters = book?.chapters ?? []
  const found = chapters.findIndex((c) => c.id === chapterId)
  const safeIdx = found >= 0 ? found : 0
  const chapter = chapters[safeIdx]

  const [prefs, setPrefs] = useState(loadPrefs)
  const { fontSize, theme } = prefs
  const [toc, setToc] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    try {
      localStorage.setItem('plume-reader-v1', JSON.stringify(prefs))
    } catch {
      // ignore
    }
  }, [prefs])

  useEffect(() => {
    const el = document.getElementById(SCROLL_ID)
    if (el) el.scrollTop = 0
    setProgress(0)
    if (book && chapter) markProgress(book.id, chapter.id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapterId, id])

  useEffect(() => {
    const el = document.getElementById(SCROLL_ID)
    if (!el) return
    const onScroll = () => {
      const max = el.scrollHeight - el.clientHeight
      setProgress(max > 0 ? Math.min(100, Math.round((el.scrollTop / max) * 100)) : 100)
    }
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [chapterId, chapter?.content])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT')) return
      if (e.key === 'ArrowRight' && safeIdx < chapters.length - 1) {
        router.push(`/livres/${id}/lire/${chapters[safeIdx + 1].id}`)
      }
      if (e.key === 'ArrowLeft' && safeIdx > 0) {
        router.push(`/livres/${id}/lire/${chapters[safeIdx - 1].id}`)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [safeIdx, chapters, id, router])

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="font-semibold">Connecte-toi pour lire.</p>
        <a href="/connexion" className={buttonVariants({ className: 'mt-4' })}>Se connecter</a>
      </div>
    )
  }

  if (!book || !chapter) {
    return (
      <div className="bg-card rounded-2xl p-10 text-center">
        <p className="font-semibold">Chapitre introuvable.</p>
        <a href={book ? `/livres/${book.id}` : '/bibliotheque'} className={buttonVariants({ className: 'mt-3' })}>Retour</a>
      </div>
    )
  }

  const prev = safeIdx > 0 ? chapters[safeIdx - 1] : null
  const next = safeIdx < chapters.length - 1 ? chapters[safeIdx + 1] : null

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => router.push(`/livres/${book.id}`)}>
          <ArrowLeft size={15} /> Retour au livre
        </Button>
        <span className="text-sm text-stone-500">
          {book.title} · chapitre {safeIdx + 1}/{chapters.length}
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          <button onClick={() => setToc((t) => !t)} className="rounded-xl bg-white p-2 shadow-sm" title="Sommaire" aria-label="Afficher le sommaire" aria-expanded={toc}>
            <List size={16} />
          </button>
          <button onClick={() => setPrefs((p) => ({ ...p, fontSize: Math.max(14, p.fontSize - 1) }))} className="rounded-xl bg-white px-2.5 py-2 text-sm font-bold shadow-sm" title="Réduire le texte" aria-label="Réduire la taille du texte">
            A-
          </button>
          <button onClick={() => setPrefs((p) => ({ ...p, fontSize: Math.min(24, p.fontSize + 1) }))} className="rounded-xl bg-white px-2.5 py-2 text-sm font-bold shadow-sm" title="Agrandir le texte" aria-label="Agrandir la taille du texte">
            <span className="flex items-center gap-1"><Type size={14} /> A+</span>
          </button>
          <button
            onClick={() => setPrefs((p) => ({ ...p, theme: p.theme === 'papier' ? 'nuit' : p.theme === 'nuit' ? 'sepia' : 'papier' }))}
            className="rounded-xl bg-white p-2 shadow-sm"
            title={`Thème : ${theme} (cliquer pour changer)`}
            aria-label="Changer de thème de lecture"
          >
            {theme === 'nuit' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>

      <div className="h-1 overflow-hidden rounded-full bg-stone-200" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Progression du chapitre">
        <div className="h-full bg-amber-600 transition-all" style={{ width: `${progress}%` }} />
      </div>

      <div className="flex gap-4">
        {toc && (
          <aside className="bg-card w-60 shrink-0 rounded-2xl border p-3">
            <p className="flex items-center gap-1.5 px-1 pb-2 text-xs font-bold uppercase text-stone-400">
              <BookOpen size={13} /> Sommaire
            </p>
            <ol className="max-h-96 space-y-1 overflow-y-auto">
              {chapters.map((c, i) => (
                <li key={c.id}>
                  <button
                    onClick={() => { router.push(`/livres/${book.id}/lire/${c.id}`); setToc(false) }}
                    className={`w-full rounded-lg px-2.5 py-2 text-left text-sm ${i === safeIdx ? 'bg-amber-100 font-semibold text-amber-900' : 'hover:bg-stone-100'}`}
                    aria-current={i === safeIdx ? 'true' : undefined}
                  >
                    <span className="mr-1.5 text-xs text-stone-400">{i + 1}.</span>
                    {c.title || `Chapitre ${i + 1}`}
                  </button>
                </li>
              ))}
            </ol>
          </aside>
        )}

        <div className="min-w-0 flex-1">
          <div id={SCROLL_ID} className={`max-h-[68vh] overflow-y-auto rounded-2xl shadow-lg ${THEMES[theme]}`}>
            <div className="mx-auto max-w-2xl px-8 py-12 sm:px-12">
              <p className="text-center text-xs uppercase tracking-[0.3em] opacity-50">{book.title}</p>
              <h2 className="mt-3 text-center text-2xl font-bold">{chapter.title}</h2>
              <div className="mx-auto my-6 flex items-center gap-3 opacity-40">
                <div className="h-px flex-1 bg-current" />
                <span>❦</span>
                <div className="h-px flex-1 bg-current" />
              </div>
              <div className="book-page" style={{ fontSize }}>
                {chapter.content.split('\n').map((p, i) => (
                  <p key={i}>{p || ' '}</p>
                ))}
              </div>
              <p className="mt-10 text-center text-sm opacity-50">— {safeIdx + 1} —</p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <Button variant="secondary" disabled={!prev} onClick={() => prev && router.push(`/livres/${book.id}/lire/${prev.id}`)}>
              <ChevronLeft size={16} /> <span className="hidden sm:inline">Chapitre précédent</span><span className="sm:hidden">Préc.</span>
            </Button>
            <span className="shrink-0 text-xs text-stone-400">{progress}% lu · ← → pour naviguer</span>
            {next ? (
              <Button onClick={() => router.push(`/livres/${book.id}/lire/${next.id}`)}>
                <span className="hidden sm:inline">Chapitre suivant</span><span className="sm:hidden">Suiv.</span> <ChevronRight size={16} />
              </Button>
            ) : (
              <Button onClick={() => router.push(`/livres/${book.id}`)}>
                Fin — retour au livre
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
