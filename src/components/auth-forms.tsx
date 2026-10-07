'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Feather, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthAPI } from '@/lib/plume'
import { usePlume } from '@/components/plume-provider'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

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
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setServerError('')
    const e: typeof errors = {}
    if (name.trim().length < 2) e.name = 'Indique ton nom de plume (2 caractères minimum).'
    if (!EMAIL_RE.test(email.trim())) e.email = 'Adresse e-mail invalide.'
    if (password.length < 8) e.password = '8 caractères minimum pour protéger ton compte.'
    setErrors(e)
    if (Object.keys(e).length > 0) return
    setLoading(true)
    try {
      const data = await AuthAPI.signup({ name: name.trim(), email: email.trim(), password })
      await login(data.user, data.token)
      router.push('/bibliotheque')
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erreur d’inscription.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Créer un compte" sub="Tes livres, ta bibliothèque.">
      <form onSubmit={submit} noValidate className="mt-5 space-y-3.5">
        <div>
          <div className="mb-1"><Label htmlFor="up-name">Nom de plume</Label></div>
          <Input id="up-name" value={name} onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })) }} placeholder="Ex. Léa Moreau" maxLength={60} autoComplete="name" autoFocus aria-invalid={!!errors.name} className={errors.name ? 'border-red-400' : ''} />
          {errors.name ? (
            <p className="mt-1 text-xs font-medium text-red-600" role="alert">{errors.name}</p>
          ) : (
            <p className="mt-1 text-xs text-stone-400">C’est ce nom que verront les autres lecteurs.</p>
          )}
        </div>
        <div>
          <div className="mb-1"><Label htmlFor="up-email">E-mail</Label></div>
          <Input id="up-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })) }} placeholder="toi@exemple.fr" maxLength={120} autoComplete="email" aria-invalid={!!errors.email} className={errors.email ? 'border-red-400' : ''} />
          {errors.email && <p className="mt-1 text-xs font-medium text-red-600" role="alert">{errors.email}</p>}
        </div>
        <div>
          <div className="mb-1"><Label htmlFor="up-password">Mot de passe</Label></div>
          <Input id="up-password" type="password" value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })) }} placeholder="••••••••" maxLength={128} autoComplete="new-password" aria-invalid={!!errors.password} className={errors.password ? 'border-red-400' : ''} />
          {errors.password ? (
            <p className="mt-1 text-xs font-medium text-red-600" role="alert">{errors.password}</p>
          ) : (
            <p className="mt-1 text-xs text-stone-400">8 caractères minimum. Choisis-en un vrai, tes histoires le méritent.</p>
          )}
        </div>
        {serverError && <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700" role="alert">{serverError}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading && <Loader2 size={17} className="animate-spin" />}
          {loading ? 'Un instant…' : 'Créer mon compte'}
        </Button>
        <p className="text-muted-foreground text-center text-sm">
          Déjà un compte ? <a href="/connexion" className="font-semibold text-amber-700 hover:underline">Se connecter</a>
        </p>
      </form>
    </AuthShell>
  )
}
