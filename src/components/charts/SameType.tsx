import { Fingerprint } from 'lucide-react'
import { useMemo, useState } from 'react'
import { characterByKey, groupByKey } from '@/domain/characters'
import { workfitCode } from '@/domain/code'
import { SAMPLE_POPULATION } from '@/domain/demo'
import { dimMeta } from '@/domain/dimensions'
import { mostCommonType, sameType } from '@/domain/fingerprint'
import type { DimCode, Scores } from '@/domain/types'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { useInView } from '@/lib/useInView'
import { CodeCharacter } from '../character/RoleCharacter'
import { Card } from '../ui/Card'

const PEOPLE_COLORS = ['#7c3aed', '#ec4899', '#f97316', '#0ea5e9', '#10b981', '#f59e0b', '#6366f1', '#ef4444', '#14b8a6', '#a855f7']
const YOU = '#6d28d9'

/** Dimensions where a set of people differ most. */
const widestDims = (people: Scores[], n = 6): DimCode[] =>
  (Object.keys(people[0]) as DimCode[])
    .map((dim) => {
      const xs = people.map((p) => p[dim])
      return { dim, range: Math.max(...xs) - Math.min(...xs) }
    })
    .sort((a, b) => b.range - a.range)
    .slice(0, n)
    .map((x) => x.dim)

interface Person {
  id: string
  scores: Scores
  color: string
  label: string
  you?: boolean
}

/**
 * Bars with one dot per person. Dots start on the centre line and glide to their place when the chart
 * scrolls into view. Tapping a person (chip or dot) highlights their dots on every bar.
 */
