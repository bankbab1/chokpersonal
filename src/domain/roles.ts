import { tt, type T } from '@/lib/i18n'
import type { Animal } from './personas'
import type { Scores } from './types'

/* ------------------------------------------------------------------------------------------------
 * Role interests: the 12 work characters (WorkFit master spec §6, §8, §9, Appendix A/B).
 *
 * This layer answers "which roles do you WANT to take on". It is separate from the 18 style
 * dimensions (how you work) and from skills/evidence (what you can show). Scores are interest
 * levels, never ability, and never combine into a hiring score.
 * ---------------------------------------------------------------------------------------------- */

/** v2: 6-point preference scale and 4-point role choice, no neutral middle (owner decision 2026-10-23). */
export const MODEL_VERSION = 'workfit-role-v2'
export const QUESTION_SET_VERSION = 'th-TH-seed-2'
export const MAPPING_VERSION = 'workfit-mapping-1'
export const REPORT_TEMPLATE_VERSION = 'workfit-report-1'

/** Experimental cut-offs (spec §9.2) — not statistical confidence. */
export const THRESHOLDS = { minimumInterest: 50, mixedGapLt: 7, flatSpreadLt: 13 } as const

export type RoleTypeId =
  | 'navigator' | 'driver' | 'analyst' | 'architect' | 'creator' | 'explorer'
  | 'connector' | 'coach' | 'carer' | 'persuader' | 'guardian' | 'organizer'

/** Fixed type_index order 0–11; never reorder within a model version. */
export const ROLE_TYPE_IDS: RoleTypeId[] = [
  'navigator', 'driver', 'analyst', 'architect', 'creator', 'explorer',
  'connector', 'coach', 'carer', 'persuader', 'guardian', 'organizer',
]

export type RoleScores = Record<RoleTypeId, number>

export type PropKey = 'map' | 'flag' | 'lens' | 'blueprint' | 'pencil' | 'flask' | 'links' | 'sprout' | 'heart' | 'mic' | 'shield' | 'calendar' | 'clipboard' | 'wrench' | 'gear' | 'hammer'

export type RoleGroupId = 'direction' | 'insight' | 'systems' | 'ideas' | 'bridge' | 'care'

/** Six animal families of two related roles each: an easy way in before the 12 details. */
export interface RoleGroup {
  id: RoleGroupId
  animal: Animal
  animalName: T
  name: T
  tagline: T
  types: [RoleTypeId, RoleTypeId]
}

export const ROLE_GROUPS: RoleGroup[] = [
  { id: 'direction', animal: 'tiger', animalName: tt('เสือ', 'Tiger'), name: tt('สายทิศทาง', 'Direction'), tagline: tt('ตั้งเป้า แล้วพาไปให้ถึง', 'Set the goal, then get there'), types: ['navigator', 'driver'] },
  { id: 'insight', animal: 'owl', animalName: tt('นกฮูก', 'Owl'), name: tt('สายข้อมูลและคุณภาพ', 'Insight'), tagline: tt('หาความจริง แล้วทำให้ไว้ใจได้', 'Find the truth, make it trustworthy'), types: ['analyst', 'guardian'] },
  { id: 'systems', animal: 'horse', animalName: tt('ม้า', 'Horse'), name: tt('สายระบบและระเบียบ', 'Systems'), tagline: tt('จัดให้เป็นระบบ งานเดินได้ทุกวัน', 'Build the system that runs every day'), types: ['architect', 'organizer'] },
  { id: 'ideas', animal: 'peacock', animalName: tt('นกยูง', 'Peacock'), name: tt('สายไอเดีย', 'Ideas'), tagline: tt('คิดสิ่งใหม่ ลองให้เห็นจริง', 'Imagine new things, try them for real'), types: ['creator', 'explorer'] },
  { id: 'bridge', animal: 'myna', animalName: tt('นกขุนทอง', 'Hill myna'), name: tt('สายเชื่อมคน', 'Bridge'), tagline: tt('ทำให้คนต่างฝ่ายไปด้วยกันได้', 'Bring different sides together'), types: ['connector', 'persuader'] },
  { id: 'care', animal: 'elephant', animalName: tt('ช้าง', 'Elephant'), name: tt('สายดูแลคน', 'Care'), tagline: tt('ช่วยให้คนเติบโตและไปต่อได้', 'Help people grow and keep going'), types: ['coach', 'carer'] },
]

export interface RoleType {
  id: RoleTypeId
  index: number
  group: RoleGroupId
  name: T
  /** แก่นตัวตน: the interest at the heart of the type. */
  core: T
  /** หน้าที่ที่อาจให้พลัง */
  tasks: T
  jobFamilies: string[]
  /** บริบทสำหรับตั้งคำถามต่อ — a conversation starter, never a substitute for the person's own context. */
  context: T
  /** สิ่งที่ควรตกลงร่วมกัน */
  agreement: T
  /** Skills to check separately — the type does not prove them. */
  skills: T[]
  prop: PropKey
  color: string
  /* Workfit extensions: plain-language persona content (interest, not ability). */
  bestDay: T
  overdone: T
  workWithMe: T
}

const R = (x: Omit<RoleType, 'index'>): Omit<RoleType, 'index'> => x

