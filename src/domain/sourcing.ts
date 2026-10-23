import { tt, type T } from '@/lib/i18n'
import type { StaffMember } from './demo'
import { dimMeta } from './dimensions'
import { ENVIRONMENTS, JOB_LINES, type Target } from './fit'
import { sayDo, type SayDo } from './insights'
import {
  band, compareContext, CONTEXT_DIMS, interestAlignment, MANAGER_TEMPLATES, roleTypeById, ROLE_GROUPS, ROLE_TYPE_IDS, TEAM_TEMPLATES, topGaps, validRange, validWeights,
  type Band, type ContextDimId, type ContextGap, type GrowthRole, type Range, type RoleTypeId, type RoleWeights,
} from './roles'
import type { DimCode } from './types'

/* ------------------------------------------------------------------------------------------------
 * Sourcing (WorkFit spec §11, §12.2–12.5, §14): describe a vacancy as duties (role-interest
 * weights) and acceptable working-preference ranges, then look at internal and external people
 * one by one. Nothing here ranks, scores overall or rejects anyone: every signal is shown on its
 * own, unknown stays unknown, and the people deciding use interviews and evidence.
 * ---------------------------------------------------------------------------------------------- */

export type ManagerTemplateId = (typeof MANAGER_TEMPLATES)[number]['id']
export type TeamTemplateId = (typeof TEAM_TEMPLATES)[number]['id']

export interface RoleSpec {
  id: string
  title: string
  /** What the person will actually do, in the owner's words. */
  duties: string
  /** Who defined the weights and ranges and answers for them. */
  owner: string
  /** yyyy-mm-dd the owner last reviewed weights and ranges; null = not reviewed yet. */
  reviewedAt: string | null
  /** Duties as role-interest weights: ≥ 0, sum exactly 1. `{}` = duties not weighted yet. */
  roleWeights: RoleWeights
  /** Acceptable working-preference ranges (0–100, step 5). */
  contextRanges: Partial<Record<ContextDimId, Range>>
  managerTemplate?: ManagerTemplateId
  teamTemplate?: TeamTemplateId
  /** Team the person would join (internal staff already in it are not listed). */
  teamId?: string
  /** Optional style notes for the interview: conversation material only, never a score. */
  targets: Target[]
  jobLine?: string
  env?: string
  createdAt: string
  note?: string
}

/* ------------------------------------------- Stages -------------------------------------------- */

/** A stage is a note about what to look into next, not a pass or a fail. */
export type Stage = 'new' | 'screen' | 'interview' | 'offer' | 'hired' | 'declined'

export const STAGES: { id: Stage; th: string; en: string }[] = [
  { id: 'new', th: 'ยังไม่ได้ดู', en: 'Not reviewed' },
  { id: 'screen', th: 'ศึกษาเพิ่ม', en: 'Look into further' },
  { id: 'interview', th: 'นัดคุย', en: 'Conversation' },
  { id: 'offer', th: 'เสนองาน', en: 'Offer' },
  { id: 'hired', th: 'รับแล้ว', en: 'Hired' },
  { id: 'declined', th: 'ไม่ไปต่อ (ตัดสินโดยคน)', en: 'Not continuing (human decision)' },
]

export interface StageEntry {
  stage: Stage
  reason: string
  /** ISO timestamp of the last change; '' for entries migrated from before reasons were stored. */
  at: string
}

export interface Candidate extends StaffMember {
  external: boolean
  source?: T
  currentRole?: T
  /** ISO date the person applied (external) or was added to the pool (internal). */
  appliedAt?: string
}

/* ----------------------------------------- Role weights ---------------------------------------- */

export interface WeightCheck {
  ok: boolean
  /** Sum in percent, rounded to 0.1. */
  totalPct: number
  errors: T[]
}

