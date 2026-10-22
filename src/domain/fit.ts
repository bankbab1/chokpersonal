import { tt, type T } from '@/lib/i18n'
import { dimMeta, dimName } from './dimensions'
import type { DimCode, Scores } from './types'

/* ------------------------------------------------------------------------------------------------
 * Fit engine. A role (job line or environment) is a set of target ranges with weights:
 *   must = 3, important = 2, nice = 1.
 * RoleFit = 100 × (1 − Σ w·max(0, |p − c| − r) / Σ w·22)
 * Inside the range costs nothing; distance outside it is penalised. Ranges are starting hypotheses
 * for HR to calibrate against 8–10 strong performers per job line during the pilot.
 * ---------------------------------------------------------------------------------------------- */

export interface Target {
  dim: DimCode
  center: number
  half: number
  weight: 1 | 2 | 3
}

export interface RoleProfile {
  id: string
  th: string
  en: string
  /** Everyday job titles, so people can picture the area. */
  examples?: T
  targets: Target[]
}

const t = (dim: DimCode, center: number, half: number, weight: 1 | 2 | 3): Target => ({ dim, center, half, weight })

/** Broad job areas found in most Thai organisations, in plain words people use when job hunting. */
export const JOB_LINES: RoleProfile[] = [
  { id: 'sales', th: 'งานขายและหาลูกค้า', en: 'Sales', examples: tt('พนักงานขาย, Sales executive, ตัวแทนขาย, Telesales', 'Sales staff, Sales executive, Sales agent, Telesales'), targets: [t('X', 75, 20, 3), t('PR', 70, 20, 2), t('E', 70, 20, 2), t('PC', 65, 20, 1), t('CH', 60, 25, 1)] },
  { id: 'service', th: 'งานบริการลูกค้า', en: 'Customer service', examples: tt('Call center, พนักงานหน้าร้าน, Front desk, Customer success', 'Call centre, Shop staff, Front desk, Customer success'), targets: [t('A', 75, 15, 3), t('E', 70, 20, 3), t('X', 60, 25, 1), t('ST', 60, 25, 1)] },
  { id: 'people-lead', th: 'หัวหน้างานและบริหารทีม', en: 'Team lead & management', examples: tt('หัวหน้าทีม, Supervisor, ผู้จัดการสาขา, ผู้จัดการแผนก', 'Team lead, Supervisor, Branch manager, Department manager'), targets: [t('LD', 80, 15, 3), t('E', 75, 15, 3), t('KJ', 40, 20, 2), t('A', 60, 20, 1), t('C', 65, 20, 1)] },
  { id: 'finance', th: 'บัญชีและการเงิน', en: 'Accounting & finance', examples: tt('นักบัญชี, Finance officer, Auditor, เจ้าหน้าที่ภาษี', 'Accountant, Finance officer, Auditor, Tax officer'), targets: [t('C', 80, 15, 3), t('H', 75, 15, 3), t('MP', 25, 20, 2), t('ST', 70, 20, 1)] },
  { id: 'hr', th: 'งานบุคคล (HR)', en: 'Human resources', examples: tt('HR generalist, Recruiter, Training, Payroll', 'HR generalist, Recruiter, Training, Payroll'), targets: [t('A', 75, 15, 3), t('H', 75, 15, 3), t('E', 65, 20, 2), t('X', 60, 25, 1)] },
  { id: 'marketing', th: 'การตลาดและสื่อสาร', en: 'Marketing & communications', examples: tt('Marketing executive, Content creator, PR, Brand', 'Marketing executive, Content creator, PR, Brand'), targets: [t('O', 75, 15, 3), t('X', 65, 20, 2), t('CH', 70, 20, 2), t('PR', 65, 20, 1)] },
  { id: 'creative', th: 'งานออกแบบและสร้างสรรค์', en: 'Design & creative', examples: tt('Graphic designer, UX/UI, Product designer, Stylist', 'Graphic designer, UX/UI, Product designer, Stylist'), targets: [t('O', 85, 15, 3), t('ST', 35, 20, 2), t('CO', 60, 25, 1), t('CH', 70, 20, 1)] },
  { id: 'tech', th: 'ไอทีและพัฒนาซอฟต์แวร์', en: 'IT & software', examples: tt('Developer, IT support, System admin, QA', 'Developer, IT support, System admin, QA'), targets: [t('O', 70, 20, 2), t('C', 70, 20, 2), t('ST', 40, 25, 1), t('CO', 45, 25, 1), t('E', 60, 25, 1)] },
  { id: 'data', th: 'วิเคราะห์ข้อมูลและวางแผน', en: 'Data & planning', examples: tt('Data analyst, Planner, Business analyst, Demand planner', 'Data analyst, Planner, Business analyst, Demand planner'), targets: [t('C', 80, 15, 3), t('MP', 30, 20, 2), t('O', 65, 20, 2), t('PC', 40, 20, 1)] },
  { id: 'purchasing', th: 'จัดซื้อและจัดหา', en: 'Purchasing & sourcing', examples: tt('Purchasing, Buyer, Vendor management, Sourcing', 'Purchasing, Buyer, Vendor management, Sourcing'), targets: [t('KJ', 35, 20, 3), t('C', 70, 20, 2), t('E', 65, 20, 2), t('PR', 60, 25, 1)] },
  { id: 'operations', th: 'ปฏิบัติการและการผลิต', en: 'Operations & production', examples: tt('Production, Operations officer, QC, หัวหน้าไลน์ผลิต', 'Production, Operations officer, QC, Line supervisor'), targets: [t('C', 75, 15, 3), t('ST', 70, 20, 2), t('MP', 30, 20, 2), t('E', 65, 20, 1)] },
  { id: 'logistics', th: 'คลังสินค้าและโลจิสติกส์', en: 'Warehouse & logistics', examples: tt('Warehouse, Inventory, Delivery, Shipping', 'Warehouse, Inventory, Delivery, Shipping'), targets: [t('C', 75, 15, 3), t('PC', 65, 20, 2), t('E', 65, 20, 2), t('ST', 65, 20, 1)] },
  { id: 'admin', th: 'ธุรการและประสานงาน', en: 'Admin & coordination', examples: tt('Admin, เลขานุการ, ผู้ประสานงาน, Office coordinator', 'Admin, Secretary, Coordinator, Office coordinator'), targets: [t('C', 75, 15, 3), t('A', 65, 20, 2), t('ST', 70, 20, 2), t('CO', 65, 20, 1)] },
  { id: 'engineering', th: 'วิศวกรรมและงานช่าง', en: 'Engineering & technical', examples: tt('วิศวกร, ช่างเทคนิค, Maintenance, Safety officer', 'Engineer, Technician, Maintenance, Safety officer'), targets: [t('C', 75, 15, 3), t('MP', 25, 20, 2), t('O', 60, 25, 1), t('E', 65, 20, 1)] },
  { id: 'legal', th: 'กฎหมายและกำกับดูแล', en: 'Legal & compliance', examples: tt('Legal officer, Compliance, Risk, Internal audit', 'Legal officer, Compliance, Risk, Internal audit'), targets: [t('H', 80, 15, 3), t('MP', 25, 20, 3), t('KJ', 40, 20, 2), t('C', 75, 15, 2)] },
  { id: 'project', th: 'พัฒนาธุรกิจและบริหารโปรเจกต์', en: 'Business & project', examples: tt('Project manager, Business development, Product owner', 'Project manager, Business development, Product owner'), targets: [t('LD', 70, 20, 2), t('CH', 70, 20, 2), t('O', 70, 20, 2), t('CO', 65, 20, 2), t('PR', 60, 25, 1)] },
  { id: 'teaching', th: 'สอน ฝึกอบรม และโค้ช', en: 'Teaching & coaching', examples: tt('Trainer, ครู, Coach, Onboarding specialist', 'Trainer, Teacher, Coach, Onboarding specialist'), targets: [t('X', 65, 20, 2), t('A', 70, 20, 2), t('PR', 65, 20, 2), t('O', 60, 25, 1)] },
  { id: 'care', th: 'ดูแลสุขภาพและบริการคน', en: 'Health & care', examples: tt('พยาบาล, ผู้ช่วยแพทย์, Caregiver, เภสัชกร', 'Nurse, Medical assistant, Caregiver, Pharmacist'), targets: [t('A', 75, 15, 3), t('E', 70, 20, 3), t('C', 70, 20, 2), t('H', 70, 20, 1)] },
]

