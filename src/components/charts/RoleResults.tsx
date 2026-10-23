import { Check, ChevronDown, Compass, Download, Handshake, ListChecks, Sprout, Trash2, UserRoundCog } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { workfitCode } from '@/domain/code'
import { ROLE_ACTIVITY } from '@/domain/roleActivity'
import {
  band, CONTEXT_DIMS, compareContext, GROWTH_ROLES, itemsForType, jobFamiliesToExplore, MANAGER_TEMPLATES, MAPPING_VERSION, modifiersOf,
  MODEL_VERSION, QUESTION_SET_VERSION, REPORT_TEMPLATE_VERSION, ROLE_GROUPS, roleTypeById, suggestContext, TEAM_TEMPLATES, THRESHOLDS,
  toggleGrowthRole, type Classification, type ContextDimId, type RoleScores, type RoleTypeId,
} from '@/domain/roles'
import type { Scores } from '@/domain/types'
import { cn } from '@/lib/cn'
import { useT, type T } from '@/lib/i18n'
import { useAssessment } from '@/store/assessment'
import { useFun } from '@/store/fun'
import { PROP_ICONS } from '../character/RoleCharacter'
import { Button } from '../ui/Button'
import { Card, Chip } from '../ui/Card'
import { Sheet } from '../ui/Sheet'

export interface RoleResult {
  scores: RoleScores
  classification: Classification
}

export const STATE_LABEL: Record<Classification['state'], T> = {
  dominant: { th: 'บทบาทเด่นชัด', en: 'Clear standout role' },
  mixed: { th: 'สองบทบาทเด่นใกล้กัน', en: 'Two close standout roles' },
  no_dominant: { th: 'ยังไม่มีบทบาทเด่น', en: 'No standout role yet' },
}

export function SectionTitle({ icon: Icon, title, note }: { icon: typeof Compass; title: string; note?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
          <Icon size={16} />
        </span>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      {note && <span className="text-right text-xs text-slate-500 dark:text-slate-400">{note}</span>}
    </div>
  )
}

/* ------------------------------------- 12 role scores ------------------------------------- */

