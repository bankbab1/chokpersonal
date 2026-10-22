import { Fingerprint, Users } from 'lucide-react'
import { useMemo } from 'react'
import { workfitCode } from '@/domain/code'
import { SAMPLE_POPULATION } from '@/domain/demo'
import { dimMeta, dimName } from '@/domain/dimensions'
import { mostCommonType, sameType } from '@/domain/fingerprint'
import type { DimCode, Scores } from '@/domain/types'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { Card } from '../ui/Card'
import { Tooltip } from '../ui/Tooltip'

const PEOPLE_COLORS = ['#7c3aed', '#ec4899', '#f97316', '#0ea5e9', '#10b981', '#f59e0b', '#6366f1', '#ef4444', '#14b8a6', '#a855f7']

/** Dimensions where a set of people with the same type differ most. */
const widestDims = (people: Scores[], n = 6): DimCode[] =>
  (Object.keys(people[0]) as DimCode[])
    .map((dim) => {
      const xs = people.map((p) => p[dim])
      return { dim, range: Math.max(...xs) - Math.min(...xs) }
    })
    .sort((a, b) => b.range - a.range)
    .slice(0, n)
    .map((x) => x.dim)

/** Landing-page proof: ten people, one 4-letter type, very different profiles. */
export function SameTypeShowcase() {
  const t = useT()
  const { code, people, total } = useMemo(() => mostCommonType(SAMPLE_POPULATION, 10), [])
  const dims = useMemo(() => widestDims(people), [people])
  const codes = people.map((p) => workfitCode(p).code)
  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs font-medium text-violet-700 dark:text-violet-300">{t('ข้อมูลตัวอย่าง', 'Sample data')}</div>
          <h3 className="mt-1 text-xl font-semibold sm:text-3xl">
            {t(`10 คนได้ ${code} เหมือนกัน แต่…`, `10 people all got ${code}, but…`)}
          </h3>
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">{t(`จาก ${total} คนในประชากรตัวอย่างที่ได้รหัสนี้`, `from ${total} people in the sample with this type`)}</span>
      </div>
      <div className="mt-6 space-y-3">
        {dims.map((dim) => {
          const meta = dimMeta(dim)
          return (
            <div key={dim} className="grid grid-cols-[minmax(7rem,9rem)_1fr] items-center gap-3">
              <span className="truncate text-sm font-medium">{t(meta.th, meta.en)}</span>
              <div>
                <div className="relative h-6 rounded-full bg-slate-900/[0.05] dark:bg-white/[0.06]">
                  <div className="absolute inset-y-1 left-1/2 w-px bg-slate-900/15 dark:bg-white/20" />
                  {people.map((p, i) => (
                    <span
                      key={i}
                      className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm dark:border-slate-900"
                      style={{ left: `${p[dim]}%`, background: PEOPLE_COLORS[i] }}
                    />
                  ))}
                </div>
                <div className="mt-0.5 flex justify-between text-[10px] text-slate-400">
                  <span>{t(meta.low)}</span>
                  <span>{t(meta.high)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-6 rounded-2xl bg-slate-900/[0.04] p-4 dark:bg-white/[0.05]">
        <p className="text-sm">
          {t(
            `รหัส 4 ตัวอักษรเดียวกัน แต่ Workfit Code แตกออกเป็น ${new Set(codes.map((c) => c.toUpperCase())).size} แบบ:`,
            `Same 4-letter type, but ${new Set(codes.map((c) => c.toUpperCase())).size} different Workfit Codes:`,
          )}
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {codes.map((c, i) => (
            <span key={i} className="rounded-lg px-2 py-1 font-display text-sm font-bold" style={{ background: `${PEOPLE_COLORS[i]}1f`, color: PEOPLE_COLORS[i] }}>
              {c}
            </span>
          ))}
        </div>
      </div>
    </Card>
  )
}

/** Profile card: how you stand out among people who share your familiar type. */
export function SameTypeCard({ scores }: { scores: Scores }) {
  const t = useT()
  const r = useMemo(() => sameType(scores, SAMPLE_POPULATION), [scores])
  const dims = r.group.length >= 2 ? widestDims([scores, ...r.group]) : []
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
            <Fingerprint size={16} />
          </span>
          <h2 className="text-base font-semibold">{t('รหัสเดียวกัน แต่ไม่ใช่คนเดียวกัน', 'Same type, not the same person')}</h2>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">{t('เทียบกับประชากรตัวอย่าง 600 คน', 'vs. a 600-person sample')}</span>
      </div>

      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
        {r.group.length === 0
          ? t(`ไม่มีใครในประชากรตัวอย่างได้ ≈${r.code} เหมือนคุณเลย`, `No one in the sample shares your ≈${r.code}`)
          : t(
              `${r.group.length} คนได้ ≈${r.code} เหมือนคุณ แต่ Workfit Code ของพวกเขาแตกออกเป็น ${r.workfitCodes} แบบ และนี่คือสิ่งที่ทำให้คุณต่างจากพวกเขา`,
              `${r.group.length} people share your ≈${r.code}, yet they split into ${r.workfitCodes} different Workfit Codes. Here is what sets you apart from them.`,
            )}
      </p>

      {r.distinctive.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {r.distinctive.map((d) => (
            <li key={d.dim} className="flex items-center justify-between gap-3 rounded-xl bg-slate-900/[0.03] px-3 py-2 text-sm dark:bg-white/[0.04]">
              <span>
                <span className="font-semibold">{t(d.name)}</span> <span className="text-xs text-slate-500 dark:text-slate-400">· {t(d.text)}</span>
              </span>
              <span className="tabular shrink-0 text-xs">
                {t('คุณ', 'You')} <b>{d.you}</b> · {t('กลุ่ม', 'Group')} {d.groupMean}
              </span>
            </li>
          ))}
        </ul>
      )}

      {dims.length > 0 && (
        <div className="mt-5 space-y-2.5">
          {dims.map((dim) => (
            <div key={dim} className="grid grid-cols-[8rem_1fr] items-center gap-3">
              <span className="truncate text-xs font-medium">{t(dimName(dimMeta(dim)))}</span>
              <div className="relative h-5 rounded-full bg-slate-900/[0.05] dark:bg-white/[0.06]">
                {r.group.slice(0, 40).map((p, i) => (
                  <span key={i} className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-400/60" style={{ left: `${p[dim]}%` }} />
                ))}
                <Tooltip content={`${t('คุณ', 'You')}: ${scores[dim]}`}>
                  <span
                    className={cn('absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-violet-600 shadow dark:border-slate-900')}
                    style={{ left: `${scores[dim]}%` }}
                  />
                </Tooltip>
              </div>
            </div>
          ))}
          <p className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
            <Users size={12} /> {t('จุดเทา = คนที่ได้รหัสเดียวกับคุณ · จุดม่วง = คุณ', 'Grey = people with your type · Purple = you')}
          </p>
        </div>
      )}
    </Card>
  )
}
