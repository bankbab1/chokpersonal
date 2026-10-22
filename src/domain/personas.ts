import { tt, type T } from '@/lib/i18n'
import type { DimCode, FamilyId, Variant } from './types'

export type Animal = 'tiger' | 'myna' | 'peacock' | 'owl' | 'horse' | 'elephant'

export interface Family {
  id: FamilyId
  th: string
  en: string
  animal: Animal
  animalTh: string
  animalEn: string
  /** Tailwind-independent hex, used by SVG art and charts. */
  color: string
  soft: string
  /** Signature dimensions and the direction that defines the family. */
  signature: Partial<Record<DimCode, 1 | -1>>
  essence: T
  strengths: T[]
  watchouts: T[]
  bestManager: T
  feedbackTip: T
  underStress: T
}

export const familyName = (f: Pick<Family, 'th' | 'en'>): T => ({ th: f.th, en: f.en })
export const animalName = (f: Pick<Family, 'animalTh' | 'animalEn'>): T => ({ th: f.animalTh, en: f.animalEn })

export const FAMILIES: Family[] = [
  {
    id: 'COM',
    th: 'ผู้นำทัพ',
    en: 'Commanders',
    animal: 'tiger',
    animalTh: 'เสือ',
    animalEn: 'Tiger',
    color: '#3B82F6',
    soft: '#DBEAFE',
    signature: { LD: 1, X: 1, E: 1, KJ: -1 },
    essence: tt('กล้าตัดสินใจ รับผิดชอบผลลัพธ์ และพาทีมไปข้างหน้า', 'Decisive, owns the result and moves the team forward'),
    strengths: [
      tt('ตัดสินใจได้ในเวลาที่คนอื่นลังเล', 'Decides when others hesitate'),
      tt('รับแรงกดดันได้ดี', 'Handles pressure well'),
      tt('พูดตรง ทำให้ปัญหาถูกยกขึ้นมาเร็ว', 'Speaks plainly, so problems surface early'),
    ],
    watchouts: [
      tt('อาจข้ามความเห็นของคนที่เกรงใจและไม่กล้าพูด', 'May miss the views of people too deferential to speak'),
      tt('เมื่อเครียดอาจคุมทุกอย่างเอง', 'Under stress, may try to control everything'),
    ],
    bestManager: tt('หัวหน้าที่ให้ขอบเขตความรับผิดชอบชัดเจน และเปิดให้เถียงได้', 'A manager who gives clear ownership and welcomes debate'),
    feedbackTip: tt('พูดตรงประเด็น ใช้ข้อมูล และมุ่งที่ผลลัพธ์', 'Be direct, use data and focus on results'),
    underStress: tt('สั่งการมากขึ้น ฟังน้อยลง', 'Gives more orders, listens less'),
  },
  {
    id: 'CON',
    th: 'ผู้ประสาน',
    en: 'Connectors',
    animal: 'myna',
    animalTh: 'นกขุนทอง',
    animalEn: 'Hill myna',
    color: '#EC4899',
    soft: '#FCE7F3',
    signature: { A: 1, X: 1, SK: 1, FC: 1 },
    essence: tt('เชื่อมคน ลดความขัดแย้ง และสร้างบรรยากาศที่ทุกคนอยากทำงานด้วย', 'Connects people, eases conflict and makes teams people want to join'),
    strengths: [
      tt('อ่านคนเก่ง รู้ว่าใครต้องการอะไร', 'Reads people well and knows what each one needs'),
      tt('ทำให้ทีมต่างแผนกคุยกันได้', 'Gets different departments talking'),
      tt('รักษาบรรยากาศทีมในช่วงยาก', 'Keeps team spirit up in hard times'),
    ],
    watchouts: [
      tt('อาจเลี่ยงการพูดเรื่องยากเพื่อรักษาน้ำใจ', 'May avoid hard conversations to keep the peace'),
      tt('เสี่ยงถูกดึงเข้ากลุ่มพรรคพวก', 'Can get pulled into cliques'),
    ],
    bestManager: tt('หัวหน้าที่อบอุ่น ให้ feedback ส่วนตัว และเห็นคุณค่างานเชื่อมคน', 'A warm manager who gives feedback privately and values relationship work'),
    feedbackTip: tt('เริ่มจากความสัมพันธ์ แล้วค่อยพูดเรื่องงานแบบส่วนตัว', 'Start with the relationship, then discuss the work privately'),
    underStress: tt('พยายามเอาใจทุกคนจนตัวเองล้า', 'Tries to please everyone and burns out'),
  },
  {
    id: 'CRE',
    th: 'นักสร้างสรรค์',
    en: 'Creators',
    animal: 'peacock',
    animalTh: 'นกยูง',
    animalEn: 'Peacock',
    color: '#8B5CF6',
    soft: '#EDE9FE',
    signature: { O: 1, CH: 1, ST: -1 },
    essence: tt('มองเห็นสิ่งที่ยังไม่มี และกล้าลองวิธีใหม่', "Sees what doesn't exist yet and dares to try new ways"),
    strengths: [
      tt('ไอเดียใหม่ไม่หยุด', 'A steady stream of new ideas'),
      tt('ปรับตัวกับการเปลี่ยนแปลงได้เร็ว', 'Adapts to change quickly'),
      tt('มองปัญหาได้หลายมุม', 'Sees problems from many angles'),
    ],
    watchouts: [
      tt('อาจเบื่องานซ้ำและรายละเอียด', 'May get bored with routine and detail'),
      tt('เริ่มหลายเรื่องแต่ปิดไม่ครบ', 'Starts many things, finishes fewer'),
    ],
    bestManager: tt('หัวหน้าที่ให้อิสระ ตั้งเป้าชัด และมีพื้นที่ให้ลองผิดลองถูก', 'A manager who gives freedom, sets clear goals and allows experiments'),
    feedbackTip: tt('ชมไอเดียก่อน แล้วช่วยตั้งเกณฑ์ว่าอะไรคือ “เสร็จ”', 'Praise the idea first, then agree what “done” means'),
    underStress: tt('กระโดดไปเรื่องใหม่แทนการปิดเรื่องเดิม', 'Jumps to something new instead of finishing'),
  },
  {
    id: 'GUA',
    th: 'ผู้พิทักษ์ระบบ',
    en: 'Guardians',
    animal: 'owl',
    animalTh: 'นกฮูก',
    animalEn: 'Owl',
    color: '#F59E0B',
    soft: '#FEF3C7',
    signature: { C: 1, ST: 1, MP: -1 },
    essence: tt('ทำให้งานถูกต้อง ครบถ้วน และไว้ใจได้ทุกครั้ง', 'Makes work accurate, complete and reliable every time'),
    strengths: [
      tt('จับจุดผิดเล็ก ๆ ที่คนอื่นมองข้าม', 'Catches small errors others miss'),
      tt('ส่งงานตรงเวลาสม่ำเสมอ', 'Delivers on time, consistently'),
      tt('สร้างระบบที่ทีมใช้ต่อได้', 'Builds systems the team can reuse'),
    ],
    watchouts: [
      tt('อาจอึดอัดเมื่อแผนเปลี่ยนกะทันหัน', 'Can struggle with sudden plan changes'),
      tt('ผลงานดีแต่ไม่ค่อยถูกมองเห็น', 'Great work that often goes unnoticed'),
    ],
    bestManager: tt('หัวหน้าที่บอกความคาดหวังชัด ให้เวลาเตรียมตัว และเห็นคุณค่าความละเอียด', 'A manager who sets clear expectations, gives time to prepare and values precision'),
    feedbackTip: tt('ให้ตัวอย่างที่ชัดเจน และบอกล่วงหน้าเมื่อมีการเปลี่ยนแปลง', 'Give concrete examples and warn ahead of changes'),
    underStress: tt('ตรวจซ้ำมากขึ้นจนงานช้า', 'Rechecks more and slows down'),
  },
  {
    id: 'DRV',
    th: 'นักลุย',
    en: 'Drivers',
    animal: 'horse',
    animalTh: 'ม้า',
    animalEn: 'Horse',
    color: '#EF4444',
    soft: '#FEE2E2',
    signature: { PC: 1, X: 1, CH: 1, SK: -1 },
    essence: tt('เร็ว ชอบเป้าหมาย และไม่หยุดจนกว่าจะถึง', "Fast, goal-driven and doesn't stop until it's done"),
    strengths: [
      tt('เปลี่ยนแผนเป็นการลงมือได้ทันที', 'Turns plans into action immediately'),
      tt('ชอบเป้าหมายที่ท้าทาย', 'Thrives on stretch targets'),
      tt('พลังสูงในช่วงเร่ง', 'High energy in a crunch'),
    ],
    watchouts: [
      tt('อาจข้ามขั้นตอนหรือรายละเอียด', 'May skip steps or details'),
      tt('ใจร้อนกับคนที่ทำงานช้ากว่า', 'Impatient with slower colleagues'),
    ],
    bestManager: tt('หัวหน้าที่ตั้งเป้าท้าทาย วัดผลชัด และไม่ไมโครแมเนจ', "A manager who sets stretch goals, measures clearly and doesn't micromanage"),
    feedbackTip: tt('สั้น ตรง และผูกกับเป้าหมายที่เขาอยากชนะ', 'Short, direct and tied to a goal they want to win'),
    underStress: tt('เร่งมากขึ้นและตัดขั้นตอน', 'Speeds up and cuts corners'),
  },
  {
    id: 'CAR',
    th: 'ผู้ดูแล',
    en: 'Caretakers',
    animal: 'elephant',
    animalTh: 'ช้าง',
    animalEn: 'Elephant',
    color: '#10B981',
    soft: '#D1FAE5',
    signature: { A: 1, H: 1, BK: 1, CH: -1 },
    essence: tt('มั่นคง ซื่อตรง และดูแลคนในทีมเหมือนครอบครัว', 'Steady, sincere and looks after the team like family'),
    strengths: [
      tt('เป็นที่ไว้ใจของทั้งหัวหน้าและน้อง', 'Trusted by bosses and juniors alike'),
      tt('อดทน ทำงานสม่ำเสมอ', 'Patient and consistent'),
      tt('ดูแลคนใหม่ให้ปรับตัวได้', 'Helps newcomers settle in'),
    ],
    watchouts: [
      tt('อาจรับภาระเกินตัวเพราะเกรงใจ', 'May take on too much out of kreng jai'),
      tt('ไม่ชอบการเปลี่ยนแปลงเร็ว', 'Dislikes fast change'),
    ],
    bestManager: tt('หัวหน้าที่จริงใจ ให้เกียรติ และอธิบายเหตุผลของการเปลี่ยนแปลง', 'A sincere, respectful manager who explains the reasons for change'),
    feedbackTip: tt('พูดอย่างนุ่มนวลแบบส่วนตัว และยืนยันว่าเขามีคุณค่าต่อทีม', 'Speak gently in private and confirm their value to the team'),
    underStress: tt('เก็บความเหนื่อยไว้คนเดียว', 'Keeps the strain to themself'),
  },
]