function DotBars({ dims, people, active, onActive }: { dims: DimCode[]; people: Person[]; active: string | null; onActive: (id: string | null) => void }) {
  const t = useT()
  const [ref, seen] = useInView<HTMLDivElement>()
  return (
    <div ref={ref} className="space-y-3">
      {dims.map((dim) => {
        const meta = dimMeta(dim)
        return (
          <div key={dim} className="grid grid-cols-[minmax(6.5rem,9rem)_1fr] items-center gap-3">
            <span className="truncate text-sm font-medium">{t(meta.th, meta.en)}</span>
            <div>
              <div className="relative h-7 rounded-full bg-slate-100 dark:bg-white/[0.06]">
                <div className="absolute inset-y-1.5 left-1/2 w-px bg-slate-300 dark:bg-white/20" aria-hidden />
                {people.map((p, i) => {
                  const on = active === p.id
                  const dim_ = active !== null && !on
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onActive(on ? null : p.id)}
                      aria-label={`${p.label}: ${p.scores[dim]}`}
                      className={cn(
                        'absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm motion-reduce:transition-none dark:border-[#131318]',
                        p.you || on ? 'size-5' : 'size-3.5',
                        on || p.you ? 'z-10' : '',
                      )}
                      style={{
                        left: `${seen ? p.scores[dim] : 50}%`,
                        background: p.color,
                        opacity: dim_ ? 0.18 : 1,
                        transition: `left 1s cubic-bezier(.2,.8,.2,1) ${120 + i * 45}ms, opacity .2s, width .2s, height .2s`,
                      }}
                    />
                  )
                })}
              </div>
              <div className="mt-0.5 flex justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span>{t(meta.low)}</span>
                <span className="text-right">{t(meta.high)}</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PeopleChips({ people, active, onActive }: { people: Person[]; active: string | null; onActive: (id: string | null) => void }) {
  const t = useT()
  return (
    <div className="flex flex-wrap gap-2">
      {people.map((p) => {
        const on = active === p.id
        return (
          <button
            key={p.id}
            type="button"
            aria-pressed={on}
            onClick={() => onActive(on ? null : p.id)}
            className={cn('min-h-9 rounded-lg px-2.5 py-1 text-sm font-bold transition active:scale-95', active && !on && 'opacity-40', on && 'ring-2 ring-offset-1 dark:ring-offset-[#131318]')}
            style={{ background: `${p.color}1f`, color: p.color, ['--tw-ring-color' as string]: p.color }}
          >
            {p.you ? t('คุณ', 'You') + ' · ' : ''}
            {p.label}
          </button>
        )
      })}
      {active && (
        <button type="button" onClick={() => onActive(null)} className="min-h-9 rounded-lg px-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          {t('แสดงทุกคน', 'Show everyone')}
        </button>
      )}
    </div>
  )
}

/** Landing-page proof: ten people with the same character, still different in how they work. */
export function SameTypeShowcase() {
  const t = useT()
  const [active, setActive] = useState<string | null>(null)
  const { code, people: group, total } = useMemo(() => mostCommonType(SAMPLE_POPULATION, 10), [])
  const ch = characterByKey(code)!
  const people: Person[] = group.map((s, i) => ({ id: `p${i}`, scores: s, color: PEOPLE_COLORS[i], label: workfitCode(s).code }))
  const dims = useMemo(() => widestDims(group), [group])
  const codes = new Set(people.map((p) => p.label)).size
  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <CodeCharacter code={code} size={60} />
          <div>
            <div className="text-xs font-medium" style={{ color: groupByKey(ch.group).color }}>
              {t('ข้อมูลตัวอย่าง', 'Sample data')} · {code}
            </div>
            <h3 className="mt-1 text-xl font-semibold sm:text-2xl">{t(`10 คนเป็น${ch.name.th}เหมือนกัน แต่…`, `10 people are all ${ch.name.en.replace(/^The /, '')}s, but…`)}</h3>
          </div>
        </div>
        <span className="text-sm text-slate-500 dark:text-slate-400">{t(`จาก ${total} คนในประชากรตัวอย่างที่เป็น ${code}`, `from ${total} people in the sample who are ${code}`)}</span>
      </div>
      <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{t('แตะรหัสหรือจุดเพื่อดูทีละคน', 'Tap a code or a dot to follow one person')}</p>
      <div className="mt-3">
        <PeopleChips people={people} active={active} onActive={setActive} />
      </div>
      <div className="mt-5">
        <DotBars dims={dims} people={people} active={active} onActive={setActive} />
      </div>
      <p className="mt-5 rounded-xl bg-slate-50 p-3 text-sm dark:bg-white/[0.04]">
        {t(
          `ตัวอักษร 4 ตัวแรกเหมือนกันหมด (${code}) แต่ 3 ตัวหลังแตกออกเป็น ${codes} แบบ และยังต่างกันอีกหลายมิติ`,
          `The first 4 letters are the same for all (${code}), yet the last 3 split into ${codes} variants, and they still differ on many dimensions.`,
        )}
      </p>
    </Card>
  )
}

/** Result screen: you among people with your character, with the same tap-to-follow bars. */
export function SameTypeCard({ scores }: { scores: Scores }) {
  const t = useT()
  const [active, setActive] = useState<string | null>(null)
  const r = useMemo(() => sameType(scores, SAMPLE_POPULATION), [scores])
  const ch = characterByKey(r.code)
  const others = r.group.slice(0, 9)
  const people: Person[] = [
    { id: 'you', scores, color: YOU, label: workfitCode(scores).code, you: true },
    ...others.map((s, i) => ({ id: `p${i}`, scores: s, color: PEOPLE_COLORS[(i + 1) % PEOPLE_COLORS.length], label: workfitCode(s).code })),
  ]
  const dims = others.length >= 1 ? widestDims([scores, ...others]) : []
  if (!ch) return null
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
            <Fingerprint size={16} />
          </span>
          <h2 className="text-base font-semibold">{t('ตัวละครเดียวกัน แต่ไม่ใช่คนเดียวกัน', 'Same character, not the same person')}</h2>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">{t('ประชากรตัวอย่าง 600 คน', '600-person sample')}</span>
      </div>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
        {r.group.length === 0
          ? t(`ยังไม่มีใครในประชากรตัวอย่างเป็น ${r.code} เหมือนคุณ`, `No one in the sample is also ${r.code}`)
          : t(
              `${r.group.length} คนเป็น${ch.name.th} (${r.code}) เหมือนคุณ แตะรหัสหรือจุดเพื่อเทียบทีละคน`,
              `${r.group.length} people are also ${ch.name.en.replace(/^The /, '')} (${r.code}). Tap a code or dot to compare one by one.`,
            )}
      </p>
      {r.distinctive.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {r.distinctive.slice(0, 3).map((d) => (
            <li key={d.dim} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm dark:bg-white/[0.04]">
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
        <>
          <div className="mt-4">
            <PeopleChips people={people} active={active} onActive={setActive} />
          </div>
          <div className="mt-5">
            <DotBars dims={dims} people={people} active={active} onActive={setActive} />
          </div>
        </>
      )}
    </Card>
  )
}
