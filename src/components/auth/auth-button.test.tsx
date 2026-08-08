// @vitest-environment jsdom
import { authClient } from '@/lib/auth/client'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthButton } from './auth-button'

vi.mock('@/lib/auth/client', () => ({
  authClient: {
    useSession: vi.fn(),
    signOut: vi.fn(),
  },
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const useSession = vi.mocked(authClient.useSession)
const signOut = vi.mocked(authClient.signOut)

function sessionState(user: { username: string } | null) {
  return { data: user ? { user } : null, isPending: false } as never
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AuthButton', () => {
  it('disables the button while the session is loading', () => {
    useSession.mockReturnValue({ data: null, isPending: true } as never)

    render(<AuthButton />)

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeDisabled()
  })

  it('renders a sign-in button when signed out', () => {
    useSession.mockReturnValue(sessionState(null))

    render(<AuthButton />)

    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('opens the auth dialog when signed out', async () => {
    useSession.mockReturnValue(sessionState(null))
    const user = userEvent.setup()

    render(<AuthButton />)
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
  })

  it('signs out when signed in', async () => {
    useSession.mockReturnValue(sessionState({ username: 'jati' }))
    const user = userEvent.setup()

    render(<AuthButton />)
    await user.click(screen.getByRole('button', { name: 'Sign out' }))

    await waitFor(() => expect(signOut).toHaveBeenCalled())
  })
})
