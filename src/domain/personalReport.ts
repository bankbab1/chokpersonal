import { tt, type T } from '@/lib/i18n'
import { characterOf, type WorkCharacter } from './characters'
import { workfitCode } from './code'
import { SAMPLE_POPULATION } from './demo'
import { dimMeta, DIM_CODES } from './dimensions'
import { sameType } from './fingerprint'
import { personalSignals, type Signal } from './insights'
import type { DimCode, Profile, Scores } from './types'

/* ------------------------------------------------------------------------------------------------
 * The personal report: depth about THIS person, not about their character in general. Every line is
 * built from the person's own scores, answers and comparisons, so two people with the same character
 * get different reports.
 * ---------------------------------------------------------------------------------------------- */

/** How to use a clear pole of each dimension at work (high = right pole, low = left pole). */
const USE: Record<DimCode, { high: T; low: T }> = {
  H: { high: tt('คนไว้ใจให้ดูแลเรื่องที่ต้องยุติธรรม เช่น แบ่งงานหรือแบ่งเครดิต', 'People trust you with fairness: splitting work or sharing credit'), low: tt('ใช้ความกล้าต่อรองเพื่อทีม เช่น ขอทรัพยากรหรือเจรจาเงื่อนไข', 'Use your bargaining nerve for the team: asking for resources or terms') },
  E: { high: tt('รับงานที่กดดันหรือเร่งด่วน คุณช่วยให้ทีมนิ่งได้', 'Take the pressured, urgent work: you keep the team steady'), low: tt('ความไวต่อความเสี่ยงของคุณช่วยจับปัญหาได้ก่อน ลองพูดออกมาเร็วขึ้น', 'Your sensitivity to risk spots problems early: say it out loud sooner') },
  X: { high: tt('เป็นคนเปิดวง เชื่อมคนใหม่ และพูดแทนทีมในที่ประชุม', 'Open the room, welcome newcomers and speak for the team'), low: tt('ขอเวลาคิดก่อนประชุม แล้วส่งความเห็นเป็นข้อความ จะได้ไอเดียที่ลึกกว่า', 'Ask for prep time before meetings and send your view in writing: deeper ideas'), },
  A: { high: tt('คุณช่วยลดแรงตึงในทีม ใช้ตอนต้องรวมความเห็นที่ต่างกัน', 'You lower tension: use it when different views need bringing together'), low: tt('ความตรงของคุณช่วยตรวจงานได้จริง แค่บอกเหตุผลก่อนวิจารณ์', 'Your bluntness makes real reviews possible: give the why before the critique') },
  C: { high: tt('รับงานที่ต้องส่งตรงเวลาและครบถ้วน คุณคือคนที่ทีมพึ่งได้', 'Own work that must be complete and on time: the team can rely on you'), low: tt('คุณทำงานตามจังหวะตัวเองได้ดี ขอเส้นตายที่ชัดแล้วปล่อยให้คุณเลือกวิธี', 'You work well at your own rhythm: ask for a clear deadline, then choose your method') },
  O: { high: tt('อาสาเริ่มโปรเจกต์ใหม่หรือหาวิธีใหม่ให้ทีม', 'Volunteer to start new projects or find new ways for the team'), low: tt('คุณทำให้วิธีที่ได้ผลอยู่แล้วนิ่งและดีขึ้น เหมาะกับงานที่ต้องสม่ำเสมอ', 'You make proven methods steadier and better: ideal for work that must be consistent') },
  KJ: { high: tt('ความเกรงใจช่วยรักษาความสัมพันธ์ แต่ตั้งใจพูดเรื่องสำคัญอย่างน้อยวันละครั้ง', 'Your deference protects relationships; still raise one important thing every day'), low: tt('คุณกล้าแย้ง ใช้ตอนทีมกำลังจะตัดสินใจผิด และเลือกคุยตัวต่อตัวเมื่อเป็นผู้ใหญ่', 'You dare to disagree: use it when the team is about to decide wrongly, 1:1 with seniors') },
  SN: { high: tt('คุณทำงานได้ดีในระบบที่ชัด ใช้ช่วยน้องใหม่เข้าใจลำดับขั้นและวิธีทำงาน', 'You thrive with clear rank: help newcomers understand how things work'), low: tt('คุณสบายใจกับทีมแบน ชวนทุกระดับออกความเห็นได้เต็มที่', 'You are at ease in flat teams: invite every level to speak up') },
  FC: { high: tt('ขอ feedback แบบส่วนตัว และให้ feedback คนอื่นแบบส่วนตัวเช่นกัน', 'Ask for feedback in private, and give it to others in private too'), low: tt('คุณรับ feedback ตรงได้ เป็นแบบอย่างให้ทีมกล้าขอ feedback', 'You take direct feedback well: model asking for it so others dare too') },
  SK: { high: tt('คุณสร้างบรรยากาศที่ดี ใช้ช่วงงานหนักเพื่อรักษาพลังทีม', 'You build a good atmosphere: use it to keep energy up in heavy periods'), low: tt('คุณโฟกัสงานได้ดี จองเวลาไม่ให้ใครรบกวนในช่วงงานสำคัญ', 'You focus well: block uninterrupted time for important work') },
  MP: { high: tt('ความยืดหยุ่นช่วยทีมตอนแผนเปลี่ยน รับบทคนปรับแผน', 'Your flexibility helps when plans change: be the one who re-plans'), low: tt('ความเป๊ะของคุณกันงานพลาด รับบทตรวจงานก่อนส่ง', 'Your precision prevents mistakes: be the final check before work goes out') },
  BK: { high: tt('ความภักดีต่อคนทำให้ทีมแน่น ระวังอย่าให้กลายเป็นพรรคพวก', 'Your loyalty bonds the team; keep it from becoming a clique'), low: tt('คุณยึดระบบและความยุติธรรม ช่วยทีมตัดสินด้วยเกณฑ์ที่โปร่งใส', 'You hold to systems and fairness: help the team decide by clear criteria') },
  LD: { high: tt('อาสานำงานหรือโครงการเล็ก ๆ เพื่อสร้างหลักฐานการนำ', 'Volunteer to lead a small piece of work to build evidence of leading'), low: tt('คุณเป็นแรงหนุนที่ทีมขาดไม่ได้ ขอให้ผลงานเบื้องหลังถูกมองเห็น', 'You are the support a team can’t lose: ask for behind-the-scenes work to be seen') },
  PC: { high: tt('รับงานที่ต้องเริ่มเร็วและปรับระหว่างทาง', 'Take work that needs a fast start and adjusting on the way'), low: tt('รับงานที่ต้องคิดรอบด้านก่อนลงมือ และขอเวลาตรวจให้พอ', 'Take work that needs thinking through first, and ask for enough checking time') },
  CO: { high: tt('คุณทำงานร่วมกับคนได้ดี รับบทประสานข้ามทีม', 'You work well with others: take the cross-team coordinating role'), low: tt('คุณทำงานคนเดียวได้ลึก ตกลงกับทีมเรื่องเวลาอัปเดตที่ชัด', 'You go deep alone: agree clear update times with the team') },
  ST: { high: tt('คุณช่วยทีมสร้างขั้นตอนที่ชัด เขียนวิธีทำงานให้คนอื่นใช้ต่อ', 'You help build clear steps: write up methods others can reuse'), low: tt('ขอเป้าหมายที่ชัด แล้วขออิสระในการเลือกวิธี', 'Ask for a clear goal, then freedom in how you get there') },
  CH: { high: tt('อาสางานเปลี่ยนแปลงหรือทดลองระบบใหม่', 'Volunteer for change work or trialling new systems'), low: tt('คุณช่วยให้ทีมนิ่งตอนที่ทุกอย่างเปลี่ยน รับบทรักษาสิ่งที่ดีอยู่แล้ว', 'You keep the team steady while things change: protect what already works') },
  PR: { high: tt('คุณขายไอเดียเก่ง ช่วยนำเสนองานของทีมด้วย ไม่ใช่แค่ของตัวเอง', 'You sell ideas well: present the team’s work too, not just your own'), low: tt('ผลงานคุณพูดแทนได้ แต่จดผลลัพธ์เป็นตัวเลขไว้ให้หัวหน้าเห็น', 'Your work speaks for you, but log results as numbers so your manager sees them') },
}

