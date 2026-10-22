import { tt, type T } from '@/lib/i18n'
import { DIMENSIONS } from './dimensions'
import type { DimCode, Layer } from './types'

/* ------------------------------------------------------------------------------------------------
 * Deep modules: optional layers on top of the 18 core dimensions.
 *   1. Facets         — 3 per dimension (54), 2 items each. Shows *how* a trait shows up:
 *                       e.g. เกรงใจ toward seniors vs. peers vs. customers.
 *   2. Motivators     — 8 drivers of why someone works and stays (16 items).
 *   3. Pressure risks — 6 ways strengths overdo under stress (18 items).
 *   4. Learning agility — how fast someone learns and adapts (6 items).
 * 18 + 54 + 8 + 6 + 1 = 87 measured aspects. Original wording; needs expert review before a pilot.
 * ---------------------------------------------------------------------------------------------- */

export type ModuleId = 'facets-core' | 'facets-thai' | 'facets-work' | 'motivators' | 'pressure' | 'agility'

export interface DeepItem {
  id: string
  module: ModuleId
  /** Facet, motivator or risk id, or 'LA' for learning agility. */
  key: string
  keyed: 1 | -1
  text: T
}

type Pair = [string, string]

/* ------------------------------------------- Facets ------------------------------------------- */

export interface Facet {
  id: string
  dim: DimCode
  name: T
}

