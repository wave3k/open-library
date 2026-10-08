'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { BookForm } from '@/components/book-form'
import type { Book, BookInput } from '@/lib/plume'

export function BookFormDialog({
  open,
  initial,
  onClose,
  onSave,
}: {
  open: boolean
  initial: Book | null
  onClose: () => void
  onSave: (data: BookInput) => Promise<void>
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Modifier le livre</DialogTitle>
          <DialogDescription>Mets à jour les infos et la couverture.</DialogDescription>
        </DialogHeader>
        <BookForm
          initial={initial}
          submitLabel="Enregistrer"
          onSubmit={async (data) => { await onSave(data); onClose() }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  )
}
