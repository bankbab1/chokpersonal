import { describe, expect, it } from 'vitest'
import { workfitCode } from './code'
import { SAMPLE_POPULATION } from './demo'
import { personalReport } from './personalReport'
import type { Profile, Scores } from './types'

const profileOf = (scores: Scores) => ({ scores, shifts: [], quality: { attentionFailed: 0, tooFastShare: 0, straightLined: false, ok: true } }) as unknown as Profile

describe('personal report', () => {
  it('two people with the same character get different reports', () => {
    const byKey = new Map<string, Scores[]>()
    for (const s of SAMPLE_POPULATION) {
      const k = workfitCode(s).code.slice(0, 4)
      byKey.set(k, [...(byKey.get(k) ?? []), s])
    }
    const [a, b] = [...byKey.values()].sort((x, y) => y.length - x.length)[0]
    const ra = personalReport(profileOf(a))
    const rb = personalReport(profileOf(b))
    expect(ra.character.key).toBe(rb.character.key)
    const sig = (r: typeof ra) => JSON.stringify([r.standouts.map((x) => [x.dim, x.score]), r.differences.map((x) => [x.dim, x.you])])
    expect(sig(ra)).not.toBe(sig(rb))
  })

  it('always gives 3 next steps and uses the person’s own scores', () => {
    const s = SAMPLE_POPULATION[3]
    const r = personalReport(profileOf(s))
    expect(r.nextSteps).toHaveLength(3)
    for (const x of r.standouts) expect(x.score).toBe(s[x.dim])
  })
})
