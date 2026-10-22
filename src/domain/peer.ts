import { tt, type T } from '@/lib/i18n'
import { dimMeta, dimName } from './dimensions'
import type { DimCode, Scores } from './types'

/* ------------------------------------------------------------------------------------------------
 * Peer view (360 for personality). Research: ratings by people who know you predict job
 * performance better than self-reports and add to them (Oh, Wang & Mount 2011; Connelly & Ones 2010).
 * Raters answer 16 short items about the person; two "delivery" items power the talk-vs-do check.
 * With no backend yet, the rater's answers travel back as a short response code.
 * ---------------------------------------------------------------------------------------------- */

export type Relation = 'manager' | 'peer' | 'junior' | 'friend'

export const RELATIONS: { id: Relation; name: T }[] = [
  { id: 'manager', name: tt('หัวหน้า', 'Manager') },
  { id: 'peer', name: tt('เพื่อนร่วมงาน', 'Colleague') },
  { id: 'junior', name: tt('ลูกน้อง/น้องในทีม', 'Direct report') },
  { id: 'friend', name: tt('เพื่อนหรือคนรู้จักนอกงาน', 'Friend outside work') },
]

export interface PeerItem {
  id: string
  dim: DimCode | 'DO'
  keyed: 1 | -1
  /** `{name}` is replaced with the person being rated. */
  text: T
}

const I = (id: string, dim: PeerItem['dim'], keyed: 1 | -1, th: string, en: string): PeerItem => ({ id, dim, keyed, text: tt(th, en) })

export const PEER_ITEMS: PeerItem[] = [
  I('p1', 'X', 1, '{name} มีพลังและพูดคุยเก่งเมื่ออยู่กับคนเยอะ ๆ', '{name} is lively and talkative in a group'),
  I('p2', 'A', 1, '{name} ใจเย็นและให้อภัยคนอื่นง่าย', '{name} is patient and forgives easily'),
  I('p3', 'C', 1, '{name} วางแผนดีและทำงานเป็นระเบียบ', '{name} plans well and works in an organised way'),
  I('p4', 'E', 1, '{name} ยังใจนิ่งเมื่องานกดดัน', '{name} stays calm when work gets stressful'),
  I('p5', 'O', 1, '{name} มักมีไอเดียหรือวิธีใหม่ ๆ', '{name} often brings new ideas or methods'),
  I('p6', 'H', 1, '{name} ซื่อตรง ไม่เอาเปรียบใคร', '{name} is honest and never takes advantage of others'),
  I('p7', 'KJ', -1, '{name} กล้าพูดหรือแย้งเมื่อไม่เห็นด้วย แม้กับคนที่อาวุโสกว่า', '{name} speaks up when they disagree, even with seniors'),
  I('p8', 'FC', 1, '{name} ระวังไม่ให้ใครเสียหน้า และชอบคุยเรื่องยากแบบส่วนตัว', "{name} is careful about others' face and raises hard topics privately"),
  I('p9', 'LD', 1, '{name} ก้าวออกมานำเมื่อไม่มีใครตัดสินใจ', '{name} steps up to lead when no one else decides'),
  I('p10', 'PC', 1, '{name} ลงมือเร็ว ไม่รอให้ข้อมูลครบ', "{name} acts quickly without waiting for every detail"),
  I('p11', 'CO', 1, '{name} ทำงานกับคนอื่นและหลายฝ่ายได้ราบรื่น', '{name} works smoothly with others and across teams'),
  I('p12', 'SK', 1, '{name} ทำให้บรรยากาศทีมสนุกและเป็นกันเอง', '{name} makes the team atmosphere fun and friendly'),
  I('p13', 'MP', -1, '{name} ละเอียดและเป๊ะเรื่องตัวเลขและเวลา', '{name} is precise about numbers and timing'),
  I('p14', 'PR', 1, '{name} นำเสนอผลงานและตัวเองได้เก่ง', '{name} is good at presenting their work and themselves'),
  I('p15', 'DO', 1, '{name} ทำงานเสร็จตามที่รับปากไว้เสมอ', '{name} always delivers what they promised'),
  I('p16', 'DO', 1, 'คุณภาพงานของ {name} ไว้ใจได้ โดยไม่ต้องตรวจซ้ำ', "{name}'s work can be trusted without rechecking"),
]

export interface PeerRating {
  id: string
  rater: string
  relation: Relation
  /** 1–6 per item, in PEER_ITEMS order. */
  answers: number[]
  receivedAt: string
}

/* --------------------------------- Share & response codes --------------------------------- */

const toB64 = (obj: unknown) => {
  const bytes = new TextEncoder().encode(JSON.stringify(obj))
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const fromB64 = <X,>(code: string): X | null => {
  try {
    const b64 = code.trim().replace(/-/g, '+').replace(/_/g, '/')
    const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4))
    const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0))
    return JSON.parse(new TextDecoder().decode(bytes)) as X
  } catch {
    return null
  }
}

export interface InviteToken {
  v: 1
  id: string // the person being rated
  name: string
}

