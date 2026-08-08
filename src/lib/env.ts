import 'server-only'

import { z } from 'zod'

const envSchema = z.object({
  APP_DOMAIN: z.string().min(1).default('localhost'),
  APP_SECRET: z.string().min(1).default('development-secret-change-me'),
  DB_HOST: z.string().min(1).default('localhost'),
  DB_PASSWORD: z.string().min(1).default('postgres'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const invalid = parsed.error.issues
    .map((issue) => issue.path.join('.'))
    .join(', ')
  throw new Error(`Invalid environment variables: ${invalid}`)
}

const { APP_DOMAIN, DB_HOST, DB_PASSWORD } = parsed.data

const local =
  APP_DOMAIN.includes('localhost') ||
  APP_DOMAIN.startsWith('127.') ||
  APP_DOMAIN.startsWith('192.168.') ||
  APP_DOMAIN.includes('.local')

export const env = {
  ...parsed.data,
  APP_URL: `${local ? 'http' : 'https'}://${APP_DOMAIN}`,
  DB_URL: `postgres://postgres:${DB_PASSWORD}@${DB_HOST}/postgres`,
}
