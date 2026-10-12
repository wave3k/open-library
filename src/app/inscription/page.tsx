import { SignupPage } from '@/components/auth-forms'
import { privateMetadata } from '@/lib/seo'

export const metadata = privateMetadata('Créer un compte — Plume')

export default function InscriptionPage() {
  return <SignupPage />
}
