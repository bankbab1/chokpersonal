import { ROLE_TYPE_IDS, type Classification, type ClassificationState, type RoleScores, type RoleTypeId } from './roles'

/* ------------------------------------------------------------------------------------------------
 * Persona Lab maths: check the 12 starter role types against the groups real answers actually form.
 * k-means++ on the 12 role-interest scores, k chosen by mean silhouette (how much closer people are
 * to their own group than to the next one), with a minimum group size so tiny groups don't win.
 * Each found group is compared with the 12 types' "pure" profiles (100 on the type, 50 elsewhere).
 * This is validation support, not proof (spec §21): a pilot still needs proper psychometric checks.
 * ---------------------------------------------------------------------------------------------- */

export type Vec = number[]

const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

/** Root-mean-square distance, in score points. */
export const rms = (a: Vec, b: Vec) => Math.sqrt(a.reduce((s, x, i) => s + (x - b[i]) ** 2, 0) / a.length)

const meanVec = (rows: Vec[]): Vec => rows[0].map((_, i) => rows.reduce((s, r) => s + r[i], 0) / rows.length)

export interface KMeansResult {
  k: number
  labels: number[]
  centroids: Vec[]
  silhouette: number
  minShare: number
}

export const kmeans = (rows: Vec[], k: number, seed = 1, iterations = 60): KMeansResult => {
  const rand = rng(seed)
  // k-means++ seeding: spread the starting centres out.
  const centroids: Vec[] = [rows[Math.floor(rand() * rows.length)]]
  while (centroids.length < k) {
    const weights = rows.map((r) => Math.min(...centroids.map((c) => rms(r, c))) ** 2)
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
      for (let j = 1; j < k; j++) if (rms(r, centroids[j]) < rms(r, centroids[best])) best = j
      return best
    })
    const changed = next.some((l, i) => l !== labels[i])
    labels = next
    for (let j = 0; j < k; j++) {
      const members = rows.filter((_, i) => labels[i] === j)
      if (members.length) centroids[j] = meanVec(members)
    }
    if (!changed && it > 0) break
  }
  const sizes = Array.from({ length: k }, (_, j) => labels.filter((l) => l === j).length)
  return { k, labels, centroids, silhouette: silhouette(rows, labels, k), minShare: Math.min(...sizes) / rows.length }
}

export const silhouette = (rows: Vec[], labels: number[], k: number) => {
  if (k < 2) return 0
  const scores = rows.map((r, i) => {
    const own = labels[i]
    const avg = (j: number) => {
      const others = rows.filter((_, x) => x !== i && labels[x] === j)
      return others.length ? others.reduce((s, o) => s + rms(r, o), 0) / others.length : Infinity
    }
    const a = avg(own)
    if (!Number.isFinite(a)) return 0
    const b = Math.min(...Array.from({ length: k }, (_, j) => (j === own ? Infinity : avg(j))))
    return (b - a) / Math.max(a, b)
  })
  return scores.reduce((s, x) => s + x, 0) / scores.length
}

/* ------------------------------------- 12-type validation ------------------------------------- */

export const toVec = (s: RoleScores): Vec => ROLE_TYPE_IDS.map((id) => s[id])

/** The hypothesis profile for a type: 100 on that type, 50 on every other. */
export const pureProfile = (id: RoleTypeId): Vec => ROLE_TYPE_IDS.map((x) => (x === id ? 100 : 50))

export interface LabPerson {
  roleScores: RoleScores | null
  roleClass: Classification | null
}

export interface LabGroup {
  index: number
  size: number
  share: number
  centroid: Record<RoleTypeId, number>
  /** The two highest-scoring types in the group's average profile. */
  top: { id: RoleTypeId; score: number }[]
  /** Nearest pure type profile and its RMS distance in points. */
  nearest: RoleTypeId
  nearestDistance: number
  /** Share of the group's people (with a primary) whose own primary equals the group's top type. */
  agreement: number | null
}

