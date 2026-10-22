import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

export function Card({ className, children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'relative min-w-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        'dark:border-white/[0.08] dark:bg-[#131318] dark:shadow-none',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('text-xs font-medium text-violet-700 dark:text-violet-300', className)}>
      {children}
    </div>
  )
}

export function Chip({
  children,
  color,
  className,
}: {
  children: ReactNode
  color?: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',
        !color && 'border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200',
        className,
      )}
      style={color ? { borderColor: `${color}55`, background: `${color}1a`, color } : undefined}
    >
      {children}
    </span>
  )
}

export function Meter({ value, color = '#6d28d9', className }: { value: number; color?: string; className?: string }) {
  return (
    <div className={cn('h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.08]', className)}>
      <div
        className="h-full rounded-full transition-[width] duration-700 ease-out"
        style={{ width: `${Math.max(2, Math.min(100, value))}%`, background: color }}
      />
    </div>
  )
}
