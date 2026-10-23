import type { LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router'
import { cn } from '@/lib/cn'
import { Tooltip } from './Tooltip'

/* UI.md §18 — one Button: explicit heights, icon by component reference, Tooltip from `title`. */
type Variant = 'primary' | 'secondary' | 'ghost' | 'glow'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-violet-700 text-white hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-500',
  secondary:
    'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 dark:hover:border-white/25 dark:bg-transparent dark:text-slate-100 dark:border-white/15 dark:hover:bg-white/[0.06]',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/[0.06] dark:hover:text-white',
  /** Kept for existing call sites; same as primary in the minimal theme. */
  glow: 'bg-violet-700 text-white hover:bg-violet-800 dark:bg-violet-600 dark:hover:bg-violet-500',
}

const SIZES: Record<Size, string> = {
  // Phones get iOS-sized touch targets (44px for md/lg, 40px for sm); desktop stays compact.
  sm: 'h-10 px-3.5 text-sm gap-1.5 rounded-xl sm:h-8 sm:px-3 sm:text-xs sm:rounded-lg',
  md: 'h-11 px-4 text-[15px] gap-2 rounded-xl sm:h-10 sm:text-sm sm:rounded-lg',
  lg: 'h-12 px-5 text-base gap-2 rounded-2xl sm:h-11 sm:text-[15px] sm:rounded-xl',
}
const ICON_PX: Record<Size, number> = { sm: 14, md: 16, lg: 18 }

interface Props extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'title'> {
  variant?: Variant
  size?: Size
  icon?: LucideIcon
  iconRight?: LucideIcon
  iconOnly?: boolean
  title?: string
  to?: string
  children?: ReactNode
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  iconOnly,
  title,
  to,
  className,
  children,
  disabled,
  ...rest
}: Props) {
  const classes = cn(
    'inline-flex shrink-0 select-none items-center justify-center font-medium transition-[color,background-color,border-color,opacity,transform] duration-150 active:scale-[0.98] active:opacity-80',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600',
    VARIANTS[variant],
    SIZES[size],
    iconOnly && 'aspect-square px-0',
    disabled && 'pointer-events-none opacity-40',
    className,
  )
  const inner = (
    <>
      {Icon && <Icon size={ICON_PX[size]} strokeWidth={2} className="shrink-0" />}
      {iconOnly ? <span className="sr-only">{children}</span> : children}
      {IconRight && <IconRight size={ICON_PX[size]} strokeWidth={2} className="shrink-0" />}
    </>
  )
  const hint = title ?? (iconOnly && typeof children === 'string' ? children : undefined)
  const el = to ? (
    <Link to={to} className={classes} aria-disabled={disabled}>
      {inner}
    </Link>
  ) : (
    <button type="button" className={classes} disabled={disabled} {...rest}>
      {inner}
    </button>
  )
  if (!hint) return el
  // A disabled <button> fires no hover events, so give the tooltip a span to listen on.
  return <Tooltip content={hint}>{disabled ? <span className="inline-flex">{el}</span> : el}</Tooltip>
}
