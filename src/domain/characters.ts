import type { Look } from '@/components/character/WorkPerson'
import { tt, type T } from '@/lib/i18n'
import { workfitCode } from './code'
import type { PropKey } from './roles'
import type { Scores } from './types'

/* ------------------------------------------------------------------------------------------------
 * The 16 Workfit characters: letters 1–4 of the Workfit Code (energy, ideas, drive, pace).
 *
 *   I N B C - H M W
 *   ^^^          สาย (group) = letters 1–2: IN, EN, ES, IS
 *   ^^^^         character   = letters 1–4
 *
 * Within a group: L/B (Lead vs Backbone) × Q/C (Quick vs Careful), ordered LQ, LC, BQ, BC.
 * Content describes preferences and styles only, never ability or worth; every type has equal value
 * (spec §16.1). No outside type names, no claims of equivalence, no company names.
 * ---------------------------------------------------------------------------------------------- */

export type GroupKey = 'IN' | 'EN' | 'ES' | 'IS'

export interface CharacterGroup {
  key: GroupKey
  name: T
  plural: T
  tagline: T
  color: string
  /** Which letters make the group, e.g. "I + N: เก็บตัว + มองภาพใหม่". */
  letters: T
}

export const CHARACTER_GROUPS: CharacterGroup[] = [
  {
    key: 'IN',
    name: tt('สายคิดลึก', 'Thinker'),
    plural: tt('สายคิดลึก', 'Thinkers'),
    tagline: tt('เงียบ ๆ แต่คิดไกล ชอบหาวิธีใหม่ที่ยังไม่มีใครลอง', 'Quiet, far-sighted, drawn to new ways no one has tried yet'),
    color: '#7c5cbf',
    letters: tt('I + N: เติมพลังในความเงียบ + มองภาพใหม่', 'I + N: recharges in quiet + new ideas'),
  },
  {
    key: 'EN',
    name: tt('สายครีเอต', 'Creator'),
    plural: tt('สายครีเอต', 'Creators'),
    tagline: tt('ไอเดียเยอะ พลังล้น ชวนคนรอบตัวมาลองของใหม่', 'Full of ideas and energy, gets people trying new things'),
    color: '#d99a1e',
    letters: tt('E + N: ได้พลังจากคน + มองภาพใหม่', 'E + N: energised by people + new ideas'),
  },
  {
    key: 'ES',
    name: tt('สายลุย', 'Doer'),
    plural: tt('สายลุย', 'Doers'),
    tagline: tt('ลงสนามจริง คุยกับคนเก่ง ใช้วิธีที่ได้ผลแล้วปิดงาน', 'On the ground with people, using what works to get it done'),
    color: '#d9674f',
    letters: tt('E + S: ได้พลังจากคน + ยึดของจริงที่พิสูจน์แล้ว', 'E + S: energised by people + proven, practical'),
  },
  {
    key: 'IS',
    name: tt('สายเสาหลัก', 'Anchor'),
    plural: tt('สายเสาหลัก', 'Anchors'),
    tagline: tt('นิ่ง แม่น ไว้ใจได้ ทำของจริงให้เดินอย่างสม่ำเสมอ', 'Steady, accurate and reliable, keeping real work running'),
    color: '#2f8f84',
    letters: tt('I + S: เติมพลังในความเงียบ + ยึดของจริงที่พิสูจน์แล้ว', 'I + S: recharges in quiet + proven, practical'),
  },
]

export type { Look }

/* Skin tones from light to deep brown, and hair colours (mostly dark, a couple of brown/grey). */
const LIGHT = '#f6d3b3'
const MEDIUM = '#e3ad85'
const TAN = '#c0875a'
const DEEP = '#94603e'
const BLACK = '#17171d'
const DARK = '#2b2b35'
const BROWN = '#6b4630'
const GREY = '#a3a7b0'

export interface WorkCharacter {
  /** Letters 1–4, e.g. 'INBC'. */
  key: string
  group: GroupKey
  name: T
  /** One line that sums the character up. */
  tagline: T
  prop: PropKey
  /** 2–3 sentences, plain words. */
  overview: T
  /** Exactly 4. */
  strengths: T[]
  /** Exactly 3, phrased as "when overdone". */
  watchouts: T[]
  inTeam: T
  withManager: T
  workHabits: T
  /** 3–5 job families, in English like the role types. */
  careers: string[]
  workWithMe: T
  /** Life outside work: with friends and your gang. */
  friends: T
  /** In the family. */
  family: T
  /** At social events and parties (merit-making, weddings, company parties). */
  social: T
  /** With a life partner. */
  partner: T
  /** How the character is drawn; the four in a group always look different. */
  look: Look
}

