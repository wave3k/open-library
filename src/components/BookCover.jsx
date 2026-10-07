import { COVERS } from '../data/seedBooks.js'

const SIZES = {
  sm: { w: 76, h: 112, emoji: 20, title: 10, author: 9 },
  md: { w: 132, h: 196, emoji: 32, title: 14, author: 11 },
  lg: { w: 180, h: 268, emoji: 44, title: 17, author: 12 },
}

/** Couverture affichée comme un vrai livre : dos, tranche de pages, reflet. */
export default function BookCover({ cover, title, author, genre, size = 'md' }) {
  const c = COVERS.find((x) => x.id === cover) ?? COVERS[0]
  const s = SIZES[size] ?? SIZES.md
  return (
    <div className="book3d" style={{ width: s.w, height: s.h }} role="img" aria-label={`Couverture de ${title}`}>
      <div
        className={`absolute inset-0 flex flex-col overflow-hidden bg-gradient-to-br ${c.bg} text-white`}
        style={{ borderRadius: 'inherit', padding: size === 'sm' ? 8 : 12 }}
      >
        {/* filet décoratif haut */}
        <div className="mx-auto mb-1 h-px w-2/3 bg-white/40" />
        <span style={{ fontSize: s.emoji, lineHeight: 1.2 }}>{c.emoji}</span>
        <p
          className="mt-1.5 font-bold leading-snug"
          style={{
            fontSize: s.title,
            display: '-webkit-box',
            WebkitLineClamp: 5,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </p>
        <div className="mt-auto min-w-0">
          <div className="mb-1 h-px w-1/3 bg-white/40" />
          <p className="truncate uppercase tracking-wider text-white/85" style={{ fontSize: s.author }}>
            {author}
          </p>
          {genre && size !== 'sm' && (
            <p className="mt-0.5 truncate text-white/60" style={{ fontSize: s.author - 1 }}>
              {genre}
            </p>
          )}
        </div>
      </div>
      <div className="book3d-sheen" />
    </div>
  )
}