export const familyById = (id: FamilyId): Family => {
  const f = FAMILIES.find((x) => x.id === id)
  if (!f) throw new Error(`Unknown family ${id}`)
  return f
}

export const VARIANTS: { id: Variant; th: string; en: string }[] = [
  { id: 'LF', th: 'นำ · เร็ว', en: 'Lead · Fast' },
  { id: 'LC', th: 'นำ · รอบคอบ', en: 'Lead · Careful' },
  { id: 'SF', th: 'สนับสนุน · เร็ว', en: 'Support · Fast' },
  { id: 'SC', th: 'สนับสนุน · รอบคอบ', en: 'Support · Careful' },
]

export interface Persona {
  id: string
  family: FamilyId
  variant: Variant
  th: string
  en: string
  tagline: T
  superpower: T
}

export const personaName = (p: Pick<Persona, 'th' | 'en'>): T => ({ th: p.th, en: p.en })

const P = (family: FamilyId, variant: Variant, th: string, en: string, tagline: [string, string], superpower: [string, string]): Persona => ({
  id: `${family}-${variant}`.toLowerCase(),
  family,
  variant,
  th,
  en,
  tagline: tt(...tagline),
  superpower: tt(...superpower),
})

export const PERSONAS: Persona[] = [
  P('COM', 'LF', 'แม่ทัพ', 'General', ['ชี้ทิศ ตัดสินใจไว และพาทีมบุกไปข้างหน้า', 'Points the way, decides fast and charges ahead'], ['เปลี่ยนความวุ่นวายให้เป็นแผนในไม่กี่นาที', 'Turns chaos into a plan in minutes']),
  P('COM', 'LC', 'กัปตันเรือ', 'Captain', ['นำทีมอย่างมั่นคง คิดก่อนสั่ง และไม่ทิ้งใครไว้ข้างหลัง', 'Leads steadily, thinks before acting and leaves no one behind'], ['นำทีมผ่านช่วงยาวโดยไม่เสียทิศ', 'Keeps the team on course through long stretches']),
  P('COM', 'SF', 'รองแม่ทัพ', 'Lieutenant', ['มือขวาที่พร้อมลุยแทนหัวหน้าได้ทุกเมื่อ', 'The right hand who can step in for the boss any time'], ['รับคำสั่งแล้วทำให้เกิดผลทันที', 'Turns instructions into results at once']),
  P('COM', 'SC', 'เสนาธิการ', 'Chief of staff', ['วางหมากเบื้องหลัง ให้ผู้นำตัดสินใจได้ถูก', 'Plans behind the scenes so leaders decide well'], ['มองเห็นความเสี่ยงก่อนคนอื่น', 'Spots risks before anyone else']),
  P('CON', 'LF', 'หัวหน้าแก๊ง', 'Crew boss', ['รวมคนเก่ง ๆ ให้ทำงานด้วยกันอย่างสนุก', 'Brings talented people together and makes it fun'], ['ทำให้คนอยากเข้าทีม', 'Makes people want to join the team']),
  P('CON', 'LC', 'พี่ใหญ่ใจดี', 'Big sibling', ['ดูแลทุกคน รู้จังหวะว่าเมื่อไรควรพูด', 'Looks after everyone and knows when to speak'], ['ทำให้น้อง ๆ กล้าเล่าปัญหา', 'Makes juniors comfortable raising problems']),
  P('CON', 'SF', 'ขวัญใจทีม', 'Team spark', ['เติมพลังให้ทีมในวันที่เหนื่อยที่สุด', 'Recharges the team on its toughest days'], ['เปลี่ยนบรรยากาศได้ในประโยคเดียว', 'Changes the mood in a single sentence']),
  P('CON', 'SC', 'นักไกล่เกลี่ย', 'Peacemaker', ['เชื่อมคนที่ไม่คุยกันให้กลับมาทำงานด้วยกัน', "Reconnects people who aren't talking"], ['ลดความขัดแย้งโดยไม่มีใครเสียหน้า', 'Resolves conflict without anyone losing face']),
  P('CRE', 'LF', 'นักบุกเบิก', 'Pioneer', ['เปิดทางใหม่ให้ทีม และชวนคนอื่นตามมา', 'Opens new paths and brings others along'], ['ทำไอเดียให้เป็นต้นแบบได้เร็ว', 'Turns ideas into prototypes fast']),
  P('CRE', 'LC', 'สถาปนิกไอเดีย', 'Idea architect', ['ออกแบบความคิดใหม่ให้เป็นระบบที่ใช้ได้จริง', 'Designs new ideas into systems that work'], ['เชื่อมความคิดสร้างสรรค์กับโครงสร้าง', 'Bridges creativity and structure']),
  P('CRE', 'SF', 'นักทดลอง', 'Experimenter', ['ลองก่อน เรียนรู้เร็ว และแชร์สิ่งที่เจอ', 'Tries first, learns fast and shares what works'], ['หาวิธีที่ใช้ได้จากการทดลองหลายรอบ', 'Finds what works through rapid experiments']),
  P('CRE', 'SC', 'นักฝันช่างคิด', 'Dreamer', ['คิดลึก มองไกล และเห็นสิ่งที่คนอื่นมองข้าม', 'Thinks deep, looks far and sees what others miss'], ['ตั้งคำถามที่เปลี่ยนวิธีคิดของทีม', "Asks questions that change the team's thinking"]),
  P('GUA', 'LF', 'หัวหน้าปฏิบัติการ', 'Ops chief', ['คุมงานให้เดินตามแผน เร็วแต่ไม่พลาด', 'Keeps operations on plan, fast but error-free'], ['ทำให้ระบบที่ซับซ้อนเดินได้ทุกวัน', 'Keeps complex systems running every day']),
  P('GUA', 'LC', 'ผู้คุมกฎ', 'Rule keeper', ['วางมาตรฐานและดูแลให้ทุกคนทำถูกต้อง', 'Sets standards and makes sure they are met'], ['สร้างมาตรฐานที่ทีมเชื่อถือ', 'Builds standards the team trusts']),
  P('GUA', 'SF', 'มือปราบงานค้าง', 'Fixer', ['เคลียร์งานที่คั่งค้างให้จบอย่างเป็นระบบ', 'Clears backlogs systematically'], ['ปิดงานที่คนอื่นทิ้งไว้ได้ครบ', 'Finishes what others left behind']),
  P('GUA', 'SC', 'นักบัญชีใจเย็น', 'Steady auditor', ['ละเอียด แม่นยำ และไว้ใจได้ทุกตัวเลข', 'Thorough, precise and trusted with every number'], ['เจอข้อผิดพลาดก่อนที่จะกลายเป็นปัญหา', 'Finds errors before they become problems']),
  P('DRV', 'LF', 'สายบู๊', 'Front-liner', ['ลุยหน้างาน ชนเป้า และพาทีมไปถึงก่อน', 'Leads from the front and hits the target first'], ['ทำยอดได้ในสถานการณ์ที่ยากที่สุด', 'Delivers numbers in the toughest conditions']),
  P('DRV', 'LC', 'นักวางเกม', 'Game planner', ['วางแผนให้ชนะ แล้วเร่งเครื่องเต็มที่', 'Plans to win, then goes full throttle'], ['เปลี่ยนเป้าใหญ่เป็นแผนที่ทำได้จริง', 'Turns big targets into workable plans']),
  P('DRV', 'SF', 'นักขายตัวจริง', 'Closer', ['ปิดดีลไว อ่านจังหวะลูกค้าเก่ง', 'Closes fast and reads customers well'], ['เปลี่ยนคนลังเลให้ตัดสินใจ', 'Turns hesitation into a yes']),
  P('DRV', 'SC', 'นักล่าเป้า', 'Target hunter', ['ไล่ตามเป้าอย่างอดทนและมีวินัย', 'Chases targets with patience and discipline'], ['ไม่ปล่อยตัวเลขหลุดแม้แต่เดือนเดียว', 'Never misses a month']),
  P('CAR', 'LF', 'พี่เลี้ยง', 'Coach', ['พัฒนาคนให้เก่งขึ้น และผลักให้กล้าลอง', 'Grows people and encourages them to try'], ['ทำให้คนในทีมเติบโตเร็ว', 'Helps the team grow fast']),
  P('CAR', 'LC', 'ผู้อาวุโสที่พึ่งได้', 'Trusted elder', ['หลักยึดของทีมในวันที่ทุกอย่างไม่แน่นอน', 'The anchor when everything is uncertain'], ['เป็นที่ไว้ใจของทุกฝ่าย', 'Trusted by every side']),
  P('CAR', 'SF', 'มือขวาใจดี', 'Helping hand', ['พร้อมช่วยทุกคนทันทีที่มีคนต้องการ', 'Ready to help the moment someone needs it'], ['ทำให้งานของคนอื่นง่ายขึ้นเสมอ', "Always makes others' work easier"]),
  P('CAR', 'SC', 'ผู้ฟังที่ดี', 'Listener', ['รับฟังอย่างตั้งใจ และจำได้ว่าใครต้องการอะไร', 'Listens closely and remembers what people need'], ['ทำให้คนรู้สึกปลอดภัยที่จะพูด', 'Makes people feel safe to speak']),
]

