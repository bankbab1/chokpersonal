import { ArrowLeft, ArrowRight, Check, CircleHelp, Lock, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { StickyBar } from '@/components/ui/StickyBar'
import { Card, Chip, Eyebrow } from '@/components/ui/Card'
import { CONTEXTS, LIKERT_SCALE, type ForcedBlock, type LikertEntry, type Scenario } from '@/domain/items'
import type { RoleItem } from '@/domain/roles'
import type { PickAnswer } from '@/domain/types'
import { cn } from '@/lib/cn'
import { tt, useT, type T } from '@/lib/i18n'
import { levelInfo, levelRank, LEVELS, LEVEL_ORDER, itemsFor, type Level } from '@/domain/levels'
import { useAssessment } from '@/store/assessment'

type Page =
  | { kind: 'roles'; items: RoleItem[]; index: number }
  | { kind: 'likert'; entries: LikertEntry[]; index: number }
  | { kind: 'forced'; block: ForcedBlock; index: number }
  | { kind: 'scenario'; scenario: Scenario; index: number }

const LIKERT_PER_PAGE = 5
const ROLE_PREF_PER_PAGE = 4

/**
 * Pages for a level, in order: how you work first (this gives your code), then — Professional only —
 * the 48 role-interest items (preferences 4 per page, then one scenario / role choice per page).
 */
const buildPages = (level: Level): Page[] => {
  const it = itemsFor(level)
  const prefs = it.roles.filter((q) => q.kind === 'preference')
  const picks = it.roles.filter((q) => q.kind !== 'preference')
  return [
    ...Array.from({ length: Math.ceil(it.likert.length / LIKERT_PER_PAGE) }, (_, i) => ({
      kind: 'likert' as const,
      entries: it.likert.slice(i * LIKERT_PER_PAGE, (i + 1) * LIKERT_PER_PAGE),
      index: i,
    })),
    ...it.forced.map((block, index) => ({ kind: 'forced' as const, block, index })),
    ...it.scenarios.map((scenario, index) => ({ kind: 'scenario' as const, scenario, index })),
    ...Array.from({ length: Math.ceil(prefs.length / ROLE_PREF_PER_PAGE) }, (_, i) => ({
      kind: 'roles' as const,
      items: prefs.slice(i * ROLE_PREF_PER_PAGE, (i + 1) * ROLE_PREF_PER_PAGE),
      index: i,
    })),
    ...picks.map((q, i) => ({ kind: 'roles' as const, items: [q], index: prefs.length + i })),
  ]
}

const pageItems = (p: Page) => (p.kind === 'roles' ? p.items.length : p.kind === 'likert' ? p.entries.length : 1)

const SECTION: Record<Page['kind'], { n: number; name: T; hint: T }> = {
  roles: {
    n: 4,
    name: tt('บทบาทที่อยากทำ', 'Roles you want'),
    hint: tt('ตอบตามสิ่งที่คุณอยากทำเมื่อเลือกได้ ไม่ใช่สิ่งที่งานปัจจุบันบังคับให้ทำ ไม่มีคำตอบถูกหรือผิด', 'Answer with what you would choose to do, not what your current job makes you do. There are no right or wrong answers.'),
  },
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
  const sample = useAssessment((s) => s.sample || s.name === 'คุณ (ตัวอย่าง)')
  const level = useAssessment((s) => s.level)
  const completedLevel = useAssessment((s) => s.completedLevel)
  const [reviewing, setReviewing] = useState(false)
  const [picking, setPicking] = useState(false)
  const setLevel = useAssessment((s) => s.setLevel)
  const setConsent = useAssessment((s) => s.setConsent)
  // Like the best-known tests: questions start straight away. Quick is the default; deeper levels are
  // offered at the end. Starting to answer = agreeing to keep answers on this device for your result;
  // sharing with a team or HR stays a separate opt-in in your result's Data tab.
  useEffect(() => {
    if (sample) return
    if (!level) setLevel('quick')
    if (!consent.self) setConsent({ self: true })
  }, [sample, level, consent.self, setLevel, setConsent])
  // Never show generated sample answers as if they were the person's own.
  if (sample) return <SampleNotice />
  if (picking || !level) return <LevelPicker onDone={() => setPicking(false)} />
  // Finished this level: a "done" screen with the option to go deeper, not the last question pre-filled.
  if (completedLevel && levelRank(completedLevel) >= levelRank(level) && !reviewing) return <DoneNotice onReview={() => setReviewing(true)} />
  return <Wizard level={level} onChangeLevel={() => setPicking(true)} />
}

/* ---------------------------------------------------------------------------------------------- */

function LevelPicker({ onDone }: { onDone: () => void }) {
  const t = useT()
  const setLevel = useAssessment((s) => s.setLevel)
  const current = useAssessment((s) => s.level)
  const [pick, setPick] = useState<Level>(current ?? 'quick')
  return (
    <div className="mx-auto max-w-3xl animate-rise">
      <Eyebrow>{t('เลือกระดับ', 'Choose your level')}</Eyebrow>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{t('อยากรู้จักตัวเองลึกแค่ไหน?', 'How deep do you want to go?')}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        {t('ยิ่งตอบมาก ผลยิ่งแม่น และทำต่อเป็นระดับที่ลึกขึ้นได้ภายหลังโดยไม่ต้องเริ่มใหม่', 'More answers give a more accurate result. You can go deeper later without starting over.')}
      </p>
      <div className="mt-6 grid gap-3 md:grid-cols-3" role="radiogroup" aria-label={t('ระดับแบบทดสอบ', 'Test level')}>
        {LEVELS.map((l) => {
          const on = pick === l.id
          return (
            <button
              key={l.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setPick(l.id)}
              className={cn(
                'relative flex flex-col rounded-2xl border bg-white p-5 text-left transition active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 dark:bg-[#131318]',
                on ? 'border-violet-700 ring-2 ring-violet-700/20 dark:border-violet-500' : 'border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/25',
              )}
            >
              {l.id === 'standard' && (
                <span className="absolute right-4 top-4 rounded-full bg-violet-50 px-2 py-0.5 text-xs font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-200">
                  {t('แนะนำ', 'Recommended')}
                </span>
              )}
              <span className="text-lg font-semibold">{t(l.name)}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {t(l.minutes)} · {itemsFor(l.id).likert.length + itemsFor(l.id).forced.length + itemsFor(l.id).scenarios.length + itemsFor(l.id).roles.length} {t('ข้อ', 'items')}
              </span>
              <ul className="mt-3 flex-1 space-y-1.5 text-sm">
                {l.gets.map((g) => (
                  <li key={g.en} className="flex gap-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-violet-700 dark:text-violet-300" />
                    {t(g)}
                  </li>
                ))}
              </ul>
              <span className="mt-3 text-xs text-slate-500 dark:text-slate-400">{t(l.accuracy)}</span>
            </button>
          )
        })}
      </div>
      <div className="mt-6 flex justify-end">
        <Button
          variant="primary"
          size="lg"
          iconRight={ArrowRight}
          onClick={() => {
            setLevel(pick)
            onDone()
          }}
        >
          {t(`เริ่มระดับ${levelInfo(pick).name.th}`, `Start ${levelInfo(pick).name.en}`)}
        </Button>
      </div>
    </div>
  )
}

function SampleNotice() {
  const t = useT()
  const navigate = useNavigate()
  const reset = useAssessment((s) => s.reset)
  return (
    <div className="mx-auto max-w-xl animate-rise py-10 text-center">
      <Eyebrow>{t('ผลตัวอย่าง', 'Sample result')}</Eyebrow>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{t('ตอนนี้คุณกำลังดูผลตัวอย่าง', 'You are looking at a sample result')}</h1>
      <p className="mt-3 text-slate-600 dark:text-slate-300">
        {t(
          'คำตอบตัวอย่างถูกสร้างขึ้นเพื่อให้ดูหน้าผลเท่านั้น เริ่มทำของจริงแล้วเราจะล้างคำตอบตัวอย่าง ทุกข้อจะเริ่มจากว่าง ไม่มีอะไรเลือกไว้ให้',
          'The sample answers only exist to show the results page. Start for real and we clear them, so every question starts empty with nothing chosen for you.',
        )}
      </p>
      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
        <Button
          variant="primary"
          size="lg"
          iconRight={ArrowRight}
          onClick={() => {
            reset()
            window.scrollTo({ top: 0, behavior: 'instant' })
          }}
        >
          {t('เริ่มทำของจริง', 'Start for real')}
        </Button>
        <Button size="lg" onClick={() => navigate('/me')}>
          {t('กลับไปดูผลตัวอย่าง', 'Back to the sample result')}
        </Button>
      </div>
    </div>
  )
}

function DoneNotice({ onReview }: { onReview: () => void }) {
  const t = useT()
  const navigate = useNavigate()
  const reset = useAssessment((s) => s.reset)
  const setStep = useAssessment((s) => s.setStep)
  const setLevel = useAssessment((s) => s.setLevel)
  const completedLevel = useAssessment((s) => s.completedLevel) ?? 'standard'
  const deeper = LEVEL_ORDER.slice(levelRank(completedLevel) + 1)
  const [confirm, setConfirm] = useState(false)
  return (
    <div className="mx-auto max-w-xl animate-rise py-10 text-center">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
        <Check size={28} />
      </span>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">{t('คุณทำแบบประเมินครบแล้ว', 'You have finished the assessment')}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        {t(`ระดับ${levelInfo(completedLevel).name.th} · ดูผล ทบทวนคำตอบ หรือทำต่อให้ลึกขึ้น`, `${levelInfo(completedLevel).name.en} level · see results, review answers, or go deeper`)}
      </p>
      {deeper.length > 0 && (
        <div className="mt-5 grid gap-2 text-left">
          {deeper.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className="flex items-center gap-3 rounded-2xl border border-violet-200 bg-violet-50/60 p-4 transition active:scale-[0.99] dark:border-violet-500/30 dark:bg-violet-500/10"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{t(`ทำต่อเป็นระดับ${levelInfo(l).name.th}`, `Go on to ${levelInfo(l).name.en}`)}</span>
                <span className="block text-sm text-slate-600 dark:text-slate-300">
                  {t('คำตอบเดิมยังอยู่ ', 'Your answers carry over · ')}
                  {levelInfo(l).gets.map((g) => t(g)).join(' · ')}
                </span>
              </span>
              <ArrowRight size={18} className="shrink-0 text-violet-700 dark:text-violet-300" />
            </button>
          ))}
        </div>
      )}
      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
        <Button variant="primary" size="lg" iconRight={ArrowRight} onClick={() => navigate('/me')}>
          {t('ดูผลของฉัน', 'See my results')}
        </Button>
        <Button
          size="lg"
          onClick={() => {
            setStep(0)
            onReview()
          }}
        >
          {t('ทบทวนคำตอบ', 'Review my answers')}
        </Button>
      </div>
      <Button
        className="mt-4 text-red-600 dark:text-red-400"
        variant="ghost"
        icon={RotateCcw}
        onClick={() => {
          if (!confirm) {
            setConfirm(true)
            return
          }
          reset()
        }}
      >
        {confirm ? t('กดอีกครั้งเพื่อล้างคำตอบทั้งหมด', 'Tap again to clear every answer') : t('เริ่มใหม่ทั้งหมด', 'Start over')}
      </Button>
    </div>
  )
}

