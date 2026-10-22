import { ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router'
import { ORG_NAV } from '@/components/layout/AppShell'
import { Card, Eyebrow } from '@/components/ui/Card'
import { useT } from '@/lib/i18n'

/** Phone entry point for the organisation tools (the desktop header has a dropdown instead). */
export function OrgPage() {
  const t = useT()
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>{t('สำหรับองค์กร', 'For organisations')}</Eyebrow>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t('ใช้ Workfit กับทีมและการสรรหา', 'Use Workfit for teams and hiring')}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {t('ทุกเครื่องมือใช้เฉพาะผลที่พนักงานยินยอมให้แชร์', 'Every tool only uses results people have agreed to share.')}
        </p>
      </div>
      <div className="grid gap-3">
        {ORG_NAV.map(({ to, label, icon: Icon, blurb }) => (
          <button key={to} type="button" onClick={() => navigate(to)} className="text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600">
            <Card className="flex items-center gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-brand text-white">
                <Icon size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">{t(label)}</span>
                <span className="block text-sm text-slate-500 dark:text-slate-400">{t(blurb)}</span>
              </span>
              <ArrowRight size={18} className="text-slate-400" />
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}
