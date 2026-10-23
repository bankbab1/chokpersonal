import { ArrowLeft, Check, ChevronRight, ClipboardList, Copy, Gem, Info, Link2, MessageCircleQuestion, Pencil, SlidersHorizontal, X } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { useParams } from 'react-router'
import { WorkfitIdCard } from '@/components/charts/WorkfitIdCard'
import { CodeCharacter, RoleCharacter } from '@/components/character/RoleCharacter'
import { workfitCode } from '@/domain/code'
import { ROLE_ACTIVITY } from '@/domain/roleActivity'
import type { Scores } from '@/domain/types'
import { Button } from '@/components/ui/Button'
import { Card, Chip, Eyebrow, Meter } from '@/components/ui/Card'
import { Sheet } from '@/components/ui/Sheet'
import { TEAMS } from '@/domain/demo'
import {
  band, CONTEXT_DIMS, confirmedValue, GROWTH_ROLES, MANAGER_TEMPLATES, ROLE_TYPE_IDS, roleTypeById, TEAM_TEMPLATES,
  type Band, type Classification, type ContextDimId, type ContextGap, type GrowthRole,
} from '@/domain/roles'
import {
  activeFilterCount, appliedAtOf, checkWeights, COMPARE_MAX, COMPARE_MIN, describeCandidate, emptyFilters, matchesFilters, sortCandidates, STAGES, toggleCompare, toggleIn, weightedTypes, weightToPct,
  type Candidate, type CandidateFilters, type CandidateView, type RoleSpec, type SortBy, type Stage, type StageEntry,
} from '@/domain/sourcing'
import { cn } from '@/lib/cn'
import { tt, useT, type T } from '@/lib/i18n'
import { useCandidatePool } from '@/lib/useProfile'
import { pipelineKey, useSourcing } from '@/store/sourcing'
import { NotFound } from '../NotFound'
import { Select } from './RoleEditorPage'

type Scope = 'all' | 'internal' | 'external'

const NO_DATA = tt('ยังไม่มีข้อมูล', 'No data yet')

const BAND_LABEL: Record<Band, T> = {
  low: tt('ต่ำ', 'Low'),
  middle: tt('กลาง', 'Middle'),
  high: tt('สูง', 'High'),
  unknown: NO_DATA,
}

const growthName = (g: GrowthRole) => GROWTH_ROLES.find((x) => x.id === g)!.name
const dimById = (id: ContextDimId) => CONTEXT_DIMS.find((d) => d.id === id)!

export function RolePage() {
  const { id } = useParams()
  const role = useSourcing((s) => s.roles.find((r) => r.id === id))
  return role ? <People role={role} /> : <NotFound />
}

