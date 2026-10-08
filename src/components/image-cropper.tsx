'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, X, Check, ZoomIn, ZoomOut, RotateCw, Move, Circle, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Recadrage d'image (canvas) — responsive, avec zoom, déplacement et rotation.
 * L'image est pré-tournée dans un canvas pour garder un repère simple (sans trigonométrie à l'export).
 */
export function ImageCropper({
  file,
  aspect = 1,
  outWidth = 512,
  shape = 'rect',
  circularLabel,
  onCancel,
  onCropped,
}: {
  file: File
  aspect?: number
  outWidth?: number
  shape?: 'rect' | 'circle'
  circularLabel?: boolean
  onCancel: () => void
  onCropped: (blob: Blob) => void
}) {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [busy, setBusy] = useState(false)
  const [ready, setReady] = useState(false)
  const [boxW, setBoxW] = useState(280)

  const dialogRef = useRef<HTMLDivElement>(null)

  // Échap pour fermer + focus initial dans la modale
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    dialogRef.current?.focus()
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel])

  const wrapRef = useRef<HTMLDivElement>(null)
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const original = useRef<HTMLImageElement | null>(null)

  const isCircle = shape === 'circle' && aspect === 1
  const boxH = Math.round(boxW / aspect)

  // Charge l'image d'origine une fois
  useEffect(() => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => { original.current = image; setReady(true) }
    image.src = url
    return () => URL.revokeObjectURL(url)
  }, [file])

  // (Re)génère l'image affichée en incluant la rotation
  useEffect(() => {
    if (!ready || !original.current) return
    const src = original.current
    if (rotation % 360 === 0) {
      setImg(src)
      return
    }
    const rad = (rotation * Math.PI) / 180
    const swap = rotation % 180 !== 0
    const cw = swap ? src.naturalHeight : src.naturalWidth
    const ch = swap ? src.naturalWidth : src.naturalHeight
    const canvas = document.createElement('canvas')
    canvas.width = cw
    canvas.height = ch
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.translate(cw / 2, ch / 2)
    ctx.rotate(rad)
    ctx.drawImage(src, -src.naturalWidth / 2, -src.naturalHeight / 2)
    const out = new Image()
    out.onload = () => setImg(out)
    out.src = canvas.toDataURL('image/jpeg', 0.96)
  }, [ready, rotation])

  // Centre et réinitialise quand l'image change
  useEffect(() => {
    if (!img) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOffset({ x: 0, y: 0 })
    setZoom(1)
  }, [img])

  // Mesure responsive (largeur dispo + hauteur max raisonnable)
  const measure = useCallback(() => {
    const availW = (wrapRef.current?.clientWidth ?? 320)
    const vh = typeof window !== 'undefined' ? window.innerHeight : 800
    const maxH = Math.min(vh * 0.5, 440)
    const w = Math.min(availW, Math.round(maxH * aspect))
    setBoxW(Math.max(160, w))
  }, [aspect])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null
    if (ro && wrapRef.current) ro.observe(wrapRef.current)
    return () => {
      window.removeEventListener('resize', measure)
      ro?.disconnect()
    }
  }, [measure])

  // Ré-applique le clamp dès que la boîte/zoom/rotation change
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

  const centered = useCallback(() => ({ x: (boxW - dw) / 2, y: (boxH - dh) / 2 }), [boxW, boxH, dw, dh])

  useEffect(() => {
    if (!img) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOffset((o) => clamp(o.x === 0 && o.y === 0 ? centered() : o))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, boxW, boxH])

  const onPointerDown = (e: React.PointerEvent) => {
    if (!img) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.x
    const dy = e.clientY - drag.current.y
    setOffset(clamp({ x: drag.current.ox + dx, y: drag.current.oy + dy }))
  }
  const onPointerUp = () => { drag.current = null }

  const rotate = () => setRotation((r) => (r + 90) % 360)

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
      ctx.imageSmoothingQuality = 'high'
      const r = outWidth / boxW
      ctx.drawImage(img, offset.x * r, offset.y * r, dw * r, dh * r)
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92))
      if (!blob) throw new Error('Export impossible')
      onCropped(blob)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label="Recadrer l’image" className="bg-card animate-scale-in relative flex max-h-[96dvh] w-full flex-col overflow-hidden rounded-t-3xl shadow-2xl outline-none sm:max-h-[92vh] sm:max-w-lg sm:rounded-3xl">
        {/* En-tête */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h3 className="font-bold">Recadrer l’image</h3>
          <button onClick={onCancel} className="rounded-lg p-1.5 text-stone-500 transition-colors hover:bg-stone-100" aria-label="Fermer"><X size={18} /></button>
        </div>

        {/* Zone de recadrage */}
        <div className="flex flex-1 items-center justify-center overflow-y-auto p-5">
          <div ref={wrapRef} className="w-full">
            <div
              className="relative mx-auto touch-none overflow-hidden rounded-2xl bg-stone-900 select-none"
              style={{ width: boxW, height: boxH, cursor: img ? 'grab' : 'default' }}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img.src}
                  alt=""
                  draggable={false}
                  style={{ position: 'absolute', left: offset.x, top: offset.y, width: dw, height: dh, maxWidth: 'none' }}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/60"><Loader2 className="animate-spin" /></div>
              )}

              {/* Grille (règle des tiers) */}
              <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                <div className="absolute left-1/3 top-0 h-full w-px bg-white/25" />
                <div className="absolute left-2/3 top-0 h-full w-px bg-white/25" />
                <div className="absolute top-1/3 left-0 h-px w-full bg-white/25" />
                <div className="absolute top-2/3 left-0 h-px w-full bg-white/25" />
              </div>

              {/* Guide circulaire (avatar) */}
              {isCircle && (
                <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/80" />
              )}
            </div>

            {isCircle && <p className="text-muted-foreground mt-3 text-center text-xs">Le rond indique la zone visible de ton avatar.</p>}
          </div>
        </div>

        {/* Contrôles */}
        <div className="space-y-3 border-t px-5 py-4">
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" size="icon-sm" onClick={() => setZoom((z) => Math.max(1, +(z - 0.15).toFixed(2)))} aria-label="Zoom arrière"><ZoomOut size={16} /></Button>
            <input
              type="range" min={1} max={4} step={0.01} value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-amber-600"
              aria-label="Zoom"
            />
            <Button type="button" variant="outline" size="icon-sm" onClick={() => setZoom((z) => Math.min(4, +(z + 0.15).toFixed(2)))} aria-label="Zoom avant"><ZoomIn size={16} /></Button>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" size="sm" onClick={rotate}><RotateCw size={15} /> Pivoter</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => { setZoom(1); setOffset(centered()) }}><Move size={15} /> Recentrer</Button>
            <span className="text-muted-foreground ml-auto inline-flex items-center gap-1.5 text-xs">
              {shape === 'circle' ? <Circle size={13} /> : <Square size={13} />} {shape === 'circle' ? (circularLabel ? 'Carré (avatar)' : 'Carré') : `${aspect === 1 ? '1:1' : aspect === 2 / 3 ? '2:3' : aspect === 3 ? '3:1' : aspect.toFixed(2)}`}
            </span>
          </div>

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>Annuler</Button>
            <Button type="button" className="flex-1" onClick={crop} disabled={busy || !img}>
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Valider
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