const FACET_DEFS: [DimCode, string, Pair, Pair, Pair][] = [
  // dim, facet key, name, + item, − item
  ['H', 'sincerity', ['ไม่เสแสร้ง', 'Sincerity'], ['ฉันไม่ประจบใครเพื่อให้ได้สิ่งที่ต้องการ', "I don't flatter people to get what I want"], ['ฉันทำดีกับคนที่มีประโยชน์กับฉันเป็นพิเศษ', "I'm extra nice to people who can be useful to me"]],
  ['H', 'fairness', ['ความยุติธรรม', 'Fairness'], ['ฉันไม่โกงแม้รู้ว่าจะไม่มีใครจับได้', "I wouldn't cheat even if I knew I'd never be caught"], ['ถ้าได้ประโยชน์มาก ฉันยอมเลี่ยงกฎบ้าง', "If the gain is big, I'd bend the rules a little"]],
  ['H', 'modesty', ['ความถ่อมตน', 'Modesty'], ['ฉันไม่ต้องการให้ใครปฏิบัติกับฉันเป็นพิเศษ', "I don't want special treatment"], ['ฉันคิดว่าตัวเองเก่งกว่าคนส่วนใหญ่', "I think I'm better than most people"]],
  ['E', 'calm', ['ใจนิ่งเมื่อกดดัน', 'Calm under stress'], ['เส้นตายใกล้เข้ามาก็ไม่ทำให้ฉันตื่นตระหนก', "Approaching deadlines don't make me panic"], ['ฉันเครียดง่ายเมื่องานไม่เป็นไปตามแผน', 'I get stressed easily when work goes off plan']],
  ['E', 'resilience', ['ฟื้นตัวเร็ว', 'Resilience'], ['หลังทำผิดพลาด ฉันลุกขึ้นทำต่อได้เร็ว', 'After a mistake I get back on track quickly'], ['ความผิดหวังติดอยู่ในใจฉันหลายวัน', 'Disappointments stay with me for days']],
  ['E', 'assurance', ['มั่นใจในตัวเอง', 'Self-assurance'], ['ฉันไม่ต้องการคำชมเพื่อรู้ว่าทำได้ดี', "I don't need praise to know I did well"], ['ฉันกังวลมากว่าคนอื่นจะคิดอย่างไรกับงานของฉัน', 'I worry a lot about what others think of my work']],
  ['X', 'sociability', ['ชอบเข้าสังคม', 'Sociability'], ['ฉันชอบไปงานสังสรรค์ของบริษัท', 'I enjoy company social events'], ['ฉันเลี่ยงกิจกรรมที่ต้องเจอคนแปลกหน้า', 'I avoid activities with strangers']],
  ['X', 'boldness', ['กล้าแสดงออก', 'Social boldness'], ['ฉันกล้าพูดต่อหน้าคนจำนวนมาก', "I'm comfortable speaking in front of a crowd"], ['ฉันประหม่าเมื่อต้องเป็นจุดสนใจ', 'I feel nervous being the centre of attention']],
  ['X', 'liveliness', ['กระตือรือร้น', 'Liveliness'], ['คนบอกว่าฉันมีพลังและกระตือรือร้น', "People say I'm energetic and enthusiastic"], ['ฉันไม่ค่อยแสดงความตื่นเต้นในที่ทำงาน', 'I rarely show excitement at work']],
  ['A', 'forgiveness', ['ให้อภัย', 'Forgiveness'], ['ฉันให้โอกาสคนที่เคยทำผิดกับฉัน', 'I give second chances to people who wronged me'], ['ฉันไม่ลืมเมื่อมีคนหักหลัง', 'I never forget when someone betrays me']],
  ['A', 'gentleness', ['นุ่มนวล', 'Gentleness'], ['ฉันวิจารณ์งานคนอื่นอย่างนุ่มนวล', "I criticise others' work gently"], ['ฉันชี้ข้อผิดพลาดของคนอื่นตรง ๆ แม้จะแรง', "I point out others' mistakes bluntly, even harshly"]],
  ['A', 'patience', ['อดทนต่อคน', 'Patience'], ['ฉันใจเย็นเมื่อต้องอธิบายซ้ำหลายรอบ', 'I stay patient when I have to explain things again'], ['ฉันหงุดหงิดง่ายเมื่อคนอื่นไม่เข้าใจ', "I get irritated quickly when others don't get it"]],
  ['C', 'organisation', ['เป็นระเบียบ', 'Organisation'], ['ฉันจัดลำดับงานก่อนเริ่มวันใหม่', 'I prioritise my tasks before starting each day'], ['โต๊ะหรือไฟล์ของฉันมักรก', 'My desk or files are often messy']],
  ['C', 'diligence', ['ขยัน', 'Diligence'], ['ฉันทำงานหนักเพื่อให้ได้มาตรฐานสูง', 'I work hard to reach a high standard'], ['ฉันทำแค่พอผ่าน', 'I do just enough to get by']],
  ['C', 'prudence', ['คิดก่อนทำ', 'Prudence'], ['ฉันคิดถึงผลที่จะตามมาก่อนตัดสินใจ', 'I think about consequences before I decide'], ['ฉันมักทำตามอารมณ์ชั่ววูบ', 'I often act on impulse']],
  ['O', 'aesthetic', ['ชอบความงาม', 'Aesthetic sense'], ['ฉันสังเกตเห็นการออกแบบที่สวยงามรอบตัว', 'I notice good design around me'], ['เรื่องความสวยงามไม่สำคัญสำหรับงานของฉัน', "Aesthetics don't matter in my work"]],
  ['O', 'curiosity', ['อยากรู้อยากเห็น', 'Curiosity'], ['ฉันชอบอ่านหรือดูเรื่องที่ไม่เคยรู้', 'I like reading or watching things I know nothing about'], ['ฉันไม่ค่อยสงสัยว่าสิ่งต่าง ๆ ทำงานอย่างไร', 'I rarely wonder how things work']],
  ['O', 'creativity', ['สร้างสรรค์', 'Creativity'], ['ฉันมักคิดวิธีแก้ปัญหาที่ไม่มีใครคิด', 'I often find solutions no one else thought of'], ['ฉันชอบทำตามตัวอย่างมากกว่าคิดเอง', 'I prefer following examples to inventing my own']],
  ['KJ', 'seniors', ['เกรงใจผู้ใหญ่', 'Toward seniors'], ['ฉันไม่กล้าขัดหัวหน้าแม้จะคิดว่าผิด', "I don't dare contradict my boss even when I think they're wrong"], ['ฉันบอกหัวหน้าได้ตรง ๆ เมื่อแผนมีปัญหา', 'I can tell my boss directly when a plan has problems']],
  ['KJ', 'peers', ['เกรงใจเพื่อน', 'Toward peers'], ['ฉันไม่กล้าขอให้เพื่อนร่วมงานช่วย กลัวเป็นภาระ', "I hesitate to ask colleagues for help in case I'm a burden"], ['ฉันบอกเพื่อนได้เลยเมื่องานของเขาทำให้ฉันติดขัด', 'I tell colleagues right away when their work blocks mine']],
  ['KJ', 'customers', ['เกรงใจลูกค้า', 'Toward customers'], ['ฉันยอมตามลูกค้าแม้คำขอจะไม่สมเหตุสมผล', 'I go along with customers even when requests are unreasonable'], ['ฉันปฏิเสธลูกค้าอย่างสุภาพได้เมื่อจำเป็น', 'I can politely say no to customers when needed']],
  ['SN', 'respect', ['เคารพผู้ใหญ่', 'Respect for elders'], ['ฉันให้รุ่นพี่พูดก่อนในที่ประชุมเสมอ', 'I always let seniors speak first in meetings'], ['อายุงานไม่ได้ทำให้ความเห็นใครสำคัญกว่า', "Seniority doesn't make anyone's opinion matter more"]],
  ['SN', 'decisions', ['ให้ผู้ใหญ่ตัดสิน', 'Top-down decisions'], ['การตัดสินใจสำคัญควรเป็นของหัวหน้าเท่านั้น', "Important decisions should be the boss's alone"], ['ทุกคนในทีมควรมีส่วนในการตัดสินใจ', 'Everyone in the team should share in decisions']],
  ['SN', 'formality', ['ความเป็นทางการ', 'Formality'], ['ฉันใช้คำสุภาพและตำแหน่งเมื่อคุยกับผู้ใหญ่', 'I use polite forms and titles with seniors'], ['ฉันเรียกทุกคนแบบเป็นกันเองไม่ว่าตำแหน่งใด', 'I address everyone casually, whatever their rank']],
  ['FC', 'own', ['กลัวเสียหน้าตัวเอง', 'Own face'], ['ฉันอายมากถ้าทำผิดต่อหน้าคนอื่น', "I'm very embarrassed if I make a mistake in front of others"], ['ฉันยอมรับความผิดพลาดต่อหน้าทีมได้ง่าย', 'I easily admit mistakes in front of the team']],
  ['FC', 'others', ['ถนอมหน้าคนอื่น', "Others' face"], ['ฉันเลือกคำพูดเพื่อไม่ให้ใครอับอาย', 'I choose my words so no one is embarrassed'], ['ฉันไม่ค่อยคิดว่าคำพูดตรง ๆ จะทำให้ใครเสียหน้า', 'I rarely think blunt words will make someone lose face']],
  ['FC', 'image', ['ภาพลักษณ์', 'Image'], ['ภาพลักษณ์ในสายตาคนอื่นสำคัญกับฉันมาก', 'How others see me matters a lot to me'], ['ฉันไม่ค่อยสนว่าคนอื่นจะมองฉันอย่างไร', "I don't care much how others see me"]],
  ['SK', 'fun', ['บรรยากาศสนุก', 'Fun at work'], ['งานที่สนุกทำให้ฉันทำงานได้ดีขึ้นมาก', 'Fun work makes me perform much better'], ['ฉันทำงานได้ดีแม้บรรยากาศจะจริงจัง', 'I work fine in a serious atmosphere']],
  ['SK', 'bonding', ['ความสนิทนอกงาน', 'Bonding'], ['ฉันอยากรู้จักเพื่อนร่วมงานนอกเหนือจากเรื่องงาน', 'I want to know colleagues beyond work'], ['ฉันแยกเรื่องงานกับเรื่องส่วนตัวชัดเจน', 'I keep work and personal life clearly apart']],
  ['SK', 'humour', ['อารมณ์ขันคลายเครียด', 'Humour'], ['ฉันชอบใช้อารมณ์ขันคลายเครียดในทีม', 'I like using humour to ease tension in the team'], ['มุกตลกระหว่างงานทำให้ฉันเสียสมาธิ', 'Jokes during work break my focus']],
  ['MP', 'time', ['ยืดหยุ่นเรื่องเวลา', 'Time flexibility'], ['สาย 10–15 นาทีเป็นเรื่องปกติ', 'Being 10–15 minutes late is normal'], ['ฉันตรงต่อเวลาเสมอ และคาดหวังให้คนอื่นตรงเวลา', "I'm always on time and expect others to be"]],
  ['MP', 'detail', ['ยอมรับความไม่สมบูรณ์', 'Detail tolerance'], ['ความผิดพลาดเล็ก ๆ ไม่เป็นไรถ้าภาพรวมดี', 'Small errors are fine if the big picture is right'], ['ความผิดพลาดเล็ก ๆ ทำให้ฉันไม่สบายใจ', 'Small errors bother me']],
  ['MP', 'plans', ['ยืดหยุ่นเรื่องแผน', 'Plan flexibility'], ['ฉันชอบตัดสินใจหน้างานมากกว่าวางแผนละเอียด', "I'd rather decide on the spot than plan in detail"], ['ฉันอยากให้ทุกอย่างเป็นไปตามแผนที่ตกลงไว้', 'I want everything to go as agreed']],
  ['BK', 'reciprocity', ['ตอบแทนบุญคุณ', 'Reciprocity'], ['ฉันจำได้เสมอว่าใครเคยช่วยฉัน และหาโอกาสตอบแทน', 'I always remember who helped me and find ways to repay them'], ['การช่วยเหลือในงานเป็นหน้าที่ ไม่ใช่บุญคุณ', 'Help at work is part of the job, not a debt']],
  ['BK', 'loyalty', ['ภักดีต่อหัวหน้า', 'Loyalty to the boss'], ['ฉันจะอยู่กับหัวหน้าที่ดีกับฉัน แม้มีข้อเสนอที่ดีกว่า', "I'd stay with a boss who treats me well even with a better offer"], ['ฉันเลือกงานจากโอกาส ไม่ใช่จากความผูกพัน', 'I choose jobs by opportunity, not attachment']],
  ['BK', 'ingroup', ['ไว้ใจคนในกลุ่ม', 'In-group trust'], ['ฉันไว้ใจคนในกลุ่มของฉันมากกว่าคนนอก', 'I trust people in my circle more than outsiders'], ['ฉันปฏิบัติกับทุกคนเท่ากันไม่ว่าสนิทหรือไม่', 'I treat everyone the same, close or not']],
  ['LD', 'charge', ['รับผิดชอบนำ', 'Taking charge'], ['ฉันอาสารับผิดชอบเมื่องานไม่มีเจ้าของ', 'I volunteer to own tasks that have no owner'], ['ฉันรอให้คนอื่นมอบหมายงาน', 'I wait for others to assign work']],
  ['LD', 'influence', ['โน้มน้าวทีม', 'Influencing'], ['ฉันโน้มน้าวทีมให้ไปทางเดียวกันได้', 'I can get the team to agree on a direction'], ['ฉันไม่ชอบพยายามเปลี่ยนความคิดของคนอื่น', "I don't like trying to change others' minds"]],
  ['LD', 'develop', ['พัฒนาคน', 'Developing others'], ['ฉันชอบสอนและพัฒนาน้อง ๆ', 'I enjoy coaching and developing juniors'], ['ฉันชอบโฟกัสงานตัวเองมากกว่าดูแลคนอื่น', 'I prefer focusing on my own work to looking after others']],
  ['PC', 'decisive', ['ตัดสินใจเร็ว', 'Decision speed'], ['ฉันตัดสินใจได้ภายในไม่กี่นาที', 'I can make decisions within minutes'], ['ฉันต้องใช้เวลาคิดนานก่อนตัดสินใจ', 'I need a long time before I decide']],
  ['PC', 'multitask', ['ทำหลายอย่างพร้อมกัน', 'Multitasking'], ['ฉันสลับทำหลายงานพร้อมกันได้ดี', 'I switch between many tasks well'], ['ฉันทำงานได้ดีที่สุดเมื่อทำทีละอย่าง', 'I work best on one thing at a time']],
  ['PC', 'urgency', ['ความเร่งด่วน', 'Urgency'], ['ฉันอยากให้งานเสร็จเร็วที่สุดเสมอ', 'I always want things done as fast as possible'], ['ฉันยอมช้าเพื่อให้งานถูกต้อง', "I'd rather be slow and get it right"]],
  ['CO', 'teamwork', ['ทำงานเป็นทีม', 'Teamwork'], ['ฉันได้ผลงานดีกว่าเมื่อทำเป็นทีม', 'I get better results working as a team'], ['การทำงานกลุ่มมักทำให้ช้าลง', 'Group work usually slows things down']],
  ['CO', 'sharing', ['แบ่งปันข้อมูล', 'Sharing'], ['ฉันแชร์ข้อมูลที่มีให้ทีมเสมอ', 'I always share what I know with the team'], ['ฉันเก็บข้อมูลไว้จนกว่าจะมีคนถาม', 'I keep information until someone asks']],
  ['CO', 'crossteam', ['ประสานข้ามฝ่าย', 'Cross-team work'], ['ฉันชอบประสานงานกับแผนกอื่น', 'I enjoy coordinating with other departments'], ['การประสานหลายฝ่ายทำให้ฉันเหนื่อย', 'Coordinating many parties drains me']],
  ['ST', 'process', ['ชอบขั้นตอนมาตรฐาน', 'Process'], ['ฉันทำงานได้ดีขึ้นเมื่อมีขั้นตอนมาตรฐาน', 'Standard procedures help me work better'], ['ขั้นตอนมาตรฐานทำให้ฉันอึดอัด', 'Standard procedures feel restrictive to me']],
  ['ST', 'clarity', ['ต้องการเป้าหมายชัด', 'Need for clarity'], ['ฉันต้องรู้ชัดว่าความสำเร็จหน้าตาเป็นอย่างไรก่อนเริ่ม', 'I need to know what success looks like before starting'], ['ฉันเริ่มงานได้แม้เป้าหมายยังไม่ชัด', 'I can start even when the goal is fuzzy']],
  ['ST', 'guidance', ['ต้องการคำแนะนำ', 'Need for guidance'], ['ฉันชอบให้หัวหน้าบอกวิธีทำ', 'I like my boss to tell me how to do it'], ['ฉันอยากออกแบบวิธีทำงานเอง', 'I want to design my own way of working']],
  ['CH', 'novelty', ['ลองสิ่งใหม่', 'Novelty'], ['ฉันลองเครื่องมือหรือแอปใหม่ ๆ ก่อนคนอื่น', 'I try new tools or apps before others'], ['ฉันใช้เครื่องมือเดิมจนกว่าจะถูกบังคับให้เปลี่ยน', 'I stick with old tools until forced to change']],
  ['CH', 'reorg', ['รับการเปลี่ยนแปลงใหญ่', 'Handling big change'], ['การปรับโครงสร้างองค์กรทำให้ฉันตื่นเต้นมากกว่ากังวล', 'Reorganisations excite me more than worry me'], ['การเปลี่ยนแปลงใหญ่ทำให้ฉันเครียด', 'Big changes stress me out']],
  ['CH', 'variety', ['ชอบงานหลากหลาย', 'Variety'], ['ฉันเบื่อถ้างานซ้ำเดิมทุกวัน', 'I get bored if every day is the same'], ['ฉันชอบงานประจำที่รู้ว่าต้องทำอะไร', 'I like routine work where I know what to do']],
  ['PR', 'promote', ['บอกผลงานตัวเอง', 'Self-promotion'], ['ฉันบอกหัวหน้าเมื่อทำผลงานได้ดี', 'I tell my boss when I achieve something'], ['ฉันรอให้คนอื่นสังเกตเห็นผลงานเอง', 'I wait for others to notice my work']],
  ['PR', 'persuade', ['ขายไอเดีย', 'Persuasion'], ['ฉันขายไอเดียให้ผู้บริหารได้', 'I can sell ideas to executives'], ['ฉันไม่มั่นใจเวลาต้องโน้มน้าวผู้ใหญ่', "I'm not confident persuading senior people"]],
  ['PR', 'visibility', ['ออกหน้า', 'Visibility'], ['ฉันอาสานำเสนองานของทีม', "I volunteer to present the team's work"], ['ฉันชอบอยู่เบื้องหลังมากกว่าออกหน้า', 'I prefer being behind the scenes']],
]

