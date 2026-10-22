import { tt, type T } from '@/lib/i18n'
import { DIM_CODES } from './dimensions'
import { FAMILIES } from './personas'
import { assignPersona } from './scoring'
import type { FamilyId, PersonaResult, Scores } from './types'

/* Synthetic staff for the demo and the HR/Team screens. Clearly labelled as sample data in the UI. */

export interface StaffMember {
  id: string
  name: string
  team: string
  role: T
  years: number
  openToMove: boolean
  scores: Scores
  persona: PersonaResult
  /** Manager/peer-rated delivery from the 360 (0–100). Lets the demo show say–do gaps. */
  observedDelivery: number
  isYou?: boolean
}

export const TEAMS = [
  { id: 'ctw', th: 'ทีมขายหน้าร้าน', en: 'Store sales team', kind: 'store' },
  { id: 'pgn', th: 'ทีมบริการลูกค้า', en: 'Customer service team', kind: 'store' },
  { id: 'fin', th: 'ทีมบัญชีและการเงิน', en: 'Finance team', kind: 'office' },
  { id: 'mer', th: 'ทีมสินค้าและออกแบบ', en: 'Product & design team', kind: 'project' },
  { id: 'dig', th: 'ทีมดิจิทัลและ IT', en: 'Digital & IT team', kind: 'digital' },
] as const

const NAMES = [
  'มายด์', 'บอส', 'แพรว', 'ต้น', 'ฝ้าย', 'กอล์ฟ', 'มิ้นท์', 'เจมส์', 'ปอนด์', 'ใบเตย', 'เบียร์', 'ออม',
  'ฟ้า', 'นัท', 'แบงค์', 'พลอย', 'ภูมิ', 'เฟิร์น', 'ไอซ์', 'ปาล์ม', 'แนน', 'ตาล', 'โอ๊ต', 'จูน',
  'เอิร์ธ', 'ข้าวหอม', 'กันต์', 'น้ำหวาน', 'ปั้น', 'ขิม', 'ภัทร', 'เมย์', 'อาร์ม', 'ปุ๊กกี้', 'ซัน', 'เพลง',
  'โฟกัส', 'บีม', 'นุ่น', 'ก้อง',
]

const R = (th: string, en: string) => tt(th, en)
const ROLES: Record<string, T[]> = {
  store: [R('หัวหน้าทีม', 'Team lead'), R('ผู้ช่วยหัวหน้าทีม', 'Assistant team lead'), R('พนักงานขาย', 'Sales staff'), R('พนักงานขาย', 'Sales staff'), R('แคชเชียร์', 'Cashier'), R('พนักงานบริการลูกค้า', 'Customer service'), R('พนักงานขาย', 'Sales staff'), R('พนักงานคลังสินค้า', 'Stock keeper')],
  office: [R('ผู้จัดการบัญชี', 'Accounting manager'), R('นักบัญชี', 'Accountant'), R('นักบัญชี', 'Accountant'), R('เจ้าหน้าที่การเงิน', 'Finance officer'), R('เจ้าหน้าที่ภาษี', 'Tax officer'), R('เจ้าหน้าที่เจ้าหนี้', 'Payables officer'), R('นักวิเคราะห์การเงิน', 'Financial analyst'), R('เจ้าหน้าที่บัญชี', 'Accounts officer')],
  project: [R('ผู้จัดการทีมสินค้า', 'Product manager'), R('Buyer', 'Buyer'), R('Buyer', 'Buyer'), R('Planner', 'Planner'), R('Data analyst', 'Data analyst'), R('Product developer', 'Product developer'), R('Designer', 'Designer'), R('ผู้ช่วย Buyer', 'Assistant buyer')],
  digital: [R('IT manager', 'IT manager'), R('Developer', 'Developer'), R('Developer', 'Developer'), R('E-commerce specialist', 'E-commerce specialist'), R('Data analyst', 'Data analyst'), R('IT support', 'IT support'), R('UX designer', 'UX designer'), R('Content specialist', 'Content specialist')],
}

/** Mulberry32 — small seeded PRNG so the demo looks the same on every load. */
const rng = (seed: number) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let r = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
  return ((r ^ (r >>> 14)) >>> 0) / 4294967296
}

const gauss = (rand: () => number) => {
  const u = Math.max(rand(), 1e-9)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand())
}

const TEAM_FAMILY_BIAS: Record<string, FamilyId[]> = {
  store: ['CON', 'DRV', 'COM', 'CAR'],
  office: ['GUA', 'GUA', 'CAR', 'COM'],
  project: ['CRE', 'DRV', 'GUA', 'CON'],
  digital: ['CRE', 'GUA', 'DRV', 'CAR'],
}

const makeScores = (family: FamilyId, rand: () => number): Scores => {
  const sig = FAMILIES.find((f) => f.id === family)?.signature ?? {}
  const s = {} as Scores
  for (const c of DIM_CODES) {
    const dir = sig[c] ?? 0
    const centre = 50 + dir * 22
    s[c] = Math.round(Math.min(97, Math.max(3, centre + gauss(rand) * 13)))
  }
  return s
}

