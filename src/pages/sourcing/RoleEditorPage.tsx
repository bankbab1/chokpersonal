import { ArrowLeft, ChevronDown, Copy, Plus, Save, Sparkles, Trash2, Users, Wand2 } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { PersonaAvatar } from '@/components/character/PersonaAvatar'
import { Button } from '@/components/ui/Button'
import { Card, Eyebrow } from '@/components/ui/Card'
import { Sheet } from '@/components/ui/Sheet'
import { TEAMS } from '@/domain/demo'
import { DIMENSIONS, dimMeta } from '@/domain/dimensions'
import { ENVIRONMENTS, JOB_LINES, MANAGER_STYLES, type ManagerStyleId, type Target } from '@/domain/fit'
import { personaById } from '@/domain/personas'
import { blankRole, scoreCandidate, targetsFromBenchmarks, targetsFromTeamGaps, targetsFromTemplate, type RoleSpec } from '@/domain/sourcing'
import type { DimCode } from '@/domain/types'
import { cn } from '@/lib/cn'
import { tt, useT } from '@/lib/i18n'
import { useCandidatePool, useStaffPool } from '@/lib/useProfile'
import { useSourcing } from '@/store/sourcing'

const WEIGHTS = [
  { w: 3 as const, name: tt('จำเป็น', 'Must') },
  { w: 2 as const, name: tt('สำคัญ', 'Important') },
  { w: 1 as const, name: tt('มีก็ดี', 'Nice') },
]

const inputClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-base outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/15 sm:text-sm dark:border-white/10 dark:bg-white/5'

