import { X } from 'lucide-react'
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { useShellTheme } from '../layout/AppShell'
import { Button } from './Button'

/** Dragging the sheet down further than this (px) closes it. */
const DISMISS_PX = 110

/**
 * iOS-style bottom sheet on phones (grab handle, swipe down to close, safe-area padding), centred
 * dialog from sm (UI.md §24). Portaled, so it carries the theme itself.
 */
export function Sheet({
  open,
  onClose,
  label,
  wide,
  children,
}: {
  open: boolean
  onClose: () => void
  label: string
  wide?: boolean
  children: ReactNode
}) {
  const theme = useShellTheme()
  const t = useT()
  const panel = useRef<HTMLDivElement>(null)
  const drag = useRef<{ y: number; id: number } | null>(null)
  const [dy, setDy] = useState(0)

  useEffect(() => {
    if (!open) return
    setDy(0)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  // Drag from the handle (touch-action: none there, so the browser never steals the gesture).
  const start = (e: ReactPointerEvent) => {
    drag.current = { y: e.clientY, id: e.pointerId }
  }
  const move = (e: ReactPointerEvent) => {
    if (!drag.current || drag.current.id !== e.pointerId) return
    setDy(Math.max(0, e.clientY - drag.current.y))
  }
  const end = () => {
    if (!drag.current) return
    drag.current = null
    if (dy > DISMISS_PX) onClose()
    else setDy(0)
  }

  return createPortal(
    <div
      data-theme={theme}
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-6 dark:bg-black/70"
      style={{ opacity: dy ? Math.max(0.35, 1 - dy / 400) : undefined }}
      onClick={onClose}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative max-h-[92dvh] w-full animate-rise overflow-y-auto overscroll-contain overflow-x-hidden rounded-t-[1.75rem] bg-white px-5 pt-2 text-slate-900 shadow-2xl sm:rounded-2xl sm:p-8 dark:bg-[#18181d] dark:text-slate-100',
          !dy && 'transition-transform duration-200',
          wide ? 'max-w-4xl' : 'max-w-2xl',
        )}
        style={{ transform: dy ? `translateY(${dy}px)` : undefined, paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        {/* Grab handle (phones). */}
        <div
          className="sticky top-0 z-10 -mx-5 flex touch-none justify-center bg-white pb-4 pt-1.5 sm:hidden dark:bg-[#18181d]"
          aria-hidden
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            start(e)
          }}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
        >
          <span className="h-1.5 w-10 rounded-full bg-slate-300 dark:bg-white/20" />
        </div>
        <div className="absolute right-3 top-3 z-20 sm:top-3">
          <Button variant="ghost" iconOnly icon={X} onClick={onClose} aria-label={t('ปิด', 'Close')} className="rounded-full bg-slate-100 dark:bg-white/[0.08] sm:bg-transparent">
            {t('ปิด', 'Close')}
          </Button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
