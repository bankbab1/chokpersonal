import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

/*
 * UI.md §4 — the only hover hint in the app (never native `title`):
 * 350 ms delay, placed at the cursor, portaled to <body>, off below 1024 px (no hover on touch).
 * The wrapper is `display: contents`, so position is measured from the child, not the wrapper.
 */
const SHOW_DELAY_MS = 350
const NO_TOOLTIP_MEDIA_QUERY = '(max-width: 1023px)'
const MARGIN = 12

export function Tooltip({ content, children }: { content: ReactNode; children: ReactNode }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null)
  const timer = useRef<number | undefined>(undefined)
  const wrap = useRef<HTMLSpanElement>(null)
  const last = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const schedule = (point: { x: number; y: number } | null) => {
    if (window.matchMedia(NO_TOOLTIP_MEDIA_QUERY).matches) return
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      if (point) return setPos(point)
      const el = wrap.current?.firstElementChild as HTMLElement | null
      const r = el?.getBoundingClientRect()
      if (r) setPos({ x: r.left + r.width / 2, y: r.bottom })
    }, SHOW_DELAY_MS)
  }
  const hide = () => {
    window.clearTimeout(timer.current)
    setPos(null)
  }

  if (!content) return <>{children}</>

  return (
    <span
      ref={wrap}
      className="contents"
      onMouseEnter={(e) => {
        last.current = { x: e.clientX, y: e.clientY }
        schedule(last.current)
      }}
      onMouseMove={(e) => {
        last.current = { x: e.clientX, y: e.clientY }
        if (pos) setPos(last.current)
      }}
      onMouseLeave={hide}
      onFocus={() => schedule(null)}
      onBlur={hide}
    >
      {children}
      {pos &&
        createPortal(
          <div
            role="tooltip"
            className="pointer-events-none fixed z-[100] max-w-xs animate-pop rounded-xl bg-slate-900/95 px-3 py-2 text-xs leading-relaxed text-white shadow-xl dark:bg-white/95 dark:text-slate-900"
            style={{
              left: Math.min(pos.x + MARGIN, window.innerWidth - 300),
              top: Math.min(pos.y + MARGIN + 6, window.innerHeight - 80),
            }}
          >
            {content}
          </div>,
          document.body,
        )}
    </span>
  )
}
