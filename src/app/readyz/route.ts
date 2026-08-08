import { db } from '@/db'
import { sql } from 'drizzle-orm'

export async function GET(): Promise<Response> {
  try {
    await db.execute(sql`SELECT 1`)
    return new Response('ok', { status: 200 })
  } catch {
    return new Response('unavailable', { status: 503 })
  }
}
