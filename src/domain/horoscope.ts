import { tt, type T } from '@/lib/i18n'
import type { DimCode, Scores } from './types'

/*
 * "ดวงบอก vs. ตัวจริง" — popular Thai birth beliefs set against measured scores.
 *
 * For fun and reflection only. Nothing here feeds scoring, fit, sourcing, team or lab views:
 * zodiac, birth weekday and blood group have no demonstrated link to personality
 * (e.g. Carlson 1985, Nature; Nawata 2014). The comparison exists to show exactly that.
 */

/** A traditional claim: the sign says this dimension runs high (1) or low (-1). */
export interface Claim {
  dim: DimCode
  dir: 1 | -1
}

export interface BirthSign {
  id: string
  name: T
  /** What the belief traditionally says, in a few words. */
  said: T
  claims: Claim[]
  /** Lucky colour for the weekday set. */
  color?: string
}

const c = (dim: DimCode, dir: 1 | -1 = 1): Claim => ({ dim, dir })

/** Index = Date.getDay() (0 = Sunday). Colours follow the Thai day-colour tradition. */
export const WEEKDAYS: BirthSign[] = [
  { id: 'sun', name: tt('วันอาทิตย์', 'Sunday'), color: '#ef4444', said: tt('มั่นใจ เป็นผู้นำ ใจร้อน', 'Confident, a born leader, impatient'), claims: [c('LD'), c('PR'), c('PC')] },
  { id: 'mon', name: tt('วันจันทร์', 'Monday'), color: '#eab308', said: tt('อ่อนโยน อ่อนไหว รักพวกพ้อง', 'Gentle, sensitive, devoted to their people'), claims: [c('A'), c('E', -1), c('BK')] },
  { id: 'tue', name: tt('วันอังคาร', 'Tuesday'), color: '#ec4899', said: tt('ขยัน กล้า พูดตรง', 'Hard-working, brave, outspoken'), claims: [c('C'), c('PC'), c('KJ', -1)] },
  { id: 'wed', name: tt('วันพุธ', 'Wednesday'), color: '#22c55e', said: tt('พูดเก่ง มีเสน่ห์ เข้าสังคมเก่ง', 'Smooth talker, charming, sociable'), claims: [c('X'), c('PR'), c('SK')] },
  { id: 'thu', name: tt('วันพฤหัสบดี', 'Thursday'), color: '#f97316', said: tt('รอบคอบ มีหลักการ เคารพผู้ใหญ่', 'Careful, principled, respects elders'), claims: [c('C'), c('SN'), c('PC', -1)] },
  { id: 'fri', name: tt('วันศุกร์', 'Friday'), color: '#0ea5e9', said: tt('รักศิลปะ อารมณ์ดี สบาย ๆ', 'Artistic, good-humoured, easy-going'), claims: [c('O'), c('SK'), c('MP')] },
  { id: 'sat', name: tt('วันเสาร์', 'Saturday'), color: '#8b5cf6', said: tt('อดทน จริงจัง เก็บตัว', 'Patient, serious, reserved'), claims: [c('C'), c('MP', -1), c('X', -1)] },
]

