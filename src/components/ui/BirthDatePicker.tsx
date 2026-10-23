import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/cn'
import { useLangStore, useT } from '@/lib/i18n'

const MONTHS = {
  th: ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
}
const MONTHS_SHORT = {
  th: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
}
const WEEK_SHORT = { th: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'], en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] }
const WEEKDAYS = {
  th: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
}

type View = 'year' | 'month' | 'day'
const pad = (n: number) => String(n).padStart(2, '0')
const parse = (iso?: string) => {
  const m = iso && /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  return m ? { y: Number(m[1]), m: Number(m[2]) - 1, d: Number(m[3]) } : null
}

/**
 * Birth date picker in the style of travel booking sites: a field that opens a calendar panel.
 * Pick the year (12 at a time), then the month, then the day on a real calendar — no scrolling back
 * through decades. Thai shows Buddhist-era years. Calls `onChange` with YYYY-MM-DD.
 */
export function BirthDatePicker({ value, onChange, minAge = 15, oldest = 1940 }: { value?: string; onChange: (iso: string | undefined) => void; minAge?: number; oldest?: number }) {
  const t = useT()
  const lang = useLangStore((s) => s.lang)
  const picked = parse(value)
  const newest = new Date().getFullYear() - minAge
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<View>(picked ? 'day' : 'year')
  const [year, setYear] = useState(picked?.y ?? 1990)
  const [month, setMonth] = useState(picked?.m ?? 0)
  // First year of the 12-year page being shown.
  const [page, setPage] = useState(() => Math.max(oldest, Math.min(newest - 11, (picked?.y ?? 1990) - 5)))
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const yr = (n: number) => (lang === 'th' ? n + 543 : n)
  const label = picked
    ? lang === 'th'
      ? `${picked.d} ${MONTHS.th[picked.m]} ${picked.y + 543}`
      : `${picked.d} ${MONTHS.en[picked.m]} ${picked.y}`
    : ''
  const weekday = picked ? new Date(picked.y, picked.m, picked.d).getDay() : null

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const lead = new Date(year, month, 1).getDay()
  const stepMonth = (dir: 1 | -1) => {
    const m = month + dir
    const y = year + (m < 0 ? -1 : m > 11 ? 1 : 0)
    if (y < oldest || y > newest) return
    setYear(y)
    setMonth((m + 12) % 12)
  }

  const cell = 'grid place-items-center rounded-xl text-sm transition-colors active:scale-95'
  const idle = 'hover:bg-slate-100 dark:hover:bg-white/[0.08]'
  const on = 'bg-violet-700 font-semibold text-white hover:bg-violet-700 dark:bg-violet-600'

  return (
    <div ref={box} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => {
          setOpen((v) => !v)
          if (!open) setView(picked ? 'day' : 'year')
        }}
        className={cn(
          'flex h-12 w-full items-center gap-3 rounded-xl border bg-white px-3.5 text-left text-base transition sm:h-11 sm:text-sm dark:bg-white/[0.04]',
          open ? 'border-violet-500 ring-4 ring-violet-500/15' : 'border-slate-200 hover:border-slate-300 dark:border-white/15 dark:hover:border-white/25',
        )}
      >
        <CalendarDays size={18} className="shrink-0 text-violet-700 dark:text-violet-300" />
        <span className="min-w-0 flex-1">
          <span className="block text-xs text-slate-500 dark:text-slate-400">{t('วันเกิด', 'Date of birth')}</span>
          <span className={cn('block truncate font-medium', !picked && 'font-normal text-slate-400')}>{picked ? label : t('เลือกวัน เดือน ปี', 'Select a date')}</span>
        </span>
        {picked && (
          <span
            role="button"
            tabIndex={0}
            aria-label={t('ล้างวันเกิด', 'Clear date')}
            onClick={(e) => {
              e.stopPropagation()
              onChange(undefined)
            }}
            className="grid size-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
          >
            <X size={16} />
          </span>
        )}
      </button>

      {open && (
        <div role="dialog" aria-label={t('เลือกวันเกิด', 'Choose your date of birth')} className="absolute left-0 right-0 top-full z-40 mt-2 animate-pop rounded-2xl border border-slate-200 bg-white p-4 shadow-xl shadow-slate-900/10 sm:right-auto sm:w-[22rem] dark:border-white/10 dark:bg-[#18181d] dark:shadow-black/40">
          {/* Header: steps back up (day → month → year), arrows page within the view */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label={t('ก่อนหน้า', 'Previous')}
              onClick={() => (view === 'day' ? stepMonth(-1) : view === 'year' ? setPage((p) => Math.max(oldest, p - 12)) : setYear((y) => Math.max(oldest, y - 1)))}
              className="grid size-10 place-items-center rounded-full hover:bg-slate-100 dark:hover:bg-white/[0.08]"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-1 text-base font-semibold">
              {view === 'day' && (
                <button type="button" onClick={() => setView('month')} className="rounded-lg px-2 py-1 hover:bg-slate-100 dark:hover:bg-white/[0.08]">
                  {MONTHS[lang][month]}
                </button>
              )}
              {view !== 'year' && (
                <button type="button" onClick={() => setView('year')} className="rounded-lg px-2 py-1 text-violet-700 hover:bg-violet-50 dark:text-violet-300 dark:hover:bg-violet-500/15">
                  {yr(year)}
                </button>
              )}
              {view === 'year' && (
                <span>
                  {yr(page)} – {yr(Math.min(newest, page + 11))}
                </span>
              )}
            </div>
            <button
              type="button"
              aria-label={t('ถัดไป', 'Next')}
              onClick={() => (view === 'day' ? stepMonth(1) : view === 'year' ? setPage((p) => Math.min(newest - 11, p + 12)) : setYear((y) => Math.min(newest, y + 1)))}
              className="grid size-10 place-items-center rounded-full hover:bg-slate-100 dark:hover:bg-white/[0.08]"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {view === 'year' && (
            <>
              <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">{t('เลือกปีเกิด', 'Choose your birth year')}</p>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {Array.from({ length: 12 }, (_, i) => page + i)
                  .filter((y) => y <= newest)
                  .map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => {
                        setYear(y)
                        setView('month')
                      }}
                      className={cn(cell, 'h-14 flex-col leading-tight', y === picked?.y ? on : idle)}
                    >
                      <span className="text-base font-semibold">{yr(y)}</span>
                      {lang === 'th' && <span className={cn('text-xs', y === picked?.y ? 'text-white/80' : 'text-slate-400')}>{y}</span>}
                    </button>
                  ))}
              </div>
            </>
          )}

          {view === 'month' && (
            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {MONTHS_SHORT[lang].map((name, i) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    setMonth(i)
                    setView('day')
                  }}
                  className={cn(cell, 'h-12 font-medium', picked && picked.y === year && picked.m === i ? on : idle)}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {view === 'day' && (
            <>
              <div className="mt-3 grid grid-cols-7 text-center text-xs font-medium text-slate-400">
                {WEEK_SHORT[lang].map((w, i) => (
                  <span key={i} className={cn('py-1', i === 0 && 'text-red-400')}>
                    {w}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: lead }, (_, i) => (
                  <span key={`x${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => {
                  const sel = picked?.y === year && picked.m === month && picked.d === d
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        onChange(`${year}-${pad(month + 1)}-${pad(d)}`)
                        setOpen(false)
                      }}
                      className={cn(cell, 'aspect-square', sel ? on : idle)}
                    >
                      {d}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      <p className={cn('mt-2 min-h-5 text-sm', picked ? 'font-medium text-violet-700 dark:text-violet-300' : 'text-slate-400')} aria-live="polite">
        {picked && weekday !== null
          ? lang === 'th'
            ? `เกิดวัน${WEEKDAYS.th[weekday]}`
            : `Born on a ${WEEKDAYS.en[weekday]}`
          : t('แตะช่องด้านบนเพื่อเลือก ปี → เดือน → วัน', 'Tap the field: year → month → day')}
      </p>
    </div>
  )
}
