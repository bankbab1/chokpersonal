import { describe, expect, it } from 'vitest'
import { CHARACTER_GROUPS, CHARACTERS, characterByKey, characterKeyOf, characterOf, groupByKey } from './characters'
import { CODE_AXES, CODE_BOOK, scoresForLetters, workfitCode } from './code'
import { emptyScores } from './scoring'

const core = CODE_AXES.filter((a) => a.group === 'core')

describe('characters', () => {
  it('has 16 unique keys covering every combination of letters 1–4', () => {
    expect(CHARACTERS).toHaveLength(16)
    const keys = CHARACTERS.map((c) => c.key)
    expect(new Set(keys).size).toBe(16)
    const all: string[] = core.reduce<string[]>((acc, axis) => acc.flatMap((p) => [p + axis.left.letter, p + axis.right.letter]), [''])
    expect([...keys].sort()).toEqual([...all].sort())
  })

  it('groups: display order IN, EN, ES, IS with 4 each, ordered LQ, LC, BQ, BC', () => {
    expect(CHARACTER_GROUPS.map((g) => g.key)).toEqual(['IN', 'EN', 'ES', 'IS'])
    for (const g of CHARACTER_GROUPS) {
      const members = CHARACTERS.filter((c) => c.group === g.key)
      expect(members.map((c) => c.key)).toEqual(['LQ', 'LC', 'BQ', 'BC'].map((s) => g.key + s))
      expect(groupByKey(g.key)).toBe(g)
    }
    expect(CHARACTERS.map((c) => c.group)).toEqual(CHARACTER_GROUPS.flatMap((g) => [g.key, g.key, g.key, g.key]))
  })

  it('characterByKey accepts any case and full codes, null for junk', () => {
    expect(characterByKey('inbc')?.key).toBe('INBC')
    expect(characterByKey('INBC-HMW')?.key).toBe('INBC')
    expect(characterByKey('esbq-drw')?.key).toBe('ESBQ')
    for (const junk of ['', 'XXXX', 'INB', 'hello world', 'ZNBC-HMW']) expect(characterByKey(junk)).toBeNull()
  })

  it('characterKeyOf equals letters 1–4 of the Workfit Code', () => {
    for (const s of [emptyScores(), ...CODE_BOOK.map((e) => scoresForLetters(e.letters))]) {
      expect(characterKeyOf(s)).toBe(workfitCode(s).code.slice(0, 4))
      expect(characterOf(s).key).toBe(characterKeyOf(s))
    }
  })

  it('content shape', () => {
    for (const c of CHARACTERS) {
      expect(c.strengths).toHaveLength(4)
      expect(c.watchouts).toHaveLength(3)
      expect(c.careers.length).toBeGreaterThanOrEqual(3)
      expect(c.careers.length).toBeLessThanOrEqual(5)
      for (const t of [c.name, c.tagline, c.overview, c.inTeam, c.withManager, c.workHabits, c.workWithMe, c.friends, c.family, c.social, c.partner]) {
        expect(t.th.trim()).not.toBe('')
        expect(t.en.trim()).not.toBe('')
      }
    }
  })

  it('never names a company', () => {
    expect(JSON.stringify(CHARACTERS).toLowerCase()).not.toContain('jaspal')
  })

  it('the four in each group look different', () => {
    for (const g of CHARACTER_GROUPS) {
      const looks = CHARACTERS.filter((c) => c.group === g.key).map((c) => c.look.hair)
      expect(new Set(looks).size).toBe(4)
    }
    expect(CHARACTERS.filter((c) => c.look.beard).length).toBeLessThanOrEqual(2)
  })
})