const TYPES: Omit<RoleType, 'index'>[] = [
  R({
    id: 'navigator', group: 'direction', prop: 'map', color: '#6b779f',
    name: tt('นักวางทิศทาง', 'The Navigator'),
    core: tt('เชื่อมภาพใหญ่ ให้ทุกคนเห็นทางเดียวกัน', 'Connects the big picture so everyone sees the same way forward'),
    tasks: tt('วิเคราะห์ทิศทางธุรกิจ วางเป้าหมาย เชื่อมแผนกับผลลัพธ์', 'Reading business direction, setting goals, linking plans to results'),
    jobFamilies: ['Strategy', 'Business Planning'],
    context: tt('หัวหน้าที่อธิบายเป้าหมายและเปิดพื้นที่เสนอทางเลือก', 'A manager who explains the goal and leaves room to propose options'),
    agreement: tt('ชวนคุยว่าจะเปลี่ยนภาพใหญ่ให้เป็นงานย่อยและติดตามอย่างไร', 'Agree how the big picture turns into smaller tasks and how they are tracked'),
    skills: [tt('วางแผน', 'Planning'), tt('วิเคราะห์ข้อมูล', 'Data analysis')],
    bestDay: tt('ได้ช่วยทีมเลือกว่าอะไรสำคัญที่สุด แล้วเห็นทุกคนเดินไปทางเดียวกัน', 'Helping the team decide what matters most, then seeing everyone move the same way'),
    overdone: tt('อาจคุยภาพใหญ่นานจนงานเล็กยังไม่ได้เริ่ม', 'May stay on the big picture so long that small tasks never start'),
    workWithMe: tt('บอกเป้าหมายและเหตุผลก่อนรายละเอียด แล้วถามความเห็นเรื่องทิศทาง', 'Share the goal and the why before the details, and ask for my view on direction'),
  }),
  R({
    id: 'driver', group: 'direction', prop: 'flag', color: '#cf8555',
    name: tt('นักขับเคลื่อน', 'The Captain'),
    core: tt('เปลี่ยนเป้าหมายให้กลายเป็นงานที่เสร็จจริง', 'Turns goals into work that actually gets done'),
    tasks: tt('ขับเคลื่อนโครงการ จัดลำดับงาน ติดตามอุปสรรค', 'Driving projects, prioritising work, clearing blockers'),
    jobFamilies: ['Project', 'Operations'],
    context: tt('หัวหน้าที่กำหนดผลลัพธ์ ให้อำนาจและช่วยปลดอุปสรรค', 'A manager who sets the outcome, gives authority and helps remove blockers'),
    agreement: tt('ตกลงวิธีรักษาคุณภาพและรับฟังข้อจำกัดเมื่อเร่งงาน', 'Agree how to protect quality and hear constraints when pushing for speed'),
    skills: [tt('บริหารโครงการ', 'Project management'), tt('ประสานงาน', 'Coordination')],
    bestDay: tt('งานที่ค้างมานานเดินต่อได้ เพราะคุณเรียกคนมาคุยและตัดสินใจ', 'A long-stuck piece of work moves again because you got people together to decide'),
    overdone: tt('อาจเร่งจนคนอื่นไม่กล้าบอกข้อจำกัด', 'May push so hard that others stop raising constraints'),
    workWithMe: tt('ให้เป้าหมายและเส้นตายชัด แล้วบอกตรง ๆ ถ้ามีอะไรติด', 'Give a clear goal and deadline, and tell me straight when something is stuck'),
  }),
  R({
    id: 'analyst', group: 'insight', prop: 'lens', color: '#568ba2',
    name: tt('นักวิเคราะห์', 'The Investigator'),
    core: tt('ค้นเหตุผลจากข้อมูล ก่อนเลือกคำตอบ', 'Finds the reasons in the data before choosing an answer'),
    tasks: tt('วิเคราะห์ข้อมูล หาสาเหตุ สรุปข้อค้นพบ', 'Analysing data, finding root causes, summarising findings'),
    jobFamilies: ['Data & Analysis', 'Business Analysis'],
    context: tt('หัวหน้าที่ให้ข้อมูล เวลาเจาะลึก และพื้นที่ซักถาม', 'A manager who shares data, gives time to dig deep and welcomes questions'),
    agreement: tt('ตกลงว่าข้อมูลเพียงพอตัดสินใจเมื่อใด เพื่อไม่ให้วิเคราะห์ไม่จบ', 'Agree when the data is enough to decide, so analysis does not go on forever'),
    skills: [tt('วิเคราะห์ข้อมูล', 'Data analysis'), tt('แก้ปัญหา', 'Problem solving')],
    bestDay: tt('เจอสาเหตุจริงที่ซ่อนอยู่ในข้อมูล และทีมเปลี่ยนการตัดสินใจเพราะสิ่งที่คุณพบ', 'Finding the real cause hidden in the data, and the team changing course because of it'),
    overdone: tt('อาจขอข้อมูลเพิ่มจนการตัดสินใจช้าเกินไป', 'May keep asking for more data until the decision comes too late'),
    workWithMe: tt('ให้ข้อมูลดิบและเวลาคิด แล้วถามว่า “ข้อมูลบอกอะไร”', 'Give me the raw data and time to think, then ask “what does the data say?”'),
  }),
  R({
    id: 'architect', group: 'systems', prop: 'blueprint', color: '#608f83',
    name: tt('นักออกแบบระบบ', 'The Architect'),
    core: tt('จัดโครงสร้างให้เรื่องยุ่งยากทำงานง่ายขึ้น', 'Structures messy things so they work more easily'),
    tasks: tt('ออกแบบกระบวนการ เชื่อมระบบ ลดขั้นตอนซ้ำ', 'Designing processes, connecting systems, removing repeated steps'),
    jobFamilies: ['Process & Systems', 'Business Analysis'],
    context: tt('หัวหน้าที่เห็นคุณค่าของการแก้ระบบและให้คุยกับผู้ใช้งานจริง', 'A manager who values fixing the system and lets you talk to real users'),
    agreement: tt('ชวนตรวจว่าระบบใหม่ช่วยผู้ใช้จริงหรือเพิ่มความซับซ้อน', 'Check together whether the new system really helps users or just adds complexity'),
    skills: [tt('ออกแบบกระบวนการ', 'Process design'), tt('แก้ปัญหา', 'Problem solving')],
    bestDay: tt('ปัญหาที่เกิดซ้ำทุกสัปดาห์หายไป เพราะคุณแก้ที่ต้นระบบ', 'A problem that came back every week disappears because you fixed it at the source'),
    overdone: tt('อาจออกแบบระบบละเอียดเกินกว่าที่ผู้ใช้ต้องการ', 'May design a system more detailed than users actually need'),
    workWithMe: tt('ให้เห็นภาพทั้งกระบวนการ และให้เวลาออกแบบก่อนลงมือ', 'Show me the whole process and give me time to design before we build'),
  }),
  R({
    id: 'creator', group: 'ideas', prop: 'pencil', color: '#b77f9b',
    name: tt('นักสร้างสรรค์', 'The Maker'),
    core: tt('มองเห็นทางเลือกใหม่ และทำให้ไอเดียมีรูปร่าง', 'Sees new options and gives ideas a real shape'),
    tasks: tt('คิดแนวคิด ออกแบบประสบการณ์ สร้างเนื้อหา', 'Developing concepts, designing experiences, creating content'),
    jobFamilies: ['Design & Content', 'Product & Innovation'],
    context: tt('หัวหน้าที่ให้โจทย์ชัด แต่เปิดวิธีตีความและมี feedback ที่เจาะจง', 'A manager who gives a clear brief, leaves room to interpret and gives specific feedback'),
    agreement: tt('ตกลงขอบเขต เวลา และเกณฑ์เลือกไอเดียที่จะทำจริง', 'Agree the scope, the time and how to choose which ideas to build'),
    skills: [tt('ออกแบบ', 'Design'), tt('สื่อสาร', 'Communication')],
    bestDay: tt('ไอเดียที่เริ่มจากกระดาษเปล่ากลายเป็นสิ่งที่คนใช้และชอบจริง', 'An idea that started on a blank page becomes something people actually use and like'),
    overdone: tt('อาจเริ่มไอเดียใหม่ก่อนไอเดียเดิมจะเสร็จ', 'May start a new idea before the last one is finished'),
    workWithMe: tt('ให้โจทย์ที่ชัดแต่ไม่บอกวิธี แล้วให้ feedback เจาะจงว่าตรงไหนใช่ ตรงไหนยัง', 'Give a clear brief without the method, then specific feedback on what works and what does not yet'),
  }),
  R({
    id: 'explorer', group: 'ideas', prop: 'flask', color: '#ba9a47',
    name: tt('นักทดลอง', 'The Explorer'),
    core: tt('ลองให้เล็ก เรียนรู้ให้เร็ว แล้วค่อยขยาย', 'Tries small, learns fast, then scales'),
    tasks: tt('ทดสอบสมมติฐาน ทำต้นแบบ เรียนรู้จากผู้ใช้', 'Testing hypotheses, building prototypes, learning from users'),
    jobFamilies: ['Product & Innovation', 'Research'],
    context: tt('หัวหน้าที่กำหนดขอบเขตความเสี่ยงและเปิดรับผลที่ไม่เป็นไปตามคาด', 'A manager who sets risk limits and is open to unexpected results'),
    agreement: tt('ตกลงจุดหยุดทดลองและหลักฐานที่พอสำหรับขยายผล', 'Agree when to stop an experiment and what evidence is enough to scale'),
    skills: [tt('ทดลอง', 'Experimentation'), tt('แก้ปัญหา', 'Problem solving')],
    bestDay: tt('ต้นแบบเล็ก ๆ ที่ทำในสัปดาห์เดียวตอบคำถามที่ทีมเถียงกันมาเป็นเดือน', 'A small prototype built in a week answers a question the team argued about for a month'),
    overdone: tt('อาจทดลองต่อไปเรื่อย ๆ โดยไม่สรุปผล', 'May keep experimenting without ever drawing a conclusion'),
    workWithMe: tt('ให้พื้นที่ลองในขอบเขตที่ชัด และยอมรับว่าบางครั้งผลจะไม่เป็นไปตามคาด', 'Give me room to try within clear limits, and accept that some results will surprise us'),
  }),
  R({
    id: 'connector', group: 'bridge', prop: 'links', color: '#5c9a9b',
    name: tt('นักประสาน', 'The Connector'),
    core: tt('เชื่อมคนและข้อมูล ให้ทุกฝ่ายเดินไปด้วยกัน', 'Links people and information so every side moves together'),
    tasks: tt('ประสานข้ามฝ่าย จัดข้อตกลง สื่อสารสถานะ', 'Coordinating across teams, arranging agreements, communicating status'),
    jobFamilies: ['Coordination', 'Account & Partnerships'],
    context: tt('หัวหน้าที่กำหนดผู้ตัดสินใจและช่วยจัดการความคาดหวังต่างฝ่าย', 'A manager who names the decision-maker and helps manage different sides’ expectations'),
    agreement: tt('ระบุขอบเขตความรับผิดชอบ ไม่ให้ผู้ประสานต้องรับทุกเรื่อง', 'Define responsibilities so the coordinator does not end up owning everything'),
    skills: [tt('ประสานงาน', 'Coordination'), tt('สื่อสาร', 'Communication')],
    bestDay: tt('สองฝ่ายที่เข้าใจผิดกันมาเริ่มทำงานด้วยกันได้ เพราะคุณช่วยเชื่อม', 'Two sides that misunderstood each other start working together because you connected them'),
    overdone: tt('อาจรับเป็นตัวกลางทุกเรื่องจนงานตัวเองไม่เดิน', 'May become the go-between for everything until your own work stalls'),
    workWithMe: tt('บอกให้ชัดว่าใครตัดสินใจ และขอบเขตที่ฉันประสานได้ถึงไหน', 'Make it clear who decides and how far my coordinating role goes'),
  }),
  R({
    id: 'coach', group: 'care', prop: 'sprout', color: '#9185b3',
    name: tt('นักพัฒนาคน', 'The Coach'),
    core: tt('ช่วยให้คนอื่นค้นวิธีและเติบโตด้วยตัวเอง', 'Helps others find their own way and grow'),
    tasks: tt('สอนงาน ให้ feedback ออกแบบการเรียนรู้', 'Teaching on the job, giving feedback, designing learning'),
    jobFamilies: ['People Development', 'Learning & Training'],
    context: tt('หัวหน้าที่ให้เวลาเรียนรู้และคุยเป้าหมายพัฒนาคนอย่างจริงจัง', 'A manager who makes time for learning and takes people development seriously'),
    agreement: tt('ตกลงเวลาและขอบเขตการช่วย เพื่อไม่รับภาระพัฒนาคนทั้งหมด', 'Agree time and limits for helping, so you do not carry all the people development'),
    skills: [tt('สอนงาน', 'Coaching'), tt('สื่อสาร', 'Communication')],
    bestDay: tt('น้องในทีมทำงานยากได้เองเป็นครั้งแรก หลังจากคุณช่วยฝึกมา', 'A teammate handles a hard task alone for the first time after you coached them'),
    overdone: tt('อาจช่วยคนอื่นจนไม่มีเวลาให้งานตัวเอง', 'May help others so much there is no time left for your own work'),
    workWithMe: tt('ให้เวลาสำหรับการสอนงานนับเป็นงานจริง และคุยเรื่องการเติบโตของทีม', 'Count coaching time as real work, and talk with me about how the team is growing'),
  }),
  R({
    id: 'carer', group: 'care', prop: 'heart', color: '#c28e78',
    name: tt('นักดูแล', 'The Caretaker'),
    core: tt('เข้าใจความต้องการ แล้วช่วยให้คนไปต่อได้', 'Understands what people need and helps them keep going'),
    tasks: tt('ดูแลบริการ รับฟังปัญหา สนับสนุนผู้ใช้', 'Looking after service, listening to problems, supporting users'),
    jobFamilies: ['Service & Support', 'Customer Success'],
    context: tt('หัวหน้าที่ช่วยจัดลำดับเคสและสนับสนุนการตั้งขอบเขต', 'A manager who helps prioritise cases and backs you in setting limits'),
    agreement: tt('ตกลงวิธีส่งต่อเคสที่เกินกำลังและป้องกันการรับปากเกินขอบเขต', 'Agree how to hand over cases beyond your scope and avoid over-promising'),
    skills: [tt('บริการ', 'Service'), tt('สื่อสาร', 'Communication')],
    bestDay: tt('ลูกค้าที่หงุดหงิดตอนเริ่มต้น ขอบคุณตอนจบเพราะคุณช่วยจนเขาไปต่อได้', 'A customer who started frustrated thanks you at the end because you helped them through'),
    overdone: tt('อาจรับปากเกินขอบเขตเพราะไม่อยากให้ใครผิดหวัง', 'May promise beyond your scope because you do not want to disappoint anyone'),
    workWithMe: tt('ช่วยตั้งขอบเขตว่าเรื่องไหนส่งต่อได้ และหนุนเมื่อฉันต้องบอกว่า “ไม่”', 'Help me set limits on what to hand over, and back me when I need to say “no”'),
  }),
  R({
    id: 'persuader', group: 'bridge', prop: 'mic', color: '#bb796e',
    name: tt('นักโน้มน้าว', 'The Diplomat'),
    core: tt('ทำให้คนเห็นคุณค่า และหาทางตกลงร่วมกัน', 'Helps people see the value and finds a deal everyone can accept'),
    tasks: tt('นำเสนอคุณค่า เจรจา พัฒนาพันธมิตร', 'Presenting value, negotiating, building partnerships'),
    jobFamilies: ['Sales & Partnerships', 'Account & Partnerships'],
    context: tt('หัวหน้าที่ให้ขอบเขตต่อรองชัดและรับฟังข้อมูลจากคนที่เจอลูกค้า', 'A manager who sets clear negotiating limits and listens to people who meet customers'),
    agreement: tt('ตกลงสิ่งที่รับปากได้และวิธีส่งมอบหลังเกิดข้อตกลง', 'Agree what can be promised and how delivery works after the deal'),
    skills: [tt('เจรจา', 'Negotiation'), tt('สื่อสาร', 'Communication')],
    bestDay: tt('คนที่ไม่เห็นด้วยตอนเช้า ตกลงร่วมกันได้ตอนบ่ายเพราะคุณหาจุดที่ทุกฝ่ายรับได้', 'Someone who disagreed in the morning agrees by the afternoon because you found common ground'),
    overdone: tt('อาจรับปากลูกค้าก่อนเช็กว่าทีมส่งมอบได้', 'May promise customers before checking the team can deliver'),
    workWithMe: tt('บอกขอบเขตที่ต่อรองได้ให้ชัด และฟังสิ่งที่ฉันได้ยินจากลูกค้า', 'Tell me clearly what I can negotiate, and listen to what I hear from customers'),
  }),
  R({
    id: 'guardian', group: 'insight', prop: 'shield', color: '#7d9273',
    name: tt('นักรักษาคุณภาพ', 'The Guardian'),
    core: tt('เห็นจุดเสี่ยง และช่วยให้ทีมไว้ใจผลงานได้', 'Spots the risks and helps the team trust its work'),
    tasks: tt('ตรวจคุณภาพ ตรวจความถูกต้อง ประเมินความเสี่ยง', 'Checking quality, verifying accuracy, assessing risk'),
    jobFamilies: ['Quality & Control', 'Compliance'],
    context: tt('หัวหน้าที่ให้เวลาและอำนาจทักท้วงเมื่อพบความเสี่ยง', 'A manager who gives time and authority to raise concerns about risk'),
    agreement: tt('ตกลงมาตรฐานที่จำเป็นและระดับความเสี่ยงที่ยอมรับได้', 'Agree the standards that matter and the level of risk that is acceptable'),
    skills: [tt('ตรวจคุณภาพ', 'Quality assurance'), tt('วิเคราะห์ข้อมูล', 'Data analysis')],
    bestDay: tt('จับข้อผิดพลาดได้ก่อนงานออกไปถึงลูกค้า และทีมรู้ว่าไว้ใจผลงานได้', 'Catching a mistake before it reaches the customer, so the team knows its work can be trusted'),
    overdone: tt('อาจตั้งมาตรฐานสูงจนงานช้ากว่าที่จำเป็น', 'May set standards so high that work slows more than needed'),
    workWithMe: tt('ให้สิทธิ์ทักท้วงเมื่อเห็นความเสี่ยง และตกลงกันก่อนว่าแค่ไหนถึงพอ', 'Give me the right to raise risks, and agree in advance what “good enough” means'),
  }),
  R({
    id: 'organizer', group: 'systems', prop: 'calendar', color: '#8c98a8',
    name: tt('นักจัดระเบียบ', 'The Organizer'),
    core: tt('ทำให้รายละเอียดและเวลาประกอบกันอย่างลงตัว', 'Makes the details and the timing fit together'),
    tasks: tt('วางตาราง จัดข้อมูล ติดตามงานประจำ', 'Scheduling, organising information, tracking routine work'),
    jobFamilies: ['Administration', 'Operations'],
    context: tt('หัวหน้าที่กำหนดลำดับความสำคัญและแจ้งเมื่อมีการเปลี่ยนแปลง', 'A manager who sets priorities and tells you when things change'),
    agreement: tt('ตกลงว่ารายการใดเลื่อนได้เมื่อมีงานแทรก และใครตัดสินใจ', 'Agree which items can move when urgent work comes in, and who decides'),
    skills: [tt('จัดการงาน', 'Work management'), tt('ประสานงาน', 'Coordination')],
    bestDay: tt('ทุกอย่างส่งตรงเวลาแม้งานชนกัน เพราะคุณจัดตารางและผู้รับผิดชอบไว้ชัด', 'Everything ships on time despite clashing deadlines because you set the schedule and owners'),
    overdone: tt('อาจหงุดหงิดเมื่อแผนเปลี่ยนกะทันหัน', 'May get frustrated when plans change at short notice'),
    workWithMe: tt('แจ้งการเปลี่ยนแปลงให้เร็วที่สุด และบอกว่าอะไรเลื่อนได้', 'Tell me about changes as early as possible, and which items can move'),
  }),
]

