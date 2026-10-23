import { FACETS } from '@/domain/deep'
import { DIMENSIONS, LAYERS } from '@/domain/dimensions'
import { traitClarity } from '@/domain/scoring'
import type { Scores } from '@/domain/types'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { CLARITY } from '../character/PersonaAvatar'
import { Tooltip } from '../ui/Tooltip'

const LAYER_COLOR = { core: '#8b5cf6', thai: '#ec4899', work: '#f97316' } as const

/** Bipolar bars: the fill grows from the middle (50) toward the side the person leans to. */
export function DimensionBars({ scores, compare, facets }: { scores: Scores; compare?: Partial<Scores>; facets?: Record<string, number> }) {
  const t = useT()
  return (
    <div className="space-y-7">
      {LAYERS.map((layer) => (
        <div key={layer.id}>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <div className="flex items-center gap-2 font-semibold">
              <span className="size-2.5 rounded-full" style={{ background: LAYER_COLOR[layer.id] }} />
              {t(layer.th, layer.en)}
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400">{t(layer.blurb)}</span>
          </div>
          <div className="space-y-3.5">
            {DIMENSIONS.filter((d) => d.layer === layer.id).map((d) => {
              const v = scores[d.code]
              const left = Math.min(v, 50)
              const width = Math.abs(v - 50)
              const leanHigh = v >= 50
              return (
                <div key={d.code}>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className={leanHigh ? 'text-slate-400 dark:text-slate-500' : 'font-medium'}>{t(d.low)}</span>
                    <Tooltip content={`${t(d.th, d.en)} · ${t(CLARITY[traitClarity(v)])}`}>
                      <span className="shrink-0 cursor-default text-sm font-semibold">
                        {t(d.th, d.en)} <span className="tabular font-normal text-slate-500 dark:text-slate-400">{v}</span>
                      </span>
                    </Tooltip>
                    <span className={`text-right ${leanHigh ? 'font-medium' : 'text-slate-400 dark:text-slate-500'}`}>{t(d.high)}</span>
                  </div>
                  <div className="relative mt-1.5 h-2.5 rounded-full bg-slate-900/[0.06] dark:bg-white/10">
                    <div className="absolute inset-y-0 left-1/2 w-px bg-slate-900/20 dark:bg-white/25" />
                    <div
                      className="absolute inset-y-0 rounded-full transition-all duration-700"
                      style={{ left: `${left}%`, width: `${width}%`, background: LAYER_COLOR[layer.id], opacity: 0.85 }}
                    />
                    {compare?.[d.code] !== undefined && (
                      <div
                        className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-sm border-2 border-white bg-slate-700 dark:border-slate-900 dark:bg-slate-200"
                        style={{ left: `${compare[d.code]}%` }}
                      />
                    )}
                    <div
                      className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow dark:border-slate-900"
                      style={{ left: `${v}%`, background: LAYER_COLOR[layer.id] }}
                    />
                  </div>
                  {facets && FACETS.some((f) => f.dim === d.code && facets[f.id] !== undefined) && (
                    <div className="mt-2 grid grid-cols-3 gap-2 pl-2">
                      {FACETS.filter((f) => f.dim === d.code).map((f) => {
                        const fv = facets[f.id]
                        return (
                          <div key={f.id} className={cn(fv === undefined && 'opacity-40')}>
                            <div className="flex justify-between gap-1 text-xs text-slate-500 dark:text-slate-400">
                              <span className="truncate">{t(f.name)}</span>
                              <span className="tabular">{fv ?? '–'}</span>
                            </div>
                            <div className="mt-0.5 h-1 overflow-hidden rounded-full bg-slate-900/[0.06] dark:bg-white/10">
                              <div className="h-full rounded-full" style={{ width: `${fv ?? 0}%`, background: LAYER_COLOR[layer.id], opacity: 0.7 }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
