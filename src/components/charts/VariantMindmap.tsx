import { Link } from 'react-router'
import { characterByKey, groupByKey } from '@/domain/characters'
import { CODE_AXES, codeBookEntry, type CodePole } from '@/domain/code'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { CodeCharacter, tint } from '../character/RoleCharacter'

const VOICE = CODE_AXES[4]
const FRAME = CODE_AXES[5]
const BOND = CODE_AXES[6]

interface Leaf {
  code: string
  poles: [CodePole, CodePole, CodePole]
}

/** The 8 variants of a character as a tree: letter 5 → letter 6 → letter 7. */
const treeFor = (key: string) =>
  [VOICE.left, VOICE.right].map((v) => ({
    pole: v,
    children: [FRAME.right, FRAME.left].map((f) => ({
      pole: f,
      leaves: [BOND.right, BOND.left].map<Leaf>((b) => ({ code: `${key}-${v.letter}${f.letter}${b.letter}`, poles: [v, f, b] })),
    })),
  }))

function LeafCard({ leaf, color, mine }: { leaf: Leaf; color: string; mine: boolean }) {
  const t = useT()
  const e = codeBookEntry(leaf.code)
  return (
    <Link
      to={`/codes/${leaf.code}`}
      className={cn(
        'block rounded-xl border bg-white px-3 py-2 text-left transition hover:-translate-y-0.5 active:scale-[0.98] dark:bg-[#131318]',
        mine ? 'border-transparent ring-2' : 'border-slate-200/80 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/25',
      )}
      style={mine ? { ['--tw-ring-color' as string]: color } : undefined}
    >
      <span className="block text-sm font-bold tracking-wide" style={{ color }}>
        {leaf.code}
        {mine && <span className="ml-1 text-xs font-medium">· {t('คุณ', 'you')}</span>}
      </span>
      {e && (
        <span className="block text-xs leading-tight text-slate-500 dark:text-slate-400">
          {e.wc.crew.emoji} {t(e.wc.crew.name)}
        </span>
      )}
    </Link>
  )
}

function Pill({ pole, color, size = 'md' }: { pole: CodePole; color: string; size?: 'md' | 'sm' }) {
  const t = useT()
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium', size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs')}
      style={{ background: tint(color, size === 'md' ? 0.82 : 0.9), color: '#1e293b' }}
    >
      <b style={{ color }}>{pole.letter}</b> {t(pole.name)}
    </span>
  )
}

/**
 * Mindmap of a character's 8 variants. Desktop: the character in the centre, letter 5 splitting left
 * and right, then letter 6, then the 8 full codes. Phones: the same tree top-down.
 */
