import { describe, expect, it } from 'vitest'
import { horoscopeCheck, parseBirth, rasiFor, verdict, yearAnimalFor } from './horoscope'
import type { DimCode, Scores } from './types'

const CODES: DimCode[] = ['H', 'E', 'X', 'A', 'C', 'O', 'KJ', 'SN', 'FC', 'SK', 'MP', 'BK', 'LD', 'PC', 'CO', 'ST', 'CH', 'PR']
const flat = (v: number) => Object.fromEntries(CODES.map((c) => [c, v])) as Scores

describe('horoscope (fun only)', () => {
  it('parses local dates and rejects impossible ones', () => {
    expect(parseBirth('1990-02-31')).toBeNull()
    expect(parseBirth('nope')).toBeNull()
    expect(parseBirth('2024-01-01')?.weekday).toBe(1) // Monday
  })

  it('maps Thai sidereal ราศี across the year boundary', () => {
    expect(rasiFor(1, 5).id).toBe('thanu')
    expect(rasiFor(1, 14).id).toBe('mangkon')
    expect(rasiFor(4, 12).id).toBe('meen')
    expect(rasiFor(4, 13).id).toBe('mesa')
    expect(rasiFor(8, 20).id).toBe('singh')
    expect(rasiFor(12, 31).id).toBe('thanu')
  })

  it('maps year animals with 2020 = rat', () => {
    expect(yearAnimalFor(2020).id).toBe('rat')
    expect(yearAnimalFor(1990).id).toBe('horse')
    expect(yearAnimalFor(2031).id).toBe('pig')
  })

  it('treats the middle band as neither', () => {
    expect(verdict(70, 1)).toBe('hit')
    expect(verdict(70, -1)).toBe('miss')
    expect(verdict(52, 1)).toBe('mixed')
  })

  it('a perfectly average person matches exactly half', () => {
    const r = horoscopeCheck('1995-07-20', flat(50))!
    expect(r.total).toBe(9)
    expect(r.hits).toBe(0)
    expect(r.matchPct).toBe(50)
  })
})
