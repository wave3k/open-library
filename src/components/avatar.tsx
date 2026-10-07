import { COVERS } from '@/lib/plume'
import { cn } from '@/lib/utils'

export interface AvatarUser {
  display_name?: string
  name?: string
  avatar_emoji?: string
  avatar_color?: string
  avatar_image?: string
}

const GRADIENTS: Record<string, string> = {
  indigo: 'from-indigo-500 to-purple-600',
  emerald: 'from-emerald-500 to-teal-600',
  rose: 'from-rose-500 to-orange-500',
  sky: 'from-sky-500 to-blue-600',
  amber: 'from-amber-500 to-red-500',
  slate: 'from-slate-600 to-slate-800',
}

export function Avatar({ user, size = 40 }: { user: AvatarUser; size?: number }) {
  const color = user.avatar_color && GRADIENTS[user.avatar_color] ? user.avatar_color : 'amber'
  const initials = (user.display_name || user.name || '?')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  if (user.avatar_image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={user.avatar_image}
        alt={`Avatar de ${user.display_name || user.name || 'utilisateur'}`}
        className="shrink-0 rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <div
      className={cn('flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-bold text-white', GRADIENTS[color])}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-hidden="true"
    >
      {user.avatar_emoji ? <span style={{ fontSize: Math.round(size * 0.5) }}>{user.avatar_emoji}</span> : initials}
    </div>
  )
}

export { COVERS }
