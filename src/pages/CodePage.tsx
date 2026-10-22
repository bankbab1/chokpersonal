import { ArrowLeft, Search } from 'lucide-react'
import { useState } from 'react'
import { AXIS_COLOR } from '@/components/charts/WorkfitCodeCard'
import { Button } from '@/components/ui/Button'
import { Card, Eyebrow } from '@/components/ui/Card'
import { CODE_AXES, CODE_COUNT, CODE_GROUPS, CREWS, decodeCode, LEAN, VIBES, workfitCode, type CodeAxisDef, type CodeLetter, type CodeTribe } from '@/domain/code'
import { dimMeta } from '@/domain/dimensions'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { useProfile } from '@/lib/useProfile'

/** The code as big letters with the hyphen, coloured per axis. `faded` marks leaning letters. */
function BigCode({ letters, faded = [] }: { letters: string[]; faded?: boolean[] }) {
  return (
    <span className="inline-flex items-baseline font-bold leading-none tracking-wide">
      {letters.map((ch, i) => (
        <span key={i} className="inline-flex items-baseline">
          {i === 4 && <span className="mx-1 text-slate-300 dark:text-slate-600">-</span>}
          <span style={{ color: AXIS_COLOR[i] }} className={cn(faded[i] && 'opacity-45')}>
            {ch}
          </span>
        </span>
      ))}
    </span>
  )
}

/** Diagram of the format: which slot is which axis. */
function Anatomy({ letters, faded }: { letters: string[]; faded?: boolean[] }) {
  const t = useT()
  return (
    <Card className="p-6 sm:p-8">
      <div className="text-center text-5xl sm:text-6xl">
        <BigCode letters={letters} faded={faded} />
      </div>
      <div className="mx-auto mt-6 grid max-w-3xl grid-cols-[4fr_auto_3fr] gap-2 text-center sm:gap-3">
        {CODE_GROUPS.map((g, gi) => (
          <div key={g.id} className={cn(gi === 1 && 'col-start-3')}>
            <div className="border-t-2 border-slate-200 pt-2 dark:border-white/15">
              <div className="text-sm font-semibold">{t(g.name)}</div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{t(g.blurb)}</p>
            </div>
          </div>
        ))}
      </div>
      <ol className="mx-auto mt-6 grid max-w-3xl grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {CODE_AXES.map((a, i) => (
          <li key={a.id}>
            <a
              href={`#axis-${a.id}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(`axis-${a.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="block rounded-lg border border-slate-200/80 px-2 py-2 text-center hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-violet-600 dark:border-white/[0.08] dark:hover:bg-white/[0.04]"
            >
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                {t('ตำแหน่ง', 'Slot')} {i + 1}
              </div>
              <div className="text-sm font-semibold" style={{ color: AXIS_COLOR[i] }}>
                {a.left.letter} / {a.right.letter}
              </div>
              <div className="truncate text-xs">{t(a.name)}</div>
            </a>
          </li>
        ))}
      </ol>
    </Card>
  )
}

