import { tt, type T } from '@/lib/i18n'
import type { DimCode, Scores } from './types'

/* ------------------------------------------------------------------------------------------------
 * Culture Bridge: how *your* profile lands in a cross-cultural team.
 *   - Thai users get tips for international teams and foreign managers.
 *   - Non-Thai users get tips for working in Thai teams.
 * Tips depend on the person's own Thai-dimension scores, not on nationality stereotypes: a direct
 * Thai and a direct foreigner get the same "directness" insight, framed for the team they're in.
 * Thresholds are against the scale midpoint until Thai and international norm groups exist.
 * ---------------------------------------------------------------------------------------------- */

export type Background = 'thai' | 'foreign'

export interface BridgeTip {
  dim: DimCode
  tone: 'asset' | 'adjust'
  title: T
  insight: T
  tip: T
}

interface Rule {
  dim: DimCode
  when: (v: number) => boolean
  forWho: Background
  tone: BridgeTip['tone']
  title: [string, string]
  insight: [string, string]
  tip: [string, string]
}

const hi = (v: number) => v >= 62
const lo = (v: number) => v <= 38

const RULES: Rule[] = [
  /* ---------------- Non-Thai people in Thai teams ---------------- */
  {
    dim: 'KJ', when: lo, forWho: 'foreign', tone: 'adjust',
    title: ['พูดตรงในทีมไทย', 'Being direct in a Thai team'],
    insight: ['คนไทยหลายคนอาจได้ยินการแย้งตรง ๆ ในที่ประชุมว่าเป็นการทำให้เสียหน้า แม้คุณตั้งใจดี', 'Many Thai colleagues may hear open disagreement in a meeting as causing loss of face, even when you mean well.'],
    tip: ['ยกประเด็นแบบตัวต่อตัวก่อน แล้วค่อยสรุปในที่ประชุม และเริ่มด้วยการขอบคุณหรือชื่นชม', 'Raise concerns 1:1 first, then summarise in the meeting, and open with thanks or appreciation.'],
  },
  {
    dim: 'KJ', when: hi, forWho: 'foreign', tone: 'asset',
    title: ['ความเกรงใจของคุณเป็นจุดแข็ง', 'Your tact is an asset here'],
    insight: ['คุณระวังไม่รบกวนคนอื่น ซึ่งทำให้คนไทยรู้สึกสบายใจทำงานด้วย', 'You are careful not to impose, which makes Thai colleagues comfortable working with you.'],
    tip: ['อย่าคาดหวังให้ทีมแย้งคุณ ถามความเห็นทีละคนแบบส่วนตัว', "Don't expect the team to push back on you; ask people one by one, in private."],
  },
  {
    dim: 'FC', when: lo, forWho: 'foreign', tone: 'adjust',
    title: ['การให้ feedback', 'Giving feedback'],
    insight: ['คุณรับ feedback ตรงได้ แต่เพื่อนร่วมงานคนไทยหลายคนอาจรู้สึกอับอายหากถูกติต่อหน้าคนอื่น', "You can take blunt feedback, but many Thai colleagues may feel embarrassed if corrected in front of others."],
    tip: ['ชมในที่สาธารณะ ติแบบส่วนตัว และพูดถึงงาน ไม่ใช่ตัวบุคคล', 'Praise in public, correct in private, and talk about the work, not the person.'],
  },
  {
    dim: 'SN', when: lo, forWho: 'foreign', tone: 'adjust',
    title: ['ลำดับอาวุโส', 'Seniority'],
    insight: ['คุณชอบทีมแบน แต่ในหลายองค์กรไทย การให้เกียรติผู้อาวุโสยังสำคัญ แม้ทีมดูเป็นกันเอง', 'You prefer flat teams, but in many Thai organisations showing respect to seniors still matters, even when the team feels casual.'],
    tip: ['ให้ผู้ใหญ่พูดก่อนในที่ประชุมใหญ่ ใช้คำว่า “พี่” “คุณ” และขออนุญาตก่อนข้ามสายบังคับบัญชา', 'Let seniors speak first in big meetings, use “P’” or “Khun”, and ask before going over someone’s head.'],
  },
  {
    dim: 'SK', when: lo, forWho: 'foreign', tone: 'adjust',
    title: ['ความสัมพันธ์ก่อนงาน', 'Relationships before tasks'],
    insight: ['คุณโฟกัสงาน แต่ในทีมไทย การกินข้าวและพูดคุยเล่นช่วยสร้างความไว้ใจที่ทำให้งานเดินเร็วขึ้น', 'You are task-focused, but in Thai teams shared meals and small talk build the trust that makes work move faster.'],
    tip: ['ไปกินข้าวกลางวันกับทีมบ้าง และเริ่มประชุมด้วยเรื่องเบา ๆ สั้น ๆ', 'Join team lunches now and then, and open meetings with a little light conversation.'],
  },
  {
    dim: 'MP', when: lo, forWho: 'foreign', tone: 'adjust',
    title: ['ความเป๊ะกับ “ไม่เป็นไร”', 'Precision meets “mai pen rai”'],
    insight: ['คุณอยากให้ทุกอย่างตรงตามแผน แต่ทีมอาจยืดหยุ่นเรื่องเวลาและรายละเอียดมากกว่าที่คุณคาด', 'You want things exactly to plan, but the team may treat timing and details more flexibly than you expect.'],
    tip: ['ตกลงเส้นตายที่ “ห้ามเลื่อน” ให้ชัด เผื่อเวลาสำรอง และติดตามแบบเป็นมิตร', "Agree clearly which deadlines are fixed, build in buffer time, and follow up in a friendly way."],
  },
  {
    dim: 'BK', when: lo, forWho: 'foreign', tone: 'adjust',
    title: ['บุญคุณและความผูกพัน', 'Bunkhun and loyalty'],
    insight: ['คุณยึดกติกาและระบบ ขณะที่คนไทยหลายคนให้ค่ากับการตอบแทนน้ำใจและความผูกพันระยะยาว', 'You go by rules and systems, while many Thais value returning favours and long-term loyalty.'],
    tip: ['จำและตอบแทนน้ำใจเล็ก ๆ ที่ได้รับ และอธิบายเหตุผลเมื่อต้องตัดสินใจตามกฎที่ขัดใจคนสนิท', 'Remember and return small favours, and explain your reasons when a rule-based decision upsets someone close.'],
  },
  {
    dim: 'BK', when: hi, forWho: 'foreign', tone: 'asset',
    title: ['ความภักดีของคุณเข้ากับทีมไทย', 'Your loyalty fits Thai teams'],
    insight: ['คุณให้ค่ากับความสัมพันธ์ระยะยาว ซึ่งช่วยให้ได้รับความไว้ใจจากทีมไทยเร็ว', 'You value long-term relationships, which helps you earn Thai colleagues’ trust quickly.'],
    tip: ['ระวังไม่ให้ความสนิทเหนือเกณฑ์ที่ยุติธรรม โดยเฉพาะเมื่อต้องประเมินคน', "Make sure closeness never outweighs fair criteria, especially when evaluating people."],
  },
  /* ---------------- Thai people in international teams ---------------- */
  {
    dim: 'KJ', when: hi, forWho: 'thai', tone: 'adjust',
    title: ['ความเงียบอาจถูกตีความว่าเห็นด้วย', 'Silence may read as agreement'],
    insight: ['ในทีมนานาชาติ ถ้าคุณไม่แย้ง เพื่อนร่วมงานมักเข้าใจว่าคุณเห็นด้วยหรือทำได้', "In international teams, if you don't push back, colleagues usually assume you agree or can deliver."],
    tip: ['ฝึกพูดว่า “ขอเสนออีกมุมหนึ่ง” หรือ “งานนี้ทำไม่ทันภายในวันศุกร์” การปฏิเสธอย่างมีเหตุผลคือความเป็นมืออาชีพ', 'Practise “May I offer another view?” or “I can’t finish this by Friday.” A reasoned no is seen as professional.'],
  },
  {
    dim: 'KJ', when: lo, forWho: 'thai', tone: 'asset',
    title: ['ความกล้าพูดของคุณเป็นจุดแข็ง', 'Speaking up is your edge'],
    insight: ['คุณกล้าแย้งและพูดตรง ซึ่งทีมนานาชาติให้ค่ามาก', 'You speak your mind, which international teams value highly.'],
    tip: ['ช่วยเป็นสะพานให้เพื่อนคนไทยที่เกรงใจ โดยถามความเห็นพวกเขาในที่ประชุม', 'Act as a bridge for more deferential Thai colleagues by inviting their views in meetings.'],
  },
  {
    dim: 'FC', when: hi, forWho: 'thai', tone: 'adjust',
    title: ['feedback ตรง ๆ ไม่ใช่เรื่องส่วนตัว', "Direct feedback isn't personal"],
    insight: ['หัวหน้าหรือเพื่อนต่างชาติอาจติตรง ๆ ต่อหน้าคนอื่น ซึ่งสำหรับพวกเขาเป็นเรื่องปกติของงาน', 'Foreign managers or peers may give blunt feedback in front of others; to them it is a normal part of work.'],
    tip: ['ขอบคุณ ถามรายละเอียดเพิ่ม และบอกได้ว่าคุณชอบรับ feedback แบบตัวต่อตัว', 'Say thanks, ask for detail, and feel free to say you prefer feedback 1:1.'],
  },
  {
    dim: 'SN', when: hi, forWho: 'thai', tone: 'adjust',
    title: ['ทีมแบน คาดหวังให้คุณเสนอเอง', 'Flat teams expect you to speak'],
    insight: ['ในทีมนานาชาติ คนที่อายุงานน้อยก็ถูกคาดหวังให้เสนอไอเดียและท้าทายหัวหน้าได้', 'In international teams, even junior staff are expected to propose ideas and challenge the boss.'],
    tip: ['เตรียมความเห็น 1 ข้อก่อนเข้าประชุมทุกครั้ง และเรียกหัวหน้าด้วยชื่อได้ถ้าทีมทำแบบนั้น', 'Prepare one point of view before every meeting, and use first names if the team does.'],
  },
  {
    dim: 'MP', when: hi, forWho: 'thai', tone: 'adjust',
    title: ['เส้นตายคือคำสัญญา', 'Deadlines are promises'],
    insight: ['คุณยืดหยุ่นเก่ง แต่ทีมนานาชาติหลายแห่งมองการเลื่อนเส้นตายโดยไม่แจ้งล่วงหน้าเป็นเรื่องใหญ่', 'You are flexible, but many international teams see a missed deadline without warning as a big deal.'],
    tip: ['ถ้าจะเลื่อน ให้แจ้งเร็วที่สุดพร้อมวันใหม่ที่ชัดเจน', 'If something will slip, say so early and give a clear new date.'],
  },
  {
    dim: 'SK', when: hi, forWho: 'thai', tone: 'asset',
    title: ['คุณสร้างบรรยากาศทีมได้ดี', 'You build team spirit'],
    insight: ['ความเป็นกันเองของคุณช่วยให้ทีมหลายวัฒนธรรมสนิทกันเร็ว', 'Your warmth helps multicultural teams bond quickly.'],
    tip: ['บางวัฒนธรรมแยกงานกับเรื่องส่วนตัวชัด อย่าคิดมากถ้าเพื่อนไม่ไปสังสรรค์', "Some cultures keep work and social life apart; don't take it personally if colleagues skip socials."],
  },
  {
    dim: 'PR', when: lo, forWho: 'thai', tone: 'adjust',
    title: ['ผลงานต้องถูกพูดถึง', 'Your work needs a voice'],
    insight: ['ในทีมนานาชาติ การไม่พูดถึงผลงานตัวเองอาจทำให้ถูกมองข้ามตอนประเมินหรือเลื่อนขั้น', 'In international teams, not talking about your results can get you overlooked at review or promotion time.'],
    tip: ['ส่งสรุปผลงานสั้น ๆ ทุกเดือน เป็นตัวเลขและข้อเท็จจริง ไม่ต้องรู้สึกว่าโอ้อวด', "Send a short monthly summary of results, in numbers and facts. It isn't bragging."],
  },
  {
    dim: 'BK', when: hi, forWho: 'thai', tone: 'adjust',
    title: ['ความภักดีกับระบบ', 'Loyalty and systems'],
    insight: ['องค์กรต่างชาติมักตัดสินด้วยเกณฑ์และผลงาน มากกว่าความสัมพันธ์หรือบุญคุณ', 'Foreign organisations usually decide by criteria and results more than relationships or favours owed.'],
    tip: ['สร้างความสัมพันธ์ต่อไป แต่เก็บหลักฐานผลงานให้ชัดสำหรับการประเมิน', 'Keep building relationships, and keep clear evidence of your results for reviews.'],
  },
]

export const cultureBridge = (s: Scores, background: Background): BridgeTip[] =>
  RULES.filter((r) => r.forWho === background && r.when(s[r.dim])).map((r) => ({
    dim: r.dim,
    tone: r.tone,
    title: tt(...r.title),
    insight: tt(...r.insight),
    tip: tt(...r.tip),
  }))
