import { tt, type T } from '@/lib/i18n'
import type { DimCode, Scores } from './types'

/* ------------------------------------------------------------------------------------------------
 * The Workfit Code: Workfit's own standard 7-letter code for how a person works.
 *
 *   ENLC-HRW
 *   ^^^^ ^^^
 *   |    Context (3): how you work with people in a Thai workplace — Voice D/H, Frame M/R, Bond O/W
 *   Core (4): how you work — Energy I/E, Ideas S/N, Drive B/L, Pace C/Q
 *
 * Letter rule: E/I and N/S use the widely known letters for extravert/introvert and intuition/sensing;
 * every other letter is unique to Workfit. The code is measured by Workfit's own questions and is never
 * converted from, or claimed to equal, another platform's type (spec §2.2).
 * Thai signatures: H (harmony / face) and M (mai pen rai).
 *
 * - Always uppercase, always the same order, always one hyphen, so codes compare and sort cleanly.
 * - 7 axes, 14 different letters: any letter tells you its axis on its own. 2^7 = 128 codes.
 * - A letter within 8 points of the middle is "leaning"; the UI shows it lighter, the string stays uppercase.
 * - The Context block is Thai-specific (face, kreng jai, bunkhun), which no Western code has.
 * - A name and an intro paragraph are composed from the letters in Thai and English.
 * ---------------------------------------------------------------------------------------------- */

export type CodeGroup = 'core' | 'context'

export const CODE_GROUPS: { id: CodeGroup; name: T; blurb: T }[] = [
  {
    id: 'core',
    name: tt('แกนตัวตน (Core)', 'Core'),
    blurb: tt('4 ตัวแรก = ตัวละครของคุณ (1 ใน 16): พลังงาน ความคิด บทบาท จังหวะ · 2 ตัวแรก = สาย', 'First 4 letters = your character (1 of 16): energy, ideas, drive, pace · first 2 = your group'),
  },
  {
    id: 'context',
    name: tt('บริบทคนไทย (Context)', 'Context'),
    blurb: tt('3 ตัวหลังขีด: คุณทำงานกับคนอย่างไรในที่ทำงานแบบไทย การสื่อสาร กรอบการทำงาน และความผูกพัน', 'Last 3 letters: how you work with people in a Thai workplace — voice, frame and bond'),
  },
]

export interface CodePole {
  letter: string
  name: T
  sentence: T
}

export interface CodeAxisDef {
  id: string
  group: CodeGroup
  name: T
  /** The question this axis answers. */
  question: T
  /** Where the axis comes from: research basis and how it relates to familiar tests. */
  origin: T
  /** Measured dimensions averaged into the axis (inverted ones count as 100 − score). */
  sources: { dim: DimCode; invert?: boolean }[]
  left: CodePole
  right: CodePole
}

/** 0 = fully the left pole, 100 = fully the right pole. */
export const axisValue = (axis: CodeAxisDef, s: Scores) =>
  axis.sources.reduce((sum, x) => sum + (x.invert ? 100 - s[x.dim] : s[x.dim]), 0) / axis.sources.length

const P = (letter: string, name: [string, string], sentence: [string, string]): CodePole => ({ letter, name: tt(...name), sentence: tt(...sentence) })

