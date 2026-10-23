import { tt, type T } from '@/lib/i18n'
import { similarity, type StaffMember } from './demo'
import { DIM_CODES, dimMeta } from './dimensions'
import { band, CONTEXT_DIMS, ROLE_GROUPS, ROLE_TYPE_IDS, type Band, type ContextDimId, type RoleGroupId, type RoleTypeId } from './roles'
import type { DimCode } from './types'

/* ------------------------------------------------------------------------------------------------
 * Team map maths. Role types are a discovery lens for conversation about missing roles and
 * dependencies — never quotas, never "the team needs all 12", never a ranking of people.
 * Aggregates are only produced for groups of at least MIN_AGGREGATE consenting people (spec §25.1).
 * ---------------------------------------------------------------------------------------------- */

/** Engineering default: smaller groups get no aggregate charts, so no one can be singled out. */
export const MIN_AGGREGATE = 5

export const canShowAggregate = (n: number) => n >= MIN_AGGREGATE

export interface TeamRisk {
  id: string
  level: 'watch' | 'high'
  title: T
  detail: T
  people: string[]
}

export interface RoleTypeCount {
  id: RoleTypeId
  /** People whose primary interest is this type. */
  primary: number
  /** People for whom it is the secondary interest (a lighter signal; never added to `primary`). */
  secondary: number
}

export interface RoleDistribution {
  /** Everyone counted, including no_dominant and unknown. */
  total: number
  groups: { id: RoleGroupId; primary: number; types: RoleTypeCount[] }[]
  /** Completed the 48 items, but no role stands out (its own bucket, not "zero"). */
  noDominant: number
  /** No role-interest result yet (unknown ≠ 0). */
  unknown: number
  /** Types nobody holds as primary or secondary interest: material for a conversation, not a gap to fill. */
  unheld: RoleTypeId[]
}

export const roleDistribution = (members: StaffMember[]): RoleDistribution => {
  const counts = new Map<RoleTypeId, RoleTypeCount>(ROLE_TYPE_IDS.map((id) => [id, { id, primary: 0, secondary: 0 }]))
  let noDominant = 0
  let unknown = 0
  for (const m of members) {
    const c = m.roleClass
    if (!c) unknown++
    else if (c.state === 'no_dominant' || !c.primary) noDominant++
    else {
      counts.get(c.primary)!.primary++
      if (c.secondary) counts.get(c.secondary)!.secondary++
    }
  }
  const groups = ROLE_GROUPS.map((g) => {
    const types = g.types.map((id) => counts.get(id)!)
    return { id: g.id, primary: types.reduce((s, x) => s + x.primary, 0), types }
  })
  const unheld = ROLE_TYPE_IDS.filter((id) => counts.get(id)!.primary + counts.get(id)!.secondary === 0)
  return { total: members.length, groups, noDominant, unknown, unheld }
}

export interface ContextSpread {
  dim: ContextDimId
  counts: Record<Band, number>
}

/** Working-preference bands per dimension. Unconfirmed values stay "unknown", never "middle". */
export const contextDistribution = (members: StaffMember[]): ContextSpread[] =>
  CONTEXT_DIMS.map((d) => {
    const counts: Record<Band, number> = { low: 0, middle: 0, high: 0, unknown: 0 }
    for (const m of members) counts[band(m.context?.[d.id])]++
    return { dim: d.id, counts }
  })

export interface TeamAggregate {
  roles: RoleDistribution
  context: ContextSpread[]
  spread: { dim: DimCode; mean: number; sd: number }[]
  blindSpots: T[]
}

export interface TeamAnalysis {
  size: number
  /** Null when the group is smaller than MIN_AGGREGATE: show why instead of the charts. */
  aggregate: TeamAggregate | null
  /** Person-level prompts for the manager's conversations; each names only consenting team members. */
  risks: TeamRisk[]
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
const sd = (xs: number[]) => {
  const m = mean(xs)
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)))
}

const blindSpotsOf = (members: StaffMember[]): T[] => {
  const out: T[] = []
  const nobody = (dim: DimCode, side: 'high' | 'low', text: T) => {
    const xs = members.map((m) => m.scores[dim])
    const anyone = side === 'low' ? xs.some((x) => x <= 40) : xs.some((x) => x >= 60)
    if (!anyone) out.push(text)
  }
  nobody('MP', 'low', tt('ไม่มีใครสายเป๊ะ รายละเอียดและตัวเลขอาจหลุด ลองคุยว่าใครช่วยตรวจได้', 'No one leans precise; details and numbers may slip. Talk about who could double-check.'))
  nobody('KJ', 'low', tt('ไม่มีใครถนัดพูดตรง ปัญหาอาจถูกเก็บเงียบ ลองตกลงช่องทางบอกปัญหา', 'No one leans toward speaking up; problems may stay hidden. Agree a way to raise issues.'))
  nobody('O', 'high', tt('ไม่มีใครเอนไปทางไอเดียใหม่ ทีมอาจติดวิธีเดิม ลองคุยว่าไอเดียใหม่มาจากไหนได้', 'No one leans toward new ideas; the team may stick to old ways. Talk about where fresh ideas could come from.'))
  nobody('LD', 'high', tt('ไม่มีใครเอนไปทางการนำ ลองคุยว่าใครรับช่วงเมื่อหัวหน้าไม่อยู่', 'No one leans toward leading; talk about who steps in when the manager is away.'))
  nobody('PC', 'low', tt('ไม่มีใครเอนไปทางรอบคอบ การตัดสินใจอาจเร็วเกินไป ลองตกลงจุดตรวจก่อนตัดสินใจ', 'No one leans careful; decisions may be rushed. Agree a check-point before deciding.'))
  return out
}

