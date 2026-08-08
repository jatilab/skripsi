import { auth } from '@/lib/auth/server'
import { describe, expect, it } from 'vitest'

describe('auth config', () => {
  it('constructs the better-auth instance', () => {
    expect(auth).toBeDefined()
    expect(typeof auth.handler).toBe('function')
    expect(typeof auth.api).toBe('object')
  })
})