export function VariantMindmap({ characterKey, mine }: { characterKey: string; mine?: string | null }) {
  const t = useT()
  const ch = characterByKey(characterKey)!
  const g = groupByKey(ch.group)
  const tree = treeFor(ch.key)

  // Desktop coordinates on a 1000 × 480 canvas (lines in SVG, nodes positioned in %).
  const W = 1000
  const H = 480
  const C = { x: 500, y: 240 }
  const L1 = [{ x: 330, y: 240 }, { x: 670, y: 240 }]
  const L2 = [
    [{ x: 205, y: 130 }, { x: 205, y: 350 }],
    [{ x: 795, y: 130 }, { x: 795, y: 350 }],
  ]
  const LEAF_X = [78, 922]
  const LEAF_Y = [[70, 190], [290, 410]]
  const curve = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const mx = (a.x + b.x) / 2
    return `M${a.x} ${a.y} C${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`
  }
  const pct = (p: { x: number; y: number }) => ({ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` })

  return (
    <div>
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {t(
          `${ch.name.th} (${ch.key}) แตกเป็น 8 แบบตามตัวอักษร 3 ตัวหลัง: ตัวที่ 5 การสื่อสาร → ตัวที่ 6 กรอบการทำงาน → ตัวที่ 7 ความผูกพัน แตะรหัสเพื่ออ่านความหมาย`,
          `${ch.name.en.replace(/^The /, '')} (${ch.key}) branches into 8 variants by the last 3 letters: letter 5 voice → letter 6 frame → letter 7 bond. Tap a code to read it.`,
        )}
      </p>

      {/* Desktop / tablet: radial-style mindmap */}
      <div className="relative mt-5 hidden md:block" style={{ aspectRatio: `${W} / ${H}` }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" aria-hidden>
          <g fill="none" stroke={g.color} strokeLinecap="round">
            {tree.map((b1, i) => (
              <g key={b1.pole.letter}>
                <path d={curve(C, L1[i])} strokeWidth="4" opacity="0.55" />
                {b1.children.map((b2, j) => (
                  <g key={b2.pole.letter}>
                    <path d={curve(L1[i], L2[i][j])} strokeWidth="3" opacity="0.4" />
                    {b2.leaves.map((_, k) => (
                      <path key={k} d={curve(L2[i][j], { x: LEAF_X[i], y: LEAF_Y[j][k] })} strokeWidth="2" opacity="0.3" />
                    ))}
                  </g>
                ))}
              </g>
            ))}
          </g>
        </svg>

        {/* centre */}
        <div className="absolute -translate-x-1/2 -translate-y-1/2" style={pct(C)}>
          <div className="flex flex-col items-center rounded-3xl bg-white px-4 pb-3 pt-2 text-center shadow-sm ring-1 ring-slate-200/80 dark:bg-[#131318] dark:ring-white/10">
            <CodeCharacter code={ch.key} size={84} />
            <span className="text-sm font-semibold">{t(ch.name)}</span>
            <span className="text-xs font-bold tracking-wide" style={{ color: g.color }}>
              {ch.key}
            </span>
          </div>
        </div>
        {tree.map((b1, i) => (
          <div key={b1.pole.letter}>
            <div className="absolute -translate-x-1/2 -translate-y-1/2" style={pct(L1[i])}>
              <Pill pole={b1.pole} color={g.color} />
            </div>
            {b1.children.map((b2, j) => (
              <div key={b2.pole.letter}>
                <div className="absolute -translate-x-1/2 -translate-y-1/2" style={pct(L2[i][j])}>
                  <Pill pole={b2.pole} color={g.color} size="sm" />
                </div>
                {b2.leaves.map((leaf, k) => (
                  <div key={leaf.code} className="absolute w-[15.5%] -translate-x-1/2 -translate-y-1/2" style={pct({ x: LEAF_X[i], y: LEAF_Y[j][k] })}>
                    <LeafCard leaf={leaf} color={g.color} mine={mine === leaf.code} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Phones: the same tree, top-down */}
      <div className="mt-5 md:hidden">
        <div className="flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-slate-200/80 dark:bg-[#131318] dark:ring-white/10">
          <CodeCharacter code={ch.key} size={56} />
          <span>
            <span className="block font-semibold">{t(ch.name)}</span>
            <span className="text-xs font-bold tracking-wide" style={{ color: g.color }}>
              {ch.key}
            </span>
          </span>
        </div>
        <ul className="ml-6 border-l-2 pl-4" style={{ borderColor: tint(g.color, 0.6) }}>
          {tree.map((b1) => (
            <li key={b1.pole.letter} className="pt-4">
              <Pill pole={b1.pole} color={g.color} />
              <ul className="ml-4 mt-1 border-l-2 pl-4" style={{ borderColor: tint(g.color, 0.75) }}>
                {b1.children.map((b2) => (
                  <li key={b2.pole.letter} className="pt-3">
                    <Pill pole={b2.pole} color={g.color} size="sm" />
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {b2.leaves.map((leaf) => (
                        <LeafCard key={leaf.code} leaf={leaf} color={g.color} mine={mine === leaf.code} />
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
