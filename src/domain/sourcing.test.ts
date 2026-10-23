import { DEMO_CANDIDATES, roleFields } from './demo'
import { JOB_LINES } from './fit'
import { classify, emptyContext, ROLE_TYPE_IDS, type RoleScores, type RoleTypeId } from './roles'
import { assignPersona, emptyScores } from './scoring'
import {
  checkRanges, checkWeights, describeCandidate, emptyFilters, interviewGuide, matchesFilters, pctToWeight, roleErrors, sortCandidates, targetsFromTeamGaps, toggleCompare, upgradeRole, weightsFromType,
  type Candidate, type RoleSpec,
} from './sourcing'
import { migrateSourcing } from '@/store/sourcing'
import { energy, fourLetter, topStrengths, workfitId, workStyle } from './styles'
import { sayDo } from './insights'
import type { Scores } from './types'

const person = (patch: Partial<Scores> = {}, extra: Partial<Candidate> = {}): Candidate => {
  const scores = { ...emptyScores(), ...patch }
  return {
    id: 'x', name: 'x', team: '', role: { th: '', en: '' }, years: 1, openToMove: true, scores,
    persona: assignPersona(scores), ...roleFields(scores, 1), observedDelivery: 0, external: true, ...extra,
  }
}

const flat = (v: number): RoleScores => Object.fromEntries(ROLE_TYPE_IDS.map((id) => [id, v])) as RoleScores
const withTop = (a: RoleTypeId, b: RoleTypeId): RoleScores => ({ ...flat(30), [a]: 90, [b]: 80 })

const role = (patch: Partial<RoleSpec> = {}): RoleSpec => ({
  id: 'r', title: 'Test role', duties: 'Do things', owner: 'Owner', reviewedAt: '2026-10-01',
  roleWeights: { driver: 0.4, carer: 0.3, organizer: 0.3 }, contextRanges: {}, targets: [], createdAt: '', ...patch,
})

describe('role weights (T-29)', () => {
  it('accepts weights that add up to exactly 100%', () => {
    expect(checkWeights({ driver: 0.4, carer: 0.3, organizer: 0.3 }).ok).toBe(true)
    expect(checkWeights({ driver: pctToWeight(33.3), carer: pctToWeight(33.3), organizer: pctToWeight(33.4) }).ok).toBe(true)
  })

  it('rejects a total that is not 100% and never normalises', () => {
    const w = { driver: 0.5, carer: 0.3 }
    const c = checkWeights(w)
    expect(c.ok).toBe(false)
    expect(c.totalPct).toBe(80)
    expect(c.errors.some((e) => e.en.includes('100%'))).toBe(true)
    expect(w).toEqual({ driver: 0.5, carer: 0.3 })
  })

  it('rejects negative, blank and empty weights', () => {
    expect(checkWeights({ driver: 1.2, carer: -0.2 }).ok).toBe(false)
    expect(checkWeights({ driver: NaN }).ok).toBe(false)
    expect(checkWeights({}).ok).toBe(false)
  })

  it('pre-fills from a type with a valid starting point', () => {
    expect(weightsFromType('analyst')).toEqual({ analyst: 0.6, guardian: 0.4 })
    expect(checkWeights(weightsFromType('analyst')).ok).toBe(true)
  })

  it('blocks saving without owner, review date or valid ranges', () => {
    expect(roleErrors(role())).toEqual([])
    expect(roleErrors(role({ owner: '' }))).toHaveLength(1)
    expect(roleErrors(role({ reviewedAt: null }))).toHaveLength(1)
    expect(checkRanges({ autonomy: { min: 70, max: 30 } })).toHaveLength(1)
    expect(checkRanges({ autonomy: { min: 20, max: 33 } })).toHaveLength(1)
    expect(checkRanges({ autonomy: { min: 20, max: 20 } })).toEqual([])
  })
})

