'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Feather, Loader2, ArrowRight, ArrowLeft, Sparkles, Compass } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { usePlume } from '@/components/plume-provider'
import { ProfileAPI, GENRES, REFERRAL_SOURCES } from '@/lib/plume'
import { cn } from '@/lib/utils'

export function Onboarding() {
  const router = useRouter()
  const { user, refreshStats } = usePlume()
  const [step, setStep] = useState(0)
  const [referral, setReferral] = useState('')
  const [prefs, setPrefs] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!user) router.replace('/connexion')
    else if (user.onboarded) router.replace('/bibliotheque')
  }, [user, router])

  if (!user || user.onboarded) {
    // Redirection en cours (évite une page blanche)
    return (
      <div className="flex min-h-[60vh] items-center justify-center gap-2 text-stone-500">
        <Loader2 size={20} className="animate-spin" /> Un instant…
      </div>
    )
  }

  const finish = async (skipped = false) => {
    setSaving(true)
    try {
      await ProfileAPI.update({ referral_source: referral || 'other', preferences: prefs, onboarded: true })
      await refreshStats()
      toast.success(skipped ? 'On file vers ta bibliothèque !' : 'Merci, c’est noté ✨')
      router.push('/bibliotheque')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Enregistrement impossible.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="-mx-4 -my-6 flex min-h-[100dvh] flex-col overflow-y-auto bg-gradient-to-br from-[#fbf7ec] via-[#f3eee2] to-[#efe7d3] dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      {/* Barre du haut */}
      <div className="flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-2">
          <span className="bg-primary text-primary-foreground flex h-9 w-9 items-center justify-center rounded-xl">
            <Feather size={18} />
          </span>
          <span className="text-lg font-bold tracking-tight">Open Library</span>
        </div>
        <button onClick={() => finish(true)} disabled={saving} className="text-muted-foreground text-sm font-medium hover:text-stone-800">
          Passer l’introduction →
        </button>
      </div>

      {/* Contenu plein écran */}
      <div className="flex flex-1 items-center justify-center px-6 pb-16 sm:px-10">
        <div className="w-full max-w-3xl">
          {/* Progression */}
          <div className="mb-8 flex items-center justify-center gap-3">
            {[0, 1].map((i) => (
              <span key={i} className={cn('h-1.5 rounded-full transition-all', i === step ? 'w-10 bg-amber-600' : 'w-5 bg-stone-300 dark:bg-stone-700')} />
            ))}
          </div>

          {step === 0 ? (
            <div className="text-center">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Compass size={26} />
              </span>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Bienvenue, {user.display_name} 👋</h1>
              <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-lg">
                Comment as-tu entendu parler d’Open Library ? Ça nous aide à faire découvrir la plateforme à d’autres auteurs.
              </p>
              <div className="mx-auto mt-8 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-4">
                {REFERRAL_SOURCES.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setReferral(r.id)}
                    aria-pressed={referral === r.id}
                    className={cn(
                      'rounded-2xl border px-4 py-5 text-sm font-semibold shadow-sm transition',
                      referral === r.id ? 'border-amber-600 bg-amber-50 text-amber-900' : 'bg-card hover:bg-stone-50 dark:hover:bg-stone-800'
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                <Sparkles size={26} />
              </span>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Qu’aimes-tu lire ?</h1>
              <p className="text-muted-foreground mx-auto mt-3 max-w-xl text-lg">
                Choisis les genres que tu adores — nos recommandations s’appuieront dessus.
              </p>
              <div className="mx-auto mt-8 flex max-w-2xl flex-wrap justify-center gap-2.5">
                {GENRES.map((g) => {
                  const on = prefs.includes(g)
                  return (
                    <button
                      key={g}
                      onClick={() => setPrefs((p) => (on ? p.filter((x) => x !== g) : [...p, g]))}
                      aria-pressed={on}
                      className={cn(
                        'rounded-full border px-5 py-2.5 text-sm font-semibold shadow-sm transition',
                        on ? 'border-amber-600 bg-amber-50 text-amber-900' : 'bg-card hover:bg-stone-50 dark:hover:bg-stone-800'
                      )}
                    >
                      {g}
                    </button>
                  )
                })}
              </div>
              <p className="text-muted-foreground mt-4 text-sm">{prefs.length} sélectionné(s) — modifiable à tout moment dans ton profil.</p>
            </div>
          )}

          {/* Actions */}
          <div className="mx-auto mt-10 flex max-w-2xl items-center justify-between gap-3">
            {step === 0 ? (
              <Button variant="ghost" onClick={() => finish(true)} disabled={saving}>Passer</Button>
            ) : (
              <Button variant="outline" onClick={() => setStep(0)} disabled={saving}><ArrowLeft size={16} /> Retour</Button>
            )}
            {step === 0 ? (
              <Button size="lg" onClick={() => setStep(1)} disabled={!referral}>
                Continuer <ArrowRight size={16} />
              </Button>
            ) : (
              <Button size="lg" onClick={() => finish(false)} disabled={saving}>
                {saving && <Loader2 size={16} className="animate-spin" />}
                {saving ? 'Un instant…' : 'Terminer'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
