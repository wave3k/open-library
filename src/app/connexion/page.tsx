import { LoginPage } from '@/components/auth-forms'
import { privateMetadata } from '@/lib/seo'

export const metadata = privateMetadata('Connexion — Plume')

export default function ConnexionPage() {
  return <LoginPage />
}
