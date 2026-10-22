import { tt, type T } from '@/lib/i18n'
import type { StaffMember } from './demo'
import { DIM_CODES, dimMeta } from './dimensions'
import { ENVIRONMENTS, JOB_LINES, managerFit, roleFit, type ManagerStyleId, type Target } from './fit'
import { sayDo, type SayDo } from './insights'
import type { DimCode, Scores } from './types'

/* ------------------------------------------------------------------------------------------------
 * Sourcing: turn a vacancy into a target profile, then rank internal and external candidates
 * against it — the job, the team they would join and the manager they would report to — with
 * reasons and an interview guide aimed at each candidate's watch-outs.
 * Decision support only: nothing here rejects anyone automatically.
 * ---------------------------------------------------------------------------------------------- */

export interface RoleSpec {
  id: string
  title: string
  jobLine?: string
  env?: string
  managerStyle?: ManagerStyleId
  teamId?: string
  targets: Target[]
  createdAt: string
  note?: string
}

export type Stage = 'new' | 'screen' | 'interview' | 'offer' | 'hired' | 'declined'

export const STAGES: { id: Stage; th: string; en: string }[] = [
  { id: 'new', th: 'ใหม่', en: 'New' },
  { id: 'screen', th: 'คัดกรอง', en: 'Screening' },
  { id: 'interview', th: 'สัมภาษณ์', en: 'Interview' },
  { id: 'offer', th: 'เสนองาน', en: 'Offer' },
  { id: 'hired', th: 'รับแล้ว', en: 'Hired' },
  { id: 'declined', th: 'ไม่ไปต่อ', en: 'Declined' },
]

export interface Candidate extends StaffMember {
  external: boolean
  source?: T
  currentRole?: T
}

/** Start a role from a job-line template, optionally blended with an environment's demands. */
export const targetsFromTemplate = (jobLine?: string, env?: string): Target[] => {
  const base = JOB_LINES.find((j) => j.id === jobLine)?.targets ?? []
  const extra = ENVIRONMENTS.find((e) => e.id === env)?.targets ?? []
  const out = [...base]
  for (const t of extra) if (!out.some((o) => o.dim === t.dim)) out.push({ ...t, weight: 1 })
  return out.map((t) => ({ ...t }))
}

/**
 * "Clone your best people": targets from 2+ strong performers. Keep only dimensions where the
 * benchmarks agree (low spread) and lean clearly to one side — those are what the role really asks for.
 */
export const targetsFromBenchmarks = (people: Pick<StaffMember, 'scores'>[]): Target[] => {
  if (people.length < 2) return []
  const rows = DIM_CODES.map((dim) => {
    const xs = people.map((p) => p.scores[dim])
    const mean = xs.reduce((a, b) => a + b, 0) / xs.length
    const sd = Math.sqrt(xs.reduce((a, b) => a + (b - mean) ** 2, 0) / xs.length)
    return { dim, mean, sd, lean: Math.abs(mean - 50) }
  })
  return rows
    .filter((r) => r.sd <= 16 && r.lean >= 12)
    .sort((a, b) => b.lean - a.lean)
    .slice(0, 6)
    .map((r) => ({
      dim: r.dim,
      center: Math.round(r.mean),
      half: Math.round(Math.max(10, r.sd + 6)),
      weight: (r.lean >= 25 ? 3 : 2) as Target['weight'],
    }))
}

/** What the team is missing, as targets a new hire could fill. */
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

/* ------------------------------------------- Scoring ------------------------------------------- */

export interface TeamFit {
  fit: number
  fills: T[]
  risks: T[]
}