export interface LabRun {
  /** People with complete role scores who were clustered. */
  n: number
  /** People left out because they have no role-interest result yet (unknown, not zero). */
  excluded: number
  candidates: { k: number; silhouette: number; minShare: number; eligible: boolean }[]
  best: KMeansResult
  groups: LabGroup[]
  /** Share of people with a primary type whose group's top type equals their primary. */
  agreement: number
  /** What `agreement` would be if people were dropped into groups at random (same group sizes). */
  baseline: number
  /** Types that are the top type of at least one found group. */
  typesFound: RoleTypeId[]
  /** People per classification state, to show how many have no standout role. */
  states: Record<ClassificationState, number>
  /** Primary-type counts across the clustered people. */
  primaryCounts: Record<RoleTypeId, number>
}

const emptyTypeRecord = (): Record<RoleTypeId, number> => Object.fromEntries(ROLE_TYPE_IDS.map((id) => [id, 0])) as Record<RoleTypeId, number>

/** Try k = kMin…kMax (several seeds each), keep groups ≥ minShare of people, pick the best-separated solution. */
export const runLab = (people: LabPerson[], kMin = 3, kMax = 12, minShare = 0.05): LabRun | null => {
  const included = people.filter((p): p is { roleScores: RoleScores; roleClass: Classification | null } => p.roleScores !== null)
  const excluded = people.length - included.length
  const rows = included.map((p) => toVec(p.roleScores))
  const maxK = Math.min(kMax, Math.floor(rows.length / 2))
  if (rows.length < 10 || maxK < kMin) return null

  const tries = Array.from({ length: maxK - kMin + 1 }, (_, i) => kMin + i).map((k) => {
    const runs = [1, 2, 3, 4].map((seed) => kmeans(rows, k, seed * 97 + k))
    return runs.sort((a, b) => b.silhouette - a.silhouette)[0]
  })
  const eligible = tries.filter((t) => t.minShare >= minShare)
  const best = (eligible.length ? eligible : tries).slice().sort((a, b) => b.silhouette - a.silhouette)[0]

  const primaries = included.map((p) => p.roleClass?.primary ?? null)
  const groups: LabGroup[] = best.centroids
    .map((c, index) => {
      const idx = best.labels.flatMap((l, i) => (l === index ? [i] : []))
      const ranked = ROLE_TYPE_IDS.map((id, i) => ({ id, score: Math.round(c[i]) })).sort((a, b) => b.score - a.score)
      const near = ROLE_TYPE_IDS.map((id) => ({ id, dist: rms(c, pureProfile(id)) })).sort((a, b) => a.dist - b.dist)[0]
      const withPrimary = idx.filter((i) => primaries[i] !== null)
      const hits = withPrimary.filter((i) => primaries[i] === ranked[0].id).length
      return {
        index,
        size: idx.length,
        share: idx.length / rows.length,
        centroid: Object.fromEntries(ROLE_TYPE_IDS.map((id, i) => [id, c[i]])) as Record<RoleTypeId, number>,
        top: ranked.slice(0, 2),
        nearest: near.id,
        nearestDistance: near.dist,
        agreement: withPrimary.length ? hits / withPrimary.length : null,
      }
    })
    .sort((a, b) => b.size - a.size)

  const topOf = new Map(groups.map((g) => [g.index, g.top[0].id]))
  const states: Record<ClassificationState, number> = { dominant: 0, mixed: 0, no_dominant: 0 }
  const primaryCounts = emptyTypeRecord()
  let withPrimary = 0
  let hits = 0
  let chance = 0
  included.forEach((p, i) => {
    if (p.roleClass) states[p.roleClass.state]++
    const prim = primaries[i]
    if (!prim) return
    primaryCounts[prim]++
    withPrimary++
    if (topOf.get(best.labels[i]) === prim) hits++
    chance += groups.filter((g) => g.top[0].id === prim).reduce((s, g) => s + g.share, 0)
  })

  return {
    n: rows.length,
    excluded,
    candidates: tries.map((t) => ({ k: t.k, silhouette: t.silhouette, minShare: t.minShare, eligible: t.minShare >= minShare })),
    best,
    groups,
    agreement: withPrimary ? hits / withPrimary : 0,
    baseline: withPrimary ? chance / withPrimary : 0,
    typesFound: ROLE_TYPE_IDS.filter((id) => groups.some((g) => g.top[0].id === id)),
    states,
    primaryCounts,
  }
}