export const ROLE_TYPES: RoleType[] = ROLE_TYPE_IDS.map((id, index) => ({ ...TYPES.find((x) => x.id === id)!, index }))

export const roleTypeById = (id: RoleTypeId): RoleType => ROLE_TYPES[ROLE_TYPE_IDS.indexOf(id)]
export const roleGroupById = (id: RoleGroupId): RoleGroup => ROLE_GROUPS.find((g) => g.id === id)!
export const groupOfType = (id: RoleTypeId): RoleGroup => roleGroupById(roleTypeById(id).group)

/* ------------------------------------------- Question bank ------------------------------------------- */

export type RoleItemKind = 'preference' | 'scenario' | 'role_choice'

export interface RoleOption {
  id: string
  text: T
  score: number
  /** Role-choice only: which duty this option leans to, and how strongly. */
  side?: 'a' | 'c'
  strong?: boolean
}

export interface RoleItem {
  id: string
  construct: RoleTypeId
  kind: RoleItemKind
  /** 1 = preference A, 2 = preference B, 3 = scenario, 4 = role choice. */
  block: 1 | 2 | 3 | 4
  prompt: T
  options: RoleOption[]
  weight: number
  required: boolean
}

/** 6 points, no neutral middle: everyone leans one way, as in the style test. */
export const PREFERENCE_OPTIONS: RoleOption[] = [
  { id: 'A', text: tt('ไม่ตรงเลย', 'Not like me at all'), score: 0 },
  { id: 'B', text: tt('ไม่ตรง', 'Not like me'), score: 20 },
  { id: 'C', text: tt('ค่อนข้างไม่ตรง', 'Slightly not like me'), score: 40 },
  { id: 'D', text: tt('ค่อนข้างตรง', 'Slightly like me'), score: 60 },
  { id: 'E', text: tt('ตรง', 'Like me'), score: 80 },
  { id: 'F', text: tt('ตรงมาก', 'Very like me'), score: 100 },
]


