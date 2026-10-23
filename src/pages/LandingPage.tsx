import { ArrowRight, Building2, Lock, Play } from 'lucide-react'
import { useNavigate } from 'react-router'
import { SameTypeShowcase } from '@/components/charts/SameType'
import { CodeCharacter, tint } from '@/components/character/RoleCharacter'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { CHARACTER_GROUPS, CHARACTERS } from '@/domain/characters'
import { itemCount } from '@/domain/levels'
import { useT } from '@/lib/i18n'
import { useAssessment } from '@/store/assessment'

/**
 * Home, in the spirit of the best-known personality sites: one promise, one action, nothing in the way.
 * Everything else (the code guide, the 16 characters, organisation tools) is one tap away.
 */
export function LandingPage() {
  const t = useT()
  const navigate = useNavigate()
  const fillDemo = useAssessment((s) => s.fillDemo)
  const completed = useAssessment((s) => s.completedAt)
  const sample = useAssessment((s) => s.sample)

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* Promise + one action */}
      <section className="grid items-center gap-10 pt-2 lg:grid-cols-[1fr_1.05fr] lg:pt-8">
        <div>
          <h1 className="text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl">{t('“คนที่เข้าใจตัวเอง ทำงานกับคนอื่นได้ดีกว่า”', '“Understand yourself, and work better with everyone”')}</h1>
          <p className="mt-4 max-w-lg text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            {t('5 นาที รู้ว่าคุณเป็นตัวละครแบบไหนในที่ทำงาน ทำงานแบบไหน และควรคุยอะไรกับหัวหน้าและทีม ออกแบบมาเพื่อคนทำงานไทย', 'In 5 minutes, find your work character, how you work, and what to talk through with your manager and team. Built for Thai workplaces.')}
          </p>
          <Button variant="primary" size="lg" to="/test" iconRight={ArrowRight} className="mt-7 w-full sm:w-auto sm:px-10">
            {completed && !sample ? t('ทำแบบทดสอบอีกครั้ง', 'Take the test again') : t('ทำแบบทดสอบ', 'Take the test')}
          </Button>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Lock size={14} /> {t('ฟรี ไม่ต้องสมัคร คำตอบอยู่บนเครื่องคุณ', 'Free, no sign-up, answers stay on your device')}
            </span>
            <button
              type="button"
              onClick={() => {
                fillDemo()
                navigate('/me')
              }}
              className="flex min-h-10 items-center gap-1.5 font-medium text-violet-700 dark:text-violet-300"
            >
              <Play size={14} /> {t('ดูผลตัวอย่าง', 'See a sample result')}
            </button>
          </div>
        </div>

        {/* The 16 characters, a row per group colour */}
        <div className="rounded-[1.75rem] bg-slate-100/80 p-3 sm:p-4 dark:bg-white/[0.04]">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
            {CHARACTERS.map((c, i) => {
              const g = CHARACTER_GROUPS.find((x) => x.key === c.group)!
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => navigate(`/personas/${c.key}`)}
                  className="animate-pop flex flex-col items-center gap-0.5 rounded-2xl px-0.5 pb-2 pt-2 transition hover:-translate-y-0.5 active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600"
                  style={{ animationDelay: `${i * 35}ms`, background: tint(g.color, 0.86) }}
                >
                  <CodeCharacter code={c.key} size={64} />
                  <span className="text-center text-xs font-semibold leading-tight text-slate-800">{t(c.name).replace(/^The /, '')}</span>
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">{t('16 ตัวละคร ใน 4 สาย · แตะเพื่อดู', '16 characters in 4 groups · tap to explore')}</p>
        </div>
      </section>

      {/* How it works, in 3 steps */}
      <section>
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">{t('ง่าย ๆ 3 ขั้น', 'Three simple steps')}</h2>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            { n: 1, h: t('ตอบตามจริง', 'Answer honestly'), p: t(`${itemCount('quick')} ข้อ ประมาณ 5 นาที ไม่มีถูกหรือผิด`, `${itemCount('quick')} items, about 5 minutes, no right or wrong answers`) },
            { n: 2, h: t('พบตัวละครของคุณ', 'Meet your character'), p: t('รหัส 7 ตัวอักษร ตัวละคร 1 ใน 16 และรายงานเฉพาะคุณ', 'A 7-letter code, 1 of 16 characters and a report about you') },
            { n: 3, h: t('ใช้ได้จริงกับทีม', 'Use it with your team'), p: t('ประเด็นคุยกับหัวหน้า ข้อตกลงในการทำงาน และงานที่น่าสำรวจ', 'Topics for your manager, working agreements and work worth exploring') },
          ].map((x) => (
            <Card key={x.n} className="text-center">
              <span className="mx-auto grid size-10 place-items-center rounded-full bg-violet-700 text-lg font-semibold text-white dark:bg-violet-600">{x.n}</span>
              <h3 className="mt-3 text-lg font-semibold">{x.h}</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{x.p}</p>
            </Card>
          ))}
        </div>
        <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          {t('อยากแม่นขึ้น? ทำต่อเป็นระดับมาตรฐาน (15 นาที) หรือมืออาชีพ (30 นาที) ได้ทุกเมื่อ', 'Want more accuracy? Go on to Standard (15 min) or Professional (30 min) any time.')}
        </p>
      </section>

      {/* One live example of what makes this different */}
      <section>
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">{t('ตัวละครเดียวกัน ก็ไม่ใช่คนเดียวกัน', 'Same character, not the same person')}</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-slate-600 dark:text-slate-300">
          {t('รายงานของคุณสร้างจากคำตอบของคุณเอง ไม่ใช่คำบรรยายตัวละครที่ทุกคนได้เหมือนกัน', 'Your report is built from your own answers, not a character description everyone gets.')}
        </p>
        <div className="mt-8">
          <SameTypeShowcase />
        </div>
      </section>

      {/* Organisations: one quiet line */}
      <section>
        <Card className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300">
            <Building2 size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="font-semibold">{t('สำหรับองค์กร', 'For organisations')}</div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t('ทีม สรรหาคน และ Persona Lab ช่วยเห็นคนเก่งที่เงียบ ลดพรรคพวก และไม่จัดอันดับหรือคัดคนออกอัตโนมัติ', 'Team map, sourcing and Persona Lab help you see quiet talent and cliques, with no automatic ranking or rejection.')}
            </p>
          </div>
          <Button iconRight={ArrowRight} to="/org">
            {t('ดูเครื่องมือองค์กร', 'See organisation tools')}
          </Button>
        </Card>
      </section>

      {/* Final call to action */}
      <section className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('พร้อมรู้จักตัวเองแล้วหรือยัง?', 'Ready to meet yourself?')}</h2>
        <Button variant="primary" size="lg" to="/test" iconRight={ArrowRight} className="mt-6 w-full sm:w-auto sm:px-10">
          {t('ทำแบบทดสอบ', 'Take the test')}
        </Button>
      </section>
    </div>
  )
}
