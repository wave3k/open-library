'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Eye, History, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { usePlume } from '@/components/plume-provider'
import { BooksAPI, countWords } from '@/lib/plume'

const TITLE_MAX = 80

function draftKey(bookId: string, chapterId: string) {
  return `plume-draft-v1:${bookId}:${chapterId}`
}

function loadDraft(bookId: string, chapterId: string): { title: string; content: string; savedAt: string | null } | null {
  try {
    const raw = localStorage.getItem(draftKey(bookId, chapterId))
    if (!raw) return null
    const d = JSON.parse(raw) as { title?: string; content?: string; savedAt?: string }
    if (typeof d?.content !== 'string') return null
    return { title: d.title ?? '', content: d.content ?? '', savedAt: d.savedAt ?? null }
  } catch {
    return null
  }
}

function fmtTime(iso: string | null): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export function ChapterEditor({ bookId, chapterId }: { bookId: string; chapterId: string | 'new' }) {
  const router = useRouter()
  const { user, mine, applyBook, markProgress } = usePlume()
  const book = mine.find((b) => b.id === bookId) ?? null
  const chapter = chapterId !== 'new' ? book?.chapters?.find((c) => c.id === chapterId) ?? null : null
  const index = chapterId === 'new' ? (book?.chapters?.length ?? 0) : Math.max(0, (book?.chapters ?? []).findIndex((c) => c.id === chapterId))

  const baseTitle = chapter?.title ?? `Chapitre ${index + 1}`
  const baseContent = chapter?.content ?? ''

  const [restored] = useState(() => loadDraft(bookId, chapterId))
  const [title, setTitle] = useState(restored?.title || baseTitle)
  const [content, setContent] = useState(restored?.content ?? baseContent)
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState('')
  const [askLeave, setAskLeave] = useState(false)
  const [draftAt, setDraftAt] = useState<string | null>(restored?.savedAt ?? null)
  const [saving, setSaving] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const dirty = title !== baseTitle || content !== baseContent
  const words = countWords(content)

  useEffect(() => {
    if (!dirty) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      try {
        localStorage.setItem(draftKey(bookId, chapterId), JSON.stringify({ title, content, savedAt: new Date().toISOString() }))
        setDraftAt(new Date().toISOString())
      } catch {
        // ignore
      }
    }, 600)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [title, content, dirty, bookId, chapterId])

  const submit = async () => {
    if (!content.trim()) {
      setError('Écris quelques lignes avant d’enregistrer — même un brouillon mérite un début.')
      return
    }
    if (countWords(content) < 5) {
      setError('Un peu court pour un chapitre : écris au moins 5 mots.')
      return
    }
    setError('')
    setSaving(true)
    try {
      const finalTitle = title.trim() || `Chapitre ${index + 1}`
      const updated =
        chapterId === 'new'
          ? await BooksAPI.addChapter(bookId, { title: finalTitle, content })
          : await BooksAPI.updateChapter(bookId, chapterId, { title: finalTitle, content })
      applyBook(updated)
      const saved = updated.chapters.find((c) => c.title === finalTitle && c.content === content)
      if (saved) markProgress(bookId, saved.id)
      try {
        localStorage.removeItem(draftKey(bookId, chapterId))
      } catch {
        // ignore
      }
      toast.success('Chapitre enregistré')
      router.push(`/livres/${bookId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Enregistrement impossible.')
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        submit()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content])

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="font-semibold">Connecte-toi pour écrire.</p>
        <a href="/connexion" className={buttonVariants({ className: 'mt-4' })}>Se connecter</a>
      </div>
    )
  }

  if (!book || book.owner_id !== user.id) {
    return (
      <div className="py-20 text-center">
        <p className="font-semibold">Tu ne peux écrire que dans tes propres livres.</p>
        <a href="/bibliotheque" className={buttonVariants({ variant: 'outline', className: 'mt-4' })}>Retour à la bibliothèque</a>
      </div>
    )
  }

  if (chapterId !== 'new' && !chapter) {
    return (
      <div className="py-20 text-center">
        <p className="font-semibold">Chapitre introuvable.</p>
        <a href={`/livres/${bookId}`} className={buttonVariants({ variant: 'outline', className: 'mt-4' })}>Retour au livre</a>
      </div>
    )
  }

  const discardDraft = () => {
    try {
      localStorage.removeItem(draftKey(bookId, chapterId))
    } catch {
      // ignore
    }
    setTitle(baseTitle)
    setContent(baseContent)
    setDraftAt(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={() => {
            if (dirty && content.trim()) setAskLeave(true)
            else router.push(`/livres/${bookId}`)
          }}
          className="flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800"
        >
          <ArrowLeft size={16} /> {book.title}
        </button>
        <div className="flex items-center gap-2">
          {dirty && (
            <span className="flex items-center gap-1.5 text-xs text-amber-700" title="Modifications non enregistrées">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Non enregistré
            </span>
          )}
          <Button variant={preview ? 'secondary' : 'outline'} size="sm" onClick={() => setPreview((p) => !p)}>
            <Eye size={15} /> {preview ? 'Éditer' : 'Aperçu'}
          </Button>
          <Button size="sm" onClick={submit} disabled={saving} title="Enregistrer (Ctrl+S)">
            <Save size={15} /> {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
      </div>

      {draftAt && dirty && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800">
          <History size={14} />
          <span>Brouillon restauré et autosauvegardé{draftAt ? ` (${fmtTime(draftAt)})` : ''} — rien n’est perdu.</span>
          <button onClick={discardDraft} className="ml-auto flex items-center gap-1 font-semibold hover:underline">
            <X size={13} /> Ignorer
          </button>
        </div>
      )}

      <div>
        <div className="mb-1 flex items-baseline justify-between">
          <Label htmlFor="ch-title">Titre du chapitre</Label>
          <span className="text-[11px] tabular-nums text-stone-400">{title.trim().length}/{TITLE_MAX}</span>
        </div>
        <Input
          id="ch-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Titre du chapitre"
          className="py-3 text-lg font-bold"
        />
        {!title.trim() && <p className="mt-1 text-xs font-medium text-red-600">Le titre ne peut pas être vide.</p>}
      </div>

      {preview ? (
        <div className="rounded-2xl border bg-[#fdf8ee] p-8 shadow-inner">
          <h3 className="mb-6 text-center text-xl font-bold text-stone-900">{title || `Chapitre ${index + 1}`}</h3>
          <div className="book-page mx-auto max-w-2xl text-[17px] text-stone-800">
            {content.split('\n').map((p, i) => (
              <p key={i}>{p || ' '}</p>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-1"><Label htmlFor="ch-content">Texte</Label></div>
          <Textarea
            id="ch-content"
            value={content}
            onChange={(e) => { setContent(e.target.value); setError('') }}
            rows={18}
            placeholder="Il était une fois…"
            aria-invalid={!!error}
            className={`bg-card p-5 font-mono text-sm leading-relaxed ${error ? 'border-red-400' : ''}`}
          />
          {error ? (
            <p className="mt-1 text-xs font-medium text-red-600" role="alert">{error}</p>
          ) : (
            <p className="mt-1 text-xs text-stone-400">Astuce : Ctrl+S pour enregistrer. Sépare les paragraphes avec une ligne vide.</p>
          )}
        </div>
      )}

      <p className="text-right text-xs text-stone-400">
        {words.toLocaleString('fr-FR')} mots · ~{Math.max(1, Math.round(words / 200))} min de lecture
      </p>

      <ConfirmDialog
        open={askLeave}
        title="Quitter sans enregistrer ?"
        message="Tes modifications seront conservées en brouillon automatique et restaurées à ta prochaine visite."
        confirmLabel="Quitter"
        onConfirm={() => { setAskLeave(false); router.push(`/livres/${bookId}`) }}
        onCancel={() => setAskLeave(false)}
      />
    </div>
  )
}
