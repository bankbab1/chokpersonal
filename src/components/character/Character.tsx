import { useId, type ReactNode } from 'react'
import type { Animal } from '@/domain/personas'
import type { Variant } from '@/domain/types'

/*
 * Placeholder character art drawn in code: one animal per family, and the persona variant shown with
 * accessories — Lead = star badge, Support = clipboard, Fast = motion lines + spark, Careful = glasses.
 * Final art from an illustrator can replace `ANIMALS` without touching callers.
 */

const INK = '#1e1b2e'

const Eye = ({ x, y, r = 6 }: { x: number; y: number; r?: number }) => (
  <g>
    <ellipse cx={x} cy={y} rx={r} ry={r * 1.15} fill={INK} />
    <circle cx={x + r * 0.35} cy={y - r * 0.4} r={r * 0.38} fill="#fff" />
  </g>
)

const Cheeks = ({ y, dx = 28 }: { y: number; dx?: number }) => (
  <g fill="#fb7185" opacity="0.35">
    <ellipse cx={100 - dx} cy={y} rx="8" ry="5" />
    <ellipse cx={100 + dx} cy={y} rx="8" ry="5" />
  </g>
)

interface AnimalArt {
  body: string
  belly: string
  eyes: { y: number; dx: number; r: number }
  draw: () => ReactNode
}

const ANIMALS: Record<Animal, AnimalArt> = {
  tiger: {
    body: '#f59e0b',
    belly: '#fff7ed',
    eyes: { y: 94, dx: 18, r: 6 },
    draw: () => (
      <g>
        <circle cx="58" cy="54" r="18" fill="#f59e0b" />
        <circle cx="142" cy="54" r="18" fill="#f59e0b" />
        <circle cx="58" cy="54" r="9" fill="#fdba74" />
        <circle cx="142" cy="54" r="9" fill="#fdba74" />
        <ellipse cx="100" cy="98" rx="53" ry="47" fill="#f59e0b" />
        <g stroke={INK} strokeWidth="5" strokeLinecap="round">
          <path d="M100 56v13" />
          <path d="M87 59l4 9" />
          <path d="M113 59l-4 9" />
          <path d="M49 92h12" />
          <path d="M51 105h10" />
          <path d="M151 92h-12" />
          <path d="M149 105h-10" />
        </g>
        <ellipse cx="100" cy="117" rx="25" ry="17" fill="#fff7ed" />
        <path d="M93 107q7-5 14 0q-7 9-14 0z" fill="#7c2d12" />
        <path d="M100 112q-5 8-10 3M100 112q5 8 10 3" stroke="#7c2d12" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </g>
    ),
  },
  myna: {
    body: '#27243a',
    belly: '#4b4668',
    eyes: { y: 92, dx: 18, r: 5.5 },
    draw: () => (
      <g>
        <path d="M95 50q-8-14 4-16q-2 9 6 13z" fill="#27243a" />
        <circle cx="100" cy="96" r="51" fill="#27243a" />
        <ellipse cx="62" cy="106" rx="10" ry="15" fill="#facc15" />
        <ellipse cx="138" cy="106" rx="10" ry="15" fill="#facc15" />
        <ellipse cx="70" cy="80" rx="9" ry="5" fill="#facc15" transform="rotate(-20 70 80)" />
        <ellipse cx="130" cy="80" rx="9" ry="5" fill="#facc15" transform="rotate(20 130 80)" />
        <circle cx="82" cy="92" r="10" fill="#fff" />
        <circle cx="118" cy="92" r="10" fill="#fff" />
        <path d="M85 107q15-11 30 0l-15 18z" fill="#f97316" />
        <path d="M88 109h24" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" />
      </g>
    ),
  },
  peacock: {
    body: '#2563eb',
    belly: '#93c5fd',
    eyes: { y: 101, dx: 14, r: 5 },
    draw: () => {
      const feathers = [-72, -48, -24, 0, 24, 48, 72].map((a) => {
        const rad = (a * Math.PI) / 180
        return { a, x: 100 + 66 * Math.sin(rad), y: 114 - 66 * Math.cos(rad) }
      })
      return (
        <g>
          {feathers.map((f) => (
            <g key={f.a} transform={`rotate(${f.a} ${f.x} ${f.y})`}>
              <ellipse cx={f.x} cy={f.y} rx="15" ry="25" fill="#14b8a6" />
              <circle cx={f.x} cy={f.y - 4} r="9" fill="#fbbf24" />
              <circle cx={f.x} cy={f.y - 4} r="5" fill="#1d4ed8" />
            </g>
          ))}
          <g stroke="#2563eb" strokeWidth="3" strokeLinecap="round">
            <path d="M100 68L90 48M100 68V44M100 68l10-20" />
          </g>
          <g fill="#2563eb">
            <circle cx="90" cy="47" r="4.5" />
            <circle cx="100" cy="43" r="4.5" />
            <circle cx="110" cy="47" r="4.5" />
          </g>
          <circle cx="100" cy="106" r="40" fill="#2563eb" />
          <ellipse cx="86" cy="100" rx="10" ry="8" fill="#fff" />
          <ellipse cx="114" cy="100" rx="10" ry="8" fill="#fff" />
          <path d="M94 113h12l-6 9z" fill="#f59e0b" />
        </g>
      )
    },
  },
  owl: {
    body: '#b45309',
    belly: '#fde68a',
    eyes: { y: 94, dx: 20, r: 7 },
    draw: () => (
      <g>
        <path d="M56 64l6-34 20 24z" fill="#b45309" />
        <path d="M144 64l-6-34-20 24z" fill="#b45309" />
        <ellipse cx="100" cy="98" rx="55" ry="50" fill="#b45309" />
        <circle cx="80" cy="94" r="22" fill="#fef3c7" />
        <circle cx="120" cy="94" r="22" fill="#fef3c7" />
        <circle cx="80" cy="94" r="13" fill="#fbbf24" />
        <circle cx="120" cy="94" r="13" fill="#fbbf24" />
        <path d="M93 110h14l-7 12z" fill="#78350f" />
      </g>
    ),
  },
  horse: {
    body: '#c2410c',
    belly: '#fed7aa',
    eyes: { y: 96, dx: 19, r: 6 },
    draw: () => (
      <g>
        <path d="M64 60l6-34 18 22z" fill="#c2410c" />
        <path d="M136 60l-6-34-18 22z" fill="#c2410c" />
        <path d="M69 52l3-16 9 11z" fill="#fdba74" />
        <path d="M131 52l-3-16-9 11z" fill="#fdba74" />
        <ellipse cx="100" cy="98" rx="47" ry="51" fill="#c2410c" />
        <path d="M76 56q24-28 48 0q-9-3-14 9q-5-13-10-1q-5-12-10 1q-5-12-14-9z" fill="#431407" />
        <ellipse cx="100" cy="128" rx="33" ry="21" fill="#fed7aa" />
        <ellipse cx="90" cy="126" rx="3.5" ry="4.5" fill="#7c2d12" />
        <ellipse cx="110" cy="126" rx="3.5" ry="4.5" fill="#7c2d12" />
        <path d="M92 137q8 6 16 0" stroke="#7c2d12" strokeWidth="2.2" fill="none" strokeLinecap="round" />
      </g>
    ),
  },
  elephant: {
    body: '#94a3b8',
    belly: '#e2e8f0',
    eyes: { y: 88, dx: 20, r: 6 },
    draw: () => (
      <g>
        <ellipse cx="48" cy="96" rx="32" ry="38" fill="#94a3b8" />
        <ellipse cx="152" cy="96" rx="32" ry="38" fill="#94a3b8" />
        <ellipse cx="50" cy="98" rx="20" ry="26" fill="#f5d0fe" opacity="0.7" />
        <ellipse cx="150" cy="98" rx="20" ry="26" fill="#f5d0fe" opacity="0.7" />
        <circle cx="100" cy="92" r="46" fill="#94a3b8" />
        <path d="M88 104c0 26 8 44 24 44c6 0 8-6 2-8c-10-2-4-16-2-36z" fill="#94a3b8" />
        <path d="M86 120q-6 8 2 13" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M116 120q6 8-2 13" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
      </g>
    ),
  },
}

