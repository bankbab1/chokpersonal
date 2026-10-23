import { AlertTriangle, EyeOff, Gem, Lock, MessageCircleOff, Network, SearchCheck, Shuffle, ShieldAlert, UserRound, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { CodeCharacter, RoleCharacter } from '@/components/character/RoleCharacter'
import { workfitCode } from '@/domain/code'
import { Button } from '@/components/ui/Button'
import { Card, Chip, Eyebrow } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/Tooltip'
import { TEAMS, type StaffMember } from '@/domain/demo'
import { DIMENSIONS } from '@/domain/dimensions'
import { personalSignals, sayDo } from '@/domain/insights'
import { CONTEXT_DIMS, roleGroupById, roleTypeById, type Band } from '@/domain/roles'
import { analyseTeam, MIN_AGGREGATE, type ContextSpread, type RoleDistribution, type TeamRisk } from '@/domain/team'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { useStaffPool } from '@/lib/useProfile'

const RISK_ICON: Record<string, typeof Users> = { power: ShieldAlert, 'say-do': MessageCircleOff, gems: Gem }

export function TeamPage() {
  const t = useT()
  const pool = useStaffPool()
  const [teamId, setTeamId] = useState<string>('ctw')
  const members = useMemo(() => pool.filter((m) => m.team === teamId), [pool, teamId])
  const team = useMemo(() => analyseTeam(members), [members])
  const agg = team.aggregate

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>{t('Team map · ข้อมูลตัวอย่าง', 'Team map · sample data')}</Eyebrow>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t('ทีมนี้พึ่งพาบทบาทไหน และควรคุยเรื่องอะไร', 'Which roles this team leans on, and what to talk about')}</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
          {t(
            'ใช้เป็นจุดเริ่มบทสนทนา: บทบาทที่ทีมสนใจ บทบาทที่อาจต้องพึ่งคนนอกทีม วิธีทำงานที่ชอบ กลุ่มที่อาจแบ่งพรรคแบ่งพวก คนที่อาจไม่กล้าส่งเสียง และช่องว่างระหว่างคนพูดเก่งกับคนทำงานเก่ง ไม่ใช่โควตาว่าทีมต้องมีครบทุกแบบ',
            'A starting point for conversation: the roles the team is drawn to, roles it may rely on others for, working preferences, possible cliques, people who may not speak up, and the gap between good talkers and good doers. It is not a quota; no team has to have every type.',
          )}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TEAMS.map((tm) => (
          <button
            key={tm.id}
            type="button"
            onClick={() => setTeamId(tm.id)}
            className={cn(
              'shrink-0 select-none rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600',
              teamId === tm.id ? 'border-transparent bg-violet-700 text-white dark:bg-violet-600' : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10',
            )}
          >
            {t(tm.th, tm.en)}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {agg ? (
          <>
            <Card className="lg:col-span-2">
              <h2 className="font-semibold">{t('บทบาทที่คนในทีมสนใจเป็นหลัก', 'Roles people in the team are mainly drawn to')}</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t(
                  `นับจากบทบาทหลักของ ${agg.roles.total} คน จัดตาม 6 ตระกูล เป็นความสนใจ ไม่ใช่ความสามารถ`,
                  `Primary role interest of ${agg.roles.total} people, grouped into the 6 families. Interest, not ability.`,
                )}
              </p>
              <RoleDistributionView dist={agg.roles} />
            </Card>

            <Card>
              <h2 className="font-semibold">{t('ชวนคุยเรื่องบทบาท', 'Talking about roles')}</h2>
              {agg.roles.unheld.length > 0 ? (
                <>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {t('บทบาทที่ยังไม่มีใครในทีมสนใจเป็นหลักหรือรอง:', 'Roles no one in the team holds as a main or second interest:')}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {agg.roles.unheld.map((id) => {
                      const rt = roleTypeById(id)
                      return (
                        <Chip key={id} color={rt.color}>
                          {t(rt.name)}
                        </Chip>
                      )
                    })}
                  </div>
                </>
              ) : (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t('ทุกบทบาทมีคนสนใจอย่างน้อยเป็นอันดับรอง', 'Every role has someone interested, at least as a second interest')}</p>
              )}
              <ul className="mt-4 list-disc space-y-1.5 pl-5 text-xs text-slate-600 dark:text-slate-300">
                <li>{t('งานแบบนี้ในทีมตอนนี้ใครทำอยู่ หรือพึ่งใครนอกทีม?', 'Who does this kind of work today, or who outside the team do we rely on?')}</li>
                <li>{t('ถ้าคนที่ทำอยู่ลาหรือย้าย งานไหนจะสะดุด?', 'If the person doing it is away or moves on, what stalls?')}</li>
                <li>{t('มีใครอยากลองบทบาทนี้เพื่อเติบโตไหม?', 'Would anyone like to try this role as a way to grow?')}</li>
              </ul>
              <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                {t('ทีมไม่จำเป็นต้องมีครบ 12 แบบ ความสนใจไม่ได้บอกว่าใครทำได้หรือทำไม่ได้', 'A team does not need all 12. Interest does not say who can or cannot do the work.')}
              </p>
            </Card>

            <Card className="lg:col-span-3">
              <h2 className="font-semibold">{t('วิธีทำงานที่คนในทีมชอบ', 'How people in the team prefer to work')}</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t('นับเฉพาะค่าที่เจ้าตัวยืนยันแล้ว ที่ยังไม่ยืนยันแสดงเป็น “ยังไม่ทราบ” ไม่นับเป็นกลาง ๆ', 'Only values the person has confirmed count; unconfirmed values show as “unknown”, never as middle.')}
              </p>
              <ContextBands spread={agg.context} />
            </Card>
          </>
        ) : (
          <Card className="flex gap-3 lg:col-span-3">
            <Lock size={18} className="mt-0.5 shrink-0 text-slate-500 dark:text-slate-400" />
            <div>
              <h2 className="font-semibold">{t('ซ่อนภาพรวมของกลุ่มนี้', 'Group overview hidden')}</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {t(
                  `กลุ่มนี้มีคนที่ยินยอมให้แสดงผลเพียง ${team.size} คน ภาพรวมจะแสดงเมื่อมีอย่างน้อย ${MIN_AGGREGATE} คน เพื่อไม่ให้ระบุตัวบุคคลจากตัวเลขรวมได้`,
                  `Only ${team.size} people in this group have agreed to share. The overview appears from ${MIN_AGGREGATE} people, so no one can be identified from the totals.`,
                )}
              </p>
            </div>
          </Card>
        )}

        <Card className="lg:col-span-3">
          <h2 className="font-semibold">{t('ประเด็นที่ควรคุยในทีม', 'Points worth talking about')}</h2>
          {team.risks.length === 0 && !agg?.blindSpots.length ? (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{t('ไม่พบประเด็นสำคัญ', 'Nothing major found')}</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {team.risks.map((r) => (
                <RiskCard key={r.id} risk={r} />
              ))}
              {agg?.blindSpots.map((b) => (
                <div key={b.en} className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <EyeOff size={18} className="mt-0.5 shrink-0 text-slate-500 dark:text-slate-400" />
                  <div>
                    <div className="text-sm font-semibold">{t('จุดบอด', 'Blind spot')}</div>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{t(b)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!!agg?.blindSpots.length && (
            <Button className="mt-4" variant="secondary" size="sm" icon={SearchCheck} to={`/sourcing/new?team=${teamId}`}>
              {t('ใช้ประเด็นเหล่านี้ตอนเขียนรายละเอียดตำแหน่ง', 'Use these points when writing a role brief')}
            </Button>
          )}
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            {t('สัญญาณเหล่านี้มาจากแบบทดสอบและ 360 เป็นเรื่องที่ควรพูดคุย ไม่ใช่ข้อสรุปเกี่ยวกับตัวบุคคล', 'These signals come from the test and peer ratings. They are prompts for conversation, not conclusions about anyone.')}
          </p>
        </Card>

        {agg && (
          <Card className="lg:col-span-3">
            <h2 className="font-semibold">{t('การกระจายของแต่ละมิติ', 'Spread on each dimension')}</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('แต่ละจุดคือสมาชิก 1 คน จุดที่กองรวมกันหมายถึงทุกคนคล้ายกัน ซึ่งอาจเป็นจุดบอด', 'Each dot is one member. Dots bunched together mean everyone is alike, which can be a blind spot.')}
            </p>
            <StripPlot members={members} />
          </Card>
        )}

        <Card className="lg:col-span-3">
          <h2 className="font-semibold">
            {t('สมาชิก', 'Members')} ({members.length})
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t('แสดงเฉพาะคนที่ยินยอมให้ทีมเห็นผล เรียงตามรายชื่อ ไม่ได้จัดอันดับ', 'Only people who agreed to share with their team. Listed, not ranked.')}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {members.map((m) => (
              <MemberCard key={m.id} m={m} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function RoleDistributionView({ dist }: { dist: RoleDistribution }) {
  const t = useT()
  return (
    <div className="mt-4 space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {dist.groups.map((g) => {
          const group = roleGroupById(g.id)
          return (
            <div key={g.id} className="rounded-2xl border border-slate-200/80 p-3 dark:border-white/10">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold">{t(group.name)}</span>
                <span className="tabular text-xs text-slate-500 dark:text-slate-400">{t(`${g.primary} คน`, `${g.primary}`)}</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {g.types.map((tc) => {
                  const rt = roleTypeById(tc.id)
                  const none = tc.primary === 0
                  return (
                    <Tooltip
                      key={tc.id}
                      content={t(
                        `${rt.name.th}: บทบาทหลัก ${tc.primary} คน · บทบาทรอง ${tc.secondary} คน`,
                        `${rt.name.en}: main interest ${tc.primary} · second interest ${tc.secondary}`,
                      )}
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <RoleCharacter type={tc.id} size={44} className={cn(none && 'opacity-40 grayscale')} />
                        <div className="min-w-0">
                          <div className="truncate text-xs font-medium">{t(rt.name)}</div>
                          <div className="tabular text-xs text-slate-500 dark:text-slate-400">
                            {tc.primary}
                            {tc.secondary > 0 && <span className="text-slate-400 dark:text-slate-500"> {t(`· รอง ${tc.secondary}`, `· 2nd ${tc.secondary}`)}</span>}
                          </div>
                        </div>
                      </div>
                    </Tooltip>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-900/[0.03] p-3 dark:bg-white/[0.04]">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-white/[0.06] dark:text-slate-500">
            <Shuffle size={18} />
          </span>
          <div className="min-w-0">
            <div className="text-xs font-medium">{t('ไม่มีบทบาทเด่น', 'No standout role')}</div>
            <div className="tabular text-xs text-slate-500 dark:text-slate-400">{t(`${dist.noDominant} คน · สนใจหลายแบบใกล้ ๆ กัน`, `${dist.noDominant} · interests are close together`)}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-slate-900/[0.03] p-3 dark:bg-white/[0.04]">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-white/[0.06] dark:text-slate-500">
            <UserRound size={18} />
          </span>
          <div className="min-w-0">
            <div className="text-xs font-medium">{t('ยังไม่มีข้อมูล', 'No data yet')}</div>
            <div className="tabular text-xs text-slate-500 dark:text-slate-400">{t(`${dist.unknown} คน · ไม่นับเป็นศูนย์`, `${dist.unknown} · not counted as zero`)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const BAND_STYLE: Record<Band, string> = {
  low: 'bg-slate-400 dark:bg-slate-500',
  middle: 'bg-violet-300 dark:bg-violet-400/60',
  high: 'bg-violet-700 dark:bg-violet-500',
  unknown: 'bg-slate-200 dark:bg-white/10',
}

function ContextBands({ spread }: { spread: ContextSpread[] }) {
  const t = useT()
  const bandName: Record<Band, string> = {
    low: t('ต่ำ', 'Low'),
    middle: t('กลาง', 'Middle'),
    high: t('สูง', 'High'),
    unknown: t('ยังไม่ทราบ', 'Unknown'),
  }
  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-300">
        {(['low', 'middle', 'high', 'unknown'] as Band[]).map((b) => (
          <span key={b} className="inline-flex items-center gap-1.5">
            <span className={cn('size-2.5 rounded-full', BAND_STYLE[b])} />
            {bandName[b]}
          </span>
        ))}
      </div>
      <div className="grid gap-x-10 gap-y-4 md:grid-cols-2">
        {spread.map((s) => {
          const dim = CONTEXT_DIMS.find((d) => d.id === s.dim)!
          const total = Object.values(s.counts).reduce((a, b) => a + b, 0) || 1
          return (
            <div key={s.dim}>
              <div className="text-xs font-medium">{t(dim.name)}</div>
              <div className="mt-1.5 flex h-4 overflow-hidden rounded-full bg-slate-100 dark:bg-white/[0.06]">
                {(['low', 'middle', 'high', 'unknown'] as Band[]).map((b) =>
                  s.counts[b] > 0 ? (
                    <Tooltip key={b} content={`${bandName[b]}: ${t(`${s.counts[b]} คน`, `${s.counts[b]}`)}`}>
                      <div className={cn('h-full', BAND_STYLE[b])} style={{ width: `${(s.counts[b] / total) * 100}%` }} />
                    </Tooltip>
                  ) : null,
                )}
              </div>
              <div className="mt-1 flex justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="min-w-0 truncate">{t(dim.low)}</span>
                <span className="min-w-0 truncate text-right">{t(dim.high)}</span>
              </div>
              <div className="tabular mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {t(
                  `ต่ำ ${s.counts.low} · กลาง ${s.counts.middle} · สูง ${s.counts.high} · ยังไม่ทราบ ${s.counts.unknown}`,
                  `Low ${s.counts.low} · Middle ${s.counts.middle} · High ${s.counts.high} · Unknown ${s.counts.unknown}`,
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RiskCard({ risk }: { risk: TeamRisk }) {
  const t = useT()
  const Icon = RISK_ICON[risk.id] ?? (risk.id.startsWith('clique') ? Network : AlertTriangle)
  const good = risk.id === 'gems'
  return (
    <div
      className={cn(
        'flex gap-3 rounded-2xl border p-4',
        good
          ? 'border-emerald-300/60 bg-emerald-50/70 dark:border-emerald-400/30 dark:bg-emerald-400/10'
          : risk.level === 'high'
            ? 'border-orange-300/70 bg-orange-50/70 dark:border-orange-400/30 dark:bg-orange-400/10'
            : 'border-amber-200/70 bg-amber-50/60 dark:border-amber-400/20 dark:bg-amber-400/5',
      )}
    >
      <Icon size={18} className={cn('mt-0.5 shrink-0', good ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400')} />
      <div className="min-w-0">
        <div className="text-sm font-semibold">{t(risk.title)}</div>
        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{t(risk.detail)}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {risk.people.map((p) => (
            <span key={p} className="rounded-full bg-white px-2 py-0.5 text-xs font-medium dark:bg-white/10">
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

const dotColor = (m: StaffMember) => (m.roleClass?.primary ? roleTypeById(m.roleClass.primary).color : '#94a3b8')

function StripPlot({ members }: { members: StaffMember[] }) {
  const t = useT()
  return (
    <div className="mt-4 grid gap-x-10 gap-y-2.5 md:grid-cols-2">
      {DIMENSIONS.map((d) => (
        <div key={d.code} className="grid grid-cols-[minmax(0,7rem)_1fr] items-center gap-3 sm:grid-cols-[8.5rem_1fr]">
          <span className="truncate text-xs font-medium">{t(d.th, d.en)}</span>
          <div className="relative h-5 rounded-full bg-slate-900/[0.05] dark:bg-white/[0.06]">
            <div className="absolute inset-y-1 left-1/2 w-px bg-slate-900/15 dark:bg-white/20" />
            {members.map((m) => (
              <span
                key={m.id}
                className={cn('absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white dark:border-slate-900', m.isYou && 'size-3.5 ring-2 ring-violet-600')}
                style={{ left: `${m.scores[d.code]}%`, background: dotColor(m), opacity: 0.85 }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function MemberCard({ m }: { m: StaffMember }) {
  const t = useT()
  const sd = sayDo(m.scores, m.observedDelivery)
  const signals = personalSignals(m.scores)
  const c = m.roleClass
  const primary = c?.primary ? roleTypeById(c.primary) : null
  return (
    <div className={cn('rounded-2xl bg-slate-900/[0.03] p-3 dark:bg-white/[0.04]', m.isYou && 'ring-2 ring-violet-600')}>
      <div className="flex items-center gap-3">
        {m.scores ? (
          <CodeCharacter code={workfitCode(m.scores).code} size={52} />
        ) : (
          <span className="grid size-[52px] shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-white/[0.06] dark:text-slate-500">
            <UserRound size={20} />
          </span>
        )}
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">
            {m.name} {m.isYou && <span className="text-violet-700 dark:text-violet-300">({t('คุณ', 'you')})</span>}
          </div>
          <div className="truncate text-xs text-slate-500 dark:text-slate-400">{t(m.role)}</div>
          <div className="truncate text-xs font-medium" style={primary ? { color: primary.color } : undefined}>
            {primary
              ? t(primary.name)
              : c
                ? t('ไม่มีบทบาทเด่น', 'No standout role')
                : <span className="text-slate-500 dark:text-slate-400">{t('ยังไม่มีข้อมูลบทบาท', 'No role data yet')}</span>}
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {sd.kind === 'quiet-achiever' && <Chip color="#059669">{t('เพชรในตม', 'Hidden gem')}</Chip>}
        {sd.kind === 'talk-over-do' && <Chip color="#ea580c">{t('พูดนำงาน', 'Talk > do')}</Chip>}
        {signals.map((s) => (
          <Chip key={s.id} color={s.level === 'high' ? '#ea580c' : '#d97706'}>
            {t(s.short)}
          </Chip>
        ))}
      </div>
    </div>
  )
}
