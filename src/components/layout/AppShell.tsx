import { BookOpen,
  ChevronDown,
  ChevronRight,
  Ellipsis,
  FlaskConical,
  Home,
  Layers,
  Moon,
  PenLine,
  SearchCheck,
  Sparkles,
  Sun,
  UserRound,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { cn } from '@/lib/cn'
import { useHtmlLang, useLangStore, useT, type T } from '@/lib/i18n'
import { useTheme, type Theme } from '@/lib/useTheme'
import { Sheet } from '../ui/Sheet'
import { Tooltip } from '../ui/Tooltip'

interface NavItem {
  to: string
  label: T
  /** Shorter label for the 7-tab phone bar. */
  short?: T
  icon: LucideIcon
  end?: boolean
  /** Shown in the desktop top bar. Personal extras (deep dive, peer view) live inside "My profile". */
  top?: boolean
}

/** The person comes first: discovery, results and how others see you. */
const NAV: NavItem[] = [
  { to: '/', label: { th: 'หน้าแรก', en: 'Home' }, icon: Home, end: true },
  {
    to: '/test',
    top: true,
    label: { th: 'แบบทดสอบ', en: 'Test' },
    short: { th: 'ทดสอบ', en: 'Test' },
    icon: PenLine,
  },
  {
    to: '/me',
    top: true,
    label: { th: 'ผลของฉัน', en: 'My profile' },
    short: { th: 'ผลฉัน', en: 'Me' },
    icon: UserRound,
  },
  {
    to: '/deep',
    label: { th: 'เจาะลึก', en: 'Deep dive' },
    short: { th: 'เจาะลึก', en: 'Deep' },
    icon: Layers,
  },
  {
    to: '/peers',
    label: { th: 'คนรอบตัว', en: 'Peer view' },
    short: { th: 'คนรอบตัว', en: 'Peers' },
    icon: UsersRound,
  },
  {
    to: '/personas',
    top: true,
    label: { th: 'ตัวละคร', en: 'Characters' },
    short: { th: 'ตัวละคร', en: 'Characters' },
    icon: Sparkles,
  },
  {
    to: '/codes',
    top: true,
    label: { th: 'สมุดรหัส', en: 'Code book' },
    short: { th: 'รหัส', en: 'Codes' },
    icon: BookOpen,
  },
]

/** Workplace tools, one level down. */
export const ORG_NAV: (NavItem & { blurb: T })[] = [
  {
    to: '/sourcing',
    label: { th: 'สรรหาคน', en: 'Sourcing' },
    icon: SearchCheck,
    blurb: {
      th: 'โปรไฟล์ตำแหน่ง shortlist และคู่มือสัมภาษณ์',
      en: 'Role profiles, shortlists and interview guides',
    },
  },
  {
    to: '/team',
    label: { th: 'Team map', en: 'Team map' },
    icon: UsersRound,
    blurb: {
      th: 'จุดบอด พรรคพวก และความต่างของพลังในทีม',
      en: 'Blind spots, cliques and power imbalance',
    },
  },
  {
    to: '/lab',
    label: { th: 'Persona Lab', en: 'Persona Lab' },
    icon: FlaskConical,
    blurb: {
      th: 'หากลุ่มคนจากข้อมูลจริง',
      en: 'Find real groups in your data',
    },
  },
]

/** Portaled UI (sheets, dialogs) sits outside the shell's data-theme root and reads the theme here. */
const ThemeContext = createContext<Theme>('light')
export const useShellTheme = () => useContext(ThemeContext)

const NAV_FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600 focus-visible:ring-offset-1'

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <span className="grid size-7 place-items-center rounded-lg bg-violet-700 dark:bg-violet-600">
        <svg viewBox="0 0 64 64" className="size-4" aria-hidden>
          <path d="M12 20l9 26 11-18 11 18 9-26" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-base font-semibold tracking-tight">Workfit</span>
    </span>
  )
}