export const FACETS: Facet[] = FACET_DEFS.map(([dim, key, name]) => ({ id: `${dim}.${key}`, dim, name: tt(...name) }))

const layerOf = (dim: DimCode): Layer => DIMENSIONS.find((d) => d.code === dim)?.layer ?? 'core'
const facetModule = (dim: DimCode): ModuleId => ({ core: 'facets-core', thai: 'facets-thai', work: 'facets-work' } as const)[layerOf(dim)]

const FACET_ITEMS: DeepItem[] = FACET_DEFS.flatMap(([dim, key, , plus, minus]) => [
  { id: `f.${dim}.${key}.p`, module: facetModule(dim), key: `${dim}.${key}`, keyed: 1 as const, text: tt(...plus) },
  { id: `f.${dim}.${key}.m`, module: facetModule(dim), key: `${dim}.${key}`, keyed: -1 as const, text: tt(...minus) },
])

/* ------------------------------------------ Motivators ---------------------------------------- */

export type MotivatorId = 'security' | 'reward' | 'recognition' | 'growth' | 'purpose' | 'belonging' | 'autonomy' | 'challenge'

export interface Motivator {
  id: MotivatorId
  name: T
  /** What keeps this person engaged — for them and their manager. */
  keep: T
}

const M = (id: MotivatorId, name: Pair, keep: Pair, a: Pair, b: Pair) => ({ id, name: tt(...name), keep: tt(...keep), items: [a, b] })

