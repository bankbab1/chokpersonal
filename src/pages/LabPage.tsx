import { Download, FlaskConical, Info, Shuffle } from 'lucide-react'
import { useMemo } from 'react'
import { RoleCharacter } from '@/components/character/RoleCharacter'
import { Button } from '@/components/ui/Button'
import { Card, Chip, Eyebrow, Meter } from '@/components/ui/Card'
import { Tooltip } from '@/components/ui/Tooltip'
import { runLab } from '@/domain/cluster'
import { DEMO_CANDIDATES } from '@/domain/demo'
import { MODEL_VERSION, ROLE_TYPE_IDS, roleTypeById } from '@/domain/roles'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { useStaffPool } from '@/lib/useProfile'

/** Within this many RMS points of a pure type profile, a found group is read as "close to" that type. */
const CLOSE_TO_TYPE = 15

const pct = (x: number) => `${Math.round(x * 100)}%`

export function LabPage() {
  const t = useT()
  const staff = useStaffPool()
  const people = useMemo(() => [...staff, ...DEMO_CANDIDATES], [staff])
  const lab = useMemo(() => runLab(people), [people])

  const exportModel = () => {
    if (!lab) return
    const now = new Date().toISOString()
    const model = {
      model_version: MODEL_VERSION,
      kind: 'role-type-validation',
      note: 'Validation support for the 12 starter role types, not proof. Confirm with a proper psychometric study before changing the model.',
      run_date: now,
      fitted_on: { n: lab.n, excluded_no_role_data: lab.excluded },
      k: lab.best.k,
      silhouette: Number(lab.best.silhouette.toFixed(3)),
      agreement: Number(lab.agreement.toFixed(3)),
      chance_baseline: Number(lab.baseline.toFixed(3)),
      types_found: lab.typesFound,
      groups: lab.groups.map((g) => ({
        size: g.size,
        top_types: g.top.map((x) => x.id),
        nearest_type: g.nearest,
        nearest_distance: Number(g.nearestDistance.toFixed(1)),
        agreement: g.agreement === null ? null : Number(g.agreement.toFixed(3)),
        centroid: Object.fromEntries(ROLE_TYPE_IDS.map((id) => [id, Math.round(g.centroid[id])])),
      })),
    }
    const blob = new Blob([JSON.stringify(model, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `workfit-role-validation-${MODEL_VERSION}-${now.slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const steps = [
    t('เก็บผลจริงอย่างน้อย 200–300 คนที่ตอบครบ 48 ข้อ', 'Collect at least 200–300 real results with all 48 items answered'),
    t('รันหน้านี้ ดูว่ากลุ่มที่พบตรงกับ 12 แบบแค่ไหน แล้วส่งออกผล', 'Run this page, see how well the found groups match the 12 types, and export the result'),
    t('ยืนยันด้วยการวิเคราะห์ทางจิตมิติ (ความเที่ยง โครงสร้างองค์ประกอบ) ก่อนเปลี่ยนโมเดล', 'Confirm with psychometric analysis (reliability, factor structure) before changing the model'),
    t('ให้พนักงานและหัวหน้าดูว่าคำอธิบายแต่ละแบบตรงกับประสบการณ์จริงไหม', 'Ask staff and managers whether each type’s description matches their real experience'),
    t('ถ้าจะปรับ ให้ออกเวอร์ชันโมเดลใหม่ ไม่แก้ทับเวอร์ชันเดิม', 'If anything changes, release a new model version instead of editing the old one'),
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow>Persona Lab · {MODEL_VERSION}</Eyebrow>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t('ตรวจว่า 12 บทบาทตั้งต้นเข้ากับข้อมูลจริงแค่ไหน', 'Check how well the 12 starter roles fit real data')}</h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            {t(
              '12 บทบาทเป็นสมมติฐานตั้งต้น หน้านี้จัดกลุ่มคนจากคะแนนความสนใจ 12 ด้านโดยไม่บอกคำตอบล่วงหน้า แล้วเทียบว่ากลุ่มที่พบตรงกับบทบาทที่ตั้งไว้หรือไม่',
              'The 12 roles are a starting hypothesis. This page groups people from their 12 interest scores without being told the answer, then checks whether the groups it finds match the roles.',
            )}
          </p>
        </div>
        <Button variant="primary" icon={Download} onClick={exportModel} disabled={!lab}>
          {t('ส่งออกผล (JSON)', 'Export result (JSON)')}
        </Button>
      </div>

      <Card className="flex gap-3 border-amber-300/60 bg-amber-50/70 dark:border-amber-400/30 dark:bg-amber-400/10">
        <Info size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
        <div className="space-y-1 text-sm text-slate-700 dark:text-slate-200">
          <p className="font-semibold">{t('เป็นหลักฐานประกอบ ไม่ใช่ข้อพิสูจน์', 'Supporting evidence, not proof')}</p>
          <p>
            {t(
              `ตอนนี้ใช้ข้อมูลตัวอย่าง ${lab?.n ?? 0} คน ซึ่งคำตอบถูกจำลองขึ้น ผลจึงบอกได้แค่ว่าเครื่องมือทำงาน ยังบอกไม่ได้ว่า 12 แบบถูกต้อง เมื่อมีผลจริงอย่างน้อย 200–300 คน ให้ใช้หน้านี้ประกอบการวิเคราะห์ทางจิตมิติ ไม่ใช่แทน`,
              `This uses ${lab?.n ?? 0} sample people with simulated answers, so it only shows the tool works, not that the 12 types are right. With at least 200–300 real results, use this alongside a psychometric analysis, not instead of it.`,
            )}
          </p>
          {!!lab?.excluded && (
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {t(`ไม่รวม ${lab.excluded} คนที่ยังไม่มีผลบทบาท (ไม่นับเป็นศูนย์)`, `${lab.excluded} people without a role result are left out (not counted as zero).`)}
            </p>
          )}
        </div>
      </Card>

      {!lab ? (
        <Card>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t('ข้อมูลยังน้อยเกินไปที่จะจัดกลุ่ม', 'Not enough data to group yet')}</p>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t('กลุ่มตรงกับบทบาทหลักของตัวเอง', 'Group matches own main role')}</div>
              <div className="tabular mt-1 text-3xl font-semibold">{pct(lab.agreement)}</div>
              <Meter className="mt-2" value={lab.agreement * 100} />
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {t(`ถ้าสุ่มจัดกลุ่มจะได้ราว ${pct(lab.baseline)}`, `Random grouping would give about ${pct(lab.baseline)}`)}
              </p>
            </Card>
            <Card>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t('บทบาทที่เป็นแกนของบางกลุ่ม', 'Roles that lead a found group')}</div>
              <div className="tabular mt-1 text-3xl font-semibold">
                {lab.typesFound.length}
                <span className="text-base font-normal text-slate-500 dark:text-slate-400"> / 12</span>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {t('บทบาทที่ไม่ขึ้นเป็นแกนกลุ่มใด อาจซ้อนกับบทบาทอื่น หรือมีคนสนใจน้อยในข้อมูลนี้', 'A role that leads no group may overlap with another, or few people in this data lean to it.')}
              </p>
            </Card>
            <Card>
              <div className="text-xs text-slate-500 dark:text-slate-400">{t('สถานะผลของแต่ละคน', 'Result state per person')}</div>
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between"><span>{t('บทบาทเด่นชัด', 'Clear standout')}</span><span className="tabular">{lab.states.dominant}</span></div>
                <div className="flex justify-between"><span>{t('ผสมใกล้กัน', 'Close mix')}</span><span className="tabular">{lab.states.mixed}</span></div>
                <div className="flex justify-between"><span>{t('ไม่มีบทบาทเด่น', 'No standout role')}</span><span className="tabular">{lab.states.no_dominant}</span></div>
              </div>
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
            <Card className="self-start">
              <div className="flex items-center gap-2 font-semibold">
                <FlaskConical size={18} className="text-violet-700 dark:text-violet-300" /> {t('กี่กลุ่มจึงแยกได้ชัดที่สุด', 'How many groups separate best')}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {t('ค่า silhouette ยิ่งสูง กลุ่มยิ่งแยกกันชัด · ทุกกลุ่มต้อง ≥ 5% ของคน', 'Higher silhouette = clearer groups · every group must be ≥ 5% of people')}
              </p>
              <SilhouetteBars lab={lab} />
              <p className="mt-4 text-sm">
                {t('เลือก', 'Chosen:')} <span className="font-bold">{t(`${lab.best.k} กลุ่ม`, `${lab.best.k} groups`)}</span> · silhouette {lab.best.silhouette.toFixed(2)}
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {t('ถ้า 12 แบบแยกกันจริง จำนวนกลุ่มที่ดีที่สุดควรใกล้ 12 และแต่ละกลุ่มควรมีแกนเป็นคนละบทบาท', 'If the 12 types really separate, the best number of groups should be near 12, each led by a different role.')}
              </p>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {lab.groups.map((g, i) => {
                const lead = roleTypeById(g.top[0].id)
                const close = g.nearestDistance <= CLOSE_TO_TYPE
                return (
                  <Card key={g.index} className="p-4">
                    <div className="flex items-center gap-3">
                      {close ? (
                        <RoleCharacter type={g.nearest} size={56} />
                      ) : (
                        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-white/[0.06] dark:text-slate-500">
                          <Shuffle size={22} />
                        </span>
                      )}
                      <div className="min-w-0">
                        <div className="font-semibold">{t(`กลุ่ม ${i + 1}`, `Group ${i + 1}`)}</div>
                        <div className="tabular text-xs text-slate-500 dark:text-slate-400">
                          {t(`${g.size} คน`, `${g.size} people`)} · {pct(g.share)}
                        </div>
                        <div className="mt-0.5 text-xs font-medium" style={close ? { color: roleTypeById(g.nearest).color } : undefined}>
                          {close
                            ? t(`ใกล้กับ${roleTypeById(g.nearest).name.th}`, `Close to ${roleTypeById(g.nearest).name.en}`)
                            : t('ไม่ใกล้บทบาทใดชัดเจน', 'Not clearly close to one role')}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {g.top.map((x) => {
                        const rt = roleTypeById(x.id)
                        return (
                          <Chip key={x.id} color={rt.color}>
                            {t(rt.name)} · <span className="tabular">{x.score}</span>
                          </Chip>
                        )
                      })}
                    </div>
                    <div className="mt-3 text-xs text-slate-600 dark:text-slate-300">
                      {g.agreement === null
                        ? t('ไม่มีใครในกลุ่มมีบทบาทเด่น', 'No one in this group has a standout role')
                        : t(
                            `${pct(g.agreement)} ของคนในกลุ่มมีบทบาทหลักเป็น${lead.name.th}`,
                            `${pct(g.agreement)} of people here have ${lead.name.en} as their main role`,
                          )}
                    </div>
                    <Tooltip content={t(`ระยะห่างจากโปรไฟล์ต้นแบบ ${g.nearestDistance.toFixed(1)} คะแนน (ยิ่งน้อยยิ่งใกล้)`, `Distance to the pure profile: ${g.nearestDistance.toFixed(1)} points (lower is closer)`)}>
                      <div className="mt-2 inline-block text-xs text-slate-500 dark:text-slate-400">
                        {t(`ระยะห่าง ${g.nearestDistance.toFixed(1)}`, `Distance ${g.nearestDistance.toFixed(1)}`)}
                      </div>
                    </Tooltip>
                  </Card>
                )
              })}
            </div>
          </div>

          <Card>
            <h2 className="font-semibold">{t('จำนวนคนตามบทบาทหลัก', 'People per main role')}</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {t('ใช้ดูว่ามีบทบาทไหนที่แทบไม่มีใครเลือก ซึ่งอาจต้องปรับคำถาม ไม่ได้แปลว่าบทบาทนั้นไม่สำคัญ', 'Shows roles almost no one lands on, which may mean the questions need work. It does not mean the role matters less.')}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {ROLE_TYPE_IDS.map((id) => {
                const rt = roleTypeById(id)
                const n = lab.primaryCounts[id]
                const found = lab.typesFound.includes(id)
                return (
                  <div key={id} className="flex min-w-0 items-center gap-2">
                    <RoleCharacter type={id} size={40} showProp={false} className={cn(n === 0 && 'opacity-40 grayscale')} />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-medium">{t(rt.name)}</div>
                      <div className="tabular text-xs text-slate-500 dark:text-slate-400">
                        {n} {found && <span className="text-violet-700 dark:text-violet-300">· {t('เป็นแกนกลุ่ม', 'leads a group')}</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </>
      )}

      <Card>
        <h2 className="font-semibold">{t('ขั้นตอนตรวจสอบ 12 บทบาทด้วยข้อมูลจริง', 'Checking the 12 roles with real data')}</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-slate-600 dark:text-slate-300">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </Card>
    </div>
  )
}

function SilhouetteBars({ lab }: { lab: NonNullable<ReturnType<typeof runLab>> }) {
  const t = useT()
  const maxSil = Math.max(...lab.candidates.map((c) => c.silhouette), 0.01)
  return (
    <div className="mt-4 space-y-2">
      {lab.candidates.map((c) => {
        const chosen = c.k === lab.best.k
        return (
          <div key={c.k} className="grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-2 text-sm">
            <span className={cn('tabular', chosen && 'font-bold')}>{t(`${c.k} กลุ่ม`, `${c.k} groups`)}</span>
            <div className="h-3 overflow-hidden rounded-full bg-slate-900/[0.06] dark:bg-white/10">
              <div
                className={cn('h-full rounded-full', chosen ? 'bg-violet-700 dark:bg-violet-500' : c.eligible ? 'bg-slate-400/70 dark:bg-slate-500' : 'bg-slate-300/50 dark:bg-white/15')}
                style={{ width: `${Math.max(2, (Math.max(0, c.silhouette) / maxSil) * 100)}%` }}
              />
            </div>
            <span className={cn('tabular text-right text-xs', chosen ? 'font-bold' : 'text-slate-500 dark:text-slate-400')}>{c.silhouette.toFixed(2)}</span>
          </div>
        )
      })}
    </div>
  )
}