describe('no overall score', () => {
  it('shows interest alignment separately and keeps unknown as null, not 0', () => {
    const c = person({}, { roleScores: flat(50), roleClass: classify(flat(50)) })
    expect(describeCandidate(role(), c).alignment).toBe(50)
    expect(describeCandidate(role(), { ...c, roleScores: null, roleClass: null }).alignment).toBeNull()
    expect(describeCandidate(role({ roleWeights: {} }), c).alignment).toBeNull()
    expect(describeCandidate(role(), c)).not.toHaveProperty('overall')
  })

  it('lists the largest context distances with a worth-agreeing flag', () => {
    const ctx = emptyContext()
    ctx.autonomy = { value: 90, confirmed: true }
    ctx.change = { value: 50, confirmed: true }
    ctx.collaboration = { value: 10, confirmed: false }
    const ranges = { autonomy: { min: 20, max: 50 }, change: { min: 40, max: 60 }, collaboration: { min: 60, max: 80 } }
    const v = describeCandidate(role({ contextRanges: ranges }), person({}, { context: ctx }))
    expect(v.topGaps.map((g) => g.dim)).toEqual(['autonomy', 'change'])
    expect(v.topGaps[0].discuss).toBe(true)
    expect(v.gaps.find((g) => g.dim === 'collaboration')?.distance).toBeNull()
  })

  it('sorts by name or date, never by score', () => {
    const a = person({}, { id: 'a', name: 'ข', appliedAt: '2026-10-01' })
    const b = person({}, { id: 'b', name: 'ก', appliedAt: '2026-10-05' })
    expect(sortCandidates([a, b], 'name').map((x) => x.id)).toEqual(['b', 'a'])
    expect(sortCandidates([a, b], 'date').map((x) => x.id)).toEqual(['b', 'a'])
  })
})

describe('filters (T-19, T-20)', () => {
  const dom = person({}, { id: 'd', roleScores: withTop('driver', 'carer'), roleClass: classify(withTop('driver', 'carer')), growthRoles: ['project_lead'] })
  const none = person({}, { id: 'n', roleScores: flat(55), roleClass: classify(flat(55)), growthRoles: ['specialist'] })
  const noData = person({}, { id: 'z', roleScores: null, roleClass: null, growthRoles: [] })

  it('matches the primary or secondary type', () => {
    expect(matchesFilters(dom, { ...emptyFilters(), types: ['driver'] })).toBe(true)
    expect(matchesFilters(dom, { ...emptyFilters(), types: ['carer'] })).toBe(true)
    expect(matchesFilters(dom, { ...emptyFilters(), types: ['analyst'] })).toBe(false)
  })

  it('never matches no_dominant or missing data on a type filter', () => {
    expect(none.roleClass?.state).toBe('no_dominant')
    for (const id of ROLE_TYPE_IDS) expect(matchesFilters(none, { ...emptyFilters(), types: [id] })).toBe(false)
    expect(matchesFilters(noData, { ...emptyFilters(), types: [...ROLE_TYPE_IDS] })).toBe(false)
    expect(matchesFilters(none, emptyFilters())).toBe(true)
  })

  it('uses OR within a group and AND across groups', () => {
    const f = { ...emptyFilters(), types: ['analyst', 'driver'] as RoleTypeId[] }
    expect(matchesFilters(dom, f)).toBe(true)
    expect(matchesFilters(dom, { ...f, growth: ['specialist'] })).toBe(false)
    expect(matchesFilters(dom, { ...f, growth: ['specialist', 'project_lead'] })).toBe(true)
    const ctx = emptyContext()
    ctx.autonomy = { value: 80, confirmed: true }
    const p = { ...dom, context: ctx }
    expect(matchesFilters(p, { ...emptyFilters(), bands: { autonomy: ['high'] } })).toBe(true)
    expect(matchesFilters(p, { ...emptyFilters(), bands: { autonomy: ['high'], change: ['low'] } })).toBe(false)
    expect(matchesFilters(p, { ...emptyFilters(), bands: { autonomy: ['high'], change: ['low', 'unknown'] } })).toBe(true)
  })

  it('only returns people that match', () => {
    const list = DEMO_CANDIDATES.filter((c) => matchesFilters(c, { ...emptyFilters(), types: ['analyst'] }))
    expect(list.every((c) => c.roleClass?.primary === 'analyst' || c.roleClass?.secondary === 'analyst')).toBe(true)
  })
})

