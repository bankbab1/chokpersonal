import { ArrowLeft, ArrowRight, BookOpen } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { CodeCharacter, tint } from '@/components/character/RoleCharacter'
import { Button } from '@/components/ui/Button'
import { Card, Chip, Eyebrow } from '@/components/ui/Card'
import { StickyBar } from '@/components/ui/StickyBar'
import { CHARACTER_GROUPS, CHARACTERS, characterByKey, groupByKey, type WorkCharacter } from '@/domain/characters'
import { CODE_AXES, CODE_BOOK } from '@/domain/code'
import { cn } from '@/lib/cn'
import { useT, type T } from '@/lib/i18n'
import { useProfile } from '@/lib/useProfile'
import { workfitCode } from '@/domain/code'

const useMyKey = () => {
  const profile = useProfile()
  return profile ? workfitCode(profile.scores).code.slice(0, 4) : null
}

export function PersonasPage() {
  const { id } = useParams()
  const ch = id ? characterByKey(id) : null
  return ch ? <CharacterPage ch={ch} /> : <Gallery />
}

/* -------------------------------------------- Gallery -------------------------------------------- */

function Gallery() {
  const t = useT()
  const mine = useMyKey()
  return (
    <div className="space-y-8">
      <div>
        <Eyebrow>{t('ตัวละคร', 'Characters')}</Eyebrow>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t('ตัวละคร 16 แบบ ใน 4 สาย', '16 characters in 4 groups')}</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
          {t(
            'ตัวละครของคุณมาจากตัวอักษร 4 ตัวแรกของ Workfit Code ตัวที่ 1–2 บอกสาย ตัวที่ 3–4 บอกว่าคุณนำหรือหนุน และไวหรือรอบคอบ ทุกแบบมีคุณค่าเท่ากัน',
            'Your character comes from the first 4 letters of your Workfit Code. Letters 1–2 give your group; letters 3–4 say whether you lead or back, move quick or careful. Every character is of equal value.',
          )}
        </p>
      </div>

      <StickyBar>
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {CHARACTER_GROUPS.map((g) => (
            <a
              key={g.key}
              href={`#group-${g.key}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(`group-${g.key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 text-sm font-medium transition-colors hover:border-slate-300 active:scale-95 sm:h-8 dark:border-white/10 dark:bg-transparent dark:hover:border-white/25"
            >
              <span className="size-2.5 rounded-full" style={{ background: g.color }} />
              {t(g.name)} · {g.key}
            </a>
          ))}
        </div>
      </StickyBar>

      {CHARACTER_GROUPS.map((g) => (
        <section key={g.key} id={`group-${g.key}`} className="scroll-mt-32">
          <div className="relative overflow-hidden rounded-2xl px-5 py-6 sm:px-8" style={{ background: tint(g.color, 0.86) }}>
            <span className="pointer-events-none absolute -right-2 -top-5 select-none text-7xl font-bold opacity-15 sm:text-8xl" style={{ color: g.color }} aria-hidden>
              {t(g.plural)}
            </span>
            <h2 className="relative text-2xl font-semibold" style={{ color: g.color }}>
              {t(g.plural)} <span className="text-base font-medium text-slate-500">· {g.key}</span>
            </h2>
            <p className="relative mt-1 text-sm text-slate-700">{t(g.letters)}</p>
            <p className="relative mt-1 max-w-2xl text-sm text-slate-600">{t(g.tagline)}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {CHARACTERS.filter((c) => c.group === g.key).map((c) => (
              <Link
                key={c.key}
                to={`/personas/${c.key}`}
                className="group block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
              >
                <Card className={cn('flex h-full flex-col items-center p-4 text-center transition hover:border-slate-300 active:scale-[0.99] dark:hover:border-white/20', mine === c.key && 'ring-2')} >
                  {mine === c.key && (
                    <span className="absolute right-3 top-3 rounded-full px-2 py-0.5 text-xs font-semibold text-white" style={{ background: g.color }}>
                      {t('คุณ', 'You')}
                    </span>
                  )}
                  <CodeCharacter code={c.key} size={108} />
                  <div className="mt-2 font-semibold" style={{ color: g.color }}>
                    {t(c.name)}
                  </div>
                  <div className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400">{c.key}</div>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-300">{t(c.tagline)}</p>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

/* ------------------------------------------ Character page ------------------------------------------ */

type Chapter = { id: string; title: T; body: ReactNode }

function CharacterPage({ ch }: { ch: WorkCharacter }) {
  const t = useT()
  const navigate = useNavigate()
  const mine = useMyKey()
  const g = groupByKey(ch.group)
  const [current, setCurrent] = useState('overview')
  const letters = ch.key.split('').map((l, i) => {
    const a = CODE_AXES[i]
    return a.left.letter === l ? a.left : a.right
  })
  const variants = CODE_BOOK.filter((e) => e.code.startsWith(ch.key))
  const siblings = CHARACTERS.filter((c) => c.group === ch.group && c.key !== ch.key)

  const chapters: Chapter[] = [
    { id: 'overview', title: { th: 'ภาพรวม', en: 'Overview' }, body: <p className="leading-relaxed">{t(ch.overview)}</p> },
    {
      id: 'strengths',
      title: { th: 'จุดแข็งและจุดที่ต้องระวัง', en: 'Strengths & watch-outs' },
      body: (
        <div className="grid gap-5 sm:grid-cols-2">
          <ul className="space-y-2">
            {ch.strengths.map((x) => (
              <li key={x.en} className="flex gap-2">
                <span className="mt-2 size-2 shrink-0 rounded-full" style={{ background: g.color }} />
                {t(x)}
              </li>
            ))}
          </ul>
          <ul className="space-y-2 text-slate-600 dark:text-slate-300">
            {ch.watchouts.map((x) => (
              <li key={x.en} className="flex gap-2">
                <span className="mt-2 size-2 shrink-0 rounded-full bg-amber-500" />
                {t(x)}
              </li>
            ))}
          </ul>
        </div>
      ),
    },
    { id: 'habits', title: { th: 'นิสัยในที่ทำงาน', en: 'Workplace habits' }, body: <p className="leading-relaxed">{t(ch.workHabits)}</p> },
    { id: 'team', title: { th: 'ในทีม', en: 'In a team' }, body: <p className="leading-relaxed">{t(ch.inTeam)}</p> },
    { id: 'manager', title: { th: 'กับหัวหน้า', en: 'With a manager' }, body: <p className="leading-relaxed">{t(ch.withManager)}</p> },
    {
      id: 'careers',
      title: { th: 'สายงานที่น่าสำรวจ', en: 'Career paths to explore' },
      body: (
        <>
          <div className="flex flex-wrap gap-2">
            {ch.careers.map((c) => (
              <Chip key={c}>{c}</Chip>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{t('เป็นพื้นที่ให้สำรวจ ไม่ได้แปลว่าคุณมีทักษะเหล่านี้แล้ว', 'Areas to explore, not proof you already have the skills.')}</p>
        </>
      ),
    },
    { id: 'friends', title: { th: 'กับเพื่อนและแก๊ง', en: 'With friends & your gang' }, body: <p className="leading-relaxed">{t(ch.friends)}</p> },
    { id: 'family', title: { th: 'ในครอบครัว', en: 'In the family' }, body: <p className="leading-relaxed">{t(ch.family)}</p> },
    { id: 'social', title: { th: 'งานสังคมและงานเลี้ยง', en: 'Social events & parties' }, body: <p className="leading-relaxed">{t(ch.social)}</p> },
    { id: 'partner', title: { th: 'กับคู่ชีวิต', en: 'With a life partner' }, body: <p className="leading-relaxed">{t(ch.partner)}</p> },
    {
      id: 'variants',
      title: { th: '8 แบบย่อย (3 ตัวหลัง)', en: '8 variants (last 3 letters)' },
      body: (
        <>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            {t('ตัวอักษร 3 ตัวหลังบอกว่าคุณทำงานกับคนแบบไทยอย่างไร: พูดตรงหรือรักษาน้ำใจ มีระบบหรือไม่เป็นไร ทีมเราหรือทางของตัวเอง', 'The last 3 letters show how you work with people in a Thai team: direct or harmony, rules or mai pen rai, “we” or own way.')}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {variants.map((v) => (
              <Link key={v.code} to={`/codes/${v.code}`} className="rounded-xl border border-slate-200/80 px-3 py-2 text-sm transition hover:border-slate-300 active:scale-[0.98] dark:border-white/[0.08] dark:hover:border-white/20">
                <span className="block font-bold tracking-wide" style={{ color: g.color }}>
                  {v.code}
                </span>
                <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                  {v.wc.crew.emoji} {t(v.wc.crew.name)}
                </span>
              </Link>
            ))}
          </div>
        </>
      ),
    },
  ]

  // Highlight the chapter being read.
  useEffect(() => {
    const els = chapters.map((c) => document.getElementById(`ch-${c.id}`)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (top) setCurrent(top.target.id.slice(3))
      },
      { rootMargin: '-120px 0px -60% 0px' },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ch.key])
  const jump = (id: string) => document.getElementById(`ch-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div>
      <Button variant="ghost" size="sm" icon={ArrowLeft} to="/personas" className="-ml-2">
        {t('ตัวละครทั้งหมด', 'All characters')}
      </Button>

      {/* Hero */}
      <div className="mt-3 overflow-hidden rounded-[1.75rem]" style={{ background: tint(g.color, 0.88) }}>
        <div className="grid items-center gap-4 p-6 sm:p-10 md:grid-cols-[1fr_auto]">
          <div className="order-2 md:order-1">
            <div className="flex flex-wrap gap-1.5">
              {letters.map((p) => (
                <span key={p.letter} className="rounded-md bg-white/80 px-2 py-0.5 text-xs font-semibold text-slate-600">
                  {t(p.name)}
                </span>
              ))}
            </div>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">{t(ch.name)}</h1>
            <div className="mt-1 text-xl font-semibold sm:text-2xl" style={{ color: g.color }}>
              {ch.key} · {t(g.name)}
            </div>
            <p className="mt-3 max-w-xl text-slate-700">{t(ch.tagline)}</p>
            {mine === ch.key && (
              <span className="mt-4 inline-flex rounded-full px-3 py-1 text-sm font-semibold text-white" style={{ background: g.color }}>
                {t('นี่คือตัวละครของคุณ', 'This is your character')}
              </span>
            )}
          </div>
          <div className="order-1 flex justify-center md:order-2">
            <CodeCharacter code={ch.key} size={200} />
          </div>
        </div>
      </div>

      {/* Chapters: sticky list on desktop, chip row on phones */}
      <StickyBar className="mt-6 lg:hidden">
        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
          {chapters.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => jump(c.id)}
              className={cn(
                'h-9 shrink-0 rounded-full border px-3 text-sm transition-colors',
                current === c.id ? 'border-transparent text-white' : 'border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-transparent dark:text-slate-300',
              )}
              style={current === c.id ? { background: g.color } : undefined}
            >
              {t(c.title)}
            </button>
          ))}
        </div>
      </StickyBar>

      <div className="mt-6 grid gap-8 lg:grid-cols-[15rem_1fr]">
        <nav className="hidden lg:block" aria-label={t('บทต่าง ๆ', 'Chapters')}>
          <div className="sticky top-20">
            <div className="text-sm font-semibold">{t('สำรวจตัวละครนี้', 'Explore this character')}</div>
            <ul className="mt-2 border-l border-slate-200 dark:border-white/10">
              {chapters.map((c, i) => (
                <li key={c.id}>
                  {i === 6 && <div className="ml-4 mt-3 text-xs font-medium text-slate-400">{t('นอกที่ทำงาน', 'Outside work')}</div>}
                  <button
                    type="button"
                    onClick={() => jump(c.id)}
                    className={cn(
                      '-ml-px block w-full border-l-2 py-2 pl-4 text-left text-sm transition-colors',
                      current === c.id ? 'font-semibold text-slate-900 dark:text-white' : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white',
                    )}
                    style={current === c.id ? { borderColor: g.color } : undefined}
                  >
                    {t(c.title)}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="min-w-0 space-y-10">
          {chapters.map((c, i) => (
            <section key={c.id} id={`ch-${c.id}`} className="scroll-mt-36 lg:scroll-mt-24">
              {i === 6 && <Eyebrow className="mb-2">{t('นอกที่ทำงาน', 'Outside work')}</Eyebrow>}
              <h2 className="border-b border-slate-200/80 pb-2 text-2xl font-semibold tracking-tight dark:border-white/[0.08]">{t(c.title)}</h2>
              <div className="mt-4 text-slate-700 dark:text-slate-200">{c.body}</div>
              {c.id === 'overview' && (
                <blockquote className="mt-5 border-l-4 py-1 pl-4 text-lg font-medium" style={{ borderColor: g.color }}>
                  {t(ch.workWithMe)}
                  <span className="mt-1 block text-sm font-normal text-slate-500 dark:text-slate-400">{t('ทำงานกับฉันอย่างไร', 'How to work with me')}</span>
                </blockquote>
              )}
            </section>
          ))}

          <section>
            <h2 className="text-lg font-semibold">{t(`อีก 3 ตัวละครใน${g.name.th}`, `The other 3 ${g.plural.en}`)}</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {siblings.map((s) => (
                <Link key={s.key} to={`/personas/${s.key}`} className="flex items-center gap-3 rounded-2xl border border-slate-200/80 p-3 transition hover:border-slate-300 active:scale-[0.99] dark:border-white/[0.08] dark:hover:border-white/20">
                  <CodeCharacter code={s.key} size={52} />
                  <span className="min-w-0">
                    <span className="block font-medium">{t(s.name)}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400">{s.key}</span>
                  </span>
                </Link>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button variant="secondary" icon={BookOpen} to="/code">
                {t('วิธีอ่านรหัส', 'How to read a code')}
              </Button>
              {!mine && (
                <Button variant="primary" iconRight={ArrowRight} onClick={() => navigate('/test')}>
                  {t('ค้นหาตัวละครของคุณ', 'Find your character')}
                </Button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
