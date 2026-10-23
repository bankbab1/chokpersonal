import { ArrowLeft, ArrowRight, Check, Layers } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { StickyBar } from '@/components/ui/StickyBar'
import { Card, Eyebrow, Meter } from '@/components/ui/Card'
import { DEEP_MODULES, deepProfile, moduleDone, TOTAL_ASPECTS, type DeepModule } from '@/domain/deep'
import { LIKERT_SCALE } from '@/domain/items'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { useProfile } from '@/lib/useProfile'
import { useAssessment } from '@/store/assessment'

/** Depth meter: how many of the 87 aspects are measured so far. */
export function DepthMeter({ compact }: { compact?: boolean }) {
  const t = useT()
  const deep = useAssessment((s) => s.deep)
  const measured = deepProfile(deep).measured
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className={cn('font-semibold', compact ? 'text-sm' : 'text-base')}>{t('ความลึกของโปรไฟล์', 'Profile depth')}</span>
        <span className="tabular text-sm">
          <b className="font-display text-xl">{measured}</b> / {TOTAL_ASPECTS} {t('ด้าน', 'aspects')}
        </span>
      </div>
      <Meter value={(measured / TOTAL_ASPECTS) * 100} color="#6d28d9" className="mt-2 h-2.5" />
    </div>
  )
}

