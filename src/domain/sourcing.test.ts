import { DEMO_CANDIDATES, DEMO_STAFF } from './demo'
import { JOB_LINES } from './fit'
import { assignPersona, emptyScores } from './scoring'
import { interviewGuide, scoreCandidate, targetsFromBenchmarks, targetsFromTeamGaps, targetsFromTemplate, teamFit, type Candidate, type RoleSpec } from './sourcing'
import { energy, fourLetter, topStrengths, workfitId, workStyle } from './styles'
import { sayDo } from './insights'
import type { Scores } from './types'

const person = (patch: Partial<Scores>): Candidate => {
  const scores = { ...emptyScores(), ...patch }
  return {
    id: 'x', name: 'x', team: '', role: { th: '', en: '' }, years: 1, openToMove: true, scores,
    persona: assignPersona(scores), observedDelivery: 0, external: true,
  }
}

const role = (patch: Partial<RoleSpec> = {}): RoleSpec => ({
  id: 'r', title: 'Test role', targets: targetsFromTemplate('finance'), createdAt: '', ...patch,
})

describe('role profiles', () => {
  it('has broad, everyday job areas with examples', () => {
    expect(JOB_LINES.length).toBeGreaterThanOrEqual(15)
    for (const j of JOB_LINES) expect(j.examples).toBeTruthy()
  })

  it('clones only the dimensions top performers share', () => {
    const a = person({ C: 85, MP: 20, X: 30 })
    const b = person({ C: 80, MP: 25, X: 75 })
    const dims = targetsFromBenchmarks([a, b]).map((t) => t.dim)
    expect(dims).toContain('C')
    expect(dims).toContain('MP')
    expect(dims).not.toContain('X') // the benchmarks disagree on extraversion
  })

  it('turns team blind spots into targets', () => {
    const team = [person({ MP: 70 }), person({ MP: 65 })]
    expect(targetsFromTeamGaps(team).map((t) => t.dim)).toContain('MP')
  })
})

describe('candidate scoring', () => {
  it('rewards a candidate who fills a team gap', () => {
    const team = [person({ MP: 70 }), person({ MP: 75 })]
    expect(teamFit(person({ MP: 15 }), team).fills.length).toBeGreaterThan(0)
  })

  it('ranks a precise, honest candidate above a careless one for finance', () => {
    const good = scoreCandidate(role(), person({ C: 88, H: 85, MP: 15, ST: 75 }), [])
    const weak = scoreCandidate(role(), person({ C: 30, H: 40, MP: 80, ST: 30 }), [])
    expect(good.overall).toBeGreaterThan(weak.overall)
  })

  it('writes interview questions aimed at the gaps', () => {
    const s = { ...emptyScores(), C: 30, H: 85 }
    const qs = interviewGuide(role(), s, sayDo(s))
    expect(qs.length).toBeGreaterThan(0)
    expect(qs[0].dim).toBe('C')
  })

  it('asks a polished talker for a work sample', () => {
    const s = { ...emptyScores(), PR: 92, X: 85, C: 30, H: 40 }
    const qs = interviewGuide(role(), s, sayDo(s))
    expect(qs.some((q) => q.ask.th.includes('งานตัวอย่าง'))).toBe(true)
  })

  it('scores every demo candidate without throwing', () => {
    const team = DEMO_STAFF.filter((m) => m.team === 'fin')
    for (const c of DEMO_CANDIDATES) expect(scoreCandidate(role({ teamId: 'fin' }), c, team).overall).toBeGreaterThanOrEqual(0)
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

describe('persona lab', () => {
  it('recovers well-separated groups and picks k by silhouette', async () => {
    const { runLab } = await import('./cluster')
    const { emptyScores: blank } = await import('./scoring')
    const make = (patch: Partial<Scores>, n: number, jitter: number) =>
      Array.from({ length: n }, (_, i) => {
        const s = { ...blank(), ...patch }
        for (const k of Object.keys(s) as (keyof Scores)[]) s[k] += ((i * 7 + k.length * 3) % (2 * jitter)) - jitter
        return s
      })
    const rows = [...make({ C: 90, ST: 90, MP: 10 }, 20, 4), ...make({ O: 90, CH: 90, ST: 10 }, 20, 4), ...make({ A: 90, X: 90, SK: 90 }, 20, 4)]
    const lab = runLab(rows, 2, 6)
    expect(lab.best.k).toBe(3)
    expect(lab.groups.map((g) => g.size).sort()).toEqual([20, 20, 20])
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
    const r = sameType(people[0], SAMPLE_POPULATION)
    expect(r.group.length).toBeGreaterThan(5)
    expect(r.workfitCodes).toBeGreaterThan(1)
    const spread = r.widest[0].max - r.widest[0].min
    expect(spread).toBeGreaterThan(40)
  })
})
