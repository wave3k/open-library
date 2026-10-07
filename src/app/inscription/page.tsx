'use client'

import { SignupForm, useRedirectIfLogged } from '@/components/auth-forms'

export default function InscriptionPage() {
  useRedirectIfLogged()
  return <SignupForm />
}
