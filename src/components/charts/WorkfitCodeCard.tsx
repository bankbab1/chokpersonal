import { BookOpen, Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { workfitCode } from '@/domain/code'
import type { Scores } from '@/domain/types'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { Button } from '../ui/Button'
import { Tooltip } from '../ui/Tooltip'

/** One colour per axis so the code reads at a glance and matches the legend below it. */
export const AXIS_COLOR = ['#8b5cf6', '#ec4899', '#f97316', '#0ea5e9', '#10b981', '#f59e0b', '#6366f1']

export function CodeLetters({ scores, size = 'lg' }: { scores: Scores; size?: 'sm' | 'lg' }) {
  const t = useT()
  const wc = workfitCode(scores)
  return (
    <span className="inline-flex items-baseline" aria-label={`Workfit Code ${wc.code}`}>
      {wc.letters.map((l, i) => (
        <span key={l.axis.id} className="inline-flex items-baseline">
          {i === 4 && (
            <span
              className={cn('font-bold leading-none text-slate-300 dark:text-slate-600', size === 'lg' ? 'mx-1 text-4xl sm:text-5xl' : 'mx-0.5 text-2xl')}
              aria-hidden
            >
              -
            </span>
          )}
          <Tooltip content={`${t(l.axis.name)}: ${t(l.pole.name)} ${l.strength}%${l.clear ? '' : t(' · ค่อนข้าง', ' · leaning')}`}>
            <span
              className={cn('font-bold leading-none tracking-wide', size === 'lg' ? 'text-4xl sm:text-5xl' : 'text-2xl', !l.clear && 'opacity-45')}
              style={{ color: AXIS_COLOR[i] }}
            >
              {l.shown}
            </span>
          </Tooltip>
        </span>
      ))}
    </span>
  )
}

export function WorkfitCodeCard({ scores }: { scores: Scores }) {
  const t = useT()
  const wc = workfitCode(scores)
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_30px_-12px_rgba(76,29,149,0.18)] sm:p-8 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-medium text-violet-700 dark:text-violet-300">Workfit Code</div>
          <div className="mt-2">
            <CodeLetters scores={scores} />
          </div>
          <h2 className="mt-3 text-xl font-semibold tracking-tight sm:text-3xl">{t(wc.title)}</h2>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {[wc.vibe, wc.crew].map((x) => (
              <span key={x.key} className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-800 dark:bg-violet-500/15 dark:text-violet-200">
                <span aria-hidden>{x.emoji}</span>
                {t(x.name)}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant="ghost" icon={BookOpen} to="/code">
            {t('ความหมายของโค้ด', 'What it means')}
          </Button>
          <Button
            size="sm"
            icon={copied ? Check : Copy}
            onClick={() => {
              void navigator.clipboard?.writeText(`${wc.code} · ${t(wc.title)} · ${t(wc.vibe.name)} ${t(wc.crew.name)}\n${t(wc.intro)}`)
              setCopied(true)
              window.setTimeout(() => setCopied(false), 1600)
            }}
          >
            {copied ? t('คัดลอกแล้ว', 'Copied') : t('คัดลอกโค้ด', 'Copy code')}
          </Button>
        </div>
      </div>

      <p className="relative mt-4 max-w-3xl leading-relaxed text-slate-700 dark:text-slate-200">{t(wc.intro)}</p>

      <div className="relative mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
        {wc.letters.map((l, i) => {
          const firstOfGroup = i === 0 || i === 4
          const right = l.value >= 50
          return (
            <div key={l.axis.id} className={cn(i === 4 && 'sm:col-start-1')}>
              {firstOfGroup && (
                <div className="mb-2 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                  {i === 0 ? t('แกนตัวตน · 4 ตัวแรก', 'Core · first 4') : t('บริบทคนไทย · 3 ตัวหลังขีด', 'Thai context · last 3')}
                </div>
              )}
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className={cn('flex items-center gap-1.5', !right && 'font-semibold')}>
                  <b className="font-display text-sm" style={{ color: AXIS_COLOR[i], opacity: right ? 0.45 : 1 }}>
                    {l.axis.left.letter}
                  </b>
                  {t(l.axis.left.name)}
                </span>
                <span className="tabular shrink-0 text-slate-500 dark:text-slate-400">
                  {t(l.axis.name)} · {l.clear ? `${l.strength}%` : t('ค่อนข้าง', 'leaning')}
                </span>
                <span className={cn('flex items-center gap-1.5 text-right', right && 'font-semibold')}>
                  {t(l.axis.right.name)}
                  <b className="font-display text-sm" style={{ color: AXIS_COLOR[i], opacity: right ? 1 : 0.45 }}>
                    {l.axis.right.letter}
                  </b>
                </span>
              </div>
              <div className="relative mt-1 h-2 rounded-full bg-slate-900/[0.06] dark:bg-white/10">
                <div className="absolute inset-y-0 left-[42%] right-[42%] rounded-full bg-slate-900/[0.06] dark:bg-white/10" />
                <div
                  className="absolute inset-y-0 rounded-full"
                  style={{
                    left: `${Math.min(l.value, 50)}%`,
                    width: `${Math.abs(l.value - 50)}%`,
                    background: AXIS_COLOR[i],
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <p className="relative mt-4 text-[11px] text-slate-500 dark:text-slate-400">
        {t(
          'รูปแบบ: แกนตัวตน 4 ตัว - บริบทคนไทย 3 ตัว · ตัวอักษรสีจาง = ค่อนข้าง (ใกล้กึ่งกลาง) · 3 ตัวหลังวัดการรักษาหน้า เกรงใจ และบุญคุณแบบไทย ซึ่งรหัสทั่วไปไม่มี',
          'Format: 4 Core letters - 3 Thai-context letters · Faded letter = leaning (near the middle) · The last 3 cover Thai face, deference and loyalty, which common codes lack',
        )}
      </p>
    </div>
  )
}
