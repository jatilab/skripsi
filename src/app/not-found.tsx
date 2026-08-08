import { StatusPage } from '@/components/status-page'
import { buttonVariants } from '@/components/ui/button'
import Link from 'next/link'

export default function NotFound() {
  return (
    <StatusPage
      code="404"
      title="Page not found"
      message="The page you are looking for doesn't exist or has moved."
    >
      <Link href="/" className={buttonVariants({ variant: 'outline' })}>
        Back home
      </Link>
    </StatusPage>
  )
}
