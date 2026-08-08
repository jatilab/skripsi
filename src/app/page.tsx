import { AuthButton } from '@/components/auth/auth-button'
import { ThemeToggle } from '@/components/theme-provider'

export default function Home() {
  return (
    <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-4 px-4">
      <ThemeToggle className="absolute top-4 right-4" />
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        skripsi
      </h1>
      <p className="text-muted-foreground text-sm">
        Better Auth setup — sign in to get started
      </p>
      <AuthButton />
    </div>
  )
}