export const ENVIRONMENTS: RoleProfile[] = [
  { id: 'env-frontline', th: 'หน้างานพบลูกค้าทั้งวัน', en: 'Customer-facing front line', examples: tt('ร้าน สาขา เคาน์เตอร์ คอลเซ็นเตอร์', 'Shops, branches, counters, call centres'), targets: [t('E', 75, 15, 3), t('X', 70, 20, 2), t('PC', 65, 20, 2), t('SK', 60, 25, 1)] },
  { id: 'env-office', th: 'ออฟฟิศและงานระบบ', en: 'Office & systems', examples: tt('ฝ่ายสนับสนุน งานเอกสาร งานระบบ', 'Support functions, paperwork, systems'), targets: [t('C', 75, 15, 3), t('ST', 70, 20, 2), t('MP', 35, 20, 1)] },
  { id: 'env-project', th: 'ทีมโปรเจกต์สร้างสรรค์', en: 'Creative project team', examples: tt('เอเจนซี ทีมออกแบบ ทีมแคมเปญ', 'Agencies, design teams, campaign teams'), targets: [t('O', 75, 15, 3), t('CH', 70, 20, 2), t('CO', 65, 20, 2), t('ST', 40, 20, 1)] },
  { id: 'env-site', th: 'โรงงาน คลัง หรือภาคสนาม', en: 'Factory, warehouse or field', examples: tt('ไลน์ผลิต คลังสินค้า ไซต์งาน', 'Production lines, warehouses, sites'), targets: [t('C', 75, 15, 3), t('PC', 60, 20, 2), t('E', 65, 20, 1), t('ST', 65, 20, 1)] },
  { id: 'env-startup', th: 'สตาร์ทอัพหรือทีมที่เปลี่ยนเร็ว', en: 'Fast-changing team', examples: tt('สตาร์ทอัพ ทีมดิจิทัล ทีมเปิดธุรกิจใหม่', 'Startups, digital teams, new ventures'), targets: [t('CH', 75, 15, 3), t('O', 70, 20, 2), t('ST', 35, 20, 2), t('PC', 65, 20, 1)] },
  { id: 'env-corporate', th: 'องค์กรใหญ่ที่มีลำดับขั้น', en: 'Large hierarchical organisation', examples: tt('บริษัทมหาชน หน่วยงานรัฐ ธนาคาร', 'Listed companies, government, banks'), targets: [t('SN', 60, 20, 2), t('ST', 70, 20, 2), t('E', 65, 20, 1), t('FC', 55, 25, 1)] },
]

