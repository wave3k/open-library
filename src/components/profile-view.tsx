'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BookOpen, Heart, FileText, Pencil, CalendarDays, Loader2, Camera, ImagePlus,
  BarChart3, MessageSquare, Eye, TrendingUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/avatar'
import { BookCover } from '@/components/book-cover'
import { ProfileEditDialog } from '@/components/profile-edit-dialog'
import { ImageCropper } from '@/components/image-cropper'
import { usePlume } from '@/components/plume-provider'
import { MediaAPI, ProfileAPI, bookWords, type Book, type ProfileStats, type User } from '@/lib/plume'

function Stat({ icon: Icon, label, value }: { icon: typeof Heart; label: string; value: number }) {
  return (
    <div className="bg-card rounded-2xl border p-4">
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
        <Icon size={14} /> {label}
      </div>
      <p className="mt-1.5 text-2xl font-bold tabular-nums">{value.toLocaleString('fr-FR')}</p>
    </div>
  )
}

function BookRow({ book, onOpen }: { book: Book; onOpen: () => void }) {
  const isDraft = book.chapter_count === 0
  return (
    <article className="book3d-lift bg-card flex cursor-pointer gap-4 rounded-2xl border p-4 transition-shadow hover:shadow-lg" onClick={onOpen}>
      <div className="py-1 pl-1">
        <BookCover book={book} title={book.title} author={book.author} genre={book.genre} size="md" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">{book.genre}</span>
          {isDraft ? (
            <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[11px] font-semibold text-stone-600">Brouillon</span>
          ) : !book.is_public ? (
            <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[11px] font-semibold text-stone-600">Privé</span>
          ) : null}
        </div>
        <h3 className="mt-1.5 truncate font-bold">{book.title}</h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-stone-500">{book.description || 'Aucune description.'}</p>
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-400">
          <span>{book.chapter_count ?? book.chapters.length} chapitre(s)</span>
          <span>{bookWords(book).toLocaleString('fr-FR')} mots</span>
          <span className="inline-flex items-center gap-1"><Eye size={12} /> {book.views}</span>
          <span className="inline-flex items-center gap-1"><Heart size={12} /> {book.likes}</span>
          <span className="inline-flex items-center gap-1"><MessageSquare size={12} /> {book.comments}</span>
        </p>
      </div>
    </article>
  )
}

