'use client'

import { LoginForm, useRedirectIfLogged } from '@/components/auth-forms'

export default function ConnexionPage() {
  useRedirectIfLogged()
  return <LoginForm />
}
