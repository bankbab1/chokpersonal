import { Check, Minus, Moon, Pencil, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { dimMeta } from '@/domain/dimensions'
import { horoscopeCheck, type SignCheck, type Verdict } from '@/domain/horoscope'
import type { Scores } from '@/domain/types'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { useFun } from '@/store/fun'
import { Button } from '../ui/Button'
import { Card, Chip } from '../ui/Card'

const VERDICT = {
  hit: { icon: Check, cls: 'text-emerald-600 dark:text-emerald-400', th: 'ตรง', en: 'Matches' },
  mixed: { icon: Minus, cls: 'text-slate-400', th: 'กลาง ๆ', en: 'In between' },
  miss: { icon: X, cls: 'text-rose-500 dark:text-rose-400', th: 'ไม่ตรง', en: 'Misses' },
} satisfies Record<Verdict, unknown>

const KIND = {
  weekday: { th: 'วันเกิด', en: 'Birth weekday' },
  rasi: { th: 'ราศี', en: 'Thai zodiac' },
  year: { th: 'ปีนักษัตร', en: 'Year animal' },
} as const

function BirthForm({ initial, onDone }: { initial?: string; onDone?: () => void }) {
  const t = useT()
  const setBirth = useFun((s) => s.setBirth)
  const [value, setValue] = useState(initial ?? '')
  const today = new Date().toISOString().slice(0, 10)
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (!value) return
        setBirth(value)
        onDone?.()
      }}
    >
      <label className="grid gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
        {t('วันเกิด', 'Date of birth')}
        <input
          type="date"
          required
          min="1930-01-01"
          max={today}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-600 dark:border-white/15 dark:bg-transparent dark:text-slate-100 dark:[color-scheme:dark]"
        />
      </label>
      <Button type="submit" variant="primary" disabled={!value}>
        {t('เทียบดู', 'Compare')}
      </Button>
      {onDone && (
        <Button variant="ghost" onClick={onDone}>
          {t('ยกเลิก', 'Cancel')}
        </Button>
      )}
    </form>
  )
}

function SignColumn({ check }: { check: SignCheck }) {
  const t = useT()
  return (
    <div className="rounded-xl border border-slate-200/80 p-4 dark:border-white/[0.08]">
      <div className="text-xs text-slate-500 dark:text-slate-400">{t(KIND[check.kind])}</div>
      <div className="mt-0.5 flex items-center gap-2 font-semibold">
        {check.sign.color && <span className="size-2.5 shrink-0 rounded-full" style={{ background: check.sign.color }} aria-hidden />}
        {t(check.sign.name)}
      </div>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">“{t(check.sign.said)}”</p>
      <ul className="mt-3 space-y-2">
        {check.rows.map((r) => {
          const meta = dimMeta(r.dim)
          const v = VERDICT[r.verdict]
          return (
            <li key={r.dim} className="flex items-start gap-2 text-sm">
              <v.icon size={16} className={cn('mt-0.5 shrink-0', v.cls)} aria-label={t(v.th, v.en)} />
              <span className="min-w-0 flex-1">
                <span className="block">{t(r.dir === 1 ? meta.high : meta.low)}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">
                  {t(meta.th, meta.en)} · {t('คุณ', 'You')} <b className="tabular">{r.score}</b>
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** "ดวงบอก vs. ตัวจริง": popular birth beliefs next to what was actually measured. Opt-in, fun only. */
export function HoroscopeCard({ scores }: { scores: Scores }) {
  const t = useT()
  const birth = useFun((s) => s.birth)
  const setBirth = useFun((s) => s.setBirth)
  const [editing, setEditing] = useState(false)
  const r = birth ? horoscopeCheck(birth, scores) : null

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
          <Moon size={16} />
        </span>
        <h2 className="text-base font-semibold">{t('ดวงบอก vs. ตัวจริง', 'Horoscope vs. the real you')}</h2>
      </div>
      <Chip>{t('เพื่อความสนุก ไม่ใช่การทำนาย', 'Just for fun, not a prediction')}</Chip>
    </div>
  )

  if (!r || editing)
    return (
      <Card>
        {header}
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
          {t(
            'คนเกิดวันอังคารพูดตรง ราศีสิงห์ชอบเป็นจุดสนใจ จริงไหม? ใส่วันเกิดแล้วดูว่าความเชื่อเรื่องวันเกิด ราศี และปีนักษัตร ตรงกับผลที่วัดได้จริงของคุณแค่ไหน',
            'Tuesday-born people are blunt, Leos love the spotlight: true? Add your birth date and see how well your weekday, zodiac and year animal match what was actually measured.',
          )}
        </p>
        <div className="mt-4">
          <BirthForm initial={birth} onDone={editing ? () => setEditing(false) : undefined} />
        </div>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {t(
            'ไม่บังคับ เก็บไว้บนเครื่องนี้เท่านั้น และไม่ถูกใช้ในคะแนน การจับคู่งาน หรือมุมมองขององค์กรใด ๆ',
            'Optional. Stored on this device only and never used in scores, job fit or any organisation view.',
          )}
        </p>
      </Card>
    )

  const verdictLine =
    r.matchPct >= 70
      ? t('ครั้งนี้ดวงเดาได้ใกล้ แต่ลองเทียบกับเพื่อนที่เกิดวันเดียวกัน แล้วจะเห็นว่าต่างกันแค่ไหน', 'Close this time. Compare with a friend born on the same day and see how different you are.')
      : r.matchPct >= 35
        ? t('ใกล้เคียงการโยนเหรียญ (≈50%) ซึ่งเป็นสิ่งที่งานวิจัยพบเช่นกัน', 'About as good as a coin toss (≈50%), which is what research finds too.')
        : t('ดวงพลาดเกือบหมด ตัวจริงของคุณต่างจากที่ความเชื่อบอกไว้มาก', 'Mostly wrong. The real you is quite different from what the beliefs say.')

  return (
    <Card>
      {header}
      <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-1">
        <div className="flex items-baseline gap-1">
          <span className="tabular text-4xl font-semibold">{r.matchPct}%</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">{t('ตรง', 'match')}</span>
        </div>
        <p className="pb-1 text-sm text-slate-600 dark:text-slate-300">
          {t(`ตรงชัด ${r.hits} จาก ${r.total} ข้อ · `, `${r.hits} of ${r.total} claims clearly match · `)}
          {verdictLine}
        </p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {r.checks.map((ch) => (
          <SignColumn key={ch.kind} check={ch} />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <p className="max-w-xl text-xs text-slate-500 dark:text-slate-400">
          {t(
            'งานวิจัยขนาดใหญ่ไม่พบความเชื่อมโยงระหว่างราศี วันเกิด หรือกรุ๊ปเลือด กับบุคลิกภาพ Workfit จึงไม่ใช้ข้อมูลนี้ในการให้คะแนนหรือคัดเลือกคน ตัวตนของคุณวัดจากคำตอบ ไม่ใช่วันเกิด',
            'Large studies find no link between zodiac, birth day or blood group and personality, so Workfit never uses this for scoring or selection. You are measured by your answers, not your birthday.',
          )}
        </p>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" icon={Pencil} onClick={() => setEditing(true)}>
            {t('แก้วันเกิด', 'Edit date')}
          </Button>
          <Button size="sm" variant="ghost" icon={Trash2} onClick={() => setBirth(undefined)}>
            {t('ลบ', 'Remove')}
          </Button>
        </div>
      </div>
    </Card>
  )
}