export interface FitReason {
  dim: DimCode
  score: number
  label: T
  kind: 'strong' | 'watch'
}

export interface FitResult {
  id: string
  th: string
  en: string
  fit: number
  reasons: FitReason[]
}

export const roleFit = (scores: Scores, role: RoleProfile): FitResult => {
  let penalty = 0
  let weight = 0
  const reasons: (FitReason & { gap: number })[] = []
  for (const tg of role.targets) {
    const p = scores[tg.dim]
    const gap = Math.max(0, Math.abs(p - tg.center) - tg.half)
    penalty += tg.weight * gap
    weight += tg.weight
    const meta = dimMeta(tg.dim)
    reasons.push({
      dim: tg.dim,
      score: p,
      label: dimName(meta),
      // Within 5 points of the range reads as a match, not a warning.
      kind: gap < 5 ? 'strong' : 'watch',
      gap: gap === 0 ? -tg.weight : gap * tg.weight,
    })
  }
  // 22 points outside every range (weighted) = 0% fit; tuned so shortlists separate candidates clearly.
  const fit = Math.round(100 * (1 - penalty / (weight * 22)))
  reasons.sort((a, b) => a.gap - b.gap)
  return {
    id: role.id,
    th: role.th,
    en: role.en,
    fit: Math.max(0, fit),
    reasons: reasons.map(({ gap: _gap, ...r }) => r),
  }
}

