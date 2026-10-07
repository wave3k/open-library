import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'

/** Boîte de confirmation custom (remplace window.confirm). */
export default function ConfirmDialog({ title, message, confirmLabel = 'Supprimer', onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle size={18} />
          </span>
          <h3 className="font-bold text-stone-900">{title}</h3>
        </div>
        <p className="mt-3 text-sm text-stone-600">{message}</p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={onCancel}
            autoFocus
            className="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-500"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