/** Spec T-29: show the problem, never normalise silently. */
export const checkWeights = (w: RoleWeights): WeightCheck => {
  const errors: T[] = []
  const entries = Object.entries(w) as [RoleTypeId, number | undefined][]
  const finiteSum = entries.reduce((s, [, v]) => s + (v !== undefined && Number.isFinite(v) ? v : 0), 0)
  const totalPct = Math.round(finiteSum * 1000) / 10
  if (entries.length === 0) errors.push(tt('ยังไม่ได้กำหนดน้ำหนักหน้าที่ เลือกอย่างน้อย 1 บทบาท', 'Duties are not weighted yet. Pick at least one role type'))
  for (const [id, v] of entries) {
    if (v === undefined || !Number.isFinite(v)) errors.push(tt(`ใส่น้ำหนักของ “${roleTypeById(id).name.th}”`, `Enter a weight for “${roleTypeById(id).name.en}”`))
    else if (v < 0) errors.push(tt(`น้ำหนักของ “${roleTypeById(id).name.th}” ต้องไม่ติดลบ`, `The weight for “${roleTypeById(id).name.en}” cannot be negative`))
  }
  if (entries.length > 0 && Math.abs(finiteSum - 1) >= 1e-6)
    errors.push(tt(`น้ำหนักรวมต้องเท่ากับ 100% พอดี (ตอนนี้ ${totalPct}%) ระบบจะไม่ปรับให้เอง`, `Weights must add up to exactly 100% (now ${totalPct}%). Workfit will not adjust them for you`))
  return { ok: errors.length === 0 && validWeights(w), totalPct, errors }
}

/** UI works in percent; storage in fractions. Rounded to avoid 0.30000000000000004. */
export const pctToWeight = (pct: number) => Math.round(pct * 100) / 10000
export const weightToPct = (w: number) => Math.round(w * 10000) / 100

/**
 * "Start from a type": 60% the type, 40% its sibling in the same family. A starting point only —
 * the owner must review and change it to match the real duties before saving.
 */
export const weightsFromType = (id: RoleTypeId): RoleWeights => {
  const group = ROLE_GROUPS.find((g) => g.types.includes(id))!
  const sibling = group.types.find((x) => x !== id)!
  return { [id]: 0.6, [sibling]: 0.4 }
}

/** Weighted types, largest first (type index breaks ties). */
export const weightedTypes = (w: RoleWeights): { id: RoleTypeId; weight: number }[] =>
  ROLE_TYPE_IDS.filter((id) => (w[id] ?? 0) > 0)
    .map((id) => ({ id, weight: w[id]! }))
    .sort((a, b) => b.weight - a.weight || ROLE_TYPE_IDS.indexOf(a.id) - ROLE_TYPE_IDS.indexOf(b.id))

/* ----------------------------------------- Context ranges -------------------------------------- */

export const checkRanges = (ranges: Partial<Record<ContextDimId, Range>>): T[] =>
  (Object.entries(ranges) as [ContextDimId, Range][]).flatMap(([dim, r]) => {
    const d = CONTEXT_DIMS.find((x) => x.id === dim)!
    if (!validRange(r)) return [tt(`ช่วงของ “${d.name.th}” ไม่ถูกต้อง (ต่ำสุดต้องไม่เกินสูงสุด และอยู่ใน 0–100)`, `The range for “${d.name.en}” is invalid (min must not exceed max, within 0–100)`)]
    if (r.min % 5 !== 0 || r.max % 5 !== 0) return [tt(`ช่วงของ “${d.name.th}” ต้องปรับทีละ 5`, `The range for “${d.name.en}” must use steps of 5`)]
    return []
  })

/** Templates pre-fill a point range at the template anchor; the owner widens it as needed. */
export const managerTemplateRange = (id: ManagerTemplateId): Range => {
  const a = MANAGER_TEMPLATES.find((m) => m.id === id)!.anchor
  return { min: a, max: a }
}
export const teamTemplateRange = (id: TeamTemplateId): Range => {
  const a = TEAM_TEMPLATES.find((m) => m.id === id)!.anchor
  return { min: a, max: a }
}

/** Everything that blocks saving a role, in the order the owner should fix it. */
export const roleErrors = (r: RoleSpec): T[] => {
  const out: T[] = []
  if (!r.title.trim()) out.push(tt('ใส่ชื่อตำแหน่ง', 'Enter a role title'))
  if (!r.duties.trim()) out.push(tt('เขียนหน้าที่จริงของตำแหน่ง', 'Describe the real duties of the role'))
  out.push(...checkWeights(r.roleWeights).errors)
  out.push(...checkRanges(r.contextRanges))
  if (!r.owner.trim()) out.push(tt('ระบุเจ้าของข้อมูลตำแหน่ง (ผู้ทบทวน)', 'Name the owner who reviewed this role'))
  if (!r.reviewedAt) out.push(tt('ระบุวันที่ทบทวน', 'Set the review date'))
  return out
}

