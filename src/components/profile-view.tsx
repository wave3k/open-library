'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Eye, Heart, MessageSquare, TrendingUp, Pencil, CalendarDays, Loader2, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/avatar'
import { BookCover } from '@/components/book-cover'
import { ProfileEditDialog } from '@/components/profile-edit-dialog'
import { usePlume } from '@/components/plume-provider'
import { ProfileAPI, bookWords, readingMinutes, type Book, type ProfileStats, type User } from '@/lib/plume'

function StatCard({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: number }) {
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
  return (
    <article
      className="book3d-lift bg-card flex cursor-pointer gap-4 rounded-2xl border p-4 transition-shadow hover:shadow-lg"
      onClick={onOpen}
    >
      <div className="py-1 pl-1">
        <BookCover book={book} title={book.title} author={book.author} genre={book.genre} size="md" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">{book.genre}</span>
          {!book.is_public && <span className="rounded-full bg-stone-200 px-2 py-0.5 text-[11px] font-semibold text-stone-600">Privé</span>}
        </div>
        <h3 className="mt-1.5 truncate font-bold">{book.title}</h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-stone-500">{book.description || 'Aucune description.'}</p>
        {book.tags?.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {book.tags.map((t) => (
              <span key={t} className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-medium text-stone-500">#{t}</span>
            ))}
          </div>
        )}
        <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-400">
          <span>{(book.chapters ?? []).length} chapitre(s)</span>
          <span>{bookWords(book).toLocaleString('fr-FR')} mots · ~{readingMinutes(book)} min</span>
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
  const [loading, setLoading] = useState(!isSelf)
  const [editing, setEditing] = useState(false)
  const [tab, setTab] = useState<'oeuvres' | 'a-propos'>('oeuvres')

  useEffect(() => {
    if (isSelf) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    ProfileAPI.get(username as string)
      .then((d) => {
        if (!cancelled) setRemote(d)
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Profil introuvable.'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [username, isSelf])

  const profile: User | null = isSelf ? me : remote?.user ?? null
  const stats: ProfileStats | null = isSelf ? myStats : remote?.stats ?? null
  const books: Book[] = isSelf ? myBooks : remote?.books ?? []

  if (!me) {
    return (
      <div className="py-20 text-center">
        <p className="font-semibold">Connecte-toi pour voir les profils.</p>
        <a href="/connexion" className="mt-4 inline-block rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white">Se connecter</a>
      </div>
    )
  }

  if (loading || !profile) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-stone-500">
        <Loader2 size={20} className="animate-spin" /> Chargement du profil…
      </div>
    )
  }

  const joined = profile.created_at ? new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''
  const publicBooks = books

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-card relative overflow-hidden rounded-3xl border">
        <div className="h-28 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-wrap items-end gap-4">
            <div className="rounded-full border-4 border-white shadow-lg dark:border-stone-900">
              <Avatar user={profile} size={88} />
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <h1 className="truncate text-2xl font-bold">{profile.display_name}</h1>
              <p className="text-muted-foreground text-sm">@{profile.username}</p>
            </div>
            {isSelf ? (
              <Button onClick={() => setEditing(true)}><Pencil size={15} /> Modifier mon profil</Button>
            ) : (
              <Button variant="outline" onClick={() => router.push(`/u/${profile.username}`)} disabled>@{profile.username}</Button>
            )}
          </div>
          {profile.bio && <p className="mt-4 max-w-2xl whitespace-pre-line text-sm leading-relaxed text-stone-600">{profile.bio}</p>}
          {joined && <p className="text-muted-foreground mt-2 inline-flex items-center gap-1.5 text-xs"><CalendarDays size={13} /> Membre depuis {joined}</p>}
          {profile.preferences?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {profile.preferences.map((g) => (
                <span key={g} className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">{g}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard icon={BookOpen} label="Livres" value={stats.books} />
          <StatCard icon={FileText} label="Mots" value={stats.words} />
          <StatCard icon={Eye} label="Impressions" value={stats.impressions} />
          <StatCard icon={TrendingUp} label="Lectures" value={stats.views} />
          <StatCard icon={Heart} label="Likes" value={stats.likes} />
          <StatCard icon={MessageSquare} label="Commentaires" value={stats.comments} />
        </div>
      )}

      {/* Onglets */}
      <div className="bg-card flex w-fit rounded-xl p-1 shadow-sm">
        <button onClick={() => setTab('oeuvres')} className={`rounded-lg px-5 py-2 text-sm font-semibold ${tab === 'oeuvres' ? 'bg-stone-900 text-white' : 'text-stone-500'}`}>
          Œuvres ({publicBooks.length})
        </button>
        <button onClick={() => setTab('a-propos')} className={`rounded-lg px-5 py-2 text-sm font-semibold ${tab === 'a-propos' ? 'bg-stone-900 text-white' : 'text-stone-500'}`}>
          À propos
        </button>
      </div>

      {tab === 'oeuvres' ? (
        publicBooks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white/60 p-10 text-center">
            <BookOpen size={28} className="mx-auto text-stone-400" />
            <p className="mt-2 font-semibold text-stone-700">
              {isSelf ? 'Tu n’as pas encore publié d’œuvre' : 'Aucune œuvre publique'}
            </p>
            {isSelf && <p className="text-sm text-stone-500">Crée ton premier livre depuis ta bibliothèque.</p>}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {publicBooks.map((b) => (
              <BookRow key={b.id} book={b} onOpen={() => router.push(`/livres/${b.id}`)} />
            ))}
          </div>
        )
      ) : (
        <div className="bg-card space-y-3 rounded-2xl border p-6 text-sm text-stone-600">
          <h3 className="font-bold text-stone-900">À propos de {profile.display_name}</h3>
          <p>{profile.bio || 'Cet auteur n’a pas encore écrit de bio.'}</p>
          {profile.preferences?.length > 0 && (
            <p>Aime lire : <span className="font-medium text-stone-800">{profile.preferences.join(', ')}</span>.</p>
          )}
        </div>
      )}

      {isSelf && (
        <ProfileEditDialog
          open={editing}
          user={profile}
          onClose={() => setEditing(false)}
          onSaved={async () => {
            await refreshStats()
            await refreshBooks()
          }}
        />
      )}
    </div>
  )
}