export const makeInvite = (id: string, name: string) => toB64({ v: 1, id, name } satisfies InviteToken)
export const readInvite = (token: string) => {
  const t = fromB64<InviteToken>(token)
  return t && t.v === 1 && typeof t.id === 'string' ? t : null
}

interface ResponsePayload {
  v: 1
  t: string // target id
  r: string // rater display name
  rel: Relation
  a: number[]
}

export const makeResponseCode = (targetId: string, rater: string, relation: Relation, answers: number[]) =>
  `WF1.${toB64({ v: 1, t: targetId, r: rater, rel: relation, a: answers } satisfies ResponsePayload)}`

export type ParseResult = { ok: true; rating: PeerRating } | { ok: false; reason: 'format' | 'other-person' }

export const parseResponseCode = (code: string, myId: string): ParseResult => {
  const raw = code.trim().replace(/^WF1\./, '')
  const p = fromB64<ResponsePayload>(raw)
  if (!p || p.v !== 1 || !Array.isArray(p.a) || p.a.length !== PEER_ITEMS.length || p.a.some((x) => !(x >= 1 && x <= 6)))
    return { ok: false, reason: 'format' }
  if (p.t !== myId) return { ok: false, reason: 'other-person' }
  return {
    ok: true,
    rating: { id: `${p.r}-${raw.slice(-10)}`, rater: p.r || '—', relation: p.rel, answers: p.a, receivedAt: new Date().toISOString() },
  }
}

/* ------------------------------------------ Analysis ------------------------------------------ */

export interface PeerSummary {
  n: number
  others: Partial<Record<DimCode, number>>
  delivery?: number
  gaps: { dim: DimCode; name: T; self: number; others: number; diff: number; kind: 'blind-spot' | 'hidden-strength' | 'aligned' }[]
  /** Correlation between self and others across rated dimensions: how well you see yourself. */
  agreement?: number
}

const to100 = (v: number) => ((v - 1) / 5) * 100

export const summarisePeers = (self: Scores, ratings: PeerRating[]): PeerSummary => {
  if (!ratings.length) return { n: 0, others: {}, gaps: [] }
  const sums = new Map<string, number[]>()
  PEER_ITEMS.forEach((item, i) => {
    for (const r of ratings) {
      const v = item.keyed === 1 ? r.answers[i] : 7 - r.answers[i]
      sums.set(item.dim, [...(sums.get(item.dim) ?? []), to100(v)])
    }
  })
  const others: Partial<Record<DimCode, number>> = {}
  let delivery: number | undefined
  for (const [dim, xs] of sums) {
    const m = Math.round(xs.reduce((a, b) => a + b, 0) / xs.length)
    if (dim === 'DO') delivery = m
    else others[dim as DimCode] = m
  }
  const gaps = (Object.entries(others) as [DimCode, number][])
    .map(([dim, o]) => {
      const diff = o - self[dim]
      const kind: PeerSummary['gaps'][number]['kind'] = diff <= -15 ? 'blind-spot' : diff >= 15 ? 'hidden-strength' : 'aligned'
      // A "blind spot" means others see less of the trait's *high* pole than you do.
      return { dim, name: dimName(dimMeta(dim)), self: self[dim], others: o, diff, kind }
    })
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
  const xs = gaps.map((g) => g.self)
  const ys = gaps.map((g) => g.others)
  const mean = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length
  const mx = mean(xs)
  const my = mean(ys)
  const cov = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0)
  const sx = Math.sqrt(xs.reduce((s, x) => s + (x - mx) ** 2, 0))
  const sy = Math.sqrt(ys.reduce((s, y) => s + (y - my) ** 2, 0))
  const agreement = sx && sy ? cov / (sx * sy) : undefined
  return { n: ratings.length, others, delivery, gaps, agreement }
}

/** Sample raters for the demo: close to the self-profile with a few honest differences. */
export const demoRatings = (self: Scores): PeerRating[] => {
  const shift: Partial<Record<string, number>> = { PR: -1, KJ: 1, DO: 1, X: -1 }
  const people: [string, Relation, number][] = [
    ['Nok', 'manager', 0],
    ['Ploy', 'peer', 1],
    ['Ton', 'junior', -1],
  ]
  return people.map(([rater, relation, jitter], k) => ({
    id: `demo-${k}`,
    rater,
    relation,
    receivedAt: new Date().toISOString(),
    answers: PEER_ITEMS.map((item) => {
      const base = item.dim === 'DO' ? (self.C * 0.7 + self.H * 0.3) : self[item.dim as DimCode]
      const selfAnswer = 1 + (base / 100) * 5
      const keyedAnswer = item.keyed === 1 ? selfAnswer : 7 - selfAnswer
      const delta = (shift[item.dim] ?? 0) * (item.keyed === 1 ? 1 : -1) + ((k + item.id.length) % 3 === 0 ? jitter * 0.5 : 0)
      return Math.min(6, Math.max(1, Math.round(keyedAnswer + delta)))
    }),
  }))
}
