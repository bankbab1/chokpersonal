import type { SayDo } from '@/domain/insights'
import { useT } from '@/lib/i18n'

/**
 * Talk vs. delivery on one 2-axis square: x = presents well (say), y = delivers (do).
 * The quadrant the dot lands in is the finding; the two bars underneath give the numbers.
 */
export function SayDoMeter({ value, observed }: { value: SayDo; observed?: boolean }) {
  const t = useT()
  const x = 12 + (value.say / 100) * 176
  const y = 188 - (value.do / 100) * 176
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <svg viewBox="0 0 200 200" className="w-44 shrink-0" role="img" aria-label={`${t('พูด', 'Say')} ${value.say}, ${t('ทำ', 'Do')} ${value.do}`}>
        <rect x="12" y="12" width="88" height="88" rx="10" fill="#10b981" opacity="0.12" />
        <rect x="100" y="12" width="88" height="88" rx="10" fill="#8b5cf6" opacity="0.12" />
        <rect x="12" y="100" width="88" height="88" rx="10" fill="#94a3b8" opacity="0.12" />
        <rect x="100" y="100" width="88" height="88" rx="10" fill="#f97316" opacity="0.14" />
        <text x="56" y="30" textAnchor="middle" fontSize="10" fill="#059669" fontWeight="600">{t('เพชรในตม', 'Hidden gem')}</text>
        <text x="144" y="30" textAnchor="middle" fontSize="10" fill="#7c3aed" fontWeight="600">{t('พูดได้ ทำได้', 'Says & does')}</text>
        <text x="56" y="182" textAnchor="middle" fontSize="10" fill="#64748b" fontWeight="600">{t('กำลังพัฒนา', 'Developing')}</text>
        <text x="144" y="182" textAnchor="middle" fontSize="10" fill="#ea580c" fontWeight="600">{t('พูดนำงาน', 'Talk > do')}</text>
        <line x1="100" y1="12" x2="100" y2="188" stroke="currentColor" opacity="0.15" />
        <line x1="12" y1="100" x2="188" y2="100" stroke="currentColor" opacity="0.15" />
        <circle cx={x} cy={y} r="16" fill="#ec4899" opacity="0.18" />
        <circle cx={x} cy={y} r="8" fill="#ec4899" stroke="#fff" strokeWidth="3" />
      </svg>
      <div className="w-full space-y-3">
        <div>
          <div className="text-lg font-semibold">{t(value.title)}</div>
          <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{t(value.detail)}</p>
        </div>
        {[
          [t('พูด · นำเสนอตัวเอง', 'Say · self-presentation'), value.say, '#ec4899'],
          [observed ? t('ทำ · จากคนรอบตัว', 'Do · rated by peers') : t('ทำ · ส่งมอบงาน (ประเมินตนเอง)', 'Do · delivery (self-rated)'), value.do, '#10b981'],
        ].map(([label, v, c]) => (
          <div key={label as string}>
            <div className="flex justify-between text-xs">
              <span className="font-medium">{label}</span>
              <span className="tabular text-slate-500 dark:text-slate-400">{v}</span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-900/[0.06] dark:bg-white/10">
              <div className="h-full rounded-full" style={{ width: `${v}%`, background: c as string }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