const MOTIVATOR_DEFS = [
  M('security', ['ความมั่นคง', 'Security'], ['สัญญาจ้างที่ชัด เส้นทางอาชีพที่คาดเดาได้ และการสื่อสารล่วงหน้าเมื่อมีการเปลี่ยนแปลง', 'Clear contracts, a predictable career path and early notice of change'], ['งานที่มั่นคงสำคัญกับฉันมากกว่าเงินเดือนสูง', 'A secure job matters more to me than a high salary'], ['ฉันอยากทำงานกับองค์กรที่มั่นคงไปนาน ๆ', 'I want to stay long-term at a stable organisation']),
  M('reward', ['ผลตอบแทน', 'Reward'], ['ผลตอบแทนที่ผูกกับผลงานอย่างโปร่งใส และการทบทวนเงินเดือนตรงเวลา', 'Pay clearly linked to results and on-time salary reviews'], ['รายได้เป็นเหตุผลหลักที่ฉันเลือกงาน', 'Pay is the main reason I choose a job'], ['โบนัสหรือคอมมิชชันกระตุ้นให้ฉันทำงานหนักขึ้น', 'Bonuses or commission push me to work harder']),
  M('recognition', ['การยอมรับ', 'Recognition'], ['คำชมที่เจาะจงและสม่ำเสมอ การให้เครดิตต่อหน้าคนอื่น และตำแหน่งที่สะท้อนผลงาน', 'Specific, regular praise, public credit and titles that reflect contribution'], ['ฉันมีกำลังใจมากเมื่อถูกชมต่อหน้าคนอื่น', 'Public praise motivates me a lot'], ['ตำแหน่งและชื่อเสียงสำคัญกับฉัน', 'Titles and status matter to me']),
  M('growth', ['การเติบโต', 'Growth'], ['โปรเจกต์ที่ยืดความสามารถ การอบรม และแผนพัฒนาที่คุยกันทุกไตรมาส', 'Stretch projects, training and a development plan reviewed every quarter'], ['ฉันอยากเรียนรู้ทักษะใหม่ในงานตลอดเวลา', 'I want to keep learning new skills at work'], ['ฉันจะย้ายงานถ้าไม่ได้เติบโต', "I'd change jobs if I stopped growing"]),
  M('purpose', ['ความหมาย', 'Purpose'], ['เห็นว่างานส่งผลต่อลูกค้าหรือสังคมอย่างไร และได้ทำงานที่ตรงกับคุณค่าของตัวเอง', 'Seeing how the work affects customers or society, and work that fits their values'], ['ฉันต้องรู้ว่างานของฉันช่วยใครหรือสังคมอย่างไร', 'I need to know how my work helps people or society'], ['ฉันยอมได้เงินน้อยกว่าถ้างานมีความหมาย', "I'd accept less pay for meaningful work"]),
  M('belonging', ['ความสัมพันธ์', 'Belonging'], ['ทีมที่อบอุ่น หัวหน้าที่ใส่ใจ และกิจกรรมที่ได้ใช้เวลาร่วมกัน', 'A warm team, a caring manager and time spent together'], ['เพื่อนร่วมงานที่ดีเป็นเหตุผลที่ฉันอยู่ทำงาน', 'Good colleagues are why I stay in a job'], ['ฉันอยากรู้สึกเป็นส่วนหนึ่งของครอบครัวในที่ทำงาน', 'I want to feel part of a family at work']),
  M('autonomy', ['อิสระ', 'Autonomy'], ['เป้าหมายชัดแต่ให้เลือกวิธีเอง ยืดหยุ่นเรื่องเวลาและสถานที่', 'Clear goals with freedom over method, time and place'], ['ฉันอยากกำหนดเวลาและวิธีทำงานเอง', 'I want to set my own hours and methods'], ['การถูกควบคุมใกล้ชิดทำให้ฉันหมดไฟ', 'Being closely controlled burns me out']),
  M('challenge', ['ความท้าทาย', 'Challenge'], ['เป้าหมายที่ท้าทาย งานยากที่คนอื่นไม่กล้ารับ และการแข่งขันที่ยุติธรรม', 'Stretch targets, hard problems others avoid and fair competition'], ['ฉันชอบงานที่ยากจนคนอื่นไม่กล้ารับ', 'I like work so hard others avoid it'], ['ฉันมีพลังเมื่อได้แข่งขันหรือมีเป้าหมายสูง', 'Competition and high targets energise me']),
]

