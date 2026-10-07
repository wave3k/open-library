'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Loader2, Plus, X, Sparkles, Type, Palette, LayoutTemplate, Tags, Globe, Lock } from 'lucide-react'
import { toast } from 'sonner'
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
import { ImageCropper } from '@/components/image-cropper'
import {
  COVERS,
  COVER_FONTS,
  COVER_PATTERNS,
  COVER_LAYOUTS,
  COVER_COLORS,
  EMOJI_CHOICES,
  GENRES,
  MediaAPI,
  type Book,
  type BookInput,
  type CoverStyle,
} from '@/lib/plume'
import { cn } from '@/lib/utils'

const LIMITS = { title: 80, author: 40, description: 500 }
type Tab = 'infos' | 'cover'

function Counter({ count, max }: { count: number; max: number }) {
  return (
    <span className={cn('text-[11px] tabular-nums', count > max ? 'font-semibold text-red-600' : 'text-stone-400')}>
      {count}/{max}
    </span>
  )
}

function Chip({ active, onClick, children, title }: { active: boolean; onClick: () => void; children: React.ReactNode; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={cn(
        'flex items-center justify-center rounded-lg border text-sm transition',
        active ? 'border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-500' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
      )}
    >
      {children}
    </button>
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
  const [tab, setTab] = useState<Tab>('infos')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [author, setAuthor] = useState(initial?.author ?? '')
  const [genre, setGenre] = useState(initial?.genre ?? GENRES[0])
  const [description, setDescription] = useState(initial?.description ?? '')
  const [tags, setTags] = useState<string[]>(initial?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [isPublic, setIsPublic] = useState(initial?.is_public ?? true)
  const [style, setStyle] = useState<Partial<CoverStyle>>({
    preset: initial?.cover_style?.preset ?? initial?.cover ?? 'indigo',
    font: initial?.cover_style?.font ?? 'serif',
    pattern: initial?.cover_style?.pattern ?? 'none',
    layout: initial?.cover_style?.layout ?? 'classic',
    emoji: initial?.cover_style?.emoji ?? '',
    textColor: initial?.cover_style?.textColor ?? '#ffffff',
    image: initial?.cover_style?.image ?? '',
  })
  const [errors, setErrors] = useState<{ title?: string; author?: string; description?: string }>({})
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [cropFile, setCropFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (patch: Partial<CoverStyle>) => setStyle((s) => ({ ...s, ...patch }))

  const addTag = () => {
    const t = tagInput.trim().slice(0, 20)
    if (!t) return
    if (tags.length >= 5) return toast.error('5 tags maximum.')
    if (tags.includes(t)) return setTagInput('')
    setTags((prev) => [...prev, t])
    setTagInput('')
  }

  const onPickImage = async (file: File | undefined) => {
    if (!file) return
    setCropFile(file)
  }

  const onPickCoverFile = (file: File | undefined) => {
    if (!file) return
    setCropFile(file)
  }

  const onCropped = async (blob: Blob) => {
    setCropFile(null)
    setUploading(true)
    try {
      const { url } = await MediaAPI.upload(blob)
      set({ image: url })
      toast.success('Image de couverture ajoutée')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Envoi impossible.')
    } finally {
      setUploading(false)
    }
  }

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
    if (Object.keys(e).length > 0) {
      setTab('infos')
      return
    }
    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        author: author.trim(),
        genre,
        description: description.trim(),
        cover: style.preset ?? 'indigo',
        cover_style: style,
        tags,
        is_public: isPublic,
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const previewBook = { cover: style.preset, cover_style: style }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? 'Modifier le livre' : 'Créer un nouveau livre'}</DialogTitle>
          <DialogDescription>Infos, tags et une couverture qui te ressemble.</DialogDescription>
        </DialogHeader>

        <div className="flex gap-1 rounded-xl bg-stone-100 p-1">
          <button type="button" onClick={() => setTab('infos')} className={cn('flex-1 rounded-lg py-2 text-sm font-semibold', tab === 'infos' ? 'bg-white shadow' : 'text-stone-500')}>
            Infos & tags
          </button>
          <button type="button" onClick={() => setTab('cover')} className={cn('flex-1 rounded-lg py-2 text-sm font-semibold', tab === 'cover' ? 'bg-white shadow' : 'text-stone-500')}>
            Couverture
          </button>
        </div>

        <form onSubmit={submit} noValidate className="space-y-4">
          <div className="flex gap-5">
            <div className="book3d-lift hidden shrink-0 pt-1 sm:block">
              <BookCover book={previewBook} title={title.trim() || 'Titre…'} author={author.trim() || 'Auteur…'} genre={genre} size="md" />
            </div>

            <div className="min-w-0 flex-1 space-y-3.5">
              {tab === 'infos' ? (
                <>
                  <div>
                    <div className="mb-1 flex items-baseline justify-between">
                      <Label htmlFor="bk-title">Titre</Label>
                      <Counter count={title.trim().length} max={LIMITS.title} />
                    </div>
                    <Input id="bk-title" value={title} onChange={(e) => { setTitle(e.target.value); setErrors((p) => ({ ...p, title: undefined })) }} placeholder="Ex. La Cité des Brumes" maxLength={120} autoFocus aria-invalid={!!errors.title} className={errors.title ? 'border-red-400' : ''} />
                    {errors.title && <p className="mt-1 text-xs font-medium text-red-600" role="alert">{errors.title}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="mb-1 flex items-baseline justify-between">
                        <Label htmlFor="bk-author">Auteur</Label>
                        <Counter count={author.trim().length} max={LIMITS.author} />
                      </div>
                      <Input id="bk-author" value={author} onChange={(e) => { setAuthor(e.target.value); setErrors((p) => ({ ...p, author: undefined })) }} placeholder="Ton nom de plume" maxLength={80} aria-invalid={!!errors.author} className={errors.author ? 'border-red-400' : ''} />
                      {errors.author && <p className="mt-1 text-xs font-medium text-red-600" role="alert">{errors.author}</p>}
                    </div>
                    <div>
                      <div className="mb-1"><Label htmlFor="bk-genre">Genre</Label></div>
                      <Select value={genre} onValueChange={(v) => setGenre(v ?? GENRES[0])}>
                        <SelectTrigger id="bk-genre"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-baseline justify-between">
                      <Label htmlFor="bk-desc">Résumé</Label>
                      <Counter count={description.trim().length} max={LIMITS.description} />
                    </div>
                    <Textarea id="bk-desc" value={description} onChange={(e) => { setDescription(e.target.value); setErrors((p) => ({ ...p, description: undefined })) }} rows={3} maxLength={800} placeholder="De quoi parle ton histoire ?" aria-invalid={!!errors.description} className={errors.description ? 'border-red-400' : ''} />
                    {errors.description && <p className="mt-1 text-xs font-medium text-red-600" role="alert">{errors.description}</p>}
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between">
                      <Label className="flex items-center gap-1.5"><Tags size={14} /> Tags</Label>
                      <span className="text-[11px] text-stone-400">{tags.length}/5</span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                        placeholder="ex. magie, slow burn, enemies to lovers"
                        maxLength={20}
                      />
                      <Button type="button" variant="outline" onClick={addTag} disabled={tags.length >= 5}><Plus size={15} /></Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {tags.map((t) => (
                          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                            #{t}
                            <button type="button" onClick={() => setTags((p) => p.filter((x) => x !== t))} aria-label={`Retirer ${t}`} className="text-stone-400 hover:text-red-600"><X size={12} /></button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Visibilité */}
                  <div>
                    <Label>Visibilité</Label>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPublic(true)}
                        aria-pressed={isPublic}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium ${isPublic ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-stone-200 hover:bg-stone-50'}`}
                      >
                        <Globe size={15} /> Public
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsPublic(false)}
                        aria-pressed={!isPublic}
                        className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium ${!isPublic ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-stone-200 hover:bg-stone-50'}`}
                      >
                        <Lock size={15} /> Privé
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-stone-400">Un livre n’est visible des autres qu’une fois publié ET public. Sans chapitre, il reste en brouillon.</p>
                  </div>
                </>
              ) : (
                <>
                  {/* Mode de couverture */}
                  <div>
                    <Label>Type de couverture</Label>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => set({ mode: 'design' })} aria-pressed={style.mode !== 'image'}
                        className={cn('rounded-xl border px-3 py-2.5 text-sm font-medium', style.mode !== 'image' ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-stone-200 hover:bg-stone-50')}>
                        <Palette size={14} className="mr-1.5 inline" /> Design personnalisé
                      </button>
                      <button type="button" onClick={() => set({ mode: 'image' })} aria-pressed={style.mode === 'image'}
                        className={cn('rounded-xl border px-3 py-2.5 text-sm font-medium', style.mode === 'image' ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-stone-200 hover:bg-stone-50')}>
                        <ImagePlus size={14} className="mr-1.5 inline" /> Juste une image
                      </button>
                    </div>
                  </div>

                  {style.mode === 'image' ? (
                    <div>
                      <Label className="flex items-center gap-1.5"><ImagePlus size={14} /> Image de couverture</Label>
                      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(e) => onPickCoverFile(e.target.files?.[0])} />
                      <div className="mt-1.5 flex items-center gap-2">
                        <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                          <ImagePlus size={15} /> {style.image ? 'Changer l’image' : 'Choisir une image'}
                        </Button>
                        {style.image && (
                          <Button type="button" variant="ghost" className="text-red-600" onClick={() => set({ image: '' })}>
                            <X size={15} /> Retirer
                          </Button>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-stone-400">Tu recadres l’image, et le titre + l’auteur s’affichent par-dessus.</p>
                    </div>
                  ) : (
                  <>
                  {/* Palette */}
                  <div>
                    <Label className="flex items-center gap-1.5"><Palette size={14} /> Palette</Label>
                    <div className="mt-1.5 grid grid-cols-6 gap-2">
                      {COVERS.map((c) => (
                        <Chip key={c.id} active={style.preset === c.id} onClick={() => set({ preset: c.id, image: '' })} title={c.id}>
                          <span className={cn('flex h-9 w-full items-center justify-center rounded-md bg-gradient-to-br text-base', c.bg)}>{c.emoji}</span>
                        </Chip>
                      ))}
                    </div>
                  </div>

                  {/* Police */}
                  <div>
                    <Label className="flex items-center gap-1.5"><Type size={14} /> Police</Label>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {COVER_FONTS.map((f) => (
                        <Chip key={f.id} active={style.font === f.id} onClick={() => set({ font: f.id })}>
                          <span className={cn('px-2 py-1', f.className)}>{f.label}</span>
                        </Chip>
                      ))}
                    </div>
                  </div>

                  {/* Disposition */}
                  <div>
                    <Label className="flex items-center gap-1.5"><LayoutTemplate size={14} /> Disposition</Label>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {COVER_LAYOUTS.map((l) => (
                        <Chip key={l.id} active={style.layout === l.id} onClick={() => set({ layout: l.id })}>
                          <span className="px-2 py-1">{l.label}</span>
                        </Chip>
                      ))}
                    </div>
                  </div>

                  {/* Motif */}
                  <div>
                    <Label>Motif</Label>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {COVER_PATTERNS.map((p) => (
                        <Chip key={p.id} active={style.pattern === p.id} onClick={() => set({ pattern: p.id })}>
                          <span className="px-2 py-1">{p.label}</span>
                        </Chip>
                      ))}
                    </div>
                  </div>

                  {/* Couleur du texte */}
                  <div>
                    <Label>Couleur du texte</Label>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {COVER_COLORS.map((col) => (
                        <button key={col} type="button" onClick={() => set({ textColor: col })} aria-label={`Couleur ${col}`}
                          className={cn('h-8 w-8 rounded-full border', style.textColor === col ? 'ring-2 ring-amber-600 ring-offset-2' : '')}
                          style={{ background: col, borderColor: 'rgba(0,0,0,.15)' }} />
                      ))}
                    </div>
                  </div>

                  {/* Emoji */}
                  <div>
                    <Label className="flex items-center gap-1.5"><Sparkles size={14} /> Emoji</Label>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <input value={style.emoji ?? ''} onChange={(e) => set({ emoji: e.target.value })} maxLength={8} placeholder="🙂" className="h-9 w-14 rounded-md border border-stone-200 text-center text-lg" />
                      {EMOJI_CHOICES.map((em) => (
                        <button key={em} type="button" onClick={() => set({ emoji: em })} className={cn('h-8 w-8 rounded-md text-lg hover:bg-stone-100', style.emoji === em && 'bg-amber-100')}>{em}</button>
                      ))}
                    </div>
                  </div>

                  {/* Image */}
                  <div>
                    <Label className="flex items-center gap-1.5"><ImagePlus size={14} /> Image de fond</Label>
                    <div className="mt-1.5 flex items-center gap-2">
                      <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(e) => onPickImage(e.target.files?.[0])} />
                      <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                        {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />} {uploading ? 'Envoi…' : 'Choisir une image'}
                      </Button>
                      {style.image && (
                        <Button type="button" variant="ghost" className="text-red-600" onClick={() => set({ image: '' })}>
                          <X size={15} /> Retirer
                        </Button>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-stone-400">Une image remplace le dégradé. 4 Mo max.</p>
                  </div>
                  </>
                  )}
                </>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Enregistrement…' : initial ? 'Enregistrer' : 'Créer le livre'}</Button>
          </DialogFooter>
        </form>

        {cropFile && (
          <ImageCropper
            file={cropFile}
            aspect={2 / 3}
            outWidth={800}
            onCancel={() => setCropFile(null)}
            onCropped={onCropped}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
