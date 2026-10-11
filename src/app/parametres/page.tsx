import { SettingsView } from '@/components/settings-view'
import { privateMetadata } from '@/lib/seo'

export const metadata = privateMetadata('Paramètres — Open Library')

export default function ParametresPage() {
  return <SettingsView />
}
