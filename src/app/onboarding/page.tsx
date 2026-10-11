import { Onboarding } from '@/components/onboarding'
import { privateMetadata } from '@/lib/seo'

export const metadata = privateMetadata('Bienvenue — Open Library')

export default function OnboardingPage() {
  return <Onboarding />
}
