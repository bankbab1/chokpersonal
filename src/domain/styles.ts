import { tt, type T } from '@/lib/i18n'
import type { Scores } from './types'

/* ------------------------------------------------------------------------------------------------
 * Familiar frames people already know from popular tools, rebuilt on Workfit's measured scores.
 * What we keep: the easy language (introvert/extrovert, 4 work styles, 4 letters, top strengths).
 * What we fix:  everything is a spectrum with a %, the middle is shown as "both" instead of forcing a
 *               side, and none of these frames feeds the fit scores (they are for self-insight and
 *               communication only).
 * ---------------------------------------------------------------------------------------------- */

export interface Energy {
  score: number // 0 introvert … 100 extrovert
  kind: 'introvert' | 'ambivert' | 'extrovert'
  th: string
  en: string
  recharge: T
  atWork: T
}

export const energy = (s: Scores): Energy => {
  const score = Math.round(s.X * 0.75 + s.SK * 0.25)
  if (score <= 39)
    return {
      score, kind: 'introvert', th: 'อินโทรเวิร์ต', en: 'Introvert',
      recharge: tt('ชาร์จพลังจากเวลาอยู่คนเดียวหรือกับคนสนิทไม่กี่คน', 'Recharges alone or with a few close people'),
      atWork: tt('ทำงานลึกได้นาน คิดก่อนพูด ชอบส่งความเห็นเป็นข้อความหรือคุยตัวต่อตัว', 'Does deep work for long stretches, thinks before speaking, prefers writing or 1:1 talks'),
    }
  if (score >= 61)
    return {
      score, kind: 'extrovert', th: 'เอ็กซ์โทรเวิร์ต', en: 'Extrovert',
      recharge: tt('ชาร์จพลังจากการได้อยู่กับคนและบรรยากาศคึกคัก', 'Recharges around people and lively settings'),
      atWork: tt('คิดไปพูดไป สร้างพลังให้ทีม ชอบประชุมและงานที่ได้เจอคน', 'Thinks out loud, energises the team, enjoys meetings and people-facing work'),
    }
  return {
    score, kind: 'ambivert', th: 'แอมบิเวิร์ต', en: 'Ambivert',
    recharge: tt('ต้องการทั้งเวลาเจอคนและเวลาส่วนตัวพอ ๆ กัน', 'Needs social time and alone time about equally'),
    atWork: tt('สลับโหมดได้ตามงาน คุยกับลูกค้าได้ และนั่งทำงานคนเดียวได้', 'Switches modes as needed: fine with customers, fine working alone'),
  }
}

export type WorkStyleId = 'driver' | 'influencer' | 'steady' | 'analyst'

export interface WorkStyle {
  id: WorkStyleId
  pace: number // 0 reserved … 100 assertive
  people: number // 0 task-focused … 100 people-focused
  th: string
  en: string
  color: string
  strengths: T
  talkTo: T
}

const STYLES: Record<WorkStyleId, Omit<WorkStyle, 'pace' | 'people'>> = {
  driver: { id: 'driver', th: 'สายลุยผลลัพธ์', en: 'Driver', color: '#ef4444', strengths: tt('ตัดสินใจเร็ว มุ่งเป้า ชอบความท้าทาย', 'Decides fast, goal-driven, loves a challenge'), talkTo: tt('พูดสั้น ตรงประเด็น เริ่มจากผลลัพธ์ที่ต้องการ', 'Be brief and direct; start with the result you want') },
  influencer: { id: 'influencer', th: 'สายจุดประกาย', en: 'Influencer', color: '#f59e0b', strengths: tt('โน้มน้าวเก่ง สร้างพลัง ชวนคนอื่นตาม', 'Persuasive, energising, brings people along'), talkTo: tt('เปิดด้วยภาพรวมและไอเดีย ให้พื้นที่ได้พูด', 'Open with the big picture and ideas; let them talk') },
  steady: { id: 'steady', th: 'สายมั่นคงอบอุ่น', en: 'Steady', color: '#10b981', strengths: tt('ใจเย็น ดูแลคน ทำงานสม่ำเสมอ', 'Calm, caring, consistent'), talkTo: tt('ให้เวลาเตรียมตัว อธิบายเหตุผลของการเปลี่ยนแปลง', 'Give time to prepare; explain the reasons for change') },
  analyst: { id: 'analyst', th: 'สายละเอียดแม่นยำ', en: 'Analyst', color: '#3b82f6', strengths: tt('คิดเป็นระบบ ละเอียด ยึดข้อมูล', 'Systematic, precise, data-driven'), talkTo: tt('ให้ข้อมูลและตัวเลข ตอบคำถามให้ครบ', 'Bring data and numbers; answer every question') },
}