const pref = (construct: RoleTypeId, n: 0 | 1, th: string, en: string): RoleItem => ({
  id: `${construct}-${n}`, construct, kind: 'preference', block: n === 0 ? 1 : 2, prompt: tt(th, en), options: PREFERENCE_OPTIONS, weight: 1, required: true,
})

/** Scenario: three different behaviours (B is a partial role, not a neutral "don't know"). */
const three = (construct: RoleTypeId, n: 2, prompt: [string, string], a: [string, string], b: [string, string], c: [string, string]): RoleItem => ({
  id: `${construct}-${n}`,
  construct,
  kind: 'scenario',
  block: 3,
  prompt: tt(...prompt),
  options: [
    { id: 'A', text: tt(...a), score: 0 },
    { id: 'B', text: tt(...b), score: 50 },
    { id: 'C', text: tt(...c), score: 100 },
  ],
  weight: 1,
  required: true,
})

const ROLE_CHOICE_PROMPTS: Record<RoleTypeId, [string, string]> = {
  navigator: ['ถ้าค่าตอบแทนและภาระงานเท่ากัน คุณอยากทำงานแบบไหนมากกว่า?', 'If pay and workload were equal, which work would you rather do?'],
  driver: ['ระหว่างสองหน้าที่นี้ คุณสนใจแบบไหนมากกว่า?', 'Between these two duties, which interests you more?'],
  analyst: ['งานแบบไหนทำให้คุณอยากใช้เวลามากกว่า?', 'Which kind of work would you rather spend time on?'],
  architect: ['คุณสนใจรับผิดชอบสิ่งใดมากกว่า?', 'What would you rather be responsible for?'],
  creator: ['ถ้าเลือกได้ คุณอยากใช้วันทำงานกับอะไร?', 'If you could choose, what would you spend your workday on?'],
  explorer: ['คุณอยากอยู่กับงานแบบไหนมากกว่า?', 'Which kind of work would you rather be in?'],
  connector: ['หน้าที่ไหนตรงกับสิ่งที่คุณอยากทำมากกว่า?', 'Which duty is closer to what you want to do?'],
  coach: ['คุณอยากลงทุนเวลากับอะไรเป็นหลัก?', 'What would you mainly invest your time in?'],
  carer: ['งานแบบไหนให้ความหมายกับคุณมากกว่า?', 'Which work feels more meaningful to you?'],
  persuader: ['คุณอยากรับบทไหนมากกว่า?', 'Which role would you rather take?'],
  guardian: ['งานไหนดึงความสนใจคุณมากกว่า?', 'Which work draws your interest more?'],
  organizer: ['คุณอยากรับผิดชอบงานแบบไหนมากกว่า?', 'Which work would you rather be responsible for?'],
}

/** Role choice: two duties on a 4-point lean, no "equally interested" middle. `side` tells the UI which duty an option leans to. */
const rc = (construct: RoleTypeId, a: [string, string], c: [string, string]): RoleItem => ({
  id: `${construct}-3`,
  construct,
  kind: 'role_choice',
  block: 4,
  prompt: tt(...ROLE_CHOICE_PROMPTS[construct]),
  options: [
    { id: 'A', text: tt(...a), score: 0, side: 'a', strong: true },
    { id: 'B', text: tt(...a), score: 33, side: 'a', strong: false },
    { id: 'C', text: tt(...c), score: 67, side: 'c', strong: false },
    { id: 'D', text: tt(...c), score: 100, side: 'c', strong: true },
  ],
  weight: 1,
  required: true,
})

