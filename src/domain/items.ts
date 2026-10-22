import { tt, type T } from '@/lib/i18n'
import type { Context, DimCode } from './types'

/* ------------------------------------------------------------------------------------------------
 * Item bank v0.2 — original wording written for the PoC (not copied from HEXACO-PI-R or IPIP),
 * Thai first with an English version of every item. Both still need expert review, back-translation
 * and a think-aloud test before the pilot.
 * ---------------------------------------------------------------------------------------------- */

type Pair = [th: string, en: string]

export const LIKERT_SCALE: T[] = [
  tt('ไม่เห็นด้วยอย่างยิ่ง', 'Strongly disagree'),
  tt('ไม่เห็นด้วย', 'Disagree'),
  tt('ไม่เห็นด้วยเล็กน้อย', 'Slightly disagree'),
  tt('เห็นด้วยเล็กน้อย', 'Slightly agree'),
  tt('เห็นด้วย', 'Agree'),
  tt('เห็นด้วยอย่างยิ่ง', 'Strongly agree'),
]

export interface LikertItem {
  id: string
  dim: DimCode
  keyed: 1 | -1
  text: T
}

export interface AttentionItem {
  id: string
  text: T
  expect: number // 1–6
}

const L = (dim: DimCode, plus: Pair[], minus: Pair[]): LikertItem[] => [
  ...plus.map(([th, en], i) => ({ id: `${dim}-p${i + 1}`, dim, keyed: 1 as const, text: tt(th, en) })),
  ...minus.map(([th, en], i) => ({ id: `${dim}-m${i + 1}`, dim, keyed: -1 as const, text: tt(th, en) })),
]

const LIKERT_BY_DIM: LikertItem[][] = [
  L(
    'H',
    [
      ['ฉันจะไม่โกหก แม้การโกหกจะทำให้ฉันได้ประโยชน์', "I wouldn't lie, even if lying would benefit me"],
      ['ฉันไม่ชอบเอาผลงานของคนอื่นมาเป็นของตัวเอง', "I don't like taking credit for other people's work"],
      ['ฉันคิดว่าตัวเองไม่ได้พิเศษกว่าคนอื่น', "I don't think I'm more special than other people"],
      ['ฉันทำตามกฎแม้จะไม่มีใครเห็น', 'I follow the rules even when no one is watching'],
    ],
    [
      ['ฉันยอมพูดเกินจริงเล็กน้อย ถ้าช่วยให้ได้งาน', "I'd exaggerate a little if it helped me get the job"],
      ['ฉันอยากมีของแบรนด์เนมเพื่อให้คนอื่นยอมรับ', 'I want branded things so others will accept me'],
      ['ฉันเอาใจคนที่มีอำนาจเพื่อประโยชน์ของตัวเอง', 'I flatter powerful people for my own benefit'],
      ['ฉันรู้สึกว่าตัวเองควรได้สิทธิพิเศษมากกว่าคนอื่น', 'I feel I deserve more privileges than others'],
    ],
  ),
  L(
    'E',
    [
      ['เมื่องานกดดัน ฉันยังใจเย็นได้', 'When work gets stressful, I stay calm'],
      ['ฉันฟื้นตัวเร็วหลังเจอเรื่องผิดหวัง', 'I bounce back quickly after disappointments'],
      ['ฉันตัดสินใจได้แม้อยู่ในสถานการณ์ที่ไม่แน่นอน', 'I can make decisions even when things are uncertain'],
      ['คำติของลูกค้าไม่ค่อยทำให้ฉันเสียสมาธิ', "Customer complaints rarely throw me off"],
    ],
    [
      ['ฉันกังวลกับเรื่องเล็ก ๆ น้อย ๆ บ่อย', 'I often worry about small things'],
      ['เวลาเครียด ฉันมักแสดงอารมณ์ให้คนอื่นเห็น', 'When stressed, I tend to show my emotions to others'],
      ['ฉันนอนไม่หลับเมื่อมีงานค้าง', "I can't sleep when work is unfinished"],
      ['ฉันรู้สึกหวั่นไหวง่ายเมื่อมีคนไม่พอใจฉัน', 'I get shaken easily when someone is unhappy with me'],
    ],
  ),
  L(
    'X',
    [
      ['ฉันมีพลังเมื่อได้อยู่กับคนเยอะ ๆ', 'I feel energised around lots of people'],
      ['ฉันเริ่มบทสนทนากับคนแปลกหน้าได้ง่าย', 'I find it easy to start conversations with strangers'],
      ['ฉันชอบเป็นคนนำเสนองานต่อหน้ากลุ่ม', 'I like presenting work in front of a group'],
      ['ฉันมักเป็นคนสร้างบรรยากาศในวงสนทนา', 'I am often the one who livens up a conversation'],
    ],
    [
      ['ฉันชอบทำงานเงียบ ๆ มากกว่าพูดคุย', 'I prefer working quietly to chatting'],
      ['หลังงานสังสรรค์ ฉันต้องการเวลาอยู่คนเดียวนาน', 'After a social event, I need a lot of time alone'],
      ['ฉันไม่ค่อยแสดงความคิดเห็นในที่ประชุมใหญ่', 'I rarely share my views in large meetings'],
      ['ฉันเหนื่อยเมื่อต้องคุยกับคนจำนวนมากทั้งวัน', 'Talking to many people all day wears me out'],
    ],
  ),
  L(
    'A',
    [
      ['ฉันให้อภัยคนอื่นได้ง่าย', 'I forgive others easily'],
      ['ฉันรับฟังความเห็นต่างได้โดยไม่หงุดหงิด', 'I can listen to different opinions without getting annoyed'],
      ['ฉันยอมถอยคนละก้าวเพื่อให้งานเดินต่อ', "I'll meet people halfway to keep work moving"],
      ['ฉันใจเย็นกับเพื่อนร่วมงานที่ทำผิดพลาด', "I'm patient with colleagues who make mistakes"],
    ],
    [
      ['ฉันจำได้นานเมื่อมีคนทำให้ฉันเสียใจ', 'I remember for a long time when someone hurts me'],
      ['ฉันหงุดหงิดเมื่อคนอื่นทำงานช้า', 'I get irritated when others work slowly'],
      ['ฉันชอบเถียงจนกว่าอีกฝ่ายจะยอม', 'I like to argue until the other side gives in'],
      ['ฉันวิจารณ์งานของคนอื่นค่อนข้างแรง', "I'm quite harsh when criticising others' work"],
    ],
  ),
  L(
    'C',
    [
      ['ฉันทำงานเสร็จก่อนกำหนดเสมอ', 'I always finish work before the deadline'],
      ['ฉันวางแผนงานล่วงหน้าเป็นขั้นตอน', 'I plan my work ahead, step by step'],
      ['ฉันตรวจงานซ้ำก่อนส่งทุกครั้ง', 'I double-check my work every time before handing it in'],
      ['ฉันจัดโต๊ะทำงานและไฟล์ให้เป็นระเบียบ', 'I keep my desk and files organised'],
    ],
    [
      ['ฉันมักเลื่อนงานยากออกไปก่อน', 'I tend to put off difficult tasks'],
      ['ฉันลืมรายละเอียดเล็ก ๆ บ่อย', 'I often forget small details'],
      ['ฉันทำงานตามอารมณ์มากกว่าตามแผน', 'I work by mood more than by plan'],
      ['ฉันมักรีบส่งงานโดยไม่ได้ตรวจทาน', 'I often rush work in without reviewing it'],
    ],
  ),
  L(
    'O',
    [
      ['ฉันสนุกกับการลองวิธีทำงานแบบใหม่', 'I enjoy trying new ways of working'],
      ['ฉันชอบติดตามเทรนด์แฟชั่น ศิลปะ หรือการออกแบบ', 'I like following trends in fashion, art or design'],
      ['ฉันมักมีไอเดียแปลกใหม่ในการแก้ปัญหา', 'I often come up with unusual ideas to solve problems'],
      ['ฉันชอบเรียนรู้เรื่องที่ไม่เกี่ยวกับงานตัวเอง', 'I like learning about things outside my own job'],
    ],
    [
      ['ฉันชอบทำแบบเดิมที่รู้ว่าได้ผล', 'I prefer doing things the way I know works'],
      ['ฉันไม่ค่อยสนใจงานศิลปะหรือความสวยงาม', "I'm not very interested in art or aesthetics"],
      ['ไอเดียที่แหวกแนวมากทำให้ฉันไม่สบายใจ', 'Very unconventional ideas make me uncomfortable'],
      ['ฉันไม่ชอบคิดเรื่องนามธรรมหรือทฤษฎี', "I don't like thinking about abstract ideas or theory"],
    ],
  ),
]

