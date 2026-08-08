import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { resolve } from 'node:path'
import { Pool } from 'pg'

const { DB_PASSWORD, DB_HOST } = process.env

if (!DB_PASSWORD || !DB_HOST) {
  console.error('Error: missing DB_PASSWORD or DB_HOST')
  process.exit(1)
}

const url = `postgres://postgres:${DB_PASSWORD}@${DB_HOST}/postgres`
const pool = new Pool({ connectionString: url, connectionTimeoutMillis: 2000 })

const DEADLINE_MS = 60_000
const POLL_MS = 2_000
const start = Date.now()

while (true) {
  try {
    await pool.query('SELECT 1')
    break
  } catch {
    if (Date.now() - start >= DEADLINE_MS) {
      console.error('Error: postgres not reachable, giving up')
      process.exit(1)
    }
    console.log('Waiting for postgres...')
    await new Promise((r) => setTimeout(r, POLL_MS))
  }
}

try {
  await migrate(drizzle({ client: pool }), {
    migrationsFolder: resolve('drizzle'),
  })
} catch (err) {
  console.error(err)
  process.exit(1)
}

await pool.end()
