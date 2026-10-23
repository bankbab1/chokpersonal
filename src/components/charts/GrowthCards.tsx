import { Check, Handshake, Link2, Plus, Trash2, Wrench } from 'lucide-react'
import { useState } from 'react'
import { characterOf } from '@/domain/characters'
import { compareContext, CONTEXT_DIMS, MANAGER_TEMPLATES, ROLE_TYPES } from '@/domain/roles'
import type { Scores } from '@/domain/types'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { useAssessment, type Agreement, type SkillClaim } from '@/store/assessment'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Sheet } from '../ui/Sheet'
import { SectionTitle } from './RoleResults'

const uid = () => Math.random().toString(36).slice(2, 9)

const LEVELS: { id: SkillClaim['level']; th: string; en: string }[] = [
  { id: 1, th: 'กำลังเรียนรู้', en: 'Learning' },
  { id: 2, th: 'ทำได้เมื่อมีคนช่วย', en: 'With help' },
  { id: 3, th: 'ทำได้เอง', en: 'On my own' },
  { id: 4, th: 'สอนคนอื่นได้', en: 'Can teach' },
]

/** Skill names suggested from the 12 roles' "skills to check" (Thai/English pairs, de-duplicated). */
const SUGGESTED = [...new Map(ROLE_TYPES.flatMap((r) => r.skills).map((s) => [s.en, s])).values()]

const input =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-base outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-500/15 sm:h-10 sm:text-sm dark:border-white/15 dark:bg-white/[0.04]'

/* --------------------------------------------- Skills --------------------------------------------- */

