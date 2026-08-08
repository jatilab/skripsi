import 'dotenv/config'
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: `postgres://postgres:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/postgres`,
  },
})