export const CODE_AXES: CodeAxisDef[] = [
  {
    id: 'energy',
    name: tt('พลังงาน', 'Energy'),
    group: 'core',
    question: tt('คุณได้พลังจากไหน: จากคน หรือจากความเงียบ', 'Where do you get energy: from people or from quiet?'),
    origin: tt('มาจาก Extraversion ใน HEXACO / Big Five ซึ่งเป็นมิติที่มีงานวิจัยรองรับมากที่สุด วัดเป็นสเปกตรัม ไม่บังคับให้เลือกข้างที่ 50', 'From Extraversion in HEXACO / Big Five, the best-researched trait there is, measured as a spectrum instead of forcing a side at 50.'),
    sources: [{ dim: 'X' }],
    left: P('I', ['เติมพลังในความเงียบ', 'Introvert'], ['คุณชาร์จพลังในความเงียบ และคิดก่อนพูด', 'You recharge in quiet and think before you speak.']),
    right: P('E', ['ได้พลังจากคน', 'Extravert'], ['คุณมีพลังเมื่ออยู่กับคน และคิดไปพูดไปได้เก่ง', 'You draw energy from people and think out loud.']),
  },
  {
    id: 'ideas',
    name: tt('ความคิด', 'Ideas'),
    group: 'core',
    question: tt('คุณชอบไอเดียใหม่ หรือวิธีที่พิสูจน์แล้ว', 'Do you reach for new ideas or proven methods?'),
    origin: tt('มาจาก Openness to experience ใน HEXACO / Big Five แต่ถามถึงพฤติกรรมในงาน ไม่ใช่วิธีรับรู้ข้อมูล', 'From Openness to experience in HEXACO / Big Five, asked as behaviour at work rather than how you perceive information.'),
    sources: [{ dim: 'O' }],
    left: P('S', ['ยึดของจริงที่พิสูจน์แล้ว', 'Sensing'], ['คุณเชื่อในข้อเท็จจริงและวิธีที่พิสูจน์แล้วว่าได้ผล', 'You trust facts and methods that are proven to work.']),
    right: P('N', ['มองภาพใหม่ ไอเดียใหม่', 'iNtuition'], ['คุณชอบไอเดียใหม่และวิธีที่ไม่มีใครลอง', 'You love new ideas and untried ways.']),
  },
  {
    id: 'drive',
    name: tt('บทบาท', 'Drive'),
    group: 'core',
    question: tt('เมื่อทีมต้องตัดสินใจ คุณก้าวออกมานำ หรือเป็นกระดูกสันหลังที่ทำให้งานเดิน', 'When the team must decide, do you step up or become the backbone that keeps work moving?'),
    origin: tt('มาจากงานวิจัยเรื่องการเกิดขึ้นของผู้นำ (leadership emergence) และแกน Dominance ของ DISC วัดจากพฤติกรรมในสถานการณ์จริง ไม่ใช่แค่ความมั่นใจ', 'From research on leadership emergence and the Dominance axis of DISC, scored from behaviour in real scenarios, not just confidence.'),
    sources: [{ dim: 'LD' }],
    left: P('B', ['กระดูกสันหลังของทีม', 'Backbone'], ['คุณทำให้คนอื่นสำเร็จ และเป็นแรงที่ทีมพึ่งพาได้เสมอ', 'You help others succeed and are the strength the team always relies on.']),
    right: P('L', ['ก้าวออกมานำ', 'Lead'], ['เมื่อไม่มีใครตัดสินใจ คุณคือคนที่ก้าวออกมานำ', 'When no one decides, you are the one who steps up.']),
  },
  {
    id: 'pace',
    name: tt('จังหวะ', 'Pace'),
    group: 'core',
    question: tt('คุณลงมือเร็วแล้วปรับ หรือตรวจให้ครบก่อนเริ่ม', 'Do you move fast and adjust, or check everything first?'),
    origin: tt('มาจากแกน pace ของ DISC และงานวิจัยเรื่องจังหวะการทำงาน (work tempo) ทั้งสองข้างมีคุณค่า งานต่างกันต้องการจังหวะต่างกัน', 'From the pace axis of DISC and work-tempo research. Both sides are valuable; different jobs need different tempos.'),
    sources: [{ dim: 'PC' }],
    left: P('C', ['รอบคอบ ตรวจก่อนลุย', 'Careful'], ['คุณตรวจให้รอบคอบก่อนลงมือ', 'You check carefully before you act.']),
    right: P('Q', ['ไว ลงมือก่อน', 'Quick'], ['คุณลงมือเร็ว แล้วปรับระหว่างทาง', 'You move fast and adjust along the way.']),
  },
  {
    id: 'voice',
    name: tt('การสื่อสาร', 'Voice'),
    group: 'context',
    question: tt('เมื่อไม่เห็นด้วย คุณพูดตรง หรือรักษาน้ำใจและหน้าตาของทุกคน', 'When you disagree, do you say it straight or protect harmony and face?'),
    origin: tt('แกนเฉพาะของคนไทย รวมความเกรงใจและการรักษาหน้า จากงานวิจัยค่านิยมคนไทย (เช่น Komin, 1990) และเป็นต้นเหตุที่คนเก่งแต่เงียบมักถูกมองข้าม', 'Thai-specific: kreng jai and face combined, from research on Thai values (e.g. Komin, 1990), and a key reason quiet, capable people get overlooked.'),
    sources: [{ dim: 'KJ' }, { dim: 'FC' }],
    left: P('D', ['พูดตรง', 'Direct'], ['คุณพูดสิ่งที่คิด แม้กับผู้ใหญ่', 'You say what you think, even to seniors.']),
    right: P('H', ['รักษาน้ำใจ', 'Harmony'], ['คุณรักษาบรรยากาศและไม่ทำให้ใครเสียหน้า', 'You protect harmony and never let anyone lose face.']),
  },
  {
    id: 'frame',
    name: tt('กรอบการทำงาน', 'Frame'),
    group: 'context',
    question: tt('คุณทำงานได้ดีกับขั้นตอนที่ชัด หรือกับความยืดหยุ่นแบบ ไม่เป็นไร', 'Do you work best with clear steps or with mai-pen-rai flexibility?'),
    origin: tt('รวมความต้องการโครงสร้างกับวัฒนธรรม ไม่เป็นไร ของไทย คนที่ยืดหยุ่นมากกับคนที่เป๊ะมากมักขัดกันโดยไม่รู้ตัว', 'Combines structure need with Thai mai-pen-rai culture. Very flexible and very exact people often clash without realising why.'),
    sources: [{ dim: 'ST' }, { dim: 'MP', invert: true }],
    left: P('M', ['ไม่เป็นไร ยืดหยุ่น', 'Mai pen rai'], ['คุณปรับตัวง่ายเมื่อแผนเปลี่ยน และไม่ติดกับรายละเอียดเล็ก ๆ', 'You adapt easily when plans change and don’t get stuck on small details.']),
    right: P('R', ['มีระบบ เป๊ะ', 'Rules'], ['คุณชอบขั้นตอนที่ชัดและงานที่แม่นยำ', 'You like clear steps and precise work.']),
  },
  {
    id: 'bond',
    name: tt('ความผูกพัน', 'Bond'),
    group: 'context',
    question: tt('คุณเติบโตในทีมที่แน่นแฟ้น หรือในงานที่ได้ทำแบบของตัวเอง', 'Do you thrive in a close-knit team or on your own terms?'),
    origin: tt('รวมบุญคุณ ความสนุกในทีม และการทำงานร่วม ตามงานวิจัยที่พบว่าคนไทยให้ค่ากับความสัมพันธ์สูง ช่วยมองเห็นทั้งทีมที่อบอุ่นและความเสี่ยงเรื่องพรรคพวก', 'Combines bunkhun (loyalty), sanuk (fun) and collaboration, following research that Thai workplaces are strongly relationship-oriented. Shows both warm teams and the risk of cliques.'),
    sources: [{ dim: 'BK' }, { dim: 'SK' }, { dim: 'CO' }],
    left: P('O', ['ทางของตัวเอง', 'Own way'], ['คุณทำงานได้ดีที่สุดในแบบของตัวเอง และอยากถูกวัดที่ผลงาน', 'You work best on your own terms and want to be judged on results.']),
    right: P('W', ['ทีมเรา', 'We'], ['คุณเติบโตในทีมที่แน่นแฟ้น และให้ค่ากับความภักดี', 'You thrive in a close-knit team and value loyalty.']),
  },
]

