import { tt, type T } from '@/lib/i18n'
import { workfitCode } from './code'
import { DIM_CODES, dimMeta, dimName } from './dimensions'
import { fourLetter, identity } from './styles'
import type { DimCode, Scores } from './types'

/* ------------------------------------------------------------------------------------------------
 * "Same code, different people". A 4-letter type is 4–5 cut-offs; two people with the same type can
 * still differ on almost everything else. This finds everyone in a comparison group with the same
 * familiar code and shows where a person stands out *within* that group.
 * ---------------------------------------------------------------------------------------------- */

export const typeCode = (s: Scores) => `${fourLetter(s).code}-${identity(s).letter}`

export interface Distinctive {
  dim: DimCode
  name: T
  you: number
  groupMean: number
  /** Standard deviations from the group mean. */
  z: number
  text: T
}

export interface SameTypeResult {
  code: string
  group: Scores[]
  /** How many different Workfit Codes this one familiar type splits into. */
  workfitCodes: number
  /** Dimensions on which people with this type differ most from each other. */
  widest: { dim: DimCode; name: T; min: number; max: number }[]
  distinctive: Distinctive[]
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
const sd = (xs: number[]) => {
  const m = mean(xs)
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2))) || 1
}

export const sameType = (s: Scores, population: Scores[]): SameTypeResult => {
  const code = typeCode(s)
  const group = population.filter((p) => typeCode(p) === code)
  const widest = DIM_CODES.map((dim) => {
    const xs = group.map((p) => p[dim])
    return { dim, name: dimName(dimMeta(dim)), min: Math.min(...xs), max: Math.max(...xs) }
  })
    .filter((w) => Number.isFinite(w.min))
    .sort((a, b) => b.max - b.min - (a.max - a.min))
    .slice(0, 6)
  const distinctive: Distinctive[] =
    group.length < 3
      ? []
      : DIM_CODES.map((dim) => {
          const xs = group.map((p) => p[dim])
          const m = mean(xs)
          const z = (s[dim] - m) / sd(xs)
          const meta = dimMeta(dim)
          const pole = z >= 0 ? meta.high : meta.low
          return {
            dim,
            name: dimName(meta),
            you: s[dim],
            groupMean: Math.round(m),
            z,
            text: tt(`${z >= 0 ? 'มากกว่า' : 'น้อยกว่า'}คนอื่นในกลุ่ม: ${pole.th}`, `${z >= 0 ? 'More' : 'Less'} than others with this type: ${pole.en.toLowerCase()}`),
          }
        })
          .filter((d) => Math.abs(d.z) >= 0.8)
          .sort((a, b) => Math.abs(b.z) - Math.abs(a.z))
          .slice(0, 5)
  const workfitCodes = new Set(group.map((p) => workfitCode(p).code.toUpperCase())).size
  return { code, group, workfitCodes, widest, distinctive }
}

/** The most common familiar type in a population, and up to `n` people who share it. */
export const mostCommonType = (population: Scores[], n = 10) => {
  const counts = new Map<string, Scores[]>()
  for (const p of population) counts.set(typeCode(p), [...(counts.get(typeCode(p)) ?? []), p])
  const [code, people] = [...counts.entries()].sort((a, b) => b[1].length - a[1].length)[0]
  return { code, people: people.slice(0, n), total: people.length }
}