describe('compare (T-21)', () => {
  it('refuses a 4th person and keeps the selection', () => {
    let sel: string[] = []
    for (const id of ['a', 'b', 'c']) sel = toggleCompare(sel, id).selection
    const r = toggleCompare(sel, 'd')
    expect(r.refused).toBe(true)
    expect(r.selection).toEqual(['a', 'b', 'c'])
    expect(toggleCompare(sel, 'b').selection).toEqual(['a', 'c'])
  })
})

describe('interview guide', () => {
  it('asks about the heaviest duties, the same for everyone', () => {
    const qs = interviewGuide(role(), person(), [], sayDo(emptyScores()))
    expect(qs[0].kind).toBe('duty')
    expect(qs[0].why.en).toContain('40%')
  })

  it('asks about missing information instead of guessing', () => {
    const c = person({}, { roleScores: null, roleClass: null, growthRoles: [], context: emptyContext() })
    const v = describeCandidate(role({ contextRanges: { autonomy: { min: 20, max: 40 } } }), c)
    expect(v.interview.filter((q) => q.kind === 'missing')).toHaveLength(3)
  })

  it('asks a polished talker for a work sample', () => {
    const s = { ...emptyScores(), PR: 92, X: 85, C: 30, H: 40 }
    const qs = interviewGuide(role(), person(s), [], sayDo(s))
    expect(qs.some((q) => q.ask.th.includes('งานตัวอย่าง'))).toBe(true)
  })

  it('describes every demo candidate without throwing', () => {
    for (const c of DEMO_CANDIDATES) expect(describeCandidate(role(), c).interview.length).toBeGreaterThan(0)
  })
})

describe('style notes and migration', () => {
  it('has broad, everyday job areas with examples', () => {
    expect(JOB_LINES.length).toBeGreaterThanOrEqual(15)
    for (const j of JOB_LINES) expect(j.examples).toBeTruthy()
  })

  it('turns team blind spots into style notes', () => {
    const team = [person({ MP: 70 }), person({ MP: 65 })]
    expect(targetsFromTeamGaps(team).map((t) => t.dim)).toContain('MP')
  })

  it('upgrades old saved roles and stages without inventing weights', () => {
    const old = { roles: [{ id: 'old', title: 'Old', targets: [], createdAt: 'x', managerStyle: 'handsoff' }], stages: { 'old:c1': 'interview' }, notes: {} }
    const m = migrateSourcing(old, 0)
    expect(m.roles?.[0].roleWeights).toEqual({})
    expect(m.roles?.[0].contextRanges).toEqual({})
    expect(m.roles?.[0].managerTemplate).toBe('autonomous')
    expect(m.stages?.['old:c1']).toEqual({ stage: 'interview', reason: '', at: '' })
    expect(upgradeRole({ id: 'y' }).reviewedAt).toBeNull()
  })
})

