import { AnalyticsView } from '@/components/analytics-view'
import { privateMetadata } from '@/lib/seo'

export const metadata = privateMetadata('Statistiques — Plume')

export default function AnalyticsPage() {
  return <AnalyticsView />
}