export const rankRoles = (scores: Scores, roles: RoleProfile[] = JOB_LINES): FitResult[] =>
  roles.map((r) => roleFit(scores, r)).sort((a, b) => b.fit - a.fit)

/* ----------------------------------------- Manager fit ----------------------------------------- */

export type ManagerStyleId = 'directive' | 'coach' | 'handsoff' | 'challenger' | 'family'

export const MANAGER_STYLES: { id: ManagerStyleId; th: string; en: string; blurb: T }[] = [
  { id: 'directive', th: 'สั่งการชัด ยึดลำดับขั้น', en: 'Directive, hierarchical', blurb: tt('ตัดสินใจเอง บอกชัดว่าใครทำอะไร', 'Decides and tells each person what to do') },
  { id: 'coach', th: 'โค้ช ใส่ใจรายคน', en: 'Coach', blurb: tt('นัดคุยตัวต่อตัว พัฒนาคนทีละคน', 'Regular 1:1s, develops people one by one') },
  { id: 'handsoff', th: 'ปล่อยอิสระ', en: 'Hands-off', blurb: tt('บอกเป้า แล้วให้หาวิธีเอง', 'Sets the goal and lets you find the way') },
  { id: 'challenger', th: 'เน้นผลลัพธ์ เปิดให้เถียง', en: 'Results-first challenger', blurb: tt('ให้ feedback ตรงในที่ประชุม คาดหวังให้ทีมแย้ง', 'Direct feedback in meetings, expects push-back') },
  { id: 'family', th: 'สายครอบครัว อบอุ่น', en: 'Family-style, warm', blurb: tt('ดูแลทีมเหมือนพี่น้อง บรรยากาศเป็นกันเอง', 'Treats the team like family, relaxed atmosphere') },
]

interface PairRule {
  style: ManagerStyleId
  dim: DimCode
  when: 'high' | 'low'
  effect: number
  text: T
}

