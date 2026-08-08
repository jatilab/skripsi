import { z } from 'zod'

const usernameMessage =
  'Username must be 3–30 characters using only lowercase letters, numbers, underscores, and single dots'

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(
    z
      .string()
      .min(3, usernameMessage)
      .max(30, usernameMessage)
      .regex(/^[a-z0-9_]+(?:\.[a-z0-9_]+)*$/, usernameMessage),
  )

export const passwordSchema = z.string().refine((value) => {
  const classes = [/[A-Z]/, /[a-z]/, /\d/, /[^A-Za-z0-9]/]
  const matched = classes.filter((rule) => rule.test(value)).length
  return matched >= 3
}, 'Password must contain at least 3 of uppercase letters, lowercase letters, numbers, and symbols')