/** Skills you say you have, with optional evidence. Kept apart from personality: it never changes a score. */
export function SkillsCard() {
  const t = useT()
  const skills = useAssessment((s) => s.skills)
  const setSkills = useAssessment((s) => s.setSkills)
  const [name, setName] = useState('')
  const add = (n: string) => {
    const v = n.trim()
    if (!v || skills.some((s) => s.name.toLowerCase() === v.toLowerCase())) return
    setSkills([...skills, { id: uid(), name: v, level: 2 }])
    setName('')
  }
  const update = (id: string, patch: Partial<SkillClaim>) => setSkills(skills.map((s) => (s.id === id ? { ...s, ...patch } : s)))
  const left = SUGGESTED.filter((s) => !skills.some((k) => k.name === t(s)))

  return (
    <Card>
      <SectionTitle icon={Wrench} title={t('ทักษะของฉัน', 'My skills')} note={t('ระบุเอง · ไม่เปลี่ยนคะแนนบุคลิก', 'self-reported · never changes personality scores')} />
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {t(
          'ตัวละครบอกว่าคุณชอบทำงานแบบไหน ทักษะบอกว่าทำอะไรได้ ใส่ลิงก์หรือบันทึกผลงานจริงเพื่อให้หัวหน้าหรือ HR ตรวจได้ภายหลัง',
          'Your character shows how you like to work; skills show what you can do. Add a link or note to real work so a manager or HR can review it later.',
        )}
      </p>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          add(name)
        }}
      >
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('เพิ่มทักษะ เช่น Excel, ขายหน้าร้าน', 'Add a skill, e.g. Excel, retail sales')} className={input} />
        <Button type="submit" variant="primary" icon={Plus} disabled={!name.trim()}>
          {t('เพิ่ม', 'Add')}
        </Button>
      </form>
      {left.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {left.slice(0, 8).map((s) => (
            <button
              key={s.en}
              type="button"
              onClick={() => add(t(s))}
              className="min-h-8 rounded-full border border-dashed border-slate-300 px-2.5 text-xs text-slate-600 transition hover:border-violet-400 hover:text-violet-700 active:scale-95 dark:border-white/20 dark:text-slate-300 dark:hover:text-violet-300"
            >
              + {t(s)}
            </button>
          ))}
        </div>
      )}

      {skills.length > 0 && (
        <ul className="mt-4 divide-y divide-slate-200/80 rounded-xl border border-slate-200/80 dark:divide-white/[0.08] dark:border-white/[0.08]">
          {skills.map((s) => (
            <li key={s.id} className="p-3">
              <div className="flex items-center gap-2">
                <span className="min-w-0 flex-1 font-medium">{s.name}</span>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    s.evidence ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300',
                  )}
                >
                  {s.evidence ? t('มีหลักฐาน · รอตรวจ', 'Evidence · not reviewed') : t('ระบุเอง', 'Self-reported')}
                </span>
                <Button size="sm" variant="ghost" iconOnly icon={Trash2} onClick={() => setSkills(skills.filter((x) => x.id !== s.id))}>
                  {t('ลบ', 'Remove')}
                </Button>
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1" role="radiogroup" aria-label={t('ระดับ', 'Level')}>
                {LEVELS.map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    role="radio"
                    aria-checked={s.level === l.id}
                    onClick={() => update(s.id, { level: l.id })}
                    className={cn(
                      'min-h-9 rounded-lg px-1 text-xs transition-colors',
                      s.level === l.id ? 'bg-violet-700 font-semibold text-white dark:bg-violet-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/[0.06] dark:text-slate-300 dark:hover:bg-white/10',
                    )}
                  >
                    {t(l.th, l.en)}
                  </button>
                ))}
              </div>
              <label className="relative mt-2 block">
                <span className="sr-only">{t('หลักฐาน', 'Evidence')}</span>
                <Link2 size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={s.evidence ?? ''}
                  onChange={(e) => update(s.id, { evidence: e.target.value || undefined })}
                  placeholder={t('ลิงก์หรือบันทึกผลงาน (ไม่บังคับ)', 'Link or note to real work (optional)')}
                  className={cn(input, 'pl-8')}
                />
              </label>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

/* ------------------------------------------- Agreements ------------------------------------------- */

const blank = (): Agreement => ({ id: uid(), withWhom: '', topic: '', action: '', owner: '', due: '', success: '', done: false })

/** Working agreements: what we agree, who does it, by when, and how we'll know it works (spec F-19). */
export function AgreementsCard({ scores }: { scores: Scores }) {
  const t = useT()
  const list = useAssessment((s) => s.agreements)
  const setList = useAssessment((s) => s.setAgreements)
  const context = useAssessment((s) => s.context)
  const [draft, setDraft] = useState<Agreement | null>(null)
  const ch = characterOf(scores)

  // Starting points: the character's own "agree together" line, and any confirmed context that is far
  // from a balanced manager (distance > 25).
  const ideas = [
    t(ch.workWithMe),
    ...compareContext(context, { autonomy: { min: MANAGER_TEMPLATES[1].anchor, max: MANAGER_TEMPLATES[1].anchor } })
      .filter((g) => g.discuss)
      .map((g) => t(`ตกลงเรื่อง${CONTEXT_DIMS.find((d) => d.id === g.dim)!.name.th}`, `Agree on ${CONTEXT_DIMS.find((d) => d.id === g.dim)!.name.en.toLowerCase()}`)),
  ]
  const save = () => {
    if (!draft || !draft.action.trim()) return
    setList(list.some((a) => a.id === draft.id) ? list.map((a) => (a.id === draft.id ? draft : a)) : [...list, draft])
    setDraft(null)
  }

  return (
    <Card>
      <SectionTitle icon={Handshake} title={t('ข้อตกลงในการทำงาน', 'Working agreements')} note={t(`${list.filter((a) => !a.done).length} ข้อที่ยังทำอยู่`, `${list.filter((a) => !a.done).length} open`)} />
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {t(
          'เลือก 1–3 เรื่องที่อยากปรับกับหัวหน้าหรือทีม ตกลงว่าใครทำอะไร เมื่อไหร่ และจะรู้ได้อย่างไรว่าได้ผล แล้วกลับมาดูตามวันที่นัดไว้',
          'Pick 1–3 things to adjust with your manager or team: who does what, by when, and how you will know it works. Then check back on the agreed date.',
        )}
      </p>

      {list.length > 0 && (
        <ul className="mt-4 space-y-2">
          {list.map((a) => (
            <li key={a.id} className={cn('rounded-xl border p-3', a.done ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-400/20 dark:bg-emerald-400/5' : 'border-slate-200/80 dark:border-white/[0.08]')}>
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  aria-pressed={a.done}
                  aria-label={t('ทำแล้ว', 'Done')}
                  onClick={() => setList(list.map((x) => (x.id === a.id ? { ...x, done: !x.done } : x)))}
                  className={cn('mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border-2', a.done ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 dark:border-white/25')}
                >
                  {a.done && <Check size={14} strokeWidth={3} />}
                </button>
                <button type="button" onClick={() => setDraft(a)} className="min-w-0 flex-1 text-left">
                  <span className={cn('block font-medium', a.done && 'text-slate-500 line-through')}>{a.action}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {[a.withWhom && t(`กับ ${a.withWhom}`, `with ${a.withWhom}`), a.owner && t(`ผู้รับผิดชอบ: ${a.owner}`, `owner: ${a.owner}`), a.due && t(`ภายใน ${a.due}`, `by ${a.due}`)].filter(Boolean).join(' · ')}
                  </span>
                  {a.success && <span className="mt-0.5 block text-xs text-slate-600 dark:text-slate-300">{t('ดูผลจาก: ', 'We will know by: ')}{a.success}</span>}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="primary" icon={Plus} onClick={() => setDraft(blank())} disabled={list.filter((a) => !a.done).length >= 3}>
          {t('เพิ่มข้อตกลง', 'Add an agreement')}
        </Button>
        {list.filter((a) => !a.done).length >= 3 && <span className="self-center text-xs text-slate-500 dark:text-slate-400">{t('ทีละไม่เกิน 3 ข้อจะทำได้จริงกว่า', 'Up to 3 at a time works best')}</span>}
      </div>

      <Sheet open={draft !== null} onClose={() => setDraft(null)} label={t('ข้อตกลงในการทำงาน', 'Working agreement')}>
        {draft && (
          <form
            className="space-y-3 pr-1"
            onSubmit={(e) => {
              e.preventDefault()
              save()
            }}
          >
            <h2 className="pr-10 text-xl font-semibold">{t('ข้อตกลงในการทำงาน', 'Working agreement')}</h2>
            <div className="flex flex-wrap gap-1.5">
              {ideas.map((i) => (
                <button key={i} type="button" onClick={() => setDraft({ ...draft, topic: i })} className="rounded-full bg-violet-50 px-2.5 py-1 text-left text-xs text-violet-800 active:scale-95 dark:bg-violet-500/15 dark:text-violet-200">
                  {i}
                </button>
              ))}
            </div>
            {(
              [
                ['topic', t('เรื่องที่อยากปรับ', 'What to adjust'), t('เช่น วิธีส่ง feedback', 'e.g. how feedback is given')],
                ['action', t('จะทำอะไร (จำเป็น)', 'The action (required)'), t('เช่น คุยตัวต่อตัวทุกวันศุกร์ 15 นาที', 'e.g. a 15-minute 1:1 every Friday')],
                ['withWhom', t('กับใคร', 'With whom'), t('เช่น พี่หัวหน้าทีม', 'e.g. my team lead')],
                ['owner', t('ใครรับผิดชอบ', 'Owner'), t('เช่น ฉัน', 'e.g. me')],
                ['success', t('จะรู้ได้อย่างไรว่าได้ผล', 'How we will know it works'), t('เช่น ได้ feedback ก่อนงานส่ง', 'e.g. feedback arrives before deadlines')],
              ] as const
            ).map(([k, label, ph]) => (
              <label key={k} className="block">
                <span className="mb-1 block text-sm font-medium">{label}</span>
                <input value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} placeholder={ph} className={input} required={k === 'action'} />
              </label>
            ))}
            <label className="block">
              <span className="mb-1 block text-sm font-medium">{t('ทบทวนภายในวันที่', 'Review by')}</span>
              <input type="date" value={draft.due} onChange={(e) => setDraft({ ...draft, due: e.target.value })} className={cn(input, 'dark:[color-scheme:dark]')} />
            </label>
            <div className="flex justify-between gap-2 pt-2">
              {list.some((a) => a.id === draft.id) ? (
                <Button
                  variant="ghost"
                  icon={Trash2}
                  className="text-red-600 dark:text-red-400"
                  onClick={() => {
                    setList(list.filter((a) => a.id !== draft.id))
                    setDraft(null)
                  }}
                >
                  {t('ลบ', 'Delete')}
                </Button>
              ) : (
                <span />
              )}
              <Button type="submit" variant="primary" disabled={!draft.action.trim()}>
                {t('บันทึก', 'Save')}
              </Button>
            </div>
          </form>
        )}
      </Sheet>
    </Card>
  )
}

/* ---------------------------------------- Sharing & profile ---------------------------------------- */

function Switch({ checked, onChange, label, detail }: { checked: boolean; onChange: (v: boolean) => void; label: string; detail: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-xl p-3 transition hover:bg-slate-50 dark:hover:bg-white/[0.04]">
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-violet-600 peer-focus-visible:ring-2 peer-focus-visible:ring-violet-600 peer-focus-visible:ring-offset-2 dark:bg-white/15" />
        <span className="absolute left-0.5 top-0.5 size-6 rounded-full bg-white shadow transition peer-checked:translate-x-5" />
      </span>
      <span>
        <span className="block font-medium">{label}</span>
        <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">{detail}</span>
      </span>
    </label>
  )
}

/** Name, background and sharing choices — asked here, when they matter, not before the test. */
export function SharingCard() {
  const t = useT()
  const { name, setName, consent, setConsent, background, setBackground } = useAssessment()
  return (
    <Card>
      <SectionTitle icon={Handshake} title={t('การแชร์และข้อมูลส่วนตัว', 'Sharing & profile')} note={t('ส่วนตัวโดยค่าเริ่มต้น', 'private by default')} />
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-medium">{t('ชื่อที่แสดงในผล', 'Name on your result')}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('เช่น มายด์', 'e.g. Alex')} className={input} />
        </label>
        <div>
          <span className="mb-1 block text-sm font-medium">{t('พื้นหลังของคุณ (ใช้กับสะพานวัฒนธรรมเท่านั้น)', 'Your background (Culture Bridge only)')}</span>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ['thai', t('คนไทย', 'Thai')],
                ['foreign', t('ไม่ใช่คนไทย', 'Not Thai')],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={background === id}
                onClick={() => setBackground(id)}
                className={cn('h-11 rounded-xl border text-sm font-medium transition sm:h-10', background === id ? 'border-violet-600 bg-violet-50 text-violet-900 dark:bg-violet-500/15 dark:text-violet-100' : 'border-slate-200 dark:border-white/10')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 space-y-1">
        <Switch
          checked={consent.team}
          onChange={(v) => setConsent({ team: v })}
          label={t('แสดงใน Team map ของทีม', 'Show me on my team’s Team map')}
          detail={t('หัวหน้าและทีมเห็นตัวละครและสรุป ไม่เห็นคำตอบรายข้อ', 'Your manager and team see your character and summary, not your answers.')}
        />
        <Switch
          checked={consent.hr}
          onChange={(v) => setConsent({ hr: v })}
          label={t('เปิดรับโอกาสย้ายงานภายใน', 'Open to internal opportunities')}
          detail={t('ทีมสรรหาค้นหาคุณได้เมื่อมีตำแหน่งที่เหมาะ ไม่มีการจัดอันดับหรือคัดออกอัตโนมัติ', 'Recruiters can find you for suitable roles. No ranking or automatic rejection.')}
        />
      </div>
    </Card>
  )
}
