'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, X, Check, ZoomIn } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Recadrage d'image côté client (canvas) : déplacer + zoomer, puis exporter un Blob.
 * Utilisé pour l'avatar (carré) et la bannière (large).
 */
export function ImageCropper({
  file,
  aspect = 1,
  outWidth = 512,
  onCancel,
  onCropped,
}: {
  file: File
  aspect?: number
  outWidth?: number
  onCancel: () => void
  onCropped: (blob: Blob) => void
}) {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [busy, setBusy] = useState(false)
  const boxRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const [boxW, setBoxW] = useState(320)

  const boxH = Math.round(boxW / aspect)

  useEffect(() => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => setImg(image)
    image.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    const measure = () => {
      if (boxRef.current) setBoxW(boxRef.current.clientWidth)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const baseScale = img ? Math.max(boxW / img.naturalWidth, boxH / img.naturalHeight) : 1
  const scale = baseScale * zoom
  const dw = img ? img.naturalWidth * scale : 0
  const dh = img ? img.naturalHeight * scale : 0

  const clamp = useCallback(
    (o: { x: number; y: number }) => ({
      x: Math.min(0, Math.max(boxW - dw, o.x)),
      y: Math.min(0, Math.max(boxH - dh, o.y)),
    }),
    [boxW, boxH, dw, dh]
  )

  // Recentrer quand l'image ou la taille change
  useEffect(() => {
    if (!img) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOffset((o) => clamp(o.x === 0 && o.y === 0 ? { x: (boxW - dw) / 2, y: (boxH - dh) / 2 } : o))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, boxW])

  const onPointerDown = (e: React.PointerEvent) => {
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    const dy = e.clientY - drag.current.y
    setOffset(clamp({ x: drag.current.ox + dx, y: drag.current.oy + dy }))
  }
  const onPointerUp = () => {
    drag.current = null
  }

  const crop = async () => {
    if (!img) return
    setBusy(true)
    try {
      const outH = Math.round(outWidth / aspect)
      const canvas = document.createElement('canvas')
      canvas.width = outWidth
      canvas.height = outH
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Canvas indisponible')
      const r = outWidth / boxW
      ctx.drawImage(img, offset.x * r, offset.y * r, dw * r, dh * r)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9))
      if (!blob) throw new Error('Export impossible')
      onCropped(blob)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="bg-card relative w-full max-w-lg rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between">
          <h3 className="font-bold">Recadrer l’image</h3>
          <button onClick={onCancel} className="rounded p-1 hover:bg-stone-100" aria-label="Fermer"><X size={18} /></button>
        </div>

        <div
          ref={boxRef}
          className="relative mt-4 w-full overflow-hidden rounded-xl bg-stone-900 select-none touch-none"
          style={{ height: boxH, cursor: 'grab' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {img && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={img.src}
              alt=""
              draggable={false}
              style={{ position: 'absolute', left: offset.x, top: offset.y, width: dw, height: dh, maxWidth: 'none' }}
            />
          )}
          <div className="pointer-events-none absolute inset-0 ring-2 ring-white/40" />
        </div>

        <div className="mt-4 flex items-center gap-3">
          <ZoomIn size={16} className="text-stone-500" />
          <input
            type="range" min={1} max={3} step={0.01} value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-amber-600"
            aria-label="Zoom"
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Annuler</Button>
          <Button onClick={crop} disabled={busy || !img}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Valider
          </Button>
        </div>
      </div>
    </div>
  )
}
