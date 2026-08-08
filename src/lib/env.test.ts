import { afterEach, describe, expect, it, vi } from 'vitest'

const originalEnv = { ...process.env }
const envKeys = ['APP_DOMAIN', 'APP_SECRET', 'DB_HOST', 'DB_PASSWORD']

function freshEnv(vars: Record<string, string>) {
  for (const key of envKeys) delete process.env[key]
  Object.assign(process.env, vars)
  vi.resetModules()
  return import('@/lib/env')
}

afterEach(() => {
  process.env = originalEnv
})

describe('env', () => {
  it('applies defaults with no environment variables', async () => {
    const { env } = await freshEnv({})
    expect(env.APP_DOMAIN).toBe('localhost')
    expect(env.APP_SECRET).toBe('development-secret-change-me')
    expect(env.DB_HOST).toBe('localhost')
    expect(env.DB_PASSWORD).toBe('postgres')
    expect(env.APP_URL).toBe('http://localhost')
    expect(env.DB_URL).toBe('postgres://postgres:postgres@localhost/postgres')
  })

  it('uses http for local domains', async () => {
    for (const domain of [
      'localhost',
      '127.0.0.1',
      '192.168.1.5',
      'app.local',
    ]) {
      const { env } = await freshEnv({ APP_DOMAIN: domain })
      expect(env.APP_URL).toBe(`http://${domain}`)
    }
  })

  it('uses https for public domains', async () => {
    const { env } = await freshEnv({ APP_DOMAIN: 'skripsi.jati.dev' })
    expect(env.APP_URL).toBe('https://skripsi.jati.dev')
  })

  it('builds the database URL from DB_HOST and DB_PASSWORD', async () => {
    const { env } = await freshEnv({
      DB_HOST: 'db.internal',
      DB_PASSWORD: 's3cret',
    })
    expect(env.DB_URL).toBe('postgres://postgres:s3cret@db.internal/postgres')
  })

  it('throws on empty values that fail validation', async () => {
    await expect(freshEnv({ APP_SECRET: '' })).rejects.toThrow(
      'Invalid environment variables',
    )
  })
})
