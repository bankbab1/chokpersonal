import {
  AlertTriangle, ArrowLeft, Check, ClipboardList, Copy, Gem, Link2, MessageCircleQuestion, Pencil, ThumbsUp, Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { EnergyMeter, StrengthList, WorkStyleGrid } from '@/components/charts/StyleFrames'
import { CodeLetters } from '@/components/charts/WorkfitCodeCard'
import { WorkfitIdCard } from '@/components/charts/WorkfitIdCard'
import { PersonaAvatar } from '@/components/character/PersonaAvatar'
import { Button } from '@/components/ui/Button'
import { Card, Chip, Eyebrow, Meter } from '@/components/ui/Card'
import { Sheet } from '@/components/ui/Sheet'
import { TEAMS } from '@/domain/demo'
import { dimMeta } from '@/domain/dimensions'
import { MANAGER_STYLES } from '@/domain/fit'
import { familyById, MODIFIERS, personaById } from '@/domain/personas'
import { scoreCandidate, STAGES, type Candidate, type CandidateScore, type RoleSpec, type Stage } from '@/domain/sourcing'
import { ALL_WORK_STYLES, energy, workStyle } from '@/domain/styles'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { useCandidatePool, useStaffPool } from '@/lib/useProfile'
import { pipelineKey, useSourcing } from '@/store/sourcing'
import { NotFound } from '../NotFound'
import { Select } from './RoleEditorPage'

type Scope = 'all' | 'internal' | 'external'

export function RolePage() {
  const { id } = useParams()
  const role = useSourcing((s) => s.roles.find((r) => r.id === id))
  return role ? <Shortlist role={role} /> : <NotFound />
}

function Shortlist({ role }: { role: RoleSpec }) {
  const t = useT()
  const pool = useCandidatePool()
  const staff = useStaffPool()
  const stages = useSourcing((s) => s.stages)
  const [scope, setScope] = useState<Scope>('all')
  const [minFit, setMinFit] = useState(60)
  const [gemsOnly, setGemsOnly] = useState(false)
  const [stageFilter, setStageFilter] = useState<'' | Stage>('')
  const [energyFilter, setEnergyFilter] = useState('')
  const [styleFilter, setStyleFilter] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [compare, setCompare] = useState<string[]>([])
  const [compareOpen, setCompareOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const team = useMemo(() => staff.filter((m) => role.teamId && m.team === role.teamId), [staff, role.teamId])
  const scored = useMemo(
    () =>
      pool
        // Don't suggest people already in the team being hired into.
        .filter((c) => !(role.teamId && !c.external && c.team === role.teamId))
        .map((c) => ({ c, s: scoreCandidate(role, c, team), stage: stages[pipelineKey(role.id, c.id)] ?? 'new' }))
        .sort((a, b) => b.s.overall - a.s.overall),
    [pool, role, team, stages],
  )
  const shown = scored.filter(
    ({ c, s, stage }) =>
      (scope === 'all' || (scope === 'internal' ? !c.external : c.external)) &&
      s.overall >= minFit &&
      (!gemsOnly || s.sayDo.kind === 'quiet-achiever') &&
      (!stageFilter || stage === stageFilter) &&
      (!energyFilter || energy(c.scores).kind === energyFilter) &&
      (!styleFilter || workStyle(c.scores).id === styleFilter),
  )
  const open = scored.find((x) => x.c.id === openId)
  const counts = STAGES.map((st) => ({ ...st, n: scored.filter((x) => x.stage === st.id).length }))
  const inviteUrl = `${window.location.origin}/test?invite=${role.id}`
  const tm = TEAMS.find((x) => x.id === role.teamId)
  const mgr = MANAGER_STYLES.find((m) => m.id === role.managerStyle)

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" icon={ArrowLeft} to="/sourcing">
        {t('ตำแหน่งทั้งหมด', 'All roles')}
      </Button>

      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <Eyebrow>Shortlist</Eyebrow>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">{role.title}</h1>
            <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
              {tm && (
                <Chip>
                  {t('ทีม', 'Team')}: {t(tm.th, tm.en)}
                </Chip>
              )}
              {mgr && (
                <Chip>
                  {t('หัวหน้า', 'Manager')}: {t(mgr.th, mgr.en)}
                </Chip>
              )}
              {role.targets.map((x) => (
                <Chip key={x.dim} color={x.weight === 3 ? '#7c3aed' : undefined}>
                  {t(dimMeta(x.dim).th, dimMeta(x.dim).en)} {Math.max(0, x.center - x.half)}–{Math.min(100, x.center + x.half)}
                </Chip>
              ))}
            </div>
            {role.note && <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{role.note}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              icon={copied ? Check : Link2}
              title={t('ส่งลิงก์นี้ให้ผู้สมัครทำแบบทดสอบ แล้วผลจะเข้ามาใน shortlist นี้', 'Send this link to candidates; their results land in this shortlist')}
              onClick={() => {
                void navigator.clipboard?.writeText(inviteUrl)
                setCopied(true)
                window.setTimeout(() => setCopied(false), 1600)
              }}
            >
              {copied ? t('คัดลอกลิงก์แล้ว', 'Link copied') : t('ลิงก์เชิญผู้สมัคร', 'Candidate invite link')}
            </Button>
            <Button icon={Pencil} to={`/sourcing/${role.id}/edit`}>
              {t('แก้โปรไฟล์', 'Edit profile')}
            </Button>
          </div>
        </div>
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {counts.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setStageFilter(stageFilter === c.id ? '' : c.id)}
              className={cn(
                'shrink-0 rounded-2xl border px-3 py-2 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600',
                stageFilter === c.id ? 'border-violet-500 bg-violet-500/10' : 'border-slate-200 dark:border-white/10',
              )}
            >
              <div className="tabular font-display text-xl font-bold">{c.n}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">{t(c.th, c.en)}</div>
            </button>
          ))}
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-xl bg-slate-900/[0.05] p-1 dark:bg-white/[0.06]">
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
              onClick={() => setScope(k)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600',
                scope === k ? 'bg-white shadow-sm dark:bg-white/20' : 'text-slate-500 dark:text-slate-400',
              )}
            >
              {l}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-slate-500 dark:text-slate-400">{t('ขั้นต่ำ', 'Min')}</span>
          <input type="range" min={0} max={95} step={5} value={minFit} onChange={(e) => setMinFit(Number(e.target.value))} className="w-28 accent-violet-600" aria-label={t('ความเหมาะขั้นต่ำ', 'Minimum fit')} />
          <span className="tabular w-10 font-semibold">{minFit}%</span>
        </label>
        <div className="w-44">
          <Select
            value={energyFilter}
            onChange={setEnergyFilter}
            options={[
              ['', t('อินโทร/เอ็กซ์โทร: ทั้งหมด', 'Energy: all')],
              ['introvert', t('อินโทรเวิร์ต', 'Introvert')],
              ['ambivert', t('แอมบิเวิร์ต', 'Ambivert')],
              ['extrovert', t('เอ็กซ์โทรเวิร์ต', 'Extrovert')],
            ]}
          />
        </div>
        <div className="w-44">
          <Select value={styleFilter} onChange={setStyleFilter} options={[['', t('สไตล์: ทั้งหมด', 'Style: all')], ...ALL_WORK_STYLES.map((w) => [w.id, t(w.th, w.en)] as [string, string])]} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={gemsOnly} onChange={(e) => setGemsOnly(e.target.checked)} className="size-4 accent-violet-600" />
          {t('เฉพาะเพชรในตม', 'Hidden gems only')}
        </label>
        <span className="ml-auto text-sm text-slate-500 dark:text-slate-400">
          <span className="tabular font-semibold text-slate-900 dark:text-white">{shown.length}</span> {t('คน', 'people')}
        </span>
      </div>

      <div className="space-y-3">
        {shown.length === 0 && <Card className="text-center text-sm text-slate-600 dark:text-slate-300">{t('ไม่มีผู้สมัครตามเงื่อนไข ลองลดความเหมาะขั้นต่ำ', 'No candidates match. Try a lower minimum fit.')}</Card>}
        {shown.map(({ c, s, stage }, i) => (
          <CandidateRow
            key={c.id}
            rank={i + 1}
            c={c}
            s={s}
            stage={stage}
            role={role}
            comparing={compare.includes(c.id)}
            onCompare={() => setCompare((cur) => (cur.includes(c.id) ? cur.filter((x) => x !== c.id) : cur.length >= 3 ? cur : [...cur, c.id]))}
            onOpen={() => setOpenId(c.id)}
          />
        ))}
      </div>

      {compare.length > 0 && (
        <div className="fixed inset-x-3 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-900 px-4 py-3 text-white shadow-2xl lg:bottom-6 dark:border-white/10 dark:bg-white dark:text-slate-900">
          <span className="text-sm">{t(`เลือกเปรียบเทียบ ${compare.length}/3 คน`, `${compare.length}/3 selected to compare`)}</span>
          <div className="flex gap-2">
            <button type="button" className="text-sm opacity-70 hover:opacity-100" onClick={() => setCompare([])}>
              {t('ล้าง', 'Clear')}
            </button>
            <button
              type="button"
              disabled={compare.length < 2}
              onClick={() => setCompareOpen(true)}
              className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-slate-900 disabled:opacity-40 dark:bg-slate-900 dark:text-white"
            >
              {t('เปรียบเทียบ', 'Compare')}
            </button>
          </div>
        </div>
      )}

      <Sheet open={Boolean(open)} onClose={() => setOpenId(null)} label={t('รายละเอียดผู้สมัคร', 'Candidate detail')} wide>
        {open && <CandidateDetail c={open.c} s={open.s} role={role} />}
      </Sheet>
      <Sheet open={compareOpen} onClose={() => setCompareOpen(false)} label={t('เปรียบเทียบผู้สมัคร', 'Compare candidates')} wide>
        <Compare role={role} rows={scored.filter((x) => compare.includes(x.c.id))} />
      </Sheet>
    </div>
  )
}

