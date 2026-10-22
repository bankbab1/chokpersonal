import { tt, type T } from '@/lib/i18n'
import type { Scores } from './types'

/* ------------------------------------------------------------------------------------------------
 * Workfit insights — the Thai workplace pain points the persona label alone doesn't show:
 *   1. talk vs. delivery ("พูดเก่งแต่ทำไม่ได้" vs. "เงียบแต่ทำงานดี")
 *   2. who may be silenced or picked on, and who may dominate
 *   3. cliques (พรรคพวก) at team level — see team.ts
 * Delivery comes from peer ratings when available (peer.ts), otherwise from self-report.
 * ---------------------------------------------------------------------------------------------- */

export type SayDoKind = 'quiet-achiever' | 'talk-over-do' | 'strong-both' | 'balanced' | 'developing'

export interface SayDo {
  say: number // how well the person presents and promotes their work
  do: number // how reliably they deliver
  kind: SayDoKind
  title: T
  detail: T
}

export const sayDo = (s: Scores, observedDelivery?: number): SayDo => {
  const say = Math.round(s.PR * 0.6 + s.X * 0.4)
  const doScore = Math.round(observedDelivery ?? s.C * 0.7 + s.H * 0.3)
  const gap = doScore - say
  if (gap >= 20 && doScore >= 60)
    return {
      say, do: doScore, kind: 'quiet-achiever',
      title: tt('เพชรในตม · ทำมากกว่าพูด', 'Hidden gem · does more than says'),
      detail: tt(
        'ส่งงานได้ดีแต่ไม่ค่อยขายตัวเอง เสี่ยงถูกมองข้ามในการสัมภาษณ์และการเลื่อนขั้น ให้ดูจากผลงานจริงและฟีดแบ็กจากเพื่อนร่วมงาน',
        'Delivers well but rarely self-promotes, so is easy to overlook in interviews and promotions. Judge by real work and colleague feedback.',
      ),
    }
  if (gap <= -20 && say >= 60)
    return {
      say, do: doScore, kind: 'talk-over-do',
      title: tt('พูดนำงาน · ตรวจผลงานจริงเสมอ', 'Talk ahead of delivery · always check the work'),
      detail: tt(
        'นำเสนอเก่งกว่าที่ส่งมอบได้ ก่อนรับเข้าหรือเลื่อนขั้น ให้ขอดูผลงานและอ้างอิงจากคนที่เคยทำงานด้วย',
        'Presents better than they deliver. Before hiring or promoting, look at work samples and references.',
      ),
    }
  if (say >= 60 && doScore >= 60)
    return { say, do: doScore, kind: 'strong-both', title: tt('พูดได้ ทำได้', 'Says it and does it'), detail: tt('ทั้งนำเสนอและส่งมอบได้ดี เหมาะกับงานที่ต้องเป็นหน้าเป็นตาของทีม', 'Strong at both presenting and delivering; suits roles that represent the team.') }
  if (say < 45 && doScore < 45)
    return { say, do: doScore, kind: 'developing', title: tt('กำลังพัฒนา', 'Developing'), detail: tt('ควรตั้งเป้าเล็ก ๆ ที่ชัดเจนและมีพี่เลี้ยงช่วยติดตาม', 'Set small, clear goals with a mentor to follow up.') }
  return { say, do: doScore, kind: 'balanced', title: tt('พูดและทำสมดุล', 'Balanced'), detail: tt('สิ่งที่พูดกับสิ่งที่ทำไปในทิศทางเดียวกัน', 'What they say and what they do line up.') }
}

export interface Signal {
  id: 'silence-risk' | 'dominance-watch' | 'clique-pull' | 'overload'
  level: 'watch' | 'high'
  title: T
  short: T
  detail: T
  support: T
}

/** Individual signals. Wording is about support needs, never a label on the person. */
export const personalSignals = (s: Scores): Signal[] => {
  const out: Signal[] = []
  const silence = (s.KJ + s.FC + (100 - s.X) + (100 - s.E)) / 4
  if (silence >= 62)
    out.push({
      id: 'silence-risk',
      level: silence >= 72 ? 'high' : 'watch',
      title: tt('อาจไม่กล้าส่งเสียงเมื่อมีปัญหา', 'May not speak up when something is wrong'),
      short: tt('อาจไม่กล้าพูด', 'May stay silent'),
      detail: tt('เกรงใจและรักษาหน้าสูง จึงอาจไม่เล่าเมื่อถูกกดดัน ถูกแกล้ง หรืองานล้น', 'High deference and face concern, so may not say so when pressured, picked on or overloaded.'),
      support: tt('หัวหน้าควรนัดคุยตัวต่อตัวสม่ำเสมอ และมีช่องทางแจ้งปัญหาแบบไม่ระบุตัวตน', 'Hold regular 1:1s and offer an anonymous way to raise issues.'),
    })
  const dominance = (s.LD + (100 - s.KJ) + (100 - s.A) + (100 - s.H)) / 4
  if (dominance >= 62)
    out.push({
      id: 'dominance-watch',
      level: dominance >= 72 ? 'high' : 'watch',
      title: tt('พลังนำสูง ระวังการกดคนที่เงียบกว่า', 'Strong drive to lead; watch for overpowering quieter people'),
      short: tt('พลังนำสูง', 'Strong lead drive'),
      detail: tt('กล้าตัดสินใจและพูดตรง แต่ความถ่อมตนและการประนีประนอมต่ำ อาจทำให้คนอื่นไม่กล้าแย้ง', 'Decisive and direct, but lower humility and agreeableness can make others afraid to disagree.'),
      support: tt('ฝึกถามความเห็นคนเงียบก่อน และให้ 360 ฟีดแบ็กเรื่องการรับฟัง', 'Practise asking quieter people first, and get peer feedback on listening.'),
    })
  const clique = (s.BK + s.SN + s.SK + (100 - s.H)) / 4
  if (clique >= 62)
    out.push({
      id: 'clique-pull',
      level: clique >= 72 ? 'high' : 'watch',
      title: tt('ผูกพันกับกลุ่มสูง', 'Strong pull toward an in-group'),
      short: tt('ผูกกลุ่มสูง', 'In-group pull'),
      detail: tt('ภักดีต่อคนและกลุ่มของตัวเองมาก ซึ่งช่วยให้ทีมแน่น แต่เสี่ยงต่อการแบ่งพรรคแบ่งพวก', 'Very loyal to their own people, which bonds a team but risks cliques.'),
      support: tt('ให้ทำงานข้ามทีมบ้าง และตัดสินงานด้วยเกณฑ์ที่โปร่งใส', 'Rotate into cross-team work and decide by transparent criteria.'),
    })
  const overload = (s.KJ + s.BK + s.C + (100 - s.E)) / 4
  if (overload >= 65)
    out.push({
      id: 'overload',
      level: overload >= 74 ? 'high' : 'watch',
      title: tt('เสี่ยงรับงานเกินตัว', 'At risk of taking on too much'),
      short: tt('งานล้น', 'Overload risk'),
      detail: tt('ไม่ปฏิเสธงานเพราะเกรงใจและรับผิดชอบสูง แต่เก็บความเครียดไว้', "Doesn't refuse work out of deference and duty, but keeps the stress inside."),
      support: tt('ช่วยจัดลำดับงาน และบอกชัดว่าการปฏิเสธงานที่เกินกำลังเป็นเรื่องปกติ', "Help prioritise, and make it clear that saying no to too much work is normal."),
    })
  return out
}
