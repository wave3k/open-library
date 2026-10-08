import { BRAND_GRADIENTS } from '@/lib/plume'
import { cn } from '@/lib/utils'

export interface AvatarUser {
  display_name?: string
  name?: string
  avatar_emoji?: string
  avatar_color?: string
  avatar_image?: string
}

export function gradientFor(id?: string): string {
  return (BRAND_GRADIENTS.find((g) => g.id === id) ?? BRAND_GRADIENTS[0]).css
}

export function Avatar({ user, size = 40 }: { user: AvatarUser; size?: number }) {
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
      className={cn('flex shrink-0 items-center justify-center rounded-full font-bold text-white')}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4), background: gradientFor(user.avatar_color) }}
      aria-hidden="true"
    >
      {user.avatar_emoji ? <span style={{ fontSize: Math.round(size * 0.5) }}>{user.avatar_emoji}</span> : initials}
    </div>
  )
}