/** Appendix B seed bank: 48 items, 4 per type, all required, weight 1. Order = block 1–4, type index 0–11. */
export const ROLE_ITEMS: RoleItem[] = [
  // B.1 Preference A (01–12)
  pref('navigator', 0, 'ฉันชอบเชื่อมสิ่งที่เกิดขึ้นวันนี้กับเป้าหมายระยะยาว', 'I like connecting what happens today with long-term goals'),
  pref('driver', 0, 'ฉันสนุกกับการทำให้ทีมเดินหน้าจนส่งมอบงานได้', 'I enjoy keeping the team moving until the work is delivered'),
  pref('analyst', 0, 'ฉันเพลิดเพลินกับการหาสาเหตุจากข้อมูลที่ซับซ้อน', 'I enjoy finding causes in complex data'),
  pref('architect', 0, 'ฉันชอบจัดขั้นตอนงานที่กระจัดกระจายให้เชื่อมกัน', 'I like joining scattered work steps into one flow'),
  pref('creator', 0, 'ฉันชอบเปลี่ยนโจทย์เดิมให้มีวิธีนำเสนอใหม่', 'I like giving a familiar brief a new way of presenting it'),
  pref('explorer', 0, 'ฉันชอบลองเวอร์ชันเล็กเพื่อเรียนรู้ก่อนวางแผนใหญ่', 'I like trying a small version to learn before making a big plan'),
  pref('connector', 0, 'ฉันชอบช่วยให้คนต่างฝ่ายเข้าใจกันและตกลงกันได้', 'I like helping people from different sides understand each other and agree'),
  pref('coach', 0, 'ฉันมีความสุขกับการช่วยคนอื่นพัฒนาทักษะ', 'I am happy helping others develop their skills'),
  pref('carer', 0, 'ฉันอยากทำความเข้าใจความต้องการของคนที่มาขอความช่วยเหลือ', 'I want to understand what people who come for help really need'),
  pref('persuader', 0, 'ฉันสนุกกับการอธิบายคุณค่าให้คนที่ยังไม่เห็นด้วย', 'I enjoy explaining the value of something to people who do not agree yet'),
  pref('guardian', 0, 'ฉันชอบตรวจหาความคลาดเคลื่อนก่อนงานถูกนำไปใช้', 'I like checking for errors before work is put to use'),
  pref('organizer', 0, 'ฉันชอบทำให้ตาราง ข้อมูล และรายการงานเป็นระเบียบ', 'I like keeping schedules, data and task lists in order'),
  // B.1 Preference B (13–24)
  pref('navigator', 1, 'ฉันอยากทำหน้าที่ช่วยทีมเลือกว่าจะโฟกัสเรื่องใดก่อน', 'I want to be the one who helps the team choose what to focus on first'),
  pref('driver', 1, 'เมื่อแผนติดขัด ฉันอยากเป็นคนช่วยตัดสินใจและพาไปต่อ', 'When a plan gets stuck, I want to be the one who helps decide and moves it on'),
  pref('analyst', 1, 'ฉันอยากตรวจสมมติฐานด้วยหลักฐานก่อนสรุป', 'I want to test assumptions with evidence before concluding'),
  pref('architect', 1, 'ฉันสนใจแก้ปัญหาที่ต้นระบบ มากกว่าแก้ซ้ำทีละเคส', 'I would rather fix a problem at the source of the system than case by case'),
  pref('creator', 1, 'ฉันอยากทำงานที่มีพื้นที่สร้างสรรค์สิ่งที่ยังไม่มีตัวอย่าง', 'I want work with room to create things that have no example yet'),
  pref('explorer', 1, 'ฉันสนใจงานที่ต้องปรับสมมติฐานเมื่อพบข้อมูลใหม่', 'I am interested in work where assumptions change as new information appears'),
  pref('connector', 1, 'ฉันสนใจเป็นจุดเชื่อมข้อมูลเพื่อให้งานไม่ตกหล่น', 'I am interested in being the link for information so nothing falls through'),
  pref('coach', 1, 'ฉันอยากใช้เวลาถามและให้ feedback แทนทำแทนทุกครั้ง', 'I would rather ask questions and give feedback than do it for people every time'),
  pref('carer', 1, 'การช่วยให้ผู้ใช้หรือลูกค้าผ่านปัญหาเป็นงานที่ฉันสนใจ', 'Helping users or customers get through their problems is work that interests me'),
  pref('persuader', 1, 'ฉันอยากทำงานที่ต้องเจรจาหาทางที่หลายฝ่ายยอมรับ', 'I want work that involves negotiating a way several sides can accept'),
  pref('guardian', 1, 'ฉันสนใจทำให้มาตรฐานและความเสี่ยงที่ทีมต้องดูแลชัดเจน', 'I am interested in making the team’s standards and risks clear'),
  pref('organizer', 1, 'ฉันอยากดูแลงานให้ต่อเนื่องและไม่ตกหล่น', 'I want to keep work running smoothly with nothing dropped'),
  // B.2 Scenario (25–36)
  three('navigator', 2, ['ทีมมีหลายไอเดีย แต่ยังไม่รู้ว่าโครงการนี้ทำไปเพื่ออะไร คุณอยากรับบทไหน?', 'The team has many ideas but no clear purpose for the project yet. Which role would you take?'],
    ['รับโจทย์ย่อยที่ชัดเจนแล้วทำให้เสร็จ', 'Take a clear sub-task and finish it'], ['ช่วยรวบรวมความเห็นให้คนอื่นวางทิศทาง', 'Gather opinions so others can set the direction'], ['ชวนทีมกำหนดเป้าหมายและเกณฑ์เลือกทาง', 'Get the team to set the goal and criteria for choosing a path']),
  three('driver', 2, ['โครงการข้ามแผนกเริ่มล่าช้า คุณอยากช่วยแบบไหน?', 'A cross-department project is slipping. How would you help?'],
    ['ทำส่วนของตัวเองให้พร้อมและแจ้งสถานะ', 'Get my own part ready and report status'], ['ช่วยหัวหน้าอัปเดตแผนตามที่ตกลง', 'Help the manager update the plan as agreed'], ['เรียกคุยเจ้าของงาน จัดลำดับใหม่ และติดตามจนเดินต่อได้', 'Call the owners together, re-prioritise and follow up until it moves again']),
  three('analyst', 2, ['ยอดขายลดลง แต่แต่ละฝ่ายมีคำอธิบายต่างกัน คุณอยากทำอะไร?', 'Sales are down and every team has a different explanation. What would you do?'],
    ['รับข้อสรุปที่ทีมตกลงแล้วไปดำเนินการ', 'Act on the conclusion the team agreed'], ['ช่วยดึงข้อมูลตามรายการที่ทีมขอ', 'Pull the data the team asks for'], ['ตั้งสมมติฐาน ตรวจข้อมูล และหาสาเหตุที่เป็นไปได้', 'Form hypotheses, check the data and find likely causes']),
  three('architect', 2, ['งานอนุมัติช้าเพราะส่งเอกสารกลับไปมาหลายรอบ คุณอยากช่วยอะไร?', 'Approvals are slow because documents bounce back and forth. How would you help?'],
    ['ช่วยติดตามเอกสารแต่ละรายการให้ผ่าน', 'Chase each document through'], ['รวบรวมจุดติดขัดส่งให้เจ้าของกระบวนการ', 'Collect the bottlenecks for the process owner'], ['วาดเส้นทางงานและออกแบบขั้นตอนใหม่กับผู้เกี่ยวข้อง', 'Map the flow and redesign the steps with the people involved']),
  three('creator', 2, ['ต้องอธิบายบริการที่ซับซ้อนให้คนทั่วไปเข้าใจ คุณอยากรับบทอะไร?', 'A complex service must be explained to ordinary people. Which role would you take?'],
    ['ตรวจความครบถ้วนตามข้อมูลต้นฉบับ', 'Check it is complete against the source'], ['ช่วยเรียบเรียงตามรูปแบบที่มี', 'Help write it up in the existing format'], ['คิดภาพ เรื่องเล่า หรือประสบการณ์รูปแบบใหม่', 'Come up with new visuals, stories or experiences']),
  three('explorer', 2, ['ทีมไม่รู้ว่าลูกค้าจะใช้ฟีเจอร์ใหม่หรือไม่ คุณอยากเริ่มอย่างไร?', 'The team does not know if customers will use a new feature. How would you start?'],
    ['รอแผนที่ชัดเจนแล้วรับงานไปทำ', 'Wait for a clear plan, then take on the work'], ['ช่วยหาข้อมูลตัวอย่างจากตลาดก่อน', 'Look for market examples first'], ['สร้างต้นแบบเล็ก ทดสอบกับผู้ใช้ และปรับจากผล', 'Build a small prototype, test it with users and adjust']),
  three('connector', 2, ['ฝ่ายหนึ่งรอข้อมูล แต่อีกฝ่ายเข้าใจว่าส่งครบแล้ว คุณอยากทำอะไร?', 'One team is waiting for data the other team thinks it already sent. What would you do?'],
    ['แจ้งปัญหาแล้วรอผู้รับผิดชอบประสาน', 'Report the problem and wait for the owner to coordinate'], ['ส่งรายการข้อมูลที่ตัวเองมีให้ทั้งสองฝ่าย', 'Send both sides the data list I have'], ['ช่วยทั้งสองฝ่ายตกลงสิ่งที่ขาด เจ้าของงาน และกำหนดส่ง', 'Help both sides agree what is missing, who owns it and when it is due']),
  three('coach', 2, ['เพื่อนร่วมทีมยังทำงานใหม่ไม่คล่อง คุณอยากช่วยแบบไหน?', 'A teammate is not yet confident with new work. How would you help?'],
    ['ส่งคู่มือให้และทำส่วนของตัวเองต่อ', 'Send them the manual and carry on with my part'], ['ตอบคำถามเมื่อเขาเข้ามาขอความช่วยเหลือ', 'Answer questions when they ask'], ['ชวนฝึกทีละขั้น ให้ feedback และให้เขาลองเอง', 'Practise step by step with them, give feedback and let them try']),
  three('carer', 2, ['ผู้ใช้หงุดหงิดเพราะติดต่อหลายครั้งแล้วยังแก้ปัญหาไม่ได้ คุณอยากทำอะไร?', 'A user is frustrated after several contacts without a fix. What would you do?'],
    ['ส่งต่อช่องทางรับเรื่องตามขั้นตอน', 'Pass them to the right channel'], ['ส่งข้อมูลสถานะที่มีและแจ้งผู้รับผิดชอบ', 'Share the status and notify the owner'], ['ฟังปัญหา ทวนความต้องการ และช่วยติดตามทางออกภายในขอบเขต', 'Listen, confirm what they need and follow up on a solution within scope']),
  three('persuader', 2, ['คู่ค้าสนใจแต่กังวลเงื่อนไขและยังไม่ตกลง คุณอยากช่วยอย่างไร?', 'A partner is interested but worried about the terms. How would you help?'],
    ['เตรียมเอกสารให้คนเจรจาใช้งาน', 'Prepare documents for the negotiator'], ['ตอบคำถามเฉพาะส่วนที่ตัวเองดูแล', 'Answer questions about my own part'], ['คุยข้อกังวล นำเสนอทางเลือก และหาข้อตกลงในอำนาจที่มี', 'Discuss the concerns, offer options and reach a deal within my authority']),
  three('guardian', 2, ['เอกสารใกล้ส่งแต่พบตัวเลขสองชุดไม่ตรงกัน คุณอยากรับบทอะไร?', 'A document is about to go out but two sets of figures do not match. Which role would you take?'],
    ['แจ้งเจ้าของงานให้ตรวจสอบและรอข้อสรุป', 'Tell the owner and wait for their decision'], ['ช่วยแก้ตามตัวเลขที่ได้รับการยืนยัน', 'Help correct it using the confirmed figures'], ['ตรวจต้นทาง หาขอบเขตผลกระทบ และทวนก่อนส่ง', 'Trace the source, find the impact and re-check before it goes']),
  three('organizer', 2, ['มีหลายงานนัดส่งชนกันและข้อมูลอยู่คนละที่ คุณอยากทำอะไร?', 'Several deadlines clash and the information is scattered. What would you do?'],
    ['เลือกทำงานของตัวเองก่อนตามกำหนด', 'Do my own work first, on schedule'], ['ช่วยกรอกข้อมูลลงตารางที่ทีมเตรียมไว้', 'Fill in the team’s tracking sheet'], ['รวมรายการ จัดลำดับและกำหนดผู้รับผิดชอบให้ติดตามได้', 'Combine the list, prioritise it and assign owners so it can be tracked']),
  // B.3 Role choice (37–48)
  rc('navigator', ['ดูแลงานประจำที่มีเป้าหมายกำหนดไว้แล้ว', 'Look after routine work with goals already set'], ['วางทางเลือกและทิศทางระยะยาวให้หน่วยงาน', 'Shape the options and long-term direction for the unit']),
  rc('driver', ['ทำงานเฉพาะด้านให้ได้คุณภาพตามข้อตกลง', 'Do specialist work to the agreed quality'], ['รับผิดชอบให้หลายฝ่ายส่งมอบเป้าหมายร่วมกัน', 'Be responsible for several teams delivering a shared goal']),
  rc('analyst', ['ทำให้ข้อสรุปที่มีอยู่ถูกสื่อสารถึงทุกฝ่าย', 'Make sure existing conclusions reach every team'], ['ขุดข้อมูลเพื่อหาคำอธิบายที่ยังไม่ชัดเจน', 'Dig into data to find an explanation that is not clear yet']),
  rc('architect', ['แก้เคสเฉพาะหน้าให้คนได้รับความช่วยเหลือเร็ว', 'Solve the case in front of me so people get help fast'], ['สร้างกระบวนการที่ลดปัญหาเดิมในระยะยาว', 'Build a process that reduces the same problem long term']),
  rc('creator', ['ปรับงานตามมาตรฐานที่ใช้ได้ดีอยู่แล้ว', 'Refine work to a standard that already works well'], ['สร้างแนวคิดและรูปแบบใหม่จากโจทย์ที่เปิดกว้าง', 'Create new concepts and formats from an open brief']),
  rc('explorer', ['นำวิธีที่ยืนยันผลแล้วมาทำให้ต่อเนื่อง', 'Run proven methods consistently'], ['ทดสอบแนวทางที่ยังไม่รู้คำตอบ ภายใต้ความเสี่ยงจำกัด', 'Test approaches with unknown answers, within limited risk']),
  rc('connector', ['ทำชิ้นงานเชิงลึกด้วยตัวเองเป็นหลัก', 'Mostly do in-depth work on my own'], ['เชื่อมคนหลายฝ่ายและดูแลข้อตกลงร่วมกัน', 'Connect people from many teams and look after shared agreements']),
  rc('coach', ['เพิ่มความเชี่ยวชาญของตัวเองผ่านงานยาก', 'Grow my own expertise through hard work'], ['ช่วยให้เพื่อนร่วมทีมทำงานได้ด้วยตัวเองมากขึ้น', 'Help teammates become more able to work on their own']),
  rc('carer', ['พัฒนาผลงานที่มีเวลาทำลำพังเป็นหลัก', 'Develop work that I mostly do alone'], ['ช่วยเหลือคนและติดตามปัญหาจนเขาไปต่อได้', 'Help people and follow their problem until they can move on']),
  rc('persuader', ['สนับสนุนข้อมูลและความพร้อมอยู่เบื้องหลัง', 'Support with information and preparation behind the scenes'], ['นำเสนอและเจรจากับผู้เกี่ยวข้องโดยตรง', 'Present and negotiate with stakeholders directly']),
  rc('guardian', ['สร้างทางเลือกใหม่แล้วให้คนอื่นทวนรายละเอียด', 'Create new options and let others check the details'], ['ตรวจทานความถูกต้องและความเสี่ยงก่อนใช้งานจริง', 'Review accuracy and risk before real use']),
  rc('organizer', ['เริ่มโจทย์ใหม่ที่เปลี่ยนรูปแบบตลอดเวลา', 'Start new briefs that keep changing shape'], ['จัดงานและข้อมูลให้มีความต่อเนื่องและตรวจตามได้', 'Organise work and information so it is continuous and traceable']),
]

