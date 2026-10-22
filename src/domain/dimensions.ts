import { tt, type T } from '@/lib/i18n'
import type { DimCode, Layer } from './types'

export interface DimensionMeta {
  code: DimCode
  layer: Layer
  th: string
  en: string
  low: T // what a low score looks like
  high: T // what a high score looks like
}

export const dimName = (d: Pick<DimensionMeta, 'th' | 'en'>): T => ({ th: d.th, en: d.en })

export const LAYERS: { id: Layer; th: string; en: string; blurb: T }[] = [
  { id: 'core', th: 'บุคลิกพื้นฐาน', en: 'Core personality', blurb: tt('HEXACO 6 มิติ วัดด้วยสเกล 6 ระดับ', 'HEXACO, 6 dimensions on a 6-point scale') },
  { id: 'thai', th: 'บริบทคนไทย', en: 'Thai workplace culture', blurb: tt('เกรงใจ อาวุโส หน้าตา สนุก ไม่เป็นไร บุญคุณ', 'Deference, seniority, face, fun, flexibility, loyalty') },
  { id: 'work', th: 'สไตล์การทำงาน', en: 'Work style', blurb: tt('นำ/สนับสนุน ความเร็ว การทำงานร่วม โครงสร้าง การเปลี่ยนแปลง การนำเสนอ', 'Lead/support, pace, teamwork, structure, change, self-presentation') },
]

export const DIMENSIONS: DimensionMeta[] = [
  { code: 'H', layer: 'core', th: 'ซื่อตรง-ถ่อมตน', en: 'Honesty–humility', low: tt('มองหาประโยชน์ส่วนตัว', 'Looks out for own gain'), high: tt('ซื่อตรง ไม่เอาเปรียบ', 'Sincere, fair, modest') },
  { code: 'E', layer: 'core', th: 'อารมณ์มั่นคง', en: 'Emotional stability', low: tt('อ่อนไหว กังวลง่าย', 'Sensitive, worries easily'), high: tt('ใจนิ่ง รับแรงกดดันได้', 'Calm under pressure') },
  { code: 'X', layer: 'core', th: 'การเข้าสังคม', en: 'Extraversion', low: tt('เงียบ ชอบโฟกัส', 'Quiet, focused'), high: tt('มีพลังเมื่ออยู่กับคน', 'Energised by people') },
  { code: 'A', layer: 'core', th: 'ประนีประนอม', en: 'Agreeableness', low: tt('ตรง วิจารณ์แรง', 'Blunt, critical'), high: tt('ให้อภัย ยืดหยุ่นกับคน', 'Forgiving, easy to work with') },
  { code: 'C', layer: 'core', th: 'วินัยและรับผิดชอบ', en: 'Conscientiousness', low: tt('ทำตามจังหวะตัวเอง', 'Works at own rhythm'), high: tt('มีแผน ส่งงานตรงเวลา', 'Planned, delivers on time') },
  { code: 'O', layer: 'core', th: 'เปิดรับสิ่งใหม่', en: 'Openness', low: tt('ชอบวิธีที่พิสูจน์แล้ว', 'Prefers proven ways'), high: tt('ชอบไอเดียและวิธีใหม่', 'Loves new ideas') },
  { code: 'KJ', layer: 'thai', th: 'เกรงใจ', en: 'Deference (kreng jai)', low: tt('พูดตรง กล้าแย้ง', 'Speaks up, disagrees openly'), high: tt('เก็บความเห็นไว้ ไม่อยากรบกวน', 'Keeps concerns to self') },
  { code: 'SN', layer: 'thai', th: 'ระบบอาวุโส', en: 'Seniority comfort', low: tt('ชอบทีมแบน', 'Prefers flat teams'), high: tt('สบายใจกับลำดับขั้นชัด', 'Comfortable with clear rank') },
  { code: 'FC', layer: 'thai', th: 'รักษาหน้า', en: 'Face concern', low: tt('รับ feedback ตรงได้', 'Takes direct feedback'), high: tt('ต้องการ feedback ส่วนตัว', 'Needs private feedback') },
  { code: 'SK', layer: 'thai', th: 'สนุก', en: 'Fun at work (sanuk)', low: tt('โฟกัสงานล้วน', 'Task-focused'), high: tt('ต้องการทีมอบอุ่นสนุก', 'Needs a warm, fun team') },
  { code: 'MP', layer: 'thai', th: 'ไม่เป็นไร ↔ เป๊ะ', en: 'Flexibility (mai pen rai)', low: tt('เป๊ะ ยึดความถูกต้อง', 'Precise, exact'), high: tt('ยืดหยุ่น ไม่เป็นไร', 'Easy-going, flexible') },
  { code: 'BK', layer: 'thai', th: 'บุญคุณ', en: 'Relational loyalty (bunkhun)', low: tt('ยึดระบบและกติกา', 'Loyal to rules and systems'), high: tt('ภักดีต่อคน', 'Loyal to people') },
  { code: 'LD', layer: 'work', th: 'นำ ↔ สนับสนุน', en: 'Lead vs support', low: tt('ถนัดสนับสนุน', 'Prefers to support'), high: tt('ก้าวออกมานำ', 'Steps up to lead') },
  { code: 'PC', layer: 'work', th: 'ความเร็ว', en: 'Pace', low: tt('รอบคอบ ละเอียด', 'Careful, thorough'), high: tt('เร็ว ลงมือก่อน', 'Fast, action-first') },
  { code: 'CO', layer: 'work', th: 'ทำงานร่วม', en: 'Collaboration', low: tt('ถนัดทำคนเดียว', 'Works best alone'), high: tt('ถนัดทำกับคนอื่น', 'Works best with others') },
  { code: 'ST', layer: 'work', th: 'ต้องการโครงสร้าง', en: 'Structure need', low: tt('ชอบอิสระ', 'Wants autonomy'), high: tt('ชอบขั้นตอนชัด', 'Wants clear process') },
  { code: 'CH', layer: 'work', th: 'ชอบการเปลี่ยนแปลง', en: 'Change appetite', low: tt('ชอบความมั่นคง', 'Prefers stability'), high: tt('ชอบสิ่งใหม่ทุกวัน', 'Seeks change') },
  { code: 'PR', layer: 'work', th: 'นำเสนอตัวเอง', en: 'Self-presentation', low: tt('ให้ผลงานพูดแทน', 'Lets work speak'), high: tt('ขายไอเดียและตัวเองเก่ง', 'Sells ideas and self well') },
]

export const DIM_CODES = DIMENSIONS.map((d) => d.code)

export const dimMeta = (code: DimCode): DimensionMeta => {
  const meta = DIMENSIONS.find((d) => d.code === code)
  if (!meta) throw new Error(`Unknown dimension ${code}`)
  return meta
}