const Star = ({ cx, cy, r }: { cx: number; cy: number; r: number }) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 === 0 ? r : r * 0.45
    return `${cx + rr * Math.cos(a)},${cy + rr * Math.sin(a)}`
  }).join(' ')
  return <polygon points={pts} fill="#fff" />
}

export interface CharacterProps {
  animal: Animal
  variant: Variant
  color: string
  soft: string
  size?: number
  className?: string
  title?: string
}

export function Character({ animal, variant, color, soft, size = 160, className, title }: CharacterProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '')
  const art = ANIMALS[animal]
  const lead = variant[0] === 'L'
  const fast = variant[1] === 'F'
  const eyes = art.eyes
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} role="img" aria-label={title ?? animal}>
      <defs>
        <radialGradient id={`bg-${uid}`} cx="35%" cy="25%" r="85%">
          <stop offset="0" stopColor={soft} />
          <stop offset="1" stopColor={color} stopOpacity={fast ? 0.95 : 0.6} />
        </radialGradient>
        <clipPath id={`clip-${uid}`}>
          <circle cx="100" cy="100" r="96" />
        </clipPath>
      </defs>
      <circle cx="100" cy="100" r="96" fill={`url(#bg-${uid})`} />
      <g clipPath={`url(#clip-${uid})`}>
        {fast && (
          <g stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.7">
            <path d="M14 120h26" />
            <path d="M8 138h30" />
            <path d="M16 156h22" />
          </g>
        )}
        <ellipse cx="100" cy="186" rx="50" ry="40" fill={art.body} />
        <ellipse cx="100" cy="194" rx="30" ry="28" fill={art.belly} />
        {art.draw()}
        <Eye x={100 - eyes.dx} y={eyes.y} r={eyes.r} />
        <Eye x={100 + eyes.dx} y={eyes.y} r={eyes.r} />
        <Cheeks y={eyes.y + 16} dx={eyes.dx + 10} />
        {!fast && (
          <g fill="none" stroke={INK} strokeWidth="3">
            <circle cx={100 - eyes.dx} cy={eyes.y} r={eyes.r + 8} />
            <circle cx={100 + eyes.dx} cy={eyes.y} r={eyes.r + 8} />
            <path d={`M${100 - eyes.dx + eyes.r + 8} ${eyes.y}h${2 * (eyes.dx - eyes.r - 8)}`} />
          </g>
        )}
        {lead ? (
          <g>
            <circle cx="100" cy="174" r="14" fill="#facc15" stroke="#fff" strokeWidth="3" />
            <Star cx={100} cy={174.5} r={8} />
          </g>
        ) : (
          <g transform="rotate(-10 146 168)">
            <rect x="132" y="150" width="28" height="36" rx="4" fill="#fff" stroke={INK} strokeWidth="2.5" />
            <rect x="140" y="146" width="12" height="8" rx="2" fill={color} />
            <path d="M138 164h16M138 172h16M138 180h10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
          </g>
        )}
      </g>
      {fast && (
        <path d="M168 28l-10 18h9l-6 16 16-22h-9l6-12z" fill="#fde047" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
      )}
    </svg>
  )
}