/* --------------------------------------- Style notes (optional) -------------------------------- */

/** Style notes from a job-area template, optionally with an environment's notes. Conversation material only. */
export const targetsFromTemplate = (jobLine?: string, env?: string): Target[] => {
  const base = JOB_LINES.find((j) => j.id === jobLine)?.targets ?? []
  const extra = ENVIRONMENTS.find((e) => e.id === env)?.targets ?? []
  const out = [...base]
  for (const t of extra) if (!out.some((o) => o.dim === t.dim)) out.push({ ...t, weight: 1 })
  return out.map((t) => ({ ...t }))
}

/** What the team is missing, as style notes worth talking about. */
export const targetsFromTeamGaps = (team: StaffMember[]): Target[] => {
  const out: Target[] = []
  const none = (dim: DimCode, test: (v: number) => boolean) => !team.some((m) => test(m.scores[dim]))
  if (none('MP', (v) => v <= 40)) out.push({ dim: 'MP', center: 25, half: 15, weight: 2 })
  if (none('KJ', (v) => v <= 40)) out.push({ dim: 'KJ', center: 30, half: 15, weight: 2 })
  if (none('O', (v) => v >= 60)) out.push({ dim: 'O', center: 75, half: 15, weight: 2 })
  if (none('LD', (v) => v >= 60)) out.push({ dim: 'LD', center: 75, half: 15, weight: 2 })
  if (none('PC', (v) => v <= 40)) out.push({ dim: 'PC', center: 30, half: 15, weight: 1 })
  return out
}

/* ------------------------------------------- Filters ------------------------------------------- */

export interface CandidateFilters {
  /** Primary OR secondary role type is one of these. `no_dominant` and no-data never match. */
  types: RoleTypeId[]
  growth: GrowthRole[]
  /** Per dimension: the person's band is one of these. Each dimension is its own AND group. */
  bands: Partial<Record<ContextDimId, Band[]>>
}

export const emptyFilters = (): CandidateFilters => ({ types: [], growth: [], bands: {} })

export const activeFilterCount = (f: CandidateFilters) =>
  (f.types.length ? 1 : 0) + (f.growth.length ? 1 : 0) + Object.values(f.bands).filter((b) => b && b.length).length

/** OR within a group, AND across groups (spec T-20). */
export const matchesFilters = (c: Pick<Candidate, 'roleClass' | 'growthRoles' | 'context'>, f: CandidateFilters): boolean => {
  if (f.types.length) {
    const rc = c.roleClass
    if (!rc || rc.state === 'no_dominant') return false
    const mine = [rc.primary, rc.secondary].filter((x): x is RoleTypeId => x !== null)
    if (!mine.some((x) => f.types.includes(x))) return false
  }
  if (f.growth.length && !c.growthRoles.some((g) => f.growth.includes(g))) return false
  for (const [dim, wanted] of Object.entries(f.bands) as [ContextDimId, Band[] | undefined][]) {
    if (wanted && wanted.length && !wanted.includes(band(c.context[dim]))) return false
  }
  return true
}

/** Toggle a value inside a filter group. */
export const toggleIn = <X,>(xs: X[], x: X): X[] => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x])

/* -------------------------------------------- Sorting ------------------------------------------ */

export type SortBy = 'name' | 'date'

/** Sample data has no application dates; give each sample person a stable one so date sorting works. */
const SAMPLE_DAY0 = Date.UTC(2026, 9, 22)
export const appliedAtOf = (c: Pick<Candidate, 'id' | 'appliedAt'>): string => {
  if (c.appliedAt) return c.appliedAt
  let h = 0
  for (const ch of c.id) h = (h * 31 + ch.charCodeAt(0)) % 997
  return new Date(SAMPLE_DAY0 - (h % 45) * 86_400_000).toISOString().slice(0, 10)
}

/** Name (Thai collation) or newest first. Never by any score. */
export const sortCandidates = <C extends Pick<Candidate, 'id' | 'name' | 'appliedAt'>>(list: C[], by: SortBy): C[] => {
  const byName = (a: C, b: C) => a.name.localeCompare(b.name, 'th') || a.id.localeCompare(b.id)
  return [...list].sort(by === 'name' ? byName : (a, b) => appliedAtOf(b).localeCompare(appliedAtOf(a)) || byName(a, b))
}

/* -------------------------------------------- Compare ------------------------------------------ */

