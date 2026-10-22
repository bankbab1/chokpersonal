import type { T } from '@/lib/i18n'

export type Layer = 'core' | 'thai' | 'work'

export type DimCode =
  | 'H' | 'E' | 'X' | 'A' | 'C' | 'O'
  | 'KJ' | 'SN' | 'FC' | 'SK' | 'MP' | 'BK'
  | 'LD' | 'PC' | 'CO' | 'ST' | 'CH' | 'PR'

/** 0–100 per dimension. 50 = middle of the scale (not a norm-group percentile yet). */
export type Scores = Record<DimCode, number>

export type FamilyId = 'COM' | 'CON' | 'CRE' | 'GUA' | 'DRV' | 'CAR'

/** L/S = lead or support, F/C = fast or careful. */
export type Variant = 'LF' | 'LC' | 'SF' | 'SC'

export type Context = 'pressure' | 'senior' | 'junior' | 'customer'

export interface LikertAnswer {
  value: number // 1–6
  ms: number // time on screen, for the too-fast flag
}

export interface PickAnswer {
  most?: string
  least?: string
}

export interface Answers {
  likert: Record<string, LikertAnswer>
  forced: Record<string, PickAnswer>
  scenario: Record<string, PickAnswer>
}

export type Clarity = 'very-clear' | 'clear' | 'borderline'

export interface ContextShift {
  context: Context
  likely: T[]
  unlikely: T[]
}

export interface QualityReport {
  attentionFailed: number
  tooFastShare: number // 0–1 of Likert items answered under 2 s
  straightLined: boolean
  ok: boolean
}

export interface PersonaResult {
  family: FamilyId
  blend?: FamilyId
  variant: Variant
  personaId: string
  clarity: Clarity
  modifiers: string[] // modifier ids, max 3
}

export interface Profile {
  scores: Scores
  persona: PersonaResult
  shifts: ContextShift[]
  quality: QualityReport
}
