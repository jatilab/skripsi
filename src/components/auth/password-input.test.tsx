// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { PasswordInput } from './password-input'

describe('PasswordInput', () => {
  it('renders a password field by default', () => {
    render(<PasswordInput aria-label="password" />)
    const input = screen.getByLabelText('password')
    expect(input).toHaveAttribute('type', 'password')
    expect(
      screen.getByRole('button', { name: 'Show password' }),
    ).toBeInTheDocument()
  })

  it('reveals the password while the toggle is held', () => {
    render(<PasswordInput aria-label="password" />)
    const input = screen.getByLabelText('password')
    const toggle = screen.getByRole('button', { name: 'Show password' })

    fireEvent.pointerDown(toggle)
    expect(input).toHaveAttribute('type', 'text')
    expect(toggle).toHaveAccessibleName('Hide password')

    fireEvent.pointerUp(toggle)
    expect(input).toHaveAttribute('type', 'password')
    expect(toggle).toHaveAccessibleName('Show password')
  })

  it('reverts to hidden when the pointer leaves the toggle', () => {
    render(<PasswordInput aria-label="password" />)
    const input = screen.getByLabelText('password')
    const toggle = screen.getByRole('button', { name: 'Show password' })

    fireEvent.pointerDown(toggle)
    fireEvent.pointerLeave(toggle)

    expect(input).toHaveAttribute('type', 'password')
  })
})
