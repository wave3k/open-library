'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  ArrowLeft, Save, Eye, History, X, Loader2, Bold, Italic, Strikethrough,
  Heading1, Heading2, List, ListOrdered, Quote, Code, Undo2, Redo2, PenLine,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { usePlume } from '@/components/plume-provider'
import { BooksAPI, countWords } from '@/lib/plume'
import { cn } from '@/lib/utils'

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

/** Convertit un ancien contenu texte brut en HTML si besoin. */
function toHtml(content: string): string {
  if (!content) return ''
  if (/<[a-z][\s\S]*>/i.test(content)) return content
  return content
    .split('\n')
    .map((line) => `<p>${line || '<br>'}</p>`)
    .join('')
}

function ToolbarButton({ active, onClick, title, children }: { active?: boolean; onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      aria-pressed={active}
      className={cn('rounded-lg p-2 transition', active ? 'bg-amber-100 text-amber-900' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800')}
    >
      {children}
    </button>
  )
}

function Toolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null
  return (
    <div className="bg-card sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-2xl border border-b-0 p-1.5">
      <ToolbarButton active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Gras (Ctrl+B)"><Bold size={16} /></ToolbarButton>
      <ToolbarButton active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italique (Ctrl+I)"><Italic size={16} /></ToolbarButton>
      <ToolbarButton active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Barré"><Strikethrough size={16} /></ToolbarButton>
      <span className="mx-1 h-5 w-px bg-stone-200" />
      <ToolbarButton active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Titre 1"><Heading1 size={16} /></ToolbarButton>
      <ToolbarButton active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Titre 2"><Heading2 size={16} /></ToolbarButton>
      <span className="mx-1 h-5 w-px bg-stone-200" />
      <ToolbarButton active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Liste à puces"><List size={16} /></ToolbarButton>
      <ToolbarButton active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Liste numérotée"><ListOrdered size={16} /></ToolbarButton>
      <ToolbarButton active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Citation"><Quote size={16} /></ToolbarButton>
      <ToolbarButton active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="Code"><Code size={16} /></ToolbarButton>
      <span className="mx-1 h-5 w-px bg-stone-200" />
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Annuler"><Undo2 size={16} /></ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Rétablir"><Redo2 size={16} /></ToolbarButton>
    </div>
  )
}

export function ChapterEditor({ bookId, chapterId }: { bookId: string; chapterId: string | 'new' }) {
  const router = useRouter()
  const { user, mine, applyBook, markProgress, loadingBooks } = usePlume()
  const book = mine.find((b) => b.id === bookId) ?? null
  const chapter = chapterId !== 'new' ? book?.chapters?.find((c) => c.id === chapterId) ?? null : null
  const index = chapterId === 'new' ? (book?.chapters?.length ?? 0) : Math.max(0, (book?.chapters ?? []).findIndex((c) => c.id === chapterId))

  const baseTitle = chapter?.title ?? `Chapitre ${index + 1}`
  const baseContent = toHtml(chapter?.content ?? '')

  const [restored] = useState(() => loadDraft(bookId, chapterId))
  const [title, setTitle] = useState(restored?.title || baseTitle)
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState('')
  const [askLeave, setAskLeave] = useState(false)
  const [draftAt, setDraftAt] = useState<string | null>(restored?.savedAt ?? null)
  const [saving, setSaving] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const editor = useEditor({
    extensions: [StarterKit],
    content: restored?.content || baseContent,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: 'tiptap min-h-full outline-none' },
    },
    onUpdate: () => setError(''),
  })

  const html = editor?.getHTML() ?? ''
  const dirty = title !== baseTitle || (!!editor && html !== (baseContent || '<p></p>'))
  const words = countWords(html)

  // Autosauvegarde du brouillon
  useEffect(() => {
    if (!dirty || !editor) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      try {
        localStorage.setItem(draftKey(bookId, chapterId), JSON.stringify({ title, content: html, savedAt: new Date().toISOString() }))
        setDraftAt(new Date().toISOString())
      } catch {
        // ignore
      }
    }, 700)
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [title, html, dirty, bookId, chapterId, editor])

  const submit = async () => {
    if (words < 1) { setError('Écris au moins un mot avant d’enregistrer.'); return }
    setError('')
    setSaving(true)
    try {
      const finalTitle = title.trim() || `Chapitre ${index + 1}`
      const updated =
        chapterId === 'new'
          ? await BooksAPI.addChapter(bookId, { title: finalTitle, content: html })
          : await BooksAPI.updateChapter(bookId, chapterId, { title: finalTitle, content: html })
      applyBook(updated)
      const saved = updated.chapters.find((c) => c.title === finalTitle)
      if (saved) markProgress(bookId, saved.id)
      try { localStorage.removeItem(draftKey(bookId, chapterId)) } catch { /* ignore */ }
      toast.success('Chapitre enregistré')
      router.push(`/livres/${bookId}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Enregistrement impossible.')
    } finally {
      setSaving(false)
    }
  }

  // Ctrl+S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); submit() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, html])

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="font-semibold">Connecte-toi pour écrire.</p>
        <a href="/connexion" className={buttonVariants({ className: 'mt-4' })}>Se connecter</a>
      </div>
    )
  }
  if (!book && loadingBooks) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-stone-500">
        <Loader2 size={20} className="animate-spin" /> Chargement…
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
    try { localStorage.removeItem(draftKey(bookId, chapterId)) } catch { /* ignore */ }
    setTitle(baseTitle)
    editor?.commands.setContent(baseContent || '')
    setDraftAt(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          onClick={() => { if (dirty && words > 0) setAskLeave(true); else router.push(`/livres/${bookId}`) }}
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
        <Input id="ch-title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Titre du chapitre" className="py-3 text-lg font-bold" />
      </div>

      {preview ? (
        <div className="bg-card rounded-2xl border p-8">
          <h3 className="mb-6 text-center text-xl font-bold">{title || `Chapitre ${index + 1}`}</h3>
          <div className="book-prose book-page mx-auto max-w-2xl text-[17px]" dangerouslySetInnerHTML={{ __html: html || '<p><em>Rien à prévisualiser.</em></p>' }} />
        </div>
      ) : (
        <div>
          <Toolbar editor={editor} />
          <div className="bg-card h-[60vh] overflow-y-auto rounded-b-2xl border p-5">
            <EditorContent editor={editor} />
          </div>
          {error ? (
            <p className="mt-1 text-xs font-medium text-red-600" role="alert">{error}</p>
          ) : (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-stone-400"><PenLine size={12} /> Astuce : Ctrl+S pour enregistrer.</p>
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
