import { ArrowRight, ClipboardList, Link2, ListChecks, Plus, RotateCcw, Sparkles, Target, Users } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Card, Chip, Eyebrow } from '@/components/ui/Card'
import { TEAMS } from '@/domain/demo'
import { dimMeta } from '@/domain/dimensions'
import { JOB_LINES, MANAGER_STYLES } from '@/domain/fit'
import { scoreCandidate, type RoleSpec } from '@/domain/sourcing'
import { useT } from '@/lib/i18n'
import { useCandidatePool, useStaffPool } from '@/lib/useProfile'
import { pipelineKey, useSourcing } from '@/store/sourcing'

export function SourcingHome() {
  const t = useT()
  const roles = useSourcing((s) => s.roles)
  const resetDemo = useSourcing((s) => s.resetDemo)
  const steps = [
    { icon: Target, title: t('กำหนดโปรไฟล์ตำแหน่ง', 'Define the role profile'), body: t('เริ่มจากเทมเพลตสายงาน โคลนจากคนเก่งตัวจริง หรือเติมจุดบอดของทีม', 'Start from a job-area template, clone your best people, or fill a team’s blind spots') },
    { icon: Link2, title: t('ส่งลิงก์ให้ผู้สมัคร', 'Send candidates a link'), body: t('ผู้สมัครทำแบบทดสอบ 20 นาที พนักงานภายในที่เปิดรับการย้ายงานถูกรวมให้อัตโนมัติ', 'Candidates take the 20-minute test; opted-in internal staff are included automatically') },
    { icon: ListChecks, title: t('Shortlist พร้อมเหตุผล', 'A shortlist with reasons'), body: t('จัดอันดับตามงาน ทีม และหัวหน้า แยก “พูดเก่ง” ออกจาก “ทำเก่ง”', 'Ranked by job, team and manager fit, separating “talks well” from “delivers well”') },
    { icon: ClipboardList, title: t('คู่มือสัมภาษณ์รายคน', 'Per-candidate interview guide'), body: t('คำถามเจาะจุดที่ต้องพิสูจน์ของแต่ละคน ไม่ต้องคิดคำถามเอง', 'Questions aimed at what each person needs to prove') },
  ]
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>{t('สรรหาและคัดเลือก', 'Sourcing & selection')}</Eyebrow>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t('หาคนที่ใช่ ไม่ใช่แค่คนที่สัมภาษณ์เก่ง', 'Find the right person, not just the best interviewee')}</h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            {t(
              'สร้างโปรไฟล์ตำแหน่ง แล้วดูผู้สมัครภายนอกและพนักงานภายในในรายการเดียว พร้อมเหตุผล ความเข้ากับทีม และคำถามสัมภาษณ์',
              'Build a role profile, then see external applicants and internal staff in one list, with reasons, team fit and interview questions.',
            )}
          </p>
        </div>
        <Button variant="glow" size="lg" icon={Plus} to="/sourcing/new">
          {t('สร้างตำแหน่งใหม่', 'New role')}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ icon: Icon, title, body }, i) => (
          <Card key={title} className="p-4">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-gradient-brand text-white">
                <Icon size={16} />
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {t('ขั้นที่', 'Step')} {i + 1}
              </span>
            </div>
            <div className="mt-3 font-semibold">{title}</div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">{body}</p>
          </Card>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold">
            {t('ตำแหน่งที่เปิดอยู่', 'Open roles')} ({roles.length})
          </h2>
          <Button variant="ghost" size="sm" icon={RotateCcw} title={t('คืนค่าตำแหน่งตัวอย่างและล้างสถานะผู้สมัคร', 'Restore sample roles and clear candidate stages')} onClick={resetDemo}>
            {t('รีเซ็ตตัวอย่าง', 'Reset samples')}
          </Button>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((r) => (
            <RoleCard key={r.id} role={r} />
          ))}
          <Link
            to="/sourcing/new"
            className="grid min-h-48 place-items-center rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 transition hover:border-violet-400 hover:text-violet-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 dark:border-white/15 dark:text-slate-400"
          >
            <span className="flex items-center gap-2 font-medium">
              <Plus size={18} /> {t('สร้างตำแหน่งใหม่', 'New role')}
            </span>
          </Link>
        </div>
      </div>
    </div>
  )
}

function RoleCard({ role }: { role: RoleSpec }) {
  const t = useT()
  const pool = useCandidatePool()
  const staff = useStaffPool()
  const stages = useSourcing((s) => s.stages)
  const team = staff.filter((m) => role.teamId && m.team === role.teamId)
  const stats = useMemo(() => {
    const scored = pool.map((c) => scoreCandidate(role, c, team).overall)
    return { strong: scored.filter((x) => x >= 75).length, total: pool.length }
  }, [pool, role, team])
  const inPipeline = pool.filter((c) => {
    const st = stages[pipelineKey(role.id, c.id)]
    return st && st !== 'new' && st !== 'declined'
  }).length
  const job = JOB_LINES.find((j) => j.id === role.jobLine)
  const tm = TEAMS.find((x) => x.id === role.teamId)
  const mgr = MANAGER_STYLES.find((m) => m.id === role.managerStyle)
  return (
    <Card className="flex flex-col">
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {job ? t(job.th, job.en) : t('กำหนดเอง', 'Custom')}
        {tm && ` · ${t(tm.th, tm.en)}`}
      </div>
      <h3 className="mt-1 text-lg font-semibold">{role.title || t('ตำแหน่งไม่มีชื่อ', 'Untitled role')}</h3>
      {mgr && (
        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {t('หัวหน้า', 'Manager')}: {t(mgr.th, mgr.en)}
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {role.targets.slice(0, 5).map((tg) => (
          <Chip key={tg.dim}>
            {t(dimMeta(tg.dim).th, dimMeta(tg.dim).en)} {tg.center >= 50 ? '↑' : '↓'}
          </Chip>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-2xl bg-slate-900/[0.04] p-2 dark:bg-white/[0.05]">
          <div className="tabular text-xl font-semibold">{stats.strong}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">{t(`เหมาะ ≥ 75% จาก ${stats.total}`, `fit ≥ 75% of ${stats.total}`)}</div>
        </div>
        <div className="rounded-2xl bg-slate-900/[0.04] p-2 dark:bg-white/[0.05]">
          <div className="tabular text-xl font-semibold">{inPipeline}</div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400">{t('อยู่ในขั้นตอน', 'in progress')}</div>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="primary" size="sm" className="flex-1" iconRight={ArrowRight} to={`/sourcing/${role.id}`}>
          {t('ดู shortlist', 'View shortlist')}
        </Button>
        <Button size="sm" icon={Sparkles} to={`/sourcing/${role.id}/edit`}>
          {t('แก้โปรไฟล์', 'Edit profile')}
        </Button>
      </div>
      <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
        <Users size={11} /> {t('ผู้สมัครภายนอก + พนักงานภายในที่เปิดรับการย้ายงาน', 'External applicants + opted-in internal staff')}
      </div>
    </Card>
  )
}
