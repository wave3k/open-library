'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Sun, Moon, Monitor, Palette, User as UserIcon, KeyRound, LogOut,
  Trash2, Loader2, Check, Globe, Lock, Sparkles, ShieldAlert, Users,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/avatar'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { usePlume } from '@/components/plume-provider'
import { useTheme } from '@/components/theme-provider'
import { ProfileAPI, GENRES } from '@/lib/plume'
import { cn } from '@/lib/utils'

function Section({ icon: Icon, title, desc, children }: { icon: typeof Sun; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="bg-card hover-lift rounded-2xl border p-6">
      <div className="flex items-start gap-3">
        <span className="bg-secondary text-secondary-foreground flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
          <Icon size={17} />
        </span>
        <div>
          <h2 className="font-bold">{title}</h2>
          {desc && <p className="text-muted-foreground text-sm">{desc}</p>}
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

export function SettingsView() {
  const router = useRouter()
  const { user, updateProfile, logout, refreshStats } = usePlume()
  const { theme, setTheme } = useTheme()

  const [displayName, setDisplayName] = useState(user?.display_name ?? '')
  const [bio, setBio] = useState(user?.bio ?? '')
  const [prefs, setPrefs] = useState<string[]>(user?.preferences ?? [])
  const [savingProfile, setSavingProfile] = useState(false)

  const [curPwd, setCurPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [pwdErr, setPwdErr] = useState('')
  const [savingPwd, setSavingPwd] = useState(false)

  const [askDelete, setAskDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const setVisibility = async (v: 'public' | 'followers' | 'private') => {
    try {
      await updateProfile({ profile_visibility: v })
      toast.success(v === 'public' ? 'Profil public' : v === 'followers' ? 'Profil réservé à tes abonnés' : 'Profil privé')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Modification impossible.')
    }
  }

  if (!user) {
    return (
      <div className="py-20 text-center">
        <p className="font-semibold">Connecte-toi pour accéder aux paramètres.</p>
        <Link href="/connexion" className="mt-4 inline-block rounded-xl bg-amber-700 px-4 py-2 text-sm font-semibold text-white">Se connecter</Link>
      </div>
    )
  }

  const saveProfile = async () => {
    if (displayName.trim().length < 2) return toast.error('Le nom d’affichage doit faire au moins 2 caractères.')
    setSavingProfile(true)
    try {
      await updateProfile({ display_name: displayName.trim(), bio, preferences: prefs })
      await refreshStats()
      toast.success('Paramètres enregistrés')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Enregistrement impossible.')
    } finally {
      setSavingProfile(false)
    }
  }

  const changePwd = async () => {
    setPwdErr('')
    if (newPwd.length < 8) return setPwdErr('Le nouveau mot de passe doit faire 8 caractères minimum.')
    setSavingPwd(true)
    try {
      await ProfileAPI.changePassword(curPwd, newPwd)
      setCurPwd('')
      setNewPwd('')
      toast.success('Mot de passe modifié')
    } catch (err) {
      setPwdErr(err instanceof Error ? err.message : 'Modification impossible.')
    } finally {
      setSavingPwd(false)
    }
  }

  const deleteAccount = async (password?: string) => {
    setDeleting(true)
    try {
      await ProfileAPI.deleteAccount(password ?? '')
      await logout()
      toast.success('Compte supprimé')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Suppression impossible.')
    } finally {
      setDeleting(false)
      setAskDelete(false)
    }
  }

  const THEMES = [
    { id: 'light', label: 'Clair', icon: Sun },
    { id: 'dark', label: 'Sombre', icon: Moon },
    { id: 'system', label: 'Système', icon: Monitor },
  ] as const

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground text-sm">Personnalise ton expérience et gère ton compte.</p>
      </div>

      {/* Apparence */}
      <Section icon={Palette} title="Apparence" desc="Choisis le thème de l’interface.">
        <div className="grid grid-cols-3 gap-2.5">
          {THEMES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTheme(id)}
              aria-pressed={theme === id}
              className={cn(
                'flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-sm font-medium transition',
                theme === id ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-stone-200 hover:bg-stone-50'
              )}
            >
              <Icon size={20} />
              {label}
              {theme === id && <Check size={14} className="text-amber-600" />}
            </button>
          ))}
        </div>
      </Section>

      {/* Profil */}
      <Section icon={UserIcon} title="Profil" desc="Nom, bio et avatar — visibles par les autres lecteurs.">
        <div className="flex items-center gap-4">
          <Avatar user={{ ...user, display_name: displayName }} size={64} />
          <div className="flex-1">
            <Link href="/profil" className="text-sm font-semibold text-amber-700 hover:underline">
              Modifier mon avatar, mon pseudo et ma bio sur mon profil →
            </Link>
            <p className="text-muted-foreground mt-1 text-xs">@{user.username} · {user.email}</p>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <div>
            <div className="mb-1"><Label htmlFor="st-name">Nom d’affichage</Label></div>
            <Input id="st-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={40} />
          </div>
          <div>
            <div className="mb-1 flex items-baseline justify-between">
              <Label htmlFor="st-bio">Bio</Label>
              <span className="text-[11px] text-stone-500">{bio.trim().length}/300</span>
            </div>
            <Textarea id="st-bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={2} maxLength={300} placeholder="Parle de toi en quelques mots…" />
          </div>
        </div>
      </Section>

      {/* Préférences */}
      <Section icon={Sparkles} title="Préférences de lecture" desc="Sert à personnaliser tes recommandations.">
        <div className="flex flex-wrap gap-1.5">
          {GENRES.map((g) => {
            const on = prefs.includes(g)
            return (
              <button
                key={g}
                onClick={() => setPrefs((p) => (on ? p.filter((x) => x !== g) : [...p, g]))}
                aria-pressed={on}
                className={cn('rounded-full border px-3.5 py-1.5 text-sm font-medium transition', on ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-stone-200 hover:bg-stone-50')}
              >
                {g}
              </button>
            )
          })}
        </div>
        <div className="mt-4">
          <Button onClick={saveProfile} disabled={savingProfile}>
            {savingProfile && <Loader2 size={15} className="animate-spin" />} Enregistrer
          </Button>
        </div>
      </Section>

      {/* Confidentialité */}
      <Section icon={ShieldAlert} title="Confidentialité du profil" desc="Qui peut voir ton profil et tes œuvres ?">
        <div className="grid gap-2.5 sm:grid-cols-3">
          {([
            { id: 'public', label: 'Public', desc: 'Tout le monde', icon: Globe },
            { id: 'followers', label: 'Abonnés', desc: 'Ceux qui te suivent', icon: Users },
            { id: 'private', label: 'Privé', desc: 'Toi uniquement', icon: Lock },
          ] as const).map(({ id, label, desc, icon: Icon }) => {
            const active = (user.profile_visibility || 'public') === id
            return (
              <button
                key={id}
                onClick={() => setVisibility(id)}
                aria-pressed={active}
                className={cn('flex flex-col items-start gap-1 rounded-xl border px-3.5 py-3 text-left transition', active ? 'border-amber-600 bg-amber-50 text-amber-900' : 'border-stone-200 hover:bg-stone-50')}
              >
                <span className="flex items-center gap-1.5 font-semibold"><Icon size={15} /> {label}</span>
                <span className="text-xs opacity-70">{desc}</span>
                {active && <Check size={14} className="text-amber-600" />}
              </button>
            )
          })}
        </div>
        <p className="text-muted-foreground mt-3 text-xs">
          « Abonnés » : seules les personnes qui te suivent voient tes œuvres. « Privé » : personne d’autre que toi.
        </p>
      </Section>

      {/* Sécurité */}
      <Section icon={KeyRound} title="Mot de passe" desc="Change ton mot de passe régulièrement.">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="mb-1"><Label htmlFor="st-cur">Mot de passe actuel</Label></div>
            <Input id="st-cur" type="password" value={curPwd} onChange={(e) => setCurPwd(e.target.value)} autoComplete="current-password" />
          </div>
          <div>
            <div className="mb-1"><Label htmlFor="st-new">Nouveau mot de passe</Label></div>
            <Input id="st-new" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} autoComplete="new-password" />
          </div>
        </div>
        {pwdErr && <p className="mt-2 text-sm font-medium text-red-600" role="alert">{pwdErr}</p>}
        <div className="mt-4">
          <Button onClick={changePwd} disabled={savingPwd || !curPwd || !newPwd}>
            {savingPwd && <Loader2 size={15} className="animate-spin" />} Modifier le mot de passe
          </Button>
        </div>
      </Section>

      {/* Compte */}
      <Section icon={LogOut} title="Compte">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => { logout(); router.push('/') }}>
            <LogOut size={15} /> Se déconnecter
          </Button>
        </div>
      </Section>

      {/* Danger */}
      <section className="rounded-2xl border border-red-200 bg-red-50/50 p-6">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
            <ShieldAlert size={17} />
          </span>
          <div>
            <h2 className="font-bold text-red-700">Zone dangereuse</h2>
            <p className="text-sm text-red-600/80">La suppression du compte est définitive : livres, chapitres, likes et commentaires seront effacés.</p>
          </div>
        </div>
        <Button variant="destructive" className="mt-4" onClick={() => setAskDelete(true)}>
          <Trash2 size={15} /> Supprimer mon compte
        </Button>
      </section>

      <ConfirmDialog
        open={askDelete}
        title="Supprimer définitivement ton compte ?"
        message="Tout sera effacé : tes livres, chapitres, likes et commentaires. Cette action est irréversible."
        confirmLabel={deleting ? 'Suppression…' : 'Supprimer mon compte'}
        requirePassword
        onConfirm={(pwd) => deleteAccount(pwd)}
        onCancel={() => setAskDelete(false)}
      />
    </div>
  )
}