export const LEAN = 8
export const CODE_COUNT = 2 ** 7

export interface CodeLetter {
  axis: CodeAxisDef
  value: number
  pole: CodePole
  other: CodePole
  /** False when within LEAN points of the middle ("leaning"). */
  clear: boolean
  /** The letter as written in the code (always uppercase). */
  shown: string
  /** 50–100: how far toward the shown pole. */
  strength: number
}

export interface WorkfitCode {
  /** Standard form, e.g. INLC-DRO. */
  code: string
  core: string
  context: string
  vibe: CodeTribe
  crew: CodeTribe
  letters: CodeLetter[]
  title: T
  intro: T
}

/* ---------------------------------------- Name & intro ---------------------------------------- */

const NOUN: Record<string, T> = {
  EL: tt('ผู้นำจุดประกาย', 'Spark Leader'),
  IL: tt('กัปตันผู้สุขุม', 'Quiet Captain'),
  EB: tt('นักเชื่อมทีม', 'Team Connector'),
  IB: tt('มือหนึ่งเบื้องหลัง', 'Steady Specialist'),
}

const ADJ: Record<string, T> = {
  NQ: tt('สายกล้าลอง', 'Bold'),
  NC: tt('สายช่างคิด', 'Thoughtful'),
  SQ: tt('สายลงมือจริง', 'Practical'),
  SC: tt('สายละเอียดลออ', 'Meticulous'),
}

