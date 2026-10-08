import { COVERS, COVER_FONTS } from '@/lib/plume'
import { Emoji } from '@/components/emoji'

const SIZES = {
  sm: { w: 76, h: 112, emoji: 22, title: 11, author: 9, pad: 9 },
  md: { w: 132, h: 196, emoji: 34, title: 16, author: 10, pad: 13 },
  lg: { w: 180, h: 268, emoji: 46, title: 19, author: 11, pad: 17 },
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

/** Motif décoratif répété (CSS pur). */
function patternStyle(pattern: string, color: string): React.CSSProperties {
  switch (pattern) {
    case 'stripes':
      return { backgroundImage: `repeating-linear-gradient(45deg, ${color}1f 0 12px, transparent 12px 24px)` }
    case 'dots':
      return { backgroundImage: `radial-gradient(${color}30 1.5px, transparent 1.6px)`, backgroundSize: '14px 14px' }
    case 'grid':
      return {
        backgroundImage: `linear-gradient(${color}1f 1px, transparent 1px), linear-gradient(90deg, ${color}1f 1px, transparent 1px)`,
        backgroundSize: '18px 18px',
      }
    case 'waves':
      return { backgroundImage: `repeating-radial-gradient(circle at 0 100%, transparent 0 9px, ${color}1c 9px 10px)` }
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
  const preset = COVERS.find((x) => x.id === (style.preset || book?.cover)) ?? COVERS[0]
  const fontDef = COVER_FONTS.find((f) => f.id === style.font) ?? COVER_FONTS[0]
  const s = SIZES[size] ?? SIZES.md
  const emoji = style.emoji || preset.emoji
  const textColor = style.textColor || '#ffffff'
  const layout = style.layout || 'classic'
  const pattern = style.pattern || 'none'
  const image = style.image || ''

  // Mode image : on n'affiche QUE l'image, rien d'autre.
  if (style.mode === 'image' && image) {
    return (
      <div className="book3d" style={{ width: s.w, height: s.h }} role="img" aria-label={`Couverture de ${title}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt="" className="h-full w-full object-cover" />
        <div className="book3d-sheen" />
      </div>
    )
  }

  const titleEl = (clamp = 4) => (
    <p
      className={fontDef.className}
      style={{
        fontSize: s.title,
        color: textColor,
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '0.01em',
        display: '-webkit-box',
        WebkitLineClamp: clamp,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}
    >
      {title}
    </p>
  )

  const authorEl = (
    <span
      className="uppercase"
      style={{ fontSize: s.author, color: textColor, opacity: 0.82, letterSpacing: '0.14em' }}
    >
      {author}
    </span>
  )

  return (
    <div className="book3d" style={{ width: s.w, height: s.h }} role="img" aria-label={`Couverture de ${title}`}>
      <div className="absolute inset-0" style={{ background: preset.css }} />
      <div className="pointer-events-none absolute inset-0" style={patternStyle(pattern, '#ffffff')} />

      {layout === 'centered' ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center" style={{ padding: s.pad }}>
          {emoji && <Emoji char={emoji} size={s.emoji} />}
          {titleEl(3)}
          <div className="mt-1 h-px w-8" style={{ background: `${textColor}66` }} />
          {authorEl}
        </div>
      ) : layout === 'minimal' ? (
        <div className="absolute inset-0 flex flex-col justify-between" style={{ padding: s.pad }}>
          <Emoji char={emoji} size={Math.round(s.emoji * 0.7)} />
          <div>
            {titleEl(3)}
            <span className="mt-1.5 block h-px w-1/2" style={{ background: `${textColor}66` }} />
          </div>
        </div>
      ) : layout === 'band' ? (
        <div className="absolute inset-0 flex flex-col justify-between" style={{ padding: s.pad }}>
          <Emoji char={emoji} size={s.emoji} />
          <div className="rounded-lg px-2 py-1.5" style={{ background: 'rgba(0,0,0,.32)', backdropFilter: 'blur(2px)' }}>
            {titleEl(2)}
            <span className="mt-1 block" style={{ fontSize: s.author, color: textColor, opacity: 0.85 }}>{author}</span>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col" style={{ padding: s.pad }}>
          <div className="mx-auto mb-2 h-px w-2/3" style={{ background: `${textColor}44` }} />
          <Emoji char={emoji} size={s.emoji} />
          <div className="mt-2">{titleEl(4)}</div>
          <div className="mt-auto min-w-0">
            <div className="mb-1.5 h-px w-1/3" style={{ background: `${textColor}44` }} />
            {authorEl}
            {genre && size !== 'sm' && (
              <p className="mt-0.5 truncate" style={{ fontSize: s.author - 1, color: textColor, opacity: 0.6 }}>{genre}</p>
            )}
          </div>
        </div>
      )}

      <div className="book3d-sheen" />
    </div>
  )
}
