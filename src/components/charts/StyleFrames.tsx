import { ALL_WORK_STYLES, energy, fourLetter, identity, topStrengths, workStyle } from '@/domain/styles'
import type { Scores } from '@/domain/types'
import { cn } from '@/lib/cn'
import { useLang, useT } from '@/lib/i18n'

/** Introvert ↔ Extrovert as a spectrum with an ambivert zone, not a yes/no. */
export function EnergyMeter({ scores, compact }: { scores: Scores; compact?: boolean }) {
  const t = useT()
  const lang = useLang()
  const e = energy(scores)
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <div className={cn('font-semibold', compact ? 'text-sm' : 'text-lg')}>
          {t(e.th, e.en)}
          {lang === 'th' && <span className="text-sm font-normal text-slate-500 dark:text-slate-400"> · {e.en}</span>}
        </div>
        <span className="tabular text-xs text-slate-500 dark:text-slate-400">{e.score}/100</span>
      </div>
      <div className="relative mt-2 h-3 rounded-full bg-gradient-to-r from-sky-400/40 via-violet-400/40 to-orange-400/40">
        <div className="absolute inset-y-0 left-[39%] right-[39%] rounded-full bg-white dark:bg-white/10" />
        <div
          className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-slate-900 shadow dark:border-slate-900 dark:bg-white"
          style={{ left: `${e.score}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>{t('อินโทรเวิร์ต', 'Introvert')}</span>
        <span>{t('แอมบิเวิร์ต', 'Ambivert')}</span>
        <span>{t('เอ็กซ์โทรเวิร์ต', 'Extrovert')}</span>
      </div>
      {!compact && (
        <div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-300">
          <p>{t(e.recharge)}</p>
          <p>{t(e.atWork)}</p>
        </div>
      )}
    </div>
  )
}

/** Four work styles on a 2×2: assertive ↔ reserved (y) and task ↔ people (x). */
export function WorkStyleGrid({ scores, compact }: { scores: Scores; compact?: boolean }) {
  const t = useT()
  const w = workStyle(scores)
  const cell = (id: string) => ALL_WORK_STYLES.find((x) => x.id === id)
  const quad = [cell('driver'), cell('influencer'), cell('analyst'), cell('steady')]
  return (
    <div className={cn('flex gap-4', compact ? 'items-center' : 'flex-col')}>
      <div className={cn('relative shrink-0', compact ? 'size-24' : 'mx-auto size-36')}>
        <div className="grid size-full grid-cols-2 grid-rows-2 gap-1">
          {quad.map((q) => (
            <div
              key={q?.id}
              className="flex items-center justify-center rounded-lg p-1 text-center text-[10px] font-semibold leading-tight"
              style={{ background: `${q?.color}${q?.id === w.id ? '40' : '14'}`, color: q?.color }}
            >
              {!compact && q && t(q.th, q.en)}
            </div>
          ))}
        </div>
        <div
          className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-slate-900 shadow dark:border-slate-900 dark:bg-white"
          style={{ left: `${w.people}%`, top: `${100 - w.pace}%` }}
        />
      </div>
      <div className="min-w-0">
        <div className={cn('font-semibold', compact ? 'text-sm' : 'text-lg')} style={{ color: w.color }}>
          {t(w.th, w.en)}
        </div>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t(w.strengths)}</p>
        {!compact && (
          <p className="mt-2 text-sm">
            <span className="font-semibold">{t('คุยกับคนสไตล์นี้:', 'Talking to this style:')}</span> {t(w.talkTo)}
          </p>
        )}
        {!compact && (
          <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            {t('แกนตั้ง: กล้าบุก ↔ สงบ · แกนนอน: เน้นงาน ↔ เน้นคน', 'Vertical: assertive ↔ reserved · Horizontal: task ↔ people')}
          </p>
        )}
      </div>
    </div>
  )
}

/** The familiar 4-letter code, with a % on every letter and borderline letters marked. */
export function FourLetter({ scores }: { scores: Scores }) {
  const t = useT()
  const { code, axes: base } = fourLetter(scores)
  const id = identity(scores)
  const axes = [...base, id]
  return (
    <div>
      <div className="flex items-end gap-1">
        {axes.map((a, i) => (
          <span
            key={`${a.left.letter}${a.right.letter}-${i}`}
            className={cn('text-3xl font-semibold', a.borderline ? 'text-slate-400 dark:text-slate-500' : 'text-gradient')}
          >
            {i === 4 && <span className="text-slate-300 dark:text-slate-600">-</span>}
            {a.letter}
          </span>
        ))}
        <span className="sr-only">{`${code}-${id.letter}`}</span>
      </div>
      <div className="mt-3 space-y-2.5">
        {axes.map((a, i) => {
          const pct = a.value >= 50 ? a.value : 100 - a.value
          return (
            <div key={`${a.left.letter}${a.right.letter}-${i}`}>
              <div className="flex justify-between gap-1 text-[11px]">
                <span className={cn(a.value < 50 && 'font-semibold')}>
                  {a.left.letter} · {t(a.left.label)}
                </span>
                <span className="tabular shrink-0 text-slate-500 dark:text-slate-400">{a.borderline ? t('ก้ำกึ่ง', 'borderline') : `${pct}% ${a.letter}`}</span>
                <span className={cn('text-right', a.value >= 50 && 'font-semibold')}>
                  {t(a.right.label)} · {a.right.letter}
                </span>
              </div>
              <div className="relative mt-1 h-2 rounded-full bg-slate-900/[0.06] dark:bg-white/10">
                <div className="absolute inset-y-0 left-1/2 w-px bg-slate-900/20 dark:bg-white/25" />
                <div className="absolute inset-y-0 rounded-full bg-gradient-brand" style={{ left: `${Math.min(a.value, 50)}%`, width: `${Math.abs(a.value - 50)}%` }} />
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
        {t(
          'ประมาณจากคะแนน 18 มิติ เพื่อให้เทียบกับรหัสที่คนคุ้นเคย ตัวท้าย -A/-T บอกความนิ่งเมื่อกดดัน ตัวอักษรสีจาง = ก้ำกึ่ง อาจเป็นได้ทั้งสองแบบ',
          'Estimated from the 18 dimensions so you can compare with the familiar code. The -A/-T suffix shows steadiness under pressure. Faded letters are borderline and could go either way.',
        )}
      </p>
    </div>
  )
}

export function StrengthList({ scores, n = 5 }: { scores: Scores; n?: number }) {
  const t = useT()
  const list = topStrengths(scores, n)
  return (
    <ol className="space-y-2.5">
      {list.map((st, i) => (
        <li key={st.id} className="flex items-start gap-3">
          <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-gradient-brand text-xs font-bold text-white">{i + 1}</span>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between gap-2 text-sm">
              <span className="font-semibold">{t(st.name)}</span>
              <span className="tabular text-xs text-slate-500 dark:text-slate-400">{st.value}</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">{t(st.blurb)}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
