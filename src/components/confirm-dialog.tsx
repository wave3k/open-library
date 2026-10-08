'use client'

import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Supprimer',
  requireText,
  requirePassword,
  onConfirm,
  onCancel,
}: {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  /** Si fourni, l'utilisateur doit recopier exactement ce texte pour confirmer. */
  requireText?: string
  /** Si true, un champ mot de passe est demandé et transmis à onConfirm. */
  requirePassword?: boolean
  onConfirm: (password?: string) => void
  onCancel: () => void
}) {
  const [typed, setTyped] = useState('')
  const [password, setPassword] = useState('')
  const okText = !requireText || typed.trim() === requireText
  const okPwd = !requirePassword || password.length > 0
  const ok = okText && okPwd

  const reset = () => { setTyped(''); setPassword('') }

  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) { reset(); onCancel() } }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>

        {requireText && (
          <div>
            <Label htmlFor="confirm-text" className="text-xs">Tape « {requireText} » pour confirmer</Label>
            <Input id="confirm-text" value={typed} onChange={(e) => setTyped(e.target.value)} className="mt-1" autoComplete="off" />
          </div>
        )}

        {requirePassword && (
          <div>
            <Label htmlFor="confirm-pwd" className="text-xs">Ton mot de passe</Label>
            <Input id="confirm-pwd" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1" autoComplete="current-password" />
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => { reset(); onCancel() }}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            disabled={!ok}
            onClick={(e) => { if (!ok) { e.preventDefault(); return } const p = password; reset(); onConfirm(p) }}
            className="bg-red-600 text-white hover:bg-red-500 disabled:opacity-50"
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
