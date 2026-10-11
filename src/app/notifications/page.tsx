import { NotificationsView } from '@/components/notifications-view'
import { privateMetadata } from '@/lib/seo'

export const metadata = privateMetadata('Notifications — Open Library')

export default function NotificationsPage() {
  return <NotificationsView />
}