const GAP_TESTS: { dim: DimCode; need: (v: number) => boolean; text: T }[] = [
  { dim: 'MP', need: (v) => v <= 40, text: tt('เติมคนสายเป๊ะที่ทีมยังไม่มี', 'Adds the precision the team lacks') },
  { dim: 'KJ', need: (v) => v <= 40, text: tt('เติมคนกล้าพูดตรงที่ทีมยังไม่มี', 'Adds a voice that speaks up') },
  { dim: 'O', need: (v) => v >= 60, text: tt('เติมคนสายไอเดียใหม่ที่ทีมยังไม่มี', 'Adds the new ideas the team lacks') },
  { dim: 'LD', need: (v) => v >= 60, text: tt('เติมคนพร้อมนำที่ทีมยังไม่มี', 'Adds someone ready to lead') },
  { dim: 'PC', need: (v) => v <= 40, text: tt('เติมคนสายรอบคอบที่ทีมยังไม่มี', 'Adds a careful thinker') },
]

/** Complement, not clone: reward filling the team's blind spots, flag joining a clique or a power clash. */
export const teamFit = (c: Pick<StaffMember, 'scores' | 'persona'>, team: StaffMember[]): TeamFit => {
  if (!team.length) return { fit: 70, fills: [], risks: [] }
  const fills: T[] = []
  const risks: T[] = []
  for (const g of GAP_TESTS) {
    const teamHas = team.some((m) => g.need(m.scores[g.dim]))
    if (!teamHas && g.need(c.scores[g.dim])) fills.push(g.text)
  }
  const sameFamily = team.filter((m) => m.persona.family === c.persona.family).length
  if (sameFamily / team.length >= 0.5) risks.push(tt('สไตล์ซ้ำกับคนส่วนใหญ่ในทีม อาจเพิ่มจุดบอดเดิม', 'Same style as most of the team; may deepen existing blind spots'))
  const cliqueish = (s: Scores) => (s.BK + s.SN + s.SK + (100 - s.H)) / 4 >= 60
  if (cliqueish(c.scores) && team.filter((m) => cliqueish(m.scores)).length >= 2)
    risks.push(tt('ผูกกลุ่มสูงเหมือนกลุ่มเดิมในทีม เสี่ยงแบ่งพรรคแบ่งพวก', 'Strong in-group pull like an existing clique; risk of factions'))
  const dominant = (s: Scores) => (s.LD + (100 - s.KJ) + (100 - s.A) + (100 - s.H)) / 4 >= 62
  const quiet = (s: Scores) => (s.KJ + s.FC + (100 - s.X) + (100 - s.E)) / 4 >= 60
  if (dominant(c.scores) && team.some((m) => quiet(m.scores))) risks.push(tt('พลังนำสูง ขณะที่ทีมมีคนไม่กล้าส่งเสียง ต้องดูแลเรื่องการรับฟัง', 'Strong drive to lead in a team with quiet members; watch listening'))
  if (team.filter((m) => m.scores.LD >= 70).length >= 2 && c.scores.LD >= 70) risks.push(tt('ทีมมีคนอยากนำหลายคนแล้ว อาจชิงบทบาทกัน', 'The team already has several would-be leaders; possible role clash'))
  const fit = Math.max(0, Math.min(100, 65 + fills.length * 12 - risks.length * 12))
  return { fit, fills, risks }
}

export interface CandidateScore {
  overall: number
  role: ReturnType<typeof roleFit>
  team?: TeamFit
  manager?: { fit: number; notes: { text: T; good: boolean }[] }
  sayDo: SayDo
  interview: InterviewQuestion[]
}

export const scoreCandidate = (role: RoleSpec, c: Candidate, teamMembers: StaffMember[]): CandidateScore => {
  const r = roleFit(c.scores, { id: role.id, th: role.title, en: role.title, targets: role.targets })
  const team = role.teamId ? teamFit(c, teamMembers.filter((m) => m.id !== c.id)) : undefined
  const mgr = role.managerStyle ? managerFit(c.scores).find((m) => m.style === role.managerStyle) : undefined
  const parts: [number, number][] = [[r.fit, 0.6]]
  if (team) parts.push([team.fit, 0.2])
  if (mgr) parts.push([mgr.fit, 0.2])
  const totalW = parts.reduce((s, [, w]) => s + w, 0)
  const overall = Math.round(parts.reduce((s, [v, w]) => s + v * w, 0) / totalW)
  // External candidates have no 360 yet: delivery stays self-reported until references are checked.
  const sd = sayDo(c.scores, c.external ? undefined : c.observedDelivery)
  return {
    overall,
    role: r,
    team,
    manager: mgr ? { fit: mgr.fit, notes: mgr.notes } : undefined,
    sayDo: sd,
    interview: interviewGuide(role, c.scores, sd),
  }
}