function People({ role }: { role: RoleSpec }) {
  const t = useT()
  const pool = useCandidatePool()
  const stages = useSourcing((s) => s.stages)
  const [scope, setScope] = useState<Scope>('all')
  const [stageFilter, setStageFilter] = useState<'' | Stage>('')
  const [filters, setFilters] = useState<CandidateFilters>(emptyFilters)
  const [sortBy, setSortBy] = useState<SortBy>('name')
  const [showAlign, setShowAlign] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [compare, setCompare] = useState<string[]>([])
  const [refused, setRefused] = useState(false)
  const [compareOpen, setCompareOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Don't list people already in the team being hired into.
  const base = useMemo(() => pool.filter((c) => !(role.teamId && !c.external && c.team === role.teamId)), [pool, role.teamId])
  const views = useMemo(() => new Map(base.map((c) => [c.id, describeCandidate(role, c)])), [base, role])
  const stageOf = (c: Candidate): StageEntry => stages[pipelineKey(role.id, c.id)] ?? { stage: 'new', reason: '', at: '' }
  const shown = sortCandidates(
    base.filter(
      (c) =>
        (scope === 'all' || (scope === 'internal' ? !c.external : c.external)) &&
        (!stageFilter || stageOf(c).stage === stageFilter) &&
        matchesFilters(c, filters),
    ),
    sortBy,
  )
  const nActive = activeFilterCount(filters) + (scope !== 'all' ? 1 : 0) + (stageFilter ? 1 : 0)
  const clearAll = () => {
    setFilters(emptyFilters())
    setScope('all')
    setStageFilter('')
  }
  const counts = STAGES.map((st) => ({ ...st, n: base.filter((c) => stageOf(c).stage === st.id).length }))
  const inviteUrl = `${window.location.origin}/test?invite=${role.id}`
  const tm = TEAMS.find((x) => x.id === role.teamId)
  const mgr = MANAGER_TEMPLATES.find((m) => m.id === role.managerTemplate)
  const teamTpl = TEAM_TEMPLATES.find((m) => m.id === role.teamTemplate)
  const weighted = checkWeights(role.roleWeights).ok ? weightedTypes(role.roleWeights) : []
  const open = base.find((c) => c.id === openId)

  const onCompare = (id: string) => {
    const r = toggleCompare(compare, id)
    setCompare(r.selection)
    setRefused(r.refused)
    if (r.refused) window.setTimeout(() => setRefused(false), 2500)
  }

  return (
    <div className="space-y-6 pb-24">
      <Button variant="ghost" size="sm" icon={ArrowLeft} to="/sourcing">
        {t('ตำแหน่งทั้งหมด', 'All roles')}
      </Button>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Eyebrow>{t('รายชื่อสำหรับตำแหน่ง', 'People for this role')}</Eyebrow>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{role.title}</h1>
            {role.duties && <p className="mt-2 max-w-2xl text-sm text-slate-600 dark:text-slate-300">{role.duties}</p>}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {weighted.length ? (
                weighted.map(({ id, weight }) => (
                  <Chip key={id} color={roleTypeById(id).color}>
                    {t(roleTypeById(id).name)} {weightToPct(weight)}%
                  </Chip>
                ))
              ) : (
                <Chip>{t('ยังไม่ได้ให้น้ำหนักหน้าที่', 'Duties not weighted yet')}</Chip>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tm && <Chip>{t('ทีม', 'Team')}: {t(tm.th, tm.en)}</Chip>}
              {mgr && <Chip>{t(mgr.name)}</Chip>}
              {teamTpl && <Chip>{t(teamTpl.name)}</Chip>}
              {(Object.entries(role.contextRanges) as [ContextDimId, { min: number; max: number }][]).map(([dim, r]) => (
                <Chip key={dim}>
                  {t(dimById(dim).name)} {r.min}–{r.max}
                </Chip>
              ))}
            </div>
            {role.owner && (
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {t('เจ้าของ', 'Owner')}: {role.owner}
                {role.reviewedAt && ` · ${t('ทบทวน', 'reviewed')} ${role.reviewedAt}`}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              icon={copied ? Check : Link2}
              title={t('ส่งลิงก์นี้ให้ผู้สมัครทำแบบสำรวจ แล้วผลจะเข้ามาในรายชื่อนี้', 'Send this link to candidates; their results land in this list')}
              onClick={() => {
                void navigator.clipboard?.writeText(inviteUrl)
                setCopied(true)
                window.setTimeout(() => setCopied(false), 1600)
              }}
            >
              {copied ? t('คัดลอกลิงก์แล้ว', 'Link copied') : t('ลิงก์เชิญผู้สมัคร', 'Candidate invite link')}
            </Button>
            <Button icon={Pencil} to={`/sourcing/${role.id}/edit`}>
              {t('แก้ตำแหน่ง', 'Edit role')}
            </Button>
          </div>
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {counts.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={stageFilter === c.id}
              onClick={() => setStageFilter(stageFilter === c.id ? '' : c.id)}
              className={cn(
                'shrink-0 rounded-xl border px-3 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600',
                stageFilter === c.id ? 'border-violet-600 bg-violet-50 dark:border-violet-400 dark:bg-violet-500/15' : 'border-slate-200 dark:border-white/10',
              )}
            >
              <div className="tabular text-xl font-semibold">{c.n}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t(c.th, c.en)}</div>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {t('ขั้นตอนเป็นบันทึกว่าจะศึกษาอะไรต่อ ไม่ใช่การผ่านหรือไม่ผ่าน', 'A stage notes what to look into next; it is not a pass or a fail')}
        </p>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl border border-slate-200 p-1 dark:border-white/10">
          {(
            [
              ['all', t('ทั้งหมด', 'All')],
              ['internal', t('ภายใน', 'Internal')],
              ['external', t('ภายนอก', 'External')],
            ] as const
          ).map(([k, l]) => (
            <button
              key={k}
              type="button"
              aria-pressed={scope === k}
              onClick={() => setScope(k)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600',
                scope === k ? 'bg-violet-700 text-white dark:bg-violet-600' : 'text-slate-600 dark:text-slate-300',
              )}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="w-48">
          <Select
            label={t('เรียงตาม', 'Sort by')}
            value={sortBy}
            onChange={(v) => setSortBy(v as SortBy)}
            options={[
              ['name', t('เรียงตามชื่อ', 'Sort by name')],
              ['date', t('เรียงตามวันที่สมัคร/เพิ่ม', 'Sort by date applied/added')],
            ]}
          />
        </div>
        <Button size="md" icon={SlidersHorizontal} onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}>
          {t('ตัวกรอง', 'Filters')} {activeFilterCount(filters) > 0 && `(${activeFilterCount(filters)})`}
        </Button>
        <Button variant="ghost" size="md" icon={X} disabled={nActive === 0} onClick={clearAll}>
          {t('ล้างตัวกรอง', 'Clear filters')}
        </Button>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showAlign} onChange={(e) => setShowAlign(e.target.checked)} className="size-4 accent-violet-700" />
          {t('แสดงความสอดคล้องกับหน้าที่', 'Show alignment with duties')}
        </label>
        <span className="ml-auto text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
          <span className="tabular font-semibold text-slate-900 dark:text-white">{shown.length}</span> {t('คน', 'people')}
        </span>
      </div>

      {filtersOpen && <FilterPanel filters={filters} onChange={setFilters} />}
      {filters.types.length > 0 && (
        <p className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
          <Info size={14} className="mt-0.5 shrink-0" />
          {t(
            'ตัวกรองบทบาทอาจซ่อนคนที่มีทักษะตรงกับงาน แต่ความสนใจต่างออกไปหรือยังไม่มีบทบาทเด่น ความสนใจไม่ใช่ความสามารถ',
            'A role-type filter may hide people with the right skills whose interests differ or show no standout role. Interest is not ability.',
          )}
        </p>
      )}

      <div className="space-y-3">
        {shown.length === 0 && (
          <Card className="text-center text-sm text-slate-600 dark:text-slate-300">
            {t('ไม่มีคนตามตัวกรองนี้', 'Nobody matches these filters.')}{' '}
            {nActive > 0 && (
              <button type="button" onClick={clearAll} className="font-medium text-violet-700 underline dark:text-violet-300">
                {t('ล้างตัวกรอง', 'Clear filters')}
              </button>
            )}
          </Card>
        )}
        {shown.map((c) => (
          <CandidateRow
            key={c.id}
            c={c}
            v={views.get(c.id)!}
            entry={stageOf(c)}
            showAlign={showAlign}
            weighted={weighted.length > 0}
            comparing={compare.includes(c.id)}
            onCompare={() => onCompare(c.id)}
            onOpen={() => setOpenId(c.id)}
          />
        ))}
      </div>

      {compare.length > 0 && (
        <div className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg lg:bottom-6 dark:border-white/10 dark:bg-[#131318]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm">{t(`เลือกเปรียบเทียบ ${compare.length}/${COMPARE_MAX} คน`, `${compare.length}/${COMPARE_MAX} selected to compare`)}</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setCompare([])}>
                {t('ล้าง', 'Clear')}
              </Button>
              <Button variant="primary" size="sm" disabled={compare.length < COMPARE_MIN} title={compare.length < COMPARE_MIN ? t('เลือกอย่างน้อย 2 คน', 'Pick at least 2 people') : undefined} onClick={() => setCompareOpen(true)}>
                {t('เปรียบเทียบ', 'Compare')}
              </Button>
            </div>
          </div>
          <p aria-live="polite" className={cn('text-xs text-amber-700 dark:text-amber-300', refused ? 'mt-1' : 'sr-only')}>
            {refused ? t(`เปรียบเทียบได้สูงสุด ${COMPARE_MAX} คน เอาคนใดคนหนึ่งออกก่อน`, `You can compare up to ${COMPARE_MAX} people. Remove someone first`) : ''}
          </p>
        </div>
      )}

      <Sheet open={Boolean(open)} onClose={() => setOpenId(null)} label={t('รายละเอียดผู้สมัคร', 'Candidate detail')} wide>
        {open && <CandidateDetail c={open} v={views.get(open.id)!} role={role} entry={stageOf(open)} />}
      </Sheet>
      <Sheet open={compareOpen} onClose={() => setCompareOpen(false)} label={t('เปรียบเทียบผู้สมัคร', 'Compare candidates')} wide>
        <Compare role={role} rows={base.filter((c) => compare.includes(c.id)).map((c) => ({ c, v: views.get(c.id)! }))} />
      </Sheet>
    </div>
  )
}

/* ------------------------------------------- Filters ------------------------------------------- */

function Toggle({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cn(
        'inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition sm:min-h-0 sm:px-2.5 sm:py-1 sm:text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600',
        on ? 'border-violet-700 bg-violet-700 text-white dark:border-violet-500 dark:bg-violet-600' : 'border-slate-200 text-slate-700 hover:border-slate-300 dark:hover:border-white/25 dark:border-white/10 dark:text-slate-200',
      )}
    >
      {on && <Check size={12} />}
      {children}
    </button>
  )
}

function FilterPanel({ filters, onChange }: { filters: CandidateFilters; onChange: (f: CandidateFilters) => void }) {
  const t = useT()
  return (
    <Card className="space-y-4">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {t('ในกลุ่มเดียวกัน: ตรงข้อใดข้อหนึ่ง · ต่างกลุ่ม: ต้องตรงทุกกลุ่ม', 'Within a group: any of them · across groups: all groups must match')}
      </p>
      <div>
        <div className="mb-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{t('บทบาทที่สนใจ (หลักหรือรอง)', 'Role type (primary or secondary)')}</div>
        <div className="flex flex-wrap gap-1.5">
          {ROLE_TYPE_IDS.map((id) => (
            <Toggle key={id} on={filters.types.includes(id)} onClick={() => onChange({ ...filters, types: toggleIn(filters.types, id) })}>
              {t(roleTypeById(id).name)}
            </Toggle>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{t('บทบาทที่อยากเติบโต', 'Desired growth roles')}</div>
        <div className="flex flex-wrap gap-1.5">
          {GROWTH_ROLES.map((g) => (
            <Toggle key={g.id} on={filters.growth.includes(g.id)} onClick={() => onChange({ ...filters, growth: toggleIn(filters.growth, g.id) })}>
              {t(g.name)}
            </Toggle>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">{t('ความชอบในการทำงาน', 'Working preferences')}</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {CONTEXT_DIMS.map((d) => {
            const cur = filters.bands[d.id] ?? []
            return (
              <div key={d.id}>
                <div className="text-sm font-medium">{t(d.name)}</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {(['low', 'middle', 'high', 'unknown'] as Band[]).map((b) => (
                    <Toggle key={b} on={cur.includes(b)} onClick={() => onChange({ ...filters, bands: { ...filters.bands, [d.id]: toggleIn(cur, b) } })}>
                      {t(BAND_LABEL[b])}
                    </Toggle>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

/* ------------------------------------------ Card parts ----------------------------------------- */

function candidateLine(c: Candidate, t: ReturnType<typeof useT>) {
  const date = `${c.external ? t('สมัคร', 'applied') : t('เพิ่ม', 'added')} ${appliedAtOf(c)}`
  if (c.external) return [t('ภายนอก', 'External'), c.source ? t(c.source) : '', c.currentRole ? t(c.currentRole) : '', date].filter(Boolean).join(' · ')
  const tm = TEAMS.find((x) => x.id === c.team)
  return [t('ภายใน', 'Internal'), tm ? t(tm.th, tm.en) : '', t(c.role), date].filter(Boolean).join(' · ')
}

function roleTypeText(rc: Classification | null, t: ReturnType<typeof useT>): string {
  if (!rc) return t(NO_DATA)
  if (rc.state === 'no_dominant' || !rc.primary) return t('ไม่มีบทบาทเด่น', 'No standout role')
  const p = t(ROLE_ACTIVITY[rc.primary])
  return rc.secondary ? `${p} · ${t(ROLE_ACTIVITY[rc.secondary])}` : p
}

/** A person is shown as their own code character (letters 1–4). */
function Avatar({ scores, size }: { scores: Scores; size: number }) {
  return <CodeCharacter code={workfitCode(scores).code} size={size} />
}

function Bands({ c }: { c: Candidate }) {
  const t = useT()
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs sm:grid-cols-3">
      {CONTEXT_DIMS.map((d) => {
        const b = band(c.context[d.id])
        return (
          <div key={d.id} className="flex min-w-0 justify-between gap-1">
            <span className="truncate text-slate-500 dark:text-slate-400">{t(d.name)}</span>
            <span className={cn('shrink-0 font-medium', b === 'unknown' ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-100')}>{t(BAND_LABEL[b])}</span>
          </div>
        )
      })}
    </div>
  )
}

function GapList({ gaps }: { gaps: ContextGap[] }) {
  const t = useT()
  if (!gaps.length) return <p className="text-xs text-slate-500 dark:text-slate-400">{t('ไม่มีข้อมูลพอเทียบช่วงของตำแหน่ง', 'Not enough data to compare with the role’s ranges')}</p>
  return (
    <ul className="space-y-1 text-xs">
      {gaps.map((g) => (
        <li key={g.dim} className="flex flex-wrap items-center gap-x-2">
          <span className="font-medium">{t(dimById(g.dim).name)}</span>
          <span className="tabular text-slate-500 dark:text-slate-400">
            {g.person} vs {g.range.min}–{g.range.max} · {t('ห่าง', 'distance')} {g.distance}
          </span>
          {g.discuss && <span className="rounded-full border border-amber-300 px-1.5 text-xs font-medium text-amber-800 dark:border-amber-500/40 dark:text-amber-200">{t('ควรตกลงร่วมกัน', 'Worth agreeing')}</span>}
        </li>
      ))}
    </ul>
  )
}

function AlignmentBox({ v, weighted }: { v: CandidateView; weighted: boolean }) {
  const t = useT()
  return (
    <div className="rounded-xl border border-slate-200 p-3 dark:border-white/10">
      <div className="text-xs">
        {t('ความสนใจสอดคล้องกับหน้าที่ที่กำหนด', 'Interest matches the defined duties')}{' '}
        <span className="tabular font-semibold">{v.alignment === null ? t(NO_DATA) : `${v.alignment}/100`}</span>
        {!weighted && <span className="text-slate-500 dark:text-slate-400"> · {t('ตำแหน่งยังไม่ได้ให้น้ำหนักหน้าที่', 'role duties not weighted yet')}</span>}
      </div>
      <div className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">{t('ความชอบที่ห่างจากช่วงของตำแหน่งมากที่สุด', 'Largest differences from the role’s ranges')}</div>
      <div className="mt-1">
        <GapList gaps={v.topGaps} />
      </div>
    </div>
  )
}

function CandidateRow({
  c, v, entry, showAlign, weighted, comparing, onCompare, onOpen,
}: {
  c: Candidate
  v: CandidateView
  entry: StageEntry
  showAlign: boolean
  weighted: boolean
  comparing: boolean
  onCompare: () => void
  onOpen: () => void
}) {
  const t = useT()
  const st = STAGES.find((x) => x.id === entry.stage)!
  return (
    <Card className={cn('p-4 sm:p-5', c.isYou && 'border-violet-600 dark:border-violet-400')}>
      <div className="flex items-start gap-3 sm:gap-4">
        <button type="button" onClick={onOpen} className="shrink-0 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600" aria-label={t(`ดูรายละเอียด ${c.name}`, `View ${c.name}`)}>
          <Avatar scores={c.scores} size={52} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <button type="button" onClick={onOpen} className="text-left font-semibold hover:underline">
                {c.name}
              </button>{' '}
              {c.isYou && <span className="text-xs font-medium text-violet-700 dark:text-violet-300">({t('คุณ', 'you')})</span>}
              <div className="text-xs text-slate-500 dark:text-slate-400">{candidateLine(c, t)}</div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <Chip>{t(st.th, st.en)}</Chip>
              <label className="-mr-2 flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg px-2 text-xs text-slate-600 dark:text-slate-300">
                <input type="checkbox" checked={comparing} onChange={onCompare} className="size-5 accent-violet-700 sm:size-4" />
                {t('เปรียบเทียบ', 'Compare')}
              </label>
            </div>
          </div>
          <div className="mt-2 text-sm">
            <span className="text-slate-500 dark:text-slate-400">{t('บทบาทที่สนใจ', 'Role interest')}: </span>
            <span className="font-medium">{roleTypeText(c.roleClass, t)}</span>
          </div>
          <div className="mt-1.5 hidden flex-wrap items-center gap-1 sm:flex">
            <span className="text-xs text-slate-500 dark:text-slate-400">{t('อยากเติบโต', 'Growth')}:</span>
            {c.growthRoles.length ? c.growthRoles.map((g) => <Chip key={g}>{t(growthName(g))}</Chip>) : <span className="text-xs text-slate-400 dark:text-slate-500">{t(NO_DATA)}</span>}
            {v.sayDo.kind === 'quiet-achiever' && (
              <Chip color="#047857">
                <Gem size={11} /> {t('ทำมากกว่าพูด', 'Does more than says')}
              </Chip>
            )}
            {v.sayDo.kind === 'talk-over-do' && <Chip color="#b45309">{t('ขอดูผลงานจริงประกอบ', 'Ask for real work samples')}</Chip>}
          </div>
          <div className="mt-2 hidden sm:block">
            <Bands c={c} />
          </div>
          {/* Phones: one tap to the full detail instead of a long card. */}
          <button
            type="button"
            onClick={onOpen}
            className="-ml-1 mt-1 flex min-h-10 items-center gap-1 rounded-lg px-1 text-sm font-medium text-violet-700 sm:hidden dark:text-violet-300"
          >
            {v.sayDo.kind === 'quiet-achiever' ? t('ทำมากกว่าพูด · ', 'Does more than says · ') : v.sayDo.kind === 'talk-over-do' ? t('ขอดูผลงานจริง · ', 'Ask for work samples · ') : ''}
            {t('ดูรายละเอียด', 'Details')}
            <ChevronRight size={16} />
          </button>
          {showAlign && (
            <div className="mt-3">
              <AlignmentBox v={v} weighted={weighted} />
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

/* -------------------------------------------- Detail ------------------------------------------- */

function Section({ title, children, className }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-xl border border-slate-200 p-4 dark:border-white/10', className)}>
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  )
}

function CandidateDetail({ c, v, role, entry }: { c: Candidate; v: CandidateView; role: RoleSpec; entry: StageEntry }) {
  const t = useT()
  const note = useSourcing((st) => st.notes[pipelineKey(role.id, c.id)] ?? '')
  const setNote = useSourcing((st) => st.setNote)
  const setStage = useSourcing((st) => st.setStage)
  const [stage, setStageDraft] = useState<Stage>(entry.stage)
  const [reason, setReason] = useState(entry.reason)
  const [copied, setCopied] = useState(false)
  const guideText = v.interview
    .map((q, i) => `${i + 1}. ${t(q.ask)}\n   ${t('เหตุผล', 'Why')}: ${t(q.why)}\n   ${t('ฟังหา', 'Listen for')}: ${t(q.listen)}`)
    .join('\n\n')
  const weighted = checkWeights(role.roleWeights).ok
  return (
    <div>
      <div className="flex flex-col items-center gap-4 pr-8 text-center sm:flex-row sm:text-left">
        <Avatar scores={c.scores} size={96} />
        <div className="min-w-0">
          <div className="text-xs text-slate-500 dark:text-slate-400">{candidateLine(c, t)}</div>
          <h2 className="text-2xl font-semibold">{c.name}</h2>
          <div className="mt-0.5 text-sm font-medium">{roleTypeText(c.roleClass, t)}</div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Section title={t('ความสนใจบทบาท 12 แบบ', 'Interest in the 12 role types')}>
          {c.roleScores ? (
            <div className="space-y-1.5">
              {ROLE_TYPE_IDS.map((id) => (
                <div key={id} className="flex items-center gap-2 text-xs">
                  <RoleCharacter type={id} size={20} showProp={false} />
                  <span className="w-28 shrink-0 truncate">{t(roleTypeById(id).name)}</span>
                  <Meter value={c.roleScores![id]} color={roleTypeById(id).color} className="flex-1" />
                  <span className="tabular w-7 text-right">{c.roleScores![id]}</span>
                </div>
              ))}
              <p className="pt-1 text-xs text-slate-500 dark:text-slate-400">{t('ระดับความสนใจ ไม่ใช่ความสามารถ', 'Interest levels, not ability')}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">{t(NO_DATA)}</p>
          )}
        </Section>
        <div className="space-y-4">
          <Section title={t('บทบาทที่อยากเติบโต', 'Desired growth roles')}>
            <div className="flex flex-wrap gap-1">
              {c.growthRoles.length ? c.growthRoles.map((g) => <Chip key={g}>{t(growthName(g))}</Chip>) : <span className="text-sm text-slate-500 dark:text-slate-400">{t(NO_DATA)}</span>}
            </div>
          </Section>
          <Section title={t('ความชอบในการทำงาน', 'Working preferences')}>
            <ul className="space-y-1 text-xs">
              {CONTEXT_DIMS.map((d) => {
                const val = confirmedValue(c.context[d.id])
                const r = role.contextRanges[d.id]
                return (
                  <li key={d.id} className="flex flex-wrap justify-between gap-x-2">
                    <span>{t(d.name)}</span>
                    <span className="tabular">
                      {val === null ? <span className="text-slate-400 dark:text-slate-500">{t(NO_DATA)}</span> : `${val} · ${t(BAND_LABEL[band(c.context[d.id])])}`}
                      {r && <span className="text-slate-500 dark:text-slate-400"> · {t('ตำแหน่ง', 'role')} {r.min}–{r.max}</span>}
                    </span>
                  </li>
                )
              })}
            </ul>
          </Section>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Section title={t('เทียบกับหน้าที่ที่กำหนด (ข้อมูลแยก)', 'Against the defined duties (separate info)')}>
          <AlignmentBox v={v} weighted={weighted} />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {t('ไม่ใช่คะแนนความเหมาะกับตำแหน่ง ใช้หาเรื่องที่ควรคุยเท่านั้น', 'Not a fit score for the position; only a pointer to what to talk about')}
          </p>
        </Section>
        <Section title={t('พูด vs ทำ', 'Say vs do')}>
          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between">
                <span>{t('นำเสนอตัวเอง', 'Self-presentation')}</span>
                <span className="tabular">{v.sayDo.say}</span>
              </div>
              <Meter value={v.sayDo.say} color="#7c3aed" className="mt-1" />
            </div>
            <div>
              <div className="flex justify-between">
                <span>{c.external ? t('ส่งมอบงาน (ประเมินตนเอง)', 'Delivery (self-rated)') : t('ผลงานจากคนรอบตัว', 'Delivery (peer-rated)')}</span>
                <span className="tabular">{v.sayDo.do}</span>
              </div>
              <Meter value={v.sayDo.do} color="#047857" className="mt-1" />
            </div>
            <p className="font-medium">{t(v.sayDo.title)}</p>
            {c.external && (
              <p className="text-slate-500 dark:text-slate-400">
                {t('ผู้สมัครภายนอกยังไม่มีการประเมินจากคนรอบตัว ให้ยืนยันจากงานตัวอย่างและการตรวจอ้างอิง', 'External applicants have no peer ratings yet; confirm with a work sample and reference checks')}
              </p>
            )}
          </div>
        </Section>
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 font-semibold">
            <MessageCircleQuestion size={18} className="text-violet-700 dark:text-violet-300" /> {t(`คู่มือคุยกับ${c.name}`, `Interview guide for ${c.name}`)}
          </h3>
          <Button
            size="sm"
            icon={copied ? Check : Copy}
            onClick={() => {
              void navigator.clipboard?.writeText(`${t('คู่มือสัมภาษณ์', 'Interview guide')} · ${c.name} · ${role.title}\n\n${guideText}`)
              setCopied(true)
              window.setTimeout(() => setCopied(false), 1600)
            }}
          >
            {copied ? t('คัดลอกแล้ว', 'Copied') : t('คัดลอกคู่มือ', 'Copy guide')}
          </Button>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('ถามเรื่องหน้าที่จริงและข้อมูลที่ยังขาด ไม่ใช่เพื่อยืนยันภาพจำของบทบาท', 'About the real duties and missing information, not to confirm a type stereotype')}</p>
        {v.interview.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t('ให้น้ำหนักหน้าที่ของตำแหน่งก่อน แล้วคำถามจะขึ้นที่นี่', 'Weight the role’s duties first and questions will appear here')}</p>
        ) : (
          <ol className="mt-3 space-y-3">
            {v.interview.map((q, i) => (
              <li key={q.ask.en} className="rounded-xl border border-slate-200 p-4 dark:border-white/10">
                <div className="text-xs font-semibold text-violet-700 dark:text-violet-300">
                  {t('คำถามที่', 'Question')} {i + 1} · {t(q.why)}
                </div>
                <p className="mt-1 font-medium">{t(q.ask)}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {t('ฟังหา', 'Listen for')}: {t(q.listen)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>

      <Section title={t('ขั้นตอน (บันทึกเพื่อศึกษาต่อ)', 'Stage (a note for further study)')} className="mt-6">
        <div className="grid gap-2 sm:grid-cols-[200px_1fr_auto]">
          <Select label={t('ขั้นตอน', 'Stage')} value={stage} onChange={(x) => setStageDraft(x as Stage)} options={STAGES.map((st) => [st.id, t(st.th, st.en)])} />
          <input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            aria-label={t('เหตุผล', 'Reason')}
            placeholder={t('เหตุผล เช่น อยากคุยเรื่องการทำงานเป็นกะ', 'Reason, e.g. want to discuss shift work')}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-base outline-none focus:border-violet-400 sm:text-sm dark:border-white/10 dark:bg-white/5"
          />
          <Button variant="primary" disabled={!reason.trim() || (stage === entry.stage && reason === entry.reason)} title={!reason.trim() ? t('ใส่เหตุผลก่อนบันทึก', 'Add a reason before saving') : undefined} onClick={() => setStage(role.id, c.id, stage, reason.trim())}>
            {t('บันทึก', 'Save')}
          </Button>
        </div>
        {entry.at && (
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {t('บันทึกล่าสุด', 'Last saved')} {new Date(entry.at).toLocaleString()}
            {entry.reason && ` · ${entry.reason}`}
          </p>
        )}
      </Section>

      <div className="mt-6">
        <label className="flex items-center gap-2 text-sm font-semibold" htmlFor="cand-note">
          <ClipboardList size={16} /> {t('บันทึกของผู้สัมภาษณ์', 'Interviewer notes')}
        </label>
        <textarea
          id="cand-note"
          value={note}
          onChange={(e) => setNote(role.id, c.id, e.target.value)}
          rows={3}
          placeholder={t('สิ่งที่ได้ยินจากคำตอบ ตัวอย่างผลงาน ผลการตรวจอ้างอิง', 'What you heard, work samples, reference checks')}
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-base outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/15 sm:text-sm dark:border-white/10 dark:bg-white/5"
        />
      </div>

      <Section title={t('สไตล์การทำงาน (ใช้ชวนคุย ไม่ใช่คะแนน)', 'Work style (conversation material, not a score)')} className="mt-6">
        <WorkfitIdCard scores={c.scores} compact />
      </Section>

      <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
        {t(
          'ผลนี้ใช้ประกอบการคุยเท่านั้น ไม่มีคะแนนรวมและไม่คัดใครออกอัตโนมัติ ให้ตัดสินจากหลักฐานในการสัมภาษณ์ งานตัวอย่าง และการตรวจอ้างอิง',
          'This supports conversations only. There is no overall score and nobody is rejected automatically. Decide using interview evidence, work samples and reference checks.',
        )}
      </p>
    </div>
  )
}

/* -------------------------------------------- Compare ------------------------------------------ */

function Compare({ role, rows }: { role: RoleSpec; rows: { c: Candidate; v: CandidateView }[] }) {
  const t = useT()
  const cell = 'px-2 py-2 text-center text-xs'
  return (
    <div>
      <h2 className="pr-10 text-xl font-semibold">{t(`เปรียบเทียบสำหรับ${role.title}`, `Comparing for ${role.title}`)}</h2>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('แสดงข้อมูลเคียงกัน ไม่มีผู้ชนะหรือ “คนที่ดีที่สุด”', 'Side by side only. There is no winner and no “best”')}</p>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr>
              <th className="w-40" />
              {rows.map(({ c }) => (
                <th key={c.id} className="pb-3 text-center align-bottom">
                  <div className="flex justify-center">
                    <Avatar scores={c.scores} size={48} />
                  </div>
                  <div className="mt-1 font-semibold">{c.name}</div>
                  <div className="text-xs font-normal text-slate-500 dark:text-slate-400">{c.external ? t('ภายนอก', 'External') : t('ภายใน', 'Internal')}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/10">
            <tr>
              <td className="py-2 font-semibold">{t('บทบาทที่สนใจ', 'Role interest')}</td>
              {rows.map(({ c }) => (
                <td key={c.id} className={cell}>
                  {roleTypeText(c.roleClass, t)}
                </td>
              ))}
            </tr>
            {ROLE_TYPE_IDS.map((id) => (
              <tr key={id}>
                <td className="py-1.5 text-xs">
                  {t(roleTypeById(id).name)}
                  {role.roleWeights[id] ? <span className="text-slate-500 dark:text-slate-400"> · {weightToPct(role.roleWeights[id]!)}%</span> : null}
                </td>
                {rows.map(({ c }) => (
                  <td key={c.id} className="tabular px-2 py-1.5 text-center text-xs">
                    {c.roleScores ? c.roleScores[id] : <span className="text-slate-400 dark:text-slate-500">{t(NO_DATA)}</span>}
                  </td>
                ))}
              </tr>
            ))}
            {CONTEXT_DIMS.map((d) => {
              const r = role.contextRanges[d.id]
              return (
                <tr key={d.id}>
                  <td className="py-1.5 text-xs">
                    {t(d.name)}
                    {r && <span className="tabular text-slate-500 dark:text-slate-400"> · {r.min}–{r.max}</span>}
                  </td>
                  {rows.map(({ c }) => {
                    const val = confirmedValue(c.context[d.id])
                    return (
                      <td key={c.id} className="tabular px-2 py-1.5 text-center text-xs">
                        {val === null ? <span className="text-slate-400 dark:text-slate-500">{t(NO_DATA)}</span> : `${val} · ${t(BAND_LABEL[band(c.context[d.id])])}`}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
            <tr>
              <td className="py-2 font-semibold">{t('อยากเติบโต', 'Growth roles')}</td>
              {rows.map(({ c }) => (
                <td key={c.id} className={cell}>
                  {c.growthRoles.length ? c.growthRoles.map((g) => t(growthName(g))).join(', ') : t(NO_DATA)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2 font-semibold">{t('พูด vs ทำ', 'Say vs do')}</td>
              {rows.map(({ c, v }) => (
                <td key={c.id} className={cell}>
                  {t(v.sayDo.title)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