/** Light/dark pill: both icons visible, the active one sits on the sliding knob. */
function ThemeSwitch({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const t = useT()
  const dark = theme === 'dark'
  return (
    <Tooltip content={dark ? t('เปลี่ยนเป็นโหมดสว่าง', 'Switch to light mode') : t('เปลี่ยนเป็นโหมดมืด', 'Switch to dark mode')}>
      <button
        type="button"
        role="switch"
        aria-checked={dark}
        aria-label={t('โหมดมืด', 'Dark mode')}
        onClick={onToggle}
        className={cn(
          'grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white',
          NAV_FOCUS_RING,
        )}
      >
        {dark ? <Moon size={17} /> : <Sun size={17} />}
      </button>
    </Tooltip>
  )
}

/** TH | EN segmented switch. */
function LangSwitch() {
  const { lang, setLang } = useLangStore()
  return (
    <div role="radiogroup" aria-label="Language / ภาษา" className="flex h-8 shrink-0 items-center rounded-lg bg-slate-100 p-0.5 dark:bg-white/[0.06]">
      {(['th', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          role="radio"
          aria-checked={lang === l}
          onClick={() => setLang(l)}
          className={cn(
            'h-7 rounded-md px-2.5 text-xs font-semibold transition',
            NAV_FOCUS_RING,
            lang === l
              ? 'bg-white text-slate-900 shadow-sm dark:bg-white/15 dark:text-white'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
          )}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

function OrgMenu() {
  const t = useT()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()
  const active = ORG_NAV.some((n) => pathname.startsWith(n.to)) || pathname === '/org'
  useEffect(() => setOpen(false), [pathname])
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex select-none items-center gap-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
          NAV_FOCUS_RING,
          active ? 'bg-slate-100 text-slate-900 dark:bg-white/[0.08] dark:text-white' : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
        )}
      >
        {t('สำหรับองค์กร', 'For organisations')}
        <ChevronDown size={14} className={cn('transition', open && 'rotate-180')} />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 animate-pop rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-900/5 dark:border-white/10 dark:bg-[#18181d]">
          {ORG_NAV.map(({ to, label, icon: Icon, blurb }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-start gap-3 rounded-lg px-3 py-2.5',
                  NAV_FOCUS_RING,
                  isActive ? 'bg-violet-50 text-violet-900 dark:bg-violet-500/15 dark:text-violet-100' : 'hover:bg-slate-50 dark:hover:bg-white/[0.05]',
                )
              }
            >
              <Icon size={17} className="mt-0.5 shrink-0" />
              <span>
                <span className="block text-sm font-semibold">{t(label)}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">{t(blurb)}</span>
              </span>
            </NavLink>
          ))}
        </div>
      )}
    </div>
  )
}

/** Phone bar keeps the four most-used places; everything else lives behind "More". */
const BAR_PATHS = ['/', '/test', '/me', '/personas']
const BAR = NAV.filter((n) => BAR_PATHS.includes(n.to))
const MORE: NavItem[] = [
  ...NAV.filter((n) => !BAR_PATHS.includes(n.to)),
]

const BAR_ITEM = 'flex min-w-0 flex-1 select-none flex-col items-center gap-0.5 rounded-lg py-1.5 text-xs font-medium transition-colors'

function MoreRow({ to, label, icon: Icon, blurb }: NavItem & { blurb?: T }) {
  const t = useT()
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-xl px-3 py-3',
          NAV_FOCUS_RING,
          isActive ? 'bg-violet-50 text-violet-900 dark:bg-violet-500/15 dark:text-violet-100' : 'hover:bg-slate-50 dark:hover:bg-white/[0.05]',
        )
      }
    >
      <Icon size={18} className="shrink-0 text-slate-500 dark:text-slate-400" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{t(label)}</span>
        {blurb && <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{t(blurb)}</span>}
      </span>
      <ChevronRight size={16} className="shrink-0 text-slate-400" />
    </NavLink>
  )
}