/* -------------------------------- สาย × แก๊ง: the 16 groups -------------------------------- */

export interface CodeTribe {
  key: string
  name: T
  tagline: T
  emoji: string
}

/** สาย (vibe) = slots 1+2: energy and ideas. */
export const VIBES: CodeTribe[] = [
  { key: 'EN', emoji: '✨', name: tt('สายครีเอต', 'Creator'), tagline: tt('ไอเดียเยอะ พลังล้น ชวนคนมาลองของใหม่', 'Full of ideas and energy, gets people trying new things') },
  { key: 'IN', emoji: '🔭', name: tt('สายคิดลึก', 'Deep Thinker'), tagline: tt('เงียบแต่คิดไกล เห็นภาพที่คนอื่นยังไม่เห็น', 'Quiet but far-sighted, sees what others don’t yet') },
  { key: 'ES', emoji: '⚡', name: tt('สายลุย', 'Hustler'), tagline: tt('ลงสนามจริง คุยเก่ง ปิดงานได้', 'On the ground, good with people, gets it closed') },
  { key: 'IS', emoji: '🪨', name: tt('สายเสาหลัก', 'Anchor'), tagline: tt('นิ่ง แม่น ไว้ใจได้ งานไม่มีหลุด', 'Steady, accurate, reliable: nothing slips') },
]

/** แก๊ง (crew) = slots 5+7, how you show up with people in a Thai team. */
export const CREWS: CodeTribe[] = [
  { key: 'DW', emoji: '📣', name: tt('แก๊งพูดตรง', 'Real Talk Crew'), tagline: tt('ตรงแต่จริงใจ พูดเพราะรักทีม', 'Straight but sincere, speaks up because they care') },
  { key: 'HW', emoji: '🫶', name: tt('แก๊งครอบครัว', 'Family Crew'), tagline: tt('ดูแลทุกคน บรรยากาศดีเพราะมีคุณ', 'Looks after everyone; the vibe is good because of you') },
  { key: 'DO', emoji: '🎯', name: tt('แก๊งเดี่ยวตัวจริง', 'Solo Pro'), tagline: tt('ทำของตัวเองให้สุด แล้วพูดตรงเรื่องผลงาน', 'Goes all-in on their own work and talks straight about results') },
  { key: 'HO', emoji: '🌙', name: tt('แก๊งนุ่มลึก', 'Low-key Diplomat'), tagline: tt('สุภาพ เป็นตัวของตัวเอง ไม่ยุ่งเรื่องการเมือง', 'Polite, independent, stays out of office politics') },
]

const VOICE_TAG: Record<string, T> = {
  D: tt('พูดตรง', 'straight-talking'),
  H: tt('รักษาน้ำใจ', 'harmony-keeping'),
}

