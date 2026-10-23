import { useId, type ReactNode } from 'react'
import type { PropKey } from '@/domain/roles'

/*
 * The work characters as one consistent person: same body, face and proportions for every type,
 * so no type looks "better" (spec §16.1). Only the outfit colour and the prop held in both hands change.
 * Drawn in code (no remote assets); an illustrator's art can replace PROPS / the body later.
 */

const INK = '#1f2937'
const SKIN = '#f1c8a3'
const SKIN_SHADE = '#e2b08a'
const HAIR = '#2b2b35'
const PANTS = '#334155'

/** Props are drawn around (0,0), roughly 34×34, then placed between the hands. */
const PROPS: Record<PropKey, (c: string) => ReactNode> = {
  map: () => (
    <g>
      <path d="M-17-12l11-4 12 4 11-4v28l-11 4-12-4-11 4z" fill="#fef3c7" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M-6-16v28M6-12v28" stroke={INK} strokeWidth="1.2" opacity="0.5" />
      <path d="M-13 2q5-8 9-2t8 0q4-5 9-2" fill="none" stroke="#dc2626" strokeWidth="1.6" strokeDasharray="2.5 2" />
      <circle cx="12" cy="-1" r="2.2" fill="#dc2626" />
    </g>
  ),
  flag: (c) => (
    <g>
      <path d="M-4-22v40" stroke={INK} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M-3-21h22l-5 7 5 7h-22z" fill="#fff" stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="6" cy="-14" r="3.6" fill={c} stroke={INK} strokeWidth="1" />
    </g>
  ),
  lens: () => (
    <g>
      <path d="M6 6l11 11" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <circle cx="-3" cy="-3" r="12" fill="#e0f2fe" stroke={INK} strokeWidth="2.4" />
      <path d="M-9-7q3-5 8-4" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" />
    </g>
  ),
  blueprint: () => (
    <g>
      <rect x="-17" y="-13" width="34" height="26" rx="2" fill="#2563eb" stroke={INK} strokeWidth="1.5" />
      <path d="M-17-4h34M-17 5h34M-8-13v26M2-13v26" stroke="#bfdbfe" strokeWidth="0.9" />
      <path d="M-12 8v-12h10v6h9" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
      <ellipse cx="17" cy="0" rx="3" ry="13" fill="#1d4ed8" stroke={INK} strokeWidth="1.3" />
    </g>
  ),
  pencil: (c) => (
    <g>
      <rect x="-15" y="-15" width="22" height="28" rx="2.5" fill="#fff" stroke={INK} strokeWidth="1.5" />
      <path d="M-11-8h14M-11-2h14M-11 4h9" stroke={c} strokeWidth="1.6" strokeLinecap="round" />
      <g transform="rotate(35 10 0)">
        <rect x="6" y="-18" width="7" height="28" rx="1.5" fill="#facc15" stroke={INK} strokeWidth="1.4" />
        <path d="M6 10l3.5 8 3.5-8z" fill="#fde68a" stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
      </g>
    </g>
  ),
  flask: (c) => (
    <g>
      <path d="M-5-17h10M-3.5-17v10l-11 18a3 3 0 0 0 2.6 4.5h23.8a3 3 0 0 0 2.6-4.5l-11-18v-10" fill="#fff" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M-10.5 4h21l4 7a2 2 0 0 1-1.7 3h-25.6a2 2 0 0 1-1.7-3z" fill={c} opacity="0.85" />
      <circle cx="-2" cy="8" r="1.6" fill="#fff" />
      <circle cx="4" cy="10" r="1.1" fill="#fff" />
    </g>
  ),
  links: (c) => (
    <g stroke={INK} strokeWidth="1.6">
      <path d="M-11 8L0-10L11 8z" fill="none" strokeWidth="2" />
      <circle cx="0" cy="-10" r="6" fill={c} />
      <circle cx="-11" cy="8" r="6" fill="#fff" />
      <circle cx="11" cy="8" r="6" fill="#fff" />
    </g>
  ),
  sprout: () => (
    <g>
      <path d="M-11 2h22l-3 15h-16z" fill="#c2410c" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M0 2v-12" stroke="#15803d" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M0-6q-11-2-11-12q10 1 11 12z" fill="#22c55e" stroke={INK} strokeWidth="1.3" />
      <path d="M0-9q10-1 11-10q-10 0-11 10z" fill="#4ade80" stroke={INK} strokeWidth="1.3" />
    </g>
  ),
  heart: (c) => (
    <g>
      <rect x="-15" y="-11" width="30" height="24" rx="3" fill="#fff" stroke={INK} strokeWidth="1.6" />
      <path d="M-15-4h30" stroke={INK} strokeWidth="1.2" opacity="0.4" />
      <path d="M0 9c-8-5-9-9-9-11.5a4.5 4.5 0 0 1 9-1.5a4.5 4.5 0 0 1 9 1.5c0 2.5-1 6.5-9 11.5z" fill={c} stroke={INK} strokeWidth="1.3" />
    </g>
  ),
  mic: (c) => (
    <g>
      <path d="M0 6v12" stroke={INK} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M-10-4a10 10 0 0 0 20 0" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <rect x="-6" y="-20" width="12" height="22" rx="6" fill={c} stroke={INK} strokeWidth="1.8" />
      <path d="M-6-12h12M-6-6h12" stroke={INK} strokeWidth="1" opacity="0.4" />
    </g>
  ),
  shield: (c) => (
    <g>
      <path d="M0-18l15 5v9c0 11-7 18-15 21c-8-3-15-10-15-21v-9z" fill={c} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M-7 0l5 5l9-10" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),
  calendar: (c) => (
    <g>
      <rect x="-15" y="-13" width="30" height="28" rx="3" fill="#fff" stroke={INK} strokeWidth="1.6" />
      <path d="M-15-13h30v8h-30z" fill={c} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M-8-17v7M8-17v7" stroke={INK} strokeWidth="2.2" strokeLinecap="round" />
      {[-8, 0, 8].flatMap((x) => [1, 8].map((y) => <rect key={`${x}${y}`} x={x - 2.5} y={y - 2.5} width="5" height="5" rx="1" fill={x === 0 && y === 8 ? c : '#cbd5e1'} />))}
    </g>
  ),
  clipboard: (c) => (
    <g>
      <rect x="-13" y="-15" width="26" height="32" rx="2.5" fill="#d6a76c" stroke={INK} strokeWidth="1.6" />
      <rect x="-10" y="-11" width="20" height="25" rx="1" fill="#fff" stroke={INK} strokeWidth="1.1" />
      <rect x="-6" y="-18" width="12" height="7" rx="2" fill={c} stroke={INK} strokeWidth="1.4" />
      <path d="M-7-4l2 2 3-4M-7 4l2 2 3-4" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M0-4h7M0 4h7M-7 10h14" stroke={INK} strokeWidth="1.3" strokeLinecap="round" opacity="0.55" />
    </g>
  ),
  wrench: (c) => (
    <g transform="rotate(-45)">
      <path d="M-3.5-6h7v22a3.5 3.5 0 0 1-7 0z" fill={c} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M-3.5-20.3a9 9 0 1 0 7 0v8.3h-7z" fill="#cbd5e1" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="0" cy="13" r="1.4" fill="#fff" />
    </g>
  ),
  gear: (c) => (
    <g>
      <g stroke={INK} strokeWidth="1.6" strokeLinejoin="round">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
          <rect key={a} x="-3.5" y="-17" width="7" height="8" rx="1.2" fill="#cbd5e1" transform={`rotate(${a})`} />
        ))}
        <circle r="11.5" fill="#cbd5e1" />
      </g>
      <circle r="11.5" fill="#cbd5e1" />
      <circle r="5.5" fill={c} stroke={INK} strokeWidth="1.6" />
      <circle r="2" fill="#fff" />
    </g>
  ),
  hammer: (c) => (
    <g transform="rotate(-30)">
      <rect x="-3" y="-6" width="6" height="24" rx="2" fill={c} stroke={INK} strokeWidth="1.6" />
      <path d="M-14-14h22v9h-22z" fill="#cbd5e1" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8-14q8 1 9 9h-9z" fill="#94a3b8" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M-11-11h16" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.8" />
    </g>
  ),
}

