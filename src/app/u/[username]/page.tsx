'use client'

import { useParams } from 'next/navigation'
import { ProfileView } from '@/components/profile-view'

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  return <ProfileView username={username} />
}
