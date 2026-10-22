import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * A second bar that sticks directly under the app header (h-14), edge to edge with the page gutter.
 * Solid page-coloured background and a bottom rule, so content never shows through or above it.
 * Use for page-level filters and progress; never stick a floating card with a gap above it.
 */
export function StickyBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'sticky top-14 z-30 -mx-4 border-b border-slate-200/80 bg-[#fafafa]/95 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6',
        'dark:border-white/[0.08] dark:bg-[#0c0c10]/95',
        className,
      )}
    >
      {children}
    </div>
  )
}