/* ---------------------------------------- Interview guide -------------------------------------- */

export interface InterviewQuestion {
  dim?: DimCode
  why: T
  ask: T
  listen: T
}

type Probe = { ask: T; listen: T }
const pr = (ask: [string, string], listen: [string, string]): Probe => ({ ask: tt(...ask), listen: tt(...listen) })

/** Behavioural questions keyed by "the role needs this pole but the candidate leans the other way". */
const PROBES: Partial<Record<DimCode, { high: Probe; low: Probe }>> = {
  KJ: {
    low: pr(['เล่าครั้งที่คุณไม่เห็นด้วยกับหัวหน้าหรือรุ่นพี่ คุณพูดอะไร และผลเป็นอย่างไร', 'Tell me about a time you disagreed with a boss or senior colleague. What did you say, and what happened?'], ['พูดออกมาจริงหรือไม่ ใช้เหตุผลและจังหวะเหมาะสมหรือเปล่า', 'Did they actually speak up, with sound reasons and good timing?']),
    high: pr(['เล่าครั้งที่ต้องรักษาความสัมพันธ์กับลูกค้าหรือผู้ใหญ่ แม้คุณไม่เห็นด้วย', 'Tell me about a time you protected a relationship with a customer or senior person even though you disagreed.'], ['ถนอมน้ำใจได้โดยไม่เสียงาน', 'Kept goodwill without hurting the work']),
  },
  E: {
    high: pr(['เล่าวันที่กดดันที่สุดในงานที่ผ่านมา คุณจัดการตัวเองและงานอย่างไร', 'Describe your most stressful day at work. How did you manage yourself and the work?'], ['สงบ ตั้งลำดับความสำคัญได้ ไม่โทษคนอื่น', 'Stayed calm, prioritised, did not blame others']),
    low: pr(['งานแบบไหนที่ทำให้คุณรู้สึกสบายใจและทำได้ดีที่สุด', 'What kind of work lets you feel at ease and do your best?'], ['ความต้องการสภาพแวดล้อมที่มั่นคง', 'Need for a stable environment']),
  },
  X: {
    high: pr(['ถ้าต้องเริ่มคุยกับคนที่ไม่รู้จักวันละหลายสิบคน คุณจะทำอย่างไรให้มีพลังตลอดวัน', 'If you had to start conversations with dozens of strangers a day, how would you keep your energy up?'], ['มีวิธีจริง ไม่ใช่แค่บอกว่าชอบคน', 'Real methods, not just “I like people”']),
    low: pr(['เล่างานที่ต้องใช้สมาธิคนเดียวนาน ๆ คุณทำได้ดีแค่ไหน', 'Tell me about work that needed long solo focus. How well did you do?'], ['โฟกัสได้ต่อเนื่องโดยไม่ต้องมีคนกระตุ้น', 'Sustained focus without outside push']),
  },
  A: {
    high: pr(['เล่าครั้งที่ขัดแย้งกับเพื่อนร่วมงาน คุณคลี่คลายอย่างไร', 'Tell me about a conflict with a colleague. How did you resolve it?'], ['มองมุมอีกฝ่าย หาทางออกร่วม', "Saw the other side and found a shared solution"]),
    low: pr(['เล่าครั้งที่ต้องยืนยันเรื่องที่ถูกต้องแม้คนอื่นไม่พอใจ', 'Tell me about a time you stood firm on the right thing even though others were unhappy.'], ['กล้ายืนหยัดอย่างมีเหตุผล', 'Stood firm with good reasons']),
  },
  C: {
    high: pr(['งานที่มีรายละเอียดมากที่สุดที่คุณเคยรับผิดชอบคืออะไร คุณตรวจความถูกต้องอย่างไร', 'What is the most detailed work you have owned? How did you check it was right?'], ['มีระบบตรวจซ้ำจริง ส่งตรงเวลา', 'A real checking system and on-time delivery']),
    low: pr(['ถ้าแผนเปลี่ยนทุกวัน คุณจัดการงานอย่างไร', 'If the plan changed every day, how would you manage your work?'], ['ยืดหยุ่นแต่ยังส่งงานได้', 'Flexible yet still delivers']),
  },
  O: {
    high: pr(['ไอเดียใหม่ล่าสุดที่คุณทำให้เกิดขึ้นจริงคืออะไร เริ่มจากตรงไหน', 'What is the latest new idea you actually made happen? Where did you start?'], ['ไอเดียที่ทำจริง ไม่ใช่แค่คิด', 'An idea they delivered, not just imagined']),
    low: pr(['เล่าครั้งที่คุณต้องทำตามวิธีที่พิสูจน์แล้ว ทั้งที่มีคนเสนอวิธีใหม่', 'Tell me about a time you kept to a proven method although someone proposed a new one.'], ['ยึดมาตรฐานโดยไม่ปิดกั้น', 'Upheld standards without shutting ideas down']),
  },
  H: {
    high: pr(['เล่าครั้งที่มีคนเสนอทางลัดที่ไม่ถูกต้องให้คุณ คุณทำอย่างไร', 'Tell me about a time someone offered you an improper shortcut. What did you do?'], ['ซื่อตรงสม่ำเสมอ', 'Consistent integrity']),
    low: pr(['เล่าครั้งที่คุณต่อรองเพื่อผลประโยชน์ของทีม', "Tell me about a time you negotiated for your team's benefit."], ['ต่อรองได้โดยไม่เสียความน่าเชื่อถือ', 'Negotiated without losing credibility']),
  },
  LD: {
    high: pr(['เล่าครั้งที่คุณต้องนำทีมโดยไม่มีตำแหน่ง ทำให้คนอื่นตามอย่างไร', 'Tell me about leading without a title. How did you get people to follow?'], ['นำด้วยการกระทำ มีผลลัพธ์ชัด', 'Led by example with clear results']),
    low: pr(['เล่าครั้งที่คุณช่วยให้หัวหน้าหรือเพื่อนประสบความสำเร็จ', 'Tell me about a time you helped a boss or colleague succeed.'], ['สนับสนุนอย่างเต็มใจ', 'Supported willingly']),
  },
  PC: {
    high: pr(['เล่าครั้งที่ต้องตัดสินใจเร็วทั้งที่ข้อมูลไม่ครบ ผลเป็นอย่างไร', 'Tell me about a fast decision you made with incomplete information. How did it turn out?'], ['กล้าตัดสินใจและรับผิดชอบผล', 'Decided and owned the outcome']),
    low: pr(['เล่าครั้งที่การตรวจสอบอย่างละเอียดช่วยกันปัญหาใหญ่ได้', 'Tell me about a time careful checking prevented a big problem.'], ['รอบคอบโดยไม่ช้าเกินไป', 'Careful without being too slow']),
  },
  CO: {
    high: pr(['เล่าโปรเจกต์ที่ต้องประสานหลายฝ่าย คุณทำให้ทุกคนไปทางเดียวกันอย่างไร', 'Tell me about a project across many teams. How did you get everyone aligned?'], ['สื่อสารสม่ำเสมอ แก้ความขัดแย้งได้', 'Communicated steadily and resolved friction']),
    low: pr(['เล่างานที่คุณรับผิดชอบเองตั้งแต่ต้นจนจบ', 'Tell me about work you owned from start to finish.'], ['ทำงานอิสระได้ครบถ้วน', 'Delivered independently and completely']),
  },
  ST: {
    high: pr(['เล่าครั้งที่คุณต้องทำตามขั้นตอนเคร่งครัด ทั้งที่คิดว่ามีวิธีที่ดีกว่า', 'Tell me about following a strict process when you thought there was a better way.'], ['เคารพระบบ และเสนอปรับปรุงอย่างถูกช่องทาง', 'Respected the process and suggested changes properly']),
    low: pr(['ถ้าได้งานที่ไม่มีใครบอกวิธีทำ คุณเริ่มต้นอย่างไร', 'If you got a task with no instructions at all, how would you start?'], ['สร้างโครงสร้างให้ตัวเองได้', 'Creates their own structure']),
  },
  CH: {
    high: pr(['เล่าการเปลี่ยนแปลงครั้งใหญ่ที่คุณเคยเจอ คุณปรับตัวอย่างไร', 'Tell me about a big change you went through. How did you adapt?'], ['ปรับตัวเร็ว ช่วยคนอื่นปรับด้วย', 'Adapted fast and helped others adapt']),
    low: pr(['งานประจำที่คุณทำซ้ำได้ดีต่อเนื่องนานที่สุดคืออะไร', 'What routine work have you done well for the longest time?'], ['ความสม่ำเสมอ', 'Consistency']),
  },
  MP: {
    low: pr(['เล่าครั้งที่คุณพบข้อผิดพลาดในตัวเลขหรือรายละเอียดก่อนคนอื่น', 'Tell me about a time you caught an error in numbers or details before anyone else.'], ['ความละเอียดจริง มีวิธีตรวจ', 'Real precision and a method to check']),
    high: pr(['ถ้าแผนเปลี่ยนกะทันหันหนึ่งชั่วโมงก่อนเริ่มงาน คุณทำอย่างไร', 'If the plan changed an hour before you started, what would you do?'], ['ยืดหยุ่นโดยไม่ตื่นตระหนก', 'Flexible without panic']),
  },
  FC: {
    low: pr(['เล่าครั้งที่ได้รับคำติตรง ๆ ต่อหน้าคนอื่น คุณรู้สึกและทำอย่างไรต่อ', 'Tell me about getting blunt criticism in front of others. How did you feel and what did you do next?'], ['รับ feedback แล้วนำไปปรับ', 'Took the feedback and acted on it']),
    high: pr(['คุณชอบได้รับ feedback แบบไหน และเคยปรับตัวจาก feedback อย่างไร', 'How do you like to get feedback, and how have you changed because of it?'], ['รู้จักตัวเองและพัฒนาได้', 'Self-aware and able to grow']),
  },
  SN: {
    low: pr(['เล่าครั้งที่คุณเสนอความเห็นต่อคนที่อาวุโสกว่ามาก', 'Tell me about sharing your view with someone far more senior.'], ['กล้าเสนอแบบให้เกียรติ', 'Spoke up respectfully']),
    high: pr(['คุณทำงานกับหัวหน้าที่อายุน้อยกว่าหรือประสบการณ์น้อยกว่าได้อย่างไร', 'How would you work with a boss who is younger or less experienced than you?'], ['ยอมรับโครงสร้างแบบใหม่ได้', 'Can accept a different structure']),
  },
  SK: {
    low: pr(['ถ้าทีมไม่มีกิจกรรมสังสรรค์เลย คุณยังมีแรงจูงใจจากอะไร', 'If the team had no social activities at all, what would still motivate you?'], ['แรงจูงใจจากตัวงาน', 'Motivated by the work itself']),
    high: pr(['คุณเคยช่วยสร้างบรรยากาศทีมที่ดีอย่างไร', 'How have you helped create a good team atmosphere?'], ['สร้างพลังบวกโดยไม่เสียงาน', 'Positive energy without hurting the work']),
  },
  BK: {
    low: pr(['เล่าครั้งที่คุณต้องตัดสินใจตามกติกา แม้จะขัดใจคนสนิท', 'Tell me about deciding by the rules even though it upset someone close to you.'], ['ยุติธรรมและโปร่งใส', 'Fair and transparent']),
    high: pr(['อะไรทำให้คุณอยู่กับองค์กรหรือหัวหน้าคนหนึ่งได้นาน', 'What makes you stay a long time with one organisation or boss?'], ['ความผูกพันที่จะช่วยให้อยู่ยาว', 'Loyalty that supports long tenure']),
  },
  PR: {
    high: pr(['นำเสนอผลงานที่คุณภูมิใจที่สุดใน 2 นาที', 'Present the work you are proudest of in two minutes.'], ['สื่อสารชัด มีหลักฐานผลงาน', 'Clear, with evidence of results']),
    low: pr(['ผลงานไหนที่คุณทำแต่คนอื่นอาจไม่เห็น เล่าเป็นตัวเลขให้ฟังได้ไหม', "What have you achieved that others might not have noticed? Can you put numbers on it?"], ['ผลงานจริงที่วัดได้', 'Real, measurable results']),
  },
}