export const ATTENTION_ITEMS: AttentionItem[] = [
  { id: 'att-1', text: tt('ข้อนี้ใช้ตรวจความตั้งใจ กรุณาเลือก “เห็นด้วยเล็กน้อย”', 'This is an attention check. Please choose “Slightly agree”.'), expect: 4 },
  { id: 'att-2', text: tt('ข้อนี้ใช้ตรวจความตั้งใจ กรุณาเลือก “ไม่เห็นด้วยอย่างยิ่ง”', 'This is an attention check. Please choose “Strongly disagree”.'), expect: 1 },
]

/** Interleave dimensions so no page is all one trait, then drop attention checks in. */
const interleave = <X,>(groups: X[][]): X[] => {
  const out: X[] = []
  const max = Math.max(...groups.map((g) => g.length))
  // Alternate plus/minus order per round so keyed directions mix on every page.
  for (let i = 0; i < max; i++) {
    const idx = i % 2 === 0 ? i / 2 : 4 + (i - 1) / 2
    for (const g of groups) {
      const item = g.at(idx)
      if (item) out.push(item)
    }
  }
  return out
}

export const LIKERT_ITEMS: LikertItem[] = interleave(LIKERT_BY_DIM)

export type LikertEntry = { kind: 'likert'; item: LikertItem } | { kind: 'attention'; item: AttentionItem }

export const LIKERT_SEQUENCE: LikertEntry[] = (() => {
  const seq: LikertEntry[] = LIKERT_ITEMS.map((item) => ({ kind: 'likert', item }))
  seq.splice(17, 0, { kind: 'attention', item: ATTENTION_ITEMS[0] })
  seq.splice(39, 0, { kind: 'attention', item: ATTENTION_ITEMS[1] })
  return seq
})()

