import { usernameClient } from 'better-auth/client/plugins'
import { username } from 'better-auth/plugins'
import { getTestInstance } from 'better-auth/test'
import { describe, expect, it } from 'vitest'

const { client, cookieSetter } = await getTestInstance(
  {
    emailAndPassword: { enabled: true },
    plugins: [username()],
    rateLimit: { enabled: false },
  },
  {
    clientOptions: { plugins: [usernameClient()] },
  },
)

type SignUpOptions = NonNullable<Parameters<typeof client.signUp.email>[1]>

async function signUpUser(username: string, options?: SignUpOptions) {
  return client.signUp.email(
    {
      email: `${username}@user.com`,
      password: 'Abcdef1!',
      name: username,
      username,
    },
    options,
  )
}

describe('auth flows', () => {
  it('signs up with email and a username', async () => {
    const headers = new Headers()
    const result = await signUpUser('newuser', {
      onSuccess: cookieSetter(headers),
    })

    expect(result.error).toBeNull()
    expect(result.data?.user.username).toBe('newuser')
    expect(result.data?.user.email).toBe('newuser@user.com')

    const session = await client.getSession({ fetchOptions: { headers } })
    expect(session.data?.user.username).toBe('newuser')
  })

  it('signs in with username and password', async () => {
    await signUpUser('signinuser')

    const headers = new Headers()
    const result = await client.signIn.username(
      { username: 'signinuser', password: 'Abcdef1!' },
      { onSuccess: cookieSetter(headers) },
    )

    expect(result.error).toBeNull()
    expect(result.data?.user.username).toBe('signinuser')

    const session = await client.getSession({ fetchOptions: { headers } })
    expect(session.data?.user.username).toBe('signinuser')
  })

  it('rejects a wrong password', async () => {
    await signUpUser('wrongpassuser')

    const result = await client.signIn.username({
      username: 'wrongpassuser',
      password: 'WrongPass1!',
    })

    expect(result.data).toBeNull()
    expect(result.error).toBeDefined()
  })

  it('rejects a duplicate username', async () => {
    await signUpUser('dupuser')

    const result = await client.signUp.email({
      email: 'dup2@user.com',
      password: 'Abcdef1!',
      name: 'dupuser2',
      username: 'dupuser',
    })

    expect(result.data).toBeNull()
    expect(result.error).toBeDefined()
  })

  it('returns no session for anonymous requests', async () => {
    const session = await client.getSession()
    expect(session.data).toBeNull()
  })

  it('clears the session on sign out', async () => {
    await signUpUser('signoutuser')

    const headers = new Headers()
    await client.signIn.username(
      { username: 'signoutuser', password: 'Abcdef1!' },
      { onSuccess: cookieSetter(headers) },
    )

    const before = await client.getSession({ fetchOptions: { headers } })
    expect(before.data?.user.username).toBe('signoutuser')

    await client.signOut({ fetchOptions: { headers } })

    const after = await client.getSession({ fetchOptions: { headers } })
    expect(after.data).toBeNull()
  })
})
