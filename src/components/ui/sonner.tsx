'use client'

import {
  CheckCircleIcon,
  InfoIcon,
  SpinnerIcon,
  WarningIcon,
  XCircleIcon,
} from '@phosphor-icons/react'
import { useTheme } from 'next-themes'
import { Toaster as Sonner, type ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps['theme']}
      className="toaster group"
      icons={{
        success: (
          <CheckCircleIcon
            className="size-4"
            style={{ color: 'var(--success)' }}
          />
        ),
        info: <InfoIcon className="size-4" style={{ color: 'var(--info)' }} />,
        warning: (
          <WarningIcon className="size-4" style={{ color: 'var(--warning)' }} />
        ),
        error: (
          <XCircleIcon className="size-4" style={{ color: 'var(--error)' }} />
        ),
        loading: (
          <SpinnerIcon
            className="size-4 animate-spin"
            style={{ color: 'var(--foreground)' }}
          />
        ),
      }}
      style={
        {
          '--normal-bg': 'var(--background)',
          '--normal-text': 'var(--foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': '0px',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
