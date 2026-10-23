import { Check, Copy, IdCard } from 'lucide-react'
import { useState } from 'react'
import { workfitCode } from '@/domain/code'
import { characterOf } from '@/domain/characters'
import { ROLE_ACTIVITY } from '@/domain/roleActivity'
import { workfitId } from '@/domain/styles'
import type { Scores } from '@/domain/types'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { useRoleResult } from '@/lib/useProfile'
import { Button } from '../ui/Button'

/** The shareable summary: main character, Workfit Code, energy and work style. No mapping to other platforms' types. */
export function WorkfitIdCard({ scores, compact }: { scores: Scores; compact?: boolean }) {
  const t = useT()
  const id = workfitId(scores)
  const wc = workfitCode(scores)
  const c = useRoleResult()?.classification
  const [copied, setCopied] = useState(false)
  const ch = characterOf(scores)
  const character = {
    v: t(ch.name),
    sub: c?.primary ? `${t('อยากทำ', 'Wants')}: ${t(ROLE_ACTIVITY[c.primary])}` : ch.key,
  }
  const cells = [
    { k: t('ตัวละคร', 'Character'), v: character.v, sub: character.sub },
    { k: 'Workfit Code', v: wc.code, sub: `${t(wc.title)} · ${t(wc.vibe.name)}`, big: true },
    { k: t('พลังงาน', 'Energy'), v: t(id.energy.th, id.energy.en), sub: `${id.energy.score}/100` },
    {
      k: t('สไตล์การทำงาน', 'Work style'),
      v: t(id.style.primary.th, id.style.primary.en),
      sub: id.style.secondary ? `${t('รอง', 'Secondary')}: ${t(id.style.secondary.th, id.style.secondary.en)}` : id.style.primary.en,
    },
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
              void navigator.clipboard?.writeText(cells.map((x) => `${x.k}: ${x.v}`).join(' · '))
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
            <div className="text-xs text-white/60">{c.k}</div>
            <div className={cn('mt-0.5 font-semibold leading-tight', c.big ? 'text-2xl tracking-wide' : 'text-lg')}>{c.v}</div>
            <div className="mt-0.5 truncate text-xs text-white/70">{c.sub}</div>
          </div>
        ))}
      </div>
      {!compact && <p className="relative mt-3 text-xs text-white/70">{t(wc.crew.tagline)}</p>}
    </div>
  )
}