export const personaById = (id: string): Persona => {
  const p = PERSONAS.find((x) => x.id === id)
  if (!p) throw new Error(`Unknown persona ${id}`)
  return p
}

/* ------------------------------------------- Modifiers ----------------------------------------- */

export type ModifierIcon = 'hands' | 'message' | 'stairs' | 'users' | 'shield' | 'megaphone' | 'party' | 'target' | 'wind' | 'ruler' | 'link' | 'scale' | 'rocket' | 'anchor'

export interface Modifier {
  id: string
  dim: DimCode
  pole: 1 | -1
  th: string
  en: string
  icon: ModifierIcon
}

/** 14 tags: both poles of the 6 Thai dimensions + change appetite. */
export const MODIFIERS: Modifier[] = [
  { id: 'kj-high', dim: 'KJ', pole: 1, th: 'เกรงใจสูง', en: 'Very deferential', icon: 'hands' },
  { id: 'kj-low', dim: 'KJ', pole: -1, th: 'พูดตรง', en: 'Speaks up', icon: 'message' },
  { id: 'sn-high', dim: 'SN', pole: 1, th: 'เคารพลำดับขั้น', en: 'Respects hierarchy', icon: 'stairs' },
  { id: 'sn-low', dim: 'SN', pole: -1, th: 'ชอบทีมแบน', en: 'Prefers flat teams', icon: 'users' },
  { id: 'fc-high', dim: 'FC', pole: 1, th: 'ถนอมน้ำใจ', en: 'Protects face', icon: 'shield' },
  { id: 'fc-low', dim: 'FC', pole: -1, th: 'รับ feedback ตรงได้', en: 'Open to direct feedback', icon: 'megaphone' },
  { id: 'sk-high', dim: 'SK', pole: 1, th: 'สายสนุก', en: 'Fun-loving', icon: 'party' },
  { id: 'sk-low', dim: 'SK', pole: -1, th: 'โฟกัสงาน', en: 'Task-focused', icon: 'target' },
  { id: 'mp-high', dim: 'MP', pole: 1, th: 'ไม่เป็นไร', en: 'Easy-going', icon: 'wind' },
  { id: 'mp-low', dim: 'MP', pole: -1, th: 'เป๊ะ', en: 'Precise', icon: 'ruler' },
  { id: 'bk-high', dim: 'BK', pole: 1, th: 'บุญคุณนิยม', en: 'Loyal to people', icon: 'link' },
  { id: 'bk-low', dim: 'BK', pole: -1, th: 'ยึดระบบ', en: 'Rule-based', icon: 'scale' },
  { id: 'ch-high', dim: 'CH', pole: 1, th: 'ชอบเปลี่ยนแปลง', en: 'Change-seeker', icon: 'rocket' },
  { id: 'ch-low', dim: 'CH', pole: -1, th: 'ชอบความมั่นคง', en: 'Stability-seeker', icon: 'anchor' },
]

export const modifierById = (id: string): Modifier => {
  const m = MODIFIERS.find((x) => x.id === id)
  if (!m) throw new Error(`Unknown modifier ${id}`)
  return m
}
