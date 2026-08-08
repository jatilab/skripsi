import type { ReactNode } from 'react'

export function StatusPage({
  code,
  title,
  message,
  children,
}: {
  code: string
  title: string
  message: string
  children?: ReactNode
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
      <p className="text-muted-foreground text-xs tracking-widest">{code}</p>
      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        {title}
      </h1>
      <p className="text-muted-foreground text-sm">{message}</p>
      {children && (
        <div className="mt-2 flex items-center gap-2">{children}</div>
      )}
    </div>
  )
}
