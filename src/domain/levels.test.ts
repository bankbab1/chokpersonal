import { describe, expect, it } from 'vitest'
import { CODE_DIMS, itemCount, itemsFor } from './levels'

describe('test levels', () => {
  it('quick covers every dimension the code letters need', () => {
    const q = itemsFor('quick')
    for (const d of CODE_DIMS) {
      const likert = q.likert.filter((e) => e.kind === 'likert' && e.item.dim === d).length
      const forced = q.forced.filter((b) => b.statements.some((s) => s.dim === d)).length
      expect(likert >= 4 || forced >= 3, `dimension ${d}`).toBe(true)
    }
    console.log('items per level', itemCount('quick'), itemCount('standard'), itemCount('pro'))
    expect(itemCount('quick')).toBeLessThan(itemCount('standard') / 2)
  })

  it('each level contains everything of the level below, so answers carry over', () => {
    const [q, s, p] = (['quick', 'standard', 'pro'] as const).map(itemsFor)
    const ids = (x: typeof q) => new Set([...x.likert.map((e) => e.item.id), ...x.forced.map((b) => b.id), ...x.scenarios.map((c) => c.id), ...x.roles.map((r) => r.id)])
    const [a, b, c] = [ids(q), ids(s), ids(p)]
    for (const id of a) expect(b.has(id)).toBe(true)
    for (const id of b) expect(c.has(id)).toBe(true)
  })
})

describe('energy is one rule everywhere', () => {
  it('letter 1 matches the introvert / ambivert / extrovert meter for every sample person', async () => {
    const { SAMPLE_POPULATION } = await import('./demo')
    const { workfitCode } = await import('./code')
    const { energy } = await import('./styles')
    for (const s of SAMPLE_POPULATION) {
      const l = workfitCode(s).letters[0]
      const kind = energy(s).kind
      if (kind === 'ambivert') expect(l.clear).toBe(false)
      else expect(l.clear && l.shown).toBe(kind === 'introvert' ? 'I' : 'E')
    }
  })
})