export const ROLE_ITEM_BY_ID = new Map(ROLE_ITEMS.map((q) => [q.id, q]))

/* ---------------------------------------- Scoring (§9.1) ---------------------------------------- */

/** question id → option id. Missing or unknown options are "missing", never 0 or 50. */
export type RoleAnswers = Record<string, string>

/** Half-up rounding for positive numbers, identical on every runtime. */
export const roundHalfUp = (x: number) => Math.floor(x + 0.5)

export interface RoleScoreResult {
  complete: boolean
  missing: string[]
  invalid: string[]
  raw: Partial<RoleScores>
  scores: Partial<RoleScores>
}

export function scoreRoles(answers: RoleAnswers, items: RoleItem[] = ROLE_ITEMS): RoleScoreResult {
  const missing: string[] = []
  const invalid: string[] = []
  const sums = new Map<RoleTypeId, { s: number; w: number; n: number; total: number }>()
  for (const q of items) {
    const acc = sums.get(q.construct) ?? { s: 0, w: 0, n: 0, total: 0 }
    acc.total++
    const optId = answers[q.id]
    const opt = optId === undefined ? undefined : q.options.find((o) => o.id === optId)
    if (optId === undefined) missing.push(q.id)
    else if (!opt) invalid.push(q.id)
    else {
      acc.s += opt.score * q.weight
      acc.w += q.weight
      acc.n++
    }
    sums.set(q.construct, acc)
  }
  const raw: Partial<RoleScores> = {}
  const scores: Partial<RoleScores> = {}
  for (const [t, acc] of sums) {
    // Only a fully answered construct gets a score; partial averages would look complete.
    if (acc.n === acc.total && acc.w > 0) {
      raw[t] = acc.s / acc.w
      scores[t] = roundHalfUp(acc.s / acc.w)
    }
  }
  return { complete: missing.length === 0 && invalid.length === 0, missing, invalid, raw, scores }
}

