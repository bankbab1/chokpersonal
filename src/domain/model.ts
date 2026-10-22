import { DIM_CODES } from './dimensions'
import { FAMILIES } from './personas'
import type { DimCode, FamilyId, Scores } from './types'

/* ------------------------------------------------------------------------------------------------
 * Persona model as data, not code. Each family is a centroid: its typical score on all 18
 * dimensions. A person belongs to the nearest centroid. Re-fitting the model from real pilot data
 * (see cluster.ts and the Persona Lab) replaces this object without touching the scoring code.
 * ---------------------------------------------------------------------------------------------- */

export interface PersonaModel {
  version: string
  source: 'starter-hypothesis' | 'fitted'
  fittedOn?: { n: number; date: string }
  centroids: { family: FamilyId; scores: Scores }[]
}

/** Starter centroids: 50 everywhere, pushed 22 points toward each family's signature poles. */
export const STARTER_MODEL: PersonaModel = {
  version: 'starter-1',
  source: 'starter-hypothesis',
  centroids: FAMILIES.map((f) => ({
    family: f.id,
    scores: Object.fromEntries(DIM_CODES.map((c) => [c, 50 + (f.signature[c] ?? 0) * 22])) as Scores,
  })),
}

/** The variant split (lead/support × fast/careful) is shown separately, so leave its axes out of the distance. */
const FAMILY_DIMS: DimCode[] = DIM_CODES.filter((c) => c !== 'LD' && c !== 'PC')

export const distanceTo = (a: Scores, b: Scores, dims: DimCode[] = FAMILY_DIMS) =>
  Math.sqrt(dims.reduce((sum, c) => sum + (a[c] - b[c]) ** 2, 0) / dims.length)

export const rankFamilies = (s: Scores, model: PersonaModel = STARTER_MODEL) =>
  model.centroids
    .map((c) => ({ id: c.family, distance: distanceTo(s, c.scores) }))
    .sort((a, b) => a.distance - b.distance)
