'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { BookCover } from '@/components/book-cover'
import { COVERS, GENRES, type Book, type BookInput } from '@/lib/plume'
import { cn } from '@/lib/utils'

const LIMITS = { title: 80, author: 40, description: 500 }

function Counter({ count, max }: { count: number; max: number }) {
  return (
    <span className={cn('text-[11px] tabular-nums', count > max ? 'font-semibold text-red-600' : 'text-stone-400')}>
      {count}/{max}
    </span>
  )
}

export function BookFormDialog({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean
  initial: Book | null
  onClose: () => void
  onSave: (data: BookInput) => Promise<void>
}) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [author, setAuthor] = useState(initial?.author ?? '')
  const [genre, setGenre] = useState(initial?.genre ?? GENRES[0])
  const [description, setDescription] = useState(initial?.description ?? '')
  const [cover, setCover] = useState(initial?.cover ?? COVERS[0].id)
  const [errors, setErrors] = useState<{ title?: string; author?: string; description?: string }>({})
  const [saving, setSaving] = useState(false)

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const e: typeof errors = {}
    if (title.trim().length < 2) e.title = 'Donne un titre d’au moins 2 caractères.'
    else if (title.trim().length > LIMITS.title) e.title = `Titre trop long (max ${LIMITS.title} caractères).`
    if (author.trim().length < 2) e.author = 'Indique le nom de l’auteur.'
    else if (author.trim().length > LIMITS.author) e.author = `Nom trop long (max ${LIMITS.author} caractères).`
    if (description.trim().length > LIMITS.description)
      e.description = `Résumé trop long (max ${LIMITS.description} caractères).`
    setErrors(e)
    if (Object.keys(e).length > 0) return
    setSaving(true)
    try {
      await onSave({ title: title.trim(), author: author.trim(), genre, description: description.trim(), cover })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const inputCls = (bad?: string) => (bad ? 'border-red-400' : '')

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? 'Modifier le livre' : 'Créer un nouveau livre'}</DialogTitle>
          <DialogDescription>
            {initial ? 'Mets à jour les infos de ton livre.' : 'Donne vie à ta prochaine histoire.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} noValidate className="space-y-3.5">
          <div className="flex items-center gap-4">
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

          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <Label htmlFor="bk-title">Titre</Label>
              <Counter count={title.trim().length} max={LIMITS.title} />
            </div>
            <Input
              id="bk-title"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: undefined })) }}
              placeholder="Ex. La Cité des Brumes"
              maxLength={120}
              autoFocus
              aria-invalid={!!errors.title}
              className={inputCls(errors.title)}
            />
            {errors.title ? (
              <p className="mt-1 text-xs font-medium text-red-600" role="alert">{errors.title}</p>
            ) : (
              <p className="mt-1 text-xs text-stone-400">Un titre court et marquant, comme en librairie.</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1 flex items-baseline justify-between">
                <Label htmlFor="bk-author">Auteur</Label>
                <Counter count={author.trim().length} max={LIMITS.author} />
              </div>
              <Input
                id="bk-author"
                value={author}
                onChange={(e) => { setAuthor(e.target.value); setErrors((p) => ({ ...p, author: undefined })) }}
                placeholder="Ton nom de plume"
                maxLength={80}
                aria-invalid={!!errors.author}
                className={inputCls(errors.author)}
              />
              {errors.author && <p className="mt-1 text-xs font-medium text-red-600" role="alert">{errors.author}</p>}
            </div>
            <div>
              <div className="mb-1"><Label htmlFor="bk-genre">Genre</Label></div>
              <Select value={genre} onValueChange={(v) => setGenre(v ?? GENRES[0])}>
                <SelectTrigger id="bk-genre"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GENRES.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <Label htmlFor="bk-desc">Résumé</Label>
              <Counter count={description.trim().length} max={LIMITS.description} />
            </div>
            <Textarea
              id="bk-desc"
              value={description}
              onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: undefined })) }}
              rows={3}
              maxLength={800}
              placeholder="De quoi parle ton histoire ?"
              aria-invalid={!!errors.description}
              className={inputCls(errors.description)}
            />
            {errors.description ? (
              <p className="mt-1 text-xs font-medium text-red-600" role="alert">{errors.description}</p>
            ) : (
              <p className="mt-1 text-xs text-stone-400">Donne envie d’ouvrir le livre en deux phrases.</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Enregistrement…' : initial ? 'Enregistrer' : 'Créer le livre'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
