'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Feather, Loader2, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react'
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

  // Déjà onboardé (ou visiteur) → on ne reste pas ici
  useEffect(() => {
    if (!user) router.replace('/connexion')
    else if (user.onboarded) router.replace('/bibliotheque')
  }, [user, router])

  if (!user || user.onboarded) return null

  const finish = async (skipped = false) => {
    setSaving(true)
    try {
      await ProfileAPI.update({
        referral_source: referral || 'other',
        preferences: prefs,
        onboarded: true,
      })
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
    <div className="relative mx-auto max-w-2xl py-10">
      <button
        onClick={() => finish(true)}
        disabled={saving}
        className="text-muted-foreground absolute right-0 top-10 text-sm font-medium hover:text-stone-800"
      >
        Passer →
      </button>

      <div className="bg-card overflow-hidden rounded-3xl border shadow-xl">
        <div className="flex items-center gap-2.5 border-b px-8 py-6">
          <span className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-xl">
            <Feather size={19} />
          </span>
          <div>
            <h1 className="text-lg font-bold">Bienvenue, {user.display_name} 👋</h1>
            <p className="text-muted-foreground text-sm">Deux questions pour personnaliser ton expérience.</p>
          </div>
        </div>

        <div className="px-8 py-7">
          {step === 0 ? (
            <>
              <h2 className="text-xl font-bold">Comment as-tu entendu parler d’Open Library ?</h2>
              <p className="text-muted-foreground mt-1 text-sm">Ça nous aide à faire découvrir la plateforme à d’autres auteurs.</p>
              <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {REFERRAL_SOURCES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setReferral(r.id)}
                    aria-pressed={referral === r.id}
                    className={cn(
                      'rounded-xl border px-3 py-3 text-sm font-medium transition',
                      referral === r.id ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <h2 className="flex items-center gap-2 text-xl font-bold"><Sparkles size={18} className="text-amber-600" /> Qu’aimes-tu lire ?</h2>
              <p className="text-muted-foreground mt-1 text-sm">Choisis les genres que tu adores — nos recommandations s’appuieront dessus.</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {GENRES.map((g) => {
                  const on = prefs.includes(g)
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setPrefs((p) => (on ? p.filter((x) => x !== g) : [...p, g]))}
                      aria-pressed={on}
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm font-medium transition',
                        on ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      )}
                    >
                      {g}
                    </button>
                  )
                })}
              </div>
              <p className="text-muted-foreground mt-3 text-xs">{prefs.length} sélectionné(s) — modifiable à tout moment dans ton profil.</p>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t px-8 py-5">
          {step === 0 ? (
            <Button variant="ghost" onClick={() => finish(true)} disabled={saving}>Passer</Button>
          ) : (
            <Button variant="outline" onClick={() => setStep(0)} disabled={saving}><ArrowLeft size={16} /> Retour</Button>
          )}
          {step === 0 ? (
            <Button onClick={() => setStep(1)} disabled={!referral}>
              Continuer <ArrowRight size={16} />
            </Button>
          ) : (
            <Button onClick={() => finish(false)} disabled={saving}>
              {saving && <Loader2 size={16} className="animate-spin" />}
              {saving ? 'Un instant…' : 'Terminer'}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