export function DeepHub() {
  const t = useT()
  const profile = useProfile()
  const deep = useAssessment((s) => s.deep)
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>{t('เจาะลึก', 'Deep dive')}</Eyebrow>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t('ลึกกว่า 18 มิติ', 'Deeper than 18 dimensions')}</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
          {t(
            'แบบทดสอบหลักวัด 18 มิติ โมดูลเจาะลึกเพิ่มอีก 69 ด้าน: ด้านย่อย 54 ด้าน แรงจูงใจ 8 แบบ ความเสี่ยงเมื่อกดดัน 6 แบบ และความไวในการเรียนรู้ ทำทีละโมดูลเมื่อสะดวก ผลจะเติมเข้าไปในโปรไฟล์ของคุณทันที',
            'The core test measures 18 dimensions. Deep modules add 69 more aspects: 54 facets, 8 motivators, 6 under-pressure risks and learning agility. Do one module at a time whenever you like; each one adds to your profile straight away.',
          )}
        </p>
      </div>

      <Card>
        <DepthMeter />
      </Card>

      {!profile && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-amber-300/60 bg-amber-50/70 dark:border-amber-400/30 dark:bg-amber-400/10">
          <p className="text-sm">{t('แนะนำให้ทำแบบทดสอบหลักก่อน แล้วค่อยเจาะลึก', 'We suggest taking the core test first, then going deeper.')}</p>
          <Button size="sm" variant="primary" to="/test">
            {t('ไปที่แบบทดสอบหลัก', 'Go to the core test')}
          </Button>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {DEEP_MODULES.map((m) => {
          const done = moduleDone(deep, m)
          const complete = done === m.items.length
          return (
            <Card key={m.id} className="flex flex-col">
              <div className="flex items-center justify-between gap-2">
                <span className="grid size-10 place-items-center rounded-2xl bg-gradient-brand text-white">
                  {complete ? <Check size={18} /> : <Layers size={18} />}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {m.items.length} {t('ข้อ', 'items')} · ~{m.minutes} {t('นาที', 'min')}
                </span>
              </div>
              <h2 className="mt-3 text-lg font-semibold">{t(m.name)}</h2>
              <p className="mt-1 flex-1 text-sm text-slate-600 dark:text-slate-300">{t(m.blurb)}</p>
              <Meter value={(done / m.items.length) * 100} color="#7c3aed" className="mt-4" />
              <Button className="mt-4" variant={complete ? 'secondary' : 'primary'} size="sm" to={`/deep/${m.id}`} iconRight={ArrowRight}>
                {complete ? t('ทำใหม่', 'Redo') : done > 0 ? t('ทำต่อ', 'Continue') : t('เริ่ม', 'Start')}
              </Button>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-center">
        <Button to="/me" iconRight={ArrowRight}>
          {t('ดูโปรไฟล์ของฉัน', 'See my profile')}
        </Button>
      </div>
    </div>
  )
}

const PER_PAGE = 6

export function DeepModulePage() {
  const { module } = useParams()
  const m = DEEP_MODULES.find((x) => x.id === module)
  if (!m) return <DeepHub />
  return <ModuleRunner m={m} />
}

function ModuleRunner({ m }: { m: DeepModule }) {
  const t = useT()
  const navigate = useNavigate()
  const deep = useAssessment((s) => s.deep)
  const answer = useAssessment((s) => s.answerDeep)
  const pages = useMemo(() => Array.from({ length: Math.ceil(m.items.length / PER_PAGE) }, (_, i) => m.items.slice(i * PER_PAGE, (i + 1) * PER_PAGE)), [m])
  const firstOpen = Math.max(0, pages.findIndex((p) => p.some((it) => !deep[it.id])))
  const [page, setPage] = useState(firstOpen === -1 ? 0 : firstOpen)
  const refs = useRef<(HTMLDivElement | null)[]>([])
  const items = pages[page]
  const pageDone = items.every((it) => deep[it.id])
  const last = page === pages.length - 1
  const done = moduleDone(deep, m)

  // Each new page of items starts at the top (see TestPage for why it's instant).
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [page])

  return (
    <div className="mx-auto max-w-3xl">
      <Button variant="ghost" size="sm" icon={ArrowLeft} to="/deep">
        {t('โมดูลทั้งหมด', 'All modules')}
      </Button>
      <StickyBar className="my-4">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-medium">{t(m.name)}</span>
          <span className="tabular text-slate-500 dark:text-slate-400">
            {done}/{m.items.length}
          </span>
        </div>
        <Meter value={(done / m.items.length) * 100} color="#6d28d9" className="mt-2 h-1.5" />
      </StickyBar>

      <div key={page} className="animate-rise space-y-3">
        {items.map((it, i) => {
          const value = deep[it.id]
          return (
            <div key={it.id} ref={(el) => void (refs.current[i] = el)}>
              <Card className={cn('p-4 transition', value && 'opacity-70 hover:opacity-100')}>
                <p className="font-medium">{t(it.text)}</p>
                <div className="mt-3 grid grid-cols-6 gap-1.5" role="radiogroup" aria-label={t(it.text)}>
                  {LIKERT_SCALE.map((label, k) => {
                    const v = k + 1
                    const on = value === v
                    return (
                      <button
                        key={label.en}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        aria-label={t(label)}
                        onClick={() => {
                          answer(it.id, v)
                          const next = refs.current[i + 1]
                          if (next && !deep[items[i + 1]?.id]) window.setTimeout(() => next.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120)
                        }}
                        className={cn(
                          'h-9 rounded-lg border text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600',
                          on
                            ? v >= 4
                              ? 'border-violet-600 bg-violet-600 text-white'
                              : 'border-orange-500 bg-orange-500 text-white'
                            : 'border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400',
                        )}
                      >
                        {v}
                      </button>
                    )
                  })}
                </div>
                <div className="mt-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{t(LIKERT_SCALE[0])}</span>
                  <span>{t(LIKERT_SCALE[5])}</span>
                </div>
              </Card>
            </div>
          )
        })}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-slate-200/80 bg-white/95 px-4 pt-2.5 backdrop-blur sm:static sm:mt-8 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none dark:border-white/[0.08] dark:bg-[#0c0c10]/95 sm:dark:bg-transparent" style={{ paddingBottom: 'calc(0.625rem + env(safe-area-inset-bottom))' }}>
        <Button variant="ghost" icon={ArrowLeft} disabled={page === 0} onClick={() => setPage(page - 1)}>
          {t('ย้อนกลับ', 'Back')}
        </Button>
        <Button
          variant={last ? 'glow' : 'primary'}
          iconRight={last ? Check : ArrowRight}
          disabled={!pageDone}
          onClick={() => {
            if (last) navigate('/me#deep')
            else setPage(page + 1)
          }}
        >
          {last ? t('เสร็จแล้ว ดูผล', 'Done, see results') : t('ถัดไป', 'Next')}
        </Button>
      </div>
    </div>
  )
}
