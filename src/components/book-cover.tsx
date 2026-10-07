import { COVERS, COVER_FONTS } from '@/lib/plume'

const SIZES = {
  sm: { w: 76, h: 112, emoji: 22, title: 10, author: 9, pad: 8 },
  md: { w: 132, h: 196, emoji: 34, title: 15, author: 11, pad: 12 },
  lg: { w: 180, h: 268, emoji: 46, title: 18, author: 12, pad: 16 },
}

type CoverInput = {
  cover?: string
  cover_style?: {
    mode?: string
    preset?: string
    font?: string
    pattern?: string
    layout?: string
    emoji?: string
    textColor?: string
    image?: string
  } | null
}

/** Motif décoratif répété, dessiné en CSS pur (sans image). */
function patternStyle(pattern: string, color: string): React.CSSProperties {
  const c = color
  switch (pattern) {
    case 'stripes':
      return { backgroundImage: `repeating-linear-gradient(45deg, ${c}22 0 10px, transparent 10px 20px)` }
    case 'dots':
      return { backgroundImage: `radial-gradient(${c}33 1.5px, transparent 1.6px)`, backgroundSize: '12px 12px' }
    case 'grid':
      return {
        backgroundImage: `linear-gradient(${c}22 1px, transparent 1px), linear-gradient(90deg, ${c}22 1px, transparent 1px)`,
        backgroundSize: '16px 16px',
      }
    case 'waves':
      return {
        backgroundImage: `repeating-radial-gradient(circle at 0 100%, transparent 0 8px, ${c}1f 8px 9px)`,
      }
    default:
      return {}
  }
}

export function BookCover({
  book,
  title,
  author,
  genre,
  size = 'md',
}: {
  book?: CoverInput
  title: string
  author: string
  genre?: string
  size?: keyof typeof SIZES
}) {
  const style = book?.cover_style ?? {}
  const presetId = style.preset || book?.cover || 'indigo'
  const preset = COVERS.find((x) => x.id === presetId) ?? COVERS[0]
  const fontDef = COVER_FONTS.find((f) => f.id === style.font) ?? COVER_FONTS[0]
  const s = SIZES[size] ?? SIZES.md
  const emoji = style.emoji || preset.emoji
  const textColor = style.textColor || '#ffffff'
  const layout = style.layout || 'classic'
  const pattern = style.pattern || 'none'
  const image = style.image || ''
  const imageMode = style.mode === 'image' && !!image

  const bgClass = image && !imageMode ? '' : `bg-gradient-to-br ${preset.bg}`
  const bgStyle: React.CSSProperties = image
    ? { backgroundImage: `linear-gradient(rgba(0,0,0,.2), rgba(0,0,0,.6)), url("${image}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : {}

  // Mode image : l'image remplit la couverture, le titre est posé dessus.
  if (imageMode) {
    return (
      <div className="book3d" style={{ width: s.w, height: s.h }} role="img" aria-label={`Couverture de ${title}`}>
        <div className="absolute inset-0 overflow-hidden" style={{ borderRadius: 'inherit', ...bgStyle }}>
          <div className={`absolute inset-x-0 bottom-0 ${fontDef.className}`} style={{ padding: s.pad, background: 'linear-gradient(transparent, rgba(0,0,0,.75))' }}>
            <p className="font-bold leading-snug text-white" style={{ fontSize: s.title, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{title}</p>
            <p className="mt-0.5 truncate uppercase tracking-wider text-white/80" style={{ fontSize: s.author }}>{author}</p>
          </div>
        </div>
        <div className="book3d-sheen" />
      </div>
    )
  }

  const titleEl = (clamp = 5) => (
    <p
      className="font-bold leading-snug"
      style={{ fontSize: s.title, color: textColor, display: '-webkit-box', WebkitLineClamp: clamp, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
    >
      {title}
    </p>
  )

  return (
    <div className="book3d" style={{ width: s.w, height: s.h }} role="img" aria-label={`Couverture de ${title}`}>
      <div
        className={`absolute inset-0 flex flex-col overflow-hidden ${bgClass} ${fontDef.className}`}
        style={{ borderRadius: 'inherit', padding: s.pad, ...bgStyle }}
      >
        <div className="pointer-events-none absolute inset-0" style={patternStyle(pattern, '#ffffff')} />

        {layout === 'centered' ? (
          <div className="relative flex h-full flex-col items-center justify-center gap-2 text-center">
            {emoji && <span style={{ fontSize: s.emoji, lineHeight: 1 }}>{emoji}</span>}
            {titleEl(4)}
            <span className="uppercase tracking-widest opacity-80" style={{ fontSize: s.author, color: textColor }}>{author}</span>
          </div>
        ) : layout === 'minimal' ? (
          <div className="relative flex h-full flex-col justify-between text-white">
            <span style={{ fontSize: Math.round(s.emoji * 0.7), color: textColor }}>{emoji}</span>
            <div>
              {titleEl(4)}
              <span className="mt-1 block h-px w-1/2" style={{ background: `${textColor}66` }} />
            </div>
          </div>
        ) : layout === 'band' ? (
          <div className="relative flex h-full flex-col">
            <span className="mb-auto" style={{ fontSize: s.emoji }}>{emoji}</span>
            <div className="-mx-1 rounded-sm px-1.5 py-1" style={{ background: 'rgba(0,0,0,.35)' }}>
              {titleEl(3)}
              <span className="mt-0.5 block truncate uppercase tracking-wider opacity-85" style={{ fontSize: s.author, color: textColor }}>{author}</span>
            </div>
          </div>
        ) : (
          <div className="relative flex h-full flex-col text-white">
            <div className="mx-auto mb-1 h-px w-2/3" style={{ background: `${textColor}55` }} />
            <span style={{ fontSize: s.emoji, lineHeight: 1.2 }}>{emoji}</span>
            <div className="mt-1.5">{titleEl(5)}</div>
            <div className="mt-auto min-w-0">
              <div className="mb-1 h-px w-1/3" style={{ background: `${textColor}55` }} />
              <p className="truncate uppercase tracking-wider opacity-85" style={{ fontSize: s.author, color: textColor }}>{author}</p>
              {genre && size !== 'sm' && (
                <p className="mt-0.5 truncate opacity-60" style={{ fontSize: s.author - 1, color: textColor }}>{genre}</p>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="book3d-sheen" />
    </div>
  )
}
