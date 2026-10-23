import { ArrowRight, ClipboardList, Link2, ListChecks, Pencil, Plus, RotateCcw, Target, Users } from 'lucide-react'
import { Link } from 'react-router'
import { RoleCharacter } from '@/components/character/RoleCharacter'
import { Button } from '@/components/ui/Button'
import { Card, Chip, Eyebrow } from '@/components/ui/Card'
import { TEAMS } from '@/domain/demo'
import { CONTEXT_DIMS, MANAGER_TEMPLATES, roleTypeById, type ContextDimId } from '@/domain/roles'
import { checkWeights, weightedTypes, weightToPct, type RoleSpec } from '@/domain/sourcing'
import { useT } from '@/lib/i18n'
import { useCandidatePool } from '@/lib/useProfile'
import { pipelineKey, useSourcing } from '@/store/sourcing'

export function SourcingHome() {
  const t = useT()
  const roles = useSourcing((s) => s.roles)
  const resetDemo = useSourcing((s) => s.resetDemo)
  const steps = [
    { icon: Target, title: t('เขียนหน้าที่ของตำแหน่ง', 'Describe the duties'), body: t('ให้น้ำหนักหน้าที่ตามบทบาท 12 แบบ รวม 100% และกำหนดช่วงการทำงานที่รับได้', 'Weight the duties over the 12 role types (100% in total) and set acceptable working ranges') },
    { icon: Link2, title: t('ส่งลิงก์ให้ผู้สมัคร', 'Send candidates a link'), body: t('ผู้สมัครทำแบบสำรวจ พนักงานภายในที่เปิดรับการย้ายงานถูกรวมไว้ด้วย', 'Candidates take the survey; opted-in internal staff are included too') },
    { icon: ListChecks, title: t('ดูทีละคน ไม่จัดอันดับ', 'One by one, no ranking'), body: t('เรียงตามชื่อหรือวันที่ แสดงบทบาทที่สนใจ ความชอบในการทำงาน และสิ่งที่ควรตกลงร่วมกันแยกจากกัน', 'Sorted by name or date; role interests, working preferences and things worth agreeing are shown separately') },
    { icon: ClipboardList, title: t('คู่มือคุยตามหน้าที่', 'Duty-based interview guide'), body: t('คำถามเรื่องหน้าที่จริงและข้อมูลที่ยังขาด ให้ตัดสินจากหลักฐาน', 'Questions about the real duties and missing information, so decisions rest on evidence') },
  ]
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow>{t('สรรหาและคัดเลือก', 'Sourcing & selection')}</Eyebrow>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t('เริ่มจากหน้าที่จริง แล้วคุยกับคนทีละคน', 'Start from the real duties, then talk to people one by one')}</h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            {t(
              'Workfit ไม่ให้คะแนนรวม ไม่จัดอันดับ และไม่คัดใครออกอัตโนมัติ ผลเป็นข้อมูลประกอบการคุย ให้ตัดสินจากการสัมภาษณ์ งานตัวอย่าง และการตรวจอ้างอิง',
              'Workfit gives no overall score, no ranking and never rejects anyone automatically. Results are conversation material; decide with interviews, work samples and reference checks.',
            )}
          </p>
        </div>
        <Button variant="primary" size="lg" icon={Plus} to="/sourcing/new">
          {t('สร้างตำแหน่งใหม่', 'New role')}
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(({ icon: Icon, title, body }, i) => (
          <Card key={title} className="p-4">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
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
            className="grid min-h-48 place-items-center rounded-2xl border-2 border-dashed border-slate-300 text-slate-500 transition hover:border-violet-400 hover:text-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600 dark:border-white/15 dark:text-slate-400 dark:hover:text-violet-300"
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
  const stages = useSourcing((s) => s.stages)
  const weighted = weightedTypes(role.roleWeights)
  const ok = checkWeights(role.roleWeights).ok
  const withData = pool.filter((c) => c.roleScores).length
  const inPipeline = pool.filter((c) => {
    const st = stages[pipelineKey(role.id, c.id)]?.stage
    return st && st !== 'new' && st !== 'declined'
  }).length
  const tm = TEAMS.find((x) => x.id === role.teamId)
  const mgr = MANAGER_TEMPLATES.find((m) => m.id === role.managerTemplate)
  const rangeDims = Object.keys(role.contextRanges) as ContextDimId[]
  return (
    <Card className="flex flex-col">
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
        {tm ? t(tm.th, tm.en) : t('ไม่ระบุทีม', 'No team set')}
        {mgr && ` · ${t(mgr.name)}`}
      </div>
      <h3 className="mt-1 text-lg font-semibold">{role.title || t('ตำแหน่งไม่มีชื่อ', 'Untitled role')}</h3>
      {weighted.length > 0 && ok ? (
        <div className="mt-3 space-y-1.5">
          {weighted.slice(0, 4).map(({ id, weight }) => (
            <div key={id} className="flex items-center gap-2 text-sm">
              <RoleCharacter type={id} size={28} showProp={false} />
              <span className="min-w-0 flex-1 truncate">{t(roleTypeById(id).name)}</span>
              <span className="tabular text-xs font-semibold text-slate-600 dark:text-slate-300">{weightToPct(weight)}%</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 rounded-xl border border-dashed border-slate-300 p-3 text-xs text-slate-600 dark:border-white/15 dark:text-slate-300">
          {t('ยังไม่ได้ให้น้ำหนักหน้าที่ แก้ตำแหน่งเพื่อกำหนด', 'Duties not weighted yet. Edit the role to set them')}
        </p>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {rangeDims.slice(0, 3).map((dim) => {
          const d = CONTEXT_DIMS.find((x) => x.id === dim)!
          const r = role.contextRanges[dim]!
          return (
            <Chip key={dim}>
              {t(d.name)} {r.min}–{r.max}
            </Chip>
          )
        })}
        {rangeDims.length === 0 && <Chip>{t('ยังไม่กำหนดช่วงการทำงาน', 'No working ranges yet')}</Chip>}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl border border-slate-200 p-2 dark:border-white/10">
          <div className="tabular text-xl font-semibold">{pool.length}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{t(`คนในรายการ · มีข้อมูลบทบาท ${withData}`, `people · ${withData} with role data`)}</div>
        </div>
        <div className="rounded-xl border border-slate-200 p-2 dark:border-white/10">
          <div className="tabular text-xl font-semibold">{inPipeline}</div>
          <div className="text-xs text-slate-500 dark:text-slate-400">{t('กำลังศึกษาเพิ่ม', 'being looked into')}</div>
        </div>
      </div>
      {role.owner && (
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {t('เจ้าของ', 'Owner')}: {role.owner}
          {role.reviewedAt && ` · ${t('ทบทวน', 'reviewed')} ${role.reviewedAt}`}
        </div>
      )}
      <div className="mt-4 flex gap-2">
        <Button variant="primary" size="sm" className="flex-1" iconRight={ArrowRight} to={`/sourcing/${role.id}`}>
          {t('ดูรายชื่อ', 'View people')}
        </Button>
        <Button size="sm" icon={Pencil} to={`/sourcing/${role.id}/edit`}>
          {t('แก้ตำแหน่ง', 'Edit role')}
        </Button>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
        <Users size={11} /> {t('ผู้สมัครภายนอก + พนักงานภายในที่เปิดรับการย้ายงาน', 'External applicants + opted-in internal staff')}
      </div>
    </Card>
  )
}