const MBTI_BADGE = {
  same: { th: 'เหมือน MBTI', en: 'Same as MBTI', cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' },
  near: { th: 'ใกล้ MBTI', en: 'Near MBTI', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300' },
  new: { th: 'ใหม่จาก Workfit', en: 'New in Workfit', cls: 'bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300' },
} as const

/** สาย × แก๊ง: 4 vibes (slots 1+2) × 4 crews (slots 5+7) = 16 groups people can say out loud. */
function Tribes({ mine }: { mine?: { vibe: CodeTribe; crew: CodeTribe } }) {
  const t = useT()
  return (
    <Card className="p-6 sm:p-8">
      <Eyebrow>{t('สาย × แก๊ง', 'Vibe × Crew')}</Eyebrow>
      <h2 className="mt-1 text-xl font-semibold tracking-tight">{t('16 กลุ่มที่พูดง่าย จำง่าย', '16 groups that are easy to say and remember')}</h2>
      <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
        {t(
          'สาย มาจากตัวอักษร 2 ตัวแรก (เหมือน 2 ตัวแรกของ MBTI) บอกว่าคุณทำงานด้วยพลังแบบไหน แก๊ง มาจากตำแหน่ง 5 และ 7 บอกว่าคุณอยู่กับคนในทีมแบบไทยอย่างไร',
          'Your vibe comes from the first 2 letters (the same pair as MBTI) and says what kind of energy you bring. Your crew comes from slots 5 and 7 and says how you show up with people in a Thai team.',
        )}
      </p>

      {mine && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            { k: t('สายของคุณ', 'Your vibe'), x: mine.vibe },
            { k: t('แก๊งของคุณ', 'Your crew'), x: mine.crew },
          ].map(({ k, x }) => (
            <div key={x.key} className="flex items-start gap-3 rounded-xl bg-violet-50 p-4 dark:bg-violet-500/10">
              <span className="text-3xl leading-none" aria-hidden>
                {x.emoji}
              </span>
              <div>
                <div className="text-xs text-violet-700 dark:text-violet-300">
                  {k} · {x.key.split('').join(' + ')}
                </div>
                <div className="text-lg font-semibold">{t(x.name)}</div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{t(x.tagline)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[34rem] border-separate border-spacing-1 text-sm">
          <thead>
            <tr>
              <th className="w-28" />
              {CREWS.map((c) => (
                <th key={c.key} className="px-2 pb-1 text-left align-bottom text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span aria-hidden>{c.emoji}</span> {t(c.name)}
                  <span className="block font-semibold tracking-widest text-slate-400 dark:text-slate-500">
                    {c.key[0]}·{c.key[1]}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {VIBES.map((v) => (
              <tr key={v.key}>
                <th className="pr-2 text-left align-middle text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span aria-hidden>{v.emoji}</span> {t(v.name)}
                  <span className="block font-semibold tracking-widest text-slate-400 dark:text-slate-500">{v.key}</span>
                </th>
                {CREWS.map((c) => {
                  const on = mine?.vibe.key === v.key && mine.crew.key === c.key
                  return (
                    <td
                      key={c.key}
                      className={cn(
                        'rounded-lg px-2 py-2 font-mono text-xs tracking-wider',
                        on ? 'bg-violet-700 font-semibold text-white dark:bg-violet-600' : 'bg-slate-50 text-slate-500 dark:bg-white/[0.04] dark:text-slate-400',
                      )}
                    >
                      {v.key}··-{c.key[0]}·{c.key[1]}
                      {on && <span className="ml-1 font-sans">← {t('คุณ', 'you')}</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t('· = ตัวอักษรไหนก็ได้ในตำแหน่งนั้น', '· = any letter in that slot')}</p>
    </Card>
  )
}

function AxisSection({ axis, index, mine }: { axis: CodeAxisDef; index: number; mine?: CodeLetter }) {
  const t = useT()
  const color = AXIS_COLOR[index]
  return (
    <Card id={`axis-${axis.id}`} className="scroll-mt-24">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {t('ตำแหน่ง', 'Slot')} {index + 1} · {t(CODE_GROUPS.find((g) => g.id === axis.group)!.name)}
          </div>
          <h2 className="mt-0.5 flex flex-wrap items-center gap-2 text-lg font-semibold">
            {t(axis.name)}
            <span className={cn('rounded-md px-1.5 py-0.5 text-[11px] font-medium', MBTI_BADGE[axis.mbti.kind].cls)}>{t(MBTI_BADGE[axis.mbti.kind])}</span>
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t(axis.question)}</p>
        </div>
        {mine && (
          <div className="rounded-lg bg-slate-50 px-3 py-1.5 text-right text-xs dark:bg-white/[0.05]">
            <div className="text-slate-500 dark:text-slate-400">{t('ของคุณ', 'Yours')}</div>
            <div className="font-semibold">
              <span style={{ color }}>{mine.shown}</span> · {t(mine.pole.name)} {mine.strength}%{!mine.clear && t(' (ค่อนข้าง)', ' (leaning)')}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {[axis.left, axis.right].map((pole) => {
          const on = mine?.pole.letter === pole.letter
          return (
            <div
              key={pole.letter}
              className={cn('rounded-xl border p-4', on ? 'border-transparent' : 'border-slate-200/80 dark:border-white/[0.08]')}
              style={
                on
                  ? {
                      background: `${color}14`,
                      boxShadow: `inset 0 0 0 1.5px ${color}`,
                    }
                  : undefined
              }
            >
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold leading-none" style={{ color }}>
                  {pole.letter}
                </span>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {t('มาจากคำว่า', 'From the word')} <b className="text-slate-700 dark:text-slate-200">{pole.name.en}</b>
                  </div>
                  <div className="font-semibold">{t(pole.name)}</div>
                </div>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t(pole.sentence)}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-4 grid gap-4 border-t border-slate-200/80 pt-4 text-sm sm:grid-cols-[1fr_1.4fr] dark:border-white/[0.08]">
        <div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('คำนวณจาก', 'Calculated from')}</div>
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {axis.sources.map((s) => {
              const m = dimMeta(s.dim)
              return (
                <li key={s.dim} className="rounded-md bg-slate-100 px-2 py-1 text-xs dark:bg-white/[0.06]">
                  {t(m.th, m.en)}
                  {s.invert && <span className="text-slate-500 dark:text-slate-400"> {t('(กลับด้าน)', '(reversed)')}</span>}
                </li>
              )
            })}
          </ul>
          {axis.sources.length > 1 && (
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{t('ค่าเฉลี่ยของมิติข้างบน', 'Average of the dimensions above')}</p>
          )}
        </div>
        <div>
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('ที่มาของแกนนี้', 'Where this axis comes from')}</div>
          <p className="mt-1.5 text-slate-600 dark:text-slate-300">{t(axis.origin)}</p>
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">MBTI: {t(axis.mbti.note)}</p>
        </div>
      </div>
    </Card>
  )
}

function Decoder() {
  const t = useT()
  const [value, setValue] = useState('')
  const decoded = decodeCode(value)
  const typed = value.replace(/[^a-z]/gi, '').length
  return (
    <Card>
      <h2 className="text-base font-semibold">{t('ถอดรหัสของคนอื่น', "Decode someone else's code")}</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {t('พิมพ์โค้ดของเพื่อนร่วมงาน เช่น ISBC-HMO แล้วดูความหมายทีละตัว', 'Type a colleague’s code, e.g. ISBC-HMO, and read it letter by letter.')}
      </p>
      <label className="relative mt-3 block max-w-xs">
        <span className="sr-only">Workfit Code</span>
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value.toUpperCase().slice(0, 9))}
          placeholder="ENLQ-DRW"
          autoCapitalize="characters"
          spellCheck={false}
          className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 font-semibold tracking-widest text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-600 dark:border-white/15 dark:bg-transparent dark:text-slate-100"
        />
      </label>
      {decoded ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {decoded.map(({ axis, pole }, i) => (
            <li key={axis.id} className="flex items-start gap-3 rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-white/[0.04]">
              <b className="w-5 shrink-0 text-lg leading-6" style={{ color: AXIS_COLOR[i] }}>
                {pole.letter}
              </b>
              <span>
                <span className="font-medium">
                  {t(axis.name)}: {t(pole.name)}
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">{t(pole.sentence)}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        typed > 0 && (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
            {typed < 7
              ? t(`อีก ${7 - typed} ตัว`, `${7 - typed} more letter${7 - typed > 1 ? 's' : ''}`)
              : t(
                  'ตัวอักษรไม่ตรงตำแหน่ง ตรวจลำดับ: E/I · N/S · L/B · Q/C - D/H · R/M · W/O',
                  'Letters don’t fit their slots. Order: E/I · N/S · L/B · Q/C - D/H · R/M · W/O',
                )}
          </p>
        )
      )}
    </Card>
  )
}

export function CodePage() {
  const t = useT()
  const profile = useProfile()
  const wc = profile ? workfitCode(profile.scores) : null
  const sample = 'ENLCHRW'.split('')
  return (
    <div className="space-y-6">
      <div>
        {wc && (
          <Button variant="ghost" size="sm" icon={ArrowLeft} to="/me" className="-ml-2 mb-2">
            {t('กลับไปที่ผลของฉัน', 'Back to my profile')}
          </Button>
        )}
        <Eyebrow>Workfit Code</Eyebrow>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t('อ่านโค้ดของคุณ', 'How to read your code')}</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
          {t(
            `โค้ดมาตรฐาน 7 ตัวอักษร เรียงลำดับเดิมเสมอ: แกนตัวตน 4 ตัว ขีด แล้วตามด้วยบริบทคนไทย 3 ตัว แต่ละตำแหน่งมีได้ 2 ตัวอักษร และไม่มีตัวอักษรซ้ำกันเลย จึงมีทั้งหมด ${CODE_COUNT} แบบ`,
            `A standard 7-letter code, always in the same order: 4 Core letters, a hyphen, then 3 Thai-context letters. Each slot has two possible letters and no letter is used twice, giving ${CODE_COUNT} codes in all.`,
          )}
        </p>
      </div>

      <Anatomy letters={wc ? wc.letters.map((l) => l.shown) : sample} faded={wc?.letters.map((l) => !l.clear)} />

      <Tribes mine={wc ? { vibe: wc.vibe, crew: wc.crew } : undefined} />

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          {
            h: t('ตัวอักษรแบบลูกผสม', 'Hybrid letters'),
            p: t(
              'ใช้ตัวอักษรของ MBTI เฉพาะที่ความหมายเหมือนกันจริง (E/I, N/S) ตัวอื่นเป็นตัวใหม่ทั้งหมด จึงไม่มีใครอ่านโค้ด Workfit ผิดเป็น MBTI H และ M คือลายเซ็นของคนไทย: รักษาน้ำใจ และ ไม่เป็นไร',
              'MBTI letters only where the meaning really is the same (E/I, N/S); every other letter is new, so nobody misreads a Workfit Code as MBTI. H and M are the Thai signatures: harmony and mai pen rai.',
            ),
          },
          {
            h: t('ตัวอักษรสีจาง', 'Faded letter'),
            p: t(
              `คะแนนอยู่ห่างจากกึ่งกลางไม่ถึง ${LEAN} คะแนน คุณยืนได้ทั้งสองข้าง โค้ดยังเขียนตัวพิมพ์ใหญ่เหมือนเดิม`,
              `The score is within ${LEAN} points of the middle, so you sit near both sides. The code is still written in capitals.`,
            ),
          },
          {
            h: t('ชื่อเรียกมาจากไหน', 'Where the name comes from'),
            p: t(
              'ตำแหน่ง 1+3 (พลังงาน บทบาท) เป็นคำนาม ตำแหน่ง 2+4 (ความคิด จังหวะ) เป็นคำคุณศัพท์ ตำแหน่ง 5 (การสื่อสาร) ใช้ในคำแนะนำตัว',
              'Slots 1+3 (energy, drive) give the noun, slots 2+4 (ideas, pace) the adjective, and slot 5 (voice) colours the intro.',
            ),
          },
          {
            h: t('ไม่มีข้างไหนดีกว่า', 'No side is better'),
            p: t(
              'ทุกตัวอักษรคือสไตล์ ไม่ใช่คะแนน งานและทีมต่างกันต้องการสไตล์ต่างกัน',
              'Every letter is a style, not a grade. Different jobs and teams need different styles.',
            ),
          },
        ].map((x) => (
          <Card key={x.h} className="p-4">
            <div className="text-sm font-semibold">{x.h}</div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{x.p}</p>
          </Card>
        ))}
      </div>

      {CODE_GROUPS.map((g) => (
        <section key={g.id} className="space-y-3">
          <div className="pt-2">
            <h2 className="text-xl font-semibold tracking-tight">{t(g.name)}</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">{t(g.blurb)}</p>
          </div>
          {CODE_AXES.map((a, i) => (a.group === g.id ? <AxisSection key={a.id} axis={a} index={i} mine={wc?.letters[i]} /> : null))}
        </section>
      ))}

      <Decoder />

      {!wc && (
        <div className="flex justify-center">
          <Button variant="primary" to="/test">
            {t('ทำแบบทดสอบเพื่อรับโค้ดของคุณ', 'Take the test to get your code')}
          </Button>
        </div>
      )}
    </div>
  )
}