export function RoleScoresCard({ result }: { result: RoleResult }) {
  const t = useT()
  const roles = useAssessment((s) => s.roles)
  const [open, setOpen] = useState<string | null>(null)
  const c = result.classification
  return (
    <Card>
      <SectionTitle icon={Compass} title={t('งานที่คุณอยากทำมากขึ้น', 'Work you want more of')} note={t('12 บทบาท · 0–100 · ไม่ใช่ความเก่ง', '12 roles · 0–100 · not ability')} />
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {t(
          'แต่ละบทบาทคือค่าเฉลี่ยของคำตอบ 4 ข้อ แตะที่บทบาทเพื่อดูว่าคำนวณจากคำตอบไหน',
          'Each role is the average of 4 of your answers. Tap a role to see which answers it came from.',
        )}
      </p>
      <div className="mt-4 grid gap-x-8 gap-y-5 md:grid-cols-2">
        {ROLE_GROUPS.map((g) => (
          <div key={g.id}>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{t(g.name)}</div>
            <div className="mt-2 space-y-2">
              {g.types.map((id) => {
                const rt = roleTypeById(id)
                const v = result.scores[id]
                const mark = c.primary === id ? t('หลัก', 'primary') : c.secondary === id ? t('รอง', 'secondary') : null
                const expanded = open === id
                return (
                  <div key={id}>
                    <button
                      type="button"
                      aria-expanded={expanded}
                      onClick={() => setOpen(expanded ? null : id)}
                      className="flex w-full items-center gap-3 rounded-lg py-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600"
                    >
                      <RoleIcon type={id} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2 text-sm">
                          <span className={cn('truncate', mark && 'font-semibold')}>
                            {t(ROLE_ACTIVITY[id])}
                            {mark && <span className="ml-1.5 text-xs font-medium text-violet-700 dark:text-violet-300">· {mark}</span>}
                          </span>
                          <span className="tabular shrink-0 font-semibold">{v}</span>
                        </span>
                        <span className="relative mt-1 block h-1.5 rounded-full bg-slate-100 dark:bg-white/[0.08]">
                          <span className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${Math.max(2, v)}%`, background: rt.color }} />
                          <span className="absolute inset-y-[-3px] w-px bg-slate-400/60" style={{ left: `${THRESHOLDS.minimumInterest}%` }} aria-hidden />
                        </span>
                      </span>
                      <ChevronDown size={14} className={cn('shrink-0 text-slate-400 transition', expanded && 'rotate-180')} />
                    </button>
                    {expanded && (
                      <ul className="mb-2 ml-12 mt-1 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                        {itemsForType(id).map((q) => {
                          const o = q.options.find((x) => x.id === roles[q.id])
                          return (
                            <li key={q.id} className="rounded-md bg-slate-50 px-2 py-1.5 dark:bg-white/[0.04]">
                              <span className="text-slate-500 dark:text-slate-400">{t(q.prompt)}</span>
                              <span className="block font-medium">
                                → {o ? `${o.side ? (o.strong ? t('แน่นอน: ', 'Definitely: ') : t('ค่อนไปทาง: ', 'Leaning: ')) : ''}${t(o.text)}` : '—'} <span className="tabular text-slate-400">({o?.score ?? '—'})</span>
                              </span>
                            </li>
                          )
                        })}
                        <li className="tabular px-2 text-slate-500 dark:text-slate-400">
                          {t(`เฉลี่ย ${v}`, `Average ${v}`)}
                        </li>
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        {t(
          `เส้นตั้ง = 50 · บทบาทเด่นต้องได้อย่างน้อย ${THRESHOLDS.minimumInterest} และห่างจากอันดับสองอย่างน้อย ${THRESHOLDS.mixedGapLt} คะแนน (เกณฑ์ทดลอง)`,
          `Tick = 50 · A standout role needs at least ${THRESHOLDS.minimumInterest} and a ${THRESHOLDS.mixedGapLt}-point lead over the next (experimental cut-offs)`,
        )}
      </p>
    </Card>
  )
}

/* ------------------------------------ Job families & type detail ------------------------------------ */

export function ExploreCard({ result }: { result: RoleResult }) {
  const t = useT()
  const { roles, families } = jobFamiliesToExplore(result.classification)
  const primary = result.classification.primary ? roleTypeById(result.classification.primary) : null
  return (
    <Card>
      <SectionTitle icon={ListChecks} title={t('งานที่น่าสำรวจ', 'Work worth exploring')} note={t('จากบทบาทที่สนใจ', 'from your role interests')} />
      {roles.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
          {t(
            'เมื่อยังไม่มีบทบาทเด่น เราจะไม่เดาสายงานให้ ลองเลือกบทบาทที่คะแนนสูงในรายการด้านบนแล้วอ่านรายละเอียด หรือคุยกับหัวหน้าว่าอยากลองงานแบบไหน',
            'With no standout role we don’t guess job families for you. Pick high-scoring roles above to read about, or talk with your manager about what you would like to try.',
          )}
        </p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            {families.map((f) => (
              <span key={f.family} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm dark:border-white/10">
                {f.family}
                <span className="ml-1.5 text-xs text-slate-500 dark:text-slate-400">· {f.from.map((id) => t(roleTypeById(id).name)).join(', ')}</span>
              </span>
            ))}
          </div>
          <div className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">{t('ทักษะที่ควรตรวจเพิ่มจากผลงานจริง', 'Skills to check with real work')}</div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {[...new Map(roles.flatMap((id) => roleTypeById(id).skills).map((s) => [s.en, s])).values()].map((s) => (
              <Chip key={s.en}>{t(s)}</Chip>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {t('นี่คือพื้นที่ให้สำรวจ ไม่ได้แปลว่าคุณมีทักษะเหล่านี้แล้ว', 'These are areas to explore. They do not mean you already have these skills.')}
          </p>
        </>
      )}
      {primary && (
        <div className="mt-5 grid gap-3 border-t border-slate-200/80 pt-4 text-sm sm:grid-cols-3 dark:border-white/[0.08]">
          {[
            { k: t('วันที่ดีที่สุด', 'Your best day'), v: primary.bestDay },
            { k: t('เมื่อมากไป', 'When overdone'), v: primary.overdone },
            { k: t('ทำงานกับฉันอย่างไร', 'How to work with me'), v: primary.workWithMe },
          ].map((x) => (
            <div key={x.k}>
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{x.k}</div>
              <p className="mt-1">{t(x.v)}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

/* ------------------------------------ Working preferences ------------------------------------ */

const BAND_LABEL: Record<ReturnType<typeof band>, T> = {
  low: { th: 'ต่ำ', en: 'low' },
  middle: { th: 'กลาง', en: 'middle' },
  high: { th: 'สูง', en: 'high' },
  unknown: { th: 'ยังไม่มีข้อมูล', en: 'no data yet' },
}

export function ContextCard({ scores }: { scores: Scores }) {
  const t = useT()
  const context = useAssessment((s) => s.context)
  const setContext = useAssessment((s) => s.setContext)
  const growth = useAssessment((s) => s.growthRoles)
  const setGrowth = useAssessment((s) => s.setGrowthRoles)
  const suggested = useMemo(() => suggestContext(scores), [scores])
  const confirmedCount = CONTEXT_DIMS.filter((d) => context[d.id].confirmed).length

  return (
    <Card id="context">
      <SectionTitle icon={UserRoundCog} title={t('บริบทที่คุณต้องการ', 'The context you want')} note={t(`ยืนยันแล้ว ${confirmedCount}/6`, `${confirmedCount}/6 confirmed`)} />
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {t(
          'เมื่อเลือกได้ คุณอยากทำงานแบบไหน เราเติมค่าเริ่มต้นจากคำตอบของคุณไว้ให้ ปรับแล้วกดยืนยัน หรือเลือก “ยังไม่แน่ใจ” ค่าที่ยังไม่ยืนยันจะไม่ถูกนำไปใช้ที่ไหนเลย',
          'When you can choose, how do you want to work? We pre-filled a starting point from your answers. Adjust and confirm, or choose “not sure yet”. Unconfirmed values are never used anywhere.',
        )}
      </p>
      <div className="mt-5 space-y-5">
        {CONTEXT_DIMS.map((d) => {
          const cur = context[d.id]
          const value = cur.value ?? suggested[d.id]
          const b = band(cur)
          return (
            <ContextRow
              key={d.id}
              id={d.id}
              name={t(d.name)}
              low={t(d.low)}
              high={t(d.high)}
              value={value}
              confirmed={cur.confirmed}
              bandLabel={t(BAND_LABEL[b])}
              onChange={(v) => setContext(d.id, v, false)}
              onConfirm={() => setContext(d.id, value, true)}
              onUnsure={() => setContext(d.id, null, false)}
            />
          )
        })}
      </div>

      <div className="mt-6 border-t border-slate-200/80 pt-5 dark:border-white/[0.08]">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sprout size={16} className="text-violet-700 dark:text-violet-300" /> {t('บทบาทที่อยากเติบโต', 'Where you want to grow')}
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {t('เลือกได้หลายข้อ เป็นความสมัครใจของคุณ ไม่ได้มาจากผลแบบประเมิน', 'Choose any. This is your own choice, not something the test decides.')}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {GROWTH_ROLES.map((g) => {
            const on = growth.includes(g.id)
            return (
              <button
                key={g.id}
                type="button"
                aria-pressed={on}
                onClick={() => setGrowth(toggleGrowthRole(growth, g.id))}
                className={cn(
                  'rounded-xl border px-3 py-2 text-left text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600',
                  on ? 'border-violet-700 bg-violet-50 dark:border-violet-500 dark:bg-violet-500/15' : 'border-slate-200 hover:border-slate-300 dark:hover:border-white/25 dark:border-white/10',
                )}
              >
                <span className="block font-medium">{t(g.name)}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">{t(g.blurb)}</span>
              </button>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

function ContextRow(p: {
  id: ContextDimId
  name: string
  low: string
  high: string
  value: number
  confirmed: boolean
  bandLabel: string
  onChange: (v: number) => void
  onConfirm: () => void
  onUnsure: () => void
}) {
  const t = useT()
  const inputId = `ctx-${p.id}`
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor={inputId} className="text-sm font-medium">
          {p.name}
        </label>
        <span className={cn('text-xs', p.confirmed ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400')}>
          {p.confirmed ? `✓ ${t('ยืนยันแล้ว', 'Confirmed')} · ${p.value} · ${p.bandLabel}` : t('ยังไม่ยืนยัน · ค่าเริ่มต้นจากคำตอบ', 'Not confirmed · suggested from your answers')}
        </span>
      </div>
      <input
        id={inputId}
        type="range"
        min={0}
        max={100}
        step={5}
        value={p.value}
        onChange={(e) => p.onChange(Number(e.target.value))}
        className={cn('mt-2 w-full accent-violet-700', !p.confirmed && 'opacity-60')}
        aria-valuetext={`${p.value}`}
      />
      <div className="flex justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span>{p.low}</span>
        <span className="text-right">{p.high}</span>
      </div>
      {!p.confirmed && (
        <div className="mt-2 flex gap-2">
          <Button size="sm" variant="secondary" icon={Check} onClick={p.onConfirm}>
            {t('ยืนยันค่านี้', 'Confirm')}
          </Button>
          <Button size="sm" variant="ghost" onClick={p.onUnsure}>
            {t('ยังไม่แน่ใจ', 'Not sure yet')}
          </Button>
        </div>
      )}
      {p.confirmed && (
        <button type="button" className="mt-1 text-xs text-slate-500 underline-offset-2 hover:underline dark:text-slate-400" onClick={p.onUnsure}>
          {t('ยกเลิกการยืนยัน', 'Undo confirmation')}
        </button>
      )}
    </div>
  )
}

/* --------------------------------- Manager & team conversation --------------------------------- */

export function ManagerTeamCard({ result }: { result: RoleResult | null }) {
  const t = useT()
  const context = useAssessment((s) => s.context)
  const primary = result?.classification.primary ? roleTypeById(result.classification.primary) : null
  const rows = [
    ...MANAGER_TEMPLATES.map((m) => ({ key: m.id, name: m.name, blurb: m.blurb, gap: compareContext(context, { autonomy: { min: m.anchor, max: m.anchor } })[0] })),
    ...TEAM_TEMPLATES.map((m) => ({ key: m.id, name: m.name, blurb: m.blurb, gap: compareContext(context, { collaboration: { min: m.anchor, max: m.anchor } })[0] })),
  ]
  return (
    <Card>
      <SectionTitle icon={Handshake} title={t('หัวหน้าและทีม: ประเด็นที่ควรคุย', 'Manager & team: what to talk about')} />
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {t(
          'เทียบบริบทที่คุณยืนยันกับแม่แบบหัวหน้าและทีม ไม่ใช่คะแนนความเหมาะ แต่บอกว่าเรื่องไหนใกล้กัน และเรื่องไหนควรตกลงร่วมกัน',
          'Your confirmed context compared with manager and team templates. Not a fit score — it shows what is close and what is worth agreeing together.',
        )}
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.key} className="rounded-lg border border-slate-200/80 p-3 text-sm dark:border-white/[0.08]">
            <div className="font-medium">{t(r.name)}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{t(r.blurb)}</div>
            <div className="mt-1.5 text-xs">
              {r.gap.distance === null ? (
                <span className="text-slate-500 dark:text-slate-400">{t('ยังไม่มีข้อมูล · ยืนยันบริบทก่อน', 'No data yet · confirm your context first')}</span>
              ) : r.gap.discuss ? (
                <span className="font-medium text-amber-700 dark:text-amber-300">{t(`ห่างกัน ${r.gap.distance} · ควรตกลงร่วมกัน`, `${r.gap.distance} apart · worth agreeing together`)}</span>
              ) : (
                <span className="text-emerald-700 dark:text-emerald-400">{t(`ห่างกัน ${r.gap.distance} · ใกล้กัน ยืนยันกับงานจริง`, `${r.gap.distance} apart · close, check with the real job`)}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      {primary && (
        <div className="mt-4 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2 dark:bg-white/[0.04]">
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('คำถามชวนคุยกับหัวหน้า', 'A question for your manager')}</div>
            <p className="mt-1">{t(primary.context)}</p>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{t('สิ่งที่ควรตกลงร่วมกัน', 'Worth agreeing together')}</div>
            <p className="mt-1">{t(primary.agreement)}</p>
          </div>
        </div>
      )}
    </Card>
  )
}

/* ---------------------------------------- My data ---------------------------------------- */

export function MyDataCard({ result, scores }: { result: RoleResult | null; scores: Scores }) {
  const t = useT()
  const navigate = useNavigate()
  const st = useAssessment()
  const birth = useFun((s) => s.birth)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const download = () => {
    const c = result?.classification
    const payload = {
      exported_at: new Date().toISOString(),
      assessment_model_version: MODEL_VERSION,
      question_set_version: QUESTION_SET_VERSION,
      mapping_version: MAPPING_VERSION,
      report_template_version: REPORT_TEMPLATE_VERSION,
      completed_at: st.completedAt ?? null,
      model_notice: 'experimental_role_interests_not_ability',
      visibility: 'private',
      display_name: st.name || null,
      classification: c
        ? { state: c.state, primary_type_id: c.primary, secondary_type_id: c.secondary, top_gap: c.gap, spread: c.spread, thresholds: { minimum_interest: THRESHOLDS.minimumInterest, mixed_gap_lt: THRESHOLDS.mixedGapLt, flat_spread_lt: THRESHOLDS.flatSpreadLt } }
        : null,
      role_scores: result?.scores ?? null,
      preferred_context: st.context,
      modifiers: modifiersOf(st.context).map((m) => `${m.axis}_${m.band}`),
      desired_growth_roles: st.growthRoles,
      work_style: { workfit_code: workfitCode(scores).code, dimensions: scores },
      answers: { roles: st.roles, style: st.answers, deep: st.deep },
      peer_ratings: st.peerRatings.length,
      consent: st.consent,
      unclear_questions: st.unclear,
      birth_date_for_fun: birth ?? null,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `workfit-my-data-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <SectionTitle icon={Download} title={t('ข้อมูลของฉัน', 'My data')} note={t('เก็บบนเครื่องนี้เท่านั้น', 'kept on this device only')} />
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {t(
          'ดาวน์โหลดข้อมูลทั้งหมดของคุณเป็นไฟล์ JSON (มีเวอร์ชันโมเดล) หรือลบทุกอย่างออกจากเครื่องนี้ ผลเป็นส่วนตัวโดยค่าเริ่มต้น',
          'Download all your data as a JSON file (with model versions), or delete everything from this device. Results are private by default.',
        )}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button icon={Download} onClick={download}>
          {t('ดาวน์โหลด JSON', 'Download JSON')}
        </Button>
        <Button variant="ghost" icon={Trash2} className="text-red-600 dark:text-red-400" onClick={() => setConfirmDelete(true)}>
          {t('ลบข้อมูลทั้งหมด', 'Delete all my data')}
        </Button>
      </div>
      <Sheet open={confirmDelete} onClose={() => setConfirmDelete(false)} label={t('ยืนยันการลบข้อมูล', 'Confirm deletion')}>
        <h2 className="pr-10 text-xl font-semibold">{t('ลบข้อมูลทั้งหมดของคุณ?', 'Delete all your data?')}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t('สิ่งที่จะถูกลบจากเครื่องนี้:', 'This removes from this device:')}</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
          <li>{t('คำตอบทั้ง 4 ส่วน และโมดูลเจาะลึก', 'Answers to all 4 parts and the deep modules')}</li>
          <li>{t('ผลลัพธ์ บริบทที่ยืนยัน และบทบาทที่อยากเติบโต', 'Results, confirmed context and growth roles')}</li>
          <li>{t(`คำตอบจากคนรอบตัว ${st.peerRatings.length} รายการ`, `${st.peerRatings.length} peer rating(s)`)}</li>
          <li>{t('ชื่อ ความยินยอม และวันเกิด (ถ้ามี)', 'Name, consent and birth date (if any)')}</li>
        </ul>
        <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
          {t('ไฟล์ที่คุณดาวน์โหลดหรือแชร์ไปแล้วจะไม่ถูกลบ ย้อนกลับไม่ได้', 'Files you already downloaded or shared are not affected. This cannot be undone.')}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
            {t('ยกเลิก', 'Cancel')}
          </Button>
          <Button
            variant="primary"
            icon={Trash2}
            className="bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
            onClick={() => {
              st.deleteAll()
              setConfirmDelete(false)
              navigate('/')
            }}
          >
            {t('ลบทั้งหมด', 'Delete everything')}
          </Button>
        </div>
      </Sheet>
    </Card>
  )
}

/** A role interest as an activity icon (not a person), so it never reads as one of the 16 characters. */
export function RoleIcon({ type, size = 36 }: { type: RoleTypeId; size?: number }) {
  const rt = roleTypeById(type)
  const Icon = PROP_ICONS[rt.prop]
  return (
    <span className="grid shrink-0 place-items-center rounded-xl" style={{ width: size, height: size, background: `${rt.color}1f`, color: rt.color }} aria-hidden>
      <Icon size={size * 0.5} strokeWidth={2} />
    </span>
  )
}
