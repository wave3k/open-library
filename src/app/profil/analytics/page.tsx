import { AnalyticsView } from '@/components/analytics-view'
import { privateMetadata } from '@/lib/seo'

export const metadata = privateMetadata('Statistiques — Open Library')

export default function AnalyticsPage() {
  return <AnalyticsView />
}
