import { PasswordInput } from '@/components/auth/password-input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth/client'
import { placeholderEmail } from '@/lib/auth/placeholder-email'
import { passwordSchema, usernameSchema } from '@/lib/auth/validation'
import type { SubmitEvent } from 'react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'

function parseCredentials(
  form: FormData,
  confirmPassword: boolean,
):
  | { ok: true; username: string; password: string }
  | { ok: false; error: string } {
  const username = usernameSchema.safeParse(String(form.get('username') ?? ''))
  if (!username.success) {
    return {
      ok: false,
      error: username.error.issues[0]?.message ?? 'Invalid username',
    }
  }

  const password = passwordSchema.safeParse(String(form.get('password') ?? ''))
  if (!password.success) {
    return {
      ok: false,
      error: password.error.issues[0]?.message ?? 'Invalid password',
    }
  }

  if (confirmPassword && form.get('password-confirm') !== password.data) {
    return {
      ok: false,
      error: "Passwords don't match",
    }
  }

  return { ok: true, username: username.data, password: password.data }
}

export function AuthDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const isSignIn = mode === 'sign-in'

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setMode('sign-in')
      setError(null)
    }
    onOpenChange(next)
  }

  const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const credentials = parseCredentials(
      new FormData(e.currentTarget),
      !isSignIn,
    )
    if (!credentials.ok) {
      setError(credentials.error)
      return
    }

    startTransition(async () => {
      const result = isSignIn
        ? await authClient.signIn.username({
            username: credentials.username,
            password: credentials.password,
          })
        : await authClient.signUp.email({
            name: credentials.username,
            username: credentials.username,
            email: placeholderEmail(credentials.username),
            password: credentials.password,
          })

      if (result.error) {
        setError(
          result.error.message ??
            (isSignIn ? 'Invalid username or password' : 'Unable to sign up'),
        )
        return
      }

      toast.success(isSignIn ? 'Signed in' : 'Account created')
      handleOpenChange(false)
    })
  }

  const switchMode = () => {
    setMode(isSignIn ? 'sign-up' : 'sign-in')
    setError(null)
  }

  const submitLabel = pending
    ? isSignIn
      ? 'Signing in…'
      : 'Creating account…'
    : isSignIn
      ? 'Sign in'
      : 'Create account'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isSignIn ? 'Sign in' : 'Create account'}</DialogTitle>
          <DialogDescription>
            {isSignIn
              ? 'Sign in with your username and password'
              : 'Create an account with a username and password'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="auth-username">Username</Label>
            <Input
              id="auth-username"
              name="username"
              placeholder="username"
              required
              autoComplete="username"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="auth-password">Password</Label>
            <PasswordInput
              id="auth-password"
              name="password"
              placeholder="••••••••"
              required
              autoComplete={isSignIn ? 'current-password' : 'new-password'}
            />
          </div>
          {!isSignIn && (
            <div className="grid gap-1.5">
              <Label htmlFor="auth-password-confirm">Confirm password</Label>
              <PasswordInput
                id="auth-password-confirm"
                name="password-confirm"
                placeholder="••••••••"
                required
                autoComplete="new-password"
              />
            </div>
          )}
          {error && <p className="text-destructive text-xs">{error}</p>}
          <Button type="submit" disabled={pending}>
            {submitLabel}
          </Button>
        </form>

        <button
          type="button"
          onClick={switchMode}
          className="text-primary cursor-pointer text-xs hover:underline"
        >
          {isSignIn
            ? 'Need an account? Sign up'
            : 'Already have an account? Sign in'}
        </button>
      </DialogContent>
    </Dialog>
  )
}
