import type { ReactNode } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { Character } from '@/components/character/Character'
import { Button } from '@/components/ui/Button'
import { StickyBar } from '@/components/ui/StickyBar'
import { Card, Chip, Eyebrow, Meter } from '@/components/ui/Card'
import { Sheet } from '@/components/ui/Sheet'
import { DEMO_STAFF } from '@/domain/demo'
import { rankRoles } from '@/domain/fit'
import { FAMILIES, familyById, PERSONAS, VARIANTS, type Persona } from '@/domain/personas'
import { emptyScores } from '@/domain/scoring'
import type { FamilyId, Scores } from '@/domain/types'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { useProfile } from '@/lib/useProfile'

/** A "typical" score profile for a persona, used to preview its best job areas. */
const prototype = (p: Persona): Scores => {
  const s = emptyScores()
  for (const [dim, dir] of Object.entries(familyById(p.family).signature)) s[dim as keyof Scores] = 50 + (dir ?? 0) * 25
  s.LD = p.variant[0] === 'L' ? 75 : 30
  s.PC = p.variant[1] === 'F' ? 75 : 30
  return s
}

export function PersonasPage() {
  const t = useT()
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const profile = useProfile()
  const navigate = useNavigate()
  const family = params.get('family') as FamilyId | null
  const shown = PERSONAS.filter((p) => !family || p.family === family)
  const selected = id ? PERSONAS.find((p) => p.id === id) : undefined
  const close = () => navigate(`/personas${params.toString() ? `?${params}` : ''}`, { preventScrollReset: true })

  return (
    <div>
      <Eyebrow>{t('คลัง persona', 'Persona library')}</Eyebrow>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t('24 persona แบบไทย', '24 Thai personas')}</h1>
      <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
        {t(
          '6 ตระกูล ตระกูลละ 4 แบบ แบ่งตาม นำ/สนับสนุน และ เร็ว/รอบคอบ แว่นตา = รอบคอบ, สายฟ้า = เร็ว, ดาว = นำ, คลิปบอร์ด = สนับสนุน',
          '6 families with 4 variants each, by lead/support and fast/careful. Glasses = careful, lightning = fast, star = lead, clipboard = support.',
        )}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-violet-200/70 bg-violet-50/70 p-3 text-sm dark:border-violet-400/20 dark:bg-violet-400/10">
        <span className="rounded-full bg-violet-600 px-2.5 py-0.5 text-xs font-semibold text-white">{t('ชุดตั้งต้น', 'Starter set')}</span>
        <span className="flex-1 text-slate-700 dark:text-slate-200">
          {t('24 persona นี้เป็นสมมติฐานเริ่มต้น จะถูกปรับจากข้อมูลจริงของพนักงานในช่วงทดลอง', 'These 24 personas are a starting hypothesis and will be refined from real pilot data.')}
        </span>
        <Button size="sm" to="/lab">
          {t('เปิด Persona Lab', 'Open Persona Lab')}
        </Button>
      </div>

      <StickyBar className="mt-6">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterChip active={!family} onClick={() => setParams({})}>
            {t('ทั้งหมด', 'All')}
          </FilterChip>
          {FAMILIES.map((f) => (
            <FilterChip key={f.id} active={family === f.id} color={f.color} onClick={() => setParams({ family: f.id })}>
              {t(f.animalTh, f.animalEn)} · {t(f.th, f.en)}
            </FilterChip>
          ))}
        </div>
      </StickyBar>

      {FAMILIES.filter((f) => !family || f.id === family).map((f) => (
        <section key={f.id} className="mt-8 scroll-mt-32">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-xl font-semibold" style={{ color: f.color }}>
              {t(f.th, f.en)} · {t(f.en, f.th)}
            </h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">{t(f.essence)}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {shown
              .filter((p) => p.family === f.id)
              .map((p) => {
                const mine = profile?.persona.personaId === p.id
                const count = DEMO_STAFF.filter((s) => s.persona.personaId === p.id).length
                const v = VARIANTS.find((x) => x.id === p.variant)
                const to = `/personas/${p.id}${family ? `?family=${family}` : ''}`
                return (
                  <a
                    key={p.id}
                    href={to}
                    onClick={(e) => {
                      e.preventDefault()
                      navigate(to, { preventScrollReset: true })
                    }}
                    className="block rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
                  >
                    <Card className={cn('h-full text-center transition hover:-translate-y-1 hover:shadow-2xl', mine && 'ring-2 ring-violet-600')}>
                      {mine && <span className="absolute right-3 top-3 rounded-full bg-gradient-brand px-2 py-0.5 text-[10px] font-semibold text-white">{t('คุณ', 'You')}</span>}
                      <Character animal={f.animal} variant={p.variant} color={f.color} soft={f.soft} size={112} className="mx-auto" />
                      <div className="mt-3 font-semibold">{t(p.th, p.en)}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {t(p.en, p.th)} · {v ? t(v.th, v.en) : ''}
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">{t(p.tagline)}</p>
                      <div className="mt-2 text-[11px] text-slate-400">{t(`ในข้อมูลตัวอย่าง ${count} คน`, `${count} in sample data`)}</div>
                    </Card>
                  </a>
                )
              })}
          </div>
        </section>
      ))}

      <Sheet open={Boolean(selected)} onClose={close} label={selected ? t(selected.th, selected.en) : ''}>
        {selected && <PersonaDetail persona={selected} />}
      </Sheet>
    </div>
  )
}

