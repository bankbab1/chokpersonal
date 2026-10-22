import { ArrowRight, Flame, GitCompareArrows, Lightbulb, Sprout, Target } from 'lucide-react'
import { dimMeta } from '@/domain/dimensions'
import { deepProfile, MOTIVATORS, PRESSURE_RISKS, TOTAL_ASPECTS } from '@/domain/deep'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { DepthMeter } from '@/pages/DeepPage'
import { useAssessment } from '@/store/assessment'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

const RISK_COLOR = { low: '#94a3b8', watch: '#f59e0b', high: '#ea580c' } as const

function Title({ icon: Icon, children, note }: { icon: typeof Flame; children: string; note?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
          <Icon size={16} />
        </span>
        <h2 className="text-base font-semibold">{children}</h2>
      </div>
      {note && <span className="text-right text-xs text-slate-500 dark:text-slate-400">{note}</span>}
    </div>
  )
}

export function DeepResults() {
  const t = useT()
  const deep = useAssessment((s) => s.deep)
  const p = deepProfile(deep)

  if (p.measured === 18)
    return (
      <Card id="deep" className="flex flex-col gap-4 overflow-hidden sm:flex-row sm:items-center">
        <div className="absolute inset-0 bg-gradient-brand opacity-[0.06]" />
        <div className="relative flex-1">
          <div className="text-xl font-semibold">{t(`ไปให้ลึกกว่า 18 มิติ → ${TOTAL_ASPECTS} ด้าน`, `Go deeper: 18 → ${TOTAL_ASPECTS} aspects`)}</div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {t(
              'รู้ว่าอะไรทำให้คุณอยากทำงานและอยู่ต่อ จุดแข็งที่อาจกลายเป็นปัญหาเมื่อเครียด และรายละเอียดของทุกมิติ ทำทีละโมดูล 1–5 นาที',
              'Find out what keeps you motivated, which strengths overdo under stress, and the detail inside every dimension. One module at a time, 1–5 minutes each.',
            )}
          </p>
        </div>
        <Button className="relative" variant="glow" to="/deep" iconRight={ArrowRight}>
          {t('เริ่มเจาะลึก', 'Start the deep dive')}
        </Button>
      </Card>
    )

  const top = p.motivators.slice(0, 3)
  const missing = {
    motivators: p.motivators.length < MOTIVATORS.length,
    risks: p.risks.length < PRESSURE_RISKS.length,
  }

  return (
    <div id="deep" className="space-y-5">
      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex-1">
          <DepthMeter compact />
        </div>
        <Button size="sm" to="/deep" iconRight={ArrowRight}>
          {t('โมดูลเจาะลึกทั้งหมด', 'All deep modules')}
        </Button>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <Title icon={Target} note={missing.motivators ? t('ยังทำไม่ครบ', 'incomplete') : undefined}>
            {t('แรงจูงใจของคุณ', 'What drives you')}
          </Title>
          {p.motivators.length === 0 ? (
            <ModuleCta to="/deep/motivators" />
          ) : (
            <>
              <div className="mt-4 space-y-2">
                {p.motivators.map(({ m, score }, i) => (
                  <div key={m.id} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3 text-sm">
                    <span className={cn('truncate', i < 3 && 'font-semibold')}>{t(m.name)}</span>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-900/[0.06] dark:bg-white/10">
                      <div className="h-full rounded-full" style={{ width: `${score}%`, background: i < 3 ? '#7c3aed' : '#c4b5fd' }} />
                    </div>
                    <span className="tabular text-right text-xs text-slate-500 dark:text-slate-400">{score}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {top.map(({ m }) => (
                  <p key={m.id} className="rounded-2xl bg-violet-500/[0.07] px-3 py-2 text-xs">
                    <span className="font-semibold">{t(m.name)}:</span> {t(m.keep)}
                  </p>
                ))}
              </div>
            </>
          )}
        </Card>

        <Card>
          <Title icon={Flame} note={missing.risks ? t('ยังทำไม่ครบ', 'incomplete') : undefined}>
            {t('เมื่อกดดัน จุดแข็งอาจกลายเป็น…', 'Under pressure, strengths can become…')}
          </Title>
          {p.risks.length === 0 ? (
            <ModuleCta to="/deep/pressure" />
          ) : (
            <>
              <div className="mt-4 space-y-2">
                {p.risks.map(({ r, score, level }) => (
                  <div key={r.id} className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3 text-sm">
                    <span className={cn('truncate', level !== 'low' && 'font-semibold')}>{t(r.name)}</span>
                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-900/[0.06] dark:bg-white/10">
                      <div className="h-full rounded-full" style={{ width: `${score}%`, background: RISK_COLOR[level] }} />
                    </div>
                    <span className="tabular text-right text-xs text-slate-500 dark:text-slate-400">{score}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2">
                {p.risks
                  .filter((x) => x.level !== 'low')
                  .slice(0, 2)
                  .map(({ r, level }) => (
                    <div key={r.id} className={cn('rounded-2xl border p-3 text-xs', level === 'high' ? 'border-orange-300/70 bg-orange-50/70 dark:border-orange-400/30 dark:bg-orange-400/10' : 'border-amber-200/70 bg-amber-50/60 dark:border-amber-400/20 dark:bg-amber-400/5')}>
                      <div className="text-sm font-semibold">{t(r.name)}</div>
                      <p className="mt-1 text-slate-600 dark:text-slate-300">
                        {t('มาจากจุดแข็ง:', 'Grows from:')} {t(r.from)} · {t(r.looks)}
                      </p>
                      <p className="mt-1 font-medium">→ {t(r.helps)}</p>
                    </div>
                  ))}
                {p.risks.every((x) => x.level === 'low') && (
                  <p className="text-sm text-slate-600 dark:text-slate-300">{t('ไม่มีความเสี่ยงเด่นเมื่อกดดัน', 'No standout under-pressure risks')}</p>
                )}
              </div>
            </>
          )}
        </Card>

        <Card>
          <Title icon={GitCompareArrows}>{t('มิติเดียวกัน แต่ต่างตามสถานการณ์', 'Same trait, different by situation')}</Title>
          {Object.keys(p.facets).length === 0 ? (
            <ModuleCta to="/deep/facets-thai" />
          ) : p.splits.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
              {t('ด้านย่อยในแต่ละมิติของคุณค่อนข้างสม่ำเสมอ', 'The facets within each of your dimensions are fairly consistent')}
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {p.splits.slice(0, 4).map((sp) => {
                const d = dimMeta(sp.dim)
                return (
                  <div key={sp.dim} className="rounded-2xl bg-slate-900/[0.03] p-3 text-sm dark:bg-white/[0.04]">
                    <div className="font-semibold">{t(d.th, d.en)}</div>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
                      {t(sp.high.name)} <b className="tabular">{p.facets[sp.high.id]}</b> {t('แต่', 'but')} {t(sp.low.name)} <b className="tabular">{p.facets[sp.low.id]}</b>
                    </p>
                  </div>
                )
              })}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t('ความต่างเหล่านี้คือสิ่งที่ label เดียวมองไม่เห็น', 'These differences are what a single label can never show')}
              </p>
            </div>
          )}
        </Card>

        <Card>
          <Title icon={Sprout}>{t('ความไวในการเรียนรู้', 'Learning agility')}</Title>
          {p.agility === undefined ? (
            <ModuleCta to="/deep/agility" />
          ) : (
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="tabular text-4xl font-semibold">{p.agility}</span>
                <span className="text-sm text-slate-500 dark:text-slate-400">/100</span>
              </div>
              <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-900/[0.06] dark:bg-white/10">
                <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${p.agility}%` }} />
              </div>
              <p className="mt-3 flex gap-2 text-sm text-slate-600 dark:text-slate-300">
                <Lightbulb size={16} className="mt-0.5 shrink-0 text-amber-500" />
                {p.agility >= 65
                  ? t('คุณเรียนรู้และปรับตัวได้เร็ว เหมาะกับงานใหม่ โปรเจกต์บุกเบิก และการเตรียมเป็นหัวหน้า', 'You learn and adapt fast: great for new roles, pioneering projects and leadership tracks')
                  : p.agility >= 40
                    ? t('คุณเรียนรู้ได้ดีเมื่อมีเวลาและตัวอย่าง ลองขอ feedback สั้น ๆ หลังงานสำคัญทุกครั้ง', 'You learn well with time and examples. Try asking for quick feedback after every important task')
                    : t('คุณชอบวิธีที่คุ้นเคย ลองตั้งเป้าเรียนรู้ทักษะใหม่ 1 อย่างต่อไตรมาส', 'You prefer familiar ways. Try setting one new skill to learn each quarter')}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function ModuleCta({ to }: { to: string }) {
  const t = useT()
  return (
    <div className="mt-4 rounded-2xl border border-dashed border-slate-300 p-4 text-center dark:border-white/15">
      <p className="text-sm text-slate-500 dark:text-slate-400">{t('ยังไม่ได้ทำโมดูลนี้', "You haven't done this module yet")}</p>
      <Button className="mt-2" size="sm" variant="primary" to={to} iconRight={ArrowRight}>
        {t('ทำตอนนี้', 'Do it now')}
      </Button>
    </div>
  )
}