/** Groups of ≥ 3 people who are all similar to at least one other member of the group (connected components). */
const similarGroups = (people: StaffMember[], minSim: number): StaffMember[][] => {
  const seen = new Set<string>()
  const out: StaffMember[][] = []
  for (const start of people) {
    if (seen.has(start.id)) continue
    const group: StaffMember[] = []
    const queue = [start]
    seen.add(start.id)
    while (queue.length) {
      const p = queue.shift()!
      group.push(p)
      for (const q of people) {
        if (!seen.has(q.id) && similarity(p.scores, q.scores) >= minSim) {
          seen.add(q.id)
          queue.push(q)
        }
      }
    }
    out.push(group)
  }
  return out
}

const risksOf = (members: StaffMember[]): TeamRisk[] => {
  const risks: TeamRisk[] = []

  // Cliques (พรรคพวก): several people high on loyalty + seniority who also work in a similar style.
  const cliqueScore = (m: StaffMember) => (m.scores.BK + m.scores.SN + m.scores.SK + (100 - m.scores.H)) / 4
  const pulled = members.filter((m) => cliqueScore(m) >= 60)
  similarGroups(pulled, 60).forEach((group, i) => {
    if (group.length < 3) return
    risks.push({
      id: `clique-${i}`,
      level: group.length >= 4 ? 'high' : 'watch',
      title: tt('เสี่ยงแบ่งกลุ่ม (พรรคพวก)', 'Clique risk'),
      detail: tt(
        `${group.length} คนผูกพันกับกลุ่มสูงและมีสไตล์คล้ายกัน อาจรวมกลุ่มกันเองจนคนอื่นรู้สึกเป็นคนนอก`,
        `${group.length} people with strong in-group loyalty and a similar style may close ranks and leave others feeling like outsiders`,
      ),
      people: group.map((m) => m.name),
    })
  })

  // Power imbalance: a dominant person in the same team as someone with a high silence risk.
  const dominant = members.filter((m) => (m.scores.LD + (100 - m.scores.KJ) + (100 - m.scores.A) + (100 - m.scores.H)) / 4 >= 62)
  const quiet = members.filter((m) => (m.scores.KJ + m.scores.FC + (100 - m.scores.X) + (100 - m.scores.E)) / 4 >= 60)
  if (dominant.length && quiet.length) {
    risks.push({
      id: 'power',
      level: dominant.length + quiet.length >= 4 ? 'high' : 'watch',
      title: tt('ความต่างของพลังในทีม', 'Power imbalance'),
      detail: tt(
        'มีทั้งคนที่พลังนำสูงมากและคนที่ไม่กล้าส่งเสียง เสี่ยงที่คนเงียบจะถูกกดหรือถูกแกล้งโดยไม่มีใครรู้',
        'The team has both very dominant people and people who stay silent; quieter members could be pushed around or picked on unnoticed',
      ),
      people: [...dominant, ...quiet].map((m) => m.name),
    })
  }

  // Say–do gaps visible to the manager through the 360.
  const talkers = members.filter((m) => m.scores.PR * 0.6 + m.scores.X * 0.4 - m.observedDelivery >= 20)
  if (talkers.length) {
    risks.push({
      id: 'say-do',
      level: talkers.length >= 2 ? 'high' : 'watch',
      title: tt('พูดมากกว่าผลงาน', 'Talk ahead of delivery'),
      detail: tt('คะแนนการนำเสนอสูงกว่าผลงานที่เพื่อนร่วมงานประเมินอย่างชัดเจน ควรวัดผลจากงานจริง', 'Self-presentation is clearly higher than peer-rated delivery; measure by real output'),
      people: talkers.map((m) => m.name),
    })
  }
  const gems = members.filter((m) => m.observedDelivery - (m.scores.PR * 0.6 + m.scores.X * 0.4) >= 20 && m.observedDelivery >= 60)
  if (gems.length) {
    risks.push({
      id: 'gems',
      level: 'watch',
      title: tt('เพชรในตมที่อาจถูกมองข้าม', 'Hidden gems who may be overlooked'),
      detail: tt('ผลงานจริงดีกว่าที่พวกเขานำเสนอตัวเองมาก ควรให้เครดิตและโอกาสอย่างเป็นธรรม', 'Their real work is much better than how they present themselves; give fair credit and chances'),
      people: gems.map((m) => m.name),
    })
  }
  return risks
}

export const analyseTeam = (members: StaffMember[]): TeamAnalysis => {
  const aggregate: TeamAggregate | null = canShowAggregate(members.length)
    ? {
        roles: roleDistribution(members),
        context: contextDistribution(members),
        spread: DIM_CODES.map((dim) => {
          const xs = members.map((m) => m.scores[dim])
          return { dim, mean: Math.round(mean(xs)), sd: Math.round(sd(xs)) }
        }),
        blindSpots: blindSpotsOf(members),
      }
    : null
  return { size: members.length, aggregate, risks: risksOf(members) }
}

export const dimLabel = (dim: DimCode) => dimMeta(dim)
