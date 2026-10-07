'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Heart, MessageSquare, UserPlus, Loader2, CheckCheck, BookOpen } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/avatar'
import { usePlume } from '@/components/plume-provider'
import { NotificationsAPI, type Notification } from '@/lib/plume'

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

function iconFor(type: Notification['type']) {
  switch (type) {
    case 'like': return <Heart size={15} className="text-red-500" />
    case 'comment': return <MessageSquare size={15} className="text-sky-500" />
    case 'comment_like': return <Heart size={15} className="text-pink-500" />
    case 'follow': return <UserPlus size={15} className="text-emerald-500" />
  }
}

function textFor(n: Notification): string {
  switch (n.type) {
    case 'like': return 'a aimé ton livre'
    case 'comment': return 'a commenté ton livre'
    case 'comment_like': return 'a aimé ton commentaire'
    case 'follow': return 'a commencé à te suivre'
  }
}

export function NotificationsView() {
  const router = useRouter()
  const { user, refreshStats } = usePlume()
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  const load = async () => {
    try {
      const d = await NotificationsAPI.list()
      setItems(d.notifications)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Chargement impossible.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="font-semibold">Connecte-toi pour voir tes notifications.</p>
        <a href="/connexion" className="mt-4 inline-block rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white">Se connecter</a>
      </div>
    )
  }

  const markAllRead = async () => {
    setMarking(true)
    try {
      await NotificationsAPI.markAllRead()
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
      await refreshStats()
      toast.success('Notifications marquées comme lues')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Action impossible.')
    } finally {
      setMarking(false)
    }
  }

  const open = (n: Notification) => {
    if (n.type === 'follow' && n.actor) router.push(`/u/${n.actor.username}`)
    else if (n.book_id) router.push(`/livres/${n.book_id}`)
  }

  const unread = items.filter((n) => !n.read).length

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><Bell size={22} /> Notifications</h1>
          <p className="text-muted-foreground text-sm">{unread > 0 ? `${unread} non lue(s)` : 'Tout est lu'}</p>
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={marking}>
            {marking ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />} Tout marquer comme lu
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-20 text-stone-500">
          <Loader2 size={20} className="animate-spin" /> Chargement…
        </div>
      ) : items.length === 0 ? (
        <div className="bg-card rounded-2xl border border-dashed p-12 text-center">
          <Bell size={28} className="mx-auto text-stone-400" />
          <p className="mt-2 font-semibold">Aucune notification</p>
          <p className="text-muted-foreground text-sm">Quand quelqu’un aime, commente ou te suit, tu le verras ici.</p>
        </div>
      ) : (
        <ul className="bg-card divide-y divide-stone-100 overflow-hidden rounded-2xl border">
          {items.map((n) => (
            <li key={n.id}>
              <button
                onClick={() => open(n)}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-stone-50 ${n.read ? '' : 'bg-amber-50/50'}`}
              >
                <span className="relative shrink-0">
                  {n.actor ? <Avatar user={n.actor} size={40} /> : <span className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100"><BookOpen size={16} /></span>}
                  <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow dark:bg-stone-900">
                    {iconFor(n.type)}
                  </span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm">
                    <strong>{n.actor?.display_name || 'Quelqu’un'}</strong> {textFor(n)}
                    {n.book_title && <span className="text-muted-foreground"> · « {n.book_title} »</span>}
                  </span>
                  <span className="text-muted-foreground block text-xs">{timeAgo(n.created_at)}</span>
                </span>
                {!n.read && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
