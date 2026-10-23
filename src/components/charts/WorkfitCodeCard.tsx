import { ArrowLeft, ArrowRight, BookOpen, Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { CODE_GROUPS, LEAN, workfitCode, type CodeLetter, type CodeTribe } from '@/domain/code'
import { dimMeta } from '@/domain/dimensions'
import type { Scores } from '@/domain/types'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { Button } from '../ui/Button'
import { Sheet } from '../ui/Sheet'
import { Tooltip } from '../ui/Tooltip'

/** One colour per axis so the code reads at a glance and matches the legend below it. */
export const AXIS_COLOR = ['#8b5cf6', '#ec4899', '#f97316', '#0ea5e9', '#10b981', '#f59e0b', '#6366f1']

/** The code as big coloured letters. Every letter is a button: tap it to see what it means. */
export function CodeLetters({ scores, size = 'lg' }: { scores: Scores; size?: 'sm' | 'lg' }) {
  const t = useT()
  const wc = workfitCode(scores)
  const [open, setOpen] = useState<number | null>(null)
  return (
    <>
      <span className="inline-flex items-baseline" role="group" aria-label={`Workfit Code ${wc.code}`}>
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
            <Tooltip content={`${t(l.axis.name)}: ${t(l.pole.name)} · ${t('แตะเพื่อดูความหมาย', 'tap for the meaning')}`}>
              <button
                type="button"
                onClick={() => setOpen(i)}
                aria-label={`${l.shown}: ${t(l.axis.name)} · ${t(l.pole.name)}`}
                className={cn(
                  'rounded-md font-bold leading-none tracking-wide underline decoration-dotted decoration-2 underline-offset-[6px] transition active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600',
                  size === 'lg' ? 'px-0.5 py-1 text-4xl sm:text-5xl' : 'px-1 py-2 text-2xl',
                  !l.clear && 'opacity-45',
                )}
                style={{ color: AXIS_COLOR[i], textDecorationColor: `${AXIS_COLOR[i]}55` }}
              >
                {l.shown}
              </button>
            </Tooltip>
          </span>
        ))}
      </span>
      <LetterSheet letters={wc.letters} index={open} onIndex={setOpen} />
    </>
  )
}

/** One letter explained, with previous / next to walk through the whole code. */
function LetterSheet({ letters, index, onIndex }: { letters: CodeLetter[]; index: number | null; onIndex: (i: number | null) => void }) {
  const t = useT()
  const l = index === null ? null : letters[index]
  const color = index === null ? '' : AXIS_COLOR[index]
  return (
    <Sheet open={l !== null} onClose={() => onIndex(null)} label={l ? `${l.shown} · ${t(l.axis.name)}` : ''}>
      {l && index !== null && (
        <div>
          <div className="flex items-center gap-4 pr-10">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl text-4xl font-bold" style={{ color, background: `${color}14` }}>
              {l.shown}
            </span>
            <div className="min-w-0">
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {t('ตัวที่', 'Letter')} {index + 1}/7 · {t(CODE_GROUPS.find((g) => g.id === l.axis.group)!.name)}
              </div>
              <h2 className="text-xl font-semibold">{t(l.axis.name)}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">{t(l.axis.question)}</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl p-4" style={{ background: `${color}10` }}>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('ของคุณ', 'Yours')}</div>
            <div className="mt-0.5 text-lg font-semibold">
              {l.shown} · {t(l.pole.name)}{' '}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
                {l.strength}%{!l.clear && t(' · ค่อนข้าง', ' · leaning')}
              </span>
            </div>
            <p className="mt-1">{t(l.pole.sentence)}</p>
            <div className="mt-3 flex items-center gap-2 text-xs font-semibold">
              <span style={{ color }}>{l.axis.left.letter}</span>
              <div className="relative h-2 flex-1 rounded-full bg-white dark:bg-white/10">
                <span className="absolute inset-y-0 left-1/2 w-px bg-slate-300 dark:bg-white/20" aria-hidden />
                <span className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow dark:border-[#18181d]" style={{ left: `${l.value}%`, background: color }} />
              </div>
              <span style={{ color }}>{l.axis.right.letter}</span>
            </div>
            {!l.clear && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {t(`อยู่ใกล้กึ่งกลาง (ห่างไม่ถึง ${LEAN} คะแนน) คุณใช้ได้ทั้งสองแบบ ตัวอักษรจึงแสดงสีจาง`, `Near the middle (within ${LEAN} points): you can work both ways, so the letter shows faded.`)}
              </p>
            )}
          </div>

          <div className="mt-4 rounded-xl border border-slate-200/80 p-4 dark:border-white/[0.08]">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('อีกฝั่งหนึ่ง', 'The other side')}</div>
            <div className="mt-0.5 font-semibold">
              {l.other.letter} · {t(l.other.name)}
            </div>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{t(l.other.sentence)}</p>
          </div>

          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            {t('คำนวณจาก', 'Calculated from')}: {l.axis.sources.map((x) => `${t(dimMeta(x.dim).th, dimMeta(x.dim).en)}${x.invert ? t(' (กลับด้าน)', ' (reversed)') : ''}`).join(' · ')}
            {' · '}
            {t('ไม่มีข้างไหนดีกว่า', 'Neither side is better')}
          </p>

          <div className="mt-6 flex items-center justify-between gap-2">
            <Button variant="ghost" icon={ArrowLeft} disabled={index === 0} onClick={() => onIndex(index - 1)}>
              {letters[index - 1]?.shown ?? ''}
            </Button>
            <Button variant="secondary" size="sm" icon={BookOpen} to={`/code#axis-${l.axis.id}`}>
              {t('อ่านทั้งหมด', 'Full guide')}
            </Button>
            <Button variant="ghost" iconRight={ArrowRight} disabled={index === letters.length - 1} onClick={() => onIndex(index + 1)}>
              {letters[index + 1]?.shown ?? ''}
            </Button>
          </div>
        </div>
      )}
    </Sheet>
  )
}

