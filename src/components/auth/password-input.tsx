import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react'
import type { ComponentProps } from 'react'
import { useState } from 'react'

export function PasswordInput({
  className,
  ...props
}: ComponentProps<typeof Input>) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="relative">
      <Input
        {...props}
        type={revealed ? 'text' : 'password'}
        className={cn('pr-10', className)}
      />
      <button
        type="button"
        aria-label={revealed ? 'Hide password' : 'Show password'}
        className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex cursor-pointer items-center px-2.5 outline-none"
        onPointerDown={(e) => {
          e.preventDefault()
          setRevealed(true)
        }}
        onPointerUp={() => setRevealed(false)}
        onPointerCancel={() => setRevealed(false)}
        onPointerLeave={() => setRevealed(false)}
      >
        {revealed ? (
          <EyeSlashIcon className="size-4" />
        ) : (
          <EyeIcon className="size-4" />
        )}
      </button>
    </div>
  )
}
