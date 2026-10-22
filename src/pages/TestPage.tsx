import { ArrowLeft, ArrowRight, Check, Globe2, Lock, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { StickyBar } from '@/components/ui/StickyBar'
import { Card, Chip, Eyebrow } from '@/components/ui/Card'
import {
  CONTEXTS, FORCED_BLOCKS, LIKERT_SCALE, LIKERT_SEQUENCE, SCENARIOS, type ForcedBlock, type LikertEntry, type Scenario,
} from '@/domain/items'
import type { PickAnswer } from '@/domain/types'
import { cn } from '@/lib/cn'
import { tt, useT, type T } from '@/lib/i18n'
import { useProgress } from '@/lib/useProfile'
import { useAssessment } from '@/store/assessment'

type Page =
  | { kind: 'likert'; entries: LikertEntry[]; index: number }
  | { kind: 'forced'; block: ForcedBlock; index: number }
  | { kind: 'scenario'; scenario: Scenario; index: number }

const LIKERT_PER_PAGE = 5

const PAGES: Page[] = [
  ...Array.from({ length: Math.ceil(LIKERT_SEQUENCE.length / LIKERT_PER_PAGE) }, (_, i) => ({
    kind: 'likert' as const,
    entries: LIKERT_SEQUENCE.slice(i * LIKERT_PER_PAGE, (i + 1) * LIKERT_PER_PAGE),
    index: i,
  })),
  ...FORCED_BLOCKS.map((block, index) => ({ kind: 'forced' as const, block, index })),
  ...SCENARIOS.map((scenario, index) => ({ kind: 'scenario' as const, scenario, index })),
]

const SECTION: Record<Page['kind'], { n: number; name: T; hint: T }> = {
  likert: { n: 1, name: tt('บุคลิกพื้นฐาน', 'Core personality'), hint: tt('ตอบตามที่เป็นจริงในที่ทำงาน ไม่ใช่ตามที่อยากเป็น', 'Answer as you really are at work, not as you would like to be') },
  forced: { n: 2, name: tt('เลือกระหว่าง 3 ข้อ', 'Choose between 3'), hint: tt('เลือกข้อที่ “เหมือนคุณที่สุด” 1 ข้อ และ “เหมือนคุณน้อยที่สุด” 1 ข้อ', 'Pick the one “most like you” and the one “least like you”') },
  scenario: { n: 3, name: tt('สถานการณ์จริง', 'Real situations'), hint: tt('คุณน่าจะทำแบบไหนมากที่สุด และแบบไหนน้อยที่สุด', 'What would you most likely do, and least likely do?') },
}

export function TestPage() {
  const consent = useAssessment((s) => s.consent)
  const setInvitedRole = useAssessment((s) => s.setInvitedRole)
  const [params] = useSearchParams()
  const invite = params.get('invite')
  // A candidate who opens a recruiter's invite link is added to that role's shortlist when done.
  useEffect(() => {
    if (invite) setInvitedRole(invite)
  }, [invite, setInvitedRole])
  return consent.self ? <Wizard /> : <ConsentStep />
}

/* ---------------------------------------------------------------------------------------------- */

function Toggle({ checked, onChange, label, detail }: { checked: boolean; onChange: (v: boolean) => void; label: string; detail: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-2xl p-3 transition hover:bg-slate-900/[0.03] dark:hover:bg-white/[0.04]">
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-6 w-11 rounded-full bg-slate-300 transition peer-checked:bg-violet-600 peer-focus-visible:ring-2 peer-focus-visible:ring-violet-600 peer-focus-visible:ring-offset-2 dark:bg-white/15" />
        <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
      <span>
        <span className="block font-medium">{label}</span>
        <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">{detail}</span>
      </span>
    </label>
  )
}

function ConsentStep() {
  const t = useT()
  const { name, setName, consent, setConsent, background, setBackground } = useAssessment()
  const [draft, setDraft] = useState({ self: true, team: consent.team, hr: consent.hr })
  return (
    <div className="mx-auto max-w-2xl animate-rise">
      <Eyebrow>{t('ก่อนเริ่ม · PDPA', 'Before you start · Privacy')}</Eyebrow>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t('ผลเป็นของคุณ', 'Your results are yours')}</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        {t(
          'แบบทดสอบใช้เวลาประมาณ 20 นาที บันทึกอัตโนมัติ ปิดแล้วกลับมาทำต่อได้ ผลใช้เพื่อการพัฒนาและการพูดคุยเท่านั้น ไม่ใช้ตัดสินการจ้าง เลื่อนขั้น หรือประเมินผลงาน',
          'The test takes about 20 minutes and saves as you go, so you can stop and come back. Results are for development and conversation only, never for hiring, promotion or performance decisions.',
        )}
      </p>
      <Card className="mt-8 space-y-4">
        <label className="block px-3 pt-1">
          <span className="text-sm font-medium">{t('ชื่อเล่นที่จะแสดงในผล', 'Name to show on your results')}</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('เช่น มายด์', 'e.g. Alex')}
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-base outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/15 sm:text-sm dark:border-white/10 dark:bg-white/5"
          />
        </label>
        <div className="px-3">
          <span className="flex items-center gap-1.5 text-sm font-medium">
            <Globe2 size={15} /> {t('พื้นหลังของคุณ', 'Your background')}
          </span>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {t('ใช้ปรับคำแนะนำในส่วนสะพานวัฒนธรรมเท่านั้น ไม่มีผลกับคะแนน', 'Only used to tailor Culture Bridge tips. It never affects your scores.')}
          </p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {(
              [
                ['thai', t('คนไทย', 'Thai'), t('รับคำแนะนำสำหรับทำงานกับทีมนานาชาติ', 'Get tips for working in international teams')],
                ['foreign', t('ไม่ใช่คนไทย', 'Not Thai'), t('รับคำแนะนำสำหรับทำงานกับทีมคนไทย', 'Get tips for working in Thai teams')],
              ] as const
            ).map(([id, label, sub]) => (
              <button
                key={id}
                type="button"
                aria-pressed={background === id}
                onClick={() => setBackground(id)}
                className={cn(
                  'rounded-2xl border p-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600',
                  background === id ? 'border-violet-500 bg-violet-500/10' : 'border-slate-200 dark:border-white/10',
                )}
              >
                <span className="block text-sm font-semibold">{label}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">{sub}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <Toggle
            checked={draft.self}
            onChange={(v) => setDraft({ ...draft, self: v })}
            label={t('ใช้ผลเพื่อรู้จักตัวเอง (จำเป็น)', 'Use my results for self-insight (required)')}
            detail={t('คุณเห็นผลทั้งหมดก่อนคนอื่นเสมอ คำตอบดิบไม่มีใครเห็นนอกจากคุณ', 'You always see your results first. No one but you sees your raw answers.')}
          />
          <Toggle
            checked={draft.team}
            onChange={(v) => setDraft({ ...draft, team: v })}
            label={t('แสดงใน Team map ของทีม', 'Show me on my team’s Team map')}
            detail={t('หัวหน้าและทีมเห็น persona และสรุป ไม่เห็นคำตอบรายข้อ', 'Your manager and team see your persona and summary, not your answers.')}
          />
          <Toggle
            checked={draft.hr}
            onChange={(v) => setDraft({ ...draft, hr: v })}
            label={t('เปิดรับโอกาสย้ายงานภายใน', 'Open to internal opportunities')}
            detail={t('ทีมสรรหาค้นหาคุณได้เมื่อมีตำแหน่งที่เหมาะ ทุกการค้นหาถูกบันทึก', 'Recruiters can find you for suitable roles. Every search is logged.')}
          />
        </div>
      </Card>
      <div className="mt-6 flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Lock size={13} /> {t('ถอนความยินยอมและลบข้อมูลได้ทุกเมื่อ', 'Withdraw consent and delete your data any time')}
        </span>
        <Button
          variant="glow"
          size="lg"
          iconRight={ArrowRight}
          disabled={!draft.self}
          onClick={() => {
            setConsent(draft)
            window.scrollTo({ top: 0, behavior: 'instant' })
          }}
        >
          {t('ยอมรับและเริ่ม', 'Agree and start')}
        </Button>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------------------------- */

function Wizard() {
  const t = useT()
  const navigate = useNavigate()
  const { step, setStep, answers, complete, reset } = useAssessment()
  const progress = useProgress()
  const page = PAGES[Math.min(step, PAGES.length - 1)]
  const section = SECTION[page.kind]
  const lastTs = useRef(Date.now())
  const [confirmReset, setConfirmReset] = useState(false)

  useEffect(() => {
    lastTs.current = Date.now()
  }, [step])

  // Every page change (Next, Back or auto-advance) starts at the top. Instant, because a smooth
  // scroll gets cut off by the new page rendering mid-way.
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [step])

  const pageDone = useMemo(() => {
    if (page.kind === 'likert') return page.entries.every((e) => answers.likert[e.item.id])
    const a = page.kind === 'forced' ? answers.forced[page.block.id] : answers.scenario[page.scenario.id]
    return Boolean(a?.most && a?.least)
  }, [page, answers])

  const isLast = step >= PAGES.length - 1
  const next = () => {
    if (isLast) {
      complete()
      navigate('/me')
      return
    }
    setStep(step + 1)
  }

  // Auto-advance once both picks are made on a pick page.
  const autoKey = page.kind === 'forced' ? page.block.id : page.kind === 'scenario' ? page.scenario.id : null
  const prevDone = useRef(pageDone)
  useEffect(() => {
    if (autoKey && pageDone && !prevDone.current && !isLast) {
      const tm = window.setTimeout(() => setStep(step + 1), 450)
      prevDone.current = pageDone
      return () => window.clearTimeout(tm)
    }
    prevDone.current = pageDone
  }, [pageDone, autoKey, isLast, setStep, step])

  return (
    <div className="mx-auto max-w-3xl">
      <StickyBar className="mb-6">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium">
            {t('ส่วนที่', 'Part')} {section.n}/3 · {t(section.name)}
          </span>
          <span className="tabular text-slate-500 dark:text-slate-400">
            {progress.done}/{progress.total} · {progress.pct}%
          </span>
        </div>
        <div className="mt-2 flex gap-1">
          {(['likert', 'forced', 'scenario'] as const).map((k) => {
            const total = k === 'likert' ? LIKERT_SEQUENCE.length : k === 'forced' ? FORCED_BLOCKS.length : SCENARIOS.length
            const done = progress[k]
            return (
              <div key={k} className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-900/[0.07] dark:bg-white/10" style={{ flexGrow: total }}>
                <div className="h-full rounded-full bg-gradient-brand transition-[width] duration-500" style={{ width: `${(done / total) * 100}%` }} />
              </div>
            )
          })}
        </div>
      </StickyBar>

      <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">{t(section.hint)}</p>

      <div key={step} className="animate-rise">
        {page.kind === 'likert' && <LikertPage entries={page.entries} lastTs={lastTs} />}
        {page.kind === 'forced' && <PickPage kind="forced" id={page.block.id} options={page.block.statements.map((s) => ({ id: s.id, text: s.text }))} />}
        {page.kind === 'scenario' && (
          <>
            <Card className="mb-4">
              <Chip>{(() => {
                const c = CONTEXTS.find((x) => x.id === page.scenario.context)
                return c ? t(c.th, c.en) : ''
              })()}</Chip>
              <p className="mt-3 text-lg font-medium leading-relaxed">{t(page.scenario.text)}</p>
            </Card>
            <PickPage kind="scenario" id={page.scenario.id} options={page.scenario.options.map((o) => ({ id: o.id, text: o.text }))} />
          </>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button variant="ghost" icon={ArrowLeft} disabled={step === 0} onClick={() => setStep(step - 1)}>
          {t('ย้อนกลับ', 'Back')}
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            title={confirmReset ? t('กดอีกครั้งเพื่อล้างคำตอบทั้งหมด', 'Click again to clear all answers') : t('ล้างคำตอบทั้งหมดแล้วเริ่มใหม่', 'Clear all answers and start over')}
            className={cn(confirmReset && 'text-red-600 dark:text-red-400')}
            onClick={() => {
              if (!confirmReset) {
                setConfirmReset(true)
                window.setTimeout(() => setConfirmReset(false), 3000)
                return
              }
              setConfirmReset(false)
              reset()
            }}
          >
            {confirmReset ? t('ยืนยันล้าง?', 'Confirm?') : t('เริ่มใหม่', 'Restart')}
          </Button>
          <Button variant={isLast ? 'glow' : 'primary'} iconRight={isLast ? Check : ArrowRight} disabled={!pageDone} onClick={next}>
            {isLast ? t('ดูผลของฉัน', 'See my results') : t('ถัดไป', 'Next')}
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ---------------------------------------------------------------------------------------------- */

const DOT_SIZES = [44, 36, 28, 28, 36, 44]

function LikertPage({ entries, lastTs }: { entries: LikertEntry[]; lastTs: RefObject<number> }) {
  const t = useT()
  const answers = useAssessment((s) => s.answers.likert)
  const answer = useAssessment((s) => s.answerLikert)
  const refs = useRef<(HTMLDivElement | null)[]>([])

  return (
    <div className="space-y-4">
      {entries.map((e, i) => {
        const value = answers[e.item.id]?.value
        return (
          <div key={e.item.id} ref={(el) => void (refs.current[i] = el)}>
            <Card className={cn('transition', value && 'opacity-70 hover:opacity-100')}>
              <p className="text-center text-lg font-medium leading-relaxed">{t(e.item.text)}</p>
              <div className="mt-5 flex items-center justify-center gap-2 sm:gap-4" role="radiogroup" aria-label={t(e.item.text)}>
                <span className="hidden w-24 text-right text-xs font-medium text-orange-600 sm:block dark:text-orange-300">{t('ไม่เห็นด้วย', 'Disagree')}</span>
                {LIKERT_SCALE.map((label, k) => {
                  const v = k + 1
                  const on = value === v
                  const agree = v >= 4
                  return (
                    <button
                      key={label.en}
                      type="button"
                      role="radio"
                      aria-checked={on}
                      aria-label={t(label)}
                      onClick={() => {
                        const now = Date.now()
                        answer(e.item.id, v, now - (lastTs.current ?? now))
                        lastTs.current = now
                        const nextEl = refs.current[i + 1]
                        if (nextEl && !answers[entries[i + 1]?.item.id]) {
                          window.setTimeout(() => nextEl.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120)
                        }
                      }}
                      className={cn(
                        'grid shrink-0 place-items-center rounded-full border-2 transition-all duration-200 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600',
                        agree ? 'border-violet-400 dark:border-violet-400/70' : 'border-orange-400 dark:border-orange-400/70',
                        on && (agree ? 'bg-violet-500' : 'bg-orange-500 shadow-lg shadow-orange-500/30'),
                      )}
                      style={{ width: DOT_SIZES[k], height: DOT_SIZES[k] }}
                    >
                      {on && <Check size={16} className="text-white" strokeWidth={3} />}
                    </button>
                  )
                })}
                <span className="hidden w-24 text-xs font-medium text-violet-600 sm:block dark:text-violet-300">{t('เห็นด้วย', 'Agree')}</span>
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-slate-500 sm:hidden dark:text-slate-400">
                <span>{t('ไม่เห็นด้วย', 'Disagree')}</span>
                <span>{t('เห็นด้วย', 'Agree')}</span>
              </div>
              {value && <div className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">{t(LIKERT_SCALE[value - 1])}</div>}
            </Card>
          </div>
        )
      })}
    </div>
  )
}

function PickPage({ kind, id, options }: { kind: 'forced' | 'scenario'; id: string; options: { id: string; text: T }[] }) {
  const t = useT()
  const a: PickAnswer = useAssessment((s) => s.answers[kind][id]) ?? {}
  const pick = useAssessment((s) => s.pick)
  return (
    <div className="space-y-3">
      {options.map((o) => {
        const most = a.most === o.id
        const least = a.least === o.id
        return (
          <Card key={o.id} className={cn('flex flex-col gap-4 transition sm:flex-row sm:items-center', most && 'ring-2 ring-violet-500', least && 'ring-2 ring-orange-400')}>
            <p className="flex-1 text-base font-medium leading-relaxed">{t(o.text)}</p>
            <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                aria-pressed={most}
                onClick={() => pick(kind, id, 'most', o.id)}
                className={cn(
                  'flex h-10 items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600',
                  most
                    ? 'border-violet-600 bg-violet-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300',
                )}
              >
                <ThumbsUp size={15} /> {t('เหมือนฉันที่สุด', 'Most like me')}
              </button>
              <button
                type="button"
                aria-pressed={least}
                onClick={() => pick(kind, id, 'least', o.id)}
                className={cn(
                  'flex h-10 items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600',
                  least
                    ? 'border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-300',
                )}
              >
                <ThumbsDown size={15} /> {t('น้อยที่สุด', 'Least like me')}
              </button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
