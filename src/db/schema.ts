import * as t from 'drizzle-orm/pg-core'

const timestamps = {
  createdAt: t
    .timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: t
    .timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
}

export const user = t.pgTable('user', {
  id: t.text('id').primaryKey(),
  name: t.text('name').notNull(),
  email: t.text('email').notNull().unique(),
  emailVerified: t.boolean('email_verified').notNull(),
  username: t.text('username').notNull().unique(),
  displayUsername: t.text('display_username').notNull(),
  ...timestamps,
})

export const session = t.pgTable(
  'session',
  {
    id: t.text('id').primaryKey(),
    userId: t
      .text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    token: t.text('token').notNull().unique(),
    expiresAt: t.timestamp('expires_at', { withTimezone: true }).notNull(),
    ipAddress: t.text('ip_address'),
    userAgent: t.text('user_agent'),
    ...timestamps,
  },
  (table) => [t.index('session_user_id_idx').on(table.userId)],
)

export const account = t.pgTable(
  'account',
  {
    id: t.text('id').primaryKey(),
    userId: t
      .text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accountId: t.text('account_id').notNull(),
    providerId: t.text('provider_id').notNull(),
    password: t.text('password'),
    ...timestamps,
  },
  (table) => [t.index('account_user_id_idx').on(table.userId)],
)

export type User = typeof user.$inferSelect
export type NewUser = typeof user.$inferInsert
export type Session = typeof session.$inferSelect
export type NewSession = typeof session.$inferInsert
export type Account = typeof account.$inferSelect
export type NewAccount = typeof account.$inferInsert