/** Four work styles on two axes (assertive ↔ reserved, people ↔ task), like DISC, from measured scores. */
export const workStyle = (s: Scores): WorkStyle => {
  const pace = Math.round((s.LD + (100 - s.KJ) + s.PC) / 3)
  const people = Math.round((s.X + s.A + s.SK + s.CO) / 4)
  const id: WorkStyleId = pace >= 50 ? (people >= 50 ? 'influencer' : 'driver') : people >= 50 ? 'steady' : 'analyst'
  return { ...STYLES[id], pace, people }
}

export const ALL_WORK_STYLES = Object.values(STYLES)

export interface CodeAxis {
  left: { letter: string; label: T }
  right: { letter: string; label: T }
  value: number // 0 = fully left, 100 = fully right
  letter: string
  borderline: boolean
}

/**
 * The familiar 4-letter code, estimated from the trait scores it is known to track
 * (E/I ~ extraversion, S/N ~ openness, T/F ~ agreeableness, J/P ~ conscientiousness and structure).
 * Each letter carries its %, and a letter within 10 points of the middle is marked borderline.
 */
export const fourLetter = (s: Scores): { code: string; axes: CodeAxis[] } => {
  const axis = (left: CodeAxis['left'], right: CodeAxis['right'], value: number): CodeAxis => {
    const v = Math.round(value)
    return { left, right, value: v, letter: v >= 50 ? right.letter : left.letter, borderline: Math.abs(v - 50) < 10 }
  }
  const axes = [
    axis({ letter: 'I', label: tt('เก็บตัว', 'Introverted') }, { letter: 'E', label: tt('เปิดตัว', 'Extraverted') }, s.X),
    axis({ letter: 'S', label: tt('ข้อเท็จจริง', 'Facts') }, { letter: 'N', label: tt('ภาพรวม/ไอเดีย', 'Ideas') }, s.O),
    axis({ letter: 'T', label: tt('เหตุผล', 'Logic') }, { letter: 'F', label: tt('ความรู้สึก', 'Feelings') }, (s.A + s.FC + s.KJ) / 3),
    axis({ letter: 'P', label: tt('ยืดหยุ่น', 'Flexible') }, { letter: 'J', label: tt('มีแผน', 'Planned') }, (s.C + s.ST + (100 - s.MP)) / 3),
  ]
  return { code: axes.map((a) => a.letter).join(''), axes }
}

/** The fifth "-A / -T" suffix people know: how steady you stay under pressure (emotional stability). */
export const identity = (s: Scores): CodeAxis => {
  const v = Math.round(s.E)
  return {
    left: { letter: 'T', label: tt('อ่อนไหว ใส่ใจทุกเรื่อง', 'Turbulent') },
    right: { letter: 'A', label: tt('มั่นใจ ใจนิ่ง', 'Assertive') },
    value: v,
    letter: v >= 50 ? 'A' : 'T',
    borderline: Math.abs(v - 50) < 10,
  }
}

/** Four temperament groups from the letters (the well-known NT / NF / SJ / SP split). */
export const temperament = (code: string): { id: string; name: T; blurb: T } => {
  const n = code[1] === 'N'
  if (n && code[2] === 'T') return { id: 'NT', name: tt('นักคิดเชิงระบบ', 'Strategist'), blurb: tt('ชอบแก้โจทย์ยาก วางกลยุทธ์ ตั้งคำถามกับวิธีเดิม', 'Loves hard problems and strategy; questions the old way') }
  if (n) return { id: 'NF', name: tt('นักอุดมการณ์', 'Idealist'), blurb: tt('ขับเคลื่อนด้วยคุณค่าและคน ชอบช่วยให้คนอื่นเติบโต', 'Driven by values and people; loves helping others grow') }
  if (code[3] === 'J') return { id: 'SJ', name: tt('ผู้รักษาระบบ', 'Guardian'), blurb: tt('ไว้ใจได้ ยึดมาตรฐาน ทำให้งานเดินทุกวัน', 'Reliable, keeps standards, keeps things running') }
  return { id: 'SP', name: tt('นักลงมือ', 'Doer'), blurb: tt('คล่องตัว แก้ปัญหาเฉพาะหน้าเก่ง ชอบลงมือจริง', 'Agile, great at on-the-spot problem solving, hands-on') }
}