describe('familiar frames', () => {
  it('shows the middle as ambivert instead of forcing a side', () => {
    expect(energy({ ...emptyScores(), X: 52, SK: 48 }).kind).toBe('ambivert')
    expect(energy({ ...emptyScores(), X: 15, SK: 20 }).kind).toBe('introvert')
  })

  it('marks letters near the middle as borderline', () => {
    const { axes } = fourLetter({ ...emptyScores(), X: 54 })
    expect(axes[0].borderline).toBe(true)
  })

  it('places an assertive, task-focused profile in the driver style', () => {
    expect(workStyle({ ...emptyScores(), LD: 85, KJ: 20, PC: 80, X: 30, A: 30, SK: 30, CO: 30 }).id).toBe('driver')
  })

  it('returns five distinct strengths', () => {
    expect(new Set(topStrengths(emptyScores()).map((s) => s.id)).size).toBe(5)
  })

  it('builds a Workfit ID with the 4 letters, the -A/-T suffix and a temperament group', () => {
    const id = workfitId({ ...emptyScores(), X: 80, O: 80, A: 80, FC: 80, KJ: 80, C: 80, ST: 80, MP: 20, E: 80 })
    expect(id.code).toBe('ENFJ-A')
    expect(id.temperament.id).toBe('NF')
    expect(id.line.en).toContain('ENFJ-A')
  })
})

describe('peer view', () => {
  it('round-trips a response code and rejects codes for someone else', async () => {
    const { makeResponseCode, parseResponseCode, PEER_ITEMS } = await import('./peer')
    const answers = PEER_ITEMS.map(() => 5)
    const code = makeResponseCode('me123', 'พี่นุ่น', 'peer', answers)
    const ok = parseResponseCode(code, 'me123')
    expect(ok.ok && ok.rating.rater).toBe('พี่นุ่น')
    expect(parseResponseCode(code, 'someone-else')).toEqual({ ok: false, reason: 'other-person' })
    expect(parseResponseCode('garbage', 'me123')).toEqual({ ok: false, reason: 'format' })
  })

  it('finds blind spots and uses peer-rated delivery', async () => {
    const { summarisePeers, PEER_ITEMS } = await import('./peer')
    const self = { ...emptyScores(), PR: 90 }
    // Raters say presentation is low (item p14 = PR) and delivery is high (p15, p16 = DO).
    const answers = PEER_ITEMS.map((i) => (i.dim === 'PR' ? 1 : i.dim === 'DO' ? 6 : 3))
    const sum = summarisePeers(self, [{ id: 'a', rater: 'a', relation: 'peer', answers, receivedAt: '' }])
    expect(sum.gaps.find((g) => g.dim === 'PR')?.kind).toBe('blind-spot')
    expect(sum.delivery).toBe(100)
  })
})

describe('culture bridge', () => {
  it('gives a direct non-Thai person a face-saving tip, and a deferential Thai a speak-up tip', async () => {
    const { cultureBridge } = await import('./culture')
    const direct = { ...emptyScores(), KJ: 15, FC: 20 }
    expect(cultureBridge(direct, 'foreign').some((b) => b.dim === 'KJ' && b.tone === 'adjust')).toBe(true)
    const deferential = { ...emptyScores(), KJ: 85 }
    expect(cultureBridge(deferential, 'thai').some((b) => b.dim === 'KJ' && b.tone === 'adjust')).toBe(true)
    expect(cultureBridge(emptyScores(), 'thai')).toEqual([])
  })
})

describe('Workfit Code', () => {
  it('builds a standard CORE-CONTEXT code and flags leaning letters', async () => {
    const { workfitCode } = await import('./code')
    const s = { ...emptyScores(), X: 85, LD: 80, PC: 20, O: 90, KJ: 80, FC: 80, ST: 55, MP: 50, BK: 80, SK: 80, CO: 80 }
    const wc = workfitCode(s)
    expect(wc.code).toBe('ENLC-HRW')
    expect(wc.vibe.key).toBe('EN')
    expect(wc.crew.key).toBe('HW')
    expect(wc.code).toMatch(/^[A-Z]{4}-[A-Z]{3}$/)
    expect(wc.letters.find((l) => l.axis.id === 'frame')?.clear).toBe(false)
    expect(wc.title.en).toBe('The Thoughtful Spark Leader')
    expect(wc.intro.en.length).toBeGreaterThan(40)
  })

  it('decodes typed codes in any case, with or without the hyphen', async () => {
    const { decodeCode } = await import('./code')
    expect(decodeCode('inlc-dro')?.map((x) => x.pole.letter).join('')).toBe('INLCDRO')
    expect(decodeCode('ENLCHRW')).not.toBeNull()
    expect(decodeCode('NELC-HRW')).toBeNull()
    expect(decodeCode('ELC')).toBeNull()
  })

  it('uses 14 distinct letters across the axes', async () => {
    const { CODE_AXES } = await import('./code')
    const letters = CODE_AXES.flatMap((a) => [a.left.letter, a.right.letter])
    expect(new Set(letters).size).toBe(14)
    // Only E/I/N/S are shared with MBTI, and only where the meaning is the same.
    expect(letters.filter((l) => 'EINSTFJPA'.includes(l)).sort()).toEqual(['E', 'I', 'N', 'S'])
  })
})