/** Darken a hex colour a little for sleeves and shading. */
const shade = (hex: string, k = 0.82) => {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(v * k))
  return `rgb(${r},${g},${b})`
}

/** How a character looks: hair style and colour, skin tone, glasses, beard. Same body for everyone. */
export interface Look {
  hair: 'short' | 'side' | 'spiky' | 'bob' | 'long' | 'bun' | 'curly' | 'cap'
  hairColor: string
  skin: string
  glasses?: boolean
  beard?: boolean
}

export const DEFAULT_LOOK: Look = { hair: 'short', hairColor: HAIR, skin: SKIN }

/** Hair drawn behind the head (after the torso, so long hair falls over the shoulders). */
const hairBack = (look: Look): ReactNode => {
  const c = look.hairColor
  if (look.hair === 'bob') return <path d="M41 40c0-14 8-22 19-22s19 8 19 22v14c-3 2-6 2-8 0h-22c-2 2-5 2-8 0z" fill={c} />
  if (look.hair === 'long') return <path d="M40 40c0-14 9-22 20-22s20 8 20 22v30c-4 2-8 2-12 0h-16c-4 2-8 2-12 0z" fill={c} />
  return null
}

/** Hair drawn over the head circle. */
const hairFront = (look: Look, capColor: string): ReactNode => {
  const c = look.hairColor
  switch (look.hair) {
    case 'short':
      return <path d="M43 39c-1-13 8-20 17-20c11 0 19 7 17 20c-3-6-8-9-14-9c-7 0-13 3-20 9z" fill={c} />
    case 'side':
      return <path d="M42 44c-3-16 7-25 18-25c11 0 19 8 17 21c-1-4-3-7-6-9c-9 3-18 5-27 13z" fill={c} />
    case 'spiky':
      return <path d="M43 39L41 27L47 30L48 20L54 26L58 16L62 25L68 18L69 27L76 24L77 39C74 33 68 30 60 30C52 30 46 33 43 39Z" fill={c} strokeLinejoin="round" />
    case 'bob':
      return <path d="M43 38c0-12 7-19 17-19s17 7 17 19c-1 0-2-4-4-4h-26c-2 0-3 4-4 4z" fill={c} />
    case 'long':
      return <path d="M43 40c-1-13 7-21 17-21c11 0 18 8 17 21c-4-6-9-9-15-10c-2 4-8 8-19 10z" fill={c} />
    case 'bun':
      return (
        <g fill={c}>
          <circle cx="60" cy="17" r="6.5" />
          <path d="M43 38c0-11 7-17 17-17s17 6 17 17c-5-4-10-6-17-6s-12 2-17 6z" />
        </g>
      )
    case 'curly':
      return (
        <g fill={c}>
          {[[44, 36], [45, 28], [51, 22], [60, 20], [69, 22], [75, 28], [76, 36]].map(([x, y]) => <circle key={`${x}${y}`} cx={x} cy={y} r="6" />)}
          <path d="M44 36c0-10 7-14 16-14s16 4 16 14c-4-4-10-5-16-5s-12 1-16 5z" />
        </g>
      )
    case 'cap':
      return (
        <g>
          <path d="M43 41c-1-6 1-10 4-12h26c3 2 5 6 4 12c-2-4-4-6-6-7h-22c-2 1-4 3-6 7z" fill={c} />
          <path d="M42 33c0-10 8-16 18-16s18 6 18 16z" fill={capColor} />
          <path d="M40 32h40c3 0 3 5 0 5h-40c-3 0-3-5 0-5z" fill={capColor} stroke={INK} strokeWidth="0.8" strokeOpacity="0.35" />
          <circle cx="60" cy="17.5" r="1.8" fill={INK} opacity="0.5" />
        </g>
      )
  }
}

