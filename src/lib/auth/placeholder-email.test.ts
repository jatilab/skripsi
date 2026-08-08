// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { placeholderEmail } from './placeholder-email'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('placeholderEmail', () => {
  it('falls back to skripsi.local for dotless hosts', () => {
    vi.stubGlobal('window', { location: { host: 'localhost:3000' } })
    expect(placeholderEmail('jati')).toBe('jati@skripsi.local')
  })

  it('uses the host when it contains a dot', () => {
    vi.stubGlobal('window', { location: { host: 'app.jati.dev' } })
    expect(placeholderEmail('jati')).toBe('jati@app.jati.dev')
  })

  it('strips the port from the host', () => {
    vi.stubGlobal('window', { location: { host: 'example.com:3000' } })
    expect(placeholderEmail('jati')).toBe('jati@example.com')
  })
})