export const buildDemoStaff = (): StaffMember[] => {
  const rand = rng(20261022)
  const staff: StaffMember[] = []
  let n = 0
  for (const team of TEAMS) {
    for (let i = 0; i < 8; i++) {
      const bias = TEAM_FAMILY_BIAS[team.kind]
      const family = bias[Math.floor(rand() * bias.length)]
      const scores = makeScores(family, rand)
      // Lead roles get a lead lean; the first person in each team is its manager.
      if (i === 0) scores.LD = Math.max(scores.LD, 70)
      const roles = ROLES[team.kind]
      // Delivery mostly tracks conscientiousness, with noise; a few "quiet achievers" and "talkers".
      let observedDelivery = Math.round(Math.min(97, Math.max(10, scores.C * 0.7 + scores.H * 0.3 + gauss(rand) * 8)))
      if (n % 9 === 3) {
        scores.PR = Math.min(scores.PR, 30)
        scores.X = Math.min(scores.X, 38)
        observedDelivery = Math.max(observedDelivery, 84)
      }
      if (n % 11 === 5) {
        scores.PR = Math.max(scores.PR, 82)
        scores.X = Math.max(scores.X, 75)
        observedDelivery = Math.min(observedDelivery, 40)
      }
      staff.push({
        id: `s${n + 1}`,
        name: `คุณ${NAMES[n % NAMES.length]}`,
        team: team.id,
        role: roles[i % roles.length],
        years: 1 + Math.floor(rand() * 12),
        openToMove: rand() > 0.35,
        scores,
        persona: assignPersona(scores),
        observedDelivery,
      })
      n++
    }
  }
  return staff
}

export const DEMO_STAFF = buildDemoStaff()

export const distance = (a: Scores, b: Scores) =>
  Math.sqrt(DIM_CODES.reduce((sum, c) => sum + (a[c] - b[c]) ** 2, 0) / DIM_CODES.length)

/** 100 = identical profile, 0 = 50 points apart on every dimension on average. */
export const similarity = (a: Scores, b: Scores) => Math.max(0, Math.round(100 - distance(a, b) * 2))

export const closest = (scores: Scores, pool: StaffMember[], n = 5) =>
  pool
    .map((p) => ({ person: p, sim: similarity(scores, p.scores) }))
    .sort((x, y) => y.sim - x.sim)
    .slice(0, n)

/* -------------------------------------- External candidates ------------------------------------ */

const CANDIDATE_NAMES = [
  'ณัฐ', 'ปิยะ', 'กานต์', 'ธีร์', 'วิว', 'มิว', 'ฟ้าใส', 'ต้นกล้า', 'ปัณณ์', 'ชมพู่', 'เก่ง', 'อิงค์',
  'ภูผา', 'ใบบัว', 'เจได', 'น้ำฝน', 'ก้อย', 'ธามส์', 'เอย', 'เพชร', 'ลูกตาล', 'ป๊อป', 'ดาว', 'วิน',
]
const SOURCES: T[] = [tt('สมัครออนไลน์', 'Online application'), tt('พนักงานแนะนำ', 'Employee referral'), tt('Job fair', 'Job fair'), tt('LinkedIn', 'LinkedIn'), tt('Walk-in', 'Walk-in')]
const CURRENT_ROLES: T[] = [
  tt('พนักงานขาย 3 ปี', 'Sales staff, 3 years'), tt('ผู้ช่วยผู้จัดการร้าน', 'Assistant store manager'), tt('ผู้จัดการร้าน', 'Store manager'), tt('นักบัญชี', 'Accountant'),
  tt('Junior designer', 'Junior designer'), tt('Merchandiser', 'Merchandiser'), tt('นักวิเคราะห์ข้อมูล', 'Data analyst'), tt('Visual merchandiser', 'Visual merchandiser'),
  tt('จบใหม่', 'New graduate'), tt('Store supervisor', 'Store supervisor'), tt('Buyer assistant', 'Buyer assistant'), tt('Admin', 'Admin'),
]

export const buildDemoCandidates = () => {
  const rand = rng(77001)
  const families: FamilyId[] = ['COM', 'CON', 'CRE', 'GUA', 'DRV', 'CAR']
  return CANDIDATE_NAMES.map((n, i) => {
    const family = families[Math.floor(rand() * families.length)]
    const scores = makeScores(family, rand)
    // A few polished talkers and a few modest high-achievers, so the say–do signal shows up.
    if (i % 6 === 2) {
      scores.PR = Math.max(scores.PR, 85)
      scores.X = Math.max(scores.X, 78)
      scores.C = Math.min(scores.C, 38)
    }
    if (i % 7 === 4) {
      scores.PR = Math.min(scores.PR, 25)
      scores.X = Math.min(scores.X, 35)
      scores.C = Math.max(scores.C, 85)
      scores.H = Math.max(scores.H, 75)
    }
    return {
      id: `c${i + 1}`,
      name: `คุณ${n}`,
      team: '',
      role: CURRENT_ROLES[i % CURRENT_ROLES.length],
      currentRole: CURRENT_ROLES[i % CURRENT_ROLES.length],
      years: Math.floor(rand() * 9),
      openToMove: true,
      scores,
      persona: assignPersona(scores),
      observedDelivery: 0,
      external: true,
      source: SOURCES[Math.floor(rand() * SOURCES.length)],
    }
  })
}

export const DEMO_CANDIDATES = buildDemoCandidates()

/**
 * A larger sample population (600 people) used as a comparison group, e.g. "everyone who got the
 * same 4-letter code as you". Half are drawn around the starter families, half are broad random
 * profiles, so the population isn't just six tidy clusters.
 */
export const SAMPLE_POPULATION: Scores[] = (() => {
  const rand = rng(424242)
  const families: FamilyId[] = ['COM', 'CON', 'CRE', 'GUA', 'DRV', 'CAR']
  return Array.from({ length: 600 }, (_, i) => {
    if (i % 2 === 0) return makeScores(families[Math.floor(rand() * families.length)], rand)
    const s = {} as Scores
    for (const c of DIM_CODES) s[c] = Math.round(Math.min(97, Math.max(3, 50 + gauss(rand) * 20)))
    return s
  })
})()
