import { ArrowRight, Compass, EyeOff, FileCheck2, Fingerprint, Gem, Globe2, Lock, MessageCircleOff, Play, ShieldCheck, SlidersHorizontal, Users, UsersRound, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router'
import { SameTypeShowcase } from '@/components/charts/SameType'
import { CodeCharacter, tint } from '@/components/character/RoleCharacter'
import { ORG_NAV } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Card, Chip, Eyebrow } from '@/components/ui/Card'
import { DIMENSIONS } from '@/domain/dimensions'
import { CHARACTER_GROUPS, CHARACTERS } from '@/domain/characters'
import { MARKET_COMPARISON } from '@/domain/styles'
import { useT } from '@/lib/i18n'
import { useAssessment } from '@/store/assessment'

/** Hero ring order: the two types of each family sit side by side. */

export function LandingPage() {
  const t = useT()
  const navigate = useNavigate()
  const fillDemo = useAssessment((s) => s.fillDemo)
  const completed = useAssessment((s) => s.completedAt)

  const demo = () => {
    fillDemo()
    navigate('/me')
  }

  const layers = [
    {
      icon: Compass,
      title: t('ตัวละครของคุณ', 'Your character'),
      tag: t('16 แบบ ใน 4 สาย', '16 in 4 groups'),
      body: t('มาจาก 4 ตัวอักษรแรกของรหัส จำง่าย เห็นภาพทันที', 'From the first 4 letters of your code: easy to remember, instantly visual'),
    },
    {
      icon: Fingerprint,
      title: t('สไตล์การทำงาน', 'How you work'),
      tag: t('Workfit Code', 'Workfit Code'),
      body: t('18 มิติ รวมเรื่องไทย ๆ อย่างเกรงใจ อาวุโส และรักษาหน้า', '18 dimensions, including Thai ones like kreng jai, seniority and face'),
    },
    {
      icon: SlidersHorizontal,
      title: t('บริบทที่ต้องการ', 'Context you need'),
      tag: t('ไว้คุยกับหัวหน้า', 'To talk through with a manager'),
      body: t('อิสระ ความเปลี่ยนแปลง จังหวะทำงานกับคนอื่น ที่คุณยืนยันเอง', 'Autonomy, change and collaboration rhythm, confirmed by you'),
    },
    {
      icon: FileCheck2,
      title: t('หลักฐานทักษะ', 'Skill evidence'),
      tag: t('เร็ว ๆ นี้', 'Coming soon'),
      body: t('ทักษะต้องดูจากผลงานจริง แยกจากตัวละคร', 'Skills are shown by real work, separate from your character'),
    },
  ]

  const youGet = [
    {
      icon: UsersRound,
      title: t('คนรอบตัวเห็นคุณแบบไหน', 'How others see you'),
      body: t('ชวนหัวหน้า เพื่อน หรือน้องให้ประเมินคุณ แล้วดูจุดบอดและจุดแข็งที่ซ่อนอยู่', 'Invite a manager, colleague or friend to rate you, then see blind spots and hidden strengths'),
    },
    {
      icon: Globe2,
      title: t('สะพานวัฒนธรรมไทย–ต่างชาติ', 'Thai–foreign culture bridge'),
      body: t('สไตล์ของคุณจะถูกมองอย่างไรในทีมนานาชาติ หรือในทีมคนไทย', 'How your style lands in an international team, or in a Thai team'),
    },
  ]

  const pains = [
    { icon: Gem, title: t('พูดเก่ง ≠ ทำเก่ง', 'Talking well ≠ delivering well'), body: t('Workfit แยก “พูด” กับ “ทำ” ออกจากกัน ช่วยให้คนเงียบที่ทำงานดีถูกมองเห็น', 'Workfit separates “say” from “do”, so quiet high performers get seen') },
    { icon: Users, title: t('แบ่งพรรคแบ่งพวก', 'Cliques'), body: t('รู้ว่าตัวเองผูกกลุ่มแค่ไหน และทีมเสี่ยงแบ่งกลุ่มหรือเปล่า', 'See how strongly you lean into in-groups, and whether a team risks splitting') },
    { icon: MessageCircleOff, title: t('เกรงใจจนไม่กล้าพูด', 'Too kreng jai to speak up'), body: t('เกรงใจเป็นเรื่องดี แต่ถ้ามากไปอาจไม่มีใครรู้ว่าคุณงานล้นหรือถูกกดดัน', 'Kreng jai is a strength, but too much means no one knows you are overloaded or pressured') },
  ]

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="grid items-center gap-10 pt-6 lg:grid-cols-[1.1fr_1fr] lg:pt-12">
        <div className="animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-medium text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-200">
            <span className="size-1.5 rounded-full bg-violet-700 dark:bg-violet-300" />
            {t('รู้จักตัวตนการทำงาน แบบที่เข้าใจคนไทย', 'Know your working self, in a way that gets Thai workplaces')}
          </span>
          <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight">
            {t('คุณอยากรับบทไหนในทีม?', 'Which role do you want on the team?')}
            <br />
            <span className="text-violet-700 dark:text-violet-300">{t('ค้นหาตัวละครการทำงานของคุณ', 'Meet your work character')}</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            {t(
              'รู้ว่าคุณอยากรับบทแบบไหน ทำงานสไตล์ไหน และควรคุยอะไรกับหัวหน้าและทีม ออกแบบมาเพื่อที่ทำงานแบบไทย',
              'Find the role you want, how you work, and what to talk through with your manager and team. Built for Thai workplaces.',
            )}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="primary" size="lg" to="/test" iconRight={ArrowRight}>
              {completed ? t('ทำแบบทดสอบอีกครั้ง', 'Retake the test') : t('เริ่มทำแบบทดสอบ', 'Start the test')}
            </Button>
            <Button size="lg" icon={Play} onClick={demo}>
              {t('ดูผลตัวอย่าง', 'See a sample result')}
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Lock size={14} /> {t('ผลเป็นของคุณ', 'Your results are yours')}
            </span>
            <span className="flex items-center gap-1.5">
              <EyeOff size={14} /> {t('คำตอบดิบไม่มีใครเห็น', 'No one sees your raw answers')}
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={14} /> {t('ภาษาไทย และ English', 'Thai and English')}
            </span>
          </div>
        </div>

        {/* 16 characters as labelled tiles, one row per group colour. */}
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
                  <span className="text-xs font-semibold tracking-wide" style={{ color: g.color }}>
                    {c.key}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
            {t('4 สาย × 4 ตัวละคร · แตะเพื่อดู', '4 groups × 4 characters · tap to explore')}
          </p>
        </div>
      </section>

      {/* Layers */}
      <section>
        <Eyebrow>{t('สิ่งที่คุณจะได้', 'What you get')}</Eyebrow>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{t('4 ชั้น แยกกันชัด ไม่รวมเป็นคะแนนเดียว', '4 clear layers, never one combined score')}</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {layers.map(({ icon: Icon, title, tag, body }, i) => (
            <Card key={title} className="animate-rise" style={{ animationDelay: `${i * 70}ms` }}>
              <div className="flex items-center justify-between gap-2">
                <div className="grid size-10 place-items-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-400/10 dark:text-violet-300">
                  <Icon size={20} />
                </div>
                <Chip>{tag}</Chip>
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{body}</p>
            </Card>
          ))}
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {youGet.map(({ icon: Icon, title, body }) => (
            <Card key={title} className="flex gap-4">
              <Icon size={22} className="mt-0.5 shrink-0 text-violet-700 dark:text-violet-300" />
              <div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{body}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Groups */}
      <section>
        <Eyebrow>{t('4 สาย · 16 ตัวละคร', '4 groups · 16 characters')}</Eyebrow>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{t('รหัสบอกทุกอย่าง อ่านง่ายเป็นมาตรฐาน', 'One code says it all, the same way for everyone')}</h2>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
          {t(
            'ตัวอักษร 1–2 บอกสาย ตัวอักษร 1–4 บอกตัวละคร ตัวอักษร 5–7 บอกวิธีทำงานกับคนแบบไทย ทุกตัวละครมีคุณค่าเท่ากัน',
            'Letters 1–2 give your group, letters 1–4 your character, letters 5–7 how you work with people Thai-style. Every character has equal value.',
          )}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {CHARACTER_GROUPS.map((g) => (
            <button
              key={g.key}
              type="button"
              onClick={() => navigate('/personas')}
              className="group rounded-2xl p-4 text-left transition active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600"
              style={{ background: tint(g.color, 0.86) }}
            >
              <div className="font-semibold" style={{ color: g.color }}>
                {t(g.plural)} · {g.key}
              </div>
              <div className="text-xs text-slate-600">{t(g.letters)}</div>
              <div className="mt-3 grid grid-cols-4 gap-1">
                {CHARACTERS.filter((c) => c.group === g.key).map((c) => (
                  <div key={c.key} className="flex min-w-0 flex-col items-center text-center">
                    <CodeCharacter code={c.key} size={60} className="transition group-hover:scale-105" />
                    <div className="mt-0.5 text-xs font-medium leading-tight text-slate-800">{t(c.name).replace(/^The /, '')}</div>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>
        <div className="mt-6">
          <Button to="/personas" iconRight={ArrowRight}>
            {t('ดูตัวละครทั้ง 16 แบบ', 'See all 16 characters')}
          </Button>
        </div>
      </section>

      {/* Pain points */}
      <section>
        <Eyebrow>{t('เรื่องที่คนทำงานไทยเจอทุกวัน', 'What Thai workplaces face every day')}</Eyebrow>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{t('เห็นสิ่งที่ label เดียวบอกไม่ได้', 'See what a single label never shows')}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {pains.map(({ icon: Icon, title, body }) => (
            <Card key={title}>
              <Icon size={22} className="text-violet-700 dark:text-violet-300" />
              <h3 className="mt-3 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works — bento */}
      <section>
        <Eyebrow>{t('ทำงานอย่างไร', 'How it works')}</Eyebrow>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{t('ลึกกว่า label เดียว', 'Deeper than one label')}</h2>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="text-sm font-semibold text-violet-700 dark:text-violet-300">{t('1 · คำถามหลายรูปแบบ', '1 · Several question formats')}</div>
            <h3 className="mt-1 text-xl font-semibold">{t('ตอบยากที่จะ “แต่งให้ดูดี”', 'Hard to “fake good”')}</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                [t('50 ข้อ', '50 items'), t('สเกล 6 ระดับ ไม่มีตัวเลือกกลาง', '6-point scale, no middle option'), t('ตัดปัญหาตอบกลาง ๆ แบบเกรงใจ', 'Stops polite middle answers')],
                [t('22 ชุด', '22 sets'), t('เลือก “เหมือนฉันที่สุด / น้อยที่สุด”', 'Pick “most / least like me”'), t('ทุกข้อน่าเลือกพอกัน จึงแต่งคำตอบยาก', 'All options look equally good, so faking is hard')],
                [t('12 สถานการณ์', '12 scenarios'), t('สถานการณ์จริงในที่ทำงาน', 'Real workplace situations'), t('เห็นพฤติกรรมตอนกดดัน อยู่กับผู้ใหญ่ น้อง และลูกค้า', 'Shows behaviour under pressure and with seniors, juniors, customers')],
              ].map(([n, ti, d]) => (
                <div key={n} className="rounded-2xl bg-slate-900/[0.03] p-4 dark:bg-white/[0.04]">
                  <div className="text-xl font-semibold">{n}</div>
                  <div className="mt-1 text-sm font-medium">{ti}</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{d}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <div className="text-sm font-semibold text-violet-700 dark:text-violet-300">{t('2 · 18 มิติ → เจาะลึกได้ 87 ด้าน', '2 · 18 dimensions → up to 87 aspects')}</div>
            <h3 className="mt-1 text-xl font-semibold">{t('มากกว่าแค่ “ใช่ หรือ ไม่ใช่”', 'More than just “yes or no”')}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t('+ ด้านย่อย 54 · แรงจูงใจ 8 · ความเสี่ยงเมื่อกดดัน 6 · ความไวในการเรียนรู้', '+ 54 facets · 8 motivators · 6 under-pressure risks · learning agility')}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {DIMENSIONS.map((d) => (
                <span key={d.code} className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs dark:border-white/10 dark:bg-white/5">
                  {t(d.th, d.en)}
                </span>
              ))}
            </div>
          </Card>
          <Card>
            <div className="text-sm font-semibold text-violet-700 dark:text-violet-300">{t('3 · 16 ตัวละคร + 3 ระดับ', '3 · 16 characters + 3 levels')}</div>
            <h3 className="mt-1 text-xl font-semibold">{t('อยากทำอะไร กับ ทำงานแบบไหน', 'What you want to do, and how you work')}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {t(
                'เลือกได้ว่าอยากรู้ลึกแค่ไหน: เร็ว 5 นาที มาตรฐาน 15 นาที หรือมืออาชีพ 30 นาทีที่เพิ่ม 12 บทบาทที่อยากทำ รหัส 7 ตัวอักษรแบบ INBC-HMW บอกตัวละครและบริบทคนไทย',
                'Choose your depth: Quick 5 min, Standard 15 min, or Professional 30 min with 12 role interests. A 7-letter code like INBC-HMW gives your character and Thai context',
              )}
            </p>
          </Card>
          <Card className="lg:col-span-2">
            <div className="text-sm font-semibold text-violet-700 dark:text-violet-300">{t('4 · เครื่องมือสำหรับองค์กร', '4 · Tools for organisations')}</div>
            <h3 className="mt-1 text-xl font-semibold">{t('เมื่อพร้อม แชร์ผลกับทีมได้', 'Share with your team when you are ready')}</h3>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {ORG_NAV.map(({ to, label, icon: Icon, blurb }) => (
                <button
                  key={to}
                  type="button"
                  onClick={() => navigate(to)}
                  className="rounded-2xl bg-slate-900/[0.03] p-3 text-left transition hover:bg-slate-900/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
                >
                  <Icon size={18} className="text-violet-700 dark:text-violet-300" />
                  <div className="mt-2 text-sm font-semibold">{t(label)}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{t(blurb)}</div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Same type, different people */}
      <section>
        <Eyebrow>{t('ทำไมรหัสเดียวไม่พอ', 'Why one code is not enough')}</Eyebrow>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{t('ประเภทเดียวกัน ≠ คนเดียวกัน', 'Same type ≠ same person')}</h2>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
          {t(
            'แบบทดสอบที่แบ่งคนเป็นกล่องตัดสินจากจุดตัดไม่กี่จุด คนกล่องเดียวกันจึงยังต่างกันได้มาก Workfit จึงแสดงคะแนนจริงและบอกว่าคุณต่างจากคนประเภทเดียวกันตรงไหน',
            'Box-style tests decide on a few cut-offs, so people in the same box can still differ a lot. Workfit shows the real scores and where you differ from others of your type.',
          )}
        </p>
        <div className="mt-8">
          <SameTypeShowcase />
        </div>
      </section>

      {/* Market comparison */}
      <section>
        <Eyebrow>{t('เทียบกับเครื่องมือที่มีในตลาด', 'Compared with popular tools')}</Eyebrow>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{t('เก็บข้อดีของทุกเครื่องมือ แล้วปิดจุดอ่อน', 'Keep what each tool does well, fix what it misses')}</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          {t('เทียบเฉพาะฟีเจอร์ ผล Workfit ไม่ได้แปลงหรือเท่ากับผลของเครื่องมืออื่น', 'A feature comparison only. Workfit results do not convert to, or equal, results from other tools.')}
        </p>
        {/* Phones: a grouped list that expands per tool, instead of 7 tall cards. */}
        <Card className="mt-6 p-0 md:hidden">
          <ul className="divide-y divide-slate-200/80 dark:divide-white/[0.08]">
            {MARKET_COMPARISON.map((m) => (
              <li key={m.tool.en}>
                <details className="group">
                  <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-medium active:bg-slate-50 dark:active:bg-white/[0.04]">
                    {t(m.tool)}
                    <ChevronDown size={18} className="shrink-0 text-slate-400 transition group-open:rotate-180" />
                  </summary>
                  <div className="space-y-2 px-4 pb-4 text-sm">
                    {m.keep && (
                      <p>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">{t('เก็บไว้: ', 'Keep: ')}</span>
                        <span className="text-slate-600 dark:text-slate-300">{t(m.keep)}</span>
                      </p>
                    )}
                    <p>
                      <span className="font-semibold text-violet-700 dark:text-violet-300">{t('Workfit ทำดีกว่า: ', 'Workfit does better: ')}</span>
                      <span className="text-slate-600 dark:text-slate-300">{t(m.fix)}</span>
                    </p>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </Card>
        <div className="mt-8 hidden gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
          {MARKET_COMPARISON.map((m) => (
            <Card key={m.tool.en} className="p-5">
              <div className="font-semibold">{t(m.tool)}</div>
              {m.keep && (
                <p className="mt-2 text-sm">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">{t('เก็บไว้: ', 'Keep: ')}</span>
                  <span className="text-slate-600 dark:text-slate-300">{t(m.keep)}</span>
                </p>
              )}
              <p className="mt-2 text-sm">
                <span className="font-semibold text-violet-700 dark:text-violet-300">{t('Workfit ทำดีกว่า: ', 'Workfit does better: ')}</span>
                <span className="text-slate-600 dark:text-slate-300">{t(m.fix)}</span>
              </p>
            </Card>
          ))}
        </div>
      </section>

      <Card className="p-8 text-center sm:p-12">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">{t('พร้อมรู้จักตัวละครการทำงานของคุณ?', 'Ready to meet your work character?')}</h2>
        <p className="mx-auto mt-3 max-w-lg text-slate-600 dark:text-slate-300">
          {t('ผลเป็นของคุณ คุณเลือกเองว่าจะแชร์กับหัวหน้าหรือ HR หรือไม่', 'Your results are yours. You decide whether to share them with a manager or HR.')}
        </p>
        <Button variant="primary" size="lg" to="/test" className="mt-6" iconRight={ArrowRight}>
          {t('เริ่มเลย', 'Start now')}
        </Button>
      </Card>
    </div>
  )
}
