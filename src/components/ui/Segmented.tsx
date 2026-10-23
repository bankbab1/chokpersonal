import { useEffect, useRef } from 'react'
import { cn } from '@/lib/cn'

/**
 * iOS-style segmented control. Scrolls sideways on narrow phones and keeps the active segment in view.
 * Use for switching views of one page (never for navigation between pages).
 */
export function Segmented<K extends string>({ value, onChange, options, className }: { value: K; onChange: (v: K) => void; options: { id: K; label: string }[]; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [value])
  return (
    <div ref={ref} role="tablist" className={cn('no-scrollbar -mx-1 flex overflow-x-auto px-1', className)}>
      <div className="flex min-w-full gap-1 rounded-xl bg-slate-200/60 p-1 dark:bg-white/[0.08]">
        {options.map((o) => {
          const on = o.id === value
          return (
            <button
              key={o.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => onChange(o.id)}
              className={cn(
                'h-9 flex-1 shrink-0 whitespace-nowrap rounded-lg px-2.5 text-[13px] font-medium sm:px-3 sm:text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 sm:h-8',
                on ? 'bg-white text-slate-900 shadow-sm dark:bg-white/15 dark:text-white' : 'text-slate-600 active:bg-white/50 dark:text-slate-300',
              )}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