/** Primary + secondary work style, like a DISC blend ("D/I"): the neighbour on the axis closer to the middle. */
export const workStyleBlend = (s: Scores) => {
  const primary = workStyle(s)
  const nearPace = Math.abs(primary.pace - 50) < Math.abs(primary.people - 50)
  const flip: Record<WorkStyleId, [WorkStyleId, WorkStyleId]> = {
    // [neighbour across the pace axis, neighbour across the people axis]
    driver: ['analyst', 'influencer'],
    influencer: ['steady', 'driver'],
    steady: ['influencer', 'analyst'],
    analyst: ['driver', 'steady'],
  }
  const secondaryId = flip[primary.id][nearPace ? 0 : 1]
  const secondary = { ...STYLES[secondaryId] }
  const close = Math.min(Math.abs(primary.pace - 50), Math.abs(primary.people - 50)) < 12
  return { primary, secondary: close ? secondary : undefined }
}

export interface Strength {
  id: string
  name: T
  blurb: T
  value: number
}

const STRENGTHS: { id: string; name: T; blurb: T; f: (s: Scores) => number }[] = [
  { id: 'leader', name: tt('ผู้นำโดยธรรมชาติ', 'Natural leader'), blurb: tt('ก้าวออกมานำเมื่อไม่มีใครตัดสินใจ', 'Steps up when no one else decides'), f: (s) => s.LD },
  { id: 'calm', name: tt('ใจนิ่งในพายุ', 'Calm in the storm'), blurb: tt('ยิ่งกดดันยิ่งนิ่ง', 'Steadier the more pressure there is'), f: (s) => s.E },
  { id: 'connector', name: tt('นักเชื่อมคน', 'Connector'), blurb: tt('ทำให้คนคุยกันและอยากทำงานด้วยกัน', 'Gets people talking and working together'), f: (s) => (s.X + s.A) / 2 },
  { id: 'ideas', name: tt('นักคิดสิ่งใหม่', 'Idea maker'), blurb: tt('เห็นทางเลือกที่คนอื่นยังไม่เห็น', 'Sees options others have not'), f: (s) => s.O },
  { id: 'system', name: tt('มือวางระบบ', 'System builder'), blurb: tt('เปลี่ยนความวุ่นวายเป็นขั้นตอนที่ใช้ได้จริง', 'Turns chaos into steps that work'), f: (s) => (s.C + s.ST) / 2 },
  { id: 'detail', name: tt('ตาเหยี่ยวจับรายละเอียด', 'Eagle eye for detail'), blurb: tt('เจอจุดผิดก่อนจะกลายเป็นปัญหา', 'Spots errors before they become problems'), f: (s) => 100 - s.MP },
  { id: 'integrity', name: tt('ถ่อมตน ไม่เน้นสถานะ', 'Modest'), blurb: tt('ให้เครดิตคนอื่น ไม่เน้นตำแหน่งหรือสถานะ', 'Shares credit, not driven by title or status'), f: (s) => s.H },
  { id: 'speed', name: tt('ลุยไว', 'Quick mover'), blurb: tt('เปลี่ยนแผนเป็นการลงมือทันที', 'Turns plans into action at once'), f: (s) => s.PC },
  { id: 'careful', name: tt('คิดรอบคอบ', 'Careful thinker'), blurb: tt('ชั่งน้ำหนักก่อนตัดสินใจ', 'Weighs things up before deciding'), f: (s) => 100 - s.PC },
  { id: 'teamwork', name: tt('ทีมเวิร์ก', 'Team player'), blurb: tt('ทำงานกับหลายฝ่ายได้ราบรื่น', 'Works smoothly across teams'), f: (s) => s.CO },
  { id: 'adaptive', name: tt('ปรับตัวไว', 'Adaptable'), blurb: tt('สนุกกับการเปลี่ยนแปลง', 'Enjoys change'), f: (s) => s.CH },
  { id: 'persuade', name: tt('สื่อสารโน้มน้าว', 'Persuader'), blurb: tt('ขายไอเดียและผลงานได้ชัด', 'Sells ideas and results clearly'), f: (s) => s.PR },
  { id: 'tact', name: tt('ถนอมน้ำใจ', 'Tactful'), blurb: tt('พูดเรื่องยากโดยไม่มีใครเสียหน้า', 'Handles hard topics without anyone losing face'), f: (s) => (s.KJ + s.FC) / 2 },
  { id: 'candor', name: tt('กล้าพูดตรง', 'Candid'), blurb: tt('ยกปัญหาขึ้นมาก่อนจะสาย', 'Raises problems before it is too late'), f: (s) => 100 - s.KJ },
  { id: 'loyal', name: tt('ภักดีมั่นคง', 'Loyal'), blurb: tt('อยู่กับทีมในวันที่ยาก', 'Stays with the team through hard times'), f: (s) => s.BK },
  { id: 'energiser', name: tt('สร้างพลังให้ทีม', 'Energiser'), blurb: tt('ทำให้บรรยากาศดีขึ้นทันที', 'Lifts the mood instantly'), f: (s) => s.SK },
  { id: 'independent', name: tt('พึ่งพาตนเองได้', 'Self-reliant'), blurb: tt('รับงานแล้วปิดจบเองได้', 'Takes a task and finishes it alone'), f: (s) => 100 - s.CO },
  { id: 'steady', name: tt('สม่ำเสมอ', 'Consistent'), blurb: tt('ทำงานคุณภาพเดิมได้ทุกวัน', 'Same quality every single day'), f: (s) => (100 - s.CH + s.C) / 2 },
]

