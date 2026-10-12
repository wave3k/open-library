import { NotificationsView } from '@/components/notifications-view'
import { privateMetadata } from '@/lib/seo'

export const metadata = privateMetadata('Notifications — Plume')

export default function NotificationsPage() {
  return <NotificationsView />
}