export const workfitCode = (s: Scores): WorkfitCode => {
  const letters: CodeLetter[] = CODE_AXES.map((axis) => {
    const value = Math.round(axisValue(axis, s))
    const right = value >= 50
    const pole = right ? axis.right : axis.left
    const clear = Math.abs(value - 50) >= LEAN
    return {
      axis,
      value,
      pole,
      other: right ? axis.left : axis.right,
      clear,
      shown: pole.letter,
      strength: right ? value : 100 - value,
    }
  })
  const L = (id: string) => letters.find((l) => l.axis.id === id)?.pole.letter ?? ''
  const noun = NOUN[`${L('energy')}${L('drive')}`]
  const adj = ADJ[`${L('ideas')}${L('pace')}`]
  const voice = VOICE_TAG[L('voice')]
  const title = tt(`${noun.th} ${adj.th}`, `The ${adj.en} ${noun.en}`)
  // Lead with the clearest traits; leaning letters get a softer word.
  const ordered = [...letters].sort((a, b) => b.strength - a.strength)
  const sentence = (l: CodeLetter, lang: 'th' | 'en') =>
    l.clear ? l.pole.sentence[lang] : lang === 'th' ? `ค่อนข้าง: ${l.pole.sentence.th}` : `Leaning: ${l.pole.sentence.en}`
  const intro = tt(
    `${noun.th}${adj.th}ที่${voice.th} · ${ordered.map((l) => sentence(l, 'th')).join(' ')}`,
    `A ${voice.en} ${adj.en.toLowerCase()} ${noun.en.toLowerCase()}. ${ordered.map((l) => sentence(l, 'en')).join(' ')}`,
  )
  const join = (g: CodeGroup) => letters.filter((l) => l.axis.group === g).map((l) => l.shown).join('')
  const core = join('core')
  const context = join('context')
  const vibe = VIBES.find((v) => v.key === `${L('energy')}${L('ideas')}`)!
  const crew = CREWS.find((c) => c.key === `${L('voice')}${L('bond')}`)!
  return { code: `${core}-${context}`, core, context, vibe, crew, letters, title, intro }
}

/** Reads a typed code (any case, hyphen optional) into its poles, or null if it isn't a valid code. */
export const decodeCode = (input: string): { axis: CodeAxisDef; pole: CodePole }[] | null => {
  const letters = input.toUpperCase().replace(/[^A-Z]/g, '')
  if (letters.length !== CODE_AXES.length) return null
  const out = CODE_AXES.map((axis, i) => {
    const ch = letters[i]
    const pole = axis.left.letter === ch ? axis.left : axis.right.letter === ch ? axis.right : null
    return pole && { axis, pole }
  })
  return out.every(Boolean) ? (out as { axis: CodeAxisDef; pole: CodePole }[]) : null
}

/* ------------------------------------------ Code book ------------------------------------------ */

/**
 * A representative profile for a set of letters: every source dimension placed so its axis reads a
 * clear 80 toward the chosen pole. Used to describe a code without a person — the code book.
 */
export const scoresForLetters = (letters: string[]): Scores => {
  const s = Object.fromEntries(DIM_LIST.map((d) => [d, 50])) as Scores
  CODE_AXES.forEach((axis, i) => {
    const right = letters[i] === axis.right.letter
    for (const src of axis.sources) s[src.dim] = right !== Boolean(src.invert) ? 80 : 20
  })
  return s
}

const DIM_LIST: DimCode[] = ['H', 'E', 'X', 'A', 'C', 'O', 'KJ', 'SN', 'FC', 'SK', 'MP', 'BK', 'LD', 'PC', 'CO', 'ST', 'CH', 'PR']

export interface CodeBookEntry {
  code: string
  letters: string[]
  wc: WorkfitCode
}

/** All 128 codes in slot order (left pole first), each described by the same rules as a real result. */
export const CODE_BOOK: CodeBookEntry[] = (() => {
  const out: CodeBookEntry[] = []
  for (let n = 0; n < CODE_COUNT; n++) {
    const letters = CODE_AXES.map((axis, i) => ((n >> (CODE_AXES.length - 1 - i)) & 1 ? axis.right.letter : axis.left.letter))
    const wc = workfitCode(scoresForLetters(letters))
    out.push({ code: wc.code, letters, wc })
  }
  return out
})()

export const codeBookEntry = (code: string) => {
  const key = code.toUpperCase().replace(/[^A-Z]/g, '')
  return CODE_BOOK.find((e) => e.letters.join('') === key) ?? null
}
