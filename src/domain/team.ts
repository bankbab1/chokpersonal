import { tt, type T } from '@/lib/i18n'
import { DIM_CODES, dimMeta } from './dimensions'
import type { StaffMember } from './demo'
import { FAMILIES } from './personas'
import type { DimCode, FamilyId } from './types'

export interface TeamRisk {
  id: string
  level: 'watch' | 'high'
  title: T
  detail: T
  people: string[]
}

export interface TeamAnalysis {
  size: number
  familyCount: Record<FamilyId, number>
  missingFamilies: FamilyId[]
  quadrants: { LF: number; LC: number; SF: number; SC: number }
  spread: { dim: DimCode; mean: number; sd: number }[]
  blindSpots: T[]
  risks: TeamRisk[]
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
const sd = (xs: number[]) => {
  const m = mean(xs)
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2)))
}

export const analyseTeam = (members: StaffMember[]): TeamAnalysis => {
  const familyCount = Object.fromEntries(FAMILIES.map((f) => [f.id, 0])) as Record<FamilyId, number>
  const quadrants = { LF: 0, LC: 0, SF: 0, SC: 0 }
  for (const m of members) {
    familyCount[m.persona.family]++
    quadrants[m.persona.variant]++
  }
  const spread = DIM_CODES.map((dim) => {
    const xs = members.map((m) => m.scores[dim])
    return { dim, mean: Math.round(mean(xs)), sd: Math.round(sd(xs)) }
  })

  const blindSpots: T[] = []
  const lowSpread = (dim: DimCode, side: 'high' | 'low', text: T) => {
    const xs = members.map((m) => m.scores[dim])
    const anyone = side === 'low' ? xs.some((x) => x <= 40) : xs.some((x) => x >= 60)
    if (!anyone) blindSpots.push(text)
  }
  lowSpread('MP', 'low', tt('ไม่มีใครสายเป๊ะ เสี่ยงหลุดรายละเอียดและตัวเลข', 'No one is precise; details and numbers may slip'))
  lowSpread('KJ', 'low', tt('ไม่มีใครกล้าพูดตรง ปัญหาอาจถูกเก็บเงียบ', 'No one speaks up; problems may stay hidden'))
  lowSpread('O', 'high', tt('ไม่มีคนสายไอเดียใหม่ ทีมอาจติดวิธีเดิม', 'No idea person; the team may get stuck in old ways'))
  lowSpread('LD', 'high', tt('ไม่มีคนที่พร้อมนำเมื่อหัวหน้าไม่อยู่', 'No one ready to lead when the manager is away'))
  lowSpread('PC', 'low', tt('ไม่มีคนสายรอบคอบ ตัดสินใจเร็วเกินไป', 'No careful thinker; decisions may be rushed'))

  const risks: TeamRisk[] = []

  // Cliques (พรรคพวก): several people high on loyalty + seniority who share a family.
  const cliqueScore = (m: StaffMember) => (m.scores.BK + m.scores.SN + m.scores.SK + (100 - m.scores.H)) / 4
  const pulled = members.filter((m) => cliqueScore(m) >= 60)
  const byFamily = new Map<FamilyId, StaffMember[]>()
  for (const m of pulled) byFamily.set(m.persona.family, [...(byFamily.get(m.persona.family) ?? []), m])
  for (const [fam, group] of byFamily) {
    if (group.length >= 3) {
      risks.push({
        id: `clique-${fam}`,
        level: group.length >= 4 ? 'high' : 'watch',
        title: tt('เสี่ยงแบ่งกลุ่ม (พรรคพวก)', 'Clique risk'),
        detail: tt(
          `${group.length} คนผูกพันกับกลุ่มสูงและมีสไตล์คล้ายกัน อาจรวมกลุ่มกันเองจนคนอื่นรู้สึกเป็นคนนอก`,
          `${group.length} people with strong in-group loyalty and a similar style may close ranks and leave others feeling like outsiders`,
        ),
        people: group.map((m) => m.name),
      })
    }
  }

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

  return {
    size: members.length,
    familyCount,
    missingFamilies: FAMILIES.filter((f) => familyCount[f.id] === 0).map((f) => f.id),
    quadrants,
    spread,
    blindSpots,
    risks,
  }
}

export const dimLabel = (dim: DimCode) => dimMeta(dim)
