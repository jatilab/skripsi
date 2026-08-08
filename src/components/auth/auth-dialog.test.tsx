// @vitest-environment jsdom
import { authClient } from '@/lib/auth/client'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthDialog } from './auth-dialog'

vi.mock('@/lib/auth/client', () => ({
  authClient: {
    signIn: { username: vi.fn() },
    signUp: { email: vi.fn() },
  },
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn() },
}))

const signInUsername = vi.mocked(authClient.signIn.username)
const signUpEmail = vi.mocked(authClient.signUp.email)
const toastSuccess = vi.mocked(toast.success)

beforeEach(() => {
  vi.clearAllMocks()
})

function renderDialog() {
  const onOpenChange = vi.fn()
  render(<AuthDialog open onOpenChange={onOpenChange} />)
  return onOpenChange
}

function okResult(username: string) {
  return { data: { user: { username } }, error: null } as never
}

function errorResult(message: string) {
  return { data: null, error: { message } } as never
}

describe('AuthDialog', () => {
  it('renders sign-in mode by default', () => {
    renderDialog()

    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument()
    expect(screen.getByLabelText('Username')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.queryByLabelText('Confirm password')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Need an account? Sign up' }),
    ).toBeInTheDocument()
  })

  it('switches to sign-up mode', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(
      screen.getByRole('button', { name: 'Need an account? Sign up' }),
    )

    expect(
      screen.getByRole('heading', { name: 'Create account' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Already have an account? Sign in' }),
    ).toBeInTheDocument()
  })

  it('shows a validation error for a weak password', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.type(screen.getByLabelText('Username'), 'jati')
    await user.type(screen.getByLabelText('Password'), 'abc')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByText(/at least 3 of uppercase letters/),
    ).toBeInTheDocument()
    expect(signInUsername).not.toHaveBeenCalled()
  })

  it('shows an error when sign-up passwords do not match', async () => {
    const user = userEvent.setup()
    renderDialog()

    await user.click(
      screen.getByRole('button', { name: 'Need an account? Sign up' }),
    )
    await user.type(screen.getByLabelText('Username'), 'jati')
    await user.type(screen.getByLabelText('Password'), 'Abcdef1!')
    await user.type(screen.getByLabelText('Confirm password'), 'Different1!')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    expect(await screen.findByText("Passwords don't match")).toBeInTheDocument()
    expect(signUpEmail).not.toHaveBeenCalled()
  })

  it('signs in successfully', async () => {
    signInUsername.mockResolvedValue(okResult('jati'))
    const user = userEvent.setup()
    const onOpenChange = renderDialog()

    await user.type(screen.getByLabelText('Username'), 'jati')
    await user.type(screen.getByLabelText('Password'), 'Abcdef1!')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    await waitFor(() => {
      expect(signInUsername).toHaveBeenCalledWith({
        username: 'jati',
        password: 'Abcdef1!',
      })
    })
    expect(toastSuccess).toHaveBeenCalledWith('Signed in')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('signs up successfully', async () => {
    signUpEmail.mockResolvedValue(okResult('jati'))
    const user = userEvent.setup()
    const onOpenChange = renderDialog()

    await user.click(
      screen.getByRole('button', { name: 'Need an account? Sign up' }),
    )
    await user.type(screen.getByLabelText('Username'), 'jati')
    await user.type(screen.getByLabelText('Password'), 'Abcdef1!')
    await user.type(screen.getByLabelText('Confirm password'), 'Abcdef1!')
    await user.click(screen.getByRole('button', { name: 'Create account' }))

    await waitFor(() => {
      expect(signUpEmail).toHaveBeenCalledWith({
        name: 'jati',
        username: 'jati',
        email: 'jati@skripsi.local',
        password: 'Abcdef1!',
      })
    })
    expect(toastSuccess).toHaveBeenCalledWith('Account created')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('surfaces an error from the server', async () => {
    signInUsername.mockResolvedValue(
      errorResult('Invalid username or password'),
    )
    const user = userEvent.setup()
    renderDialog()

    await user.type(screen.getByLabelText('Username'), 'jati')
    await user.type(screen.getByLabelText('Password'), 'Abcdef1!')
    await user.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(
      await screen.findByText('Invalid username or password'),
    ).toBeInTheDocument()
    expect(signInUsername).toHaveBeenCalled()
  })
})