export const MOTIVATORS: Motivator[] = MOTIVATOR_DEFS.map(({ id, name, keep }) => ({ id, name, keep }))

const MOTIVATOR_ITEMS: DeepItem[] = MOTIVATOR_DEFS.flatMap(({ id, items }) =>
  items.map(([th, en], i) => ({ id: `m.${id}.${i + 1}`, module: 'motivators' as const, key: id, keyed: 1 as const, text: tt(th, en) })),
)

/* ---------------------------------------- Pressure risks -------------------------------------- */

export type RiskId = 'overconfidence' | 'volatility' | 'avoidance' | 'control' | 'pleasing' | 'blame'

export interface PressureRisk {
  id: RiskId
  name: T
  /** The strength it grows from — framed so people can hear it. */
  from: T
  looks: T
  helps: T
}

const R = (id: RiskId, name: Pair, from: Pair, looks: Pair, helps: Pair, items: Pair[]) => ({ id, name: tt(...name), from: tt(...from), looks: tt(...looks), helps: tt(...helps), items })

const RISK_DEFS = [
  R('overconfidence', ['มั่นใจเกินไป', 'Overconfidence'], ['ความมั่นใจและการตัดสินใจเด็ดขาด', 'Confidence and decisiveness'], ['ไม่ฟังความเห็นอื่น ตัดสินใจเร็วเกินจากข้อมูลไม่ครบ', 'Stops listening and decides too fast on too little'], ['ตั้งกติกาให้ตัวเองถามความเห็น 2 คนก่อนตัดสินใจเรื่องใหญ่', 'Make a rule to ask two people before any big decision'], [
    ['ฉันมักคิดว่าวิธีของฉันดีที่สุด', 'I usually think my way is best'],
    ['ฉันไม่ค่อยขอความเห็นคนอื่นก่อนตัดสินใจ', 'I rarely ask for input before deciding'],
    ['เมื่อเครียด ฉันยิ่งมั่นใจในตัวเองมากขึ้น', 'Under stress I get even more sure of myself'],
  ]),
  R('volatility', ['อารมณ์ขึ้นลง', 'Volatility'], ['ความใส่ใจและพลังที่สูง', 'Passion and high energy'], ['พูดแรงหรือหงุดหงิดเมื่อกดดัน ทำให้ทีมไม่กล้าเข้าหา', 'Snaps or gets irritable under pressure, so the team stops approaching'], ['หยุด 10 วินาทีก่อนตอบเมื่อรู้สึกโกรธ และขอโทษเร็วเมื่อพลาด', 'Pause ten seconds before replying when angry, and apologise quickly'], [
    ['เมื่อกดดัน ฉันอาจพูดแรงโดยไม่ตั้งใจ', 'Under pressure I may speak harshly without meaning to'],
    ['อารมณ์ของฉันเปลี่ยนเร็วเมื่องานมีปัญหา', 'My mood shifts fast when work goes wrong'],
    ['คนรอบตัวต้องระวังคำพูดเมื่อฉันเครียด', "People tread carefully around me when I'm stressed"],
  ]),
  R('avoidance', ['หลบปัญหา', 'Avoidance'], ['ความใจเย็นและการรักษาน้ำใจ', 'Calm and care for harmony'], ['เงียบเมื่อมีความขัดแย้ง ปัญหาเล็กโตเป็นปัญหาใหญ่', 'Goes quiet in conflict, so small problems grow'], ['ยกปัญหาภายใน 48 ชั่วโมงแบบตัวต่อตัว เริ่มด้วยข้อเท็จจริง', 'Raise issues within 48 hours, one to one, starting with facts'], [
    ['เมื่อมีความขัดแย้ง ฉันมักเงียบและรอให้ผ่านไป', 'In conflict I tend to go quiet and wait it out'],
    ['ฉันเลื่อนการพูดเรื่องยากออกไปเรื่อย ๆ', 'I keep putting off difficult conversations'],
    ['ฉันพูดว่าโอเคแม้ใจไม่โอเค', "I say it's fine when it isn't"],
  ]),
  R('control', ['ควบคุมทุกอย่าง', 'Micromanaging'], ['มาตรฐานสูงและความรับผิดชอบ', 'High standards and ownership'], ['ตรวจทุกขั้นตอน ไม่มอบหมาย ทีมไม่ได้เติบโต', 'Checks every step and won’t delegate, so the team doesn’t grow'], ['มอบหมายพร้อมเกณฑ์ “เสร็จ” ที่ชัด แล้วตรวจที่ผลลัพธ์ ไม่ใช่ระหว่างทาง', 'Delegate with a clear definition of done, then check results, not steps'], [
    ['เมื่องานสำคัญ ฉันตรวจงานคนอื่นทุกขั้นตอน', "When work matters, I check every step of others' work"],
    ['ฉันมอบหมายงานยาก เพราะกลัวไม่ได้มาตรฐาน', 'I find it hard to delegate in case standards slip'],
    ['ฉันแก้งานของคนอื่นเองแทนการให้เขาแก้', "I fix others' work myself instead of letting them"],
  ]),
  R('pleasing', ['เอาใจทุกคน', 'People-pleasing'], ['ความเกรงใจและน้ำใจ', 'Kreng jai and generosity'], ['รับปากเกินกำลัง เปลี่ยนความเห็นตามคนตรงหน้า', 'Overcommits and shifts opinions to match whoever is in front of them'], ['ฝึกตอบว่า “ขอเช็กงานก่อนนะ” แทนการตอบรับทันที', 'Practise saying “Let me check my workload first” instead of an instant yes'], [
    ['ฉันรับปากทุกคนแม้รู้ว่าทำไม่ทัน', "I say yes to everyone even when I can't deliver"],
    ['ฉันกลัวคนอื่นไม่ชอบฉันถ้าปฏิเสธ', "I fear people won't like me if I refuse"],
    ['ฉันเปลี่ยนความเห็นตามคนที่คุยด้วย', "I change my opinion to match whoever I'm talking to"],
  ]),
  R('blame', ['โทษคนอื่น', 'Blaming'], ['การปกป้องตัวเองและทีม', 'Protecting self and team'], ['มองว่าความผิดเป็นของคนอื่นหรือระบบ ทีมไม่กล้ายอมรับผิด', 'Sees fault in others or the system, so the team stops owning mistakes'], ['เริ่มทบทวนงานด้วย “ส่วนที่ฉันทำได้ดีกว่านี้คือ…”', 'Start every review with “What I could have done better is…”'], [
    ['เมื่องานพลาด ฉันมักเห็นว่าเป็นความผิดของคนอื่นหรือระบบ', "When things go wrong I usually see it as others' or the system's fault"],
    ['ฉันไม่ค่อยยอมรับว่าตัวเองผิด', 'I rarely admit I was wrong'],
    ['ฉันเก็บหลักฐานไว้เผื่อต้องปกป้องตัวเอง', 'I keep evidence in case I need to defend myself'],
  ]),
]

