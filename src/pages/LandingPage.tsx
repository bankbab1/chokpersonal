import { ArrowRight, Eye, EyeOff, Gem, Globe2, Lock, MessageCircleOff, Play, ShieldCheck, Users, UsersRound } from 'lucide-react'
import { useNavigate } from 'react-router'
import { SameTypeShowcase } from '@/components/charts/SameType'
import { Character } from '@/components/character/Character'
import { ORG_NAV } from '@/components/layout/AppShell'
import { Button } from '@/components/ui/Button'
import { Card, Eyebrow } from '@/components/ui/Card'
import { DIMENSIONS } from '@/domain/dimensions'
import { FAMILIES, PERSONAS } from '@/domain/personas'
import { MARKET_COMPARISON } from '@/domain/styles'
import { useT } from '@/lib/i18n'
import { useAssessment } from '@/store/assessment'

export function LandingPage() {
  const t = useT()
  const navigate = useNavigate()
  const fillDemo = useAssessment((s) => s.fillDemo)
  const completed = useAssessment((s) => s.completedAt)

  const demo = () => {
    fillDemo()
    navigate('/me')
  }

  const youGet = [
    {
      icon: Eye,
      title: t('รู้จักตัวเองแบบลึก', 'Know yourself, in depth'),
      body: t('ตัวละคร 1 ใน 24 แบบ, Workfit ID, 18 มิติ, Top 5 จุดแข็ง และพฤติกรรมตอนกดดัน อยู่กับผู้ใหญ่ น้อง และลูกค้า', 'One of 24 characters, your Workfit ID, 18 dimensions, top 5 strengths and how you act under pressure, with seniors, juniors and customers'),
    },
    {
      icon: UsersRound,
      title: t('คนรอบตัวเห็นคุณแบบไหน', 'How others see you'),
      body: t('ชวนหัวหน้า เพื่อน หรือน้องให้ประเมินคุณ แล้วดูจุดบอดและจุดแข็งที่ซ่อนอยู่ งานวิจัยพบว่ามุมมองคนอื่นทำนายผลงานได้ดีกว่าการประเมินตัวเอง', 'Invite a manager, colleague or friend to rate you, then see blind spots and hidden strengths. Research shows others’ views predict job performance better than self-ratings'),
    },
    {
      icon: Globe2,
      title: t('สะพานวัฒนธรรมไทย–ต่างชาติ', 'Thai–foreign culture bridge'),
      body: t('คำแนะนำเฉพาะตัวว่าสไตล์ของคุณจะถูกมองอย่างไรในทีมนานาชาติ หรือในทีมคนไทย', 'Personal tips on how your style lands in an international team, or in a Thai team'),
    },
  ]

  const pains = [
    { icon: Gem, title: t('พูดเก่ง ≠ ทำเก่ง', 'Talking well ≠ delivering well'), body: t('Workfit แยก “พูด” กับ “ทำ” ออกจากกัน ช่วยให้คนเงียบที่ทำงานดีถูกมองเห็น', 'Workfit separates “say” from “do”, so quiet high performers get seen') },
    { icon: Users, title: t('แบ่งพรรคแบ่งพวก', 'Cliques'), body: t('รู้ว่าตัวเองผูกกลุ่มแค่ไหน และทีมเสี่ยงแบ่งกลุ่มหรือเปล่า', 'See how strongly you lean into in-groups, and whether a team risks splitting') },
    { icon: MessageCircleOff, title: t('ไม่กล้าพูดเมื่อมีปัญหา', 'Staying silent when something is wrong'), body: t('เกรงใจเป็นเรื่องดี แต่ถ้ามากไปอาจไม่มีใครรู้ว่าคุณงานล้นหรือถูกกดดัน', 'Kreng jai is a strength, but too much means no one knows you are overloaded or pressured') },
  ]

  return (
    <div className="space-y-24">
      {/* Hero */}
      <section className="grid items-center gap-10 pt-6 lg:grid-cols-[1.1fr_1fr] lg:pt-12">
        <div className="animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white px-3 py-1 text-xs font-medium text-violet-700 dark:border-violet-400/20 dark:bg-violet-400/10 dark:text-violet-200">
            <span className="size-1.5 rounded-full bg-violet-600" />
            {t('แบบทดสอบบุคลิกภาพการทำงาน ที่เข้าใจคนไทย', 'The work personality test that understands Thai workplaces')}
          </span>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl">
            {t('รู้จัก', 'Know the ')}
            <span className="text-gradient">{t('ตัวตนการทำงาน', 'working you')}</span>
            <br />
            {t('ของคุณจริง ๆ', 'for real')}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            {t(
              'Workfit วัด 18 มิติหลัก และเจาะลึกได้ถึง 87 ด้าน รวมถึงเรื่องที่แบบทดสอบฝรั่งไม่เคยวัด เช่น เกรงใจ ระบบอาวุโส รักษาหน้า และบุญคุณ แล้วสรุปเป็นตัวละคร Workfit ID และคำแนะนำที่ใช้ได้จริง สำหรับคนไทยและชาวต่างชาติที่ทำงานกับคนไทย',
              'Workfit measures 18 core dimensions, and up to 87 aspects in depth, including what Western tests never measure, such as kreng jai (deference), seniority, face and bunkhun (loyalty), and turns them into a character, your Workfit ID and practical advice, for Thais and for foreigners working with Thais.',
            )}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="glow" size="lg" to="/test" iconRight={ArrowRight}>
              {completed ? t('ทำแบบทดสอบอีกครั้ง', 'Retake the test') : t('เริ่มทำแบบทดสอบ · 20 นาที', 'Start the test · 20 min')}
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

        <div className="relative mx-auto aspect-square w-full max-w-[460px]">
          {FAMILIES.map((f, i) => {
            const angle = (i / FAMILIES.length) * Math.PI * 2 - Math.PI / 2
            const x = 50 + 36 * Math.cos(angle)
            const y = 50 + 36 * Math.sin(angle)
            const variant = PERSONAS.filter((p) => p.family === f.id)[i % 4].variant
            return (
              <div key={f.id} className="absolute -translate-x-1/2 -translate-y-1/2 animate-pop" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 80}ms` }}>
                <div className="animate-float" style={{ animationDelay: `${i * 0.6}s` }}>
                  <Character animal={f.animal} variant={variant} color={f.color} soft={f.soft} size={118} className="drop-shadow-xl" />
                </div>
              </div>
            )
          })}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            <div className="text-5xl font-semibold text-gradient">24</div>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">{t('persona แบบไทย', 'Thai personas')}</div>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section>
        <Eyebrow>{t('สิ่งที่คุณจะได้', 'What you get')}</Eyebrow>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{t('ไม่ใช่แค่ผลทดสอบ แต่เป็นแผนที่ของตัวคุณ', 'Not just a test result: a map of you')}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {youGet.map(({ icon: Icon, title, body }, i) => (
            <Card key={title} className="animate-rise" style={{ animationDelay: `${i * 90}ms` }}>
              <div className="grid size-11 place-items-center rounded-2xl bg-gradient-brand text-white">
                <Icon size={20} />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Pain points */}
      <section>
        <Eyebrow>{t('เรื่องที่คนทำงานไทยเจอทุกวัน', 'What Thai workplaces face every day')}</Eyebrow>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{t('เห็นสิ่งที่ label เดียวบอกไม่ได้', 'See what a single label never shows')}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {pains.map(({ icon: Icon, title, body }) => (
            <Card key={title}>
              <Icon size={22} className="text-violet-600 dark:text-violet-300" />
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
            <div className="text-sm font-semibold text-violet-600 dark:text-violet-300">{t('1 · คำถาม 3 รูปแบบ', '1 · Three question formats')}</div>
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
            <div className="text-sm font-semibold text-pink-600 dark:text-pink-300">{t('2 · 18 มิติ → เจาะลึกได้ 87 ด้าน', '2 · 18 dimensions → up to 87 aspects')}</div>
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
            <div className="text-sm font-semibold text-orange-600 dark:text-orange-300">{t('3 · Workfit Code + 24 persona', '3 · Workfit Code + 24 personas')}</div>
            <h3 className="mt-1 text-xl font-semibold">{t('คนประเภทเดียวกันก็ไม่เหมือนกัน', 'Same type, still unique')}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {t(
                'รหัสมาตรฐาน 7 ตัวอักษรแบบ ENLQ-HRW ของ Workfit เอง: 4 ตัวแรกคือแกนตัวตน 3 ตัวหลังคือบริบทคนไทย พร้อม สาย × แก๊ง 16 กลุ่ม เช่น สายครีเอต · แก๊งครอบครัว และตัวละคร 24 แบบ',
                "Workfit's own standard 7-letter code like ENLQ-HRW: 4 Core letters, then 3 Thai-context letters, plus 16 vibe × crew groups such as Creator · Family Crew, and 24 characters",
              )}
            </p>
          </Card>
          <Card className="lg:col-span-2">
            <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-300">{t('4 · เครื่องมือสำหรับองค์กร', '4 · Tools for organisations')}</div>
            <h3 className="mt-1 text-xl font-semibold">{t('เมื่อพร้อม แชร์ผลกับทีมได้', 'Share with your team when you are ready')}</h3>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {ORG_NAV.map(({ to, label, icon: Icon, blurb }) => (
                <button
                  key={to}
                  type="button"
                  onClick={() => navigate(to)}
                  className="rounded-2xl bg-slate-900/[0.03] p-3 text-left transition hover:bg-slate-900/[0.06] focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]"
                >
                  <Icon size={18} className="text-emerald-600 dark:text-emerald-300" />
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
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{t('รหัสเดียวกัน ≠ คนเดียวกัน', 'Same type ≠ same person')}</h2>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
          {t(
            'แบบทดสอบ 16 ประเภทตัดสินจากจุดตัดแค่ 4–5 จุด คนที่ได้รหัสเดียวกันจึงยังต่างกันได้เกือบทุกเรื่อง Workfit จึงวัดถึง 87 ด้านและบอกว่าคุณต่างจากคนรหัสเดียวกันตรงไหน',
            'A 16-type test decides on just 4–5 cut-offs, so people with the same type can still differ on almost everything. That is why Workfit measures up to 87 aspects and shows where you differ from others with your type.',
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
        <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {MARKET_COMPARISON.map((m) => (
            <Card key={m.tool.en} className="p-5">
              <div className="font-semibold">{t(m.tool)}</div>
              {m.keep && (
                <p className="mt-2 text-sm">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">{t('เก็บไว้: ', 'Keep: ')}</span>
                  <span className="text-slate-600 dark:text-slate-300">{t(m.keep)}</span>
                </p>
              )}
              <p className="mt-2 text-sm">
                <span className="font-semibold text-violet-600 dark:text-violet-300">{t('Workfit ทำดีกว่า: ', 'Workfit does better: ')}</span>
                <span className="text-slate-600 dark:text-slate-300">{t(m.fix)}</span>
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Families */}
      <section>
        <Eyebrow>{t('6 ตระกูล · 24 persona', '6 families · 24 personas')}</Eyebrow>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{t('คุณเป็นสัตว์ตัวไหนในที่ทำงาน?', 'Which animal are you at work?')}</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {FAMILIES.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => navigate(`/personas?family=${f.id}`)}
              className="group rounded-2xl border border-slate-200 bg-white p-4 text-center transition hover:-translate-y-1 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 dark:border-white/10 dark:bg-white/[0.04]"
            >
              <Character animal={f.animal} variant="LF" color={f.color} soft={f.soft} size={96} className="mx-auto transition group-hover:scale-105" />
              <div className="mt-3 font-semibold">{t(f.th, f.en)}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t(f.animalTh, f.animalEn)}</div>
            </button>
          ))}
        </div>
      </section>

      <Card className="overflow-hidden p-8 text-center sm:p-12">
        <div className="absolute inset-0 bg-gradient-brand opacity-[0.08]" />
        <h2 className="relative text-2xl font-semibold tracking-tight sm:text-3xl">{t('พร้อมรู้จักตัวเองในแบบที่ไม่เคยรู้?', 'Ready to meet the working you?')}</h2>
        <p className="relative mx-auto mt-3 max-w-lg text-slate-600 dark:text-slate-300">
          {t('ผลเป็นของคุณ คุณเลือกเองว่าจะแชร์กับหัวหน้าหรือ HR หรือไม่', 'Your results are yours. You decide whether to share them with a manager or HR.')}
        </p>
        <Button variant="glow" size="lg" to="/test" className="relative mt-6" iconRight={ArrowRight}>
          {t('เริ่มเลย', 'Start now')}
        </Button>
      </Card>
    </div>
  )
}
