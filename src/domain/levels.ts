import { tt, type T } from '@/lib/i18n'
import { CODE_AXES } from './code'
import { FORCED_BLOCKS, LIKERT_SEQUENCE, SCENARIOS, type ForcedBlock, type LikertEntry, type Scenario } from './items'
import { ROLE_ITEMS, type RoleItem } from './roles'
import type { DimCode } from './types'

/* ------------------------------------------------------------------------------------------------
 * Test depth levels: "how well do you want to know yourself?". Deeper levels add questions on top of
 * the shallower ones, so answers carry over when someone goes up a level.
 *
 *   quick     ~5–7 min   your code + character (fewer items per letter: a first read)
 *   standard  ~15 min    the full style test: a stable code + all 18 dimensions + situations
 *   pro       ~30 min    + the 48 role-interest items (12 roles you want, work worth exploring)
 * ---------------------------------------------------------------------------------------------- */

export type Level = 'quick' | 'standard' | 'pro'
export const LEVEL_ORDER: Level[] = ['quick', 'standard', 'pro']

export interface LevelInfo {
  id: Level
  name: T
  minutes: T
  gets: T[]
  accuracy: T
}

export const LEVELS: LevelInfo[] = [
  {
    id: 'quick',
    name: tt('เร็ว', 'Quick'),
    minutes: tt('5–7 นาที', '5–7 min'),
    gets: [tt('Workfit Code 7 ตัวอักษร', 'Your 7-letter Workfit Code'), tt('ตัวละครของคุณ 1 ใน 16', 'Your character, 1 of 16')],
    accuracy: tt('ภาพรวมคร่าว ๆ ตัวอักษรที่ใกล้กึ่งกลางอาจเปลี่ยนได้', 'A first read: letters near the middle may change'),
  },
  {
    id: 'standard',
    name: tt('มาตรฐาน', 'Standard'),
    minutes: tt('15 นาที', '15 min'),
    gets: [tt('รหัสที่แม่นและนิ่งขึ้น', 'A more accurate, stable code'), tt('18 มิติ รวมเกรงใจ อาวุโส รักษาหน้า', '18 dimensions incl. kreng jai, seniority, face'), tt('พฤติกรรมเมื่อสถานการณ์เปลี่ยน', 'How you act when situations change')],
    accuracy: tt('แนะนำ: แม่นพอสำหรับคุยกับหัวหน้าและทีม', 'Recommended: accurate enough to discuss with your manager and team'),
  },
  {
    id: 'pro',
    name: tt('มืออาชีพ', 'Professional'),
    minutes: tt('30 นาที', '30 min'),
    gets: [tt('ทุกอย่างในระดับมาตรฐาน', 'Everything in Standard'), tt('12 บทบาทที่คุณอยากทำ', 'The 12 roles you want to take on'), tt('งานที่น่าสำรวจ และทักษะที่ควรตรวจ', 'Work worth exploring and skills to check')],
    accuracy: tt('ละเอียดที่สุด เหมาะกับการวางแผนเส้นทางงาน', 'The most detailed: for planning your career path'),
  },
]

export const levelInfo = (l: Level) => LEVELS.find((x) => x.id === l)!
export const levelRank = (l: Level | undefined) => (l ? LEVEL_ORDER.indexOf(l) : -1)

/* ---------------------------------------- Item selection ---------------------------------------- */

/** Dimensions that the 7 code letters are calculated from. */
export const CODE_DIMS: DimCode[] = [...new Set(CODE_AXES.flatMap((a) => a.sources.map((s) => s.dim)))]

/** Quick: 4 agree/disagree items (2 each direction) for every code dimension that has them. */
const QUICK_LIKERT: LikertEntry[] = LIKERT_SEQUENCE.filter(
  (e) => e.kind === 'likert' && CODE_DIMS.includes(e.item.dim) && /-(p|m)[12]$/.test(e.item.id),
)

/** Quick: forced-choice blocks picked greedily until every remaining code dimension appears at least 3 times. */
const QUICK_FORCED: ForcedBlock[] = (() => {
  const need = CODE_DIMS.filter((d) => !QUICK_LIKERT.some((e) => e.kind === 'likert' && e.item.dim === d))
  const count = new Map<DimCode, number>()
  const picked: ForcedBlock[] = []
  const gain = (b: ForcedBlock) => b.statements.filter((s) => need.includes(s.dim) && (count.get(s.dim) ?? 0) < 3).length
  for (;;) {
    const best = FORCED_BLOCKS.filter((b) => !picked.includes(b)).sort((a, b) => gain(b) - gain(a))[0]
    if (!best || gain(best) === 0) break
    picked.push(best)
    for (const s of best.statements) count.set(s.dim, (count.get(s.dim) ?? 0) + 1)
  }
  return FORCED_BLOCKS.filter((b) => picked.includes(b)) // keep the original order
})()

export interface LevelItems {
  roles: RoleItem[]
  likert: LikertEntry[]
  forced: ForcedBlock[]
  scenarios: Scenario[]
}

export const itemsFor = (l: Level): LevelItems =>
  l === 'quick'
    ? { roles: [], likert: QUICK_LIKERT, forced: QUICK_FORCED, scenarios: [] }
    : { roles: l === 'pro' ? ROLE_ITEMS : [], likert: LIKERT_SEQUENCE, forced: FORCED_BLOCKS, scenarios: SCENARIOS }

export const itemCount = (l: Level) => {
  const i = itemsFor(l)
  return i.roles.length + i.likert.length + i.forced.length + i.scenarios.length
}
