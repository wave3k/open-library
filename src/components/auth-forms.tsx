'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Feather, Loader2, Check, X, ArrowRight, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthAPI, GENRES, REFERRAL_SOURCES } from '@/lib/plume'
import { usePlume } from '@/components/plume-provider'
import { Avatar } from '@/components/avatar'
import { cn } from '@/lib/utils'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const USERNAME_RE = /^[a-z0-9_]{3,24}$/

function AuthShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md py-8">
      <div className="bg-card rounded-3xl border p-8 shadow-xl">
        <div className="flex items-center gap-2.5">
          <span className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-xl">
            <Feather size={19} />
          </span>
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-muted-foreground text-sm">{sub}</p>
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}

export function useRedirectIfLogged() {
  const { user } = usePlume()
  const router = useRouter()
  useEffect(() => {
    if (user) router.replace('/bibliotheque')
  }, [user, router])
}

/** Enveloppe client des pages de connexion / inscription. */
export function LoginPage() {
  useRedirectIfLogged()
  return <LoginForm />
}

export function SignupPage() {
  useRedirectIfLogged()
  return <SignupForm />
}

export function LoginForm() {
  const { login } = usePlume()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setServerError('')
    const e: typeof errors = {}
    if (!EMAIL_RE.test(email.trim())) e.email = 'Adresse e-mail invalide.'
    if (!password) e.password = 'Entre ton mot de passe.'
    setErrors(e)
    if (Object.keys(e).length > 0) return
    setLoading(true)
    try {
      const data = await AuthAPI.login({ email: email.trim(), password })
      await login(data.user, data.token)
      router.push('/bibliotheque')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erreur de connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Bon retour parmi nous" sub="Connecte-toi pour retrouver tes livres.">
      <form onSubmit={submit} noValidate className="mt-5 space-y-3.5">
        <div>
          <div className="mb-1"><Label htmlFor="in-email">E-mail</Label></div>
          <Input id="in-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })) }} placeholder="toi@exemple.fr" maxLength={120} autoComplete="email" autoFocus aria-invalid={!!errors.email} className={errors.email ? 'border-red-400' : ''} />
          {errors.email && <p className="mt-1 text-xs font-medium text-red-600" role="alert">{errors.email}</p>}
        </div>
        <div>
          <div className="mb-1"><Label htmlFor="in-password">Mot de passe</Label></div>
          <Input id="in-password" type="password" value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })) }} placeholder="••••••••" maxLength={128} autoComplete="current-password" aria-invalid={!!errors.password} className={errors.password ? 'border-red-400' : ''} />
          {errors.password && <p className="mt-1 text-xs font-medium text-red-600" role="alert">{errors.password}</p>}
        </div>
        {serverError && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700" role="alert">{serverError}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 size={17} className="animate-spin" />}
          {loading ? 'Un instant…' : 'Se connecter'}
        </Button>
        <p className="text-muted-foreground text-center text-sm">
          Pas encore de compte ? <a href="/inscription" className="font-semibold text-amber-700 hover:underline">Créer un compte</a>
        </p>
      </form>
    </AuthShell>
  )
}