/** A สาย / แก๊ง chip that explains itself when tapped. */
export function TribeChip({ tribe, kind }: { tribe: CodeTribe; kind: 'vibe' | 'crew' }) {
  const t = useT()
  const [open, setOpen] = useState(false)
  const slots = kind === 'vibe' ? t('ตัวที่ 1 + 2 (พลังงาน + ความคิด)', 'letters 1 + 2 (energy + ideas)') : t('ตัวที่ 5 + 7 (การสื่อสาร + ความผูกพัน)', 'letters 5 + 7 (voice + bond)')
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-8 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 transition active:scale-95 dark:bg-white/[0.06] dark:text-slate-200"
      >
        <span aria-hidden>{tribe.emoji}</span>
        {t(tribe.name)}
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} label={t(tribe.name)}>
        <div className="pr-10">
          <div className="text-xs text-slate-500 dark:text-slate-400">{kind === 'vibe' ? t('สาย', 'Vibe') : t('แก๊ง', 'Crew')} · {slots}</div>
          <h2 className="mt-1 flex items-center gap-2 text-xl font-semibold">
            <span aria-hidden>{tribe.emoji}</span> {t(tribe.name)} <span className="text-sm font-normal text-slate-400">{tribe.key}</span>
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-300">{t(tribe.tagline)}</p>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            {kind === 'vibe'
              ? t('สาย บอกว่าคุณทำงานด้วยพลังแบบไหน มี 4 สาย', 'Your vibe says what kind of energy you bring. There are 4 vibes.')
              : t('แก๊ง บอกว่าคุณอยู่กับคนในทีมแบบไทยอย่างไร มี 4 แก๊ง', 'Your crew says how you show up with people in a Thai team. There are 4 crews.')}
          </p>
          <Button className="mt-5" variant="secondary" size="sm" icon={BookOpen} to="/code">
            {t('ดูทั้ง 16 กลุ่ม', 'See all 16 groups')}
          </Button>
        </div>
      </Sheet>
    </>
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
            <TribeChip tribe={wc.vibe} kind="vibe" />
            <TribeChip tribe={wc.crew} kind="crew" />
          </div>
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant="ghost" icon={BookOpen} to="/code">
            {t('ความหมายของโค้ด', 'What it means')}
          </Button>
          <Button size="sm" variant="ghost" to="/codes">
            {t('สมุดรหัส 128 แบบ', 'All 128 codes')}
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
                <div className="mb-2 text-xs font-medium text-slate-400 dark:text-slate-500">
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
      <p className="relative mt-4 text-xs text-slate-500 dark:text-slate-400">
        {t(
          'รูปแบบ: แกนตัวตน 4 ตัว - บริบทคนไทย 3 ตัว · ตัวอักษรสีจาง = ค่อนข้าง (ใกล้กึ่งกลาง) · 3 ตัวหลังวัดการรักษาหน้า เกรงใจ และบุญคุณแบบไทย ซึ่งรหัสทั่วไปไม่มี',
          'Format: 4 Core letters - 3 Thai-context letters · Faded letter = leaning (near the middle) · The last 3 cover Thai face, deference and loyalty, which common codes lack',
        )}
      </p>
    </div>
  )
}
