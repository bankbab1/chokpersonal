import { describe, expect, it } from 'vitest'
import {
  band, classify, compareContext, contextDistance, emptyContext, interestAlignment, jobFamiliesToExplore, modifiersOf,
  ROLE_ITEMS, ROLE_TYPE_IDS, ROLE_TYPES, roundHalfUp, scoreRoles, syntheticRoleScores, toggleGrowthRole, validWeights,
  type RoleAnswers, type RoleScores, type RoleTypeId,
} from './roles'
import { emptyScores } from './scoring'

/** Golden cases from the WorkFit master spec §24 (T-xx ids kept for traceability). */

const all = (v: number) => Object.fromEntries(ROLE_TYPE_IDS.map((id) => [id, v])) as RoleScores
const withScores = (base: number, over: Partial<RoleScores>) => ({ ...all(base), ...over })

/** Answers that give each item the option nearest this score (preference 0–100 in 20s, scenario 0/50/100, role choice 0/33/67/100). */
const answerAll = (pick: (construct: RoleTypeId) => number): RoleAnswers =>
  Object.fromEntries(
    ROLE_ITEMS.map((q) => [q.id, q.options.reduce((a, b) => (Math.abs(b.score - pick(q.construct)) < Math.abs(a.score - pick(q.construct)) ? b : a)).id]),
  )

describe('question set', () => {
  it('T-01 has 48 unique ids, 4 per construct', () => {
    expect(ROLE_ITEMS).toHaveLength(48)
    expect(new Set(ROLE_ITEMS.map((q) => q.id)).size).toBe(48)
    for (const id of ROLE_TYPE_IDS) expect(ROLE_ITEMS.filter((q) => q.construct === id)).toHaveLength(4)
  })

  it('keeps type_index order 0–11', () => {
    expect(ROLE_TYPES.map((t) => t.index)).toEqual([...Array(12).keys()])
    expect(ROLE_TYPES[3].id).toBe('architect')
  })
})

describe('scoring & classification', () => {
  it('T-02 one type full, the rest zero → that type primary, no secondary', () => {
    const r = scoreRoles(answerAll((c) => (c === 'coach' ? 100 : 0)))
    expect(r.complete).toBe(true)
    const c = classify(r.scores as RoleScores)
    expect(c).toMatchObject({ state: 'dominant', primary: 'coach', secondary: null })
  })

  it('T-03 (v2: no neutral option) the same lean everywhere → equal scores, no_dominant', () => {
    const r = scoreRoles(answerAll(() => 60))
    expect(new Set(Object.values(r.scores)).size).toBe(1)
    expect(classify(r.scores as RoleScores).state).toBe('no_dominant')
  })

  it('v2 scales have no neutral middle', () => {
    for (const q of ROLE_ITEMS.filter((x) => x.kind !== 'scenario')) expect(q.options.some((o) => o.score === 50)).toBe(false)
    expect(ROLE_ITEMS.filter((q) => q.kind === 'preference').every((q) => q.options.length === 6)).toBe(true)
    expect(ROLE_ITEMS.filter((q) => q.kind === 'role_choice').every((q) => q.options.length === 4)).toBe(true)
  })

  it('T-04 all full → 100 everywhere, no_dominant', () => {
    const r = scoreRoles(answerAll(() => 100))
    expect(classify(r.scores as RoleScores).state).toBe('no_dominant')
  })

  it('T-05 gap 6 → mixed, gap 7 → dominant', () => {
    expect(classify(withScores(10, { analyst: 90, architect: 84 })).state).toBe('mixed')
    expect(classify(withScores(10, { analyst: 90, architect: 83 })).state).toBe('dominant')
  })

  it('T-06 spread 12 → no_dominant, spread 13 → not by spread alone', () => {
    expect(classify(withScores(50, { analyst: 62 })).state).toBe('no_dominant')
    expect(classify(withScores(50, { analyst: 63 })).state).not.toBe('no_dominant')
  })

  it('T-07 second 49 → no secondary, 50 → secondary', () => {
    expect(classify(withScores(0, { guardian: 90, organizer: 49 })).secondary).toBeNull()
    expect(classify(withScores(0, { guardian: 90, organizer: 50 })).secondary).toBe('organizer')
  })

  it('T-08 top 49 → no_dominant even when the rest are very low', () => {
    expect(classify(withScores(0, { carer: 49 })).state).toBe('no_dominant')
  })

  it('T-09 rounds 87.5 → 88 and 81.25 → 81 (half-up)', () => {
    expect(roundHalfUp(87.5)).toBe(88)
    expect(roundHalfUp(81.25)).toBe(81)
    // 80 + 100 + 50 + 100 = 82.5 → 83 through the real scorer
    const a = answerAll(() => 0)
    a['navigator-0'] = 'E'
    a['navigator-1'] = 'F'
    a['navigator-2'] = 'B'
    a['navigator-3'] = 'D'
    expect(scoreRoles(a).raw.navigator).toBe(82.5)
    expect(scoreRoles(a).scores.navigator).toBe(83)
  })

  it('T-10 a missing required answer blocks a complete result and is never scored as 0', () => {
    const a = answerAll(() => 100)
    delete a['driver-2']
    const r = scoreRoles(a)
    expect(r.complete).toBe(false)
    expect(r.missing).toEqual(['driver-2'])
    expect(r.scores.driver).toBeUndefined()
  })

  it('T-28 an option id outside the set is invalid', () => {
    const a = answerAll(() => 50)
    a['coach-2'] = 'Z'
    expect(scoreRoles(a).invalid).toEqual(['coach-2'])
  })

  it('boundary table §9.3', () => {
    expect(classify(withScores(10, { navigator: 90, driver: 70 }))).toMatchObject({ state: 'dominant', primary: 'navigator', secondary: 'driver' })
    expect(classify(withScores(10, { navigator: 90, driver: 85 })).state).toBe('mixed')
    expect(classify(withScores(0, { navigator: 40 })).state).toBe('no_dominant')
    expect(classify(withScores(10, { navigator: 100, driver: 25 }))).toMatchObject({ state: 'dominant', secondary: null })
  })
})

