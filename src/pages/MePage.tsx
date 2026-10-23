import {
  AlertTriangle, ArrowRight, ChevronRight, Award, BatteryCharging, Compass, Globe2, HeartHandshake, MessageCircle, Play, RotateCcw, Sparkles, UsersRound, Zap,
} from 'lucide-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { DeepResults } from '@/components/charts/DeepResults'
import { DimensionBars } from '@/components/charts/DimensionBars'
import { HoroscopeCard } from '@/components/charts/Horoscope'
import { CharacterHero, CharacterSummaryCard, LifeOutsideWorkCard } from '@/components/charts/CharacterResults'
import { AgreementsCard, SkillsCard } from '@/components/charts/GrowthCards'
import { ContextCard, ExploreCard, ManagerTeamCard, MyDataCard, RoleScoresCard, SectionTitle } from '@/components/charts/RoleResults'
import { SameTypeCard } from '@/components/charts/SameType'
import { SayDoMeter } from '@/components/charts/SayDoMeter'
import { EnergyMeter, StrengthList, WorkStyleGrid } from '@/components/charts/StyleFrames'
import { WorkfitCodeCard } from '@/components/charts/WorkfitCodeCard'
import { WorkfitIdCard } from '@/components/charts/WorkfitIdCard'
import { Character } from '@/components/character/Character'
import { CodeCharacter } from '@/components/character/RoleCharacter'
import { workfitCode } from '@/domain/code'
import { Button } from '@/components/ui/Button'
import { Card, Chip } from '@/components/ui/Card'
import { Segmented } from '@/components/ui/Segmented'
import { StickyBar } from '@/components/ui/StickyBar'
import { cultureBridge } from '@/domain/culture'
import { deepProfile } from '@/domain/deep'
import { closest, DEMO_STAFF } from '@/domain/demo'
import { personalSignals, sayDo } from '@/domain/insights'
import { CONTEXTS } from '@/domain/items'
import { characterOf } from '@/domain/characters'
import type { Profile } from '@/domain/types'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { usePeerSummary, useProfile, useProgress, useRoleResult } from '@/lib/useProfile'
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
      <Character animal="owl" color="#568ba2" soft="#d5e2e8" size={140} />
      <h1 className="mt-6 text-2xl font-semibold">{t('ยังไม่มีผลของคุณ', 'No results yet')}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-300">
        {progress.done > 0
          ? t(`ทำไปแล้ว ${progress.pct}% ทำต่ออีกนิดเพื่อดูผล`, `${progress.pct}% done. Finish to see your results.`)
          : t('เลือกได้ 3 ระดับ เร็ว 5 นาที มาตรฐาน 15 นาที หรือมืออาชีพ 30 นาที แล้วพบตัวละครของคุณ 1 ใน 16', 'Pick a level: Quick 5 min, Standard 15 min or Professional 30 min, then meet your character, 1 of 16.')}
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

  const roleResult = useRoleResult()
  const observed = Boolean(peers?.delivery !== undefined)
  const sd = sayDo(profile.scores, peers?.delivery)
  const signals = personalSignals(profile.scores)
  const bridge = cultureBridge(profile.scores, background)
  const twins = closest(profile.scores, DEMO_STAFF, 4)
  const [tab, setTabState] = useMeTab()
  const setTab = (x: MeTab) => {
    setTabState(x)
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <div>
      <StickyBar className="-mt-8 mb-5 lg:-mt-10">
        <Segmented value={tab} onChange={setTab} options={TABS.map((x) => ({ id: x.id, label: t(x.label) }))} />
      </StickyBar>

      <div key={tab} className="animate-rise space-y-5">
        {tab === 'summary' && (
          <>
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
      <CharacterHero scores={profile.scores} name={name} roles={roleResult?.classification ?? null} />
      <CharacterSummaryCard scores={profile.scores} />
      <WorkfitIdCard scores={profile.scores} />
            <NextSteps go={setTab} hasRoles={Boolean(roleResult)} />
          </>
        )}

        {tab === 'roles' && (
          <>
            {roleResult ? (
              <>
      {roleResult && (
        <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <RoleScoresCard result={roleResult} />
          <ExploreCard result={roleResult} />
        </div>
      )}
              </>
            ) : (
      <ProRolesCta />
            )}
            <SkillsCard />
          </>
        )}

        {tab === 'style' && (
          <>
      <WorkfitCodeCard scores={profile.scores} />
      <div className="grid gap-5 md:grid-cols-3">
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
          <SectionTitle icon={Award} title={t('จุดเด่นจากคำตอบ', 'Standouts in your answers')} note={t('ไม่ใช่หลักฐานทักษะ', 'not skill evidence')} />
          <div className="mt-4">
            <StrengthList scores={profile.scores} />
          </div>
        </Card>
      </div>
            <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle icon={Sparkles} title={Object.keys(facets).length ? t('18 มิติ + ด้านย่อย', '18 dimensions + facets') : t('18 มิติของคุณ', 'Your 18 dimensions')} note={peers?.n ? t('◆ = คนรอบตัว', '◆ = peers') : t('คะแนนกลาง = 50', 'middle = 50')} />
          <div className="mt-5">
            <DimensionBars scores={profile.scores} compare={peers?.n ? peers.others : undefined} facets={Object.keys(facets).length ? facets : undefined} />
          </div>
        </Card>
        <div>
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
        </div>
            </div>
      <SameTypeCard scores={profile.scores} />
      <DeepResults />
          </>
        )}

        {tab === 'others' && (
          <>
            <LifeOutsideWorkCard scores={profile.scores} />
      <div className="grid gap-5 lg:grid-cols-2">
        <ContextCard scores={profile.scores} />
        <ManagerTeamCard result={roleResult} />
      </div>
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
            <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <SectionTitle icon={MessageCircle} title={t('พูด vs ทำ', 'Say vs do')} note={observed ? t('จากคนรอบตัว', 'peer-rated') : t('จะแม่นขึ้นเมื่อมีคนรอบตัวประเมิน', 'more accurate with peer ratings')} />
          <div className="mt-4">
            <SayDoMeter value={sd} observed={observed} />
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
            </div>
        <Card>
          <SectionTitle icon={UsersRound} title={t('คนที่สไตล์การทำงานใกล้คุณที่สุด', 'People with the closest work style')} note={t('ข้อมูลตัวอย่าง', 'sample data')} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {twins.map(({ person, sim }) => {
              return (
                <div key={person.id} className="flex items-center gap-3 rounded-2xl bg-slate-900/[0.03] p-3 dark:bg-white/[0.04]">
                  <CodeCharacter code={workfitCode(person.scores).code} size={52} />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold">{person.name}</div>
                    <div className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {t(characterOf(person.scores).name)} · {t(person.role)}
                    </div>
                    <div className="tabular mt-0.5 text-xs font-medium text-violet-600 dark:text-violet-300">{t(`เหมือน ${sim}%`, `${sim}% similar`)}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
            <AgreementsCard scores={profile.scores} />
          </>
        )}

        {tab === 'data' && (
          <>
      <MyDataCard result={roleResult} scores={profile.scores} />
      <HoroscopeCard scores={profile.scores} />
      <div className="flex flex-wrap justify-center gap-3 pt-4">
        <Button icon={Sparkles} to={roleResult?.classification.primary ? `/personas/${roleResult.classification.primary}` : '/personas'}>
          {t('อ่านเรื่องตัวละครของฉัน', 'Read about my character')}
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
          </>
        )}
      </div>
    </div>
  )
}

type MeTab = 'summary' | 'roles' | 'style' | 'others' | 'data'

const TABS: { id: MeTab; label: { th: string; en: string } }[] = [
  { id: 'summary', label: { th: 'สรุป', en: 'Summary' } },
  { id: 'roles', label: { th: 'บทบาท', en: 'Roles' } },
  { id: 'style', label: { th: 'สไตล์', en: 'Style' } },
  { id: 'others', label: { th: 'กับคนอื่น', en: 'Others' } },
  { id: 'data', label: { th: 'ข้อมูล', en: 'Data' } },
]

/** Tab lives in ?tab= so links and Back work; old #deep / #context links open the right tab. */
function useMeTab(): [MeTab, (t: MeTab) => void] {
  const [params, setParams] = useSearchParams()
  const { hash } = useLocation()
  const fromHash: MeTab | null = hash === '#deep' ? 'style' : hash === '#context' ? 'others' : null
  const raw = params.get('tab') as MeTab | null
  const tab = raw && TABS.some((x) => x.id === raw) ? raw : (fromHash ?? 'summary')
  return [tab, (t) => setParams(t === 'summary' ? {} : { tab: t }, { replace: true })]
}

/** Short guide at the end of the summary so people know where to go next. */
function NextSteps({ go, hasRoles }: { go: (t: MeTab) => void; hasRoles: boolean }) {
  const t = useT()
  const items: { tab: MeTab; title: string; sub: string }[] = [
    { tab: 'roles', title: t('ดูคะแนน 12 บทบาท', 'See your 12 role scores'), sub: t('และงานที่น่าสำรวจ', 'and work worth exploring') },
    { tab: 'style', title: t('สไตล์การทำงานของคุณ', 'Your work style'), sub: t('Workfit Code และ 18 มิติ', 'Workfit Code and 18 dimensions') },
    { tab: 'others', title: t('ทำงานกับคนอื่น', 'Working with others'), sub: t('บริบทที่ต้องการ หัวหน้า ทีม และมุมมองคนรอบตัว', 'Your context, manager, team and peer view') },
  ]
  return (
    <Card className="p-0">
      <ul className="divide-y divide-slate-200/80 dark:divide-white/[0.08]">
        {items.filter((x) => hasRoles || x.tab !== 'roles').map((x) => (
          <li key={x.tab}>
            <button
              type="button"
              onClick={() => go(x.tab)}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50 active:bg-slate-100 dark:hover:bg-white/[0.03] dark:active:bg-white/[0.06]"
            >
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{x.title}</span>
                <span className="block text-sm text-slate-500 dark:text-slate-400">{x.sub}</span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-slate-400" />
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}

/** Roles tab before the Professional level: what the 48 role items add, one tap to continue. */
function ProRolesCta() {
  const t = useT()
  const navigate = useNavigate()
  const setLevel = useAssessment((s) => s.setLevel)
  return (
    <Card className="text-center">
      <h2 className="text-lg font-semibold">{t('งานที่คุณอยากทำมากขึ้น', 'Work you want more of')}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 dark:text-slate-300">
        {t(
          'ระดับมืออาชีพเพิ่ม 48 ข้อเรื่องบทบาทที่คุณอยากรับ แล้วบอก 12 บทบาท งานที่น่าสำรวจ และทักษะที่ควรตรวจ คำตอบเดิมยังอยู่',
          'The Professional level adds 48 items on the roles you want, then shows 12 role interests, work worth exploring and skills to check. Your answers carry over.',
        )}
      </p>
      <Button
        className="mt-4"
        variant="primary"
        iconRight={ArrowRight}
        onClick={() => {
          setLevel('pro')
          navigate('/test')
        }}
      >
        {t('ทำต่อระดับมืออาชีพ (~15 นาที)', 'Continue to Professional (~15 min)')}
      </Button>
    </Card>
  )
}