export const topStrengths = (s: Scores, n = 5): Strength[] =>
  STRENGTHS.map(({ f, ...rest }) => ({ ...rest, value: Math.round(f(s)) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, n)

export interface WorkfitId {
  code: string // e.g. ENFJ-A
  temperament: ReturnType<typeof temperament>
  energy: Energy
  style: ReturnType<typeof workStyleBlend>
  topStrength: Strength
  line: T
}

/** One line that holds every familiar frame at once, so nobody needs four different tests. */
export const workfitId = (s: Scores): WorkfitId => {
  const fl = fourLetter(s)
  const id = identity(s)
  const code = `${fl.code}-${id.letter}`
  const t = temperament(fl.code)
  const e = energy(s)
  const st = workStyleBlend(s)
  const top = topStrengths(s, 1)[0]
  const style = (k: 'th' | 'en') => (st.secondary ? `${st.primary[k]}/${st.secondary[k]}` : st.primary[k])
  return {
    code,
    temperament: t,
    energy: e,
    style: st,
    topStrength: top,
    line: tt(
      `${code} · ${t.name.th} · ${e.th} · ${style('th')} · จุดแข็ง: ${top.name.th}`,
      `${code} · ${t.name.en} · ${e.en} · ${style('en')} · Top strength: ${top.name.en}`,
    ),
  }
}

/* ----------------------------- How Workfit compares with popular tools ------------------------- */

export const MARKET_COMPARISON: { tool: T; keep?: T; fix: T }[] = [
  {
    tool: tt('แบบทดสอบ 16 ประเภท (4 ตัวอักษร + A/T)', '16-type tests (4 letters + A/T)'),
    keep: tt('จำง่าย แชร์ได้ มีรหัส 4 ตัวอักษร ตัวท้าย -A/-T และกลุ่มบทบาท 4 กลุ่ม', 'Memorable and shareable: 4 letters, the -A/-T suffix and 4 role groups'),
    fix: tt(
      'ตัดครึ่งที่ 50 ทำให้คนตรงกลางได้ผลสลับไปมา และไม่ได้เชื่อมกับหน้าที่งานจริง → Workfit แสดงทุกแกนเป็นสเปกตรัม บอกว่าตัวไหนก้ำกึ่ง และแยกบทบาทที่อยากทำ ออกจากสไตล์การทำงาน',
      'Splitting at 50 makes people near the middle flip types, and it is not linked to real duties → Workfit shows every axis as a spectrum, flags borderline letters and keeps the roles you want separate from how you work',
    ),
  },
  {
    tool: tt('DISC (4 สไตล์การทำงาน)', 'DISC (4 work styles)'),
    keep: tt('ภาษาง่าย มีสไตล์หลักและสไตล์รอง ใช้คุยเรื่องการสื่อสารในทีมได้ทันที', 'Simple language with a primary and secondary style, instantly useful for team communication'),
    fix: tt('มีแค่ 4 กล่อง หยาบเกินไปที่จะอธิบายคน → Workfit มี 4 สไตล์ไว้คุยกัน และมี 18 มิติกับ 12 บทบาทที่อยากทำให้เห็นรายละเอียด', 'Only 4 boxes, too coarse to describe a person → Workfit keeps 4 styles for conversation, plus 18 dimensions and 12 role interests for detail'),
  },
  {
    tool: tt('Introvert / Ambivert / Extrovert', 'Introvert / Ambivert / Extrovert'),
    keep: tt('คนเข้าใจทันทีว่าตัวเองชาร์จพลังแบบไหน', 'People instantly get how they recharge'),
    fix: tt('มักบังคับให้เลือกขั้ว → Workfit แสดงเป็นสเปกตรัมมีโซนแอมบิเวิร์ต และบอกว่าแต่ละแบบทำงานแบบไหน', 'Usually forces a side → Workfit shows a spectrum with an ambivert zone and what each means at work'),
  },
  {
    tool: tt('แบบประเมินจุดแข็ง (Top 5)', 'Strengths tests (Top 5)'),
    keep: tt('พูดถึงจุดแข็ง ทำให้คนอยากพัฒนา', 'Strengths language makes people want to grow'),
    fix: tt('ไม่เชื่อมกับหน้าที่งานและราคาสูง → Workfit ให้จุดเด่น พร้อมหน้าที่งานที่น่าสำรวจ และประเด็นที่ควรคุยกับหัวหน้าและทีม', "Not linked to duties and expensive → Workfit shows standouts plus work worth exploring and what to discuss with your manager and team"),
  },
  {
    tool: tt('Big Five / HEXACO', 'Big Five / HEXACO'),
    keep: tt('มีงานวิจัยรองรับมากที่สุด', 'The strongest research base'),
    fix: tt('ไม่มีชื่อเรียกที่จำง่าย และไม่วัดบริบทคนไทย → Workfit ใช้เป็นแกน แล้วเพิ่ม 6 มิติไทยกับตัวละครการทำงาน 12 แบบ', 'No memorable labels and no Thai context → Workfit uses it as the core and adds 6 Thai dimensions and 12 work characters'),
  },
  {
    tool: tt('แบบทดสอบผู้บริหาร (ด้านมืดเมื่อกดดัน)', 'Executive tests (derailers under pressure)'),
    keep: tt('บอกพฤติกรรมเมื่อเครียด', 'Shows behaviour under stress'),
    fix: tt('แพงและซับซ้อนเกินสำหรับพนักงานทั่วไป → Workfit ใช้ 12 สถานการณ์จริงบอกพฤติกรรมตอนกดดัน อยู่กับผู้ใหญ่ น้อง และลูกค้า', 'Too costly and complex for most staff → Workfit uses 12 real scenarios: under pressure, with seniors, juniors and customers'),
  },
  {
    tool: tt('สิ่งที่ทุกเครื่องมือยังไม่มี', 'What no tool has yet'),
    fix: tt(
      'Workfit Code 7 ตัวอักษรที่บอกความก้ำกึ่งและมีแกนวัฒนธรรมไทย, เทียบมุมมองตัวเองกับมุมมองคนรอบตัว (Peer view), สะพานวัฒนธรรมไทย–ต่างชาติ, แยก “พูดเก่ง” กับ “ทำเก่ง”, ความเสี่ยงแบ่งพรรคแบ่งพวกและคนไม่กล้าพูด, คู่มือสัมภาษณ์รายคน',
      'A 7-letter Workfit Code that shows leaning traits and includes a Thai culture axis, self vs. others (Peer view), a Thai–foreigner culture bridge, separating “talks well” from “delivers well”, clique and silence risks, per-candidate interview guides',
    ),
  },
]
