'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, BookOpen, FileText, Eye, Heart, MessageSquare, TrendingUp,
  Loader2, Globe, Lock, FileEdit, Layers, BarChart3, Trophy,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { BookCover } from '@/components/book-cover'
import { usePlume } from '@/components/plume-provider'
import { AnalyticsAPI, type Analytics } from '@/lib/plume'

function Kpi({ icon: Icon, label, value, hint }: { icon: typeof Eye; label: string; value: number; hint?: string }) {
  return (
    <div className="bg-card rounded-2xl border p-4 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide">
        <Icon size={14} /> {label}
      </div>
      <p className="mt-1.5 text-2xl font-bold tabular-nums">{value.toLocaleString('fr-FR')}</p>
      {hint && <p className="text-muted-foreground mt-0.5 text-xs">{hint}</p>}
    </div>
  )
}

export function AnalyticsView() {
  const router = useRouter()
  const { user } = usePlume()
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    AnalyticsAPI.get()
      .then((d) => { if (!cancelled) setData(d) })
      .catch((err) => toast.error(err instanceof Error ? err.message : 'Chargement impossible.'))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="font-semibold">Connecte-toi pour accéder à ton tableau de bord.</p>
        <a href="/connexion" className="mt-4 inline-block rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white">Se connecter</a>
      </div>
    )
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center gap-2 py-20 text-stone-500">
        <Loader2 size={20} className="animate-spin" /> Chargement de ton tableau de bord…
      </div>
    )
  }

  const { summary, books, likesTrend } = data
  const maxTrend = Math.max(1, ...likesTrend.map((d) => d.likes))
  const top = [...books].sort((a, b) => b.views - a.views).slice(0, 5)
  const engagement = summary.views > 0 ? Math.round((summary.likesReceived / summary.views) * 100) : 0

  return (
    <div className="space-y-6">
      <button onClick={() => router.push('/profil')} className="flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-stone-800">
        <ArrowLeft size={16} /> Retour au profil
      </button>

      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold"><BarChart3 size={22} className="text-amber-600" /> Tableau de bord</h1>
        <p className="text-muted-foreground text-sm">Tes statistiques d’auteur — visible par toi uniquement.</p>
      </div>

      {/* KPIs */}
      <div className="stagger grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={BookOpen} label="Livres" value={summary.published} hint={`${summary.drafts} brouillon(s)`} />
        <Kpi icon={FileText} label="Mots écrits" value={summary.words} hint={`${summary.chapters} chapitre(s)`} />
        <Kpi icon={Eye} label="Lectures" value={summary.views} hint={`${summary.impressions.toLocaleString('fr-FR')} impressions`} />
        <Kpi icon={Heart} label="Likes reçus" value={summary.likesReceived} hint={`${summary.likes} livres · ${summary.commentLikes} commentaires`} />
      </div>
      <div className="stagger grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi icon={MessageSquare} label="Commentaires reçus" value={summary.comments} />
        <Kpi icon={TrendingUp} label="Taux d’engagement" value={engagement} hint="likes / lectures (%)" />
        <Kpi icon={Layers} label="Chapitres" value={summary.chapters} />
        <Kpi icon={Trophy} label="Likes livres" value={summary.likes} />
      </div>

      {/* Tendance des likes (30 jours) */}
      <div className="bg-card rounded-2xl border p-5">
        <h2 className="font-bold">Likes reçus · 30 derniers jours</h2>
        <p className="text-muted-foreground text-sm">Sur tes livres et tes commentaires.</p>
        <div className="mt-4 flex h-32 items-end gap-1">
          {likesTrend.map((d) => (
            <div
              key={d.day}
              title={`${d.day} · ${d.likes} like(s)`}
              className="min-w-0 flex-1 rounded-t bg-amber-500/70"
              style={{ height: `${Math.max(2, Math.round((d.likes / maxTrend) * 100))}%` }}
            />
          ))}
        </div>
        <div className="text-muted-foreground mt-1 flex justify-between text-[11px]">
          <span>{likesTrend[0]?.day}</span>
          <span>{likesTrend[likesTrend.length - 1]?.day}</span>
        </div>
      </div>

      {/* Top livres */}
      {top.length > 0 && (
        <div className="bg-card rounded-2xl border p-5">
          <h2 className="flex items-center gap-2 font-bold"><Trophy size={17} className="text-amber-600" /> Tes meilleurs livres</h2>
          <ul className="mt-3 space-y-3">
            {top.map((b, i) => (
              <li key={b.id} className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-sm font-bold text-stone-600">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{b.title}</p>
                  <p className="text-xs text-stone-400">{b.chapters} ch. · {b.words.toLocaleString('fr-FR')} mots</p>
                </div>
                <div className="text-muted-foreground shrink-0 text-right text-xs">
                  <span className="flex items-center gap-1"><Eye size={12} /> {b.views}</span>
                  <span className="flex items-center gap-1"><Heart size={12} /> {b.likes}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tableau détaillé */}
      <div className="bg-card rounded-2xl border p-5">
        <h2 className="font-bold">Détail par livre</h2>
        {books.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">Aucun livre pour l’instant.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                  <th className="py-2 pr-3">Livre</th>
                  <th className="px-3 py-2">Statut</th>
                  <th className="px-3 py-2 text-right">Chapitres</th>
                  <th className="px-3 py-2 text-right">Mots</th>
                  <th className="px-3 py-2 text-right">Impressions</th>
                  <th className="px-3 py-2 text-right">Lectures</th>
                  <th className="px-3 py-2 text-right">Likes</th>
                  <th className="px-3 py-2 text-right">Comm.</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b.id} className="cursor-pointer border-b border-stone-100 last:border-0 hover:bg-stone-50" onClick={() => router.push(`/livres/${b.id}`)}>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="scale-75 origin-left"><BookCover book={{ cover: b.id }} title={b.title} author="" size="sm" /></div>
                        <span className="font-medium">{b.title}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      {!b.published ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-stone-200 px-2 py-0.5 text-xs font-semibold text-stone-600"><FileEdit size={11} /> Brouillon</span>
                      ) : b.is_public ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700"><Globe size={11} /> Public</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-stone-200 px-2 py-0.5 text-xs font-semibold text-stone-600"><Lock size={11} /> Privé</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{b.chapters}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{b.words.toLocaleString('fr-FR')}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{b.impressions.toLocaleString('fr-FR')}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{b.views.toLocaleString('fr-FR')}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{b.likes.toLocaleString('fr-FR')}</td>
                    <td className="px-3 py-2.5 text-right tabular-nums">{b.comments.toLocaleString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-center pb-4">
        <Button variant="outline" onClick={() => router.push('/bibliotheque')}>Retour à la bibliothèque</Button>
      </div>
    </div>
  )
}