/* ------------------------------------- Classification (§9.2) ------------------------------------- */

export type ClassificationState = 'dominant' | 'mixed' | 'no_dominant'

export interface Classification {
  state: ClassificationState
  primary: RoleTypeId | null
  secondary: RoleTypeId | null
  top: number
  second: number
  gap: number
  spread: number
  /** All 12, score DESC then type index ASC. */
  ranked: { id: RoleTypeId; score: number }[]
  /** Types tied with the top score (length > 1 means a close group, shown in full in details). */
  tiedTop: RoleTypeId[]
}

export function classify(scores: RoleScores): Classification {
  const ranked = ROLE_TYPE_IDS.map((id, i) => ({ id, i, score: scores[id] }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map(({ id, score }) => ({ id, score }))
  const top = ranked[0].score
  const second = ranked[1].score
  const all = ranked.map((r) => r.score)
  const spread = Math.max(...all) - Math.min(...all)
  const gap = top - second
  const tiedTop = ranked.filter((r) => r.score === top).map((r) => r.id)
  if (spread < THRESHOLDS.flatSpreadLt || top < THRESHOLDS.minimumInterest) {
    return { state: 'no_dominant', primary: null, secondary: null, top, second, gap, spread, ranked, tiedTop }
  }
  return {
    state: gap < THRESHOLDS.mixedGapLt ? 'mixed' : 'dominant',
    primary: ranked[0].id,
    secondary: second >= THRESHOLDS.minimumInterest ? ranked[1].id : null,
    top,
    second,
    gap,
    spread,
    ranked,
    tiedTop,
  }
}

/** The 4 item ids that make up a type's score, for the "how this was calculated" explanation. */
export const itemsForType = (id: RoleTypeId) => ROLE_ITEMS.filter((q) => q.construct === id)

/* ------------------------------------- Job discovery (§12.1) ------------------------------------- */

export interface FamilySuggestion {
  family: string
  from: RoleTypeId[]
}

/** Up to 3 roles scoring ≥ 50, high to low; nothing automatic for no_dominant. */
export function jobFamiliesToExplore(c: Classification): { roles: RoleTypeId[]; families: FamilySuggestion[] } {
  if (c.state === 'no_dominant') return { roles: [], families: [] }
  const roles = c.ranked.filter((r) => r.score >= THRESHOLDS.minimumInterest).slice(0, 3).map((r) => r.id)
  const families: FamilySuggestion[] = []
  for (const id of roles) {
    for (const f of roleTypeById(id).jobFamilies) {
      const hit = families.find((x) => x.family === f)
      if (hit) hit.from.push(id)
      else families.push({ family: f, from: [id] })
    }
  }
  return { roles, families }
}

/* ---------------------------------- Interest alignment (§12.2) ---------------------------------- */

export type RoleWeights = Partial<Record<RoleTypeId, number>>

export const weightsTotal = (w: RoleWeights) => Object.values(w).reduce((s, x) => s + (x ?? 0), 0)

/** Weights must be ≥ 0 and add up to 1 (to 1e-6). Never normalised silently. */
export const validWeights = (w: RoleWeights) =>
  Object.values(w).every((x) => (x ?? 0) >= 0) && Object.keys(w).length > 0 && Math.abs(weightsTotal(w) - 1) < 1e-6

/** "Interest matches the defined duties X/100" — never "fits the position X%". One decimal. */
export function interestAlignment(scores: RoleScores, weights: RoleWeights): number | null {
  if (!validWeights(weights)) return null
  const v = (Object.entries(weights) as [RoleTypeId, number][]).reduce((s, [t, w]) => s + w * scores[t], 0)
  return Math.round(v * 10) / 10
}

/* ------------------------------- Working preferences (§10, §12.3) ------------------------------- */

export type ContextDimId = 'autonomy' | 'change' | 'disagreement' | 'collaboration' | 'experimentation' | 'leadership_interest'

export interface ContextDim {
  id: ContextDimId
  name: T
  low: T
  high: T
}

export const CONTEXT_DIMS: ContextDim[] = [
  { id: 'autonomy', name: tt('อิสระในการทำงาน', 'Autonomy'), low: tt('ต้องการแนวทางชัด', 'Wants clear guidance'), high: tt('เลือกวิธีทำเอง', 'Chooses own methods') },
  { id: 'change', name: tt('ความเปลี่ยนแปลง', 'Change'), low: tt('ชอบความต่อเนื่องแน่นอน', 'Prefers continuity'), high: tt('ชอบโจทย์ใหม่และการเปลี่ยน', 'Likes new briefs and change') },
  { id: 'disagreement', name: tt('วิธีสื่อสารความเห็นต่าง', 'Voicing disagreement'), low: tt('หาจังหวะ/คุยเป็นส่วนตัว', 'Finds the moment / talks privately'), high: tt('คุยตรงสุภาพในเวลานั้น', 'Says it politely on the spot') },
  { id: 'collaboration', name: tt('จังหวะร่วมงาน', 'Collaboration rhythm'), low: tt('ช่วงทำงานลึกคนเดียว', 'Deep work alone'), high: tt('แลกเปลี่ยนร่วมมือบ่อย', 'Frequent exchange') },
  { id: 'experimentation', name: tt('วิธีเริ่มลงมือ', 'Getting started'), low: tt('ตรวจสอบก่อน', 'Check first'), high: tt('ทดลองเล็กแล้วปรับ', 'Try small, then adjust') },
  { id: 'leadership_interest', name: tt('ความสนใจในการนำ', 'Interest in leading'), low: tt('เน้นงานเฉพาะด้าน', 'Focus on specialist work'), high: tt('กำหนดทิศทางและช่วยทีม', 'Set direction and help the team') },
]

export interface ContextValue {
  value: number | null
  confirmed: boolean
}

export type ContextProfile = Record<ContextDimId, ContextValue>

export const emptyContext = (): ContextProfile =>
  Object.fromEntries(CONTEXT_DIMS.map((d) => [d.id, { value: null, confirmed: false }])) as ContextProfile

export type Band = 'low' | 'middle' | 'high' | 'unknown'

/** One rule everywhere (labels, filters, API): 35 and 65 are middle. */
export const band = (v: ContextValue | undefined): Band => {
  if (!v || !v.confirmed || v.value === null) return 'unknown'
  return v.value < 35 ? 'low' : v.value > 65 ? 'high' : 'middle'
}

/** Values only count once the person confirms them. */
export const confirmedValue = (v: ContextValue | undefined): number | null => (v && v.confirmed && v.value !== null ? v.value : null)

/** A starting point taken from the style test. Shown as a suggestion; never confirmed on the person's behalf. */
export const suggestContext = (s: Scores): Record<ContextDimId, number> => {
  const step5 = (x: number) => Math.min(100, Math.max(0, Math.round(x / 5) * 5))
  return {
    autonomy: step5(100 - s.ST),
    change: step5(s.CH),
    disagreement: step5(100 - (s.KJ + s.FC) / 2),
    collaboration: step5(s.CO),
    experimentation: step5((s.PC + s.O) / 2),
    leadership_interest: step5(s.LD),
  }
}

export interface Range {
  min: number
  max: number
}

export interface ContextGap {
  dim: ContextDimId
  person: number | null
  range: Range
  distance: number | null
  alignment: number | null
  /** True when distance > 25: worth agreeing together. Null when unknown. */
  discuss: boolean | null
}

export const contextDistance = (person: number, r: Range) =>
  person >= r.min && person <= r.max ? 0 : Math.min(Math.abs(person - r.min), Math.abs(person - r.max))

export function compareContext(ctx: ContextProfile, ranges: Partial<Record<ContextDimId, Range>>): ContextGap[] {
  return (Object.entries(ranges) as [ContextDimId, Range][]).map(([dim, range]) => {
    const person = confirmedValue(ctx[dim])
    if (person === null) return { dim, person, range, distance: null, alignment: null, discuss: null }
    const distance = contextDistance(person, range)
    return { dim, person, range, distance, alignment: 100 - distance, discuss: distance > 25 }
  })
}

/** The 3 largest known distances, for the "worth agreeing" list. */
export const topGaps = (gaps: ContextGap[], n = 3) =>
  gaps.filter((g) => g.distance !== null).sort((a, b) => (b.distance ?? 0) - (a.distance ?? 0)).slice(0, n)

export const validRange = (r: Range) => r.min >= 0 && r.max <= 100 && r.min <= r.max

/* --------------------------------- Modifiers (§7.2, §10.3) --------------------------------- */

export type ModifierAxis = 'experimentation' | 'autonomy' | 'collaboration'

const MODIFIER_LABELS: Record<ModifierAxis, Record<'low' | 'middle' | 'high', T>> = {
  experimentation: { low: tt('สายรอบคอบ', 'Careful'), middle: tt('สายสมดุล', 'Balanced'), high: tt('สายนักทดลอง', 'Experimental') },
  autonomy: { low: tt('ชอบแนวทางชัด', 'Prefers clear guidance'), middle: tt('ยืดหยุ่นเรื่องแนวทาง', 'Flexible on guidance'), high: tt('ชอบอิสระ', 'Prefers autonomy') },
  collaboration: { low: tt('ชอบทำงานลึก', 'Deep work'), middle: tt('สลับทำเองและร่วมมือ', 'Mix of solo and together'), high: tt('แลกเปลี่ยนบ่อย', 'Frequent exchange') },
}

/** Unknown axes produce no modifier and are never read as "middle". Modifiers never change any score. */
export const modifiersOf = (ctx: ContextProfile): { axis: ModifierAxis; band: 'low' | 'middle' | 'high'; label: T }[] =>
  (['experimentation', 'autonomy', 'collaboration'] as ModifierAxis[]).flatMap((axis) => {
    const b = band(ctx[axis])
    return b === 'unknown' ? [] : [{ axis, band: b, label: MODIFIER_LABELS[axis][b] }]
  })

/* ------------------------------ Manager & team templates (§11.3–11.4) ------------------------------ */

export const MANAGER_TEMPLATES = [
  { id: 'structured', anchor: 20, name: tt('หัวหน้าแบบมีแนวทางชัด', 'Structured manager'), blurb: tt('มีแนวทางและติดตามใกล้ชิด', 'Clear guidance, close follow-up') },
  { id: 'balanced', anchor: 55, name: tt('หัวหน้าแบบสมดุล', 'Balanced manager'), blurb: tt('ตกลงผลลัพธ์และติดตามเป็นระยะ', 'Agrees outcomes, checks in periodically') },
  { id: 'autonomous', anchor: 85, name: tt('หัวหน้าแบบให้อิสระ', 'Hands-off manager'), blurb: tt('ให้อิสระและพร้อมให้ปรึกษา', 'Gives freedom, available to advise') },
] as const

export const TEAM_TEMPLATES = [
  { id: 'quiet', anchor: 20, name: tt('ทีมเงียบ ทำงานลึก', 'Quiet team'), blurb: tt('ทำงานลึกและอัปเดตแบบไม่พร้อมกัน', 'Deep work, asynchronous updates') },
  { id: 'mixed', anchor: 50, name: tt('ทีมผสม', 'Mixed team'), blurb: tt('สลับทำเองและแลกเปลี่ยน', 'Alternates solo work and exchange') },
  { id: 'collaborative', anchor: 85, name: tt('ทีมร่วมมือบ่อย', 'Collaborative team'), blurb: tt('ประสานและร่วมมือบ่อย', 'Coordinates and collaborates often') },
] as const

/* ------------------------------------ Desired growth roles (§7.3) ------------------------------------ */

export type GrowthRole = 'specialist' | 'project_lead' | 'people_development' | 'team_support' | 'exploring'

export const GROWTH_ROLES: { id: GrowthRole; name: T; blurb: T }[] = [
  { id: 'specialist', name: tt('ผู้เชี่ยวชาญเฉพาะด้าน', 'Specialist'), blurb: tt('ลึกในงานของตัวเองจนเป็นที่พึ่งของทีม', 'Go deep until the team relies on your expertise') },
  { id: 'project_lead', name: tt('นำงานหรือโครงการ', 'Project lead'), blurb: tt('รับผิดชอบให้งานหรือโครงการไปถึงเป้า', 'Own getting a piece of work or project to its goal') },
  { id: 'people_development', name: tt('ดูแลและพัฒนาคน', 'People development'), blurb: tt('ช่วยให้คนในทีมเติบโต', 'Help people in the team grow') },
  { id: 'team_support', name: tt('สนับสนุนทีม', 'Team support'), blurb: tt('เป็นแรงสำคัญที่ทำให้ทีมทำงานได้', 'Be a key part of what makes the team work') },
  { id: 'exploring', name: tt('ยังสำรวจอยู่', 'Still exploring'), blurb: tt('ยังไม่แน่ใจ ขอดูก่อน', 'Not sure yet') },
]

/** `exploring` is exclusive; nothing is selected by default. */
export const toggleGrowthRole = (current: GrowthRole[], id: GrowthRole): GrowthRole[] => {
  if (current.includes(id)) return current.filter((x) => x !== id)
  if (id === 'exploring') return ['exploring']
  return [...current.filter((x) => x !== 'exploring'), id]
}

/* ------------------------------------ Synthetic data for demos ------------------------------------ */

/** A latent interest per type from style scores — only to make demo people plausible. */
const LATENT: Record<RoleTypeId, (s: Scores) => number> = {
  navigator: (s) => (s.O + s.LD) / 2,
  driver: (s) => (s.LD + s.PC) / 2,
  analyst: (s) => s.C * 0.4 + s.O * 0.3 + (100 - s.X) * 0.3,
  architect: (s) => (s.ST + s.O + s.C) / 3,
  creator: (s) => s.O * 0.6 + s.CH * 0.4,
  explorer: (s) => (s.CH + s.PC + s.O) / 3,
  connector: (s) => (s.CO + s.X + s.A) / 3,
  coach: (s) => (s.A + s.CO + s.BK) / 3,
  carer: (s) => (s.A + s.KJ + s.BK) / 3,
  persuader: (s) => (s.PR + s.X + s.LD) / 3,
  guardian: (s) => (s.C + (100 - s.MP) + (100 - s.PC)) / 3,
  organizer: (s) => (s.ST + s.C + (100 - s.CH)) / 3,
}

/** Simulated answers for sample people: each item is answered near the latent interest, with noise. */
export function syntheticRoleAnswers(s: Scores, seed: number): RoleAnswers {
  let x = Math.abs(Math.round(seed)) % 233280 || 1
  const rand = () => ((x = (x * 9301 + 49297) % 233280) / 233280)
  const out: RoleAnswers = {}
  for (const q of ROLE_ITEMS) {
    // Stretch the latent away from 50 so sample people show real differences, then add noise.
    const target = Math.min(100, Math.max(0, 50 + (LATENT[q.construct](s) - 50) * 1.35 + (rand() - 0.5) * 45))
    const best = q.options.reduce((a, b) => (Math.abs(b.score - target) < Math.abs(a.score - target) ? b : a))
    out[q.id] = best.id
  }
  return out
}

/** Full role scores for a sample person (always complete). */
export const syntheticRoleScores = (s: Scores, seed: number): RoleScores => scoreRoles(syntheticRoleAnswers(s, seed)).scores as RoleScores

/** Synthetic confirmed context for sample people (suggestion values, marked confirmed). */
export const syntheticContext = (s: Scores): ContextProfile => {
  const sug = suggestContext(s)
  return Object.fromEntries(CONTEXT_DIMS.map((d) => [d.id, { value: sug[d.id], confirmed: true }])) as ContextProfile
}