export function WorkPerson({ color, soft, prop, size = 120, title, look = DEFAULT_LOOK }: { color: string; soft: string; prop: PropKey; size?: number; title?: string; look?: Look }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const sleeve = shade(color)
  const skin = look.skin
  const skinShade = look.skin === SKIN ? SKIN_SHADE : shade(look.skin, 0.88)
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={title}>
      <defs>
        <clipPath id={`c-${uid}`}>
          <circle cx="60" cy="60" r="58" />
        </clipPath>
      </defs>
      <circle cx="60" cy="60" r="58" fill={soft} />
      <g clipPath={`url(#c-${uid})`}>
        {/* legs */}
        <rect x="45" y="100" width="12" height="24" rx="5" fill={PANTS} />
        <rect x="63" y="100" width="12" height="24" rx="5" fill={PANTS} />
        {/* torso */}
        <path d="M36 108v-24c0-11 8-19 18-19h12c10 0 18 8 18 19v24z" fill={color} />
        <path d="M54 65l6 9 6-9" fill="#fff" opacity="0.9" />
        {hairBack(look)}
        {/* neck + head */}
        <rect x="55" y="54" width="10" height="12" rx="4" fill={skinShade} />
        <circle cx="60" cy="40" r="17" fill={skin} />
        {look.beard && <path d="M44 44c0 9 6 15 16 15s16-6 16-15c-2 4-4 7-7 8c-3-2-6-2-9-2s-6 0-9 2c-3-1-5-4-7-8z" fill={look.hairColor} opacity="0.92" />}
        {hairFront(look, sleeve)}
        <circle cx="53.5" cy="42" r="2" fill={INK} />
        <circle cx="66.5" cy="42" r="2" fill={INK} />
        {look.glasses && (
          <g fill="#fff" fillOpacity="0.25" stroke={INK} strokeWidth="1.4">
            <circle cx="53.5" cy="42" r="4.6" />
            <circle cx="66.5" cy="42" r="4.6" />
            <path d="M58.1 42h3.8M48.9 41l-4-1.5M71.1 41l4-1.5" fill="none" />
          </g>
        )}
        <path d="M55 49q5 4 10 0" fill="none" stroke={INK} strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="49" cy="47" r="2.6" fill="#fb7185" opacity="0.3" />
        <circle cx="71" cy="47" r="2.6" fill="#fb7185" opacity="0.3" />
        {/* arms reaching to the prop */}
        <path d="M40 76q-6 12 6 18" fill="none" stroke={sleeve} strokeWidth="9" strokeLinecap="round" />
        <path d="M80 76q6 12-6 18" fill="none" stroke={sleeve} strokeWidth="9" strokeLinecap="round" />
        {/* prop between the hands */}
        <g transform="translate(60 90) scale(1.05)">{PROPS[prop](color)}</g>
        <circle cx="45" cy="95" r="4.2" fill={skin} stroke={skinShade} strokeWidth="0.8" />
        <circle cx="75" cy="95" r="4.2" fill={skin} stroke={skinShade} strokeWidth="0.8" />
      </g>
    </svg>
  )
}