/** Thai sidereal ราศี. `from` = [month, day] the sun enters the sign (approximate, varies by a day). */
export const RASI: (BirthSign & { from: [number, number] })[] = [
  { id: 'mesa', from: [4, 13], name: tt('ราศีเมษ', 'Aries (Mesa)'), said: tt('กล้า ใจร้อน ชอบนำ', 'Bold, hot-headed, likes to lead'), claims: [c('LD'), c('PC'), c('KJ', -1)] },
  { id: 'pruksa', from: [5, 15], name: tt('ราศีพฤษภ', 'Taurus (Pruksa)'), said: tt('หนักแน่น ใจเย็น รักความมั่นคง', 'Steady, calm, loves security'), claims: [c('E'), c('PC', -1), c('CH', -1)] },
  { id: 'mithun', from: [6, 15], name: tt('ราศีเมถุน', 'Gemini (Mithun)'), said: tt('ช่างพูด หัวไว เปลี่ยนใจง่าย', 'Chatty, quick-witted, changeable'), claims: [c('X'), c('O'), c('CH')] },
  { id: 'karakot', from: [7, 15], name: tt('ราศีกรกฎ', 'Cancer (Karakot)'), said: tt('อ่อนไหว ใส่ใจคน รักพวกพ้อง', 'Sensitive, caring, loyal to their people'), claims: [c('E', -1), c('A'), c('BK')] },
  { id: 'singh', from: [8, 17], name: tt('ราศีสิงห์', 'Leo (Singh)'), said: tt('มั่นใจ ชอบเป็นจุดสนใจ เป็นผู้นำ', 'Confident, loves the spotlight, leads'), claims: [c('PR'), c('X'), c('LD')] },
  { id: 'kanya', from: [9, 17], name: tt('ราศีกันย์', 'Virgo (Kanya)'), said: tt('ละเอียด เป๊ะ ช่างวิเคราะห์', 'Detailed, exact, analytical'), claims: [c('C'), c('MP', -1), c('ST')] },
  { id: 'tula', from: [10, 17], name: tt('ราศีตุลย์', 'Libra (Tula)'), said: tt('ยุติธรรม ประนีประนอม ชอบทำงานกับคน', 'Fair, diplomatic, works well with others'), claims: [c('H'), c('A'), c('CO')] },
  { id: 'pichik', from: [11, 16], name: tt('ราศีพิจิก', 'Scorpio (Pichik)'), said: tt('ลึกลับ เก็บความรู้สึก ไม่โชว์', 'Mysterious, keeps feelings in, low-key'), claims: [c('X', -1), c('KJ'), c('PR', -1)] },
  { id: 'thanu', from: [12, 16], name: tt('ราศีธนู', 'Sagittarius (Thanu)'), said: tt('รักอิสระ ร่าเริง ชอบผจญภัย', 'Free-spirited, cheerful, adventurous'), claims: [c('ST', -1), c('SK'), c('CH')] },
  { id: 'mangkon', from: [1, 14], name: tt('ราศีมังกร', 'Capricorn (Mangkon)'), said: tt('ทะเยอทะยาน มีวินัย เคารพลำดับขั้น', 'Ambitious, disciplined, respects rank'), claims: [c('C'), c('LD'), c('SN')] },
  { id: 'kumph', from: [2, 13], name: tt('ราศีกุมภ์', 'Aquarius (Kumph)'), said: tt('คิดนอกกรอบ เป็นตัวของตัวเอง ไม่ชอบลำดับขั้น', 'Unconventional, independent, dislikes hierarchy'), claims: [c('O'), c('ST', -1), c('SN', -1)] },
  { id: 'meen', from: [3, 14], name: tt('ราศีมีน', 'Pisces (Meen)'), said: tt('ช่างฝัน ใจดี ยืดหยุ่น', 'Dreamy, kind, go-with-the-flow'), claims: [c('O'), c('A'), c('MP')] },
]

/** Index = (year − 4) mod 12, so 2020 = ชวด. */
export const YEAR_ANIMALS: BirthSign[] = [
  { id: 'rat', name: tt('ปีชวด (หนู)', 'Year of the Rat'), said: tt('หัวไว ปรับตัวเก่ง ประหยัด', 'Sharp, adaptable, thrifty'), claims: [c('O'), c('CH'), c('C')] },
  { id: 'ox', name: tt('ปีฉลู (วัว)', 'Year of the Ox'), said: tt('ขยัน อดทน ชอบความมั่นคง', 'Diligent, patient, likes stability'), claims: [c('C'), c('E'), c('CH', -1)] },
  { id: 'tiger', name: tt('ปีขาล (เสือ)', 'Year of the Tiger'), said: tt('กล้า เป็นผู้นำ ใจร้อน', 'Brave, a leader, impatient'), claims: [c('LD'), c('PC'), c('KJ', -1)] },
  { id: 'rabbit', name: tt('ปีเถาะ (กระต่าย)', 'Year of the Rabbit'), said: tt('อ่อนโยน ไม่ชอบขัดแย้ง ชอบสนับสนุน', 'Gentle, avoids conflict, supportive'), claims: [c('A'), c('KJ'), c('LD', -1)] },
  { id: 'dragon', name: tt('ปีมะโรง (งูใหญ่)', 'Year of the Dragon'), said: tt('มั่นใจ มีพลัง ชอบเด่น', 'Confident, energetic, likes to stand out'), claims: [c('PR'), c('X'), c('LD')] },
  { id: 'snake', name: tt('ปีมะเส็ง (งูเล็ก)', 'Year of the Snake'), said: tt('สุขุม ช่างคิด เก็บตัว', 'Composed, thoughtful, private'), claims: [c('PC', -1), c('O'), c('X', -1)] },
  { id: 'horse', name: tt('ปีมะเมีย (ม้า)', 'Year of the Horse'), said: tt('รักอิสระ ร่าเริง กระตือรือร้น', 'Free, lively, eager'), claims: [c('ST', -1), c('X'), c('PC')] },
  { id: 'goat', name: tt('ปีมะแม (แพะ)', 'Year of the Goat'), said: tt('ใจดี มีศิลปะ ไม่ชอบโชว์', 'Kind, artistic, modest'), claims: [c('A'), c('O'), c('PR', -1)] },
  { id: 'monkey', name: tt('ปีวอก (ลิง)', 'Year of the Monkey'), said: tt('ฉลาด ขี้เล่น ชอบสิ่งใหม่', 'Clever, playful, loves novelty'), claims: [c('SK'), c('CH'), c('MP')] },
  { id: 'rooster', name: tt('ปีระกา (ไก่)', 'Year of the Rooster'), said: tt('ตรงไปตรงมา ขยัน เป๊ะ', 'Straight-talking, diligent, precise'), claims: [c('KJ', -1), c('C'), c('MP', -1)] },
  { id: 'dog', name: tt('ปีจอ (หมา)', 'Year of the Dog'), said: tt('ซื่อสัตย์ จริงใจ ภักดีต่อคน', 'Honest, sincere, loyal to people'), claims: [c('H'), c('BK'), c('A')] },
  { id: 'pig', name: tt('ปีกุน (หมู)', 'Year of the Pig'), said: tt('ใจกว้าง สบาย ๆ รักสนุก', 'Generous, easy-going, fun-loving'), claims: [c('MP'), c('SK'), c('A')] },
]

