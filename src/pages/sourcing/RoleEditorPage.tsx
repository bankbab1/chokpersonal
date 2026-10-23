import { AlertCircle, ArrowLeft, Check, ChevronDown, Plus, Save, Trash2, Users, Wand2, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { RoleCharacter } from '@/components/character/RoleCharacter'
import { Button } from '@/components/ui/Button'
import { Card, Eyebrow, Meter } from '@/components/ui/Card'
import { TEAMS } from '@/domain/demo'
import { DIMENSIONS, dimMeta } from '@/domain/dimensions'
import { ENVIRONMENTS, JOB_LINES, type Target } from '@/domain/fit'
import { CONTEXT_DIMS, MANAGER_TEMPLATES, ROLE_TYPE_IDS, roleTypeById, TEAM_TEMPLATES, type ContextDimId, type Range, type RoleTypeId, type RoleWeights } from '@/domain/roles'
import {
  blankRole, checkWeights, managerTemplateRange, pctToWeight, roleErrors, targetsFromTeamGaps, targetsFromTemplate, teamTemplateRange, todayIso, weightsFromType, weightToPct,
  type ManagerTemplateId, type RoleSpec, type TeamTemplateId,
} from '@/domain/sourcing'
import type { DimCode } from '@/domain/types'
import { cn } from '@/lib/cn'
import { tt, useT } from '@/lib/i18n'
import { useStaffPool } from '@/lib/useProfile'
import { useSourcing } from '@/store/sourcing'

const inputClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-base outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/15 sm:text-sm dark:border-white/10 dark:bg-white/5'

const STEPS_5 = Array.from({ length: 21 }, (_, i) => i * 5)

type Pcts = Partial<Record<RoleTypeId, string>>

const pctsOf = (w: RoleWeights): Pcts =>
  Object.fromEntries((Object.entries(w) as [RoleTypeId, number][]).map(([id, v]) => [id, String(weightToPct(v))])) as Pcts

/** Percent text → stored fractions. Blank or non-numeric stays NaN so the check can name it. */
const weightsOf = (p: Pcts): RoleWeights =>
  Object.fromEntries((Object.entries(p) as [RoleTypeId, string][]).map(([id, s]) => [id, s.trim() === '' ? NaN : pctToWeight(Number(s))])) as RoleWeights

export function RoleEditorPage() {
  const t = useT()
  const { id } = useParams()
  const navigate = useNavigate()
  const existing = useSourcing((s) => s.roles.find((r) => r.id === id))
  const upsert = useSourcing((s) => s.upsertRole)
  const remove = useSourcing((s) => s.removeRole)
  const [params] = useSearchParams()
  const staff = useStaffPool()
  // Opened from the Team map: start with that team and its blind spots as style notes.
  const [draft, setDraft] = useState<RoleSpec>(() => {
    if (existing) return structuredClone(existing)
    const teamId = params.get('team') ?? undefined
    const role = blankRole()
    if (!teamId) return role
    const tm = TEAMS.find((x) => x.id === teamId)
    return { ...role, teamId, title: tm ? t(`ตำแหน่งในทีม · ${tm.th}`, `Role in · ${tm.en}`) : '', targets: targetsFromTeamGaps(staff.filter((m) => m.team === teamId)) }
  })
  const [pcts, setPcts] = useState<Pcts>(() => pctsOf(draft.roleWeights))
  /** Set when weights were pre-filled from a type: the owner must confirm a review before saving. */
  const [needsReview, setNeedsReview] = useState(false)
  const [notesOpen, setNotesOpen] = useState(draft.targets.length > 0)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [tried, setTried] = useState(false)

  const set = (patch: Partial<RoleSpec>) => setDraft((d) => ({ ...d, ...patch }))
  const roleWeights = weightsOf(pcts)
  const full: RoleSpec = { ...draft, roleWeights }
  const wc = checkWeights(roleWeights)
  const errors = [...roleErrors(full), ...(needsReview ? [tt('ตรวจทานน้ำหนักที่เติมให้จากบทบาทตั้งต้น แล้วติ๊กยืนยัน', 'Review the weights pre-filled from a starting type, then tick to confirm')] : [])]
  const canSave = errors.length === 0
  const unusedTypes = ROLE_TYPE_IDS.filter((x) => !(x in pcts))

  const setRange = (dim: ContextDimId, r: Range | null) => {
    const next = { ...draft.contextRanges }
    if (r) next[dim] = r
    else delete next[dim]
    set({ contextRanges: next })
  }

  const save = () => {
    setTried(true)
    if (!canSave) return
    upsert({ ...full, title: draft.title.trim(), owner: draft.owner.trim() })
    navigate(`/sourcing/${draft.id}`)
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" icon={ArrowLeft} to="/sourcing">
        {t('ตำแหน่งทั้งหมด', 'All roles')}
      </Button>
      <div>
        <Eyebrow>{existing ? t('แก้ไขตำแหน่ง', 'Edit role') : t('ตำแหน่งใหม่', 'New role')}</Eyebrow>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t('หน้าที่และบริบทของตำแหน่ง', 'Duties and context of the role')}</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          {t('ข้อมูลนี้ใช้อธิบายตำแหน่งและชวนคุย ไม่ใช่เกณฑ์ให้คะแนนหรือจัดอันดับคน', 'This describes the role and guides conversations. It is not a rule for scoring or ranking people.')}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-5">
          <Card className="grid gap-4 sm:grid-cols-2">
            <Field label={t('ชื่อตำแหน่ง', 'Role title')} htmlFor="role-title" className="sm:col-span-2">
              <input id="role-title" value={draft.title} onChange={(e) => set({ title: e.target.value })} placeholder={t('เช่น ผู้จัดการสาขา', 'e.g. Branch manager')} className={inputClass} />
            </Field>
            <Field label={t('หน้าที่จริงของตำแหน่ง', 'Real duties of the role')} htmlFor="role-duties" className="sm:col-span-2">
              <textarea
                id="role-duties"
                value={draft.duties}
                onChange={(e) => set({ duties: e.target.value })}
                rows={3}
                placeholder={t('งานหลักที่ทำในแต่ละสัปดาห์ เช่น จัดตารางกะ ดูแลลูกค้า สอนงานพนักงานใหม่', 'The main work each week, e.g. scheduling shifts, looking after customers, training new staff')}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-base outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/15 sm:text-sm dark:border-white/10 dark:bg-white/5"
              />
            </Field>
            <Field label={t('ทีมที่จะเข้าไปร่วม', 'Team they will join')}>
              <Select value={draft.teamId ?? ''} onChange={(v) => set({ teamId: v || undefined })} options={[['', t('ไม่ระบุ', 'Not set')], ...TEAMS.map((x) => [x.id, t(x.th, x.en)] as [string, string])]} />
            </Field>
            <Field label={t('บันทึก (ไม่บังคับ)', 'Note (optional)')} htmlFor="role-note">
              <input id="role-note" value={draft.note ?? ''} onChange={(e) => set({ note: e.target.value })} placeholder={t('เช่น สาขาเปิดใหม่ ทีมยังไม่ครบ', 'e.g. new branch, team still forming')} className={inputClass} />
            </Field>
          </Card>

          <Card>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-semibold">{t('น้ำหนักหน้าที่ตามบทบาท', 'Duties as role weights')}</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {t('งานของตำแหน่งนี้ใช้บทบาทแบบไหนกี่เปอร์เซ็นต์ ต้องรวมได้ 100% พอดี', 'How much of this role’s work belongs to each role type. Must add up to exactly 100%')}
                </p>
              </div>
              <div className="w-56 max-w-full">
                <Select
                  value=""
                  onChange={(v) => {
                    if (!v) return
                    setPcts(pctsOf(weightsFromType(v as RoleTypeId)))
                    setNeedsReview(true)
                    set({ reviewedAt: null })
                  }}
                  options={[['', t('เริ่มจากบทบาทตั้งต้น…', 'Start from a type…')], ...ROLE_TYPE_IDS.map((x) => [x, t(roleTypeById(x).name)] as [string, string])]}
                />
              </div>
            </div>

            {Object.keys(pcts).length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 dark:border-white/15 dark:text-slate-400">
                {t('ยังไม่ได้ให้น้ำหนักหน้าที่ เพิ่มบทบาทด้านล่าง หรือเริ่มจากบทบาทตั้งต้น', 'Duties not weighted yet. Add role types below, or start from a type')}
              </p>
            ) : (
              <div className="mt-4 space-y-2">
                {(Object.keys(pcts) as RoleTypeId[]).map((tid) => {
                  const rt = roleTypeById(tid)
                  const inputId = `w-${tid}`
                  return (
                    <div key={tid} className="flex items-center gap-3 rounded-xl border border-slate-200 p-2 dark:border-white/10">
                      <RoleCharacter type={tid} size={36} showProp={false} />
                      <label htmlFor={inputId} className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{t(rt.name)}</span>
                        <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{t(rt.tasks)}</span>
                      </label>
                      <div className="flex items-center gap-1">
                        <input
                          id={inputId}
                          type="number"
                          inputMode="decimal"
                          min={0}
                          max={100}
                          step={5}
                          value={pcts[tid]}
                          onChange={(e) => setPcts({ ...pcts, [tid]: e.target.value })}
                          className="tabular h-9 w-20 rounded-lg border border-slate-200 bg-white px-2 text-right text-base outline-none focus:border-violet-400 sm:text-sm dark:border-white/10 dark:bg-white/5"
                        />
                        <span className="text-sm text-slate-500 dark:text-slate-400">%</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        iconOnly
                        icon={X}
                        onClick={() => {
                          const next = { ...pcts }
                          delete next[tid]
                          setPcts(next)
                        }}
                      >
                        {t(`เอา${rt.name.th}ออก`, `Remove ${rt.name.en}`)}
                      </Button>
                    </div>
                  )
                })}
              </div>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-3">
              {unusedTypes.length > 0 && (
                <div className="flex w-64 max-w-full items-center gap-2">
                  <Plus size={16} className="shrink-0 text-slate-400" />
                  <Select value="" onChange={(v) => v && setPcts({ ...pcts, [v]: '' })} options={[['', t('เพิ่มบทบาท…', 'Add a role type…')], ...unusedTypes.map((x) => [x, t(roleTypeById(x).name)] as [string, string])]} />
                </div>
              )}
              <div className={cn('ml-auto text-sm font-semibold tabular', wc.ok ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300')} aria-live="polite">
                {t('รวม', 'Total')} {wc.totalPct}% / 100%
              </div>
            </div>
            <Meter value={Math.min(100, wc.totalPct)} color={wc.ok ? '#059669' : '#d97706'} className="mt-2" />

            {needsReview && (
              <label className="mt-4 flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-violet-700"
                  checked={false}
                  onChange={() => {
                    setNeedsReview(false)
                    if (!draft.reviewedAt) set({ reviewedAt: todayIso() })
                  }}
                />
                {t('น้ำหนักนี้เป็นแค่จุดเริ่มต้น ฉันตรวจทานกับหน้าที่จริงของตำแหน่งแล้ว', 'These weights are only a starting point. I have checked them against the real duties')}
              </label>
            )}
          </Card>

          <Card>
            <h2 className="font-semibold">{t('ช่วงความชอบในการทำงานที่รับได้', 'Acceptable working-preference ranges')}</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('ใช้หาเรื่องที่ควรตกลงร่วมกัน ไม่ใช่เกณฑ์ตัดสิน เลือกเฉพาะมิติที่สำคัญกับตำแหน่งนี้', 'Used to find things worth agreeing, not to decide. Pick only the dimensions that matter for this role')}
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label={t('แบบหัวหน้า (เติมช่วงอิสระ)', 'Manager template (fills autonomy)')}>
                <Select
                  value={draft.managerTemplate ?? ''}
                  onChange={(v) => {
                    const id = (v || undefined) as ManagerTemplateId | undefined
                    setDraft((d) => ({ ...d, managerTemplate: id, contextRanges: id ? { ...d.contextRanges, autonomy: managerTemplateRange(id) } : d.contextRanges }))
                  }}
                  options={[['', t('ไม่ระบุ', 'Not set')], ...MANAGER_TEMPLATES.map((m) => [m.id, `${t(m.name)} · ${t(m.blurb)}`] as [string, string])]}
                />
              </Field>
              <Field label={t('แบบทีม (เติมช่วงการร่วมงาน)', 'Team template (fills collaboration)')}>
                <Select
                  value={draft.teamTemplate ?? ''}
                  onChange={(v) => {
                    const id = (v || undefined) as TeamTemplateId | undefined
                    setDraft((d) => ({ ...d, teamTemplate: id, contextRanges: id ? { ...d.contextRanges, collaboration: teamTemplateRange(id) } : d.contextRanges }))
                  }}
                  options={[['', t('ไม่ระบุ', 'Not set')], ...TEAM_TEMPLATES.map((m) => [m.id, `${t(m.name)} · ${t(m.blurb)}`] as [string, string])]}
                />
              </Field>
            </div>
            <div className="mt-4 space-y-2">
              {CONTEXT_DIMS.map((d) => {
                const r = draft.contextRanges[d.id]
                const bad = r && r.min > r.max
                return (
                  <div key={d.id} className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input type="checkbox" className="size-4 accent-violet-700" checked={Boolean(r)} onChange={(e) => setRange(d.id, e.target.checked ? { min: 35, max: 65 } : null)} />
                      {t(d.name)}
                      {r && <span className="tabular ml-auto text-xs text-slate-500 dark:text-slate-400">{r.min}–{r.max}</span>}
                    </label>
                    <div className="mt-1 flex justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>0 · {t(d.low)}</span>
                      <span className="text-right">{t(d.high)} · 100</span>
                    </div>
                    {r && (
                      <>
                        <div className="relative mt-2 h-2 rounded-full bg-slate-100 dark:bg-white/10">
                          {!bad && <div className="absolute inset-y-0 rounded-full bg-violet-600/40 dark:bg-violet-400/40" style={{ left: `${r.min}%`, width: `${Math.max(1, r.max - r.min)}%` }} />}
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <Select value={String(r.min)} onChange={(v) => setRange(d.id, { ...r, min: Number(v) })} options={STEPS_5.map((x) => [String(x), `${t('ต่ำสุด', 'Min')} ${x}`] as [string, string])} />
                          <Select value={String(r.max)} onChange={(v) => setRange(d.id, { ...r, max: Number(v) })} options={STEPS_5.map((x) => [String(x), `${t('สูงสุด', 'Max')} ${x}`] as [string, string])} />
                        </div>
                        {bad && <p className="mt-1 text-xs text-red-700 dark:text-red-300">{t('ต่ำสุดต้องไม่มากกว่าสูงสุด', 'Min must not be greater than max')}</p>}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>

          <Card className="grid gap-4 sm:grid-cols-2">
            <Field label={t('เจ้าของข้อมูลตำแหน่ง', 'Role owner')} htmlFor="role-owner">
              <input id="role-owner" value={draft.owner} onChange={(e) => set({ owner: e.target.value })} placeholder={t('เช่น ผู้จัดการเขต', 'e.g. Area manager')} className={inputClass} />
            </Field>
            <Field label={t('วันที่ทบทวน', 'Reviewed on')} htmlFor="role-reviewed">
              <input id="role-reviewed" type="date" value={draft.reviewedAt ?? ''} onChange={(e) => set({ reviewedAt: e.target.value || null })} className={inputClass} />
            </Field>
          </Card>

          <Card>
            <button type="button" onClick={() => setNotesOpen(!notesOpen)} aria-expanded={notesOpen} className="flex w-full items-center justify-between gap-2 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600">
              <span>
                <span className="block font-semibold">
                  {t('โน้ตสไตล์สำหรับการสัมภาษณ์ (ไม่บังคับ)', 'Style notes for the interview (optional)')} ({draft.targets.length})
                </span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">{t('ใช้เป็นหัวข้อชวนคุยเท่านั้น ไม่ใช้ให้คะแนน กรอง หรือเรียงคน', 'Conversation material only; never used to score, filter or sort people')}</span>
              </span>
              <ChevronDown size={18} className={cn('shrink-0 text-slate-400 transition', notesOpen && 'rotate-180')} />
            </button>
            {notesOpen && <StyleNotes draft={draft} set={set} />}
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <div className="text-sm font-semibold">{t('ก่อนบันทึก', 'Before saving')}</div>
            {errors.length === 0 ? (
              <p className="mt-2 flex items-center gap-2 text-sm text-emerald-700 dark:text-emerald-300">
                <Check size={16} /> {t('ข้อมูลครบ บันทึกได้', 'Complete, ready to save')}
              </p>
            ) : (
              <ul className={cn('mt-2 space-y-1.5 text-sm', tried ? 'text-red-700 dark:text-red-300' : 'text-slate-600 dark:text-slate-300')} role={tried ? 'alert' : undefined}>
                {errors.map((e) => (
                  <li key={e.en} className="flex gap-2">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" /> {t(e)}
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Button variant="primary" size="lg" className="w-full" icon={Save} onClick={save}>
            {t('บันทึกตำแหน่ง', 'Save role')}
          </Button>
          {existing && (
            <Button
              variant="ghost"
              className={cn('w-full', confirmDelete && 'text-red-700 dark:text-red-300')}
              icon={Trash2}
              onClick={() => {
                if (!confirmDelete) {
                  setConfirmDelete(true)
                  window.setTimeout(() => setConfirmDelete(false), 3000)
                  return
                }
                remove(existing.id)
                navigate('/sourcing')
              }}
            >
              {confirmDelete ? t('กดอีกครั้งเพื่อลบตำแหน่ง', 'Click again to delete') : t('ลบตำแหน่ง', 'Delete role')}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function StyleNotes({ draft, set }: { draft: RoleSpec; set: (p: Partial<RoleSpec>) => void }) {
  const t = useT()
  const staff = useStaffPool()
  const team = staff.filter((m) => draft.teamId && m.team === draft.teamId)
  const job = JOB_LINES.find((j) => j.id === draft.jobLine)
  const unused = DIMENSIONS.filter((d) => !draft.targets.some((x) => x.dim === d.code))
  const setTarget = (dim: DimCode, patch: Partial<Target>) => set({ targets: draft.targets.map((x) => (x.dim === dim ? { ...x, ...patch } : x)) })
  const mergeTargets = (incoming: Target[]) => set({ targets: [...draft.targets.filter((x) => !incoming.some((i) => i.dim === x.dim)), ...incoming] })
  return (
    <div className="mt-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t('สายงาน (เทมเพลตโน้ต)', 'Job area (note template)')}>
          <Select value={draft.jobLine ?? ''} onChange={(v) => set({ jobLine: v || undefined })} options={[['', t('กำหนดเอง', 'Custom')], ...JOB_LINES.map((j) => [j.id, t(j.th, j.en)] as [string, string])]} />
          {job?.examples && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{t('เช่น', 'e.g.')} {t(job.examples)}</p>}
        </Field>
        <Field label={t('สภาพแวดล้อม', 'Environment')}>
          <Select value={draft.env ?? ''} onChange={(v) => set({ env: v || undefined })} options={[['', t('ไม่ระบุ', 'Not set')], ...ENVIRONMENTS.map((e) => [e.id, t(e.th, e.en)] as [string, string])]} />
        </Field>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" icon={Wand2} disabled={!draft.jobLine} title={draft.jobLine ? undefined : t('เลือกสายงานก่อน', 'Choose a job area first')} onClick={() => mergeTargets(targetsFromTemplate(draft.jobLine, draft.env))}>
          {t('ใช้เทมเพลต', 'Use template')}
        </Button>
        <Button size="sm" icon={Users} disabled={!draft.teamId} title={draft.teamId ? undefined : t('เลือกทีมก่อน', 'Choose a team first')} onClick={() => mergeTargets(targetsFromTeamGaps(team))}>
          {t('หัวข้อที่ทีมยังไม่มี', 'What the team lacks')}
        </Button>
      </div>
      {draft.targets.length > 0 && (
        <div className="mt-4 space-y-3">
          {draft.targets.map((x) => (
            <NoteRow key={x.dim} tg={x} onChange={(p) => setTarget(x.dim, p)} onRemove={() => set({ targets: draft.targets.filter((y) => y.dim !== x.dim) })} />
          ))}
        </div>
      )}
      {unused.length > 0 && (
        <div className="mt-4 flex w-72 max-w-full items-center gap-2">
          <Plus size={16} className="shrink-0 text-slate-400" />
          <Select
            value=""
            onChange={(v) => v && set({ targets: [...draft.targets, { dim: v as DimCode, center: 70, half: 15, weight: 2 }] })}
            options={[['', t('เพิ่มหัวข้อ…', 'Add a topic…')], ...unused.map((d) => [d.code, t(d.th, d.en)] as [string, string])]}
          />
        </div>
      )}
    </div>
  )
}

function NoteRow({ tg, onChange, onRemove }: { tg: Target; onChange: (p: Partial<Target>) => void; onRemove: () => void }) {
  const t = useT()
  const meta = dimMeta(tg.dim)
  const name = t(meta.th, meta.en)
  const lo = Math.max(0, tg.center - tg.half)
  const hi = Math.min(100, tg.center + tg.half)
  return (
    <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold">{name}</div>
        <Button variant="ghost" size="sm" iconOnly icon={Trash2} onClick={onRemove}>
          {t(`ลบ${name}`, `Remove ${name}`)}
        </Button>
      </div>
      <div className="mt-1 flex justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
        <span>{t(meta.low)}</span>
        <span className="tabular shrink-0 font-medium text-slate-700 dark:text-slate-200">
          {lo}–{hi}
        </span>
        <span className="text-right">{t(meta.high)}</span>
      </div>
      <div className="relative mt-1.5 h-2 rounded-full bg-slate-100 dark:bg-white/10">
        <div className="absolute inset-y-0 rounded-full bg-violet-600/40 dark:bg-violet-400/40" style={{ left: `${lo}%`, width: `${hi - lo}%` }} />
      </div>
      <div className="mt-2 grid grid-cols-[1fr_auto] items-center gap-3">
        <input type="range" min={0} max={100} value={tg.center} onChange={(e) => onChange({ center: Number(e.target.value) })} className="w-full accent-violet-700" aria-label={t(`จุดกึ่งกลางของ${name}`, `Centre of ${name}`)} />
        <select
          value={tg.half}
          onChange={(e) => onChange({ half: Number(e.target.value) })}
          aria-label={t(`ความกว้างช่วงของ${name}`, `Range width of ${name}`)}
          className="h-10 rounded-lg border border-slate-200 bg-white px-2 text-base sm:h-8 sm:text-xs dark:border-white/10 dark:bg-slate-900"
        >
          {[10, 15, 20, 25, 30].map((h) => (
            <option key={h} value={h}>
              ±{h}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

function Field({ label, children, className, htmlFor }: { label: string; children: ReactNode; className?: string; htmlFor?: string }) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-slate-500 dark:text-slate-400">
        {label}
      </label>
      {children}
    </div>
  )
}

export function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: [string, string][]; label?: string }) {
  return (
    <div className="relative w-full min-w-0">
      <select
        value={value}
        aria-label={label}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full appearance-none truncate rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-base outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/15 sm:text-sm dark:border-white/10 dark:bg-slate-900"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  )
}