export const interviewGuide = (role: RoleSpec, s: Scores, sd: SayDo): InterviewQuestion[] => {
  const qs: InterviewQuestion[] = []
  // 1. Probe the biggest gaps between what the role needs and the candidate's profile.
  const gaps = role.targets
    .map((t) => ({ t, gap: Math.max(0, Math.abs(s[t.dim] - t.center) - t.half) * t.weight }))
    .filter((g) => g.gap > 0)
    .sort((a, b) => b.gap - a.gap)
  for (const { t } of gaps.slice(0, 3)) {
    const want = t.center >= 50 ? 'high' : 'low'
    const probe = PROBES[t.dim]?.[want]
    if (!probe) continue
    const meta = dimMeta(t.dim)
    const pole = want === 'high' ? meta.high : meta.low
    qs.push({
      dim: t.dim,
      why: tt(`งานต้องการ “${pole.th}” แต่โปรไฟล์อยู่ที่ ${s[t.dim]}`, `The role needs “${pole.en}” but the profile is at ${s[t.dim]}`),
      ...probe,
    })
  }
  // 2. Confirm the strongest match with evidence, so a good self-report isn't taken on trust.
  const strong = role.targets
    .filter((t) => Math.abs(s[t.dim] - t.center) <= t.half)
    .sort((a, b) => b.weight - a.weight)[0]
  if (strong) {
    const probe = PROBES[strong.dim]?.[strong.center >= 50 ? 'high' : 'low']
    const meta = dimMeta(strong.dim)
    if (probe)
      qs.push({
        dim: strong.dim,
        why: tt(`ยืนยันจุดแข็งหลัก (${meta.th} ${s[strong.dim]}) ด้วยตัวอย่างจริง`, `Confirm the key strength (${meta.en} ${s[strong.dim]}) with a real example`),
        ...probe,
      })
  }
  // 3. Talk vs. do: change the interview format, not just the questions.
  if (sd.kind === 'talk-over-do')
    qs.push({
      why: tt('นำเสนอตัวเองได้ดีกว่าหลักฐานผลงาน', 'Presents better than the evidence of results'),
      ask: tt('ให้ทำงานตัวอย่างจริง 30–60 นาที และขอผลลัพธ์เป็นตัวเลขจากงานเดิม', 'Set a real 30–60 minute work sample and ask for numbers from past work'),
      listen: tt('ตรวจอ้างอิงกับหัวหน้าเก่าเรื่องผลงานที่วัดได้ ไม่ใช่บุคลิก', 'Check references with past managers on measurable results, not personality'),
    })
  if (sd.kind === 'quiet-achiever')
    qs.push({
      why: tt('อาจขายตัวเองไม่เก่งในห้องสัมภาษณ์', 'May undersell themselves in an interview'),
      ask: tt('ใช้งานตัวอย่างหรือให้เล่าผลงานทีละขั้น แทนการให้พรีเซนต์ตัวเอง', 'Use a work sample or walk through past work step by step instead of a self-pitch'),
      listen: tt('ดูคุณภาพงานจริง อย่าตัดสินจากความมั่นใจในการพูด', 'Judge the work, not speaking confidence'),
    })
  return qs.slice(0, 5)
}

export const blankRole = (): RoleSpec => ({
  id: `role-${Date.now().toString(36)}`,
  title: '',
  targets: [],
  createdAt: new Date().toISOString(),
})