/* ---------------------------------------------------------------------------------------------- */

function Wizard({ level, onChangeLevel }: { level: Level; onChangeLevel: () => void }) {
  const t = useT()
  const navigate = useNavigate()
  const { step, setStep, answers, complete, reset, roles } = useAssessment()
  const PAGES = useMemo(() => buildPages(level), [level])
  const page = PAGES[Math.min(step, PAGES.length - 1)]
  const section = SECTION[page.kind]
  const kinds = useMemo(() => [...new Set(PAGES.map((p) => p.kind))], [PAGES])
  const isDone = (p: Page) =>
    p.kind === 'roles'
      ? p.items.every((q) => roles[q.id])
      : p.kind === 'likert'
        ? p.entries.every((e) => answers.likert[e.item.id])
        : Boolean((p.kind === 'forced' ? answers.forced[p.block.id] : answers.scenario[p.scenario.id])?.most && (p.kind === 'forced' ? answers.forced[p.block.id] : answers.scenario[p.scenario.id])?.least)
  const total = PAGES.reduce((n, p) => n + pageItems(p), 0)
  const done = PAGES.reduce(
    (n, p) =>
      n +
      (p.kind === 'roles'
        ? p.items.filter((q) => roles[q.id]).length
        : p.kind === 'likert'
          ? p.entries.filter((e) => answers.likert[e.item.id]).length
          : isDone(p)
            ? 1
            : 0),
    0,
  )
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

  const pageDone = isDone(page)
  const isLast = step >= PAGES.length - 1
  // Arriving (or going up a level): resume at the first unanswered page; answers from other levels carry over.
  useEffect(() => {
    const first = PAGES.findIndex((p) => !isDone(p))
    if (first >= 0 && first !== step) setStep(first)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level])
  const next = () => {
    if (isLast) {
      complete()
      navigate('/me')
      return
    }
    setStep(step + 1)
  }

  // Auto-advance once both picks are made on a pick page.
  const autoKey =
    page.kind === 'forced' ? page.block.id : page.kind === 'scenario' ? page.scenario.id : page.kind === 'roles' && page.items.length === 1 ? page.items[0].id : null
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
            {t(levelInfo(level).name)} · {t('ส่วนที่', 'Part')} {kinds.indexOf(page.kind) + 1}/{kinds.length} · {t(section.name)}
          </span>
          <span className="tabular text-slate-500 dark:text-slate-400">
            {done}/{total} · {Math.round((done / total) * 100)}%
          </span>
        </div>
        <div className="mt-2 flex gap-1">
          {kinds.map((k) => {
            const ofKind = PAGES.filter((p) => p.kind === k)
            const total = ofKind.reduce((n, p) => n + pageItems(p), 0)
            const done = ofKind.reduce((n, p) => n + (isDone(p) ? pageItems(p) : 0), 0)
            return (
              <div key={k} className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-900/[0.07] dark:bg-white/10" style={{ flexGrow: total }}>
                <div className="h-full rounded-full bg-gradient-brand transition-[width] duration-500" style={{ width: `${(done / total) * 100}%` }} />
              </div>
            )
          })}
        </div>
      </StickyBar>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
        <p className="text-sm text-slate-500 dark:text-slate-400">{t(section.hint)}</p>
        <button type="button" onClick={onChangeLevel} className="min-h-9 shrink-0 text-sm font-medium text-violet-700 underline-offset-2 hover:underline dark:text-violet-300">
          {t(`ระดับ${levelInfo(level).name.th} · เปลี่ยน`, `${levelInfo(level).name.en} level · change`)}
        </button>
      </div>
      {step === 0 && (
        <p className="-mt-3 mb-6 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Lock size={13} />
          {t('คำตอบเก็บบนเครื่องนี้เพื่อแสดงผลให้คุณเท่านั้น ไม่ใช้ตัดสินการจ้าง การแชร์กับทีมหรือ HR เลือกเองได้ภายหลัง', 'Answers stay on this device to show you your result. Never used for hiring decisions. Sharing with a team or HR is your choice later.')}
        </p>
      )}

      <div key={step} className="animate-rise">
        {page.kind === 'roles' && (page.items[0].kind === 'preference' ? <RolePrefPage items={page.items} /> : <RolePickPage item={page.items[0]} />)}
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

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-slate-200/80 bg-white/95 px-4 pt-2.5 backdrop-blur sm:static sm:mt-8 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none dark:border-white/[0.08] dark:bg-[#0c0c10]/95 sm:dark:bg-transparent" style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom))' }}>
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

// Touch-friendly on phones: the smallest dot is still 36px, the ends 44px (iOS minimum). Fits 375px with gaps.
const DOT_SIZES = [44, 40, 36, 36, 40, 44]

function LikertPage({ entries, lastTs }: { entries: LikertEntry[]; lastTs: RefObject<number> }) {
  const t = useT()
  const answers = useAssessment((s) => s.answers.likert)
  const answer = useAssessment((s) => s.answerLikert)
  const refs = useRef<(HTMLDivElement | null)[]>([])

  return (
    <div className="divide-y divide-slate-200/80 dark:divide-white/[0.08]">
      {entries.map((e, i) => {
        const value = answers[e.item.id]?.value
        return (
          <div key={e.item.id} ref={(el) => void (refs.current[i] = el)}>
            <div className={cn('py-7 transition first:pt-2', value && 'opacity-60 hover:opacity-100')}>
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
              <div className="mt-2 flex justify-between text-xs text-slate-500 sm:hidden dark:text-slate-400">
                <span>{t('ไม่เห็นด้วย', 'Disagree')}</span>
                <span>{t('เห็นด้วย', 'Agree')}</span>
              </div>
              {value && <div className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">{t(LIKERT_SCALE[value - 1])}</div>}
            </div>
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
                    : 'border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700 dark:hover:border-violet-400/50 dark:hover:text-violet-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300',
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
                    : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 dark:hover:border-orange-400/50 hover:text-orange-700 dark:hover:text-orange-300 dark:border-white/10 dark:bg-white/5 dark:text-slate-300',
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

/* ------------------------------------- Part 1: role interests ------------------------------------- */

/** Flag an unclear question without writing anything personal (spec §8.2, F-28). */
function UnclearFlag({ id }: { id: string }) {
  const t = useT()
  const flagged = useAssessment((s) => s.unclear.includes(id))
  const toggle = useAssessment((s) => s.toggleUnclear)
  return (
    <button
      type="button"
      aria-pressed={flagged}
      onClick={() => toggle(id)}
      className={cn(
        'inline-flex min-h-9 items-center gap-1 rounded-md px-2 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600',
        flagged ? 'bg-amber-50 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300',
      )}
    >
      <CircleHelp size={12} /> {flagged ? t('แจ้งแล้วว่าไม่ชัด', 'Marked unclear') : t('คำถามไม่ชัด?', 'Unclear?')}
    </button>
  )
}

function RolePrefPage({ items }: { items: RoleItem[] }) {
  const t = useT()
  const roles = useAssessment((s) => s.roles)
  const answer = useAssessment((s) => s.answerRole)
  return (
    <div className="divide-y divide-slate-200/80 dark:divide-white/[0.08]">
      {items.map((q) => {
        const value = roles[q.id]
        const chosen = q.options.find((o) => o.id === value)
        return (
          <div key={q.id} className={cn('py-7 transition first:pt-2', value && 'opacity-60 hover:opacity-100')}>
            <p className="text-center text-lg font-medium leading-relaxed">{t(q.prompt)}</p>
            <div className="mt-5 flex items-center justify-center gap-2 sm:gap-4" role="radiogroup" aria-label={t(q.prompt)}>
              <span className="hidden w-24 text-right text-xs font-medium text-orange-600 sm:block dark:text-orange-300">{t('ไม่ตรง', 'Not me')}</span>
              {q.options.map((o, k) => {
                const on = value === o.id
                const agree = o.score > 50
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={t(o.text)}
                    onClick={() => answer(q.id, o.id)}
                    className={cn(
                      'grid shrink-0 place-items-center rounded-full border-2 transition-all duration-200 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600',
                      agree ? 'border-violet-400 dark:border-violet-400/70' : 'border-orange-400 dark:border-orange-400/70',
                      on && (agree ? 'bg-violet-500' : 'bg-orange-500'),
                    )}
                    style={{ width: DOT_SIZES[k], height: DOT_SIZES[k] }}
                  >
                    {on && <Check size={16} className="text-white" strokeWidth={3} />}
                  </button>
                )
              })}
              <span className="hidden w-24 text-xs font-medium text-violet-600 sm:block dark:text-violet-300">{t('ตรง', 'Like me')}</span>
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-500 sm:hidden dark:text-slate-400">
              <span>{t('ไม่ตรง', 'Not me')}</span>
              <span>{t('ตรง', 'Like me')}</span>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">{chosen ? t(chosen.text) : ''}</span>
              <UnclearFlag id={q.id} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Role choice: two duties, lean left or right — 4 steps, no "equally" middle. */
function RoleLean({ item }: { item: RoleItem }) {
  const t = useT()
  const value = useAssessment((s) => s.roles[item.id])
  const answer = useAssessment((s) => s.answerRole)
  const a = item.options.find((o) => o.side === 'a')!
  const c = item.options.find((o) => o.side === 'c')!
  return (
    <div>
      <Card className="mb-4">
        <Chip>{t('เลือกหน้าที่', 'Choose a duty')}</Chip>
        <p className="mt-3 text-lg font-medium leading-relaxed">{t(item.prompt)}</p>
      </Card>
      <Card>
        <div className="grid grid-cols-2 gap-3 text-sm font-medium">
          <p className="rounded-xl bg-orange-50 p-3 dark:bg-orange-400/10">{t(a.text)}</p>
          <p className="rounded-xl bg-violet-50 p-3 text-right dark:bg-violet-500/10">{t(c.text)}</p>
        </div>
        <div className="mt-5 flex items-center justify-center gap-3 sm:gap-5" role="radiogroup" aria-label={t(item.prompt)}>
          {item.options.map((o) => {
            const on = value === o.id
            const right = o.side === 'c'
            const label = o.strong ? (right ? t('ขวาแน่นอน', 'Definitely right') : t('ซ้ายแน่นอน', 'Definitely left')) : right ? t('ค่อนไปทางขวา', 'Leaning right') : t('ค่อนไปทางซ้าย', 'Leaning left')
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={on}
                aria-label={label}
                onClick={() => answer(item.id, o.id)}
                className={cn(
                  'grid shrink-0 place-items-center rounded-full border-2 transition-all duration-200 hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600',
                  right ? 'border-violet-400 dark:border-violet-400/70' : 'border-orange-400 dark:border-orange-400/70',
                  on && (right ? 'bg-violet-500' : 'bg-orange-500'),
                )}
                style={{ width: o.strong ? 48 : 40, height: o.strong ? 48 : 40 }}
              >
                {on && <Check size={16} className="text-white" strokeWidth={3} />}
              </button>
            )
          })}
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{t('← แบบซ้าย', '← Left')}</span>
          <span>{t('แบบขวา →', 'Right →')}</span>
        </div>
      </Card>
      <div className="mt-2 text-right">
        <UnclearFlag id={item.id} />
      </div>
    </div>
  )
}

function RolePickPage({ item }: { item: RoleItem }) {
  if (item.kind === 'role_choice') return <RoleLean item={item} />
  return <RoleScenario item={item} />
}

function RoleScenario({ item }: { item: RoleItem }) {
  const t = useT()
  const value = useAssessment((s) => s.roles[item.id])
  const answer = useAssessment((s) => s.answerRole)
  return (
    <div>
      <Card className="mb-4">
        <Chip>{t('สถานการณ์', 'Situation')}</Chip>
        <p className="mt-3 text-lg font-medium leading-relaxed">{t(item.prompt)}</p>
      </Card>
      <div className="space-y-2.5" role="radiogroup" aria-label={t(item.prompt)}>
        {item.options.map((o) => {
          const on = value === o.id
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => answer(item.id, o.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-2xl border p-4 text-left text-base transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600',
                on
                  ? 'border-violet-700 bg-violet-50 font-medium text-violet-950 dark:border-violet-500 dark:bg-violet-500/15 dark:text-white'
                  : 'border-slate-200 bg-white hover:border-violet-300 dark:hover:border-violet-400/50 dark:border-white/10 dark:bg-[#131318]',
              )}
            >
              <span className={cn('grid size-5 shrink-0 place-items-center rounded-full border-2', on ? 'border-violet-700 bg-violet-700 dark:border-violet-500 dark:bg-violet-500' : 'border-slate-300 dark:border-white/20')}>
                {on && <Check size={12} strokeWidth={3} className="text-white" />}
              </span>
              {t(o.text)}
            </button>
          )
        })}
      </div>
      <div className="mt-2 text-right">
        <UnclearFlag id={item.id} />
      </div>
    </div>
  )
}