function PhoneBar() {
  const t = useT()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  useEffect(() => setOpen(false), [pathname])
  const moreActive = [...MORE, ...ORG_NAV, { to: '/org' }].some((n) => pathname.startsWith(n.to))
  // Focused flows (answering questions) hide the tab bar, like a full-screen iOS flow; they show their own action bar.
  if (/^\/(test|rate\/|deep\/.+)/.test(pathname)) return null
  return (
    <>
      <nav
        aria-label={t('เมนูหลัก', 'Main menu')}
        className="fixed inset-x-0 bottom-0 z-40 flex justify-between border-t border-slate-200/80 bg-white/95 px-2 pt-1 backdrop-blur lg:hidden dark:border-white/[0.08] dark:bg-[#0c0c10]/95"
        style={{ paddingBottom: 'calc(0.25rem + env(safe-area-inset-bottom))' }}
      >
        {BAR.map(({ to, label, short, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => cn(BAR_ITEM, NAV_FOCUS_RING, isActive ? 'text-violet-700 dark:text-violet-300' : 'text-slate-500 dark:text-slate-400')}
          >
            <Icon size={20} strokeWidth={2} />
            <span className="max-w-full truncate px-0.5">{t(short ?? label)}</span>
          </NavLink>
        ))}
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className={cn(BAR_ITEM, NAV_FOCUS_RING, moreActive ? 'text-violet-700 dark:text-violet-300' : 'text-slate-500 dark:text-slate-400')}
        >
          <Ellipsis size={20} strokeWidth={2} />
          <span>{t('เพิ่มเติม', 'More')}</span>
        </button>
      </nav>
      <Sheet open={open} onClose={() => setOpen(false)} label={t('เมนูเพิ่มเติม', 'More menu')}>
        <div className="space-y-5">
          <div>
            <div className="px-3 text-xs font-medium text-slate-500 dark:text-slate-400">{t('ของฉัน', 'For you')}</div>
            <div className="mt-1">
              {MORE.map((n) => (
                <MoreRow key={n.to} {...n} />
              ))}
            </div>
          </div>
          <div>
            <div className="px-3 text-xs font-medium text-slate-500 dark:text-slate-400">{t('องค์กร', 'Organisations')}</div>
            <div className="mt-1">
              {ORG_NAV.map((n) => (
                <MoreRow key={n.to} {...n} />
              ))}
            </div>
          </div>
        </div>
      </Sheet>
    </>
  )
}

export function AppShell() {
  const t = useT()
  const { theme, toggle } = useTheme()
  const { pathname, hash } = useLocation()
  useHtmlLang()
  useEffect(() => {
    if (hash) {
      // Wait a frame so the target section has rendered.
      const id = window.setTimeout(() => document.querySelector(hash)?.scrollIntoView({ block: 'start' }), 60)
      return () => window.clearTimeout(id)
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])
  return (
    <ThemeContext.Provider value={theme}>
      <div data-theme={theme} className="relative min-h-dvh bg-[#fafafa] text-slate-900 dark:bg-[#0c0c10] dark:text-slate-100">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white backdrop-blur dark:border-white/[0.08] dark:bg-[#0c0c10]/90">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 sm:px-6 lg:grid lg:grid-cols-[1fr_auto_1fr]">
            <NavLink to="/" className={cn('justify-self-start rounded-lg', NAV_FOCUS_RING)} aria-label={t('Workfit หน้าแรก', 'Workfit home')}>
              <Logo />
            </NavLink>
            <nav className="hidden items-center gap-0.5 lg:flex" aria-label={t('เมนูหลัก', 'Main menu')}>
              {NAV.filter((n) => n.top).map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cn(
                      'select-none whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                      NAV_FOCUS_RING,
                      isActive
                        ? 'bg-slate-100 text-slate-900 dark:bg-white/[0.08] dark:text-white'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                    )
                  }
                >
                  {t(label)}
                </NavLink>
              ))}
              <OrgMenu />
            </nav>
            <div className="flex items-center gap-1.5 justify-self-end">
              <LangSwitch />
              <ThemeSwitch theme={theme} onToggle={toggle} />
            </div>
          </div>
        </header>

        <main className="relative mx-auto max-w-6xl px-4 pb-28 pt-8 sm:px-6 lg:pb-16 lg:pt-10">
          <Outlet />
        </main>

        <footer className="mx-auto hidden max-w-6xl border-t border-slate-200/80 px-6 py-6 text-xs text-slate-500 lg:block dark:border-white/[0.08] dark:text-slate-400">
          {t(
            'Workfit PoC · ผลลัพธ์ใช้เพื่อการพัฒนาและการพูดคุยเท่านั้น ไม่ใช้ตัดสินการจ้าง เลื่อนขั้น หรือประเมินผลงานโดยอัตโนมัติ',
            'Workfit PoC · Results are for development and conversation only, never automatic hiring, promotion or performance decisions.',
          )}
        </footer>

        {/* Phone/tablet bottom bar (UI.md §24): four places plus More. */}
        <PhoneBar />
      </div>
    </ThemeContext.Provider>
  )
}