export function RoleEditorPage() {
  const t = useT()
  const { id } = useParams()
  const navigate = useNavigate()
  const existing = useSourcing((s) => s.roles.find((r) => r.id === id))
  const upsert = useSourcing((s) => s.upsertRole)
  const remove = useSourcing((s) => s.removeRole)
  const [params] = useSearchParams()
  const staff = useStaffPool()
  const pool = useCandidatePool()
  // Opened from the Team map: start with that team and its blind spots already filled in.
  const [draft, setDraft] = useState<RoleSpec>(() => {
    if (existing) return structuredClone(existing)
    const teamId = params.get('team') ?? undefined
    const role = blankRole()
    if (!teamId) return role
    const tm = TEAMS.find((x) => x.id === teamId)
    return { ...role, teamId, title: tm ? t(`ตำแหน่งเติมจุดบอด · ${tm.th}`, `Blind-spot hire · ${tm.en}`) : '', targets: targetsFromTeamGaps(staff.filter((m) => m.team === teamId)) }
  })
  const [benchOpen, setBenchOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const set = (patch: Partial<RoleSpec>) => setDraft((d) => ({ ...d, ...patch }))
  const setTarget = (dim: DimCode, patch: Partial<Target>) => set({ targets: draft.targets.map((x) => (x.dim === dim ? { ...x, ...patch } : x)) })
  const mergeTargets = (incoming: Target[]) => set({ targets: [...draft.targets.filter((x) => !incoming.some((i) => i.dim === x.dim)), ...incoming] })

  const team = staff.filter((m) => draft.teamId && m.team === draft.teamId)
  const preview = useMemo(() => pool.map((c) => ({ c, s: scoreCandidate(draft, c, team) })).sort((a, b) => b.s.overall - a.s.overall), [pool, draft, team])
  const strong = preview.filter((p) => p.s.overall >= 75).length
  const unused = DIMENSIONS.filter((d) => !draft.targets.some((x) => x.dim === d.code))
  const canSave = draft.title.trim().length > 0 && draft.targets.length > 0
  const job = JOB_LINES.find((j) => j.id === draft.jobLine)

  const save = () => {
    upsert({ ...draft, title: draft.title.trim() })
    navigate(`/sourcing/${draft.id}`)
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" icon={ArrowLeft} to="/sourcing">
        {t('ตำแหน่งทั้งหมด', 'All roles')}
      </Button>
      <div>
        <Eyebrow>{existing ? t('แก้ไขโปรไฟล์ตำแหน่ง', 'Edit role profile') : t('ตำแหน่งใหม่', 'New role')}</Eyebrow>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t('โปรไฟล์ที่ตำแหน่งนี้ต้องการ', 'What this role needs')}</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          <Card className="grid gap-4 sm:grid-cols-2">
            <Field label={t('ชื่อตำแหน่ง', 'Role title')} className="sm:col-span-2">
              <input value={draft.title} onChange={(e) => set({ title: e.target.value })} placeholder={t('เช่น ผู้จัดการสาขา', 'e.g. Branch manager')} className={inputClass} />
            </Field>
            <Field label={t('สายงาน (เทมเพลต)', 'Job area (template)')}>
              <Select value={draft.jobLine ?? ''} onChange={(v) => set({ jobLine: v || undefined })} options={[['', t('กำหนดเอง', 'Custom')], ...JOB_LINES.map((j) => [j.id, t(j.th, j.en)] as [string, string])]} />
              {job?.examples && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{t('เช่น', 'e.g.')} {t(job.examples)}</p>}
            </Field>
            <Field label={t('สภาพแวดล้อม', 'Environment')}>
              <Select value={draft.env ?? ''} onChange={(v) => set({ env: v || undefined })} options={[['', t('ไม่ระบุ', 'Not set')], ...ENVIRONMENTS.map((e) => [e.id, t(e.th, e.en)] as [string, string])]} />
            </Field>
            <Field label={t('สไตล์หัวหน้าของตำแหน่งนี้', "This role's manager style")}>
              <Select
                value={draft.managerStyle ?? ''}
                onChange={(v) => set({ managerStyle: (v || undefined) as ManagerStyleId | undefined })}
                options={[['', t('ไม่ระบุ', 'Not set')], ...MANAGER_STYLES.map((m) => [m.id, t(m.th, m.en)] as [string, string])]}
              />
            </Field>
            <Field label={t('ทีมที่จะเข้าไปร่วม', 'Team they will join')}>
              <Select value={draft.teamId ?? ''} onChange={(v) => set({ teamId: v || undefined })} options={[['', t('ไม่ระบุ', 'Not set')], ...TEAMS.map((x) => [x.id, t(x.th, x.en)] as [string, string])]} />
            </Field>
            <Field label={t('บันทึก (ไม่บังคับ)', 'Note (optional)')} className="sm:col-span-2">
              <input value={draft.note ?? ''} onChange={(e) => set({ note: e.target.value })} placeholder={t('บริบทของตำแหน่ง เช่น สาขาเปิดใหม่ ทีมยังไม่ครบ', 'Context, e.g. new branch, team still forming')} className={inputClass} />
            </Field>
          </Card>

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold">
                {t('มิติที่ต้องการ', 'Target dimensions')} ({draft.targets.length})
              </h2>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" icon={Wand2} disabled={!draft.jobLine} title={draft.jobLine ? undefined : t('เลือกสายงานก่อน', 'Choose a job area first')} onClick={() => mergeTargets(targetsFromTemplate(draft.jobLine, draft.env))}>
                  {t('ใช้เทมเพลต', 'Use template')}
                </Button>
                <Button size="sm" icon={Copy} onClick={() => setBenchOpen(true)}>
                  {t('โคลนจากคนเก่ง', 'Clone top performers')}
                </Button>
                <Button size="sm" icon={Users} disabled={!draft.teamId} title={draft.teamId ? undefined : t('เลือกทีมก่อน', 'Choose a team first')} onClick={() => mergeTargets(targetsFromTeamGaps(team))}>
                  {t('เติมจุดบอดทีม', 'Fill team gaps')}
                </Button>
              </div>
            </div>

            {draft.targets.length === 0 ? (
              <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-white/15 dark:text-slate-400">
                {t('เลือกสายงานแล้วกด “ใช้เทมเพลต” หรือ “โคลนจากคนเก่ง” เพื่อเริ่ม', 'Choose a job area and press “Use template”, or “Clone top performers”, to start')}
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {draft.targets.map((x) => (
                  <TargetRow key={x.dim} tg={x} onChange={(p) => setTarget(x.dim, p)} onRemove={() => set({ targets: draft.targets.filter((y) => y.dim !== x.dim) })} />
                ))}
              </div>
            )}

            {unused.length > 0 && (
              <div className="mt-4 flex items-center gap-2">
                <Plus size={16} className="text-slate-400" />
                <Select
                  value=""
                  onChange={(v) => v && set({ targets: [...draft.targets, { dim: v as DimCode, center: 70, half: 15, weight: 2 }] })}
                  options={[['', t('เพิ่มมิติ…', 'Add a dimension…')], ...unused.map((d) => [d.code, t(d.th, d.en)] as [string, string])]}
                />
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <div className="text-sm font-semibold">{t('ตัวอย่างผลลัพธ์', 'Preview')}</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="tabular text-3xl font-semibold">{strong}</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{t(`คนเหมาะ ≥ 75% จาก ${pool.length}`, `fit ≥ 75% of ${pool.length}`)}</span>
            </div>
            <div className="mt-4 space-y-2">
              {preview.slice(0, 4).map(({ c, s }) => (
                <div key={c.id} className="flex items-center gap-3">
                  <PersonaAvatar result={c.persona} size={36} showBadges={false} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">{c.name}</div>
                    <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {c.external ? `${t('ภายนอก', 'External')} · ${c.source ? t(c.source) : ''}` : t('พนักงานภายใน', 'Internal')} · {t(personaById(c.persona.personaId).th, personaById(c.persona.personaId).en)}
                    </div>
                  </div>
                  <span className="tabular text-sm font-semibold">{s.overall}%</span>
                </div>
              ))}
            </div>
          </Card>
          <Button variant="glow" size="lg" className="w-full" icon={Save} disabled={!canSave} title={canSave ? undefined : t('ใส่ชื่อตำแหน่งและอย่างน้อย 1 มิติ', 'Add a title and at least one dimension')} onClick={save}>
            {t('บันทึกและดู shortlist', 'Save and view shortlist')}
          </Button>
          {existing && (
            <Button
              variant="ghost"
              className={cn('w-full', confirmDelete && 'text-red-600 dark:text-red-400')}
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

      <BenchmarkSheet
        open={benchOpen}
        onClose={() => setBenchOpen(false)}
        defaultTeam={draft.teamId}
        onApply={(targets) => {
          mergeTargets(targets)
          setBenchOpen(false)
        }}
      />
    </div>
  )
}

function TargetRow({ tg, onChange, onRemove }: { tg: Target; onChange: (p: Partial<Target>) => void; onRemove: () => void }) {
  const t = useT()
  const meta = dimMeta(tg.dim)
  const name = t(meta.th, meta.en)
  const lo = Math.max(0, tg.center - tg.half)
  const hi = Math.min(100, tg.center + tg.half)
  return (
    <div className="rounded-2xl bg-slate-900/[0.03] p-3 dark:bg-white/[0.04]">
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm font-semibold">{name}</div>
        <div className="flex items-center gap-1">
          <div className="flex rounded-lg bg-slate-900/[0.05] p-0.5 dark:bg-white/[0.06]" role="radiogroup" aria-label={t(`ความสำคัญของ${name}`, `Importance of ${name}`)}>
            {WEIGHTS.map(({ w, name: wn }) => (
              <button
                key={w}
                type="button"
                role="radio"
                aria-checked={tg.weight === w}
                onClick={() => onChange({ weight: w })}
                className={cn(
                  'rounded-md px-2 py-1 text-[11px] font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600',
                  tg.weight === w ? 'bg-white shadow-sm dark:bg-white/20' : 'text-slate-500 dark:text-slate-400',
                )}
              >
                {t(wn)}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" iconOnly icon={Trash2} onClick={onRemove} aria-label={t(`ลบ${name}`, `Remove ${name}`)}>
            {t('ลบมิตินี้', 'Remove this dimension')}
          </Button>
        </div>
      </div>
      <div className="mt-2 flex justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
        <span>{t(meta.low)}</span>
        <span className="tabular shrink-0 font-medium text-slate-700 dark:text-slate-200">
          {t('ช่วงที่ต้องการ', 'Target range')} {lo}–{hi}
        </span>
        <span className="text-right">{t(meta.high)}</span>
      </div>
      <div className="relative mt-1.5 h-3 rounded-full bg-slate-900/[0.06] dark:bg-white/10">
        <div className="absolute inset-y-0 rounded-full bg-gradient-brand opacity-80" style={{ left: `${lo}%`, width: `${hi - lo}%` }} />
      </div>
      <div className="mt-2 grid grid-cols-[1fr_auto] items-center gap-3">
        <input type="range" min={0} max={100} value={tg.center} onChange={(e) => onChange({ center: Number(e.target.value) })} className="w-full accent-violet-600" aria-label={t(`จุดกึ่งกลางของ${name}`, `Centre of ${name}`)} />
        <select
          value={tg.half}
          onChange={(e) => onChange({ half: Number(e.target.value) })}
          aria-label={t(`ความกว้างช่วงของ${name}`, `Range width of ${name}`)}
          className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs dark:border-white/10 dark:bg-slate-900"
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

function BenchmarkSheet({ open, onClose, defaultTeam, onApply }: { open: boolean; onClose: () => void; defaultTeam?: string; onApply: (x: Target[]) => void }) {
  const t = useT()
  const staff = useStaffPool()
  const [teamId, setTeamId] = useState(defaultTeam ?? '')
  const [picked, setPicked] = useState<string[]>([])
  const list = staff.filter((m) => !teamId || m.team === teamId)
  const chosen = staff.filter((m) => picked.includes(m.id))
  const targets = targetsFromBenchmarks(chosen)
  return (
    <Sheet open={open} onClose={onClose} label={t('โคลนจากคนเก่ง', 'Clone top performers')}>
      <h2 className="pr-10 text-xl font-semibold">{t('โคลนโปรไฟล์จากคนเก่งตัวจริง', 'Clone the profile of your real top performers')}</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {t(
          'เลือกพนักงานที่ทำตำแหน่งนี้ได้ดีอย่างน้อย 2 คน ระบบจะหามิติที่พวกเขามีร่วมกันชัดเจน แล้วใช้เป็นโปรไฟล์ตำแหน่ง',
          'Pick at least 2 people who do this role well. Workfit finds the dimensions they clearly share and uses them as the role profile.',
        )}
      </p>
      <div className="mt-4">
        <Select value={teamId} onChange={setTeamId} options={[['', t('ทุกทีม', 'All teams')], ...TEAMS.map((x) => [x.id, t(x.th, x.en)] as [string, string])]} />
      </div>
      <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto sm:grid-cols-2">
        {list.map((m) => {
          const on = picked.includes(m.id)
          return (
            <label key={m.id} className={cn('flex cursor-pointer items-center gap-3 rounded-2xl border p-2 transition', on ? 'border-violet-500 bg-violet-500/10' : 'border-slate-200 dark:border-white/10')}>
              <input type="checkbox" className="sr-only" checked={on} onChange={() => setPicked(on ? picked.filter((x) => x !== m.id) : [...picked, m.id])} />
              <PersonaAvatar result={m.persona} size={36} showBadges={false} />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{m.name}</span>
                <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">{t(m.role)}</span>
              </span>
            </label>
          )
        })}
      </div>
      <div className="mt-4 rounded-2xl bg-slate-900/[0.04] p-3 text-sm dark:bg-white/[0.05]">
        {chosen.length < 2 ? (
          t('เลือกอย่างน้อย 2 คน', 'Pick at least 2 people')
        ) : targets.length === 0 ? (
          t('คนที่เลือกยังไม่มีจุดร่วมชัดเจน ลองเลือกคนที่ทำตำแหน่งเดียวกัน', 'These people share no clear traits; try people in the same role')
        ) : (
          <span>
            <Sparkles size={14} className="mr-1 inline text-violet-500" />
            {t('จุดร่วม', 'Shared')}: {targets.map((x) => `${t(dimMeta(x.dim).th, dimMeta(x.dim).en)} ${x.center}`).join(' · ')}
          </span>
        )}
      </div>
      <div className="mt-4 flex justify-end">
        <Button variant="primary" disabled={targets.length === 0} onClick={() => onApply(targets)}>
          {t(`ใช้เป็นโปรไฟล์ (${targets.length} มิติ)`, `Use as profile (${targets.length} dimensions)`)}
        </Button>
      </div>
    </Sheet>
  )
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</div>
      {children}
    </div>
  )
}

export function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-base outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/15 sm:text-sm dark:border-white/10 dark:bg-slate-900"
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
