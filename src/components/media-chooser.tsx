'use client'

import { Upload, ImageOff } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { BRAND_GRADIENTS } from '@/lib/plume'
import { cn } from '@/lib/utils'

/** Choix : téléverser une image OU choisir une couleur/dégradé. */
export function MediaChooser({
  open,
  kind,
  currentColor,
  hasImage,
  onUpload,
  onColor,
  onRemoveImage,
  onClose,
}: {
  open: boolean
  kind: 'avatar' | 'banner'
  currentColor?: string
  hasImage?: boolean
  onUpload: () => void
  onColor: (colorId: string) => void
  onRemoveImage: () => void
  onClose: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{kind === 'avatar' ? 'Photo de profil' : 'Bannière'}</DialogTitle>
          <DialogDescription>
            {kind === 'avatar' ? 'Téléverse une image ou choisis une couleur.' : 'Téléverse une image ou choisis un dégradé.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Button onClick={onUpload}>
              <Upload size={15} /> Téléverser une image
            </Button>
            {hasImage && (
              <Button variant="ghost" className="text-red-600" onClick={onRemoveImage}>
                <ImageOff size={15} /> Retirer l’image
              </Button>
            )}
          </div>

          <div>
            <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
              {kind === 'avatar' ? 'Couleur' : 'Dégradé'}
            </p>
            <div className={cn('grid gap-2', kind === 'avatar' ? 'grid-cols-5' : 'grid-cols-5')}>
              {BRAND_GRADIENTS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => onColor(g.id)}
                  title={g.label}
                  aria-label={g.label}
                  aria-pressed={!hasImage && currentColor === g.id}
                  className={cn(
                    'h-11 rounded-xl border transition hover:scale-105',
                    !hasImage && currentColor === g.id ? 'ring-2 ring-amber-600 ring-offset-2' : 'border-black/10'
                  )}
                  style={{ background: g.css }}
                />
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
