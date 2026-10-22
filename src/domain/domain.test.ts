import { DEMO_STAFF, similarity } from './demo'
import { JOB_LINES, managerFit, rankRoles, roleFit } from './fit'
import { personalSignals, sayDo } from './insights'
import { FORCED_BLOCKS, LIKERT_ITEMS, LIKERT_SEQUENCE, SCENARIOS, STATEMENTS } from './items'
import { FAMILIES, PERSONAS } from './personas'
import { assignPersona, computeProfile, computeScores, emptyScores } from './scoring'
import { analyseTeam } from './team'
import type { Answers } from './types'

const blank = (): Answers => ({ likert: {}, forced: {}, scenario: {} })

describe('item bank', () => {
  it('has 8 Likert items per core dimension, half reverse-keyed', () => {
    expect(LIKERT_ITEMS).toHaveLength(48)
    for (const dim of ['H', 'E', 'X', 'A', 'C', 'O']) {
      const items = LIKERT_ITEMS.filter((i) => i.dim === dim)
      expect(items).toHaveLength(8)
      expect(items.filter((i) => i.keyed === -1)).toHaveLength(4)
    }
    expect(LIKERT_SEQUENCE).toHaveLength(50)
  })

  it('packs every statement into blocks of 3 different dimensions', () => {
    expect(FORCED_BLOCKS).toHaveLength(STATEMENTS.length / 3)
    const used = FORCED_BLOCKS.flatMap((b) => b.statements.map((s) => s.id))
    expect(new Set(used).size).toBe(STATEMENTS.length)
    for (const b of FORCED_BLOCKS) expect(new Set(b.statements.map((s) => s.dim)).size).toBe(3)
  })

  it('has 12 scenarios, 3 per context', () => {
    expect(SCENARIOS).toHaveLength(12)
  })

  it('defines all 24 personas', () => {
    expect(PERSONAS).toHaveLength(24)
    for (const f of FAMILIES) expect(PERSONAS.filter((p) => p.family === f.id)).toHaveLength(4)
  })
})

describe('scoring', () => {
  it('returns 50 everywhere when nothing is answered', () => {
    expect(computeScores(blank())).toEqual(emptyScores())
  })

  it('scores agreeing with every positive conscientiousness item as high', () => {
    const a = blank()
    for (const i of LIKERT_ITEMS.filter((x) => x.dim === 'C')) a.likert[i.id] = { value: i.keyed === 1 ? 6 : 1, ms: 4000 }
    expect(computeScores(a).C).toBe(100)
  })

  it('reverse-scores forced-choice statements', () => {
    const a = blank()
    for (const b of FORCED_BLOCKS) {
      const kj = b.statements.find((s) => s.dim === 'KJ')
      if (!kj) continue
      const other = b.statements.find((s) => s.dim !== 'KJ')
      a.forced[b.id] = kj.keyed === -1 ? { most: kj.id, least: other?.id } : { most: other?.id, least: kj.id }
    }
    expect(computeScores(a).KJ).toBe(0)
  })

  it('flags failed attention checks and straight-lining', () => {
    const a = blank()
    for (const e of LIKERT_SEQUENCE) a.likert[e.item.id] = { value: 3, ms: 900 }
    const q = computeProfile(a).quality
    expect(q.attentionFailed).toBe(2)
    expect(q.straightLined).toBe(true)
    expect(q.ok).toBe(false)
  })
})

describe('persona assignment', () => {
  it('maps a high-lead, fast, direct profile to the General', () => {
    const s = { ...emptyScores(), LD: 90, X: 85, E: 80, KJ: 15, PC: 80 }
    const p = assignPersona(s)
    expect(p.family).toBe('COM')
    expect(p.personaId).toBe('com-lf')
    expect(p.modifiers).toContain('kj-low')
  })

  it('maps a precise, structured, careful supporter to the Steady auditor', () => {
    const s = { ...emptyScores(), C: 90, ST: 85, MP: 10, LD: 30, PC: 25 }
    expect(assignPersona(s).personaId).toBe('gua-sc')
  })
})

describe('fit engine', () => {
  it('gives 100 when every score sits inside its target range', () => {
    const role = JOB_LINES[0]
    const s = emptyScores()
    for (const t of role.targets) s[t.dim] = t.center
    expect(roleFit(s, role).fit).toBe(100)
  })

  it('ranks data and planning above sales for a precise introvert', () => {
    const s = { ...emptyScores(), C: 90, MP: 15, ST: 80, X: 20, PC: 35 }
    const ranked = rankRoles(s).map((r) => r.id)
    expect(ranked.indexOf('data')).toBeLessThan(ranked.indexOf('sales'))
  })

  it('warns a high-เกรงใจ person about a challenger manager', () => {
    const s = { ...emptyScores(), KJ: 85, FC: 80 }
    const challenger = managerFit(s).find((m) => m.style === 'challenger')
    expect(challenger?.fit).toBeLessThan(50)
    expect(challenger?.notes.some((n) => !n.good)).toBe(true)
  })
})

describe('Workfit insights', () => {
  it('spots a quiet achiever', () => {
    const s = { ...emptyScores(), PR: 20, X: 25, C: 90, H: 85 }
    expect(sayDo(s).kind).toBe('quiet-achiever')
  })

  it('spots talk over delivery using observed 360 delivery', () => {
    const s = { ...emptyScores(), PR: 90, X: 85 }
    expect(sayDo(s, 35).kind).toBe('talk-over-do')
  })

  it('raises a silence-risk signal for a high-เกรงใจ, face-sensitive introvert', () => {
    const s = { ...emptyScores(), KJ: 85, FC: 85, X: 25, E: 35 }
    expect(personalSignals(s).map((x) => x.id)).toContain('silence-risk')
  })
})

describe('demo data and teams', () => {
  it('builds 40 deterministic staff', () => {
    expect(DEMO_STAFF).toHaveLength(40)
    expect(similarity(DEMO_STAFF[0].scores, DEMO_STAFF[0].scores)).toBe(100)
  })

  it('analyses a team without throwing', () => {
    const team = analyseTeam(DEMO_STAFF.filter((m) => m.team === 'ctw'))
    expect(team.size).toBe(8)
    expect(Object.values(team.familyCount).reduce((a, b) => a + b, 0)).toBe(8)
  })
})
