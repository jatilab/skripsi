'use client'

import { AuthDialog } from '@/components/auth/auth-dialog'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth/client'
import { useState } from 'react'

export function AuthButton() {
  const { data: session, isPending } = authClient.useSession()
  const [authOpen, setAuthOpen] = useState(false)

  return (
    <>
      {isPending ? (
        <Button disabled>Sign in</Button>
      ) : session ? (
        <Button onClick={() => authClient.signOut()}>Sign out</Button>
      ) : (
        <Button onClick={() => setAuthOpen(true)}>Sign in</Button>
      )}
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  )
}
