import { useState } from 'react'
import { Feather, LogIn, UserPlus, Loader2 } from 'lucide-react'
import Field from './Field.jsx'
import { AuthAPI, setSession } from '../lib/api.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export default function Auth({ mode, onMode, onDone }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const signup = mode === 'signup'

  const validate = () => {
    const e = {}
    if (signup && name.trim().length < 2) e.name = 'Indique ton nom de plume (2 caractères minimum).'
    if (!EMAIL_RE.test(email.trim())) e.email = 'Adresse e-mail invalide.'
    if (signup && password.length < 8) e.password = '8 caractères minimum pour protéger ton compte.'
    else if (!signup && !password) e.password = 'Entre ton mot de passe.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    setServerError('')
    if (!validate()) return
    setLoading(true)
    try {
      const data = signup
        ? await AuthAPI.signup({ name: name.trim(), email: email.trim(), password })
        : await AuthAPI.login({ email: email.trim(), password })
      setSession(data.user, data.token)
      onDone(data.user)
    } catch (err) {
      setServerError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = (bad) =>
    `w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-amber-500 ${
      bad ? 'border-red-400' : 'border-stone-200'
    }`

  return (
    <div className="mx-auto max-w-md py-8">
      <div className="rounded-3xl border border-stone-200 bg-white p-8 shadow-xl">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-700 text-white">
            <Feather size={19} />
          </span>
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              {signup ? 'Créer un compte' : 'Bon retour parmi nous'}
            </h2>
            <p className="text-sm text-stone-500">
              {signup ? 'Tes livres, ta bibliothèque.' : 'Connecte-toi pour retrouver tes livres.'}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1">
          <button
            onClick={() => onMode('login')}
            className={`rounded-lg py-2 text-sm font-semibold ${!signup ? 'bg-white shadow text-stone-900' : 'text-stone-500'}`}
          >
            Connexion
          </button>
          <button
            onClick={() => onMode('signup')}
            className={`rounded-lg py-2 text-sm font-semibold ${signup ? 'bg-white shadow text-stone-900' : 'text-stone-500'}`}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={submit} noValidate className="mt-5 space-y-3.5">
          {signup && (
            <Field id="au-name" label="NOM DE PLUME" error={errors.name} hint="C’est ce nom que verront les autres lecteurs.">
              <input
                id="au-name"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })) }}
                placeholder="Ex. Léa Moreau"
                maxLength={60}
                autoComplete="name"
                autoFocus
                aria-invalid={!!errors.name}
                className={inputCls(errors.name)}
              />
            </Field>
          )}
          <Field id="au-email" label="E-MAIL" error={errors.email}>
            <input
              id="au-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })) }}
              placeholder="toi@exemple.fr"
              maxLength={120}
              autoComplete="email"
              autoFocus={!signup}
              aria-invalid={!!errors.email}
              className={inputCls(errors.email)}
            />
          </Field>
          <Field
            id="au-password"
            label="MOT DE PASSE"
            error={errors.password}
            hint={signup ? '8 caractères minimum. Choisis-en un vrai, tes histoires le méritent.' : undefined}
          >
            <input
              id="au-password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })) }}
              placeholder="••••••••"
              maxLength={128}
              autoComplete={signup ? 'new-password' : 'current-password'}
              aria-invalid={!!errors.password}
              className={inputCls(errors.password)}
            />
          </Field>

          {serverError && (
            <p className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700" role="alert">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-700 py-3 font-semibold text-white hover:bg-amber-600 disabled:opacity-60"
          >
            {loading ? (
              <Loader2 size={17} className="animate-spin" />
            ) : signup ? (
              <UserPlus size={17} />
            ) : (
              <LogIn size={17} />
            )}
            {loading ? 'Un instant…' : signup ? 'Créer mon compte' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  )
}
