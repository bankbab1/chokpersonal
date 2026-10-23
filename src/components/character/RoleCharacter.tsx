import {
  CalendarDays, ClipboardList, Cog, DraftingCompass, FlaskConical, Flag, Hammer, HeartHandshake, Link2, Map, Mic, PencilLine, Search, ShieldCheck, Shuffle, Sprout, Wrench, type LucideIcon,
} from 'lucide-react'
import { characterByKey, groupByKey } from '@/domain/characters'
import { roleTypeById, type Classification, type PropKey, type RoleTypeId } from '@/domain/roles'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { WorkPerson } from './WorkPerson'

export const PROP_ICONS: Record<PropKey, LucideIcon> = {
  map: Map,
  flag: Flag,
  lens: Search,
  blueprint: DraftingCompass,
  pencil: PencilLine,
  flask: FlaskConical,
  links: Link2,
  sprout: Sprout,
  heart: HeartHandshake,
  mic: Mic,
  shield: ShieldCheck,
  calendar: CalendarDays,
  clipboard: ClipboardList,
  wrench: Wrench,
  gear: Cog,
  hammer: Hammer,
}

/** Blend a hex colour toward white (0 = colour, 1 = white). */
export const tint = (hex: string, amount: number) => {
  const n = parseInt(hex.slice(1), 16)
  const mix = (c: number) => Math.round(c + (255 - c) * amount)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(mix)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

/**
 * A role interest (one of the spec's 12 roles) as an activity tile: icon on the role colour. Role
 * interests are "work you want more of", so they are never drawn as people — only the 16 code
 * characters are people.
 */
export function RoleCharacter({ type, size = 120, className }: { type: RoleTypeId; size?: number; className?: string; showProp?: boolean }) {
  const t = useT()
  const rt = roleTypeById(type)
  const Icon = PROP_ICONS[rt.prop]
  return (
    <span
      className={cn('grid shrink-0 place-items-center rounded-xl', className)}
      style={{ width: size, height: size, background: tint(rt.color, 0.82), color: rt.color }}
      role="img"
      aria-label={t(rt.name)}
    >
      <Icon size={Math.round(size * 0.5)} strokeWidth={2} />
    </span>
  )
}

/**
 * One of the 16 Workfit characters (letters 1–4 of the code, e.g. 'INBC'; a full code also works):
 * the same person in the character's group colour, holding the character's prop.
 */
export function CodeCharacter({ code, size = 120, className }: { code: string; size?: number; className?: string }) {
  const t = useT()
  const ch = characterByKey(code)
  if (!ch) return null
  const color = groupByKey(ch.group).color
  return (
    <div className={cn('relative shrink-0', className)} style={{ width: size, height: size }}>
      <WorkPerson color={color} soft={tint(color, 0.82)} prop={ch.prop} look={ch.look} size={size} title={t(ch.name)} />
    </div>
  )
}

/** Hero avatar for a classification: the primary character, or a neutral mark when no role stands out. */
export function ClassificationAvatar({ c, size = 140, className }: { c: Classification; size?: number; className?: string }) {
  const t = useT()
  if (c.primary) return <RoleCharacter type={c.primary} size={size} className={className} />
  return (
    <div
      className={cn('grid shrink-0 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-white/[0.06] dark:text-slate-500', className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={t('ยังไม่มีบทบาทเด่น', 'No standout role yet')}
    >
      <Shuffle size={size * 0.34} strokeWidth={1.6} />
    </div>
  )
}