export const PRESSURE_RISKS: PressureRisk[] = RISK_DEFS.map(({ items: _items, ...r }) => r)

const RISK_ITEMS: DeepItem[] = RISK_DEFS.flatMap(({ id, items }) =>
  items.map(([th, en], i) => ({ id: `r.${id}.${i + 1}`, module: 'pressure' as const, key: id, keyed: 1 as const, text: tt(th, en) })),
)

/* --------------------------------------- Learning agility ------------------------------------- */

const AGILITY_ITEMS: DeepItem[] = (
  [
    [1, 'ฉันเรียนรู้เครื่องมือใหม่ได้เร็ว', 'I pick up new tools quickly'],
    [1, 'ฉันขอ feedback เพื่อพัฒนาตัวเองบ่อย ๆ', 'I often ask for feedback to improve'],
    [1, 'ฉันเปลี่ยนวิธีทำงานทันทีเมื่อรู้ว่ามีวิธีที่ดีกว่า', 'I change how I work as soon as I learn a better way'],
    [1, 'ฉันชอบทบทวนความผิดพลาดเพื่อหาบทเรียน', 'I like reflecting on mistakes to find the lesson'],
    [-1, 'ฉันทำแบบที่เคยทำมาตลอด แม้มีวิธีใหม่', 'I keep doing it my usual way even when there is a new way'],
    [-1, 'ฉันไม่ค่อยสนใจเรียนเรื่องนอกงานของฉัน', "I'm not keen to learn things outside my job"],
  ] as const
).map(([keyed, th, en], i) => ({ id: `a.${i + 1}`, module: 'agility' as const, key: 'LA', keyed, text: tt(th, en) }))

