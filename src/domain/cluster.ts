import type { T } from '@/lib/i18n'
import { DIM_CODES, dimMeta, dimName } from './dimensions'
import { distanceTo, STARTER_MODEL } from './model'
import type { DimCode, FamilyId, Scores } from './types'

/* ------------------------------------------------------------------------------------------------
 * Persona Lab maths: find the groups that real profiles actually form, instead of assuming them.
 * k-means++ on the 16 family dimensions, k chosen by mean silhouette (how much closer people are to
 * their own group than to the next one), with a minimum group size so tiny groups don't win.
 * A pilot should confirm the result with a proper latent profile analysis before adopting it.
 * ---------------------------------------------------------------------------------------------- */

const DIMS: DimCode[] = DIM_CODES.filter((c) => c !== 'LD' && c !== 'PC')

const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const mean = (rows: Scores[]): Scores => {
  const out = {} as Scores
  for (const c of DIM_CODES) out[c] = rows.reduce((s, r) => s + r[c], 0) / rows.length
  return out
}

const d = (a: Scores, b: Scores) => distanceTo(a, b, DIMS)

export interface KMeansResult {
  k: number
  labels: number[]
  centroids: Scores[]
  silhouette: number
  minShare: number
}

export const kmeans = (rows: Scores[], k: number, seed = 1, iterations = 60): KMeansResult => {
  const rand = rng(seed)
  // k-means++ seeding: spread the starting centres out.
  const centroids: Scores[] = [rows[Math.floor(rand() * rows.length)]]
  while (centroids.length < k) {
    const weights = rows.map((r) => Math.min(...centroids.map((c) => d(r, c))) ** 2)
    const total = weights.reduce((a, b) => a + b, 0)
    let pick = rand() * total
    let idx = 0
    for (; idx < rows.length - 1; idx++) {
      pick -= weights[idx]
      if (pick <= 0) break
    }
    centroids.push(rows[idx])
  }
  let labels = rows.map(() => 0)
  for (let it = 0; it < iterations; it++) {
    const next = rows.map((r) => {
      let best = 0
      for (let j = 1; j < k; j++) if (d(r, centroids[j]) < d(r, centroids[best])) best = j
      return best
    })
    const changed = next.some((l, i) => l !== labels[i])
    labels = next
    for (let j = 0; j < k; j++) {
      const members = rows.filter((_, i) => labels[i] === j)
      if (members.length) centroids[j] = mean(members)
    }
    if (!changed && it > 0) break
  }
  const sizes = Array.from({ length: k }, (_, j) => labels.filter((l) => l === j).length)
  return { k, labels, centroids, silhouette: silhouette(rows, labels, k), minShare: Math.min(...sizes) / rows.length }
}

export const silhouette = (rows: Scores[], labels: number[], k: number) => {
  if (k < 2) return 0
  const scores = rows.map((r, i) => {
    const own = labels[i]
    const avg = (j: number) => {
      const others = rows.filter((_, x) => x !== i && labels[x] === j)
      return others.length ? others.reduce((s, o) => s + d(r, o), 0) / others.length : Infinity
    }
    const a = avg(own)
    if (!Number.isFinite(a)) return 0
    const b = Math.min(...Array.from({ length: k }, (_, j) => (j === own ? Infinity : avg(j))))
    return (b - a) / Math.max(a, b)
  })
  return scores.reduce((s, x) => s + x, 0) / scores.length
}

export interface LabRun {
  candidates: { k: number; silhouette: number; minShare: number; eligible: boolean }[]
  best: KMeansResult
  groups: LabGroup[]
}

export interface LabGroup {
  index: number
  size: number
  share: number
  centroid: Scores
  traits: { dim: DimCode; name: T; delta: number; pole: T }[]
  nearestFamily: FamilyId
  matchDistance: number
}

/** Try k = 3…9 (several seeds each), keep groups ≥ 5% of people, pick the best-separated solution. */
export const runLab = (rows: Scores[], kMin = 3, kMax = 9, minShare = 0.05): LabRun => {
  const tries = Array.from({ length: kMax - kMin + 1 }, (_, i) => kMin + i).map((k) => {
    const runs = [1, 2, 3, 4].map((seed) => kmeans(rows, k, seed * 97 + k))
    return runs.sort((a, b) => b.silhouette - a.silhouette)[0]
  })
  const eligible = tries.filter((t) => t.minShare >= minShare)
  const best = (eligible.length ? eligible : tries).slice().sort((a, b) => b.silhouette - a.silhouette)[0]
  const overall = mean(rows)
  const groups: LabGroup[] = best.centroids
    .map((c, index) => {
      const size = best.labels.filter((l) => l === index).length
      const traits = DIM_CODES.map((dim) => ({ dim, delta: c[dim] - overall[dim] }))
        .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
        .slice(0, 4)
        .map((t) => {
          const m = dimMeta(t.dim)
          return { dim: t.dim, name: dimName(m), delta: Math.round(t.delta), pole: t.delta >= 0 ? m.high : m.low }
        })
      const near = STARTER_MODEL.centroids
        .map((s) => ({ id: s.family, dist: distanceTo(c, s.scores) }))
        .sort((a, b) => a.dist - b.dist)[0]
      return { index, size, share: size / rows.length, centroid: c, traits, nearestFamily: near.id, matchDistance: near.dist }
    })
    .sort((a, b) => b.size - a.size)
  return {
    candidates: tries.map((t) => ({ k: t.k, silhouette: t.silhouette, minShare: t.minShare, eligible: t.minShare >= minShare })),
    best,
    groups,
  }
}