function candidateLine(c: Candidate, t: ReturnType<typeof useT>) {
  if (c.external) return `${t('ภายนอก', 'External')} · ${c.source ? t(c.source) : ''} · ${c.currentRole ? t(c.currentRole) : ''}`
  const tm = TEAMS.find((x) => x.id === c.team)
  return `${t('ภายใน', 'Internal')} · ${tm ? t(tm.th, tm.en) : ''} · ${t(c.role)}`
}

function CandidateRow({
  rank, c, s, stage, role, comparing, onCompare, onOpen,
}: {
  rank: number
  c: Candidate
  s: CandidateScore
  stage: Stage
  role: RoleSpec
  comparing: boolean
  onCompare: () => void
  onOpen: () => void
}) {
  const t = useT()
  const setStage = useSourcing((st) => st.setStage)
  const p = personaById(c.persona.personaId)
  const fam = familyById(p.family)
  const strong = s.role.reasons.filter((r) => r.kind === 'strong').slice(0, 2)
  const watch = s.role.reasons.filter((r) => r.kind === 'watch').slice(0, 1)
  const en = energy(c.scores)
  const ws = workStyle(c.scores)
  return (
    <Card className={cn('p-4 sm:p-5', c.isYou && 'ring-2 ring-violet-600')}>
      <div className="flex items-start gap-4">
        <div className="hidden w-6 pt-5 text-center text-sm font-bold text-slate-400 sm:block">{rank}</div>
        <button type="button" onClick={onOpen} className="shrink-0 rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600" aria-label={t(`ดูรายละเอียด ${c.name}`, `View ${c.name}`)}>
          <PersonaAvatar result={c.persona} size={60} showBadges={false} />
        </button>
        <div className="min-w-0 flex-1">
          <button type="button" onClick={onOpen} className="text-left">
            <span className="font-semibold hover:underline">{c.name}</span> {c.isYou && <span className="text-xs font-medium text-violet-700">({t('คุณ', 'you')})</span>}
          </button>
          <span className="ml-2 align-middle text-[0.6rem]">
            <CodeLetters scores={c.scores} size="sm" />
          </span>
          <div className="text-xs text-slate-500 dark:text-slate-400">{candidateLine(c, t)}</div>
          <div className="mt-0.5 text-sm font-medium" style={{ color: fam.color }}>
            {t(fam.animalTh, fam.animalEn)} {t(p.th, p.en)} · {t(fam.th, fam.en)}
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            <Chip>{t(en.th, en.en)}</Chip>
            <Chip color={ws.color}>{t(ws.th, ws.en)}</Chip>
            {s.sayDo.kind === 'quiet-achiever' && (
              <Chip color="#059669">
                <Gem size={11} /> {t('เพชรในตม', 'Hidden gem')}
              </Chip>
            )}
            {s.sayDo.kind === 'talk-over-do' && <Chip color="#ea580c">{t('พูดนำงาน · ขอดูผลงานจริง', 'Talk > do · ask for real work')}</Chip>}
            {s.team?.fills.map((f) => (
              <Chip key={f.en} color="#7c3aed">
                {t(f)}
              </Chip>
            ))}
            {c.persona.modifiers.map((m) => {
              const mod = MODIFIERS.find((x) => x.id === m)
              return <Chip key={m}>{mod ? t(mod.th, mod.en) : m}</Chip>
            })}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-slate-300">
            {strong.map((r) => (
              <span key={r.dim} className="flex items-center gap-1">
                <ThumbsUp size={11} className="text-emerald-500" /> {t(r.label)} {r.score}
              </span>
            ))}
            {watch.map((r) => (
              <span key={r.dim} className="flex items-center gap-1">
                <AlertTriangle size={11} className="text-orange-500" /> {t(r.label)} {r.score}
              </span>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="text-right">
            <div className="tabular text-2xl font-semibold">{s.overall}%</div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {t('งาน', 'Job')} {s.role.fit}
              {s.team && ` · ${t('ทีม', 'Team')} ${s.team.fit}`}
              {s.manager && ` · ${t('หัวหน้า', 'Mgr')} ${s.manager.fit}`}
            </div>
          </div>
          <div className="w-32">
            <Select value={stage} onChange={(v) => setStage(role.id, c.id, v as Stage)} options={STAGES.map((st) => [st.id, t(st.th, st.en)])} />
          </div>
          <label className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <input type="checkbox" checked={comparing} onChange={onCompare} className="size-3.5 accent-violet-600" />
            {t('เปรียบเทียบ', 'Compare')}
          </label>
        </div>
      </div>
    </Card>
  )
}

function CandidateDetail({ c, s, role }: { c: Candidate; s: CandidateScore; role: RoleSpec }) {
  const t = useT()
  const note = useSourcing((st) => st.notes[pipelineKey(role.id, c.id)] ?? '')
  const setNote = useSourcing((st) => st.setNote)
  const [copied, setCopied] = useState(false)
  const p = personaById(c.persona.personaId)
  const fam = familyById(p.family)
  const guideText = s.interview
    .map((q, i) => `${i + 1}. ${t(q.ask)}\n   ${t('เหตุผล', 'Why')}: ${t(q.why)}\n   ${t('ฟังหา', 'Listen for')}: ${t(q.listen)}`)
    .join('\n\n')
  return (
    <div>
      <div className="flex flex-col items-center gap-5 pr-8 text-center sm:flex-row sm:text-left">
        <PersonaAvatar result={c.persona} size={110} />
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{c.external ? `${t('ผู้สมัครภายนอก', 'External applicant')} · ${c.source ? t(c.source) : ''}` : t('พนักงานภายใน', 'Internal staff')}</div>
          <h2 className="text-2xl font-semibold">{c.name}</h2>
          <div className="mt-0.5 font-medium" style={{ color: fam.color }}>
            {t(fam.animalTh, fam.animalEn)} {t(p.th, p.en)} · {t(fam.th, fam.en)}
          </div>
          <div className="tabular mt-1 text-sm">
            {t(`เหมาะกับ${role.title}`, `Fit for ${role.title}`)} <span className="font-display text-xl font-bold">{s.overall}%</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <WorkfitIdCard scores={c.scores} compact />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-900/[0.04] p-4 dark:bg-white/[0.05]">
          <EnergyMeter scores={c.scores} compact />
        </div>
        <div className="rounded-2xl bg-slate-900/[0.04] p-4 dark:bg-white/[0.05]">
          <WorkStyleGrid scores={c.scores} compact />
        </div>
        <div className="rounded-2xl bg-slate-900/[0.04] p-4 dark:bg-white/[0.05]">
          <div className="mb-2 text-sm font-semibold">{t('Top 3 จุดแข็ง', 'Top 3 strengths')}</div>
          <StrengthList scores={c.scores} n={3} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-slate-900/[0.04] p-4 dark:bg-white/[0.05]">
          <div className="text-sm font-semibold">
            {t('กับงาน', 'Job fit')} · {s.role.fit}%
          </div>
          <div className="mt-2 space-y-1.5">
            {s.role.reasons.map((r) => (
              <div key={r.dim} className="flex items-center gap-1.5 text-xs">
                {r.kind === 'strong' ? <ThumbsUp size={12} className="text-emerald-500" /> : <AlertTriangle size={12} className="text-orange-500" />}
                <span className="flex-1">{t(r.label)}</span>
                <span className="tabular font-medium">{r.score}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-slate-900/[0.04] p-4 dark:bg-white/[0.05]">
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            <Users size={14} /> {t('กับทีม', 'Team fit')} {s.team ? `· ${s.team.fit}%` : ''}
          </div>
          {!s.team ? (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t('ตำแหน่งนี้ไม่ได้ระบุทีม', 'No team set for this role')}</p>
          ) : (
            <div className="mt-2 space-y-1.5 text-xs">
              {s.team.fills.map((f) => (
                <p key={f.en} className="text-emerald-700 dark:text-emerald-300">
                  + {t(f)}
                </p>
              ))}
              {s.team.risks.map((r) => (
                <p key={r.en} className="text-orange-700 dark:text-orange-300">
                  ! {t(r)}
                </p>
              ))}
              {!s.team.fills.length && !s.team.risks.length && <p className="text-slate-500 dark:text-slate-400">{t('เข้ากับทีมได้ปกติ', 'Fits the team normally')}</p>}
            </div>
          )}
          {s.manager && (
            <div className="mt-3 border-t border-slate-200/70 pt-3 text-xs dark:border-white/10">
              <div className="font-semibold">
                {t('กับหัวหน้า', 'Manager fit')} · {s.manager.fit}%
              </div>
              {s.manager.notes.slice(0, 2).map((n) => (
                <p key={n.text.en} className={cn('mt-1', n.good ? 'text-emerald-700 dark:text-emerald-300' : 'text-orange-700 dark:text-orange-300')}>
                  {t(n.text)}
                </p>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl bg-slate-900/[0.04] p-4 dark:bg-white/[0.05]">
          <div className="text-sm font-semibold">{t('พูด vs ทำ', 'Say vs do')}</div>
          <div className="mt-2 space-y-2 text-xs">
            <div>
              <div className="flex justify-between">
                <span>{t('นำเสนอตัวเอง', 'Self-presentation')}</span>
                <span className="tabular">{s.sayDo.say}</span>
              </div>
              <Meter value={s.sayDo.say} color="#ec4899" className="mt-1" />
            </div>
            <div>
              <div className="flex justify-between">
                <span>{c.external ? t('ส่งมอบงาน (ประเมินตนเอง)', 'Delivery (self-rated)') : t('ผลงานจากคนรอบตัว', 'Delivery (peer-rated)')}</span>
                <span className="tabular">{s.sayDo.do}</span>
              </div>
              <Meter value={s.sayDo.do} color="#10b981" className="mt-1" />
            </div>
            <p className="font-medium">{t(s.sayDo.title)}</p>
            {c.external && (
              <p className="text-slate-500 dark:text-slate-400">
                {t('ผู้สมัครภายนอกยังไม่มีการประเมินจากคนรอบตัว ให้ยืนยันจากงานตัวอย่างและการตรวจอ้างอิง', 'External applicants have no peer ratings yet; confirm with a work sample and reference checks')}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 font-semibold">
            <MessageCircleQuestion size={18} className="text-violet-500" /> {t(`คู่มือสัมภาษณ์สำหรับ${c.name}`, `Interview guide for ${c.name}`)}
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
        <ol className="mt-3 space-y-3">
          {s.interview.map((q, i) => (
            <li key={q.ask.en} className="rounded-2xl border border-slate-200 p-4 dark:border-white/10">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-300">
                {t('คำถามที่', 'Question')} {i + 1} · {t(q.why)}
              </div>
              <p className="mt-1 font-medium">{t(q.ask)}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t('ฟังหา', 'Listen for')}: {t(q.listen)}
              </p>
            </li>
          ))}
        </ol>
      </div>

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
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {t(
            'ผลนี้ใช้ประกอบการตัดสินใจเท่านั้น ให้ตัดสินจากหลักฐานในการสัมภาษณ์ งานตัวอย่าง และการตรวจอ้างอิงด้วย',
            'This supports decisions only. Decide using interview evidence, work samples and reference checks as well.',
          )}
        </p>
      </div>
    </div>
  )
}

function Compare({ role, rows }: { role: RoleSpec; rows: { c: Candidate; s: CandidateScore }[] }) {
  const t = useT()
  return (
    <div>
      <h2 className="pr-10 text-xl font-semibold">{t(`เปรียบเทียบสำหรับ${role.title}`, `Comparing for ${role.title}`)}</h2>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr>
              <th className="w-40" />
              {rows.map(({ c }) => (
                <th key={c.id} className="pb-3 text-center align-bottom">
                  <PersonaAvatar result={c.persona} size={56} showBadges={false} className="mx-auto" />
                  <div className="mt-1 font-semibold">{c.name}</div>
                  <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">{c.external ? t('ภายนอก', 'External') : t('ภายใน', 'Internal')}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
            <tr>
              <td className="py-2 font-semibold">{t('รวม', 'Overall')}</td>
              {rows.map(({ c, s }) => (
                <td key={c.id} className="tabular py-2 text-center font-display text-xl font-bold">
                  {s.overall}%
                </td>
              ))}
            </tr>
            {role.targets.map((x) => (
              <tr key={x.dim}>
                <td className="py-2">
                  <div className="font-medium">{t(dimMeta(x.dim).th, dimMeta(x.dim).en)}</div>
                  <div className="tabular text-[11px] text-slate-500 dark:text-slate-400">
                    {t('ต้องการ', 'Target')} {Math.max(0, x.center - x.half)}–{Math.min(100, x.center + x.half)}
                  </div>
                </td>
                {rows.map(({ c }) => {
                  const v = c.scores[x.dim]
                  const ok = Math.abs(v - x.center) <= x.half + 4
                  return (
                    <td key={c.id} className="px-2 py-2">
                      <div className="relative h-2.5 rounded-full bg-slate-900/[0.06] dark:bg-white/10">
                        <div
                          className="absolute inset-y-0 rounded-full bg-violet-500/25"
                          style={{ left: `${Math.max(0, x.center - x.half)}%`, width: `${Math.min(100, x.center + x.half) - Math.max(0, x.center - x.half)}%` }}
                        />
                        <div className={cn('absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white dark:border-slate-900', ok ? 'bg-emerald-500' : 'bg-orange-500')} style={{ left: `${v}%` }} />
                      </div>
                      <div className="tabular mt-1 text-center text-xs">{v}</div>
                    </td>
                  )
                })}
              </tr>
            ))}
            <tr>
              <td className="py-2 font-semibold">{t('พูด vs ทำ', 'Say vs do')}</td>
              {rows.map(({ c, s }) => (
                <td key={c.id} className="py-2 text-center text-xs">
                  {t(s.sayDo.title)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="py-2 font-semibold">{t('กับทีม', 'Team fit')}</td>
              {rows.map(({ c, s }) => (
                <td key={c.id} className="py-2 text-center text-xs">
                  {s.team ? `${s.team.fit}%${s.team.fills.length ? ` · ${t(s.team.fills[0])}` : ''}` : '—'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