/* ------------------------------------------- Modules ------------------------------------------ */

export const DEEP_ITEMS: DeepItem[] = [...FACET_ITEMS, ...MOTIVATOR_ITEMS, ...RISK_ITEMS, ...AGILITY_ITEMS]

export interface DeepModule {
  id: ModuleId
  name: T
  blurb: T
  minutes: number
  items: DeepItem[]
}

const itemsOf = (m: ModuleId) => DEEP_ITEMS.filter((i) => i.module === m)

export const DEEP_MODULES: DeepModule[] = [
  { id: 'motivators', name: tt('แรงจูงใจ', 'Motivators'), blurb: tt('อะไรทำให้คุณอยากทำงานและอยู่ต่อ', 'What makes you want to work, and stay'), minutes: 3, items: itemsOf('motivators') },
  { id: 'pressure', name: tt('ความเสี่ยงเมื่อกดดัน', 'Under pressure'), blurb: tt('จุดแข็งที่อาจกลายเป็นปัญหาเมื่อเครียด', 'Strengths that can overdo under stress'), minutes: 3, items: itemsOf('pressure') },
  { id: 'facets-thai', name: tt('เจาะลึกมิติไทย', 'Thai dimensions in depth'), blurb: tt('เกรงใจ อาวุโส หน้าตา สนุก ไม่เป็นไร บุญคุณ อย่างละ 3 ด้าน', '3 facets each of kreng jai, seniority, face, sanuk, mai pen rai, bunkhun'), minutes: 5, items: itemsOf('facets-thai') },
  { id: 'facets-core', name: tt('เจาะลึกบุคลิกพื้นฐาน', 'Core personality in depth'), blurb: tt('HEXACO 6 มิติ อย่างละ 3 ด้าน', '3 facets each of the 6 HEXACO dimensions'), minutes: 5, items: itemsOf('facets-core') },
  { id: 'facets-work', name: tt('เจาะลึกสไตล์การทำงาน', 'Work style in depth'), blurb: tt('นำ ความเร็ว ทีม โครงสร้าง การเปลี่ยนแปลง การนำเสนอ อย่างละ 3 ด้าน', '3 facets each of lead, pace, teamwork, structure, change, presentation'), minutes: 5, items: itemsOf('facets-work') },
  { id: 'agility', name: tt('ความไวในการเรียนรู้', 'Learning agility'), blurb: tt('เรียนรู้และปรับตัวได้เร็วแค่ไหน', 'How fast you learn and adapt'), minutes: 1, items: itemsOf('agility') },
]

