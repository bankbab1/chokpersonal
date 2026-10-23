import { tt, type T } from '@/lib/i18n'
import { workfitCode } from './code'
import { DIM_CODES, dimMeta, dimName } from './dimensions'
import type { DimCode, Scores } from './types'

/* ------------------------------------------------------------------------------------------------
 * "Same character, different people". Ten people can share the same character (Workfit Code letters
 * 1–4, e.g. INBC) and still differ in their Thai-context suffix and on many of the 18 dimensions. This
 * groups a comparison population by character and shows where a person stands out *within* it.
 * ---------------------------------------------------------------------------------------------- */

/** Character key (Workfit Code letters 1–4) for each person in a population, cached per array. */
const keys = new WeakMap<Scores[], string[]>()
export const characterKeysOf = (population: Scores[]) => {
  let k = keys.get(population)
  if (!k) {
    k = population.map((s) => workfitCode(s).code.slice(0, 4))
    keys.set(population, k)
  }
  return k
}

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
  /** The shared character key (code letters 1–4). */
  code: string
  group: Scores[]
  /** How many different Workfit Codes this one character splits into. */
  workfitCodes: number
  /** Dimensions on which people with this character differ most from each other. */
  widest: { dim: DimCode; name: T; min: number; max: number }[]
  distinctive: Distinctive[]
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length
const sd = (xs: number[]) => {
  const m = mean(xs)
  return Math.sqrt(mean(xs.map((x) => (x - m) ** 2))) || 1
}

/** Everyone in `population` with the same character as `s` (code letters 1–4). */
export const sameType = (s: Scores, population: Scores[]): SameTypeResult => {
  const all = characterKeysOf(population)
  const code = workfitCode(s).code.slice(0, 4)
  const group = population.filter((p, i) => all[i] === code && p !== s)
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
            text: tt(`${z >= 0 ? 'มากกว่า' : 'น้อยกว่า'}คนอื่นในกลุ่ม: ${pole.th}`, `${z >= 0 ? 'More' : 'Less'} than others with this character: ${pole.en.toLowerCase()}`),
          }
        })
          .filter((d) => Math.abs(d.z) >= 0.8)
          .sort((a, b) => Math.abs(b.z) - Math.abs(a.z))
          .slice(0, 5)
  const workfitCodes = new Set(group.map((p) => workfitCode(p).code)).size
  return { code, group, workfitCodes, widest, distinctive }
}

/** The most common character in a population, and up to `n` people who share it. */
export const mostCommonType = (population: Scores[], n = 10) => {
  const all = characterKeysOf(population)
  const counts = new Map<string, Scores[]>()
  population.forEach((p, i) => counts.set(all[i], [...(counts.get(all[i]) ?? []), p]))
  const [code, people] = [...counts.entries()].sort((a, b) => b[1].length - a[1].length)[0]
  return { code, people: people.slice(0, n), total: people.length }
}