describe('deep modules', () => {
  it('measures 87 aspects in total, with 3 facets per dimension', async () => {
    const { FACETS, TOTAL_ASPECTS, DEEP_ITEMS } = await import('./deep')
    expect(FACETS).toHaveLength(54)
    expect(TOTAL_ASPECTS).toBe(87)
    expect(new Set(DEEP_ITEMS.map((i) => i.id)).size).toBe(DEEP_ITEMS.length)
  })

  it('scores facets, motivators, risks and agility, and finds facet splits', async () => {
    const { deepProfile, DEEP_ITEMS } = await import('./deep')
    const answers: Record<string, number> = {}
    for (const it of DEEP_ITEMS) {
      // High deference to seniors, low to peers; strong growth motive; high people-pleasing.
      const high = it.key === 'KJ.seniors' || it.key === 'growth' || it.key === 'pleasing' || it.key === 'LA'
      const low = it.key === 'KJ.peers'
      const v = high ? 6 : low ? 1 : 3
      answers[it.id] = it.keyed === 1 ? v : 7 - v
    }
    const p = deepProfile(answers)
    expect(p.measured).toBe(87)
    expect(p.motivators[0].m.id).toBe('growth')
    expect(p.risks[0].r.id).toBe('pleasing')
    expect(p.agility).toBe(100)
    expect(p.splits.some((s) => s.dim === 'KJ' && s.high.id === 'KJ.seniors' && s.low.id === 'KJ.peers')).toBe(true)
  })
})

describe('same type, different people', () => {
  it('finds people with the same familiar type who still differ, and what sets you apart', async () => {
    const { SAMPLE_POPULATION } = await import('./demo')
    const { mostCommonType, sameType } = await import('./fingerprint')
    expect(SAMPLE_POPULATION).toHaveLength(600)
    const { people } = mostCommonType(SAMPLE_POPULATION, 10)
    expect(people.length).toBe(10)
    const r = sameType(people[0], SAMPLE_POPULATION)!
    expect(r.group.length).toBeGreaterThan(5)
    expect(r.workfitCodes).toBeGreaterThan(1)
    const spread = r.widest[0].max - r.widest[0].min
    expect(spread).toBeGreaterThan(40)
  })
})

describe('code book', () => {
  it('lists all 128 codes, each described by the same rules as a real result', async () => {
    const { CODE_BOOK, codeBookEntry } = await import('./code')
    expect(CODE_BOOK).toHaveLength(128)
    expect(new Set(CODE_BOOK.map((e) => e.code)).size).toBe(128)
    for (const e of CODE_BOOK) {
      expect(e.wc.code.replace('-', '')).toBe(e.letters.join(''))
      expect(e.wc.letters.every((l) => l.clear)).toBe(true)
      expect(e.wc.title.th.length).toBeGreaterThan(0)
    }
    expect(codeBookEntry('enlc-hrw')?.code).toBe('ENLC-HRW')
    expect(codeBookEntry('XXXX-XXX')).toBeNull()
  })
})