/* ---------------------------------------- Forced choice ---------------------------------------- */

export interface Statement {
  id: string
  dim: DimCode
  keyed: 1 | -1
  text: T
}

const S = (dim: DimCode, plus: Pair[], minus: Pair[]): Statement[] => [
  ...plus.map(([th, en], i) => ({ id: `${dim}-s${i + 1}`, dim, keyed: 1 as const, text: tt(th, en) })),
  ...minus.map(([th, en], i) => ({ id: `${dim}-r${i + 1}`, dim, keyed: -1 as const, text: tt(th, en) })),
]

export const STATEMENTS: Statement[] = [
  ...S(
    'KJ',
    [
      ['ถ้าไม่เห็นด้วยกับหัวหน้า ฉันมักเก็บไว้ไม่พูด', 'If I disagree with my boss, I usually keep it to myself'],
      ['ฉันไม่อยากรบกวนคนอื่น แม้จะต้องการความช่วยเหลือ', "I don't want to bother others, even when I need help"],
      ['ฉันมักตอบรับงานเพิ่ม แม้จะยุ่งอยู่แล้ว', 'I usually accept extra work, even when I am already busy'],
    ],
    [
      ['ฉันพูดความเห็นตรง ๆ แม้หัวหน้าอาจไม่เห็นด้วย', 'I say what I think, even if my boss may disagree'],
      ['ถ้างานไม่ไหว ฉันปฏิเสธได้โดยไม่รู้สึกผิด', "If I can't take on more, I can say no without feeling guilty"],
      ['ฉันกล้าทักท้วงเมื่อเห็นรุ่นพี่ทำผิดขั้นตอน', 'I speak up when I see a senior colleague skip a step'],
    ],
  ),
  ...S(
    'SN',
    [
      ['ฉันสบายใจเมื่อรู้ชัดว่าใครเป็นผู้ใหญ่ในทีม', "I feel comfortable knowing clearly who's senior in the team"],
      ['ฉันคิดว่าการตัดสินใจสำคัญควรมาจากคนที่อาวุโสกว่า', 'I think important decisions should come from more senior people'],
      ['ฉันให้ความสำคัญกับการเคารพรุ่นพี่ในที่ทำงาน', 'Showing respect to senior colleagues matters to me'],
    ],
    [
      ['ฉันชอบทีมที่ทุกคนเสนอความเห็นได้เท่ากัน ไม่ว่าอายุงานเท่าไร', 'I like teams where everyone has an equal say, whatever their seniority'],
      ['ฉันคุยกับหัวหน้าแบบเป็นกันเองได้อย่างสบายใจ', "I'm comfortable talking to my boss casually"],
    ],
  ),
  ...S(
    'FC',
    [
      ['ฉันไม่อยากถูกตำหนิต่อหน้าคนอื่น', "I don't want to be criticised in front of others"],
      ['ฉันระวังคำพูดเพื่อไม่ให้ใครเสียหน้า', 'I choose my words carefully so no one loses face'],
      ['ฉันมักคุยเรื่องปัญหาแบบส่วนตัวมากกว่าในที่ประชุม', 'I prefer to raise problems privately rather than in meetings'],
    ],
    [
      ['ฉันรับคำติตรง ๆ ต่อหน้าทีมได้โดยไม่รู้สึกแย่', 'I can take direct criticism in front of the team without feeling bad'],
      ['ฉันคิดว่าการชี้ข้อผิดพลาดในที่ประชุมช่วยให้ทีมเรียนรู้เร็ว', 'Pointing out mistakes in meetings helps the team learn faster'],
    ],
  ),
  ...S(
    'SK',
    [
      ['ฉันทำงานได้ดีที่สุดเมื่อทีมมีบรรยากาศสนุก', 'I do my best work when the team has a fun atmosphere'],
      ['ฉันชอบมีกิจกรรมกินข้าวหรือสังสรรค์กับทีม', 'I like team meals and social activities'],
      ['ฉันชอบแทรกมุกตลกระหว่างทำงาน', 'I like slipping jokes into the working day'],
    ],
    [
      ['ฉันชอบที่ทำงานที่เงียบและโฟกัสงานล้วน ๆ', 'I like a quiet workplace focused purely on the work'],
      ['สำหรับฉัน งานที่มีความหมายสำคัญกว่าบรรยากาศสนุก', 'For me, meaningful work matters more than a fun atmosphere'],
    ],
  ),
  ...S(
    'MP',
    [
      ['แผนเปลี่ยนกะทันหันก็ไม่เป็นไรสำหรับฉัน', "A sudden change of plan is fine with me"],
      ['ฉันโอเคกับงานที่ยังไม่ชัด 100% แล้วค่อยปรับไป', "I'm OK starting work that isn't 100% clear and adjusting as I go"],
      ['ฉันไม่ซีเรียสถ้างานออกมาดีพอ แม้ไม่สมบูรณ์แบบ', "I don't mind if work is good enough, even if not perfect"],
    ],
    [
      ['ฉันอยากให้ทุกอย่างถูกต้องตามที่ตกลงไว้เป๊ะ ๆ', 'I want everything to be exactly as agreed'],
      ['ฉันหงุดหงิดเมื่อคนอื่นไม่ตรงเวลา', 'I get annoyed when others are not on time'],
      ['ฉันตรวจตัวเลขซ้ำจนแน่ใจว่าไม่ผิดแม้แต่จุดเดียว', "I recheck numbers until I'm sure there isn't a single error"],
    ],
  ),
  ...S(
    'BK',
    [
      ['ฉันจะอยู่กับหัวหน้าที่เคยช่วยฉัน แม้งานจะหนัก', "I'd stay with a boss who once helped me, even if the work is hard"],
      ['ฉันพร้อมช่วยคนที่เคยมีบุญคุณกับฉันเสมอ', "I'm always ready to help people who have done me a favour"],
      ['ความสัมพันธ์ที่ดีในทีมสำคัญกว่าเงินเดือนที่สูงขึ้นเล็กน้อย', 'Good relationships in the team matter more than slightly higher pay'],
    ],
    [
      ['ฉันตัดสินใจตามกฎและความยุติธรรม แม้จะขัดใจคนสนิท', 'I decide by rules and fairness, even if it upsets people close to me'],
      ['ถ้าได้โอกาสที่ดีกว่า ฉันพร้อมย้ายทีมแม้จะผูกพันกับคนเดิม', "If a better opportunity comes, I'll move teams even if I'm attached to my colleagues"],
    ],
  ),
  ...S(
    'LD',
    [
      ['เมื่อทีมไม่มีใครตัดสินใจ ฉันมักเป็นคนก้าวออกมานำ', "When no one in the team decides, I'm usually the one who steps up"],
      ['ฉันชอบรับผิดชอบผลลัพธ์ของทั้งทีม', 'I like being responsible for the whole team’s results'],
      ['ฉันชอบมอบหมายงานและติดตามความคืบหน้า', 'I like delegating tasks and following up on progress'],
    ],
    [
      ['ฉันชอบเป็นคนสนับสนุนให้คนอื่นนำได้สำเร็จ', 'I like supporting others so they can lead successfully'],
      ['ฉันทำงานได้ดีที่สุดเมื่อมีคนกำหนดทิศทางให้', 'I work best when someone else sets the direction'],
      ['ฉันชอบเชี่ยวชาญงานของตัวเองมากกว่าดูแลคนอื่น', "I'd rather master my own work than manage others"],
    ],
  ),
  ...S(
    'PC',
    [
      ['ฉันชอบลงมือทำก่อนแล้วค่อยปรับระหว่างทาง', 'I like to start doing and adjust along the way'],
      ['ฉันตัดสินใจได้เร็วแม้ข้อมูลยังไม่ครบ', 'I can decide quickly even without all the information'],
      ['ฉันทำงานหลายอย่างพร้อมกันได้ดี', "I'm good at juggling several tasks at once"],
    ],
    [
      ['ฉันชอบคิดให้รอบคอบก่อนลงมือ', 'I like to think things through before acting'],
      ['ฉันขอเวลาตรวจสอบข้อมูลก่อนตัดสินใจเสมอ', 'I always ask for time to check the facts before deciding'],
      ['ฉันชอบทำงานทีละอย่างให้เสร็จอย่างละเอียด', 'I like finishing one task thoroughly at a time'],
    ],
  ),
  ...S(
    'CO',
    [
      ['ฉันคิดงานได้ดีขึ้นเมื่อได้ระดมความคิดกับคนอื่น', 'I think better when brainstorming with others'],
      ['ฉันชอบงานที่ต้องประสานกับหลายแผนก', 'I like work that involves coordinating with many departments'],
      ['ฉันชอบอัปเดตความคืบหน้าให้ทีมรู้ตลอด', 'I like keeping the team updated on my progress'],
    ],
    [
      ['ฉันทำงานได้ดีที่สุดเมื่อได้ทำคนเดียวเงียบ ๆ', 'I work best alone and in quiet'],
      ['ฉันชอบรับผิดชอบงานของตัวเองให้จบโดยไม่ต้องพึ่งใคร', 'I like to own my work end to end without relying on anyone'],
    ],
  ),
  ...S(
    'ST',
    [
      ['ฉันชอบมีขั้นตอนที่ชัดเจนก่อนเริ่มงาน', 'I like having clear steps before I start'],
      ['ฉันอยากรู้ชัดว่าหัวหน้าคาดหวังอะไรจากฉัน', 'I want to know clearly what my boss expects of me'],
      ['ฉันชอบมีเช็กลิสต์หรือคู่มือให้ทำตาม', 'I like having a checklist or manual to follow'],
    ],
    [
      ['ฉันชอบให้หัวหน้าบอกแค่เป้าหมาย แล้วปล่อยให้ฉันหาวิธีเอง', 'I prefer my boss to set the goal and let me find the way'],
      ['กฎที่มากเกินไปทำให้ฉันทำงานได้ไม่ดี', "Too many rules stop me from doing good work"],
      ['ฉันชอบออกแบบวิธีทำงานของตัวเอง', 'I like designing my own way of working'],
    ],
  ),
  ...S(
    'CH',
    [
      ['ฉันตื่นเต้นเมื่อบริษัทมีการเปลี่ยนแปลงครั้งใหญ่', 'I get excited when the company goes through big changes'],
      ['ฉันชอบงานที่ไม่ซ้ำเดิมในแต่ละวัน', 'I like work that is different every day'],
      ['ฉันอาสาเป็นคนแรกที่ลองระบบใหม่', 'I volunteer to be the first to try a new system'],
    ],
    [
      ['ฉันชอบงานที่มั่นคงและคาดเดาได้', 'I like stable, predictable work'],
      ['ฉันชอบให้การเปลี่ยนแปลงเกิดขึ้นทีละน้อย', 'I prefer change to happen gradually'],
    ],
  ),
  ...S(
    'PR',
    [
      ['ฉันนำเสนอผลงานของตัวเองให้หัวหน้าเห็นได้อย่างมั่นใจ', 'I confidently show my boss what I have achieved'],
      ['ฉันโน้มน้าวให้คนอื่นเห็นด้วยกับไอเดียของฉันได้ดี', "I'm good at persuading others to back my ideas"],
      ['ในการสัมภาษณ์งาน ฉันมักทำให้คนประทับใจได้ง่าย', 'In job interviews I usually make a strong impression'],
    ],
    [
      ['ฉันปล่อยให้ผลงานพูดแทนตัวเอง มากกว่าออกไปพูดเอง', 'I let my work speak for me rather than talking it up'],
      ['ฉันไม่ค่อยมั่นใจเวลาต้องขายไอเดียของตัวเอง', "I'm not very confident selling my own ideas"],
      ['ฉันรู้สึกอึดอัดเมื่อต้องพูดถึงความสำเร็จของตัวเอง', 'I feel awkward talking about my own achievements'],
    ],
  ),
]