export function ProfileView({ username }: { username?: string }) {
  const router = useRouter()
  const { user: me, stats: myStats, mine: myBooks, refreshStats, refreshBooks } = usePlume()
  const isSelf = !username
  const [remote, setRemote] = useState<{ user: User; stats: ProfileStats; books: Book[] } | null>(null)
  const [counts, setCounts] = useState<{ followers: number; following: number } | null>(null)
  const [isFollowing, setIsFollowing] = useState(false)
  const [followBusy, setFollowBusy] = useState(false)
  const [loading, setLoading] = useState(!isSelf)
  const [editing, setEditing] = useState(false)
  const [tab, setTab] = useState<'oeuvres' | 'a-propos'>('oeuvres')
  const [crop, setCrop] = useState<{ file: File; kind: 'avatar' | 'banner' } | null>(null)
  const avatarInput = useRef<HTMLInputElement>(null)
  const bannerInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handle = isSelf ? me?.username : username
    if (!handle) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isSelf) setLoading(true)
    ProfileAPI.get(handle)
      .then((d) => {
        if (cancelled) return
        setCounts({ followers: d.followers, following: d.following })
        setIsFollowing(d.is_following)
        if (!isSelf) setRemote({ user: d.user, stats: d.stats, books: d.books })
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Profil introuvable.'))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [username, isSelf, me?.username])

  const toggleFollow = async () => {
    const handle = profile?.username
    if (!handle) return
    if (!me) { router.push(`/connexion?next=${encodeURIComponent(`/u/${handle}`)}`); return }
    setFollowBusy(true)
    const next = !isFollowing
    setIsFollowing(next)
    setCounts((c) => (c ? { ...c, followers: c.followers + (next ? 1 : -1) } : c))
    try {
      const res = next ? await ProfileAPI.follow(handle) : await ProfileAPI.unfollow(handle)
      setIsFollowing(res.is_following)
      setCounts({ followers: res.followers, following: res.following })
    } catch (err) {
      setIsFollowing(!next)
      toast.error(err instanceof Error ? err.message : 'Action impossible.')
    } finally {
      setFollowBusy(false)
    }
  }

  const profile: User | null = isSelf ? me : remote?.user ?? null
  const stats: ProfileStats | null = isSelf ? myStats : remote?.stats ?? null
  const books: Book[] = isSelf ? myBooks : remote?.books ?? []

  if (isSelf && !me) {
    return (
      <div className="py-20 text-center">
        <p className="font-semibold">Connecte-toi pour voir ton profil.</p>
        <a href="/connexion" className="mt-4 inline-block rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white">Se connecter</a>
      </div>
    )
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-stone-500">
        <Loader2 size={20} className="animate-spin" /> Chargement du profil…
      </div>
    )
  }
  if (!profile) {
    return (
      <div className="py-20 text-center">
        <p className="font-semibold">Profil introuvable.</p>
        <a href="/recherche" className="mt-4 inline-block rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold">Parcourir les livres</a>
      </div>
    )
  }

  const joined = profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''

  const onCropped = async (blob: Blob) => {
    const kind = crop?.kind
    setCrop(null)
    try {
      const { url } = await MediaAPI.upload(blob)
      const patch = kind === 'banner' ? { banner_image: url } : { avatar_image: url }
      await ProfileAPI.update(patch)
      await refreshStats()
      if (!isSelf) setRemote((r) => (r ? { ...r, user: { ...r.user, ...patch } } : r))
      toast.success(kind === 'banner' ? 'Bannière mise à jour' : 'Photo de profil mise à jour')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Envoi impossible.')
    }
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec bannière */}
      <div className="bg-card relative overflow-hidden rounded-3xl border">
        <div className="group relative h-40 sm:h-52">
          {profile.banner_image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.banner_image} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600" />
          )}
          {isSelf && (
            <button
              onClick={() => bannerInput.current?.click()}
              className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 text-sm font-semibold text-white opacity-0 transition group-hover:opacity-100"
            >
              <ImagePlus size={18} /> Changer la bannière
            </button>
          )}
        </div>

        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-wrap items-end gap-4">
            <div className="group relative">
              <div className="rounded-full border-4 border-white shadow-lg dark:border-stone-900">
                <Avatar user={profile} size={96} />
              </div>
              {isSelf && (
                <button
                  onClick={() => avatarInput.current?.click()}
                  className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100"
                  aria-label="Changer la photo de profil"
                >
                  <Camera size={22} />
                </button>
              )}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <h1 className="truncate text-2xl font-bold">{profile.display_name}</h1>
              <p className="text-muted-foreground text-sm">
                @{profile.username}
                {counts && (
                  <>
                    {' · '}<b className="text-stone-700 dark:text-stone-200">{counts.followers.toLocaleString('fr-FR')}</b> abonné(s)
                    {' · '}<b className="text-stone-700 dark:text-stone-200">{counts.following.toLocaleString('fr-FR')}</b> abonnement(s)
                  </>
                )}
              </p>
            </div>
            {isSelf ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => router.push('/profil/analytics')}>
                  <BarChart3 size={15} /> Tableau de bord
                </Button>
                <Button onClick={() => setEditing(true)}><Pencil size={15} /> Modifier</Button>
              </div>
            ) : (
              <Button variant={isFollowing ? 'outline' : 'default'} onClick={toggleFollow} disabled={followBusy}>
                {followBusy ? <Loader2 size={15} className="animate-spin" /> : null}
                {isFollowing ? 'Abonné ✓' : 'Suivre'}
              </Button>
            )}
          </div>

          {profile.bio && <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-stone-600">{profile.bio}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {joined && <p className="text-muted-foreground inline-flex items-center gap-1.5 text-xs"><CalendarDays size={13} /> Membre depuis {joined}</p>}
          </div>
          {profile.preferences?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.preferences.map((g) => (
                <span key={g} className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">{g}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats essentielles (le reste = tableau de bord) */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          <Stat icon={BookOpen} label={isSelf ? 'Livres publiés' : 'Livres'} value={isSelf ? stats.published : stats.books} />
          <Stat icon={Heart} label="Likes reçus" value={stats.likesReceived} />
          <Stat icon={FileText} label="Mots écrits" value={stats.words} />
        </div>
      )}

      <div className="bg-card flex w-fit rounded-xl p-1 shadow-sm">
        <button onClick={() => setTab('oeuvres')} className={`rounded-lg px-5 py-2 text-sm font-semibold ${tab === 'oeuvres' ? 'bg-stone-900 text-white' : 'text-stone-500'}`}>
          Œuvres ({books.length})
        </button>
        <button onClick={() => setTab('a-propos')} className={`rounded-lg px-5 py-2 text-sm font-semibold ${tab === 'a-propos' ? 'bg-stone-900 text-white' : 'text-stone-500'}`}>
          À propos
        </button>
      </div>

      {tab === 'oeuvres' ? (
        books.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-10 text-center">
            <BookOpen size={28} className="mx-auto text-stone-400" />
            <p className="mt-2 font-semibold text-stone-700">{isSelf ? 'Tu n’as pas encore d’œuvre' : 'Aucune œuvre publique'}</p>
            {isSelf && <p className="text-sm text-stone-500">Crée ton premier livre depuis ta bibliothèque.</p>}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {books.map((b) => <BookRow key={b.id} book={b} onOpen={() => router.push(`/livres/${b.id}`)} />)}
          </div>
        )
      ) : (
        <div className="bg-card space-y-3 rounded-2xl border p-6 text-sm text-stone-600">
          <h3 className="font-bold text-stone-900">À propos de {profile.display_name}</h3>
          <p>{profile.bio || 'Cet auteur n’a pas encore écrit de bio.'}</p>
          {profile.preferences?.length > 0 && <p>Aime lire : <span className="font-medium text-stone-800">{profile.preferences.join(', ')}</span>.</p>}
          {stats && (
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-stone-500">
              <span className="inline-flex items-center gap-1"><TrendingUp size={13} /> {stats.views.toLocaleString('fr-FR')} lectures</span>
              <span className="inline-flex items-center gap-1"><Eye size={13} /> {stats.impressions.toLocaleString('fr-FR')} impressions</span>
              <span className="inline-flex items-center gap-1"><MessageSquare size={13} /> {stats.comments} commentaires</span>
            </div>
          )}
        </div>
      )}

      <input ref={avatarInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) setCrop({ file: f, kind: 'avatar' }); e.target.value = '' }} />
      <input ref={bannerInput} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) setCrop({ file: f, kind: 'banner' }); e.target.value = '' }} />

      {crop && (
        <ImageCropper
          file={crop.file}
          aspect={crop.kind === 'banner' ? 3 : 1}
          outWidth={crop.kind === 'banner' ? 1200 : 512}
          onCancel={() => setCrop(null)}
          onCropped={onCropped}
        />
      )}

      {isSelf && (
        <ProfileEditDialog
          open={editing}
          user={profile}
          onClose={() => setEditing(false)}
          onSaved={async () => { await refreshStats(); await refreshBooks() }}
        />
      )}
    </div>
  )
}