export const COMPARE_MAX = 3
export const COMPARE_MIN = 2

/** Spec T-21: a 4th person is refused and the existing selection stays as it was. */
export const toggleCompare = (sel: string[], id: string, max = COMPARE_MAX): { selection: string[]; refused: boolean } => {
  if (sel.includes(id)) return { selection: sel.filter((x) => x !== id), refused: false }
  if (sel.length >= max) return { selection: sel, refused: true }
  return { selection: [...sel, id], refused: false }
}

/* ----------------------------------------- Per-person view ------------------------------------- */

export interface CandidateView {
  /** "Interest matches the defined duties X/100"; null = no role data or duties not weighted. */
  alignment: number | null
  gaps: ContextGap[]
  /** Up to 3 largest known context distances; `discuss` = worth agreeing (> 25). */
  topGaps: ContextGap[]
  sayDo: SayDo
  interview: InterviewQuestion[]
}

export const describeCandidate = (role: RoleSpec, c: Candidate): CandidateView => {
  const alignment = c.roleScores ? interestAlignment(c.roleScores, role.roleWeights) : null
  const gaps = compareContext(c.context, role.contextRanges)
  // External candidates have no 360 yet: delivery stays self-reported until references are checked.
  const sd = sayDo(c.scores, c.external ? undefined : c.observedDelivery)
  return { alignment, gaps, topGaps: topGaps(gaps), sayDo: sd, interview: interviewGuide(role, c, gaps, sd) }
}

/* ---------------------------------------- Interview guide -------------------------------------- */

export interface InterviewQuestion {
  kind: 'duty' | 'missing' | 'agree' | 'evidence' | 'style'
  dim?: DimCode
  why: T
  ask: T
  listen: T
}

type Probe = { ask: T; listen: T }
const pr = (ask: [string, string], listen: [string, string]): Probe => ({ ask: tt(...ask), listen: tt(...listen) })

/** Neutral questions for a working preference we know nothing about yet. */
const CONTEXT_ASK: Record<ContextDimId, Probe> = {
  autonomy: pr(['งานแบบไหนที่คุณอยากได้แนวทางชัด และแบบไหนที่อยากเลือกวิธีเอง', 'Which work do you want clear guidance on, and which would you rather do your own way?'], ['ตัวอย่างจริงทั้งสองแบบ ไม่มีคำตอบถูกผิด', 'Real examples of both; there is no right answer']),
  change: pr(['เล่าช่วงที่งานเปลี่ยนบ่อย และช่วงที่งานคงที่ ช่วงไหนคุณทำงานได้ดีกว่า เพราะอะไร', 'Describe a period of frequent change and a steady one. Which suited your work better, and why?'], ['สิ่งที่ช่วยให้เขาทำงานได้ดีในแต่ละแบบ', 'What helped them work well in each']),
  disagreement: pr(['เวลาไม่เห็นด้วยกับแผนของทีม ปกติคุณบอกอย่างไร และเมื่อไร', 'When you disagree with the team’s plan, how and when do you usually say so?'], ['วิธีที่เขาใช้จริง และสิ่งที่ทีมควรรู้', 'The way they actually do it, and what the team should know']),
  collaboration: pr(['ในหนึ่งสัปดาห์ คุณอยากมีเวลาทำงานลึกคนเดียวกับเวลาคุยร่วมกันสัดส่วนประมาณไหน', 'In a typical week, how would you like to split deep solo work and time working together?'], ['สัดส่วนที่เขาบอกเอง ไม่ใช่ที่เราเดา', 'The split in their own words, not our guess']),
  experimentation: pr(['เมื่อได้งานที่ยังไม่มีใครทำมาก่อน คุณเริ่มจากตรวจสอบก่อน หรือทดลองเล็ก ๆ ก่อน', 'With work nobody has done before, do you start by checking first or by trying something small?'], ['ตัวอย่างการเริ่มงานจริง', 'A real example of how they started']),
  leadership_interest: pr(['ในอีก 1–2 ปี คุณอยากลึกในงานเฉพาะด้าน หรืออยากมีบทบาทกำหนดทิศทางและช่วยทีมมากขึ้น', 'In 1–2 years, would you rather go deeper in specialist work or take more part in setting direction and helping the team?'], ['ความสนใจของเขาเอง ไม่ใช่ความสามารถ', 'Their own interest, not ability']),
}

