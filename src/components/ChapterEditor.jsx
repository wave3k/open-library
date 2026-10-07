import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Save, Eye, History, X } from 'lucide-react'
import { countWords, loadDraft, saveDraft, clearDraft } from '../lib/store.js'
import Field from './Field.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'

const TITLE_MAX = 80

function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

export default function ChapterEditor({ bookId, bookTitle, chapter, index, onBack, onSave }) {
  const chapterKey = chapter?.id ?? 'new'
  const baseTitle = chapter?.title ?? `Chapitre ${index + 1}`
  const baseContent = chapter?.content ?? ''

  const [restored] = useState(() => loadDraft(bookId, chapterKey))
  const [title, setTitle] = useState(restored?.title || baseTitle)
  const [content, setContent] = useState(restored?.content ?? baseContent)
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState('')
  const [askLeave, setAskLeave] = useState(false)
  const [draftAt, setDraftAt] = useState(restored?.savedAt ?? null)
  const timer = useRef(null)

  const dirty = title !== baseTitle || content !== baseContent
  const words = countWords(content)

  // Autosauvegarde du brouillon (anti-perte), avec debounce
  useEffect(() => {
    if (!dirty) return
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      saveDraft(bookId, chapterKey, { title, content })
      setDraftAt(new Date().toISOString())
    }, 600)
    return () => clearTimeout(timer.current)
  }, [title, content, dirty, bookId, chapterKey])

  // Ctrl/Cmd+S pour enregistrer
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        submit()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content])

  const submit = () => {
    if (!content.trim()) {
      setError('Écris quelques lignes avant d’enregistrer — même un brouillon mérite un début.')
      return
    }
    if (countWords(content) < 5) {
      setError('Un peu court pour un chapitre : écris au moins 5 mots.')
      return
    }
    clearDraft(bookId, chapterKey)
    setError('')
    onSave({ title: title.trim() || `Chapitre ${index + 1}`, content })
  }

  const discardDraft = () => {
    clearDraft(bookId, chapterKey)
    setTitle(baseTitle)
    setContent(baseContent)
    setDraftAt(null)
  }

  const requestBack = () => {
    if (dirty && content.trim()) setAskLeave(true)
    else onBack()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button onClick={requestBack} className="flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800">
          <ArrowLeft size={16} /> {bookTitle}
        </button>
        <div className="flex items-center gap-2">
          {dirty && (
            <span className="flex items-center gap-1.5 text-xs text-amber-700" title="Modifications non enregistrées">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Non enregistré
            </span>
          )}
          <button
            onClick={() => setPreview((p) => !p)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-sm font-medium ${preview ? 'border-amber-600 bg-amber-50 text-amber-800' : 'border-stone-200 bg-white'}`}
          >
            <Eye size={15} /> {preview ? 'Éditer' : 'Aperçu'}
          </button>
          <button onClick={submit} className="flex items-center gap-1.5 rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600" title="Enregistrer (Ctrl+S)">
            <Save size={15} /> Enregistrer
          </button>
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

      <Field id="ch-title" label="TITRE DU CHAPITRE" error={title.trim() ? '' : 'Le titre ne peut pas être vide.'} count={title.trim().length} max={TITLE_MAX}>
        <input
          id="ch-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Titre du chapitre"
          className="w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-lg font-bold outline-none focus:border-amber-500"
        />
      </Field>

      {preview ? (
        <div className="rounded-2xl border border-stone-200 bg-[#fdf8ee] p-8 shadow-inner">
          <h3 className="mb-6 text-center text-xl font-bold text-stone-900">{title || `Chapitre ${index + 1}`}</h3>
          <div className="book-page mx-auto max-w-2xl text-[17px] text-stone-800">
            {content.split('\n').map((p, i) => (
              <p key={i}>{p || '\u00A0'}</p>
            ))}
          </div>
        </div>
      ) : (
        <Field
          id="ch-content"
          label="TEXTE"
          hint="Astuce : Ctrl+S pour enregistrer. Sépare les paragraphes avec une ligne vide."
          error={error}
        >
          <textarea
            id="ch-content"
            value={content}
            onChange={(e) => { setContent(e.target.value); setError('') }}
            rows={18}
            placeholder="Il était une fois…"
            aria-invalid={!!error}
            className={`w-full rounded-2xl border bg-white p-5 font-mono text-sm leading-relaxed outline-none focus:border-amber-500 ${error ? 'border-red-400' : 'border-stone-200'}`}
          />
        </Field>
      )}

      <p className="text-right text-xs text-stone-400">
        {words.toLocaleString('fr-FR')} mots · ~{Math.max(1, Math.round(words / 200))} min de lecture
      </p>

      {askLeave && (
        <ConfirmDialog
          title="Quitter sans enregistrer ?"
          message="Tes modifications seront conservées en brouillon automatique et restaurées à ta prochaine visite."
          confirmLabel="Quitter"
          onCancel={() => setAskLeave(false)}
          onConfirm={() => { setAskLeave(false); onBack() }}
        />
      )}
    </div>
  )
}
