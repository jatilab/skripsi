'use client'

import { StatusPage } from '@/components/status-page'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'
import './globals.css'

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en" className="h-full">
      <body className="bg-background text-foreground antialiased">
        <main className="flex min-h-full flex-col">
          <StatusPage
            code="500"
            title="Something went wrong"
            message="An unexpected error occurred. Please try again."
          >
            <Button onClick={() => retry()}>Try again</Button>
          </StatusPage>
        </main>
      </body>
    </html>
  )
}