/** Behavioural questions for a style note the role owner wrote (asked of everyone, whatever their profile). */
const STYLE_PROBES: Partial<Record<DimCode, { high: Probe; low: Probe }>> = {
  KJ: {
    low: pr(['เล่าครั้งที่คุณไม่เห็นด้วยกับหัวหน้าหรือรุ่นพี่ คุณพูดอะไร และผลเป็นอย่างไร', 'Tell me about a time you disagreed with a boss or senior colleague. What did you say, and what happened?'], ['สิ่งที่ทำจริง เหตุผลและจังหวะ', 'What they actually did, their reasons and timing']),
    high: pr(['เล่าครั้งที่ต้องรักษาความสัมพันธ์กับลูกค้าหรือผู้ใหญ่ แม้คุณไม่เห็นด้วย', 'Tell me about a time you protected a relationship with a customer or senior person even though you disagreed.'], ['ถนอมน้ำใจได้โดยไม่เสียงาน', 'Kept goodwill without hurting the work']),
  },
  C: {
    high: pr(['งานที่มีรายละเอียดมากที่สุดที่คุณเคยรับผิดชอบคืออะไร คุณตรวจความถูกต้องอย่างไร', 'What is the most detailed work you have owned? How did you check it was right?'], ['วิธีตรวจซ้ำที่ใช้จริง', 'A checking method they really used']),
    low: pr(['ถ้าแผนเปลี่ยนทุกวัน คุณจัดการงานอย่างไร', 'If the plan changed every day, how would you manage your work?'], ['ยืดหยุ่นแต่ยังส่งงานได้', 'Flexible yet still delivers']),
  },
  O: {
    high: pr(['ไอเดียใหม่ล่าสุดที่คุณทำให้เกิดขึ้นจริงคืออะไร เริ่มจากตรงไหน', 'What is the latest new idea you actually made happen? Where did you start?'], ['ไอเดียที่ทำจริง ไม่ใช่แค่คิด', 'An idea they delivered, not just imagined']),
    low: pr(['เล่าครั้งที่คุณต้องทำตามวิธีที่พิสูจน์แล้ว ทั้งที่มีคนเสนอวิธีใหม่', 'Tell me about a time you kept to a proven method although someone proposed a new one.'], ['ยึดมาตรฐานโดยไม่ปิดกั้น', 'Upheld standards without shutting ideas down']),
  },
  LD: {
    high: pr(['เล่าครั้งที่คุณต้องนำทีมโดยไม่มีตำแหน่ง ทำให้คนอื่นตามอย่างไร', 'Tell me about leading without a title. How did you get people to follow?'], ['สิ่งที่ทำและผลลัพธ์', 'What they did and the result']),
    low: pr(['เล่าครั้งที่คุณช่วยให้หัวหน้าหรือเพื่อนประสบความสำเร็จ', 'Tell me about a time you helped a boss or colleague succeed.'], ['วิธีสนับสนุนที่ใช้จริง', 'How they actually supported']),
  },
  PC: {
    high: pr(['เล่าครั้งที่ต้องตัดสินใจเร็วทั้งที่ข้อมูลไม่ครบ ผลเป็นอย่างไร', 'Tell me about a fast decision you made with incomplete information. How did it turn out?'], ['การตัดสินใจและการรับผิดชอบผล', 'The decision and how they owned the outcome']),
    low: pr(['เล่าครั้งที่การตรวจสอบอย่างละเอียดช่วยกันปัญหาใหญ่ได้', 'Tell me about a time careful checking prevented a big problem.'], ['รอบคอบโดยไม่ช้าเกินไป', 'Careful without being too slow']),
  },
  MP: {
    low: pr(['เล่าครั้งที่คุณพบข้อผิดพลาดในตัวเลขหรือรายละเอียดก่อนคนอื่น', 'Tell me about a time you caught an error in numbers or details before anyone else.'], ['วิธีตรวจที่ใช้จริง', 'The method they used to check']),
    high: pr(['ถ้าแผนเปลี่ยนกะทันหันหนึ่งชั่วโมงก่อนเริ่มงาน คุณทำอย่างไร', 'If the plan changed an hour before you started, what would you do?'], ['ยืดหยุ่นโดยไม่ตื่นตระหนก', 'Flexible without panic']),
  },
  CO: {
    high: pr(['เล่าโปรเจกต์ที่ต้องประสานหลายฝ่าย คุณทำให้ทุกคนไปทางเดียวกันอย่างไร', 'Tell me about a project across many teams. How did you get everyone aligned?'], ['สิ่งที่ทำจริงเพื่อประสาน', 'What they actually did to coordinate']),
    low: pr(['เล่างานที่คุณรับผิดชอบเองตั้งแต่ต้นจนจบ', 'Tell me about work you owned from start to finish.'], ['ทำงานอิสระได้ครบถ้วน', 'Delivered independently and completely']),
  },
  CH: {
    high: pr(['เล่าการเปลี่ยนแปลงครั้งใหญ่ที่คุณเคยเจอ คุณปรับตัวอย่างไร', 'Tell me about a big change you went through. How did you adapt?'], ['วิธีปรับตัวที่ใช้จริง', 'How they actually adapted']),
    low: pr(['งานประจำที่คุณทำซ้ำได้ดีต่อเนื่องนานที่สุดคืออะไร', 'What routine work have you done well for the longest time?'], ['ความสม่ำเสมอ', 'Consistency']),
  },
}

