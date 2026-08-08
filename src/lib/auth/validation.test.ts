import { describe, expect, it } from 'vitest'
import { passwordSchema, usernameSchema } from './validation'

describe('usernameSchema', () => {
  it('accepts valid usernames', () => {
    for (const username of [
      'jati',
      'jati.fjr',
      'john_doe',
      'abc123',
      'a.b.c',
      'x'.repeat(30),
    ]) {
      expect(usernameSchema.safeParse(username).success).toBe(true)
    }
  })

  it('trims whitespace', () => {
    expect(usernameSchema.parse('  jati  ')).toBe('jati')
  })

  it('normalizes to lowercase', () => {
    expect(usernameSchema.parse('JatiFJR')).toBe('jatifjr')
  })

  it('rejects usernames that are too short or too long', () => {
    expect(usernameSchema.safeParse('ab').success).toBe(false)
    expect(usernameSchema.safeParse('x'.repeat(31)).success).toBe(false)
  })

  it('rejects empty usernames', () => {
    expect(usernameSchema.safeParse('').success).toBe(false)
    expect(usernameSchema.safeParse('   ').success).toBe(false)
  })

  it('rejects illegal characters', () => {
    for (const username of [
      'jati@',
      'ja ti',
      'jati!',
      'jati-foo',
      'jati.foo!',
    ]) {
      expect(usernameSchema.safeParse(username).success).toBe(false)
    }
  })

  it('rejects leading, trailing, or consecutive dots', () => {
    for (const username of ['.jati', 'jati.', 'jati..foo']) {
      expect(usernameSchema.safeParse(username).success).toBe(false)
    }
  })
})

describe('passwordSchema', () => {
  it('accepts passwords with at least 3 character classes', () => {
    for (const password of [
      'Abcdef1!',
      'abcXYZ1',
      'abc123!',
      'ABC123!',
      'aaaBBB111',
    ]) {
      expect(passwordSchema.safeParse(password).success).toBe(true)
    }
  })

  it('rejects passwords with fewer than 3 character classes', () => {
    for (const password of [
      'abcdef1',
      'ABCDEF1',
      'abcXYZ',
      'abcdefgh',
      '!@#$%^',
      'aA',
    ]) {
      expect(passwordSchema.safeParse(password).success).toBe(false)
    }
  })

  it('reports the character class message', () => {
    const result = passwordSchema.safeParse('abcdef1')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(
        'at least 3 of uppercase letters',
      )
    }
  })
})