export interface ForcedBlock {
  id: string
  statements: [Statement, Statement, Statement]
}

/**
 * Deterministically packs the statements into blocks of 3 with 3 different dimensions each:
 * always draw from the 3 dimensions with the most statements left, so no dimension is stranded.
 */
export const FORCED_BLOCKS: ForcedBlock[] = (() => {
  const queues = new Map<DimCode, Statement[]>()
  for (const s of STATEMENTS) queues.set(s.dim, [...(queues.get(s.dim) ?? []), s])
  // Put the reverse-keyed statements at alternating positions so a block mixes directions.
  for (const [dim, list] of queues) {
    const plus = list.filter((s) => s.keyed === 1)
    const minus = list.filter((s) => s.keyed === -1)
    const mixed: Statement[] = []
    while (plus.length || minus.length) {
      const a = plus.shift()
      if (a) mixed.push(a)
      const b = minus.shift()
      if (b) mixed.push(b)
    }
    queues.set(dim, mixed)
  }
  const order = [...queues.keys()]
  const blocks: ForcedBlock[] = []
  for (let n = 1; ; n++) {
    const ranked = order
      .filter((d) => (queues.get(d)?.length ?? 0) > 0)
      .sort((a, b) => (queues.get(b)?.length ?? 0) - (queues.get(a)?.length ?? 0) || order.indexOf(a) - order.indexOf(b))
    if (ranked.length < 3) break
    // Rotate the start so consecutive blocks don't always pair the same three dimensions.
    const pick = ranked.slice(0, 3)
    const trio = pick.map((d) => queues.get(d)?.shift()) as Statement[]
    const rot = n % 3
    blocks.push({ id: `fc-${n}`, statements: [...trio.slice(rot), ...trio.slice(0, rot)] as ForcedBlock['statements'] })
    order.push(order.shift() as DimCode)
  }
  return blocks
})()

