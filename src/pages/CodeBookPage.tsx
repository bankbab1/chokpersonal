import { ArrowLeft, BookOpen, Check, ChevronRight, Link2, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { AXIS_COLOR, TribeChip } from '@/components/charts/WorkfitCodeCard'
import { Button } from '@/components/ui/Button'
import { Card, Eyebrow } from '@/components/ui/Card'
import { CODE_AXES, CODE_BOOK, CODE_COUNT, codeBookEntry, VIBES, workfitCode, type CodeBookEntry } from '@/domain/code'
import { SAMPLE_POPULATION } from '@/domain/demo'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { useProfile } from '@/lib/useProfile'

/** How often each code shows up in the 600-person sample (for "how rare is this code"). */
const SAMPLE_COUNTS = (() => {
  const m = new Map<string, number>()
  for (const s of SAMPLE_POPULATION) {
    const c = workfitCode(s).code
    m.set(c, (m.get(c) ?? 0) + 1)
  }
  return m
})()

/** Static coloured letters (not buttons) for lists. */
function Letters({ letters, size = 'md' }: { letters: string[]; size?: 'md' | 'xl' }) {
  return (
    <span className={cn('inline-flex items-baseline font-bold tracking-wide', size === 'xl' ? 'text-5xl sm:text-6xl' : 'text-lg')}>
      {letters.map((ch, i) => (
        <span key={i} className="inline-flex items-baseline">
          {i === 4 && <span className={cn('text-slate-300 dark:text-slate-600', size === 'xl' ? 'mx-1.5' : 'mx-0.5')}>-</span>}
          <span style={{ color: AXIS_COLOR[i] }}>{ch}</span>
        </span>
      ))}
    </span>
  )
}

const useMyCode = () => {
  const profile = useProfile()
  return profile ? workfitCode(profile.scores).code : null
}

/* -------------------------------------------- List -------------------------------------------- */

export function CodeBookPage() {
  const { code } = useParams()
  return code ? <CodeEntryPage code={code} /> : <CodeList />
}

function CodeList() {
  const t = useT()
  const mine = useMyCode()
  const [query, setQuery] = useState('')
  /** Per slot: null = any letter, otherwise the letter that must be there. */
  const [slots, setSlots] = useState<(string | null)[]>(() => CODE_AXES.map(() => null))
  const q = query.toUpperCase().replace(/[^A-Z]/g, '')

  const shown = useMemo(
    () =>
      CODE_BOOK.filter((e) => {
        if (slots.some((x, i) => x && e.letters[i] !== x)) return false
        if (!q) return true
        const flat = e.letters.join('')
        return flat.includes(q) || e.wc.title.th.includes(query.trim()) || e.wc.title.en.toUpperCase().includes(query.trim().toUpperCase())
      }),
    [slots, q, query],
  )
  const cycle = (i: number) =>
    setSlots((cur) => cur.map((x, k) => (k !== i ? x : x === null ? CODE_AXES[i].left.letter : x === CODE_AXES[i].left.letter ? CODE_AXES[i].right.letter : null)))
  const filtered = slots.some(Boolean) || q

  return (
    <div className="space-y-5">
      <div>
        <Eyebrow>{t('สมุดรหัส', 'Code book')}</Eyebrow>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t(`Workfit Code ทั้ง ${CODE_COUNT} แบบ`, `All ${CODE_COUNT} Workfit Codes`)}</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
          {t('ใครได้รหัสอะไรก็เปิดอ่านความหมายได้ที่นี่ แตะรหัสเพื่อดูความหมายทีละตัวอักษร', 'Whatever code you or a colleague got, read its meaning here. Tap a code for a letter-by-letter guide.')}
        </p>
      </div>

      {mine && (
        <Link to={`/codes/${mine}`} className="block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600">
          <Card className="flex items-center gap-4 border-violet-300 bg-violet-50/60 transition active:scale-[0.99] dark:border-violet-500/40 dark:bg-violet-500/10">
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium text-violet-700 dark:text-violet-300">{t('รหัสของคุณ', 'Your code')}</div>
              <Letters letters={mine.replace('-', '').split('')} />
            </div>
            <ChevronRight size={20} className="shrink-0 text-slate-400" />
          </Card>
        </Link>
      )}

      <Card className="space-y-4">
        <label className="relative block">
          <span className="sr-only">{t('ค้นหารหัสหรือชื่อ', 'Search a code or name')}</span>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('พิมพ์รหัส เช่น ENLQ หรือชื่อ', 'Type a code, e.g. ENLQ, or a name')}
            autoCapitalize="characters"
            spellCheck={false}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-base outline-none focus:ring-2 focus:ring-violet-600 sm:h-10 sm:text-sm dark:border-white/15 dark:bg-transparent"
          />
        </label>
        <div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{t('แตะแต่ละช่องเพื่อเลือกตัวอักษร (แตะซ้ำเพื่อสลับ / ล้าง)', 'Tap a slot to pick a letter (tap again to switch / clear)')}</div>
          <div className="mt-2 flex items-center gap-1.5">
            {CODE_AXES.map((axis, i) => (
              <span key={axis.id} className="contents">
                {i === 4 && <span className="text-slate-300 dark:text-slate-600">-</span>}
                <button
                  type="button"
                  onClick={() => cycle(i)}
                  aria-label={`${t(axis.name)}: ${slots[i] ?? t('ทุกตัว', 'any')}`}
                  className={cn(
                    'grid size-10 place-items-center rounded-xl border text-lg font-bold transition active:scale-95',
                    slots[i] ? 'border-transparent' : 'border-dashed border-slate-300 text-slate-300 dark:border-white/20 dark:text-slate-600',
                  )}
                  style={slots[i] ? { color: AXIS_COLOR[i], background: `${AXIS_COLOR[i]}18` } : undefined}
                >
                  {slots[i] ?? '·'}
                </button>
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500 dark:text-slate-400" aria-live="polite">
            {t(`${shown.length} รหัส`, `${shown.length} codes`)}
          </span>
          {filtered && (
            <button
              type="button"
              className="min-h-10 rounded-lg px-2 font-medium text-violet-700 dark:text-violet-300"
              onClick={() => {
                setQuery('')
                setSlots(CODE_AXES.map(() => null))
              }}
            >
              {t('ล้างตัวกรอง', 'Clear')}
            </button>
          )}
        </div>
      </Card>

      {VIBES.map((v) => {
        const list = shown.filter((e) => e.wc.vibe.key === v.key)
        if (!list.length) return null
        return (
          <section key={v.key}>
            <h2 className="flex items-center gap-2 px-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
              <span aria-hidden>{v.emoji}</span> {t(v.name)} · {v.key} <span className="font-normal">({list.length})</span>
            </h2>
            <Card className="mt-2 p-0">
              <ul className="divide-y divide-slate-200/80 dark:divide-white/[0.08]">
                {list.map((e) => (
                  <CodeRow key={e.code} e={e} mine={e.code === mine} />
                ))}
              </ul>
            </Card>
          </section>
        )
      })}
      {shown.length === 0 && <p className="py-8 text-center text-slate-500 dark:text-slate-400">{t('ไม่พบรหัสที่ตรงกัน', 'No matching codes')}</p>}
    </div>
  )
}

function CodeRow({ e, mine }: { e: CodeBookEntry; mine: boolean }) {
  const t = useT()
  return (
    <li>
      <Link to={`/codes/${e.code}`} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-white/[0.03] dark:active:bg-white/[0.06]">
        <span className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-4">
          <span className="block sm:w-[6.5rem] sm:shrink-0">
            <Letters letters={e.letters} />
            {mine && <span className="ml-2 text-xs font-medium text-violet-700 sm:hidden dark:text-violet-300">{t('คุณ', 'you')}</span>}
          </span>
          <span className="block min-w-0">
            <span className="block font-medium">
              {t(e.wc.title)}
              {mine && <span className="ml-1.5 hidden text-xs font-medium text-violet-700 sm:inline dark:text-violet-300">· {t('คุณ', 'you')}</span>}
            </span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              {e.wc.crew.emoji} {t(e.wc.crew.name)}
            </span>
          </span>
        </span>
        <ChevronRight size={18} className="shrink-0 text-slate-400" />
      </Link>
    </li>
  )
}

/* ------------------------------------------- Detail ------------------------------------------- */

function CodeEntryPage({ code }: { code: string }) {
  const t = useT()
  const mine = useMyCode()
  const e = codeBookEntry(code)
  const [copied, setCopied] = useState(false)
  if (!e)
    return (
      <div className="py-16 text-center">
        <p className="text-slate-600 dark:text-slate-300">{t(`ไม่มีรหัส “${code}” ในระบบ`, `There is no code “${code}”`)}</p>
        <Button className="mt-4" to="/codes" icon={ArrowLeft}>
          {t('ไปที่สมุดรหัส', 'Go to the code book')}
        </Button>
      </div>
    )
  const n = SAMPLE_COUNTS.get(e.code) ?? 0
  const pct = Math.round((n / SAMPLE_POPULATION.length) * 1000) / 10
  const neighbours = CODE_AXES.map((axis, i) => {
    const letters = [...e.letters]
    letters[i] = letters[i] === axis.left.letter ? axis.right.letter : axis.left.letter
    return { axis, entry: codeBookEntry(letters.join(''))!, i }
  })

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button variant="ghost" size="sm" icon={ArrowLeft} to="/codes" className="-ml-2">
        {t('สมุดรหัส', 'Code book')}
      </Button>

      <Card className="p-6 text-center sm:p-8">
        {e.code === mine && (
          <span className="mb-3 inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 dark:bg-violet-500/15 dark:text-violet-200">
            <Check size={12} /> {t('รหัสของคุณ', 'Your code')}
          </span>
        )}
        <div>
          <Letters letters={e.letters} size="xl" />
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">{t(e.wc.title)}</h1>
        <div className="mt-3 flex flex-wrap justify-center gap-1.5">
          <TribeChip tribe={e.wc.vibe} kind="vibe" />
          <TribeChip tribe={e.wc.crew} kind="crew" />
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {n
            ? t(`พบ ${pct}% ในประชากรตัวอย่าง (${n} จาก ${SAMPLE_POPULATION.length} คน)`, `${pct}% of the sample population (${n} of ${SAMPLE_POPULATION.length})`)
            : t('ไม่พบในประชากรตัวอย่าง 600 คน: เป็นรหัสที่หายาก', 'Not found in the 600-person sample: a rare code')}
        </p>
        <Button
          className="mt-4"
          size="sm"
          variant="secondary"
          icon={copied ? Check : Link2}
          onClick={() => {
            void navigator.clipboard?.writeText(window.location.href)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1600)
          }}
        >
          {copied ? t('คัดลอกลิงก์แล้ว', 'Link copied') : t('คัดลอกลิงก์ไปแชร์', 'Copy link to share')}
        </Button>
      </Card>

      <Card>
        <h2 className="font-semibold">{t('ความหมายทีละตัวอักษร', 'Letter by letter')}</h2>
        <ul className="mt-3 divide-y divide-slate-200/80 dark:divide-white/[0.08]">
          {e.wc.letters.map((l, i) => (
            <li key={l.axis.id}>
              <Link to={`/code#axis-${l.axis.id}`} className="flex items-start gap-3 py-3 active:opacity-70">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl text-xl font-bold" style={{ color: AXIS_COLOR[i], background: `${AXIS_COLOR[i]}14` }}>
                  {l.shown}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-slate-500 dark:text-slate-400">
                    {t('ตัวที่', 'Letter')} {i + 1} · {t(l.axis.name)}
                  </span>
                  <span className="block font-medium">{t(l.pole.name)}</span>
                  <span className="block text-sm text-slate-600 dark:text-slate-300">{t(l.pole.sentence)}</span>
                </span>
                <ChevronRight size={18} className="mt-3 shrink-0 text-slate-400" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <h2 className="font-semibold">{t('ในภาพรวม', 'In short')}</h2>
        <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-200">{t(e.wc.intro)}</p>
      </Card>

      <Card>
        <h2 className="font-semibold">{t('รหัสที่ต่างกันแค่ 1 ตัว', 'Codes one letter away')}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('ดูว่าถ้าเปลี่ยนตัวอักษรเดียว ภาพจะต่างไปอย่างไร', 'See how one letter changes the picture')}</p>
        <ul className="mt-3 divide-y divide-slate-200/80 dark:divide-white/[0.08]">
          {neighbours.map(({ axis, entry, i }) => (
            <li key={axis.id}>
              <Link to={`/codes/${entry.code}`} className="flex items-center gap-3 py-2.5 active:opacity-70">
                <span className="w-[6.5rem] shrink-0">
                  <Letters letters={entry.letters} />
                </span>
                <span className="min-w-0 flex-1 text-sm">
                  <span className="block truncate font-medium">{t(entry.wc.title)}</span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                    {t(axis.name)}: <b style={{ color: AXIS_COLOR[i] }}>{entry.letters[i]}</b> {t(entry.wc.letters[i].pole.name)}
                  </span>
                </span>
                <ChevronRight size={18} className="shrink-0 text-slate-400" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex justify-center">
        <Button variant="ghost" icon={BookOpen} to="/code">
          {t('วิธีอ่านรหัส', 'How to read a code')}
        </Button>
      </div>
    </div>
  )
}
