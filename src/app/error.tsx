'use client'

import { StatusPage } from '@/components/status-page'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

export default function ErrorPage({
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
    <StatusPage
      code="500"
      title="Something went wrong"
      message="An unexpected error occurred. Please try again."
    >
      <Button onClick={() => retry()}>Try again</Button>
    </StatusPage>
  )
}