function FilterChip({ active, color, onClick, children }: { active: boolean; color?: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'h-8 shrink-0 select-none rounded-full border px-3 text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600',
        active
          ? 'border-transparent bg-violet-700 text-white dark:bg-violet-600'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/[0.06]',
      )}
      style={active && color ? { background: color, color: '#fff' } : undefined}
    >
      {children}
    </button>
  )
}

function PersonaDetail({ persona }: { persona: Persona }) {
  const t = useT()
  const f = familyById(persona.family)
  const roles = rankRoles(prototype(persona)).slice(0, 4)
  return (
    <div>
      <div className="relative flex flex-col items-center gap-6 pr-8 text-center sm:flex-row sm:text-left">
        <Character animal={f.animal} variant={persona.variant} color={f.color} soft={f.soft} size={150} className="shrink-0 animate-float" />
        <div>
          <Chip color={f.color}>
            {t(f.animalTh, f.animalEn)} · {t(f.th, f.en)}
          </Chip>
          <h2 className="mt-2 text-2xl font-semibold">
            {t(persona.th, persona.en)} <span className="text-slate-400">· {t(persona.en, persona.th)}</span>
          </h2>
          <p className="mt-1 text-slate-600 dark:text-slate-300">{t(persona.tagline)}</p>
          <p className="mt-2 text-sm">
            <span className="font-semibold">{t('พลังพิเศษ:', 'Superpower:')}</span> {t(persona.superpower)}
          </p>
        </div>
      </div>
      <div className="relative mt-6 grid gap-4 text-sm text-slate-700 sm:grid-cols-2 dark:text-slate-200">
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{t('จุดแข็งของตระกูล', 'Family strengths')}</div>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {f.strengths.map((s) => (
              <li key={s.en}>{t(s)}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{t('ระวัง', 'Watch out for')}</div>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {f.watchouts.map((s) => (
              <li key={s.en}>{t(s)}</li>
            ))}
          </ul>
        </div>
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{t('หัวหน้าที่เหมาะ', 'Best manager')}</div>
          <p className="mt-1">{t(f.bestManager)}</p>
        </div>
        <div>
          <div className="font-semibold text-slate-900 dark:text-white">{t('ให้ feedback อย่างไร', 'How to give feedback')}</div>
          <p className="mt-1">{t(f.feedbackTip)}</p>
        </div>
      </div>
      <div className="relative mt-6">
        <div className="text-sm font-semibold">{t('สายงานที่มักเหมาะ (โปรไฟล์ตัวอย่าง)', 'Job areas that often fit (typical profile)')}</div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {roles.map((r) => (
            <div key={r.id}>
              <div className="flex justify-between text-sm">
                <span>{t(r.th, r.en)}</span>
                <span className="tabular font-semibold">{r.fit}%</span>
              </div>
              <Meter value={r.fit} color={f.color} className="mt-1" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
