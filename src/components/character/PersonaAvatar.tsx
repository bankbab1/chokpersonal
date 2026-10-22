import {
  Anchor, HandHeart, Layers, Link2, Megaphone, MessageSquareText, PartyPopper, Rocket, Ruler, Scale, ShieldCheck,
  Target, Users, Wind, type LucideIcon,
} from 'lucide-react'
import { familyById, modifierById, personaById, type ModifierIcon } from '@/domain/personas'
import type { Clarity, PersonaResult } from '@/domain/types'
import { cn } from '@/lib/cn'
import { useT, type T } from '@/lib/i18n'
import { Tooltip } from '../ui/Tooltip'
import { Character } from './Character'

export const MODIFIER_ICONS: Record<ModifierIcon, LucideIcon> = {
  hands: HandHeart,
  message: MessageSquareText,
  stairs: Layers,
  users: Users,
  shield: ShieldCheck,
  megaphone: Megaphone,
  party: PartyPopper,
  target: Target,
  wind: Wind,
  ruler: Ruler,
  link: Link2,
  scale: Scale,
  rocket: Rocket,
  anchor: Anchor,
}

export const CLARITY: Record<Clarity, T> = {
  'very-clear': { th: 'ชัดเจนมาก', en: 'very clear' },
  clear: { th: 'ชัดเจน', en: 'clear' },
  borderline: { th: 'ก้ำกึ่ง', en: 'borderline' },
}

/** Character + intensity ring (solid/thick = clear profile, dashed/thin = borderline) + modifier badges. */
export function PersonaAvatar({
  result,
  size = 160,
  showBadges = true,
  className,
  float,
}: {
  result: Pick<PersonaResult, 'personaId' | 'clarity' | 'modifiers'>
  size?: number
  showBadges?: boolean
  className?: string
  float?: boolean
}) {
  const t = useT()
  const persona = personaById(result.personaId)
  const fam = familyById(persona.family)
  const ring = result.clarity === 'very-clear' ? 6 : result.clarity === 'clear' ? 4 : 2.5
  const dash = result.clarity === 'borderline' ? '6 6' : undefined
  const badge = Math.max(22, Math.round(size * 0.2))
  return (
    <div className={cn('relative shrink-0', className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" width={size} height={size} className="absolute inset-0 animate-spin-slow" aria-hidden>
        <circle cx="100" cy="100" r="97" fill="none" stroke={fam.color} strokeWidth={ring} strokeDasharray={dash} strokeLinecap="round" opacity="0.9" />
      </svg>
      <Character
        animal={fam.animal}
        variant={persona.variant}
        color={fam.color}
        soft={fam.soft}
        size={size * 0.9}
        title={t(persona.th, persona.en)}
        className={cn('absolute left-[5%] top-[5%]', float && 'animate-float')}
      />
      {showBadges &&
        result.modifiers.map((id, i) => {
          const m = modifierById(id)
          const Icon = MODIFIER_ICONS[m.icon]
          const angle = (140 - i * 42) * (Math.PI / 180)
          const r = size / 2
          const x = r + r * Math.cos(angle) - badge / 2
          const y = r + r * Math.sin(angle) - badge / 2
          return (
            <Tooltip key={id} content={t(m.th, m.en)}>
              <span
                className="absolute flex items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-lg dark:border-slate-900 dark:bg-white dark:text-slate-900"
                style={{ width: badge, height: badge, left: x, top: y }}
                aria-label={t(m.th, m.en)}
              >
                <Icon size={badge * 0.55} strokeWidth={2.2} />
              </span>
            </Tooltip>
          )
        })}
    </div>
  )
}
