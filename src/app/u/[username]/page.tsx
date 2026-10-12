import { ProfileView, type ProfileInitial } from '@/components/profile-view'
import { JsonLd } from '@/components/json-ld'
import { fetchPublicProfile } from '@/lib/server-api'
import { profileJsonLd } from '@/lib/jsonld'
import { SITE_URL } from '@/lib/seo'

// Page profil rendue côté serveur : nom, bio, stats et livres publics sont
// présents dans le HTML initial (indexable sans JavaScript).
export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const data = await fetchPublicProfile(username)
  const initial = data as unknown as ProfileInitial | null

  const visible = initial && !initial.restricted && initial.visibility !== 'private'
  const avatar = initial?.user?.avatar_image
  const avatarAbs = avatar ? (avatar.startsWith('/') ? `${SITE_URL}${avatar}` : avatar) : undefined

  return (
    <>
      {visible && (
        <JsonLd
          data={profileJsonLd({
            username: initial!.user?.username || username,
            displayName: initial!.user?.display_name || initial!.user?.name || username,
            bio: initial!.user?.bio,
            avatarImage: avatarAbs,
          })}
        />
      )}
      <ProfileView username={username} initial={initial} />
    </>
  )
}
