import {
  AlertTriangle, ArrowRight, Award, BatteryCharging, Briefcase, Building2, Check, Compass, Copy, Globe2, HeartHandshake, MessageCircle, Play,
  RotateCcw, Sparkles, ThumbsDown, ThumbsUp, Type, UserRoundCog, UsersRound, Zap,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { DeepResults } from '@/components/charts/DeepResults'
import { DimensionBars } from '@/components/charts/DimensionBars'
import { HoroscopeCard } from '@/components/charts/Horoscope'
import { SameTypeCard } from '@/components/charts/SameType'
import { SayDoMeter } from '@/components/charts/SayDoMeter'
import { EnergyMeter, FourLetter, StrengthList, WorkStyleGrid } from '@/components/charts/StyleFrames'
import { CodeLetters, WorkfitCodeCard } from '@/components/charts/WorkfitCodeCard'
import { WorkfitIdCard } from '@/components/charts/WorkfitIdCard'
import { Character } from '@/components/character/Character'
import { CLARITY, MODIFIER_ICONS, PersonaAvatar } from '@/components/character/PersonaAvatar'
import { Button } from '@/components/ui/Button'
import { Card, Chip, Eyebrow, Meter } from '@/components/ui/Card'
import { cultureBridge } from '@/domain/culture'
import { deepProfile } from '@/domain/deep'
import { closest, DEMO_STAFF } from '@/domain/demo'
import { ENVIRONMENTS, JOB_LINES, managerFit, rankRoles, type FitResult } from '@/domain/fit'
import { personalSignals, sayDo } from '@/domain/insights'
import { CONTEXTS } from '@/domain/items'
import { familyById, modifierById, personaById, VARIANTS } from '@/domain/personas'
import type { Profile } from '@/domain/types'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { usePeerSummary, useProfile, useProgress } from '@/lib/useProfile'
import { useAssessment } from '@/store/assessment'

export function MePage() {
  const profile = useProfile()
  return profile ? <Result profile={profile} /> : <Empty />
}

function Empty() {
  const t = useT()
  const navigate = useNavigate()
  const fillDemo = useAssessment((s) => s.fillDemo)
  const progress = useProgress()
  return (
    <div className="mx-auto grid max-w-xl place-items-center py-16 text-center">
      <Character animal="owl" variant="SC" color="#F59E0B" soft="#FEF3C7" size={140} className="animate-float" />
      <h1 className="mt-6 text-2xl font-semibold">{t('ยังไม่มีผลของคุณ', 'No results yet')}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        {progress.done > 0
          ? t(`ทำไปแล้ว ${progress.pct}% ทำต่ออีกนิดเพื่อดูผล`, `${progress.pct}% done. Finish to see your results.`)
          : t('ทำแบบทดสอบประมาณ 20 นาทีเพื่อดูตัวละครและความเหมาะกับงานของคุณ', 'Take the 20-minute test to meet your character and see where you fit.')}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button variant="glow" size="lg" to="/test" iconRight={ArrowRight}>
          {progress.done > 0 ? t('ทำต่อ', 'Continue') : t('เริ่มทำแบบทดสอบ', 'Start the test')}
        </Button>
        <Button
          size="lg"
          icon={Play}
          onClick={() => {
            fillDemo()
            navigate('/me')
          }}
        >
          {t('ดูผลตัวอย่าง', 'See a sample result')}
        </Button>
      </div>
    </div>
  )
}

function Result({ profile }: { profile: Profile }) {
  const t = useT()
  const name = useAssessment((s) => s.name)
  const background = useAssessment((s) => s.background)
  const setBackground = useAssessment((s) => s.setBackground)
  const fillDemo = useAssessment((s) => s.fillDemo)
  const reset = useAssessment((s) => s.reset)
  const peers = usePeerSummary()
  const deep = useAssessment((s) => s.deep)
  const facets = deepProfile(deep).facets
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)

  const persona = personaById(profile.persona.personaId)
  const fam = familyById(persona.family)
  const variant = VARIANTS.find((v) => v.id === persona.variant)
  const blend = profile.persona.blend ? familyById(profile.persona.blend) : null
  const roles = rankRoles(profile.scores)
  const envs = rankRoles(profile.scores, ENVIRONMENTS)
  const managers = managerFit(profile.scores)
  const observed = Boolean(peers?.delivery !== undefined)
  const sd = sayDo(profile.scores, peers?.delivery)
  const signals = personalSignals(profile.scores)
  const bridge = cultureBridge(profile.scores, background)
  const twins = closest(profile.scores, DEMO_STAFF, 4)

  const mods = profile.persona.modifiers.map((m) => t(modifierById(m).th, modifierById(m).en)).join(', ')
  const best = roles.slice(0, 3).map((r) => `${t(r.th, r.en)} ${r.fit}%`).join(', ')
  const line = `${t(fam.animalTh, fam.animalEn)} ${t(persona.th, persona.en)} · ${t(fam.th, fam.en)}${mods ? ` · ${mods}` : ''} · ${t('เหมาะกับ', 'Best fit')}: ${best}`

  return (
    <div className="space-y-5">
      {!profile.quality.ok && (
        <Card className="flex items-start gap-3 border-amber-300/60 bg-amber-50/80 dark:border-amber-400/30 dark:bg-amber-400/10">
          <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={20} />
          <div className="text-sm">
            <div className="font-semibold">{t('ผลนี้อาจยังไม่แม่นยำ', 'These results may not be accurate')}</div>
            <p className="mt-0.5 text-slate-600 dark:text-slate-300">
              {profile.quality.attentionFailed > 0 && t(`ตอบข้อตรวจความตั้งใจไม่ตรง ${profile.quality.attentionFailed} ข้อ · `, `${profile.quality.attentionFailed} attention check(s) missed · `)}
              {profile.quality.straightLined && t('ตอบเหมือนกันติดต่อกันหลายข้อ · ', 'Many identical answers in a row · ')}
              {profile.quality.tooFastShare >= 0.3 &&
                t(`ตอบเร็วกว่า 2 วินาทีต่อข้อ ${Math.round(profile.quality.tooFastShare * 100)}% · `, `${Math.round(profile.quality.tooFastShare * 100)}% of answers under 2 seconds · `)}
              {t('แนะนำให้ทำใหม่อย่างตั้งใจ', 'Consider retaking it carefully')}
            </p>
          </div>
        </Card>
      )}

      {/* Hero */}
      <Card className="overflow-hidden p-6 sm:p-8">
        <div className="relative grid items-center gap-8 md:grid-cols-[auto_1fr]">
          <PersonaAvatar result={profile.persona} size={220} float className="mx-auto" />
          <div>
            <Eyebrow>{name ? t(`ผลของ${name.startsWith('คุณ') ? name : `คุณ${name}`}`, `${name}'s profile`) : t('ผลของคุณ', 'Your profile')}</Eyebrow>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
              {t(persona.th, persona.en)} <span className="text-slate-400 dark:text-slate-500">· {t(persona.en, persona.th)}</span>
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <CodeLetters scores={profile.scores} size="sm" />
              <span className="text-sm text-slate-500 dark:text-slate-400">Workfit Code</span>
            </div>
            <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">{t(persona.tagline)}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Chip color={fam.color}>
                {t(fam.animalTh, fam.animalEn)} · {t(fam.th, fam.en)}
              </Chip>
              {variant && <Chip>{t(variant.th, variant.en)}</Chip>}
              <Chip>
                {t('โปรไฟล์', 'Profile ')}
                {t(CLARITY[profile.persona.clarity])}
              </Chip>
              {blend && <Chip color={blend.color}>{t(`มีมุม${blend.th}`, `with a ${blend.en} side`)}</Chip>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.persona.modifiers.map((id) => {
                const m = modifierById(id)
                const Icon = MODIFIER_ICONS[m.icon]
                return (
                  <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-slate-900">
                    <Icon size={13} /> {t(m.th, m.en)}
                  </span>
                )
              })}
            </div>
            <div className="mt-5 flex items-start gap-2 rounded-2xl bg-slate-900/[0.04] p-3 dark:bg-white/[0.05]">
              <Zap size={16} className="mt-0.5 shrink-0" style={{ color: fam.color }} />
              <p className="text-sm">
                <span className="font-semibold">{t('พลังพิเศษ:', 'Superpower:')}</span> {t(persona.superpower)}
              </p>
            </div>
          </div>
        </div>
        <div className="relative mt-6 flex flex-col gap-3 rounded-2xl border border-dashed border-slate-300 p-4 sm:flex-row sm:items-center dark:border-white/15">
          <p className="flex-1 text-sm leading-relaxed">
            <span className="font-semibold">{t('สรุปบรรทัดเดียว · ', 'In one line · ')}</span>
            {line}
          </p>
          <Button
            size="sm"
            icon={copied ? Check : Copy}
            onClick={() => {
              void navigator.clipboard?.writeText(line)
              setCopied(true)
              window.setTimeout(() => setCopied(false), 1600)
            }}
          >
            {copied ? t('คัดลอกแล้ว', 'Copied') : t('คัดลอก', 'Copy')}
          </Button>
        </div>
      </Card>

      <WorkfitCodeCard scores={profile.scores} />

      <WorkfitIdCard scores={profile.scores} />

      <SameTypeCard scores={profile.scores} />

      <HoroscopeCard scores={profile.scores} />

      {/* Familiar frames, rebuilt as spectrums on measured scores */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <SectionTitle icon={BatteryCharging} title={t('อินโทร / เอ็กซ์โทร', 'Introvert / Extrovert')} />
          <div className="mt-4">
            <EnergyMeter scores={profile.scores} />
          </div>
        </Card>
        <Card>
          <SectionTitle icon={Compass} title={t('สไตล์การทำงาน', 'Work style')} />
          <div className="mt-4">
            <WorkStyleGrid scores={profile.scores} />
          </div>
        </Card>
        <Card>
          <SectionTitle icon={Type} title={t('รหัสบุคลิก', 'Personality code')} />
          <div className="mt-4">
            <FourLetter scores={profile.scores} />
          </div>
        </Card>
        <Card>
          <SectionTitle icon={Award} title={t('Top 5 จุดแข็ง', 'Top 5 strengths')} />
          <div className="mt-4">
            <StrengthList scores={profile.scores} />
          </div>
        </Card>
      </div>

      <DeepResults />

      {/* Person-centric: how others see you + culture bridge */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <SectionTitle icon={UsersRound} title={t('มุมมองคนรอบตัว', 'Peer view')} note={peers?.n ? t(`${peers.n} คนประเมินแล้ว`, `${peers.n} rater(s)`) : undefined} />
          {!peers?.n ? (
            <div className="mt-4">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {t(
                  'คนอื่นมักเห็นเราแม่นกว่าที่เราเห็นตัวเอง ชวนหัวหน้า เพื่อน หรือน้องในทีม 3–5 คนมาประเมินคุณใน 3 นาที แล้วดูจุดบอดและจุดแข็งที่ซ่อนอยู่',
                  'Others often see us more accurately than we see ourselves. Invite 3–5 managers, colleagues or friends to rate you in 3 minutes, then see your blind spots and hidden strengths.',
                )}
              </p>
              <Button className="mt-4" variant="primary" icon={UsersRound} to="/peers">
                {t('ชวนคนรอบตัวประเมิน', 'Invite people to rate me')}
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {peers.gaps.filter((g) => g.kind !== 'aligned').slice(0, 4).map((g) => (
                <div key={g.dim} className="flex items-center justify-between gap-3 rounded-2xl bg-slate-900/[0.03] px-3 py-2 text-sm dark:bg-white/[0.04]">
                  <span>
                    <span className="font-medium">{t(g.name)}</span>{' '}
                    <span className={cn('text-xs', g.kind === 'blind-spot' ? 'text-orange-600 dark:text-orange-300' : 'text-emerald-600 dark:text-emerald-300')}>
                      {g.kind === 'blind-spot' ? t('คนอื่นเห็นน้อยกว่าที่คุณคิด', 'others see less than you do') : t('คนอื่นเห็นมากกว่าที่คุณคิด', 'others see more than you do')}
                    </span>
                  </span>
                  <span className="tabular shrink-0 text-xs text-slate-500 dark:text-slate-400">
                    {t('คุณ', 'You')} {g.self} · {t('คนอื่น', 'Others')} {g.others}
                  </span>
                </div>
              ))}
              {peers.gaps.every((g) => g.kind === 'aligned') && (
                <p className="text-sm text-slate-600 dark:text-slate-300">{t('คุณเห็นตัวเองตรงกับที่คนอื่นเห็น', 'You see yourself the way others do')}</p>
              )}
              <Button className="mt-2" size="sm" to="/peers" iconRight={ArrowRight}>
                {t('ดูมุมมองคนรอบตัวทั้งหมด', 'See the full peer view')}
              </Button>
            </div>
          )}
        </Card>

        <Card>
          <SectionTitle icon={Globe2} title={t('สะพานวัฒนธรรม', 'Culture Bridge')} />
          <div className="mt-3 flex rounded-xl bg-slate-900/[0.05] p-1 text-sm dark:bg-white/[0.06]">
            {(
              [
                ['thai', t('ฉันเป็นคนไทย → ทีมนานาชาติ', "I'm Thai → international team")],
                ['foreign', t('ฉันไม่ใช่คนไทย → ทีมคนไทย', "I'm not Thai → Thai team")],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-pressed={background === id}
                onClick={() => setBackground(id)}
                className={cn(
                  'flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600',
                  background === id ? 'bg-white shadow-sm dark:bg-white/20' : 'text-slate-500 dark:text-slate-400',
                )}
              >
                {label}
              </button>
            ))}
          </div>
          {bridge.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
              {t('สไตล์ของคุณอยู่ตรงกลาง ปรับตัวได้ทั้งสองแบบโดยไม่ต้องระวังเป็นพิเศษ', 'Your style sits in the middle; you can adapt either way without special care.')}
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {bridge.slice(0, 4).map((b) => (
                <div key={b.title.en} className={cn('rounded-2xl border p-3', b.tone === 'asset' ? 'border-emerald-300/60 bg-emerald-50/60 dark:border-emerald-400/20 dark:bg-emerald-400/5' : 'border-sky-200/70 bg-sky-50/60 dark:border-sky-400/20 dark:bg-sky-400/5')}>
                  <div className="text-sm font-semibold">{t(b.title)}</div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{t(b.insight)}</p>
                  <p className="mt-1.5 text-xs font-medium">→ {t(b.tip)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Bento */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle icon={Briefcase} title={t('สายงานที่เหมาะ', 'Best-fit job areas')} note={t(`${JOB_LINES.length} สายงานที่พบบ่อย`, `${JOB_LINES.length} common job areas`)} />
          <div className="mt-4 space-y-3">
            {roles.slice(0, 5).map((r, i) => (
              <FitRow key={r.id} r={r} rank={i + 1} color={fam.color} />
            ))}
          </div>
          <details className="group mt-3">
            <summary className="cursor-pointer list-none text-sm font-medium text-violet-600 dark:text-violet-300">
              <span className="group-open:hidden">{t(`ดูทั้งหมด ${roles.length} สายงาน`, `Show all ${roles.length} job areas`)}</span>
              <span className="hidden group-open:inline">{t('ซ่อน', 'Hide')}</span>
            </summary>
            <div className="mt-3 space-y-3">
              {roles.slice(5).map((r, i) => (
                <FitRow key={r.id} r={r} rank={i + 6} color={fam.color} />
              ))}
            </div>
          </details>
        </Card>

        <Card>
          <SectionTitle icon={MessageCircle} title={t('พูด vs ทำ', 'Say vs do')} note={observed ? t('จากคนรอบตัว', 'peer-rated') : t('จะแม่นขึ้นเมื่อมีคนรอบตัวประเมิน', 'more accurate with peer ratings')} />
          <div className="mt-4">
            <SayDoMeter value={sd} observed={observed} />
          </div>
        </Card>

        <Card>
          <SectionTitle icon={Building2} title={t('สภาพแวดล้อมที่เหมาะ', 'Best-fit environments')} />
          <div className="mt-4 space-y-3">
            {envs.map((e) => (
              <div key={e.id}>
                <div className="flex justify-between text-sm">
                  <span>{t(e.th, e.en)}</span>
                  <span className="tabular font-semibold">{e.fit}%</span>
                </div>
                <Meter value={e.fit} color={fam.color} className="mt-1.5" />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle icon={UserRoundCog} title={t('หัวหน้าที่เหมาะ', 'Manager fit')} />
          <div className="mt-4 space-y-3">
            {managers.map((m) => (
              <div key={m.style} className="rounded-2xl bg-slate-900/[0.03] p-3 dark:bg-white/[0.04]">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium">{t(m.name)}</span>
                  <span className={cn('tabular font-semibold', m.fit >= 70 ? 'text-emerald-600 dark:text-emerald-400' : m.fit < 55 ? 'text-orange-600 dark:text-orange-400' : '')}>{m.fit}%</span>
                </div>
                {m.notes.slice(0, 2).map((n) => (
                  <p key={n.text.en} className="mt-1.5 flex gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                    {n.good ? <ThumbsUp size={12} className="mt-0.5 shrink-0 text-emerald-500" /> : <ThumbsDown size={12} className="mt-0.5 shrink-0 text-orange-500" />}
                    {t(n.text)}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <SectionTitle icon={HeartHandshake} title={t('สิ่งที่ควรรู้', 'Worth knowing')} note={t('สำหรับคุณและหัวหน้า', 'for you and your manager')} />
          {signals.length === 0 ? (
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">{t('ไม่พบสัญญาณที่ต้องดูแลเป็นพิเศษ', 'No signals that need special attention')}</p>
          ) : (
            <div className="mt-4 space-y-3">
              {signals.map((s) => (
                <div key={s.id} className={cn('rounded-2xl border p-3', s.level === 'high' ? 'border-orange-300/70 bg-orange-50/70 dark:border-orange-400/30 dark:bg-orange-400/10' : 'border-amber-200/70 bg-amber-50/60 dark:border-amber-400/20 dark:bg-amber-400/5')}>
                  <div className="text-sm font-semibold">{t(s.title)}</div>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{t(s.detail)}</p>
                  <p className="mt-1.5 text-xs font-medium">→ {t(s.support)}</p>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <SectionTitle icon={Sparkles} title={Object.keys(facets).length ? t('18 มิติ + ด้านย่อย', '18 dimensions + facets') : t('18 มิติของคุณ', 'Your 18 dimensions')} note={peers?.n ? t('◆ = คนรอบตัว', '◆ = peers') : t('คะแนนกลาง = 50', 'middle = 50')} />
          <div className="mt-5">
            <DimensionBars scores={profile.scores} compare={peers?.n ? peers.others : undefined} facets={Object.keys(facets).length ? facets : undefined} />
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <SectionTitle icon={Zap} title={t('เมื่อสถานการณ์เปลี่ยน', 'When the situation changes')} />
            <div className="mt-4 space-y-3">
              {profile.shifts.map((s) => {
                const c = CONTEXTS.find((x) => x.id === s.context)
                return (
                  <div key={s.context}>
                    <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{c ? t(c.th, c.en) : ''}</div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {s.likely.map((b, i) => (
                        <Chip key={`${b.en}-${i}`} color="#7c3aed">
                          {t(b)}
                        </Chip>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
          <Card>
            <SectionTitle icon={UsersRound} title={t(`ในฐานะ${fam.th}`, `As a ${fam.en.replace(/s$/, '')}`)} />
            <div className="mt-3 space-y-3 text-sm">
              <ListBlock title={t('จุดแข็ง', 'Strengths')} items={fam.strengths.map((x) => t(x))} good />
              <ListBlock title={t('ระวัง', 'Watch out for')} items={fam.watchouts.map((x) => t(x))} />
              <p>
                <span className="font-semibold">{t('ให้ feedback อย่างไร:', 'How to give feedback:')}</span> {t(fam.feedbackTip)}
              </p>
              <p>
                <span className="font-semibold">{t('เมื่อเครียด:', 'Under stress:')}</span> {t(fam.underStress)}
              </p>
            </div>
          </Card>
        </div>

        <Card className="lg:col-span-3">
          <SectionTitle icon={UsersRound} title={t('คนที่โปรไฟล์ใกล้คุณที่สุด', 'People with the closest profile')} note={t('ข้อมูลตัวอย่าง', 'sample data')} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {twins.map(({ person, sim }) => {
              const pp = personaById(person.persona.personaId)
              return (
                <div key={person.id} className="flex items-center gap-3 rounded-2xl bg-slate-900/[0.03] p-3 dark:bg-white/[0.04]">
                  <PersonaAvatar result={person.persona} size={52} showBadges={false} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{person.name}</div>
                    <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {t(pp.th, pp.en)} · {t(person.role)}
                    </div>
                    <div className="tabular mt-0.5 text-xs font-medium text-violet-600 dark:text-violet-300">{t(`เหมือน ${sim}%`, `${sim}% similar`)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <Button icon={Sparkles} to={`/personas/${persona.id}`}>
          {t('อ่าน persona ของฉัน', 'Read about my persona')}
        </Button>
        <Button
          icon={RotateCcw}
          onClick={() => {
            reset()
            navigate('/test')
          }}
        >
          {t('ทำแบบทดสอบใหม่', 'Retake the test')}
        </Button>
        <Button variant="ghost" icon={Play} onClick={() => fillDemo()}>
          {t('สุ่มผลตัวอย่างใหม่', 'New random sample')}
        </Button>
      </div>
    </div>
  )
}

function SectionTitle({ icon: Icon, title, note }: { icon: typeof Briefcase; title: string; note?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
          <Icon size={16} />
        </span>
        <h2 className="text-base font-semibold">{title}</h2>
      </div>
      {note && <span className="text-right text-xs text-slate-500 dark:text-slate-400">{note}</span>}
    </div>
  )
}

function FitRow({ r, rank, color }: { r: FitResult; rank: number; color: string }) {
  const t = useT()
  const strong = r.reasons.filter((x) => x.kind === 'strong').slice(0, 2)
  const watch = r.reasons.filter((x) => x.kind === 'watch').slice(0, 1)
  const examples = JOB_LINES.find((j) => j.id === r.id)?.examples
  return (
    <div className="rounded-2xl bg-slate-900/[0.03] p-3 dark:bg-white/[0.04]">
      <div className="flex items-center gap-3">
        <span className="tabular grid size-7 shrink-0 place-items-center rounded-lg bg-white text-xs font-bold shadow-sm dark:bg-white/10">{rank}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0">
              <span className="block truncate font-medium">{t(r.th, r.en)}</span>
              {examples && <span className="block truncate text-[11px] text-slate-500 dark:text-slate-400">{t(examples)}</span>}
            </span>
            <span className="tabular font-display text-lg font-bold">{r.fit}%</span>
          </div>
          <Meter value={r.fit} color={color} className="mt-1" />
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 pl-10 text-xs text-slate-600 dark:text-slate-300">
        {strong.map((s) => (
          <span key={s.dim} className="flex items-center gap-1">
            <ThumbsUp size={11} className="text-emerald-500" /> {t(s.label)} {s.score}
          </span>
        ))}
        {watch.map((s) => (
          <span key={s.dim} className="flex items-center gap-1">
            <AlertTriangle size={11} className="text-orange-500" /> {t(s.label)} {s.score}
          </span>
        ))}
      </div>
    </div>
  )
}

function ListBlock({ title, items, good }: { title: string; items: string[]; good?: boolean }) {
  return (
    <div>
      <div className="font-semibold">{title}</div>
      <ul className="mt-1 space-y-1">
        {items.map((i) => (
          <li key={i} className="flex gap-2 text-slate-600 dark:text-slate-300">
            <span className={cn('mt-2 size-1.5 shrink-0 rounded-full', good ? 'bg-emerald-500' : 'bg-orange-500')} />
            {i}
          </li>
        ))}
      </ul>
    </div>
  )
}