export interface Standout {
  dim: DimCode
  name: T
  score: number
  pole: T
  use: T
}

export interface Difference {
  dim: DimCode
  name: T
  you: number
  group: number
  text: T
}

export interface PersonalReport {
  character: WorkCharacter
  /** How many people in the sample share the character (for "compared with N others"). */
  groupSize: number
  differences: Difference[]
  standouts: Standout[]
  signals: Signal[]
  /** Letters within the middle band: where the person can flex either way. */
  flex: T[]
  nextSteps: T[]
}

export function personalReport(profile: Profile): PersonalReport {
  const s: Scores = profile.scores
  const character = characterOf(s)
  const same = sameType(s, SAMPLE_POPULATION)
  const differences: Difference[] = same.distinctive.slice(0, 3).map((d) => ({
    dim: d.dim,
    name: d.name,
    you: d.you,
    group: d.groupMean,
    text: d.you > d.groupMean
      ? tt(`มากกว่า${character.name.th}ส่วนใหญ่: ${dimMeta(d.dim).high.th}`, `More than most ${character.name.en.replace(/^The /, '')}s: ${dimMeta(d.dim).high.en.toLowerCase()}`)
      : tt(`น้อยกว่า${character.name.th}ส่วนใหญ่: ${dimMeta(d.dim).low.th}`, `Less than most ${character.name.en.replace(/^The /, '')}s: ${dimMeta(d.dim).low.en.toLowerCase()}`),
  }))

  // Absolute standouts, skipping what "differences" already said, so every line adds something new.
  const shown = new Set(differences.map((d) => d.dim))
  const standouts: Standout[] = DIM_CODES.map((dim) => ({ dim, score: s[dim], dist: Math.abs(s[dim] - 50) }))
    .filter((x) => x.dist >= 15 && !shown.has(x.dim))
    .sort((a, b) => b.dist - a.dist)
    .slice(0, 3)
    .map(({ dim, score }) => {
      const meta = dimMeta(dim)
      const high = score >= 50
      return { dim, name: { th: meta.th, en: meta.en }, score, pole: high ? meta.high : meta.low, use: high ? USE[dim].high : USE[dim].low }
    })

  const signals = personalSignals(s)
  const flex = workfitCode(s)
    .letters.filter((l) => !l.clear)
    .map((l) => tt(`${l.axis.name.th}: ใช้ได้ทั้ง${l.axis.left.name.th}และ${l.axis.right.name.th}`, `${l.axis.name.en}: both ${l.axis.left.name.en.toLowerCase()} and ${l.axis.right.name.en.toLowerCase()}`))

  const nextSteps: T[] = []
  if (standouts[0]) nextSteps.push(standouts[0].use)
  if (signals[0]) nextSteps.push(signals[0].support)
  else if (differences[0]) nextSteps.push(tt(`คุยกับหัวหน้าว่าจุดที่คุณต่างจาก${character.name.th}ทั่วไป (${differences[0].name.th}) ใช้ประโยชน์ในงานได้อย่างไร`, `Talk with your manager about how your difference from typical ${character.name.en.replace(/^The /, '')}s (${differences[0].name.en.toLowerCase()}) can help the work`))
  if (nextSteps.length < 2)
    nextSteps.push(tt('ยืนยันบริบทที่คุณต้องการในแท็บ "กับคนอื่น" แล้วเลือก 1 เรื่องไปคุยกับหัวหน้า', 'Confirm the context you want in the "Others" tab, then pick one topic to discuss with your manager'))
  nextSteps.push(tt('ชวนคนรอบตัว 3 คนมาประเมินคุณ เพื่อดูว่าคนอื่นเห็นคุณแบบเดียวกันไหม', 'Invite 3 people who know you to rate you, and see if they see you the same way'))

  return { character, groupSize: same.group.length, differences, standouts, signals, flex, nextSteps }
}