export type Verdict = 'hit' | 'mixed' | 'miss'

/** ±5 points around the midpoint counts as neither side. */
export const verdict = (score: number, dir: 1 | -1): Verdict => {
  const lean = (score - 50) * dir
  return lean >= 5 ? 'hit' : lean <= -5 ? 'miss' : 'mixed'
}

/** Parses YYYY-MM-DD as a local calendar date (no timezone shift). */
export const parseBirth = (iso: string): { y: number; m: number; d: number; weekday: number } | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return null
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const date = new Date(y, mo - 1, d)
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null
  return { y, m: mo, d, weekday: date.getDay() }
}

export const rasiFor = (m: number, d: number) => {
  // Latest sign whose start is on or before the date; before 14 Jan it is still ธนู from December.
  const key = m * 100 + d
  const sorted = [...RASI].sort((a, b) => a.from[0] * 100 + a.from[1] - (b.from[0] * 100 + b.from[1]))
  return [...sorted].reverse().find((r) => r.from[0] * 100 + r.from[1] <= key) ?? sorted[sorted.length - 1]
}

export const yearAnimalFor = (y: number) => YEAR_ANIMALS[(((y - 4) % 12) + 12) % 12]

export interface SignCheck {
  kind: 'weekday' | 'rasi' | 'year'
  sign: BirthSign
  rows: (Claim & { score: number; verdict: Verdict })[]
  hits: number
}

export interface HoroscopeCheck {
  checks: SignCheck[]
  /** Share of claims your measured scores agree with (mixed counts half). */
  matchPct: number
  hits: number
  total: number
}

export function horoscopeCheck(birth: string, scores: Scores): HoroscopeCheck | null {
  const b = parseBirth(birth)
  if (!b) return null
  const make = (kind: SignCheck['kind'], sign: BirthSign): SignCheck => {
    const rows = sign.claims.map((cl) => ({ ...cl, score: scores[cl.dim], verdict: verdict(scores[cl.dim], cl.dir) }))
    return { kind, sign, rows, hits: rows.filter((r) => r.verdict === 'hit').length }
  }
  const checks = [make('weekday', WEEKDAYS[b.weekday]), make('rasi', rasiFor(b.m, b.d)), make('year', yearAnimalFor(b.y))]
  const rows = checks.flatMap((ch) => ch.rows)
  const points = rows.reduce((s, r) => s + (r.verdict === 'hit' ? 1 : r.verdict === 'mixed' ? 0.5 : 0), 0)
  return {
    checks,
    matchPct: Math.round((points / rows.length) * 100),
    hits: rows.filter((r) => r.verdict === 'hit').length,
    total: rows.length,
  }
}
