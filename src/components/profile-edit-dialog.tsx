'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, ImagePlus, X, Check } from 'lucide-react'
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
import { Avatar } from '@/components/avatar'
import { AuthAPI, COVERS, EMOJI_CHOICES, GENRES, MediaAPI, type User } from '@/lib/plume'
import { cn } from '@/lib/utils'

const USERNAME_RE = /^[a-z0-9_]{3,24}$/

export function ProfileEditDialog({
  open,
  user,
  onClose,
  onSaved,
}: {
  open: boolean
  user: User
  onClose: () => void
  onSaved: () => void
}) {
  const [displayName, setDisplayName] = useState(user.display_name)
  const [username, setUsername] = useState(user.username)
  const [bio, setBio] = useState(user.bio ?? '')
  const [emoji, setEmoji] = useState(user.avatar_emoji ?? '')
  const [color, setColor] = useState(user.avatar_color ?? 'amber')
  const [image, setImage] = useState(user.avatar_image ?? '')
  const [prefs, setPrefs] = useState<string[]>(user.preferences ?? [])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [available, setAvailable] = useState<boolean | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (username === user.username || !USERNAME_RE.test(username)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAvailable(null)
      return
    }
    const t = setTimeout(async () => {
      try {
        const { available: ok } = await AuthAPI.usernameAvailable(username)
        setAvailable(ok)
      } catch {
        setAvailable(null)
      }
    }, 400)
    return () => clearTimeout(t)
  }, [username, user.username])

  const onPickAvatar = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const { url } = await MediaAPI.upload(file)
      setImage(url)
      setEmoji('')
      toast.success('Photo de profil mise à jour')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Envoi impossible.')
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    setError('')
    if (displayName.trim().length < 2) return setError('Le nom d’affichage doit faire au moins 2 caractères.')
    if (!USERNAME_RE.test(username)) return setError('Nom d’utilisateur invalide (3-24 : a-z, 0-9, _).')
    if (available === false) return setError('Ce nom d’utilisateur est déjà pris.')
    setSaving(true)
    try {
      const { user: u } = await ProfileAPIUpdate({ displayName, username, bio, emoji, color, image, prefs })
      if (!u) throw new Error('Erreur')
      toast.success('Profil mis à jour')
      onSaved()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Enregistrement impossible.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier mon profil</DialogTitle>
          <DialogDescription>Ton identité publique sur Open Library.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4">
          <Avatar user={{ display_name: displayName, avatar_emoji: emoji, avatar_color: color, avatar_image: image }} size={64} />
          <div className="flex-1">
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" onChange={(e) => onPickAvatar(e.target.files?.[0])} />
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />} Photo
              </Button>
              {image && (
                <Button type="button" variant="ghost" size="sm" className="text-red-600" onClick={() => setImage('')}>
                  <X size={14} /> Retirer
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1"><Label htmlFor="pf-name">Nom d’affichage</Label></div>
              <Input id="pf-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={40} />
            </div>
            <div>
              <div className="mb-1"><Label htmlFor="pf-username">Nom d’utilisateur</Label></div>
              <div className="relative">
                <span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 text-sm">@</span>
                <Input id="pf-username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} maxLength={24} className="pl-7" />
                {available === false && <X size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600" />}
                {available === true && <Check size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600" />}
              </div>
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <Label htmlFor="pf-bio">Bio</Label>
              <span className="text-[11px] text-stone-400">{bio.trim().length}/300</span>
            </div>
            <Textarea id="pf-bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={300} placeholder="Parle de toi et de ce que tu écris…" />
          </div>

          {!image && (
            <>
              <div>
                <Label>Couleur d’avatar</Label>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {COVERS.map((c) => (
                    <button key={c.id} type="button" onClick={() => setColor(c.id)} aria-label={c.id}
                      className={cn('h-8 w-8 rounded-full bg-gradient-to-br', c.bg, color === c.id && 'ring-2 ring-amber-600 ring-offset-2')} />
                  ))}
                </div>
              </div>
              <div>
                <Label>Emoji d’avatar</Label>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <input value={emoji} onChange={(e) => setEmoji(e.target.value)} maxLength={8} placeholder="🙂" className="h-9 w-14 rounded-md border border-stone-200 text-center text-lg" />
                  {EMOJI_CHOICES.slice(0, 16).map((em) => (
                    <button key={em} type="button" onClick={() => setEmoji(em)} className={cn('h-8 w-8 rounded-md text-lg hover:bg-stone-100', emoji === em && 'bg-amber-100')}>{em}</button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div>
            <Label>Genres préférés</Label>
            <p className="mb-1.5 text-xs text-stone-400">Pour tes recommandations.</p>
            <div className="flex flex-wrap gap-1.5">
              {GENRES.map((g) => {
                const on = prefs.includes(g)
                return (
                  <button key={g} type="button" onClick={() => setPrefs((p) => (on ? p.filter((x) => x !== g) : [...p, g]))} aria-pressed={on}
                    className={cn('rounded-full border px-3 py-1 text-xs font-medium', on ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-stone-200 text-stone-600 hover:bg-stone-50')}>
                    {g}
                  </button>
                )
              })}
            </div>
          </div>

          {error && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700" role="alert">{error}</p>}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          <Button type="button" onClick={save} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Petit wrapper local pour éviter un import circulaire dans le JSX
async function ProfileAPIUpdate(p: {
  displayName: string
  username: string
  bio: string
  emoji: string
  color: string
  image: string
  prefs: string[]
}) {
  const { ProfileAPI } = await import('@/lib/plume')
  return ProfileAPI.update({
    display_name: p.displayName.trim(),
    username: p.username,
    bio: p.bio,
    avatar_emoji: p.emoji,
    avatar_color: p.color,
    avatar_image: p.image,
    preferences: p.prefs,
  })
}
