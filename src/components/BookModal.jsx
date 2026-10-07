import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { GENRES, COVERS } from '../data/seedBooks.js'
import BookCover from './BookCover.jsx'
import Field from './Field.jsx'

const LIMITS = { title: 80, author: 40, description: 500 }

export default function BookModal({ initial, onClose, onSave }) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [author, setAuthor] = useState(initial?.author ?? '')
  const [genre, setGenre] = useState(initial?.genre ?? GENRES[0])
  const [description, setDescription] = useState(initial?.description ?? '')
  const [cover, setCover] = useState(initial?.cover ?? COVERS[0].id)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const validate = () => {
    const e = {}
    if (title.trim().length < 2) e.title = 'Donne un titre d’au moins 2 caractères.'
    else if (title.trim().length > LIMITS.title) e.title = `Titre trop long (max ${LIMITS.title} caractères).`
    if (author.trim().length < 2) e.author = 'Indique le nom de l’auteur.'
    else if (author.trim().length > LIMITS.author) e.author = `Nom trop long (max ${LIMITS.author} caractères).`
    if (description.trim().length > LIMITS.description)
      e.description = `Résumé trop long (max ${LIMITS.description} caractères).`
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = (ev) => {
    ev.preventDefault()
    if (!validate()) return
    onSave({
      title: title.trim(),
      author: author.trim(),
      genre,
      description: description.trim(),
      cover,
    })
  }

  const inputCls = (bad) =>
    `w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-amber-500 ${
      bad ? 'border-red-400' : 'border-stone-200'
    }`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={initial ? 'Modifier le livre' : 'Créer un livre'}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <form onSubmit={submit} noValidate className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-stone-900">{initial ? 'Modifier le livre' : 'Créer un nouveau livre'}</h3>
          <button type="button" onClick={onClose} className="rounded p-1 hover:bg-stone-100" aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="book3d-lift">
            <BookCover cover={cover} title={title.trim() || 'Titre…'} author={author.trim() || 'Auteur…'} genre={genre} size="sm" />
          </div>
          <div className="flex-1">
            <p className="mb-1.5 text-xs font-semibold tracking-wide text-stone-500">COUVERTURE</p>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Choisir une couverture">
              {COVERS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={cover === c.id}
                  onClick={() => setCover(c.id)}
                  className={`flex h-12 items-center justify-center rounded-lg bg-gradient-to-br text-xl transition-transform hover:scale-105 ${c.bg} ${
                    cover === c.id ? 'ring-2 ring-amber-600 ring-offset-2' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={c.id}
                >
                  {c.emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <Field id="bk-title" label="TITRE" error={errors.title} count={title.trim().length} max={LIMITS.title} hint="Un titre court et marquant, comme en librairie.">
            <input
              id="bk-title"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: undefined })) }}
              placeholder="Ex. La Cité des Brumes"
              maxLength={120}
              autoFocus
              aria-invalid={!!errors.title}
              className={inputCls(errors.title)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field id="bk-author" label="AUTEUR" error={errors.author} count={author.trim().length} max={LIMITS.author}>
              <input
                id="bk-author"
                value={author}
                onChange={(e) => { setAuthor(e.target.value); setErrors((p) => ({ ...p, author: undefined })) }}
                placeholder="Ton nom de plume"
                maxLength={80}
                aria-invalid={!!errors.author}
                className={inputCls(errors.author)}
              />
            </Field>
            <Field id="bk-genre" label="GENRE">
              <select id="bk-genre" value={genre} onChange={(e) => setGenre(e.target.value)} className={inputCls(false)}>
                {GENRES.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field id="bk-desc" label="RÉSUMÉ" error={errors.description} count={description.trim().length} max={LIMITS.description} hint="Donne envie d’ouvrir le livre en deux phrases.">
            <textarea
              id="bk-desc"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: undefined })) }}
              rows={3}
              maxLength={800}
              placeholder="De quoi parle ton histoire ?"
              aria-invalid={!!errors.description}
              className={`${inputCls(errors.description)} resize-y`}
            />
          </Field>
        </div>

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-50">
            Annuler
          </button>
          <button type="submit" className="flex-1 rounded-xl bg-amber-700 py-2.5 text-sm font-semibold text-white hover:bg-amber-600">
            {initial ? 'Enregistrer' : 'Créer le livre'}
          </button>
        </div>
      </form>
    </div>
  )
}
