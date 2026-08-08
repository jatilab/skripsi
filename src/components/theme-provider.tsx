'use client'

import { Button } from '@/components/ui/button'
import { CircleHalfIcon } from '@phosphor-icons/react'
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes'
import * as React from 'react'

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme()

  const followsSystem = theme === 'system'
  const opposite = resolvedTheme === 'dark' ? 'light' : 'dark'
  const next = followsSystem ? opposite : 'system'

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => setTheme(next)}
      aria-label="Toggle theme"
    >
      <CircleHalfIcon aria-hidden="true" weight="regular" />
    </Button>
  )
}
