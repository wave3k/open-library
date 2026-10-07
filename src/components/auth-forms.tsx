'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Feather, Loader2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthAPI, type User } from '@/lib/plume'
import { usePlume } from '@/components/plume-provider'
import { cn } from '@/lib/utils'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const USERNAME_RE = /^[a-z0-9_]{3,24}$/

function AuthShell({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-md py-10">
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

/** Où envoyer un utilisateur connecté selon son état d'onboarding. */
function destinationFor(u: User | null) {
  if (!u) return '/'
  return u.onboarded ? '/bibliotheque' : '/onboarding'
}

export function useRedirectIfLogged() {
  const { user } = usePlume()
  const router = useRouter()
  useEffect(() => {
    if (user) router.replace(destinationFor(user))
  }, [user, router])
}

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
      const next = new URLSearchParams(window.location.search).get('next')
      router.push(next && next.startsWith('/') ? next : destinationFor(data.user))
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
  const [displayName, setDisplayName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ name?: string; username?: string; email?: string; password?: string; confirm?: string }>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

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

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setServerError('')
    const e: typeof errors = {}
    if (displayName.trim().length < 2) e.name = 'Indique ton nom d’affichage (2 caractères minimum).'
    if (!USERNAME_RE.test(username)) e.username = '3 à 24 caractères : lettres minuscules, chiffres et _.'
    if (!EMAIL_RE.test(email.trim())) e.email = 'Adresse e-mail invalide.'
    if (password.length < 8) e.password = '8 caractères minimum pour protéger ton compte.'
    if (confirm !== password) e.confirm = 'Les mots de passe ne correspondent pas.'
    setErrors(e)
    if (Object.keys(e).length > 0) return
    setLoading(true)
    try {
      const data = await AuthAPI.signup({
        display_name: displayName.trim(),
        username,
        email: email.trim(),
        password,
      })
      await login(data.user, data.token)
      router.push('/onboarding')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erreur d’inscription.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Créer un compte" sub="Trente secondes, et c’est parti.">
      <form onSubmit={submit} noValidate className="mt-5 space-y-3.5">
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
            <p className="mt-1 text-xs text-stone-400">Ton profil : open-library/u/{username || '…'}</p>
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
        <div>
          <div className="mb-1"><Label htmlFor="up-confirm">Confirmer le mot de passe</Label></div>
          <Input id="up-confirm" type="password" value={confirm} onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: undefined })) }} placeholder="••••••••" maxLength={128} autoComplete="new-password" aria-invalid={!!errors.confirm} className={errors.confirm ? 'border-red-400' : ''} />
          {errors.confirm && <p className="mt-1 text-xs font-medium text-red-600" role="alert">{errors.confirm}</p>}
        </div>
        {serverError && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700" role="alert">{serverError}</p>}
        <Button type="submit" className="w-full" disabled={loading || available === false || checking}>
          {loading && <Loader2 size={17} className="animate-spin" />}
          {loading ? 'Création…' : 'Créer mon compte'}
        </Button>
        <p className="text-muted-foreground text-center text-sm">
          Déjà un compte ? <a href="/connexion" className="font-semibold text-amber-700 hover:underline">Se connecter</a>
        </p>
      </form>
    </AuthShell>
  )
}