export function SignupForm() {
  const { login } = usePlume()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [referral, setReferral] = useState('')
  const [prefs, setPrefs] = useState<string[]>([])
  const [errors, setErrors] = useState<{ name?: string; username?: string; email?: string; password?: string }>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Vérification de disponibilité du username (debounce)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAvailable(null)
    if (!USERNAME_RE.test(username)) return
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(async () => {
      setChecking(true)
      try {
        const { available: ok } = await AuthAPI.usernameAvailable(username)
        setAvailable(ok)
      } catch {
        setAvailable(null)
      } finally {
        setChecking(false)
      }
    }, 400)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [username])

  const validateStep0 = () => {
    const e: typeof errors = {}
    if (displayName.trim().length < 2) e.name = 'Indique ton nom d’affichage (2 caractères minimum).'
    if (!USERNAME_RE.test(username)) e.username = '3 à 24 caractères : lettres minuscules, chiffres et _.'
    if (!EMAIL_RE.test(email.trim())) e.email = 'Adresse e-mail invalide.'
    if (password.length < 8) e.password = '8 caractères minimum pour protéger ton compte.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const finish = async () => {
    setServerError('')
    setLoading(true)
    try {
      const data = await AuthAPI.signup({
        display_name: displayName.trim(),
        username,
        email: email.trim(),
        password,
        referral_source: referral || 'other',
        preferences: prefs,
      })
      await login(data.user, data.token)
      router.push('/bibliotheque')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erreur d’inscription.')
      setStep(0)
    } finally {
      setLoading(false)
    }
  }

  const steps = ['Compte', 'Découverte', 'Goûts']

  return (
    <div className="mx-auto max-w-lg py-8">
      <div className="bg-card rounded-3xl border p-8 shadow-xl">
        <div className="flex items-center gap-2.5">
          <span className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-xl">
            <Feather size={19} />
          </span>
          <div>
            <h2 className="text-xl font-bold">Créer un compte</h2>
            <p className="text-muted-foreground text-sm">Trois petites étapes et c’est parti.</p>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-2">
          {steps.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold', i <= step ? 'bg-amber-600 text-white' : 'bg-stone-200 text-stone-500')}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className={cn('text-xs font-medium', i <= step ? 'text-stone-900' : 'text-stone-400')}>{label}</span>
              {i < steps.length - 1 && <span className={cn('h-px flex-1', i < step ? 'bg-amber-600' : 'bg-stone-200')} />}
            </div>
          ))}
        </div>

        {serverError && <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700" role="alert">{serverError}</p>}

        {step === 0 && (
          <div className="mt-5 space-y-3.5">
            <div className="flex items-center gap-4 rounded-xl bg-stone-50 p-3">
              <Avatar user={{ display_name: displayName, avatar_emoji: '', avatar_color: 'amber', avatar_image: '' }} size={56} />
              <p className="text-xs text-stone-500">Ton avatar par défaut — tu pourras le personnaliser dans ton profil.</p>
            </div>
            <div>
              <div className="mb-1"><Label htmlFor="up-name">Nom d’affichage</Label></div>
              <Input id="up-name" value={displayName} onChange={(e) => { setDisplayName(e.target.value); setErrors((p) => ({ ...p, name: undefined })) }} placeholder="Le nom que verront les lecteurs" maxLength={40} autoFocus aria-invalid={!!errors.name} className={errors.name ? 'border-red-400' : ''} />
              {errors.name ? <p className="mt-1 text-xs font-medium text-red-600">{errors.name}</p> : <p className="mt-1 text-xs text-stone-400">Ex. « Léa Moreau ». Modifiable à tout moment.</p>}
            </div>
            <div>
              <div className="mb-1"><Label htmlFor="up-username">Nom d’utilisateur</Label></div>
              <div className="relative">
                <span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 text-sm">@</span>
                <Input id="up-username" value={username} onChange={(e) => { setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')); setErrors((p) => ({ ...p, username: undefined })) }} placeholder="lea_moreau" maxLength={24} aria-invalid={!!errors.username} className={cn('pl-7', errors.username ? 'border-red-400' : '')} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checking && <Loader2 size={14} className="animate-spin text-stone-400" />}
                  {!checking && available === true && <Check size={15} className="text-emerald-600" />}
                  {!checking && available === false && <X size={15} className="text-red-600" />}
                </span>
              </div>
              {errors.username ? (
                <p className="mt-1 text-xs font-medium text-red-600">{errors.username}</p>
              ) : available === false ? (
                <p className="mt-1 text-xs font-medium text-red-600">Ce nom d’utilisateur est déjà pris.</p>
              ) : (
                <p className="mt-1 text-xs text-stone-400">Ton adresse de profil : open-library/u/{username || '…'}</p>
              )}
            </div>
            <div>
              <div className="mb-1"><Label htmlFor="up-email">E-mail</Label></div>
              <Input id="up-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })) }} placeholder="toi@exemple.fr" maxLength={120} autoComplete="email" aria-invalid={!!errors.email} className={errors.email ? 'border-red-400' : ''} />
              {errors.email && <p className="mt-1 text-xs font-medium text-red-600">{errors.email}</p>}
            </div>
            <div>
              <div className="mb-1"><Label htmlFor="up-password">Mot de passe</Label></div>
              <Input id="up-password" type="password" value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })) }} placeholder="••••••••" maxLength={128} autoComplete="new-password" aria-invalid={!!errors.password} className={errors.password ? 'border-red-400' : ''} />
              {errors.password ? <p className="mt-1 text-xs font-medium text-red-600">{errors.password}</p> : <p className="mt-1 text-xs text-stone-400">8 caractères minimum.</p>}
            </div>
            <Button
              type="button"
              className="w-full"
              disabled={available === false || checking}
              onClick={() => { if (validateStep0()) setStep(1) }}
            >
              Continuer <ArrowRight size={16} />
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="mt-5">
            <h3 className="font-semibold">Comment as-tu entendu parler de nous ?</h3>
            <p className="text-muted-foreground text-sm">Ça nous aide à faire découvrir Open Library.</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {REFERRAL_SOURCES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setReferral(r.id)}
                  aria-pressed={referral === r.id}
                  className={cn('rounded-xl border px-3 py-2.5 text-sm font-medium transition', referral === r.id ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50')}
                >
                  {r.label}
                </button>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(0)}><ArrowLeft size={16} /> Retour</Button>
              <Button type="button" className="flex-1" disabled={!referral} onClick={() => setStep(2)}>Continuer <ArrowRight size={16} /></Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-5">
            <h3 className="font-semibold">Qu’aimes-tu lire ?</h3>
            <p className="text-muted-foreground text-sm">Choisis un ou plusieurs genres — on te recommandera des livres dans ce style.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {GENRES.map((g) => {
                const on = prefs.includes(g)
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setPrefs((p) => (on ? p.filter((x) => x !== g) : [...p, g]))}
                    aria-pressed={on}
                    className={cn('rounded-full border px-3.5 py-1.5 text-sm font-medium transition', on ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50')}
                  >
                    {g}
                  </button>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-stone-400">{prefs.length} sélectionné(s) — tu pourras changer plus tard.</p>
            <div className="mt-5 flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)}><ArrowLeft size={16} /> Retour</Button>
              <Button type="button" className="flex-1" disabled={loading} onClick={finish}>
                {loading && <Loader2 size={17} className="animate-spin" />}
                {loading ? 'Création…' : 'Créer mon compte'}
              </Button>
            </div>
          </div>
        )}

        <p className="text-muted-foreground mt-5 text-center text-sm">
          Déjà un compte ? <a href="/connexion" className="font-semibold text-amber-700 hover:underline">Se connecter</a>
        </p>
      </div>
    </div>
  )
}
