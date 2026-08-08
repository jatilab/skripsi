import { db } from '@/db'
import * as schema from '@/db/schema'
import { env } from '@/lib/env'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { username } from 'better-auth/plugins'

export const auth = betterAuth({
  baseURL: process.env.NODE_ENV === 'production' ? env.APP_URL : undefined,
  secret: env.APP_SECRET,
  emailAndPassword: {
    enabled: true,
  },
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  plugins: [username()],
})
