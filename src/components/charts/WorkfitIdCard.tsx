import { Check, Copy, IdCard } from 'lucide-react'
import { useState } from 'react'
import { workfitCode } from '@/domain/code'
import { workfitId } from '@/domain/styles'
import type { Scores } from '@/domain/types'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { Button } from '../ui/Button'

/** Every familiar frame in one card: 4 letters + A/T, temperament group, energy, work-style blend, top strength. */
export function WorkfitIdCard({ scores, compact }: { scores: Scores; compact?: boolean }) {
  const t = useT()
  const id = workfitId(scores)
  const wc = workfitCode(scores)
  const [copied, setCopied] = useState(false)
  const cells = [
    { k: 'Workfit Code', v: wc.code, sub: `${t(wc.title)} · ≈ ${id.code}`, big: true },
    { k: t('พลังงาน', 'Energy'), v: t(id.energy.th, id.energy.en), sub: `${id.energy.score}/100` },
    {
      k: t('สไตล์การทำงาน', 'Work style'),
      v: t(id.style.primary.th, id.style.primary.en),
      sub: id.style.secondary ? `${t('รอง', 'Secondary')}: ${t(id.style.secondary.th, id.style.secondary.en)}` : id.style.primary.en,
    },
    { k: t('จุดแข็งอันดับ 1', 'Top strength'), v: t(id.topStrength.name), sub: t(id.topStrength.blurb) },
  ]
  return (
    <div className={cn('relative overflow-hidden rounded-2xl p-5 text-white', compact ? '' : 'sm:p-6')} style={{ background: '#1e1b3a' }}>
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
          <IdCard size={16} /> Workfit ID
        </div>
        {!compact && (
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/15 dark:text-white"
            icon={copied ? Check : Copy}
            onClick={() => {
              void navigator.clipboard?.writeText(`${wc.code} · ${t(id.line)}`)
              setCopied(true)
              window.setTimeout(() => setCopied(false), 1600)
            }}
          >
            {copied ? t('คัดลอกแล้ว', 'Copied') : t('คัดลอก ID', 'Copy ID')}
          </Button>
        )}
      </div>
      <div className={cn('relative mt-4 grid gap-3', compact ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4')}>
        {cells.map((c) => (
          <div key={c.k} className="rounded-xl bg-white/[0.06] p-3">
            <div className="text-[11px] text-white/60">{c.k}</div>
            <div className={cn('mt-0.5 font-semibold leading-tight', c.big ? 'text-2xl tracking-wide' : 'text-lg')}>{c.v}</div>
            <div className="mt-0.5 truncate text-[11px] text-white/70">{c.sub}</div>
          </div>
        ))}
      </div>
      {!compact && <p className="relative mt-3 text-xs text-white/70">{t(id.temperament.blurb)}</p>}
    </div>
  )
}
