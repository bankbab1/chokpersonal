import { Download, FlaskConical, Info, Sparkles } from 'lucide-react'
import { useMemo } from 'react'
import { Character } from '@/components/character/Character'
import { Button } from '@/components/ui/Button'
import { Card, Chip, Eyebrow } from '@/components/ui/Card'
import { runLab } from '@/domain/cluster'
import { DEMO_CANDIDATES } from '@/domain/demo'
import { familyById } from '@/domain/personas'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { useStaffPool } from '@/lib/useProfile'

/** Below this many points apart, a found group is treated as the same as a starter family. */
const SAME_FAMILY = 9

export function LabPage() {
  const t = useT()
  const staff = useStaffPool()
  const rows = useMemo(() => [...staff, ...DEMO_CANDIDATES].map((p) => p.scores), [staff])
  const lab = useMemo(() => runLab(rows), [rows])
  const maxSil = Math.max(...lab.candidates.map((c) => c.silhouette), 0.01)

  const exportModel = () => {
    const model = {
      version: `fitted-${new Date().toISOString().slice(0, 10)}`,
      source: 'fitted',
      fittedOn: { n: rows.length, date: new Date().toISOString() },
      k: lab.best.k,
      silhouette: Number(lab.best.silhouette.toFixed(3)),
      groups: lab.groups.map((g) => ({
        name: '',
        size: g.size,
        nearestStarterFamily: g.matchDistance < SAME_FAMILY ? g.nearestFamily : null,
        centroid: Object.fromEntries(Object.entries(g.centroid).map(([k, v]) => [k, Math.round(v)])),
      })),
    }
    const blob = new Blob([JSON.stringify(model, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `workfit-persona-model-${model.version}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const steps = [
    t('เก็บผลจริงอย่างน้อย 200–300 คน พร้อมการประเมินจากคนรอบตัว', 'Collect at least 200–300 real results with peer ratings'),
    t('รันหน้านี้แล้วส่งออกโมเดล ยืนยันจำนวนกลุ่มด้วย latent profile analysis', 'Run this page, export the model and confirm the number of groups with latent profile analysis'),
    t('เก็บเฉพาะกลุ่มที่หัวหน้าจำได้ในการทดสอบแบบไม่บอกชื่อ และมีคะแนนจากคนรอบตัวต่างจากกลุ่มอื่น', 'Keep only groups managers recognise in a blind test and whose peer ratings differ from other groups'),
    t('จัดเวิร์กช็อปให้พนักงานตั้งชื่อและเลือกตัวละครของแต่ละกลุ่ม', 'Run a workshop where staff name each group and choose its character'),
    t('แทนที่ไฟล์โมเดลในระบบ ผลของทุกคนจะคำนวณใหม่อัตโนมัติ', 'Replace the model file; everyone’s results recalculate automatically'),
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Persona Lab</Eyebrow>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t('ให้ข้อมูลจริงบอกว่าคนแบ่งเป็นกี่กลุ่ม', 'Let real data say how many groups people form')}</h1>
          <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
            {t(
              'เครื่องมือในตลาดกำหนดประเภทจากทฤษฎีแล้วจับคนใส่กล่อง Workfit ทำกลับกัน: จัดกลุ่มจากคะแนนจริงของคนในองค์กร แล้วค่อยตั้งชื่อกลุ่มร่วมกับพนักงาน',
              'Popular tools define types from theory and put people in boxes. Workfit does the reverse: group people from real scores, then name the groups together with staff.',
            )}
          </p>
        </div>
        <Button variant="primary" icon={Download} onClick={exportModel}>
          {t('ส่งออกโมเดล (JSON)', 'Export model (JSON)')}
        </Button>
      </div>

      <Card className="flex gap-3 border-amber-300/60 bg-amber-50/70 dark:border-amber-400/30 dark:bg-amber-400/10">
        <Info size={18} className="mt-0.5 shrink-0 text-amber-600" />
        <p className="text-sm text-slate-700 dark:text-slate-200">
          {t(
            `ตอนนี้ใช้ข้อมูลตัวอย่าง ${rows.length} คน ซึ่งสร้างจาก 6 ตระกูลตั้งต้น ผลจึงย้อนกลับมาเจอ 6 ตระกูลนั้นเป็นธรรมดา เมื่อมีผลจริงอย่างน้อย 200–300 คน หน้านี้จะบอกว่ากลุ่มจริงมีกี่กลุ่ม และควรยืนยันด้วย latent profile analysis ก่อนใช้งาน`,
            `This uses ${rows.length} sample people generated from the 6 starter families, so finding those families again is expected. With at least 200–300 real results, this page shows how many real groups exist; confirm with latent profile analysis before using them.`,
          )}
        </p>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Card>
          <div className="flex items-center gap-2 font-semibold">
            <FlaskConical size={18} className="text-violet-500" /> {t('กี่กลุ่มจึงแยกได้ชัดที่สุด', 'How many groups separate best')}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t('ค่า silhouette ยิ่งสูง กลุ่มยิ่งแยกกันชัด · ต้องมีทุกกลุ่ม ≥ 5% ของคน', 'Higher silhouette = clearer groups · every group must be ≥ 5% of people')}
          </p>
          <div className="mt-4 space-y-2">
            {lab.candidates.map((c) => {
              const chosen = c.k === lab.best.k
              return (
                <div key={c.k} className="grid grid-cols-[4.5rem_1fr_2.5rem] items-center gap-2 text-sm">
                  <span className={cn('tabular', chosen && 'font-bold')}>{t(`${c.k} กลุ่ม`, `${c.k} groups`)}</span>
                  <div className="h-3 overflow-hidden rounded-full bg-slate-900/[0.06] dark:bg-white/10">
                    <div
                      className={cn('h-full rounded-full', chosen ? 'bg-gradient-brand' : c.eligible ? 'bg-slate-400/70' : 'bg-slate-300/50 dark:bg-white/15')}
                      style={{ width: `${Math.max(2, (c.silhouette / maxSil) * 100)}%` }}
                    />
                  </div>
                  <span className={cn('tabular text-right text-xs', chosen ? 'font-bold' : 'text-slate-500 dark:text-slate-400')}>{c.silhouette.toFixed(2)}</span>
                </div>
              )
            })}
          </div>
          <p className="mt-4 text-sm">
            {t('เลือก', 'Chosen:')} <span className="font-bold">{t(`${lab.best.k} กลุ่ม`, `${lab.best.k} groups`)}</span> · silhouette {lab.best.silhouette.toFixed(2)}
          </p>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          {lab.groups.map((g, i) => {
            const fam = familyById(g.nearestFamily)
            const same = g.matchDistance < SAME_FAMILY
            return (
              <Card key={g.index} className="p-4">
                <div className="flex items-center gap-3">
                  {same ? (
                    <Character animal={fam.animal} variant="LF" color={fam.color} soft={fam.soft} size={56} />
                  ) : (
                    <div className="grid size-14 place-items-center rounded-full bg-gradient-brand text-white">
                      <Sparkles size={22} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-semibold">{t(`กลุ่ม ${i + 1}`, `Group ${i + 1}`)}</div>
                    <div className="tabular text-xs text-slate-500 dark:text-slate-400">
                      {t(`${g.size} คน`, `${g.size} people`)} · {Math.round(g.share * 100)}%
                    </div>
                    <div className="mt-0.5 text-xs font-medium" style={{ color: same ? fam.color : undefined }}>
                      {same ? t(`ตรงกับ${fam.th} (${fam.animalTh})`, `Matches ${fam.en} (${fam.animalEn})`) : t('กลุ่มใหม่ ยังไม่มีในชุดตั้งต้น', 'New group, not in the starter set')}
                    </div>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5">
                  {g.traits.map((tr) => (
                    <div key={tr.dim} className="flex items-center justify-between gap-2 text-xs">
                      <span>
                        <span className="font-medium">{t(tr.name)}</span> <span className="text-slate-500 dark:text-slate-400">· {t(tr.pole)}</span>
                      </span>
                      <Chip color={tr.delta >= 0 ? '#7c3aed' : '#ea580c'}>
                        {tr.delta >= 0 ? '+' : ''}
                        {tr.delta}
                      </Chip>
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <Card>
        <h2 className="font-semibold">{t('ขั้นตอนเปลี่ยนชุดตั้งต้นเป็นชุดจากข้อมูลจริง', 'From the starter set to a data-driven set')}</h2>
        <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-slate-600 dark:text-slate-300">
          {steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </Card>
    </div>
  )
}
