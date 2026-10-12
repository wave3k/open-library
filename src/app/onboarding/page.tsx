import { Onboarding } from '@/components/onboarding'
import { privateMetadata } from '@/lib/seo'

export const metadata = privateMetadata('Bienvenue — Plume')

export default function OnboardingPage() {
  return <Onboarding />
}