/**
 * Questions about the duties and about what we do not know yet (spec §14.5). Duty questions come
 * from the role's weights and are the same for everyone; they never try to confirm a type label.
 */
export const interviewGuide = (role: RoleSpec, c: Pick<Candidate, 'roleScores' | 'growthRoles' | 'external'>, gaps: ContextGap[], sd: SayDo): InterviewQuestion[] => {
  const qs: InterviewQuestion[] = []
  // 1. The two heaviest duties: ask for real examples of doing that work.
  for (const { id, weight } of weightedTypes(role.roleWeights).slice(0, 2)) {
    const rt = roleTypeById(id)
    qs.push({
      kind: 'duty',
      why: tt(`หน้าที่ ${weightToPct(weight)}% ของตำแหน่ง: ${rt.tasks.th}`, `${weightToPct(weight)}% of the duties: ${rt.tasks.en}`),
      ask: tt(`เล่างานจริงที่คุณเคย${rt.tasks.th.split(' ')[0]} คุณทำอะไร ใช้เวลาเท่าไร และผลเป็นอย่างไร`, `Tell me about real work where you were ${rt.tasks.en.split(',')[0].toLowerCase()}. What did you do, how long did it take and what came of it?`),
      listen: tt(`หลักฐานทักษะที่ต้องตรวจแยก: ${rt.skills.map((s) => s.th).join(', ')} และงานส่วนไหนที่เขาอยากทำมากหรือน้อยลง`, `Evidence for the skills checked separately: ${rt.skills.map((s) => s.en).join(', ')}, and which parts they want more or less of`),
    })
  }
  // 2. Missing information first, before anything else.
  if (!c.roleScores)
    qs.push({
      kind: 'missing',
      why: tt('ยังไม่มีข้อมูลความสนใจบทบาท', 'No role-interest data yet'),
      ask: tt('จากหน้าที่ของตำแหน่งนี้ ส่วนไหนที่คุณอยากทำมากที่สุด และส่วนไหนที่อยากทำน้อยที่สุด', 'Of this role’s duties, which part would you most like to do, and which least?'),
      listen: tt('คำตอบของเขาเอง ไม่ต้องเดาจากบุคลิก', 'Their own answer; do not infer it from personality'),
    })
  for (const g of gaps.filter((x) => x.distance === null).slice(0, 2)) {
    const d = CONTEXT_DIMS.find((x) => x.id === g.dim)!
    qs.push({ kind: 'missing', why: tt(`ยังไม่มีข้อมูล “${d.name.th}”`, `No data yet on “${d.name.en}”`), ...CONTEXT_ASK[g.dim] })
  }
  if (!c.growthRoles.length)
    qs.push({
      kind: 'missing',
      why: tt('ยังไม่มีข้อมูลบทบาทที่อยากเติบโต', 'No desired growth roles yet'),
      ask: tt('ในอีก 1–2 ปี คุณอยากเติบโตไปในบทบาทแบบไหน', 'In 1–2 years, what kind of role would you like to grow into?'),
      listen: tt('ความสนใจของเขาเอง', 'Their own interest'),
    })
  // 3. Working preferences worth agreeing (distance > 25): a conversation, not a mark against them.
  for (const g of topGaps(gaps).filter((x) => x.discuss)) {
    const d = CONTEXT_DIMS.find((x) => x.id === g.dim)!
    qs.push({
      kind: 'agree',
      why: tt(`ควรตกลงร่วมกัน: “${d.name.th}” ตำแหน่งนี้อยู่ที่ ${g.range.min}–${g.range.max}`, `Worth agreeing: “${d.name.en}” is ${g.range.min}–${g.range.max} in this role`),
      ask: tt(`ตำแหน่งนี้ ${d.name.th} อยู่ประมาณ ${g.range.min}–${g.range.max} (${d.low.th} ↔ ${d.high.th}) ถ้าเป็นแบบนี้ อะไรที่จะช่วยให้คุณทำงานได้ดี`, `In this role, ${d.name.en.toLowerCase()} sits around ${g.range.min}–${g.range.max} (${d.low.en} ↔ ${d.high.en}). What would help you work well in that setup?`),
      listen: tt('สิ่งที่ตกลงกันได้ทั้งสองฝ่าย', 'What both sides can agree on'),
    })
  }
  // 4. Talk vs. do: change the format, not the verdict.
  if (sd.kind === 'talk-over-do')
    qs.push({
      kind: 'evidence',
      why: tt('ขอหลักฐานผลงานควบคู่กับการพูดคุย', 'Ask for evidence of results alongside the conversation'),
      ask: tt('ให้ทำงานตัวอย่างจริง 30–60 นาที และขอผลลัพธ์เป็นตัวเลขจากงานเดิม', 'Set a real 30–60 minute work sample and ask for numbers from past work'),
      listen: tt('ตรวจอ้างอิงเรื่องผลงานที่วัดได้ ไม่ใช่บุคลิก', 'Check references on measurable results, not personality'),
    })
  if (sd.kind === 'quiet-achiever')
    qs.push({
      kind: 'evidence',
      why: tt('อาจขายตัวเองไม่เก่งในห้องสัมภาษณ์', 'May undersell themselves in an interview'),
      ask: tt('ใช้งานตัวอย่างหรือให้เล่าผลงานทีละขั้น แทนการให้พรีเซนต์ตัวเอง', 'Use a work sample or walk through past work step by step instead of a self-pitch'),
      listen: tt('ดูคุณภาพงานจริง อย่าตัดสินจากความมั่นใจในการพูด', 'Judge the work, not speaking confidence'),
    })
  // 5. One style note the owner wrote, if any: asked the same way of everyone.
  const note = [...role.targets].sort((a, b) => b.weight - a.weight).find((x) => STYLE_PROBES[x.dim])
  if (note) {
    const want = note.center >= 50 ? 'high' : 'low'
    const meta = dimMeta(note.dim)
    const pole = want === 'high' ? meta.high : meta.low
    qs.push({ kind: 'style', dim: note.dim, why: tt(`โน้ตสไตล์จากเจ้าของตำแหน่ง: “${pole.th}”`, `Style note from the role owner: “${pole.en}”`), ...STYLE_PROBES[note.dim]![want] })
  }
  return qs.slice(0, 7)
}