/* ------------------------------------------- Scenarios ----------------------------------------- */

export interface ScenarioOption {
  id: string
  text: T
  behaviour: T // short label used in the context-shift summary
  effects: Partial<Record<DimCode, number>>
}

export interface Scenario {
  id: string
  context: Context
  text: T
  options: [ScenarioOption, ScenarioOption, ScenarioOption, ScenarioOption]
}

const opt = (id: string, text: Pair, behaviour: Pair, effects: ScenarioOption['effects']): ScenarioOption => ({
  id,
  text: tt(...text),
  behaviour: tt(...behaviour),
  effects,
})

export const CONTEXTS: { id: Context; th: string; en: string }[] = [
  { id: 'pressure', th: 'เมื่อเจอแรงกดดัน', en: 'Under pressure' },
  { id: 'senior', th: 'เมื่ออยู่กับผู้ใหญ่', en: 'With seniors' },
  { id: 'junior', th: 'เมื่อดูแลน้อง ๆ', en: 'With juniors' },
  { id: 'customer', th: 'เมื่ออยู่กับลูกค้า', en: 'With customers' },
]

export const SCENARIOS: Scenario[] = [
  {
    id: 'sc-1',
    context: 'pressure',
    text: tt('บ่ายวันศุกร์ ลูกค้า VIP ขอแก้งานด่วนที่ต้องส่งวันจันทร์ ขณะที่ทีมกำลังจะกลับบ้าน', 'Friday afternoon: a VIP client asks for urgent changes due Monday, just as the team is leaving'),
    options: [
      opt('a', ['รับงาน แล้วแบ่งงานให้ทีมทันที', 'Accept and split the work across the team right away'], ['นำทีมลุยทันที', 'Leads the team straight in'], { LD: 1, PC: 1 }),
      opt('b', ['ทำเองคนเดียวช่วงเสาร์–อาทิตย์ ไม่อยากรบกวนใคร', "Do it alone over the weekend so as not to bother anyone"], ['แบกงานไว้คนเดียว', 'Carries the load alone'], { KJ: 1, CO: -1 }),
      opt('c', ['ขอเวลาเช็กรายละเอียดกับลูกค้าก่อนรับปาก', 'Ask the client for time to check details before committing'], ['ชะลอเพื่อเช็กให้ชัด', 'Slows down to get it clear'], { PC: -1, MP: -1 }),
      opt('d', ['ชวนทีมสั่งข้าวมาช่วยกันทำแบบสนุก ๆ', 'Order food and turn it into a fun team push'], ['ใช้บรรยากาศทีมฝ่าแรงกดดัน', 'Uses team spirit to push through'], { SK: 1, CO: 1 }),
    ],
  },
  {
    id: 'sc-2',
    context: 'pressure',
    text: tt('ระบบ POS ล่มกลางงานเซลใหญ่ ลูกค้าต่อคิวยาวจนถึงหน้าร้าน', 'The checkout system crashes in the middle of a big sale, with a queue out the door'),
    options: [
      opt('a', ['สั่งการทันทีว่าใครทำอะไร', 'Immediately tell everyone who does what'], ['สั่งการชัดเจนทันที', 'Gives clear orders at once'], { LD: 1, PC: 1 }),
      opt('b', ['ทำตามขั้นตอนฉุกเฉินในคู่มือทีละข้อ', 'Follow the emergency procedure in the manual step by step'], ['ยึดขั้นตอนเคร่งครัด', 'Sticks strictly to procedure'], { ST: 1, MP: -1 }),
      opt('c', ['คิดวิธีเฉพาะหน้า เช่น จดออเดอร์ด้วยมือ', 'Improvise, for example take orders by hand'], ['ด้นสดหาวิธีใหม่', 'Improvises a new way'], { CH: 1, ST: -1 }),
      opt('d', ['ขอโทษลูกค้าและช่วยให้ทุกคนใจเย็นลงก่อน', 'Apologise to customers and calm everyone down first'], ['ดูแลความรู้สึกคนก่อน', 'Takes care of feelings first'], { A: 1, SK: 1 }),
    ],
  },
  {
    id: 'sc-3',
    context: 'pressure',
    text: tt('ยอดขายเดือนนี้ยังขาดเป้า 30% และเหลือเวลาอีก 1 สัปดาห์', "This month's sales are 30% below target with one week left"),
    options: [
      opt('a', ['วางแผนรายวันละเอียดและติดตามทุกวัน', 'Make a detailed daily plan and track it every day'], ['วางแผนละเอียดและติดตาม', 'Plans in detail and tracks'], { ST: 1, C: 1 }),
      opt('b', ['ลงไปขายเองเต็มที่เป็นตัวอย่าง', 'Get out and sell hard yourself to set an example'], ['ลงสนามเองเต็มที่', 'Goes all in personally'], { PC: 1, X: 1 }),
      opt('c', ['ยอมรับว่าอาจไม่ถึง และโฟกัสสิ่งที่ทำได้', 'Accept it may not happen and focus on what you can do'], ['ปล่อยวางและโฟกัสที่ทำได้', 'Lets go and focuses on what is possible'], { MP: 1, E: 1 }),
      opt('d', ['ลองโปรโมชันหรือวิธีขายแบบใหม่', 'Try a new promotion or a new way of selling'], ['ลองวิธีใหม่', 'Tries something new'], { O: 1, CH: 1 }),
    ],
  },
  {
    id: 'sc-4',
    context: 'senior',
    text: tt('ผู้บริหารนำเสนอแผนในที่ประชุม และคุณเห็นจุดผิดพลาดชัดเจน', 'A senior executive presents a plan in a meeting, and you can see a clear mistake'),
    options: [
      opt('a', ['ยกมือทักท้วงในที่ประชุมทันที', 'Raise your hand and point it out in the meeting'], ['ทักท้วงตรง ๆ ต่อหน้า', 'Challenges openly'], { KJ: -1, FC: -1 }),
      opt('b', ['รอคุยกับท่านเป็นการส่วนตัวหลังประชุม', 'Wait and raise it privately after the meeting'], ['คุยส่วนตัวภายหลัง', 'Raises it privately later'], { FC: 1 }),
      opt('c', ['ไม่พูดอะไร เพราะท่านอาวุโสกว่าคงคิดมาแล้ว', "Say nothing; they're senior and must have thought it through"], ['เงียบและเชื่อผู้ใหญ่', 'Stays silent and trusts seniors'], { KJ: 1, SN: 1 }),
      opt('d', ['ส่งข้อมูลประกอบทางอีเมลให้ท่านพิจารณา', 'Send supporting data by email for them to consider'], ['ส่งข้อมูลเป็นลายลักษณ์อักษร', 'Puts it in writing'], { ST: 1, C: 1 }),
    ],
  },
  {
    id: 'sc-5',
    context: 'senior',
    text: tt('หัวหน้ามอบงานด่วนเพิ่ม ทั้งที่งานเดิมของคุณก็ล้นมือแล้ว', 'Your boss hands you more urgent work, though you are already overloaded'),
    options: [
      opt('a', ['รับไว้ก่อน แล้วพยายามทำให้ได้', 'Accept it and try your best to manage'], ['รับไว้ไม่ปฏิเสธ', "Accepts, won't refuse"], { KJ: 1, BK: 1 }),
      opt('b', ['บอกตรง ๆ ว่างานล้น และขอให้ช่วยเลือกลำดับความสำคัญ', 'Say plainly you are overloaded and ask them to set priorities'], ['ต่อรองลำดับความสำคัญ', 'Negotiates priorities'], { KJ: -1, ST: 1 }),
      opt('c', ['รับแล้วขอให้เพื่อนในทีมช่วย', 'Accept it and ask teammates for help'], ['ขอแรงทีม', 'Asks the team for help'], { CO: 1 }),
      opt('d', ['รับแล้วทำแบบเร็ว ๆ ให้พอผ่าน', 'Accept it and do it quickly, just good enough'], ['เร่งทำให้พอผ่าน', 'Rushes it to good enough'], { PC: 1, MP: 1 }),
    ],
  },
  {
    id: 'sc-6',
    context: 'senior',
    text: tt('หัวหน้าที่เคยช่วยคุณมาก กำลังย้ายไปบริษัทอื่นและชวนคุณไปด้วย', 'A boss who helped you a lot is moving to another company and invites you along'),
    options: [
      opt('a', ['ไปด้วย เพราะท่านมีบุญคุณ', 'Go with them because you owe them'], ['ตามคนที่มีบุญคุณ', 'Follows the person they owe'], { BK: 1 }),
      opt('b', ['ชั่งน้ำหนักงานและโอกาสก่อนตัดสินใจ', 'Weigh up the job and the opportunity first'], ['ชั่งน้ำหนักด้วยเหตุผล', 'Weighs it up logically'], { BK: -1, PC: -1 }),
      opt('c', ['อยู่ที่เดิม เพราะชอบความมั่นคง', 'Stay where you are because you value stability'], ['เลือกความมั่นคง', 'Chooses stability'], { CH: -1 }),
      opt('d', ['ปรึกษาครอบครัวและผู้ใหญ่ที่นับถือก่อน', 'Talk to family and respected elders first'], ['ปรึกษาคนรอบตัว', 'Consults people around them'], { CO: 1, SN: 1 }),
    ],
  },
  {
    id: 'sc-7',
    context: 'junior',
    text: tt('น้องในทีมทำงานผิดพลาดซ้ำเป็นครั้งที่สาม', 'A junior team member makes the same mistake for the third time'),
    options: [
      opt('a', ['เรียกคุยส่วนตัวและสอนวิธีใหม่', 'Talk privately and teach a new way'], ['สอนแบบส่วนตัว ถนอมน้ำใจ', 'Coaches privately and kindly'], { FC: 1, A: 1 }),
      opt('b', ['ชี้ข้อผิดพลาดในที่ประชุมทีมให้ทุกคนเรียนรู้', 'Point out the mistake in the team meeting so everyone learns'], ['ชี้ให้ทีมเห็นตรง ๆ', 'Points it out openly'], { FC: -1 }),
      opt('c', ['ทำแทนเองเพื่อให้งานเสร็จเร็ว', 'Do it yourself to get it done faster'], ['ทำแทนเอง', 'Does it themself'], { PC: 1, CO: -1 }),
      opt('d', ['ทำเช็กลิสต์ให้น้องใช้ตรวจงาน', 'Create a checklist they can use to check their work'], ['สร้างระบบกันพลาด', 'Builds a system to prevent errors'], { ST: 1, MP: -1 }),
    ],
  },
  {
    id: 'sc-8',
    context: 'junior',
    text: tt('น้องใหม่เสนอไอเดียที่แหวกแนวมาก แต่มีความเสี่ยง', 'A new junior proposes a very unconventional but risky idea'),
    options: [
      opt('a', ['ให้ลองทำในสเกลเล็กก่อน', 'Let them try it on a small scale first'], ['เปิดโอกาสให้ลอง', 'Gives them a chance to try'], { O: 1, CH: 1 }),
      opt('b', ['ขอให้ทำตามวิธีเดิมที่ได้ผลแล้ว', 'Ask them to stick with the proven way'], ['ยึดวิธีที่พิสูจน์แล้ว', 'Sticks with what works'], { CH: -1, ST: 1 }),
      opt('c', ['ส่งต่อให้หัวหน้าที่อาวุโสกว่าตัดสิน', 'Pass it to a more senior manager to decide'], ['ให้ผู้ใหญ่ตัดสิน', 'Lets seniors decide'], { SN: 1, LD: -1 }),
      opt('d', ['ช่วยน้องขัดเกลาไอเดียแล้วนำเสนอด้วยกัน', 'Help them polish the idea and present it together'], ['โค้ชและนำเสนอร่วม', 'Coaches and co-presents'], { CO: 1, LD: 1 }),
    ],
  },
  {
    id: 'sc-9',
    context: 'junior',
    text: tt('คนในทีมเริ่มแบ่งกลุ่มและไม่คุยกันเรื่องการแบ่งงาน', 'Your team is splitting into cliques and not talking about who does what'),
    options: [
      opt('a', ['ตัดสินแบ่งงานใหม่ทันที', 'Reassign the work yourself right away'], ['ตัดสินชี้ขาด', 'Makes the call'], { LD: 1, PC: 1 }),
      opt('b', ['ชวนทุกคนไปกินข้าวคุยปรับความเข้าใจ', 'Take everyone for a meal to clear the air'], ['ใช้ความสัมพันธ์คลี่คลาย', 'Uses relationships to fix it'], { SK: 1, A: 1 }),
      opt('c', ['ให้แต่ละฝ่ายเขียนเหตุผล แล้วคุยตามข้อเท็จจริง', 'Have each side write down their reasons, then discuss the facts'], ['ใช้ข้อเท็จจริงและกติกา', 'Uses facts and rules'], { ST: 1, FC: -1 }),
      opt('d', ['ปล่อยไว้ก่อน เดี๋ยวก็ดีกันเอง', 'Leave it; they will sort it out'], ['รอให้คลี่คลายเอง', 'Waits for it to settle'], { MP: 1, KJ: 1 }),
    ],
  },
  {
    id: 'sc-10',
    context: 'customer',
    text: tt('ลูกค้าขอคืนสินค้าที่เลยกำหนดคืนมาแล้ว 3 วัน และไม่พอใจมาก', 'A customer wants to return an item 3 days past the return period and is very upset'),
    options: [
      opt('a', ['ยืนยันตามนโยบายอย่างสุภาพ', 'Politely hold to the policy'], ['ยึดนโยบาย', 'Holds to policy'], { ST: 1, MP: -1 }),
      opt('b', ['ยอมคืนให้ เพื่อไม่ให้ลูกค้าเสียความรู้สึก', 'Accept the return so the customer is not upset'], ['ยอมเพื่อรักษาน้ำใจ', 'Gives in to keep goodwill'], { KJ: 1, FC: 1 }),
      opt('c', ['เสนอทางเลือกอื่น เช่น เปลี่ยนสินค้าหรือให้เครดิต', 'Offer an alternative, such as an exchange or store credit'], ['หาทางออกที่สร้างสรรค์', 'Finds a creative way out'], { O: 1, A: 1 }),
      opt('d', ['เรียกผู้จัดการมาตัดสินใจ', 'Call the manager to decide'], ['ส่งต่อผู้มีอำนาจ', 'Escalates to authority'], { SN: 1, LD: -1 }),
    ],
  },
  {
    id: 'sc-11',
    context: 'customer',
    text: tt('ลูกค้าประจำถามตรง ๆ ว่าชุดที่ลองดูไม่ดีใช่ไหม ซึ่งจริง ๆ ไม่ค่อยเหมาะ', "A regular customer asks you directly if the outfit doesn't look good, and honestly it doesn't"),
    options: [
      opt('a', ['บอกตรง ๆ อย่างสุภาพ แล้วแนะนำชุดอื่น', 'Tell them politely and honestly, and suggest another'], ['ซื่อตรงแต่สุภาพ', 'Honest but polite'], { KJ: -1, H: 1 }),
      opt('b', ['ชมไว้ก่อน ไม่อยากให้ลูกค้าเสียความรู้สึก', "Compliment it anyway; you don't want to hurt their feelings"], ['รักษาน้ำใจไว้ก่อน', 'Protects feelings first'], { FC: 1, KJ: 1 }),
      opt('c', ['หยิบชุดอื่นมาให้ลองโดยไม่ตอบตรง ๆ', 'Bring another outfit to try without answering directly'], ['เลี่ยงอย่างแนบเนียน', 'Side-steps gracefully'], { FC: 1, O: 1 }),
      opt('d', ['ชวนคุยสนุก ๆ จนลูกค้าตัดสินใจเอง', 'Keep it light and fun until they decide for themselves'], ['ใช้บรรยากาศนำ', 'Leads with charm'], { SK: 1, X: 1 }),
    ],
  },
  {
    id: 'sc-12',
    context: 'customer',
    text: tt('ร้านแน่นมาก และมีลูกค้า 3 คนเรียกพร้อมกัน', 'The shop is packed and three customers call you at the same time'),
    options: [
      opt('a', ['รีบไปทีละคนให้เร็วที่สุด', 'Rush to each one as fast as you can'], ['เร่งความเร็ว', 'Speeds up'], { PC: 1 }),
      opt('b', ['ทักทุกคนก่อน แล้วจัดลำดับให้ชัดเจน', 'Greet everyone first, then set a clear order'], ['จัดคิวอย่างเป็นระบบ', 'Organises a queue'], { ST: 1, LD: 1 }),
      opt('c', ['ขอให้เพื่อนร่วมงานช่วยรับลูกค้า', 'Ask a colleague to help with customers'], ['ประสานทีม', 'Coordinates the team'], { CO: 1 }),
      opt('d', ['ดูแลลูกค้าคนแรกให้ดีที่สุดก่อน แล้วค่อยไปคนถัดไป', 'Serve the first customer as well as possible, then move on'], ['ละเอียดทีละคน', 'Thorough, one at a time'], { PC: -1, C: 1 }),
    ],
  },
]

export const TOTAL_STEPS = LIKERT_SEQUENCE.length + FORCED_BLOCKS.length + SCENARIOS.length
