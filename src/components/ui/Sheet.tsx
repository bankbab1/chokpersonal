import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { useShellTheme } from '../layout/AppShell'
import { Button } from './Button'

/** Bottom sheet on phones, centred dialog from sm (UI.md §24). Portaled, so it carries the theme itself. */
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
  useEffect(() => {
    if (!open) return
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
  return createPortal(
    <div
      data-theme={theme}
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-6 dark:bg-black/70"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'relative max-h-[90vh] w-full animate-rise overflow-y-auto overscroll-contain overflow-x-hidden rounded-t-3xl bg-white p-6 text-slate-900 shadow-2xl sm:rounded-2xl sm:p-8 dark:bg-[#18181d] dark:text-slate-100',
          wide ? 'max-w-4xl' : 'max-w-2xl',
        )}
      >
        <div className="absolute right-3 top-3 z-10">
          <Button variant="ghost" iconOnly icon={X} onClick={onClose} aria-label={t('ปิด', 'Close')}>
            {t('ปิด', 'Close')}
          </Button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}
