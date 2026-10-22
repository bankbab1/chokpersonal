import { AlertTriangle, EyeOff, Gem, MessageCircleOff, Network, SearchCheck, ShieldAlert, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Character } from '@/components/character/Character'
import { PersonaAvatar } from '@/components/character/PersonaAvatar'
import { Button } from '@/components/ui/Button'
import { Card, Chip, Eyebrow } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/Tooltip'
import { TEAMS, type StaffMember } from '@/domain/demo'
import { DIMENSIONS } from '@/domain/dimensions'
import { personalSignals, sayDo } from '@/domain/insights'
import { FAMILIES, familyById, personaById } from '@/domain/personas'
import { analyseTeam, type TeamRisk } from '@/domain/team'
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

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>{t('Team map · ข้อมูลตัวอย่าง', 'Team map · sample data')}</Eyebrow>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t('ทีมนี้ขาดอะไร และเสี่ยงตรงไหน', 'What this team lacks, and where the risks are')}</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
          {t(
            'ดูความครบของบทบาท กลุ่มที่อาจแบ่งพรรคแบ่งพวก คนที่อาจไม่กล้าส่งเสียง และช่องว่างระหว่างคนพูดเก่งกับคนทำงานเก่ง',
            'See role coverage, possible cliques, people who may not speak up, and the gap between good talkers and good doers.',
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
              teamId === tm.id ? 'border-transparent bg-violet-700 text-white dark:bg-violet-600' : 'border-slate-200 bg-white hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10',
            )}
          >
            {t(tm.th, tm.en)}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card>
          <h2 className="font-semibold">{t('ตระกูลในทีม', 'Families in the team')}</h2>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {FAMILIES.map((f) => {
              const n = team.familyCount[f.id]
              return (
                <div key={f.id} className={cn('text-center transition', n === 0 && 'opacity-35 grayscale')}>
                  <Character animal={f.animal} variant="LF" color={f.color} soft={f.soft} size={56} className="mx-auto" />
                  <div className="mt-1 text-xs font-medium">{t(f.th, f.en)}</div>
                  <div className="tabular text-xs text-slate-500 dark:text-slate-400">{t(`${n} คน`, `${n}`)}</div>
                </div>
              )
            })}
          </div>
          {team.missingFamilies.length > 0 && (
            <p className="mt-4 text-xs text-slate-600 dark:text-slate-300">
              {t(
                `ไม่มี${team.missingFamilies.map((id) => familyById(id).th).join(' และ ')}ในทีม ควรคิดถึงเมื่อรับคนใหม่`,
                `No ${team.missingFamilies.map((id) => familyById(id).en).join(' or ')} in the team; consider this when hiring`,
              )}
            </p>
          )}
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-semibold">{t('แผนที่บทบาท · นำ/สนับสนุน × เร็ว/รอบคอบ', 'Role map · lead/support × fast/careful')}</h2>
          <RoleMap members={members} />
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-semibold">{t('จุดเสี่ยงของทีม', 'Team risks')}</h2>
          {team.risks.length === 0 && team.blindSpots.length === 0 ? (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{t('ไม่พบจุดเสี่ยงสำคัญ', 'No major risks found')}</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {team.risks.map((r) => (
                <RiskCard key={r.id} risk={r} />
              ))}
              {team.blindSpots.map((b) => (
                <div key={b.en} className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 dark:border-white/10 dark:bg-white/[0.03]">
                  <EyeOff size={18} className="mt-0.5 shrink-0 text-slate-500" />
                  <div>
                    <div className="text-sm font-semibold">{t('จุดบอด', 'Blind spot')}</div>
                    <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{t(b)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {team.blindSpots.length > 0 && (
            <Button className="mt-4" variant="primary" size="sm" icon={SearchCheck} to={`/sourcing/new?team=${teamId}`}>
              {t('เปิดตำแหน่งเพื่อเติมจุดบอดทีมนี้', 'Open a role to fill these blind spots')}
            </Button>
          )}
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            {t('สัญญาณเหล่านี้มาจากแบบทดสอบและ 360 เป็นเรื่องที่ควรพูดคุย ไม่ใช่ข้อสรุปเกี่ยวกับตัวบุคคล', 'These signals come from the test and peer ratings. They are prompts for conversation, not conclusions about anyone.')}
          </p>
        </Card>

        <Card>
          <h2 className="font-semibold">{t('สมดุลบทบาท', 'Role balance')}</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            {(
              [
                ['LF', t('นำ · เร็ว', 'Lead · Fast')],
                ['LC', t('นำ · รอบคอบ', 'Lead · Careful')],
                ['SF', t('สนับสนุน · เร็ว', 'Support · Fast')],
                ['SC', t('สนับสนุน · รอบคอบ', 'Support · Careful')],
              ] as const
            ).map(([k, label]) => (
              <div key={k} className={cn('rounded-2xl p-3', team.quadrants[k] === 0 ? 'bg-orange-500/10' : 'bg-slate-900/[0.04] dark:bg-white/[0.05]')}>
                <div className="tabular text-2xl font-semibold">{team.quadrants[k]}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
              </div>
            ))}
          </div>
          {team.quadrants.LF + team.quadrants.LC > members.length / 2 && (
            <p className="mt-3 text-xs text-slate-600 dark:text-slate-300">{t('คนอยากนำมากกว่าครึ่งทีม เสี่ยงชิงบทบาทกัน', 'More than half the team wants to lead; roles may clash')}</p>
          )}
        </Card>

        <Card className="lg:col-span-3">
          <h2 className="font-semibold">{t('การกระจายของแต่ละมิติ', 'Spread on each dimension')}</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t('แต่ละจุดคือสมาชิก 1 คน จุดที่กองรวมกันหมายถึงทุกคนคล้ายกัน ซึ่งอาจเป็นจุดบอด', 'Each dot is one member. Dots bunched together mean everyone is alike, which can be a blind spot.')}
          </p>
          <StripPlot members={members} />
        </Card>

        <Card className="lg:col-span-3">
          <h2 className="font-semibold">
            {t('สมาชิก', 'Members')} ({members.length})
          </h2>
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
      <Icon size={18} className={cn('mt-0.5 shrink-0', good ? 'text-emerald-600' : 'text-orange-600')} />
      <div className="min-w-0">
        <div className="text-sm font-semibold">{t(risk.title)}</div>
        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{t(risk.detail)}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {risk.people.map((p) => (
            <span key={p} className="rounded-full bg-white px-2 py-0.5 text-[11px] font-medium dark:bg-white/10">
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function RoleMap({ members }: { members: StaffMember[] }) {
  const t = useT()
  return (
    <div className="relative mt-4 aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-900/[0.03] dark:bg-white/[0.03]">
      <div className="absolute inset-x-0 top-1/2 h-px bg-slate-900/10 dark:bg-white/10" />
      <div className="absolute inset-y-0 left-1/2 w-px bg-slate-900/10 dark:bg-white/10" />
      <span className="absolute left-3 top-2 text-[11px] font-medium text-slate-500">{t('นำ · รอบคอบ', 'Lead · Careful')}</span>
      <span className="absolute right-3 top-2 text-[11px] font-medium text-slate-500">{t('นำ · เร็ว', 'Lead · Fast')}</span>
      <span className="absolute bottom-2 left-3 text-[11px] font-medium text-slate-500">{t('สนับสนุน · รอบคอบ', 'Support · Careful')}</span>
      <span className="absolute bottom-2 right-3 text-[11px] font-medium text-slate-500">{t('สนับสนุน · เร็ว', 'Support · Fast')}</span>
      {members.map((m) => {
        const p = personaById(m.persona.personaId)
        return (
          <Tooltip key={m.id} content={`${m.name} · ${t(p.th, p.en)} · ${t(m.role)}`}>
            <div
              className={cn('absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:z-10 hover:scale-125', m.isYou && 'z-10')}
              style={{ left: `${8 + (m.scores.PC / 100) * 84}%`, top: `${92 - (m.scores.LD / 100) * 84}%` }}
            >
              <PersonaAvatar result={m.persona} size={m.isYou ? 52 : 40} showBadges={false} />
              <div className={cn('mt-0.5 text-center text-[10px] font-medium', m.isYou && 'text-violet-700')}>{m.name.replace('คุณ', '')}</div>
            </div>
          </Tooltip>
        )
      })}
    </div>
  )
}

function StripPlot({ members }: { members: StaffMember[] }) {
  const t = useT()
  return (
    <div className="mt-4 grid gap-x-10 gap-y-2.5 md:grid-cols-2">
      {DIMENSIONS.map((d) => (
        <div key={d.code} className="grid grid-cols-[8.5rem_1fr] items-center gap-3">
          <span className="truncate text-xs font-medium">{t(d.th, d.en)}</span>
          <div className="relative h-5 rounded-full bg-slate-900/[0.05] dark:bg-white/[0.06]">
            <div className="absolute inset-y-1 left-1/2 w-px bg-slate-900/15 dark:bg-white/20" />
            {members.map((m) => (
              <span
                key={m.id}
                className={cn('absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white dark:border-slate-900', m.isYou && 'size-3.5 ring-2 ring-violet-600')}
                style={{ left: `${m.scores[d.code]}%`, background: familyById(m.persona.family).color, opacity: 0.85 }}
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
  const p = personaById(m.persona.personaId)
  const sd = sayDo(m.scores, m.observedDelivery)
  const signals = personalSignals(m.scores)
  return (
    <div className={cn('rounded-2xl bg-slate-900/[0.03] p-3 dark:bg-white/[0.04]', m.isYou && 'ring-2 ring-violet-600')}>
      <div className="flex items-center gap-3">
        <PersonaAvatar result={m.persona} size={52} showBadges={false} />
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">
            {m.name} {m.isYou && <span className="text-violet-700">({t('คุณ', 'you')})</span>}
          </div>
          <div className="truncate text-xs text-slate-500 dark:text-slate-400">{t(m.role)}</div>
          <div className="truncate text-xs font-medium" style={{ color: familyById(p.family).color }}>
            {t(p.th, p.en)}
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