describe('job discovery & alignment', () => {
  it('T-18 a third role below 50 adds no job family', () => {
    const c = classify(withScores(10, { analyst: 90, architect: 70, guardian: 45 }))
    const { roles, families } = jobFamiliesToExplore(c)
    expect(roles).toEqual(['analyst', 'architect'])
    expect(families.find((f) => f.family === 'Business Analysis')?.from).toEqual(['analyst', 'architect'])
    expect(families.some((f) => f.family === 'Quality & Control')).toBe(false)
  })

  it('no_dominant gets no automatic families', () => {
    expect(jobFamiliesToExplore(classify(all(50))).families).toEqual([])
  })

  it('§12.2 example: 0.5·81 + 0.3·75 + 0.2·50 = 73', () => {
    const s = withScores(0, { architect: 81, analyst: 75, connector: 50 })
    expect(interestAlignment(s, { architect: 0.5, analyst: 0.3, connector: 0.2 })).toBe(73)
  })

  it('T-29 weights that do not add up to 1 are rejected, not normalised', () => {
    expect(validWeights({ architect: 0.5, analyst: 0.3 })).toBe(false)
    expect(interestAlignment(all(80), { architect: 0.5, analyst: 0.3 })).toBeNull()
  })
})

describe('context', () => {
  it('T-14 35 and 65 are middle', () => {
    expect(band({ value: 35, confirmed: true })).toBe('middle')
    expect(band({ value: 65, confirmed: true })).toBe('middle')
    expect(band({ value: 34, confirmed: true })).toBe('low')
    expect(band({ value: 66, confirmed: true })).toBe('high')
  })

  it('T-15 unconfirmed context is unknown and left out of alignment', () => {
    const ctx = emptyContext()
    ctx.autonomy = { value: 80, confirmed: false }
    expect(band(ctx.autonomy)).toBe('unknown')
    expect(compareContext(ctx, { autonomy: { min: 60, max: 90 } })[0]).toMatchObject({ distance: null, discuss: null })
    expect(modifiersOf(ctx)).toEqual([])
  })

  it('T-16 inside the range → distance 0; T-17 80 vs anchor 55 → 25, not flagged', () => {
    expect(contextDistance(70, { min: 60, max: 90 })).toBe(0)
    const ctx = emptyContext()
    ctx.autonomy = { value: 80, confirmed: true }
    expect(compareContext(ctx, { autonomy: { min: 55, max: 55 } })[0]).toMatchObject({ distance: 25, alignment: 75, discuss: false })
  })

  it('T-12 changing context never changes role scores', () => {
    const a = answerAll((c) => (c === 'architect' ? 100 : 50))
    const before = scoreRoles(a).scores
    const ctx = emptyContext()
    ctx.experimentation = { value: 90, confirmed: true }
    modifiersOf(ctx)
    expect(scoreRoles(a).scores).toEqual(before)
  })

  it('growth roles: exploring is exclusive and nothing is preselected', () => {
    expect(toggleGrowthRole([], 'project_lead')).toEqual(['project_lead'])
    expect(toggleGrowthRole(['project_lead', 'specialist'], 'exploring')).toEqual(['exploring'])
    expect(toggleGrowthRole(['exploring'], 'specialist')).toEqual(['specialist'])
  })
})

describe('synthetic sample people', () => {
  it('produce complete, varied role scores', () => {
    const s = syntheticRoleScores({ ...emptyScores(), O: 90, LD: 85, PC: 80 }, 7)
    expect(Object.keys(s)).toHaveLength(12)
    expect(Math.max(...Object.values(s)) - Math.min(...Object.values(s))).toBeGreaterThan(20)
  })
})