/** 18 core + 54 facets + 8 motivators + 6 risks + 1 agility. */
export const TOTAL_ASPECTS = 18 + FACETS.length + MOTIVATORS.length + PRESSURE_RISKS.length + 1

/* ------------------------------------------- Scoring ------------------------------------------ */

export type DeepAnswers = Record<string, number>

const scoreKeys = (answers: DeepAnswers, items: DeepItem[]) => {
  const sums = new Map<string, number[]>()
  for (const item of items) {
    const a = answers[item.id]
    if (!a) continue
    const v = item.keyed === 1 ? a : 7 - a
    sums.set(item.key, [...(sums.get(item.key) ?? []), ((v - 1) / 5) * 100])
  }
  const out: Record<string, number> = {}
  for (const [k, xs] of sums) out[k] = Math.round(xs.reduce((s, x) => s + x, 0) / xs.length)
  return out
}

export const moduleDone = (answers: DeepAnswers, m: DeepModule) => m.items.filter((i) => answers[i.id]).length

export interface DeepProfile {
  facets: Record<string, number>
  motivators: { m: Motivator; score: number }[]
  risks: { r: PressureRisk; score: number; level: 'low' | 'watch' | 'high' }[]
  agility?: number
  measured: number
  /** Largest gap between facets of the same dimension, e.g. kreng jai high with seniors, low with peers. */
  splits: { dim: DimCode; high: Facet; low: Facet; gap: number }[]
}

export const deepProfile = (answers: DeepAnswers): DeepProfile => {
  const facets = scoreKeys(answers, FACET_ITEMS)
  const mot = scoreKeys(answers, MOTIVATOR_ITEMS)
  const risk = scoreKeys(answers, RISK_ITEMS)
  const ag = scoreKeys(answers, AGILITY_ITEMS).LA
  const motivators = MOTIVATORS.filter((m) => mot[m.id] !== undefined)
    .map((m) => ({ m, score: mot[m.id] }))
    .sort((a, b) => b.score - a.score)
  const risks = PRESSURE_RISKS.filter((r) => risk[r.id] !== undefined)
    .map((r) => ({ r, score: risk[r.id], level: (risk[r.id] >= 75 ? 'high' : risk[r.id] >= 60 ? 'watch' : 'low') as 'low' | 'watch' | 'high' }))
    .sort((a, b) => b.score - a.score)
  const splits = DIMENSIONS.map((d) => {
    const fs = FACETS.filter((f) => f.dim === d.code && facets[f.id] !== undefined).sort((a, b) => facets[b.id] - facets[a.id])
    if (fs.length < 2) return null
    const high = fs[0]
    const low = fs[fs.length - 1]
    return { dim: d.code, high, low, gap: facets[high.id] - facets[low.id] }
  })
    .filter((x): x is NonNullable<typeof x> => Boolean(x) && (x?.gap ?? 0) >= 30)
    .sort((a, b) => b.gap - a.gap)
  const measured = 18 + Object.keys(facets).length + motivators.length + risks.length + (ag === undefined ? 0 : 1)
  return { facets, motivators, risks, agility: ag, measured, splits }
}
