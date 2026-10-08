'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { MessageSquare, Send, Trash2, Loader2, Heart } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/avatar'
import { usePlume } from '@/components/plume-provider'
import { BooksAPI, PublicAPI, type Comment } from '@/lib/plume'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'à l’instant'
  if (m < 60) return `il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `il y a ${h} h`
  const d = Math.floor(h / 24)
  if (d < 30) return `il y a ${d} j`
  return new Date(iso).toLocaleDateString('fr-FR')
}

export function CommentsSection({
  bookId,
  bookOwnerId,
  onCountChange,
}: {
  bookId: string
  bookOwnerId: string
  onCountChange?: (n: number) => void
}) {
  const router = useRouter()
  const { user } = usePlume()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const load = async () => {
    try {
      const list = await PublicAPI.comments(bookId)
      setComments(list)
      onCountChange?.(list.length)
    } catch {
      // silencieux
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId])

  const send = async () => {
    const content = text.trim()
    if (!content) return
    setSending(true)
    try {
      await BooksAPI.addComment(bookId, content)
      setText('')
      await load()
      toast.success('Commentaire publié')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Envoi impossible.')
    } finally {
      setSending(false)
    }
  }

  const remove = async (id: string) => {
    try {
      await BooksAPI.removeComment(bookId, id)
      await load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Suppression impossible.')
    }
  }

  const toggleLike = async (c: Comment) => {
    const next = !c.liked
    setComments((prev) => prev.map((x) => (x.id === c.id ? { ...x, liked: next, likes: x.likes + (next ? 1 : -1) } : x)))
    try {
      const res = next ? await BooksAPI.likeComment(bookId, c.id) : await BooksAPI.unlikeComment(bookId, c.id)
      setComments((prev) => prev.map((x) => (x.id === c.id ? { ...x, liked: res.liked, likes: res.likes } : x)))
    } catch {
      setComments((prev) => prev.map((x) => (x.id === c.id ? { ...x, liked: c.liked, likes: c.likes } : x)))
    }
  }

  return (
    <div className="bg-card rounded-2xl border p-5">
      <h3 className="flex items-center gap-2 font-bold">
        <MessageSquare size={17} /> Commentaires · {comments.length}
      </h3>

      {user ? (
        <div className="mt-3 flex gap-3">
          <Avatar user={user} size={36} />
          <div className="flex-1">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              maxLength={1000}
              placeholder="Partage ton avis, ta théorie, ton passage préféré…"
            />
            <div className="mt-2 flex justify-end">
              <Button size="sm" onClick={send} disabled={sending || !text.trim()}>
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Publier
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground mt-3 text-sm">
          <a href="/connexion" className="font-semibold text-amber-700 hover:underline">Connecte-toi</a> pour commenter.
        </p>
      )}

      <div className="mt-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-6 text-stone-400">
            <Loader2 size={16} className="animate-spin" /> Chargement…
          </div>
        ) : comments.length === 0 ? (
          <p className="py-4 text-center text-sm text-stone-400">Aucun commentaire. Sois le premier !</p>
        ) : (
          comments.map((c) => {
            const canDelete = user && (user.id === c.user_id || user.id === bookOwnerId)
            return (
              <div key={c.id} className="flex gap-3">
                <button onClick={() => router.push(`/u/${c.author.username}`)} aria-label={`Profil de ${c.author.display_name}`}>
                  <Avatar user={c.author} size={36} />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <button onClick={() => router.push(`/u/${c.author.username}`)} className="text-sm font-semibold hover:underline">
                      {c.author.display_name}
                    </button>
                    <span className="text-xs text-stone-400">{timeAgo(c.created_at)}</span>
                    <div className="ml-auto flex items-center gap-2">
                      <button
                        onClick={() => user && toggleLike(c)}
                        disabled={!user}
                        aria-pressed={c.liked}
                        aria-label={c.liked ? 'Retirer le like' : 'Aimer ce commentaire'}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold transition ${c.liked ? 'text-red-500' : 'text-stone-400 hover:text-red-400'} disabled:opacity-50`}
                      >
                        <Heart size={13} fill={c.liked ? 'currentColor' : 'none'} /> {c.likes}
                      </button>
                      {canDelete && (
                        <button onClick={() => remove(c.id)} className="rounded p-1 text-stone-300 hover:bg-red-50 hover:text-red-600" aria-label="Supprimer le commentaire">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-0.5 whitespace-pre-line text-sm text-stone-700">{c.content}</p>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