const RULES: PairRule[] = [
  { style: 'challenger', dim: 'KJ', when: 'high', effect: -18, text: tt('คุณเกรงใจสูง แต่หัวหน้ารอให้แย้งเอง ปัญหาอาจไม่ถูกพูดออกมา ควรขอคุยตัวต่อตัว', 'You\'re very deferential, but this manager waits for push-back. Problems may go unsaid; ask for 1:1s.') },
  { style: 'challenger', dim: 'FC', when: 'high', effect: -14, text: tt('feedback ต่อหน้าทีมอาจทำให้เสียกำลังใจ ขอให้คุยเรื่องแก้ไขแบบส่วนตัว', 'Feedback in front of the team may hurt; ask for corrections in private.') },
  { style: 'challenger', dim: 'KJ', when: 'low', effect: 10, text: tt('คุณพูดตรง เข้ากับหัวหน้าที่ชอบให้ทีมแย้ง', 'You speak up, which suits a manager who wants debate.') },
  { style: 'challenger', dim: 'E', when: 'high', effect: 6, text: tt('ใจนิ่ง รับ feedback แรง ๆ ได้', 'You stay calm and can take tough feedback.') },
  { style: 'handsoff', dim: 'ST', when: 'high', effect: -16, text: tt('คุณต้องการโครงสร้างชัด แต่หัวหน้าปล่อยอิสระ ควรตกลงเป้าเป็นลายลักษณ์อักษร', 'You want clear structure but this manager is hands-off; agree goals in writing.') },
  { style: 'handsoff', dim: 'ST', when: 'low', effect: 12, text: tt('คุณชอบออกแบบวิธีเอง เข้ากับหัวหน้าที่ปล่อยอิสระ', 'You like designing your own way, which suits a hands-off manager.') },
  { style: 'handsoff', dim: 'O', when: 'high', effect: 6, text: tt('มีพื้นที่ให้ลองไอเดียใหม่', 'Room to try new ideas.') },
  { style: 'directive', dim: 'LD', when: 'high', effect: -10, text: tt('คุณอยากนำเอง ควรได้รับผิดชอบงานบางส่วนเต็มที่', 'You want to lead; ask for full ownership of an area.') },
  { style: 'directive', dim: 'SN', when: 'high', effect: 10, text: tt('คุณสบายใจกับลำดับขั้นชัด เข้ากับหัวหน้าที่สั่งการชัด', 'You\'re comfortable with clear rank, which suits a directive manager.') },
  { style: 'directive', dim: 'SN', when: 'low', effect: -12, text: tt('คุณชอบทีมแบน อาจอึดอัดกับการสั่งการแบบบนลงล่าง', 'You prefer flat teams and may chafe at top-down orders.') },
  { style: 'directive', dim: 'ST', when: 'high', effect: 8, text: tt('คำสั่งชัดช่วยให้คุณทำงานได้ดี', 'Clear instructions help you do your best work.') },
  { style: 'coach', dim: 'KJ', when: 'high', effect: 12, text: tt('การคุยตัวต่อตัวช่วยให้คุณกล้าเล่าปัญหา', '1:1 conversations help you raise problems.') },
  { style: 'coach', dim: 'FC', when: 'high', effect: 8, text: tt('feedback แบบส่วนตัวเหมาะกับคุณ', 'Private feedback suits you.') },
  { style: 'coach', dim: 'LD', when: 'high', effect: 6, text: tt('ได้รับการพัฒนาให้พร้อมเป็นหัวหน้า', 'You\'ll be developed toward leadership.') },
  { style: 'family', dim: 'SK', when: 'high', effect: 12, text: tt('บรรยากาศอบอุ่นทำให้คุณมีพลัง', 'A warm atmosphere energises you.') },
  { style: 'family', dim: 'BK', when: 'high', effect: 8, text: tt('ความผูกพันกับหัวหน้าจะสูงมาก ควรวางแผนกรณีหัวหน้าย้าย', 'You\'ll bond strongly with this manager; plan for if they move on.') },
  { style: 'family', dim: 'SK', when: 'low', effect: -8, text: tt('คุณโฟกัสงาน อาจรู้สึกว่ากิจกรรมทีมมากเกินไป', 'You\'re task-focused and may find team activities too much.') },
  { style: 'family', dim: 'BK', when: 'low', effect: -6, text: tt('คุณยึดระบบ อาจไม่สบายใจถ้าการตัดสินใจใช้ความสนิทมากกว่าเกณฑ์', 'You\'re rule-based and may be uneasy if decisions favour closeness over criteria.') },
]

export interface ManagerFit {
  style: ManagerStyleId
  name: T
  fit: number
  notes: { text: T; good: boolean }[]
}

export const managerFit = (scores: Scores): ManagerFit[] =>
  MANAGER_STYLES.map((m) => {
    const hits = RULES.filter(
      (r) => r.style === m.id && (r.when === 'high' ? scores[r.dim] >= 65 : scores[r.dim] <= 35),
    )
    const fit = Math.max(0, Math.min(100, 70 + hits.reduce((s, r) => s + r.effect, 0)))
    return { style: m.id, name: tt(m.th, m.en), fit, notes: hits.map((h) => ({ text: h.text, good: h.effect > 0 })) }
  }).sort((a, b) => b.fit - a.fit)