/* --------------------------------------------- Misc -------------------------------------------- */

export const todayIso = () => new Date().toISOString().slice(0, 10)

export const blankRole = (): RoleSpec => ({
  id: `role-${Date.now().toString(36)}`,
  title: '',
  duties: '',
  owner: '',
  reviewedAt: null,
  roleWeights: {},
  contextRanges: {},
  targets: [],
  createdAt: new Date().toISOString(),
})

/** Fill fields that roles saved before the duty/range model did not have. */
export const upgradeRole = (r: Partial<RoleSpec> & { id: string; title?: string; managerStyle?: string }): RoleSpec => {
  const { managerStyle, ...rest } = r
  const fromStyle: Record<string, ManagerTemplateId> = { directive: 'structured', coach: 'balanced', challenger: 'balanced', family: 'balanced', handsoff: 'autonomous' }
  return {
    ...rest,
    title: r.title ?? '',
    duties: r.duties ?? r.note ?? '',
    owner: r.owner ?? '',
    reviewedAt: r.reviewedAt ?? null,
    roleWeights: r.roleWeights ?? {},
    contextRanges: r.contextRanges ?? {},
    managerTemplate: r.managerTemplate ?? (managerStyle ? fromStyle[managerStyle] : undefined),
    targets: r.targets ?? [],
    createdAt: r.createdAt ?? new Date().toISOString(),
  }
}