export const CHARACTERS: WorkCharacter[] = [
  /* ------------------------------------------- IN สายคิดลึก ------------------------------------------- */
  {
    key: 'INLQ',
    group: 'IN',
    name: tt('นักวางกลยุทธ์', 'The Strategist'),
    tagline: tt('คิดเงียบ ๆ มองไกล แล้วชี้ทางให้ทีมได้เร็ว', 'Quiet long-range thinkers who pick a direction and move fast'),
    prop: 'map',
    overview: tt(
      'คุณมองภาพรวมได้ไกลกว่างานตรงหน้า และชอบคิดหาทางใหม่ในมุมเงียบ ๆ ของตัวเอง เมื่อทีมยังลังเล คุณกล้าเลือกทางแล้วพาเดินหน้าก่อน จากนั้นค่อยปรับแผนระหว่างทาง',
      'You see past the task in front of you and like working out new routes in your own quiet space. When the team hesitates, you pick a direction and lead the first move, then adjust the plan along the way.',
    ),
    strengths: [
      tt('เห็นภาพรวมและทางเลือกที่คนอื่นยังมองไม่เห็น', 'Sees the big picture and options others haven’t spotted'),
      tt('ตัดสินใจได้แม้ข้อมูลยังไม่ครบ', 'Can decide before every fact is in'),
      tt('เปลี่ยนไอเดียให้เป็นแผนที่มีลำดับ', 'Turns ideas into a plan with clear steps'),
      tt('ปรับทิศได้ไวเมื่อสถานการณ์เปลี่ยน', 'Changes course quickly when the situation shifts'),
    ],
    watchouts: [
      tt('เมื่อไปเร็วเกินไป คนในทีมอาจตามไม่ทันว่าทำไมถึงเลือกทางนี้', 'When moving too fast, the team may not follow why this path was chosen'),
      tt('เมื่อคิดอยู่ในหัวคนเดียวนาน ๆ คนอื่นอาจรู้สึกว่าไม่ได้มีส่วนร่วม', 'When thinking alone for long, others may feel left out of the decision'),
      tt('เมื่อสนใจภาพใหญ่มาก รายละเอียดหน้างานอาจหลุดได้', 'When the big picture takes over, day-to-day details can slip'),
    ],
    inTeam: tt(
      'ในทีมไทย คุณมักไม่ใช่คนพูดเยอะที่สุดในห้องประชุม แต่พอมีคนถามว่า แล้วเราจะไปทางไหน คนมักหันมาหาคุณ การเล่าเหตุผลให้ผู้ใหญ่ฟังแบบสั้น ๆ ก่อนประชุมช่วยให้แผนของคุณผ่านง่ายขึ้น โดยไม่มีใครรู้สึกเสียหน้า',
      'In a Thai team you’re rarely the loudest in the meeting, but when someone asks “so which way do we go?”, people look to you. Walking seniors through your reasoning briefly before the meeting helps your plan land without anyone losing face.',
    ),
    withManager: tt(
      'ได้ผลดีที่สุดเมื่อหัวหน้าบอกเป้าหมายชัด ๆ แล้วให้คุณเลือกเส้นทางเอง และมีช่องให้คุยเรื่องทิศทางแบบตัวต่อตัว',
      'Works best when your manager gives a clear goal, lets you choose the route, and makes room for one-to-one talks about direction.',
    ),
    workHabits: tt(
      'มักเริ่มวันด้วยการคิดว่าอะไรสำคัญที่สุด ชอบร่างแผนคร่าว ๆ แล้วลงมือเลย และกลับมาทบทวนเมื่อมีข้อมูลใหม่',
      'Often starts the day deciding what matters most, sketches a rough plan, starts right away, and revisits it when new information comes in.',
    ),
    careers: ['Strategy', 'Business Planning', 'Product & Innovation', 'Consulting'],
    workWithMe: tt('บอกเป้าหมายกับข้อจำกัดให้ชัด แล้วให้ฉันเลือกทางเดิน', 'Give me the goal and the limits, then let me choose the route.'),
    friends: tt('ในแก๊งเพื่อน คุณมักเป็นคนเสนอแผนเที่ยวหรือไอเดียแปลก ๆ แล้วตัดสินใจให้ทุกคนเมื่อไม่มีใครเลือก', 'With friends you often pitch the trip or the unusual plan, and make the call when no one else will.'),
    family: tt('ในครอบครัว คุณชอบคิดเรื่องอนาคตให้บ้าน เช่น การเงินหรือแผนระยะยาว แต่อาจลืมเล่าให้คนอื่นฟังว่าคิดอะไรอยู่', 'In the family you like thinking about the future, like money or long-term plans, but may forget to share what you’re thinking.'),
    social: tt('ในงานเลี้ยงหรืองานแต่ง คุณชอบคุยลึกกับคนไม่กี่คนมากกว่าทักทุกโต๊ะ และอาจกลับก่อนเมื่อพลังหมด', 'At parties or weddings you prefer a deep talk with a few people to greeting every table, and may leave early when your energy runs low.'),
    partner: tt('กับคู่ชีวิต คุณชอบวางแผนอนาคตด้วยกัน และให้ความสำคัญกับการได้คุยกันแบบลึก ๆ', 'With a partner you like planning the future together and value real, deep conversations.'),
    look: { hair: 'side', hairColor: DARK, skin: MEDIUM, glasses: true },
  },
  {
    key: 'INLC',
    group: 'IN',
    name: tt('สถาปนิกระบบ', 'The Architect'),
    tagline: tt('ออกแบบระบบใหม่ให้รอบคอบ แล้วนำทีมด้วยแบบที่คิดไว้ครบ', 'Careful designers who lead with a well-thought-out blueprint'),
    prop: 'blueprint',
    overview: tt(
      'คุณชอบคิดหาวิธีใหม่ แต่ต้องคิดให้ครบก่อนลงมือ คุณออกแบบว่าแต่ละส่วนจะต่อกันอย่างไร แล้วนำทีมด้วยแบบที่ชัดเจน มากกว่านำด้วยเสียงดัง',
      'You like new approaches but want to think them through before acting. You design how the parts fit together, then lead the team with a clear blueprint rather than a loud voice.',
    ),
    strengths: [
      tt('มองเห็นว่าระบบทั้งหมดเชื่อมกันอย่างไร', 'Sees how a whole system fits together'),
      tt('วางแผนระยะยาวที่คิดเผื่อปัญหาไว้ก่อน', 'Plans for the long run with problems thought through in advance'),
      tt('ทำเรื่องซับซ้อนให้เป็นโครงสร้างที่เข้าใจได้', 'Turns complex things into a structure people can follow'),
      tt('ตัดสินใจหนักแน่น เพราะคิดมาแล้วอย่างดี', 'Makes steady decisions because they are well considered'),
    ],
    watchouts: [
      tt('เมื่อขัดเกลาแบบนานเกินไป งานอาจเริ่มช้ากว่าที่ทีมต้องการ', 'When polishing the design too long, work can start later than the team needs'),
      tt('เมื่อยึดแบบที่คิดไว้มาก อาจรับฟังทางเลือกอื่นได้ยากขึ้น', 'When attached to the design, other options can be harder to hear'),
      tt('เมื่ออธิบายแบบละเอียดเกินไป คนฟังอาจหลุดประเด็นหลัก', 'When explaining in full detail, listeners can lose the main point'),
    ],
    inTeam: tt(
      'ในทีม คุณคือคนที่ถามว่า แล้วระยะยาวจะเป็นยังไง ทีมไทยที่เกรงใจกันอาจไม่ค่อยแย้งแบบของคุณตรง ๆ จึงควรถามความเห็นทีละคน แทนที่จะรอให้มีคนยกมือในที่ประชุม',
      'In a team you’re the one asking “what happens long term?”. A Thai team with a lot of kreng jai may not challenge your design openly, so ask people one by one instead of waiting for hands to go up in the meeting.',
    ),
    withManager: tt(
      'ได้ผลดีเมื่อหัวหน้าให้เวลาคิดก่อนตัดสินใจเรื่องใหญ่ และให้คุณดูแลโครงสร้างหรือระบบทั้งชิ้น',
      'Works well when your manager gives you time to think before big decisions and lets you own a whole structure or system.',
    ),
    workHabits: tt(
      'ชอบวาดแผนภาพหรือเขียนโครงร่างก่อนเริ่มงาน ทำงานเป็นช่วงยาว ๆ แบบไม่ถูกขัด และเก็บเหตุผลของการตัดสินใจไว้ให้ดูย้อนหลังได้',
      'Likes to draw diagrams or outline before starting, works in long uninterrupted blocks, and keeps the reasons behind decisions on record.',
    ),
    careers: ['Process & Systems', 'Business Analysis', 'IT & Architecture', 'Strategy'],
    workWithMe: tt('ให้เวลาฉันคิดให้ครบก่อน แล้วฉันจะให้แผนที่ทีมใช้ได้นาน', 'Give me time to think it through and I’ll give you a plan the team can rely on.'),
    friends: tt('กับเพื่อน คุณเป็นคนที่เพื่อนมาขอคำปรึกษาเรื่องใหญ่ เพราะคุณคิดให้ครบทุกด้านก่อนตอบ', 'Friends come to you about big decisions because you think through every side before answering.'),
    family: tt('ในครอบครัว คุณชอบจัดระบบบ้านให้ใช้ง่ายในระยะยาว ตั้งแต่เรื่องเอกสารจนถึงแผนการเงิน', 'In the family you like setting up home systems that work long term, from paperwork to money plans.'),
    social: tt('ในงานบุญหรืองานบริษัท คุณชอบรู้ล่วงหน้าว่าจะมีอะไรบ้าง และมักอยู่กับกลุ่มเล็ก ๆ ที่คุยถูกคอ', 'At merit-making or company events you like knowing the plan in advance and tend to stay with a small group you click with.'),
    partner: tt('กับคู่ชีวิต คุณแสดงความใส่ใจผ่านการคิดเผื่อและวางแผนให้ชีวิตคู่มั่นคง', 'With a partner you show care by thinking ahead and planning for a steady life together.'),
    look: { hair: 'short', hairColor: GREY, skin: DEEP, beard: true },
  },
  {
    key: 'INBQ',
    group: 'IN',
    name: tt('นักประดิษฐ์', 'The Inventor'),
    tagline: tt('ลองของใหม่ไว ๆ เบื้องหลัง แล้วส่งทางออกให้ทีมใช้', 'Behind-the-scenes tinkerers who try new things fast and hand the team a fix'),
    prop: 'flask',
    overview: tt(
      'คุณชอบทดลองหาวิธีใหม่ และไม่กลัวลองผิดลองถูก คุณไม่จำเป็นต้องเป็นคนนำ แต่ชอบเป็นคนที่ทำต้นแบบแรกออกมาให้ทุกคนได้เห็นว่าทำได้จริง',
      'You like experimenting with new ways and don’t mind trial and error. You don’t need to be the one leading, but you love building the first prototype so everyone can see it works.',
    ),
    strengths: [
      tt('ทำต้นแบบออกมาให้เห็นได้เร็ว', 'Gets a working prototype out quickly'),
      tt('หาทางออกแปลกใหม่ให้ปัญหาที่ติดอยู่', 'Finds unusual fixes for stuck problems'),
      tt('เรียนรู้เครื่องมือใหม่ได้ไว', 'Picks up new tools fast'),
      tt('ช่วยทีมด้วยไอเดียโดยไม่ต้องแย่งซีน', 'Supports the team with ideas without needing the spotlight'),
    ],
    watchouts: [
      tt('เมื่อสนุกกับการลองมาก งานเก่าอาจค้างไว้ไม่จบ', 'When experimenting is fun, older work can be left unfinished'),
      tt('เมื่อทำเงียบ ๆ อยู่เบื้องหลัง คนอื่นอาจไม่รู้ว่าคุณทำอะไรไปบ้าง', 'When working quietly in the background, others may not know what you did'),
      tt('เมื่อรีบลอง อาจข้ามการบันทึกหรือการบอกทีม', 'When rushing to try, notes and team updates can get skipped'),
    ],
    inTeam: tt(
      'ในทีมไทย คุณมักเป็นคนที่ไปลองทำมาก่อนแล้วค่อยเอามาให้ดู แทนที่จะเสนอไอเดียในที่ประชุม ซึ่งช่วยไม่ให้ใครเสียหน้า แต่ก็ทำให้ผลงานของคุณถูกมองข้ามได้ ลองเล่าสั้น ๆ ว่าคุณลองอะไรไปแล้วบ้าง',
      'In a Thai team you tend to try something first and show it later rather than pitching in a meeting. That keeps everyone’s face intact, but it can also hide your work, so share briefly what you’ve tried.',
    ),
    withManager: tt(
      'ได้ผลดีเมื่อหัวหน้าให้พื้นที่ลองผิดลองถูก บอกว่าอะไรต้องเสร็จเมื่อไร และช่วยพูดถึงผลงานของคุณต่อคนอื่น',
      'Works well when your manager gives you room to experiment, says clearly what must be done by when, and helps make your work visible to others.',
    ),
    workHabits: tt(
      'ชอบลองทำเล็ก ๆ ก่อนแล้วค่อยขยาย มักมีหลายโปรเจกต์ทดลองเปิดอยู่พร้อมกัน และทำงานได้ดีในช่วงที่ไม่มีใครรบกวน',
      'Likes to try something small first and scale it up, often has several experiments open at once, and works best in stretches with no interruptions.',
    ),
    careers: ['Product & Innovation', 'Research', 'Engineering & Development', 'Design & Content'],
    workWithMe: tt('ให้โจทย์กับเวลาลองเล่น แล้วรอดูต้นแบบจากฉัน', 'Give me a problem and some time to play, and I’ll come back with a prototype.'),
    friends: tt('ในแก๊งเพื่อน คุณคือคนที่ชวนลองร้านใหม่ งานอดิเรกใหม่ หรือของแปลก ๆ แบบไม่ต้องคิดนาน', 'With friends you’re the one suggesting a new place, a new hobby or an odd gadget, without overthinking it.'),
    family: tt('ในครอบครัว คุณมักเป็นคนหาวิธีใหม่ ๆ ให้เรื่องในบ้านง่ายขึ้น เช่น ตั้งค่าอุปกรณ์ให้ทุกคน', 'In the family you often find new ways to make home life easier, like setting up everyone’s devices.'),
    social: tt('ในงานเลี้ยง คุณสนุกเมื่อได้คุยเรื่องที่สนใจจริง ๆ และอาจหลบไปมุมเงียบเมื่อคนเยอะ', 'At parties you enjoy talking about things that really interest you, and may slip to a quiet corner when it gets crowded.'),
    partner: tt('กับคู่ชีวิต คุณชอบลองสิ่งใหม่ด้วยกัน และต้องการเวลาส่วนตัวเพื่อทำเรื่องที่ชอบ', 'With a partner you like trying new things together and need some time alone for your own interests.'),
    look: { hair: 'curly', hairColor: BROWN, skin: LIGHT },
  },
  {
    key: 'INBC',
    group: 'IN',
    name: tt('นักวิเคราะห์', 'The Analyst'),
    tagline: tt('ขุดลึกอย่างเงียบ ๆ จนเจอคำตอบที่ทีมเชื่อได้', 'Quiet investigators who dig deep until the team has an answer it can trust'),
    prop: 'lens',
    overview: tt(
      'คุณสนใจคำถามใหม่ ๆ และชอบค้นให้ลึกจนเข้าใจจริง คุณตรวจข้อมูลอย่างรอบคอบก่อนสรุป และชอบเป็นคนที่ส่งหลักฐานให้ทีมใช้ตัดสินใจ มากกว่าเป็นคนตัดสินใจเอง',
      'You’re drawn to new questions and like digging until you really understand. You check the data carefully before concluding, and prefer to hand the team the evidence for a decision rather than make the call yourself.',
    ),
    strengths: [
      tt('เห็นรูปแบบในข้อมูลที่คนอื่นมองข้าม', 'Spots patterns in data that others miss'),
      tt('ตรวจสอบให้แน่ใจก่อนสรุป', 'Checks thoroughly before concluding'),
      tt('ถามคำถามที่ทำให้ทีมคิดให้ลึกขึ้น', 'Asks questions that make the team think deeper'),
      tt('อธิบายเรื่องยากด้วยตัวเลขและเหตุผล', 'Explains hard things with numbers and reasons'),
    ],
    watchouts: [
      tt('เมื่ออยากได้ข้อมูลครบมาก การสรุปอาจช้ากว่าที่งานต้องการ', 'When wanting complete data, conclusions can arrive later than the work needs'),
      tt('เมื่อจมกับรายละเอียด อาจลืมเล่าว่าสรุปแล้วต้องทำอะไร', 'When deep in detail, the “so what do we do” can get left out'),
      tt('เมื่อเก็บความเห็นไว้กับตัว ทีมอาจไม่ได้ใช้สิ่งที่คุณเห็น', 'When keeping views to yourself, the team may miss what you’ve seen'),
    ],
    inTeam: tt(
      'ในทีมไทย คุณอาจไม่ค่อยแย้งผู้ใหญ่ในที่ประชุม แต่ข้อมูลที่คุณมีมักสำคัญมาก การส่งสรุปเป็นลายลักษณ์อักษรหรือคุยตัวต่อตัวช่วยให้เสียงของคุณถูกได้ยิน โดยไม่ต้องพูดแย้งต่อหน้าคนเยอะ',
      'In a Thai team you may not contradict seniors in a meeting, yet your data often matters most. A written summary or a one-to-one chat lets your view be heard without arguing in front of everyone.',
    ),
    withManager: tt(
      'ได้ผลดีเมื่อหัวหน้าให้คำถามที่ชัด ให้เวลาค้นคว้า และถามความเห็นคุณโดยตรงแทนการรอให้คุณพูดเอง',
      'Works well when your manager gives you a clear question, time to research, and asks for your view directly instead of waiting for you to speak up.',
    ),
    workHabits: tt(
      'ชอบเปิดข้อมูลดิบดูเอง จดบันทึกละเอียด ตรวจซ้ำก่อนส่ง และชอบช่วงเวลาที่โฟกัสได้ยาว ๆ',
      'Likes looking at the raw data yourself, keeps detailed notes, double-checks before sending, and values long focus time.',
    ),
    careers: ['Data & Analysis', 'Business Analysis', 'Research', 'Finance & Risk'],
    workWithMe: tt('ส่งคำถามที่ชัดและเวลาให้ฉันขุด แล้วถามความเห็นฉันตรง ๆ', 'Send me a clear question and time to dig, then ask me what I think.'),
    friends: tt('กับเพื่อน คุณมีเพื่อนสนิทไม่กี่คนแต่คบกันยาว และเป็นคนที่เพื่อนถามเมื่ออยากได้ข้อมูลก่อนตัดสินใจ', 'You have a few long-lasting close friends, and they ask you when they want the facts before deciding.'),
    family: tt('ในครอบครัว คุณมักเป็นคนหาข้อมูลก่อนซื้อของชิ้นใหญ่ หรือก่อนเลือกโรงพยาบาล โรงเรียน หรือประกัน', 'In the family you’re often the one researching before a big purchase or choosing a hospital, school or insurance.'),
    social: tt('ในงานแต่งหรืองานเลี้ยงบริษัท คุณชอบมีบทบาทชัด ๆ เช่น ช่วยดูรายชื่อแขก มากกว่าต้องเดินทักทายทุกคน', 'At weddings or company parties you prefer a clear role, like helping with the guest list, to working the room.'),
    partner: tt('กับคู่ชีวิต คุณแสดงความรักผ่านความใส่ใจในรายละเอียด และชอบคุยเรื่องที่คิดอยู่ในบรรยากาศสงบ', 'With a partner you show love through attention to detail and like talking things through somewhere calm.'),
    look: { hair: 'bun', hairColor: DARK, skin: TAN, glasses: true },
  },

  /* ------------------------------------------- EN สายครีเอต ------------------------------------------- */
  {
    key: 'ENLQ',
    group: 'EN',
    name: tt('ผู้จุดประกาย', 'The Visionary'),
    tagline: tt('ปลุกคนรอบตัวด้วยไอเดียใหม่ แล้วพาออกตัวทันที', 'Energisers who rally people around a new idea and start right away'),
    prop: 'mic',
    overview: tt(
      'คุณได้พลังจากคนและไอเดียใหม่ ชอบเล่าภาพอนาคตให้คนอื่นตื่นเต้นตาม เมื่อเห็นโอกาส คุณพร้อมนำทีมออกตัวก่อน แล้วค่อยเติมรายละเอียดระหว่างทาง',
      'You get energy from people and new ideas, and love painting a picture of the future that others get excited about. When you see a chance, you lead the team off the starting line and fill in the details as you go.',
    ),
    strengths: [
      tt('ทำให้คนอยากร่วมทำสิ่งใหม่', 'Makes people want to join something new'),
      tt('เล่าไอเดียให้เข้าใจง่ายและน่าตื่นเต้น', 'Explains ideas in a simple, exciting way'),
      tt('กล้าเริ่มเรื่องที่ยังไม่มีใครเริ่ม', 'Starts what no one has started yet'),
      tt('ปลุกพลังทีมในช่วงที่งานเงียบ', 'Lifts team energy when things go flat'),
    ],
    watchouts: [
      tt('เมื่อมีไอเดียใหม่ตลอด ทีมอาจตามไม่ทันและงานเดิมอาจค้าง', 'When new ideas keep coming, the team can fall behind and earlier work can stall'),
      tt('เมื่อมั่นใจในภาพอนาคตมาก อาจมองข้ามข้อจำกัดจริง', 'When sure of the vision, real constraints can get overlooked'),
      tt('เมื่อพูดเยอะ คนที่เงียบกว่าอาจไม่ได้พูด', 'When talking a lot, quieter people may not get a turn'),
    ],
    inTeam: tt(
      'ในทีมไทย คุณช่วยให้บรรยากาศสนุกและมีพลัง คนชอบตามคุณเพราะงานดูน่าทำ แต่ด้วยความเกรงใจ บางคนอาจรับปากทั้งที่ยังไม่พร้อม ลองถามว่าใครมีข้อกังวลอะไร แบบที่ตอบได้โดยไม่เสียหน้า',
      'In a Thai team you bring sanuk and energy, and people follow because the work looks worth doing. Out of kreng jai, some may say yes before they’re ready, so ask for concerns in a way people can answer without losing face.',
    ),
    withManager: tt(
      'ได้ผลดีเมื่อหัวหน้าเปิดให้เสนอไอเดียและริเริ่มเรื่องใหม่ พร้อมจับคู่คุณกับคนที่ช่วยปิดงานให้จบ',
      'Works well when your manager welcomes new ideas and initiatives, and pairs you with someone who helps finish the work.',
    ),
    workHabits: tt(
      'ชอบคิดออกเสียงกับคนอื่น นัดคุยเร็ว ๆ แทนการเขียนยาว และมักเริ่มหลายเรื่องพร้อมกันเมื่อมีไฟ',
      'Likes thinking out loud with others, prefers a quick chat to a long write-up, and often starts several things at once when inspired.',
    ),
    careers: ['Marketing & Brand', 'Product & Innovation', 'Sales & Partnerships', 'Business Development'],
    workWithMe: tt('คุยไอเดียกับฉันก่อน แล้วช่วยฉันเลือกว่าเรื่องไหนต้องจบก่อน', 'Talk ideas through with me, then help me pick what has to finish first.'),
    friends: tt('ในแก๊งเพื่อน คุณมักเป็นคนชวนออกไปทำอะไรสักอย่าง และทำให้แผนที่คุยกันไว้เกิดขึ้นจริง', 'With friends you’re usually the one who gets everyone out doing something and makes the plan actually happen.'),
    family: tt('ในครอบครัว คุณชอบพาทุกคนลองอะไรใหม่ เช่น ที่เที่ยวใหม่หรือกิจกรรมวันหยุด', 'In the family you like getting everyone to try something new, like a new trip or weekend activity.'),
    social: tt('ในงานเลี้ยงหรือปาร์ตี้บริษัท คุณสนุกกับการได้เจอคนเยอะ ๆ และมักเป็นคนเปิดบทสนทนา', 'At parties and company events you enjoy meeting lots of people and often start the conversations.'),
    partner: tt('กับคู่ชีวิต คุณชอบมีเป้าหมายและการผจญภัยใหม่ ๆ ด้วยกัน และอยากให้อีกฝ่ายร่วมฝันไปด้วย', 'With a partner you like shared goals and new adventures, and want them to dream along with you.'),
    look: { hair: 'spiky', hairColor: BLACK, skin: TAN },
  },
  {
    key: 'ENLC',
    group: 'EN',
    name: tt('นักพัฒนาคน', 'The Coach'),
    tagline: tt('นำด้วยการทำให้คนเติบโต อย่างใจเย็นและคิดมาแล้ว', 'Patient leaders who lead by helping people grow'),
    prop: 'sprout',
    overview: tt(
      'คุณมองเห็นศักยภาพในตัวคน และชอบคิดหาวิธีใหม่ให้ทีมเก่งขึ้น คุณนำแบบค่อยเป็นค่อยไป วางแผนการเปลี่ยนแปลงอย่างรอบคอบ เพื่อให้ทุกคนไปด้วยกันได้',
      'You see potential in people and like finding new ways to help the team grow. You lead step by step, planning change carefully so everyone can come along.',
    ),
    strengths: [
      tt('เห็นจุดเด่นของแต่ละคนและช่วยให้ได้ใช้', 'Sees each person’s strengths and helps them use them'),
      tt('ให้ฟีดแบ็กที่คนรับได้และนำไปใช้ได้จริง', 'Gives feedback people can take in and use'),
      tt('วางแผนการเปลี่ยนแปลงให้ทีมไม่สะดุด', 'Plans change so the team doesn’t stumble'),
      tt('สร้างความไว้ใจในทีมระยะยาว', 'Builds long-term trust in a team'),
    ],
    watchouts: [
      tt('เมื่อรอให้ทุกคนพร้อมมาก การตัดสินใจอาจช้า', 'When waiting for everyone to be ready, decisions can slow down'),
      tt('เมื่อลงแรงกับคนอื่นมาก งานของตัวเองอาจถูกเลื่อน', 'When investing a lot in others, your own work can get pushed back'),
      tt('เมื่อห่วงความรู้สึกมาก เรื่องยากอาจถูกพูดช้าเกินไป', 'When protecting feelings, hard conversations can come too late'),
    ],
    inTeam: tt(
      'ในทีมไทย คุณมักเป็นพี่ที่น้อง ๆ เข้าหาเมื่อมีปัญหา คุณเข้าใจเรื่องหน้าตาและเลือกเวลาคุยได้ดี ระวังอย่าแบกเรื่องของทุกคนไว้คนเดียวจนเหนื่อย',
      'In a Thai team you’re often the senior colleague juniors come to with problems. You understand face and choose the right moment to talk, but watch out for carrying everyone’s worries alone.',
    ),
    withManager: tt(
      'ได้ผลดีเมื่อหัวหน้าให้คุณดูแลการพัฒนาคน ให้เวลาวางแผนการเปลี่ยนแปลง และยอมรับว่าการพัฒนาคนเป็นผลงานจริง',
      'Works well when your manager lets you own people development, gives you time to plan change, and counts growing people as real results.',
    ),
    workHabits: tt(
      'ชอบนัดคุยตัวต่อตัวเป็นประจำ จดว่าใครกำลังพัฒนาเรื่องอะไร และคิดล่วงหน้าว่าทีมต้องใช้ทักษะอะไรต่อไป',
      'Likes regular one-to-ones, keeps track of who is working on what skill, and thinks ahead about what the team will need to learn next.',
    ),
    careers: ['People Development', 'Learning & Training', 'HR & Culture', 'Team Leadership'],
    workWithMe: tt('บอกฉันว่าทีมต้องเติบโตไปทางไหน แล้วให้เวลาฉันพาทุกคนไปด้วยกัน', 'Tell me where the team needs to grow and give me time to bring everyone along.'),
    friends: tt('กับเพื่อน คุณเป็นคนที่เพื่อนมาระบายด้วย และมักช่วยให้เพื่อนมองเห็นทางออกของตัวเอง', 'Friends come to you to talk things out, and you help them find their own way forward.'),
    family: tt('ในครอบครัว คุณใส่ใจว่าแต่ละคนเป็นอย่างไร และชอบช่วยน้อง ๆ หรือลูกหลานให้ได้เรียนรู้', 'In the family you notice how each person is doing and like helping younger relatives learn and grow.'),
    social: tt('ในงานบุญหรืองานแต่ง คุณชอบช่วยดูแลแขก และแนะนำคนที่ยังไม่รู้จักกันให้ได้คุยกัน', 'At merit-making ceremonies or weddings you like looking after guests and introducing people who haven’t met.'),
    partner: tt('กับคู่ชีวิต คุณให้ความสำคัญกับการเติบโตไปด้วยกัน และชอบคุยกันว่าอยากเป็นแบบไหนในอนาคต', 'With a partner you value growing together and like talking about who you both want to become.'),
    look: { hair: 'long', hairColor: DARK, skin: LIGHT },
  },
  {
    key: 'ENBQ',
    group: 'EN',
    name: tt('นักสร้างสรรค์', 'The Maker'),
    tagline: tt('ปั้นไอเดียออกมาเป็นชิ้นงานไว ๆ ร่วมกับทีม', 'Hands-on creators who turn ideas into real work, fast, with the team'),
    prop: 'pencil',
    overview: tt(
      'คุณชอบสร้างของใหม่และได้ไฟจากการระดมไอเดียกับคนอื่น คุณไม่ต้องเป็นคนนำ แต่ชอบเป็นคนที่ลงมือทำให้ไอเดียกลายเป็นชิ้นงานจริงได้เร็ว',
      'You love making new things and get fired up brainstorming with others. You don’t need to lead; you’d rather be the one who quickly turns an idea into real work.',
    ),
    strengths: [
      tt('เปลี่ยนไอเดียเป็นชิ้นงานที่จับต้องได้เร็ว', 'Turns ideas into something tangible quickly'),
      tt('ต่อยอดไอเดียของคนอื่นได้เก่ง', 'Builds well on other people’s ideas'),
      tt('ทำงานให้ดูน่าสนใจและเข้าถึงง่าย', 'Makes work look appealing and easy to get'),
      tt('ทำให้การระดมสมองสนุกและได้ผล', 'Makes brainstorming fun and productive'),
    ],
    watchouts: [
      tt('เมื่อรีบทำ รายละเอียดหรือการตรวจทานอาจหลุด', 'When rushing, details or proofreading can slip'),
      tt('เมื่อรับงานสนุก ๆ มาเยอะ อาจมีงานล้นมือ', 'When saying yes to fun work, the load can pile up'),
      tt('เมื่อคล้อยตามทีมมาก ความเห็นของตัวเองอาจหายไป', 'When going along with the team, your own view can disappear'),
    ],
    inTeam: tt(
      'ในทีมไทย คุณเป็นคนที่ทำให้งานสนุก และมักเป็นคนแรกที่อาสาทำชิ้นงาน ด้วยความเกรงใจคุณอาจรับงานจากทุกคนจนเกินตัว การบอกว่าตอนนี้มีงานอะไรอยู่บ้างช่วยให้ปฏิเสธได้โดยไม่เสียน้ำใจ',
      'In a Thai team you make work sanuk and are often first to volunteer to make something. Kreng jai can lead you to take on too much, so sharing what’s already on your plate helps you say no without hurting anyone.',
    ),
    withManager: tt(
      'ได้ผลดีเมื่อหัวหน้าให้โจทย์ที่ชัด ปล่อยให้คุณลองทำแบบของตัวเอง และช่วยจัดลำดับเมื่องานเยอะ',
      'Works well when your manager gives a clear brief, lets you try your own take, and helps set priorities when the load grows.',
    ),
    workHabits: tt(
      'ชอบร่างไว ๆ แล้วเอาไปให้คนดู ทำงานได้ดีเมื่อมีเพื่อนคุยด้วย และมักเก็บไอเดียไว้ในโน้ตหรือภาพสเก็ตช์',
      'Likes quick drafts to show people, works well with someone to bounce off, and keeps ideas in notes or sketches.',
    ),
    careers: ['Design & Content', 'Marketing & Brand', 'Product & Innovation', 'Events & Communications'],
    workWithMe: tt('ให้โจทย์ที่ชัดแล้วดูร่างแรกของฉันเร็ว ๆ ฉันจะปรับให้ดีขึ้นเรื่อย ๆ', 'Give me a clear brief and look at my first draft early; I’ll keep improving it.'),
    friends: tt('ในแก๊งเพื่อน คุณเป็นคนทำให้ทุกอย่างสนุก ตั้งแต่ทำการ์ดวันเกิดจนถึงคิดธีมปาร์ตี้', 'With friends you make things fun, from birthday cards to party themes.'),
    family: tt('ในครอบครัว คุณชอบแต่งบ้าน ทำของขวัญเอง หรือถ่ายรูปเก็บความทรงจำให้ทุกคน', 'In the family you like decorating, making gifts by hand, or taking photos to keep everyone’s memories.'),
    social: tt('ในงานเลี้ยง คุณมักอาสาช่วยจัดหรือทำอะไรบางอย่าง และสนุกกับการได้คุยกับคนใหม่ ๆ', 'At parties you often volunteer to help set up or make something, and enjoy meeting new people.'),
    partner: tt('กับคู่ชีวิต คุณชอบเซอร์ไพรส์เล็ก ๆ และกิจกรรมสร้างสรรค์ที่ทำด้วยกันได้', 'With a partner you like small surprises and creative things you can do together.'),
    look: { hair: 'cap', hairColor: BLACK, skin: DEEP },
  },
  {
    key: 'ENBC',
    group: 'EN',
    name: tt('นักเชื่อมคน', 'The Connector'),
    tagline: tt('ฟังอย่างตั้งใจ แล้วเชื่อมคนกับไอเดียให้เจอกัน', 'Attentive listeners who bring the right people and ideas together'),
    prop: 'links',
    overview: tt(
      'คุณชอบคนและชอบไอเดียใหม่ คุณรู้ว่าใครเก่งเรื่องไหน และชอบพาคนที่ควรรู้จักกันมาเจอกัน คุณค่อย ๆ สร้างความสัมพันธ์อย่างตั้งใจ และเป็นแรงหนุนให้ทีมทำงานข้ามฝ่ายได้',
      'You enjoy people and new ideas. You know who is good at what and love introducing people who should meet. You build relationships patiently and help the team work across departments.',
    ),
    strengths: [
      tt('รู้ว่าใครควรคุยกับใคร', 'Knows who should talk to whom'),
      tt('ฟังแล้วจับได้ว่าแต่ละฝ่ายต้องการอะไรจริง ๆ', 'Listens and picks up what each side really needs'),
      tt('ทำให้งานข้ามแผนกเดินได้ราบรื่น', 'Keeps cross-team work running smoothly'),
      tt('ดูแลความสัมพันธ์ระยะยาวได้ดี', 'Looks after long-term relationships'),
    ],
    watchouts: [
      tt('เมื่ออยากให้ทุกฝ่ายพอใจ การตัดสินใจอาจค้าง', 'When wanting every side to be happy, decisions can stall'),
      tt('เมื่อคิดเผื่อความรู้สึกคนอื่นมาก อาจไม่พูดสิ่งที่ตัวเองต้องการ', 'When thinking of others’ feelings, your own needs may go unsaid'),
      tt('เมื่อดูแลหลายความสัมพันธ์พร้อมกัน อาจเหนื่อยโดยไม่รู้ตัว', 'When looking after many relationships, you can tire without noticing'),
    ],
    inTeam: tt(
      'ในทีมไทย คุณคือคนที่รู้จักคนทั้งตึก และเป็นสะพานระหว่างรุ่นพี่กับรุ่นน้อง หรือระหว่างแผนก คุณช่วยให้เรื่องยากถูกคุยแบบไม่มีใครเสียหน้า ระวังอย่าให้การเป็นตัวกลางทำให้คุณต้องแบกความขัดแย้งของคนอื่น',
      'In a Thai team you know people across the building and bridge seniors and juniors, or one department and another. You help hard topics get discussed without anyone losing face; just don’t let being the go-between mean carrying other people’s conflicts.',
    ),
    withManager: tt(
      'ได้ผลดีเมื่อหัวหน้าให้คุณดูแลงานที่ต้องประสานหลายฝ่าย และบอกชัดว่าเรื่องไหนตัดสินใจได้เอง',
      'Works well when your manager gives you cross-team work to coordinate and is clear about which calls are yours to make.',
    ),
    workHabits: tt(
      'ชอบแวะคุยกับคนแทนการส่งข้อความยาว จำรายละเอียดเรื่องของคนได้ดี และคิดก่อนว่าจะพูดเรื่องยากกับใครอย่างไร',
      'Likes dropping by to talk instead of sending long messages, remembers personal details, and thinks ahead about how to raise hard topics with each person.',
    ),
    careers: ['Coordination', 'Account & Partnerships', 'HR & Culture', 'Community & Communications'],
    workWithMe: tt('บอกฉันว่าต้องเชื่อมใครกับเรื่องอะไร แล้วไว้ใจให้ฉันดูแลความสัมพันธ์', 'Tell me who needs to connect on what, then trust me with the relationships.'),
    friends: tt('ในแก๊งเพื่อน คุณคือคนที่พาเพื่อนหลายกลุ่มมารู้จักกัน และจำได้ว่าใครชอบอะไร', 'With friends you bring different groups together and remember what everyone likes.'),
    family: tt('ในครอบครัว คุณมักเป็นคนประสานญาติ ๆ เช่น นัดรวมญาติหรือส่งข่าวในกลุ่มไลน์ครอบครัว', 'In the family you often coordinate relatives, like arranging get-togethers or sharing news in the family chat.'),
    social: tt('ในงานแต่งหรืองานบุญ คุณรู้จักคนทั่วงาน และช่วยให้แขกที่มาคนเดียวไม่รู้สึกเหงา', 'At weddings or merit-making events you seem to know everyone, and help guests who came alone feel at home.'),
    partner: tt('กับคู่ชีวิต คุณให้ค่ากับการฟังกัน และการได้เป็นส่วนหนึ่งในวงเพื่อนและครอบครัวของกันและกัน', 'With a partner you value listening to each other and being part of each other’s friends and family.'),
    look: { hair: 'bob', hairColor: BROWN, skin: MEDIUM, glasses: true },
  },

  /* --------------------------------------------- ES สายลุย --------------------------------------------- */
  {
    key: 'ESLQ',
    group: 'ES',
    name: tt('แม่ทัพหน้างาน', 'The Captain'),
    tagline: tt('ลงสนามจริง ตัดสินใจไว และพาทีมปิดงาน', 'On-the-ground leaders who decide fast and get the team over the line'),
    prop: 'flag',
    overview: tt(
      'คุณได้พลังจากคนและชอบสิ่งที่เห็นผลจริง เมื่อมีปัญหาหน้างาน คุณก้าวออกมาสั่งการได้ทันที ใช้วิธีที่รู้ว่าได้ผล และพาทีมไปถึงเป้าแบบไม่รอช้า',
      'You get energy from people and like results you can see. When something goes wrong on the ground, you step up and direct right away, use what you know works, and take the team to the target without delay.',
    ),
    strengths: [
      tt('ตัดสินใจได้เร็วในสถานการณ์จริง', 'Decides quickly in real situations'),
      tt('ทำให้ทีมรู้ชัดว่าตอนนี้ต้องทำอะไร', 'Makes it clear what the team does right now'),
      tt('ต่อรองและปิดดีลได้', 'Negotiates and closes'),
      tt('ไม่ถอยเมื่อเจอแรงกดดัน', 'Holds steady under pressure'),
    ],
    watchouts: [
      tt('เมื่อเร่งมาก คนที่ต้องการเวลาคิดอาจตามไม่ทัน', 'When pushing hard, people who need time to think can fall behind'),
      tt('เมื่อสั่งการเองบ่อย ทีมอาจไม่ได้ฝึกตัดสินใจ', 'When always giving the orders, the team gets less practice deciding'),
      tt('เมื่อมุ่งที่ผลลัพธ์มาก ความรู้สึกของคนอาจถูกมองข้าม', 'When focused on results, people’s feelings can get missed'),
    ],
    inTeam: tt(
      'ในทีมไทย คุณคือคนที่ทุกคนหันไปหาเมื่อเกิดเรื่องด่วน ความตรงไปตรงมาของคุณช่วยให้งานเดิน แต่กับรุ่นพี่หรือคนที่เกรงใจมาก ลองพูดแบบให้เกียรติก่อน แล้วค่อยเข้าเรื่อง',
      'In a Thai team you’re the one everyone turns to when something urgent happens. Your directness keeps work moving, but with seniors or people with lots of kreng jai, show respect first and then get to the point.',
    ),
    withManager: tt(
      'ได้ผลดีเมื่อหัวหน้าให้เป้าที่ท้าทาย ให้อำนาจตัดสินใจหน้างาน และให้ฟีดแบ็กสั้น ๆ ตรง ๆ',
      'Works well when your manager sets a stretching target, gives you authority on the ground, and keeps feedback short and direct.',
    ),
    workHabits: tt(
      'ชอบอยู่หน้างานมากกว่าหน้าจอ เช็กตัวเลขสำคัญทุกวัน และตัดสินใจระหว่างวันโดยไม่ต้องรอประชุม',
      'Prefers being on site to sitting at a screen, checks the key numbers daily, and makes calls during the day without waiting for a meeting.',
    ),
    careers: ['Sales & Partnerships', 'Operations', 'Retail & Branch Management', 'Business Development'],
    workWithMe: tt('บอกเป้าตรง ๆ ให้อำนาจฉันตัดสินใจ แล้วฉันจะพาทีมไปถึง', 'Tell me the target straight, give me the authority, and I’ll get the team there.'),
    friends: tt('ในแก๊งเพื่อน คุณเป็นคนจัดการเมื่อต้องตัดสินใจไว เช่น จองร้าน เลือกเส้นทาง หรือแก้ปัญหาตอนเที่ยว', 'With friends you take charge when quick decisions are needed, like booking, picking a route or sorting problems on a trip.'),
    family: tt('ในครอบครัว คุณมักเป็นคนลงมือเมื่อมีเรื่องด่วน เช่น พาใครไปหาหมอ หรือจัดการเรื่องที่ค้างอยู่', 'In the family you’re often the one who acts when something urgent happens, like taking someone to the doctor or sorting out a pending issue.'),
    social: tt('ในปาร์ตี้หรืองานเลี้ยงบริษัท คุณชอบเกมและการแข่งขันสนุก ๆ และมักเป็นคนพาบรรยากาศ', 'At parties or company events you like games and friendly competition, and often set the mood.'),
    partner: tt('กับคู่ชีวิต คุณชอบทำกิจกรรมด้วยกันแบบได้ลงมือจริง และชอบคุยกันตรง ๆ ไม่ต้องอ้อม', 'With a partner you like doing active things together and prefer talking plainly.'),
    look: { hair: 'bob', hairColor: BLACK, skin: DEEP },
  },
  {
    key: 'ESLC',
    group: 'ES',
    name: tt('ผู้บริหารงาน', 'The Director'),
    tagline: tt('จัดคน จัดแผน แล้วคุมงานใหญ่ให้เดินตามที่ตั้งใจ', 'Organised leaders who line up people and plans so big work runs as intended'),
    prop: 'clipboard',
    overview: tt(
      'คุณชอบทำงานกับคนและชอบวิธีที่พิสูจน์แล้วว่าได้ผล คุณนำด้วยแผนที่ชัด แบ่งงานให้ถูกคน และติดตามอย่างสม่ำเสมอ เพื่อให้งานใหญ่เสร็จตามเวลาและมาตรฐาน',
      'You like working with people and with methods that are proven to work. You lead with a clear plan, give each task to the right person, and follow up steadily so big work lands on time and to standard.',
    ),
    strengths: [
      tt('แบ่งงานใหญ่ให้เป็นขั้นตอนและเจ้าของที่ชัด', 'Breaks big work into steps with clear owners'),
      tt('ติดตามงานได้สม่ำเสมอโดยไม่หลุด', 'Follows up steadily so nothing drops'),
      tt('คิดเผื่อความเสี่ยงก่อนเริ่ม', 'Thinks through risks before starting'),
      tt('ทำให้คนหลายฝ่ายทำงานไปทางเดียวกัน', 'Gets many people working in the same direction'),
    ],
    watchouts: [
      tt('เมื่อยึดแผนมาก การปรับเมื่อสถานการณ์เปลี่ยนอาจช้า', 'When holding to the plan, adjusting to change can be slow'),
      tt('เมื่อติดตามใกล้ชิดมาก บางคนอาจรู้สึกว่าไม่ได้รับความไว้ใจ', 'When following up closely, some may feel less trusted'),
      tt('เมื่อเน้นขั้นตอนมาก ไอเดียใหม่อาจไม่ค่อยได้ลอง', 'When focused on process, new ideas may not get tried'),
    ],
    inTeam: tt(
      'ในทีมไทย คุณเข้าใจลำดับอาวุโสและรู้ว่าต้องขอความเห็นใครก่อน ทำให้แผนของคุณผ่านง่าย ทีมรู้สึกมั่นใจเพราะรู้ว่าใครต้องทำอะไร ลองเปิดช่องให้น้อง ๆ เสนอวิธีอื่นบ้าง เพราะเขาอาจเกรงใจไม่กล้าพูดเอง',
      'In a Thai team you understand seniority and know whose view to seek first, so your plans go through smoothly. People feel secure because roles are clear. Leave room for juniors to suggest other ways, since kreng jai may keep them from offering.',
    ),
    withManager: tt(
      'ได้ผลดีเมื่อหัวหน้าให้ขอบเขตงานและทรัพยากรชัด ๆ ให้คุณดูแลทีมหรือโครงการทั้งชิ้น และนัดอัปเดตเป็นรอบ',
      'Works well when your manager sets a clear scope and resources, lets you run a whole team or project, and agrees regular check-ins.',
    ),
    workHabits: tt(
      'ชอบมีแผนงานและตารางติดตามที่ทุกคนเห็น นัดประชุมสั้นเป็นประจำ และวางแผนสำรองไว้เสมอ',
      'Likes a plan and a tracker everyone can see, holds short regular meetings, and always has a backup plan.',
    ),
    careers: ['Project', 'Operations', 'Team Leadership', 'Administration'],
    workWithMe: tt('ตกลงเป้าและขอบเขตกับฉันให้ชัด แล้วฉันจะคุมงานให้เดินตามแผน', 'Agree the goal and scope with me clearly, and I’ll keep the work on plan.'),
    friends: tt('ในแก๊งเพื่อน คุณคือคนที่ทำให้ทริปเกิดขึ้นจริง มีตาราง มีงบ และมีคนรับผิดชอบแต่ละเรื่อง', 'With friends you’re the one who makes the trip real, with a schedule, a budget and someone in charge of each part.'),
    family: tt('ในครอบครัว คุณมักดูแลงานใหญ่ของบ้าน เช่น งานบวช งานแต่ง หรือการย้ายบ้าน ให้เป็นไปตามแผน', 'In the family you often run the big occasions, like an ordination, a wedding or a move, so they go to plan.'),
    social: tt('ในงานสังคม คุณมักถูกขอให้ช่วยจัดหรือเป็นเจ้าภาพ และสบายใจเมื่อทุกอย่างเป็นไปตามกำหนด', 'At social events you’re often asked to help organise or host, and feel at ease when everything runs to schedule.'),
    partner: tt('กับคู่ชีวิต คุณชอบตกลงแผนชีวิตร่วมกันให้ชัด และแสดงความใส่ใจผ่านการดูแลให้เรื่องต่าง ๆ เรียบร้อย', 'With a partner you like agreeing life plans clearly, and show care by making sure things are taken care of.'),
    look: { hair: 'side', hairColor: GREY, skin: LIGHT, glasses: true },
  },
  {
    key: 'ESBQ',
    group: 'ES',
    name: tt('นักแก้ปัญหาหน้างาน', 'The Fixer'),
    tagline: tt('เห็นปัญหาตรงไหนก็เข้าไปช่วยแก้ทันที', 'Quick helpers who jump in wherever something needs fixing'),
    prop: 'wrench',
    overview: tt(
      'คุณชอบอยู่กับคนและชอบงานที่จับต้องได้ เมื่อมีอะไรติดขัด คุณเข้าไปช่วยแก้ทันทีด้วยวิธีที่ใช้ได้จริง คุณไม่ต้องเป็นหัวหน้า แต่เป็นคนที่ทีมเรียกหาเมื่อต้องการให้เรื่องจบ',
      'You like being around people and work you can get your hands on. When something gets stuck, you jump in with a practical fix. You don’t need to be in charge; you’re the one the team calls when they need it sorted.',
    ),
    strengths: [
      tt('แก้ปัญหาเฉพาะหน้าได้ไวและใช้ได้จริง', 'Solves on-the-spot problems quickly and practically'),
      tt('อ่านสถานการณ์และคนตรงหน้าได้ดี', 'Reads the situation and the people in it'),
      tt('ยืดหยุ่น พร้อมช่วยงานหลายแบบ', 'Flexible and ready to help with many kinds of work'),
      tt('ทำให้บรรยากาศผ่อนคลายแม้ตอนวุ่น', 'Keeps the mood light even when it’s hectic'),
    ],
    watchouts: [
      tt('เมื่อแก้ไวมาก อาจแก้ที่อาการแต่ไม่ถึงต้นเหตุ', 'When fixing fast, the symptom may get solved but not the cause'),
      tt('เมื่อช่วยทุกคน งานของตัวเองอาจถูกเลื่อน', 'When helping everyone, your own work can get pushed back'),
      tt('เมื่อทำไปเลยโดยไม่บอก ทีมอาจไม่รู้ว่าเกิดอะไรขึ้น', 'When acting without telling anyone, the team may not know what happened'),
    ],
    inTeam: tt(
      'ในทีมไทย คุณคือคนที่ใครก็กล้าขอให้ช่วย เพราะคุณเป็นกันเองและไม่ถือตัว น้ำใจแบบนี้ทำให้ทีมอบอุ่น แต่ก็ทำให้คุณถูกขอบ่อยจนเกินตัว การบอกว่าตอนนี้ช่วยได้แค่ไหนไม่ได้ทำให้ใครเสียน้ำใจ',
      'In a Thai team you’re the one anyone feels comfortable asking for help, because you’re easygoing and humble. That generosity warms the team, but it can also overload you; saying how much you can help right now won’t hurt anyone.',
    ),
    withManager: tt(
      'ได้ผลดีเมื่อหัวหน้าให้อิสระในการแก้ปัญหาหน้างาน ยอมรับงานช่วยเหลือที่คุณทำ และช่วยกันเวลาให้งานหลัก',
      'Works well when your manager gives you freedom to fix things on the spot, recognises the help you give, and protects time for your main work.',
    ),
    workHabits: tt(
      'ชอบวันที่มีเรื่องให้ทำหลายแบบ ตอบข้อความไว ลงมือก่อนแล้วค่อยปรับ และจำได้ว่าเคยแก้อะไรด้วยวิธีไหน',
      'Likes varied days, replies quickly, acts first and adjusts later, and remembers what fixed what last time.',
    ),
    careers: ['Service & Support', 'Field Operations', 'Customer Success', 'Technical Support'],
    workWithMe: tt('บอกฉันว่าอะไรติดอยู่ แล้วปล่อยให้ฉันลงมือแก้', 'Tell me what’s stuck and let me get on with fixing it.'),
    friends: tt('ในแก๊งเพื่อน คุณคือคนที่โทรหาได้ทุกเมื่อเวลามีเรื่อง และไปช่วยทันทีโดยไม่ต้องขอซ้ำ', 'With friends you’re the one they can call any time, and you show up to help without being asked twice.'),
    family: tt('ในครอบครัว คุณมักเป็นคนซ่อมของ ขับรถไปรับส่ง หรือช่วยงานบ้านที่ต้องลงแรง', 'In the family you’re often the one fixing things, driving people around or doing the hands-on chores.'),
    social: tt('ในงานบุญหรืองานเลี้ยง คุณมักอยู่หลังบ้าน ช่วยยกของ ช่วยครัว และคุยสนุกไประหว่างทำ', 'At merit-making events or parties you’re often out back, carrying things, helping in the kitchen and chatting as you go.'),
    partner: tt('กับคู่ชีวิต คุณแสดงความรักผ่านการลงมือช่วย และชอบวันหยุดแบบไม่ต้องวางแผนมาก', 'With a partner you show love by doing things for them, and like days off without too much planning.'),
    look: { hair: 'short', hairColor: DARK, skin: TAN },
  },
  {
    key: 'ESBC',
    group: 'ES',
    name: tt('ผู้ดูแลใจดี', 'The Caretaker'),
    tagline: tt('ดูแลคนอย่างใส่ใจและสม่ำเสมอ จนทุกคนรู้สึกว่ามีคนดูแล', 'Steady carers who look after people so everyone feels looked after'),
    prop: 'heart',
    overview: tt(
      'คุณชอบอยู่กับคนและชอบวิธีที่รู้ว่าได้ผล คุณใส่ใจรายละเอียดของคนตรงหน้า ดูแลอย่างสม่ำเสมอ และเป็นแรงหนุนที่ทำให้ลูกค้าหรือเพื่อนร่วมงานรู้สึกอุ่นใจ',
      'You like being with people and with ways you know work. You notice the details that matter to the person in front of you, look after them consistently, and are the support that makes customers or colleagues feel at ease.',
    ),
    strengths: [
      tt('สังเกตว่าคนตรงหน้าต้องการอะไร', 'Notices what the person in front of you needs'),
      tt('ดูแลได้สม่ำเสมอ ไม่ขึ้นลงตามอารมณ์', 'Gives steady care that doesn’t swing with mood'),
      tt('จำรายละเอียดของคนได้ดี', 'Remembers personal details well'),
      tt('ทำให้คนรู้สึกปลอดภัยที่จะขอความช่วยเหลือ', 'Makes people feel safe asking for help'),
    ],
    watchouts: [
      tt('เมื่อใส่ใจคนอื่นมาก อาจลืมดูแลตัวเอง', 'When caring a lot for others, you can forget yourself'),
      tt('เมื่อไม่อยากให้ใครผิดหวัง อาจปฏิเสธไม่เป็น', 'When not wanting to disappoint, saying no gets hard'),
      tt('เมื่อชอบวิธีเดิม การเปลี่ยนระบบใหม่อาจรู้สึกหนัก', 'When attached to familiar ways, a new system can feel heavy'),
    ],
    inTeam: tt(
      'ในทีมไทย คุณคือคนที่จำวันเกิดเพื่อน ถามไถ่เมื่อใครดูเหนื่อย และทำให้ทีมรู้สึกเป็นครอบครัว น้ำใจของคุณมีค่ามาก แต่บางครั้งเกรงใจจนไม่ได้บอกว่าตัวเองก็ต้องการความช่วยเหลือ',
      'In a Thai team you remember birthdays, check in when someone looks tired, and make the team feel like family. Your care is valuable, but kreng jai can stop you from saying when you need help too.',
    ),
    withManager: tt(
      'ได้ผลดีเมื่อหัวหน้าบอกล่วงหน้าเมื่อจะมีการเปลี่ยนแปลง เห็นคุณค่าของงานดูแลคน และถามไถ่คุณบ้าง',
      'Works well when your manager gives advance notice of change, values the care work you do, and checks in on you too.',
    ),
    workHabits: tt(
      'ชอบงานที่มีขั้นตอนชัดและได้พบคนจริง ๆ ติดตามเรื่องของลูกค้าหรือเพื่อนจนจบ และเตรียมตัวก่อนพบคนสำคัญ',
      'Likes clear routines and real contact with people, follows each customer or colleague’s matter to the end, and prepares before important meetings.',
    ),
    careers: ['Service & Support', 'Customer Success', 'HR & Employee Care', 'Healthcare & Wellbeing'],
    workWithMe: tt('บอกฉันล่วงหน้าเมื่ออะไรจะเปลี่ยน แล้วฉันจะดูแลทุกคนให้ผ่านไปด้วยกัน', 'Let me know early when things will change, and I’ll help everyone through it.'),
    friends: tt('ในแก๊งเพื่อน คุณคือคนที่จำวันเกิดทุกคน ถามไถ่เมื่อเพื่อนเงียบไป และทำให้แก๊งอบอุ่น', 'With friends you remember every birthday, check in when someone goes quiet, and keep the gang warm.'),
    family: tt('ในครอบครัว คุณมักดูแลผู้ใหญ่หรือเด็ก ๆ อย่างสม่ำเสมอ และรักษาธรรมเนียมของบ้านไว้', 'In the family you often look after elders or children steadily and keep family traditions going.'),
    social: tt('ในงานบุญหรืองานแต่ง คุณชอบดูแลให้แขกได้กินได้นั่งสบาย และคุยกับญาติผู้ใหญ่ได้ดี', 'At merit-making events or weddings you like making sure guests are fed and comfortable, and you get on well with older relatives.'),
    partner: tt('กับคู่ชีวิต คุณใส่ใจเรื่องเล็ก ๆ ในชีวิตประจำวัน และอยากให้อีกฝ่ายบอกเมื่อมีอะไรในใจ', 'With a partner you pay attention to the small daily things and want them to tell you what’s on their mind.'),
    look: { hair: 'curly', hairColor: BLACK, skin: MEDIUM },
  },

  /* -------------------------------------------- IS สายเสาหลัก -------------------------------------------- */
  {
    key: 'ISLQ',
    group: 'IS',
    name: tt('ผู้คุมงาน', 'The Operator'),
    tagline: tt('คุมระบบให้เดินอย่างเงียบ ๆ และตัดสินใจไวเมื่อมีอะไรสะดุด', 'Quiet controllers who keep the system running and act fast when it stalls'),
    prop: 'gear',
    overview: tt(
      'คุณชอบความนิ่งและวิธีที่พิสูจน์แล้ว คุณรู้จักระบบงานดีจนเห็นได้ทันทีว่าอะไรผิดปกติ เมื่อมีปัญหา คุณตัดสินใจและสั่งการได้เร็ว โดยไม่ต้องพูดเยอะ',
      'You like calm and proven methods. You know the system so well you spot what’s off right away. When something goes wrong, you decide and direct quickly, without needing many words.',
    ),
    strengths: [
      tt('รู้จักระบบงานลึกจนเห็นปัญหาก่อนใคร', 'Knows the system well enough to spot problems first'),
      tt('ตัดสินใจไวเมื่อเกิดเหตุ', 'Decides fast when something happens'),
      tt('นิ่งและสั่งงานได้ชัดในช่วงกดดัน', 'Stays calm and gives clear direction under pressure'),
      tt('ทำให้งานประจำเดินได้ทุกวันไม่สะดุด', 'Keeps daily work running without a hitch'),
    ],
    watchouts: [
      tt('เมื่อตัดสินใจเร็วและเงียบ ทีมอาจไม่รู้เหตุผล', 'When deciding fast and quietly, the team may not know why'),
      tt('เมื่อเชื่อวิธีเดิมมาก อาจมองข้ามวิธีใหม่ที่ดีกว่า', 'When trusting the usual way, a better new way can get overlooked'),
      tt('เมื่อจัดการเองหมด งานอาจไปกองที่คุณคนเดียว', 'When handling everything yourself, the work can pile up on you'),
    ],
    inTeam: tt(
      'ในทีมไทย คุณอาจไม่ใช่คนพูดเก่งในวงข้าว แต่เป็นคนที่ทุกคนวางใจเมื่อระบบล่มหรือของไม่มา คนเงียบที่คุมงานได้แบบคุณมักถูกมองข้าม การสรุปสั้น ๆ ว่าแก้อะไรไปแล้วช่วยให้ทีมและหัวหน้าเห็นผลงานของคุณ',
      'In a Thai team you may not be the chattiest at lunch, but you’re who everyone trusts when the system goes down or deliveries don’t arrive. Quiet people in control like you often get overlooked; a short note on what you fixed helps the team and your manager see your work.',
    ),
    withManager: tt(
      'ได้ผลดีเมื่อหัวหน้าให้อำนาจตัดสินใจในระบบที่คุณดูแล ไม่ต้องขออนุมัติทุกเรื่อง และฟังเมื่อคุณบอกว่าระบบมีความเสี่ยง',
      'Works well when your manager gives you authority over the system you run, doesn’t require sign-off on every step, and listens when you flag a risk.',
    ),
    workHabits: tt(
      'ชอบเช็กสถานะงานเป็นรอบ มีขั้นตอนรับมือเหตุไว้ในหัว และแก้เรื่องด่วนก่อนแล้วค่อยบันทึก',
      'Likes checking status at set times, keeps response steps in mind, and fixes urgent things first, then writes them up.',
    ),
    careers: ['Operations', 'Supply Chain & Logistics', 'IT Operations', 'Production & Facilities'],
    workWithMe: tt('ให้ฉันดูแลระบบเต็มที่ แล้วฟังเมื่อฉันบอกว่ามีอะไรผิดปกติ', 'Let me own the system, and listen when I tell you something is off.'),
    friends: tt('ในแก๊งเพื่อน คุณอาจไม่ใช่คนพูดเยอะ แต่พอมีปัญหาตอนเที่ยว คุณคือคนที่จัดการได้อย่างนิ่ง ๆ', 'With friends you may not talk the most, but when a trip hits a snag you’re the one who calmly handles it.'),
    family: tt('ในครอบครัว คุณดูแลให้เรื่องประจำของบ้านเดินได้ เช่น ค่าน้ำค่าไฟ งานซ่อม และตัดสินใจเร็วเมื่อมีเหตุ', 'In the family you keep the household routines running, like bills and repairs, and decide fast when something happens.'),
    social: tt('ในงานเลี้ยงบริษัท คุณชอบอยู่กับคนที่รู้จัก และชอบช่วยดูเรื่องเครื่องเสียงหรือการเดินทางมากกว่าขึ้นเวที', 'At company parties you stay with people you know, and would rather help with the sound or the transport than go on stage.'),
    partner: tt('กับคู่ชีวิต คุณแสดงความรักผ่านการทำให้ชีวิตประจำวันราบรื่น และชอบเวลาที่ได้อยู่ด้วยกันเงียบ ๆ', 'With a partner you show love by keeping daily life smooth, and like quiet time together.'),
    look: { hair: 'bun', hairColor: BLACK, skin: LIGHT },
  },
  {
    key: 'ISLC',
    group: 'IS',
    name: tt('ผู้รักษามาตรฐาน', 'The Guardian'),
    tagline: tt('ตั้งมาตรฐานให้ชัด แล้วดูแลให้ทุกคนทำได้ตามนั้น', 'Steady standard-setters who make sure the bar is clear and kept'),
    prop: 'shield',
    overview: tt(
      'คุณชอบความแม่นยำและวิธีที่พิสูจน์แล้ว คุณตรวจอย่างรอบคอบ และกล้ายืนยันมาตรฐานแม้จะถูกเร่ง คุณนำทีมด้วยการทำให้รู้ชัดว่าอะไรคือ ดีพอ',
      'You value accuracy and proven methods. You check carefully and hold the standard even when rushed. You lead the team by making it clear what “good enough” means.',
    ),
    strengths: [
      tt('เห็นความเสี่ยงและจุดผิดพลาดก่อนเกิดปัญหา', 'Spots risks and errors before they become problems'),
      tt('ตั้งมาตรฐานที่ชัดและทำได้จริง', 'Sets clear, workable standards'),
      tt('ยืนหยัดเรื่องคุณภาพแม้ถูกเร่ง', 'Holds on quality even under time pressure'),
      tt('ทำให้งานตรวจสอบย้อนหลังได้', 'Makes work traceable and auditable'),
    ],
    watchouts: [
      tt('เมื่อเข้มเรื่องมาตรฐานมาก งานอาจดูช้าหรือแข็ง', 'When strict on standards, work can feel slow or rigid'),
      tt('เมื่อเห็นจุดผิดตลอด คนอื่นอาจรู้สึกว่าถูกจับผิด', 'When always spotting errors, others may feel picked on'),
      tt('เมื่อไม่ชอบความไม่แน่นอน การลองสิ่งใหม่อาจยาก', 'When uncertainty is uncomfortable, trying new things can be hard'),
    ],
    inTeam: tt(
      'ในทีมไทยที่มักบอกว่า ไม่เป็นไร คุณคือคนที่ช่วยให้เรื่องสำคัญไม่ถูกปล่อยผ่าน การชี้จุดผิดแบบเป็นการส่วนตัว และพูดถึงงานไม่ใช่ตัวคน ช่วยให้คนรับฟังโดยไม่รู้สึกเสียหน้า',
      'In a Thai team where “mai pen rai” comes easily, you make sure important things don’t slide. Pointing out errors privately, about the work rather than the person, helps people hear it without losing face.',
    ),
    withManager: tt(
      'ได้ผลดีเมื่อหัวหน้าให้ความสำคัญกับคุณภาพ ให้อำนาจหยุดงานที่ไม่ได้มาตรฐาน และบอกเหตุผลเมื่อต้องยอมผ่อนเกณฑ์',
      'Works well when your manager takes quality seriously, gives you authority to stop work that isn’t up to standard, and explains why when a rule has to bend.',
    ),
    workHabits: tt(
      'ชอบใช้เช็กลิสต์ ตรวจซ้ำก่อนส่ง เก็บหลักฐานไว้เป็นระบบ และอ่านเงื่อนไขให้ครบก่อนตกลง',
      'Likes checklists, double-checks before sending, keeps evidence organised, and reads all the terms before agreeing.',
    ),
    careers: ['Quality & Control', 'Compliance', 'Audit & Risk', 'Safety & Standards'],
    workWithMe: tt('บอกเกณฑ์ที่ต้องการให้ชัด แล้วไว้ใจให้ฉันดูแลให้ถึงมาตรฐาน', 'Make the standard clear and trust me to see it’s met.'),
    friends: tt('กับเพื่อน คุณเป็นเพื่อนที่รักษาคำพูด นัดแล้วมาตรงเวลา และให้คำแนะนำที่ตรงและรอบคอบ', 'You’re a friend who keeps your word, arrives on time, and gives honest, careful advice.'),
    family: tt('ในครอบครัว คุณมักดูแลเรื่องสำคัญที่ต้องถูกต้อง เช่น เอกสาร ภาษี หรือกติกาในบ้าน', 'In the family you often handle the things that must be right, like documents, taxes or house rules.'),
    social: tt('ในงานบุญหรืองานพิธี คุณใส่ใจให้ขั้นตอนและธรรมเนียมถูกต้อง และสบายใจเมื่อทุกอย่างเรียบร้อย', 'At ceremonies and merit-making you care that the steps and customs are done properly, and feel at ease when all is in order.'),
    partner: tt('กับคู่ชีวิต คุณให้ค่ากับความไว้ใจและความสม่ำเสมอ และชอบตกลงกันให้ชัดในเรื่องที่สำคัญ', 'With a partner you value trust and consistency, and like clear agreements on the things that matter.'),
    look: { hair: 'long', hairColor: DARK, skin: DEEP, glasses: true },
  },
  {
    key: 'ISBQ',
    group: 'IS',
    name: tt('ช่างฝีมือ', 'The Craftsman'),
    tagline: tt('ลงมือทำด้วยฝีมือ เงียบ ๆ แต่เสร็จไวและใช้ได้จริง', 'Quiet hands-on experts who get practical work done well and fast'),
    prop: 'hammer',
    overview: tt(
      'คุณชอบงานที่จับต้องได้และวิธีที่รู้ว่าได้ผล คุณเก่งเรื่องลงมือทำ เรียนรู้จากการทำจริง และส่งงานได้เร็ว คุณชอบเป็นมือหลักที่ทีมพึ่งได้ มากกว่าออกไปยืนข้างหน้า',
      'You like hands-on work and methods you know work. You learn by doing and deliver fast. You’d rather be the skilled pair of hands the team relies on than stand out front.',
    ),
    strengths: [
      tt('ลงมือทำงานจริงได้เร็วและแม่น', 'Gets real work done quickly and accurately'),
      tt('รู้ลึกในเครื่องมือหรือทักษะเฉพาะ', 'Knows a tool or skill in depth'),
      tt('แก้ปัญหาด้วยวิธีที่ใช้ได้ทันที', 'Solves problems with fixes that work right away'),
      tt('ไม่ต้องคุยเยอะก็ส่งงานได้', 'Delivers without needing much talk'),
    ],
    watchouts: [
      tt('เมื่อทำเองเร็วกว่า อาจไม่ค่อยสอนหรือแบ่งงานให้คนอื่น', 'When doing it yourself is faster, teaching or sharing the work can slip'),
      tt('เมื่อเงียบ ฝีมือของคุณอาจไม่ถูกมองเห็น', 'When quiet, your skill may go unseen'),
      tt('เมื่อรีบทำ เอกสารหรือการบอกต่ออาจตามไม่ทัน', 'When moving fast, documentation and handovers can lag'),
    ],
    inTeam: tt(
      'ในทีมไทย คุณคือคนที่รุ่นพี่ไว้ใจให้ทำงานยาก ๆ และรุ่นน้องมาขอดูวิธีทำ คุณอาจไม่ค่อยเล่าเรื่องผลงานตัวเองเพราะไม่อยากดูโอ้อวด ลองให้งานพูดแทน เช่น โชว์ก่อนและหลังแก้ ให้ทีมเห็น',
      'In a Thai team seniors trust you with tough jobs and juniors come to watch how you do it. You may not talk up your work for fear of seeming boastful, so let the work speak, for example by showing the before and after.',
    ),
    withManager: tt(
      'ได้ผลดีเมื่อหัวหน้าบอกผลลัพธ์ที่ต้องการแล้วปล่อยให้คุณเลือกวิธีทำ มีเครื่องมือดีให้ใช้ และเห็นคุณค่าของฝีมือ',
      'Works well when your manager states the result needed and leaves the how to you, provides good tools, and values craft.',
    ),
    workHabits: tt(
      'ชอบลงมือมากกว่าประชุม เรียนรู้จากการลองจริง และมีวิธีลัดของตัวเองที่ทำให้งานเร็วขึ้น',
      'Prefers doing to meeting, learns by trying, and has personal shortcuts that make the work faster.',
    ),
    careers: ['Engineering & Technical', 'Production & Facilities', 'IT Support', 'Maintenance'],
    workWithMe: tt('บอกฉันว่าต้องได้ผลอะไร แล้วปล่อยให้ฉันลงมือ', 'Tell me the result you need and let me get to work.'),
    friends: tt('ในแก๊งเพื่อน คุณชอบทำกิจกรรมด้วยกันมากกว่านั่งคุยนาน ๆ เช่น เล่นกีฬา ทำอาหาร หรือซ่อมของ', 'With friends you’d rather do something together than talk for hours, like sport, cooking or fixing things.'),
    family: tt('ในครอบครัว คุณเป็นคนที่ทุกคนเรียกเมื่อของเสีย และชอบสอนด้วยการทำให้ดู', 'In the family you’re who everyone calls when something breaks, and you teach by showing.'),
    social: tt('ในงานเลี้ยง คุณสบายใจเมื่อมีอะไรให้ทำ เช่น ปิ้งย่างหรือช่วยจัดสถานที่ มากกว่ายืนคุยเฉย ๆ', 'At parties you’re comfortable with something to do, like grilling or setting up, more than just standing around chatting.'),
    partner: tt('กับคู่ชีวิต คุณแสดงความใส่ใจผ่านการลงมือทำให้ มากกว่าคำพูด', 'With a partner you show care by doing things for them more than with words.'),
    look: { hair: 'cap', hairColor: DARK, skin: MEDIUM, beard: true },
  },
  {
    key: 'ISBC',
    group: 'IS',
    name: tt('ผู้จัดระบบ', 'The Organizer'),
    tagline: tt('จัดทุกอย่างให้เป็นระเบียบ เพื่อให้ทีมไม่มีอะไรหลุด', 'Careful organisers who keep everything in order so nothing slips'),
    prop: 'calendar',
    overview: tt(
      'คุณชอบความเป็นระเบียบและวิธีที่พิสูจน์แล้ว คุณเก็บรายละเอียด ตรวจอย่างรอบคอบ และดูแลงานเบื้องหลังที่ทำให้ทั้งทีมเดินได้ คนอาจไม่เห็นงานของคุณ จนกว่าวันที่คุณไม่อยู่',
      'You like order and proven methods. You keep track of the details, check carefully, and look after the background work that keeps the whole team going. People may not notice your work until the day you’re away.',
    ),
    strengths: [
      tt('จัดข้อมูลและเอกสารให้หาเจอเสมอ', 'Keeps information and documents easy to find'),
      tt('จำกำหนดส่งและรายละเอียดได้แม่น', 'Remembers deadlines and details precisely'),
      tt('ทำงานได้สม่ำเสมอและเชื่อถือได้', 'Works consistently and reliably'),
      tt('ทำให้ขั้นตอนยุ่ง ๆ กลายเป็นระบบที่ใช้ง่าย', 'Turns messy steps into an easy system'),
    ],
    watchouts: [
      tt('เมื่อแผนเปลี่ยนกะทันหัน อาจรู้สึกเครียดมาก', 'When plans change suddenly, it can feel very stressful'),
      tt('เมื่อทำทุกอย่างให้ครบ อาจรับภาระงานเบื้องหลังมากเกินไป', 'When making everything complete, background work can pile up on you'),
      tt('เมื่อเงียบ คนอื่นอาจไม่รู้ว่าคุณช่วยทีมไว้มากแค่ไหน', 'When quiet, others may not know how much you hold together'),
    ],
    inTeam: tt(
      'ในทีมไทย คุณคือคนที่ทุกคนถามว่า ไฟล์อยู่ไหน หรือ ส่งวันไหนนะ คุณมักเกรงใจไม่ปฏิเสธงานเล็ก ๆ ที่ถูกขอเพิ่ม ลองทำรายการงานเบื้องหลังที่คุณดูแลให้หัวหน้าเห็น เพื่อให้งานเหล่านี้ถูกนับเป็นผลงานจริง',
      'In a Thai team you’re who everyone asks “where’s the file?” or “when is it due?”. Kreng jai makes it hard to turn down small extra requests, so list the background work you handle for your manager so it counts as real results.',
    ),
    withManager: tt(
      'ได้ผลดีเมื่อหัวหน้าบอกล่วงหน้าเมื่อจะเปลี่ยนแผน ให้ขั้นตอนที่ชัด และเห็นคุณค่าของงานจัดระบบที่คุณทำ',
      'Works well when your manager warns you early about plan changes, gives clear steps, and values the organising work you do.',
    ),
    workHabits: tt(
      'ชอบทำรายการงานและปฏิทินให้ครบ ตั้งชื่อไฟล์เป็นระบบ เตรียมงานล่วงหน้า และตรวจก่อนส่งทุกครั้ง',
      'Likes complete to-do lists and calendars, names files systematically, prepares ahead, and checks before every send.',
    ),
    careers: ['Administration', 'Operations', 'Finance & Accounting', 'Records & Documentation'],
    workWithMe: tt('บอกฉันล่วงหน้าเมื่ออะไรจะเปลี่ยน แล้วฉันจะจัดให้ทุกอย่างเข้าที่', 'Give me notice when things change, and I’ll put everything in its place.'),
    friends: tt('ในแก๊งเพื่อน คุณคือคนที่จำได้ว่าใครติดเงินใคร นัดกันวันไหน และเก็บรูปทริปไว้ให้ทุกคน', 'With friends you remember who owes whom, when you’re meeting, and keep the trip photos for everyone.'),
    family: tt('ในครอบครัว คุณดูแลให้บ้านเป็นระเบียบ และจำนัดหมอกับวันสำคัญของทุกคนได้', 'In the family you keep the home in order and remember everyone’s appointments and special days.'),
    social: tt('ในงานแต่งหรืองานบุญ คุณชอบช่วยงานเบื้องหลัง เช่น ดูซองหรือรายชื่อแขก มากกว่าอยู่หน้างาน', 'At weddings or merit-making events you like helping behind the scenes, like the gift envelopes or guest list, more than being out front.'),
    partner: tt('กับคู่ชีวิต คุณชอบกิจวัตรที่มั่นคง และรู้สึกถูกใส่ใจเมื่ออีกฝ่ายบอกล่วงหน้าเมื่อแผนเปลี่ยน', 'With a partner you like steady routines, and feel cared for when they tell you early if plans change.'),
    look: { hair: 'spiky', hairColor: BROWN, skin: TAN, glasses: true },
  },
]

const BY_KEY = new Map(CHARACTERS.map((c) => [c.key, c]))

/** Accepts 'INBC', 'inbc' or a full code like 'INBC-HMW'; null if the first 4 letters aren't a character. */
export const characterByKey = (key: string): WorkCharacter | null => {
  const letters = key.toUpperCase().replace(/[^A-Z]/g, '')
  if (letters.length !== 4 && letters.length !== 7) return null
  return BY_KEY.get(letters.slice(0, 4)) ?? null
}

export const groupByKey = (k: GroupKey): CharacterGroup => CHARACTER_GROUPS.find((g) => g.key === k)!

/** Letters 1–4 of the person's Workfit Code. */
export const characterKeyOf = (s: Scores): string => workfitCode(s).code.slice(0, 4)

export const characterOf = (s: Scores): WorkCharacter => BY_KEY.get(characterKeyOf(s))!
