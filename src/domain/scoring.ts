import { CONTEXTS, FORCED_BLOCKS, LIKERT_ITEMS, ATTENTION_ITEMS, SCENARIOS, LIKERT_SEQUENCE } from './items'
import type { T } from '@/lib/i18n'
import { DIM_CODES } from './dimensions'
import { MODIFIERS, PERSONAS } from './personas'
import { rankFamilies, STARTER_MODEL, type PersonaModel } from './model'
import type {
  Answers, Clarity, ContextShift, DimCode, PersonaResult, Profile, QualityReport, Scores, Variant,
} from './types'

const clamp = (n: number, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, n))
const round = (n: number) => Math.round(n)

export const emptyScores = (fill = 50): Scores =>
  Object.fromEntries(DIM_CODES.map((c) => [c, fill])) as Scores

/** Likert: mean of keyed answers (1–6) mapped to 0–100. */
const likertScores = (answers: Answers): Partial<Scores> => {
  const sums = new Map<DimCode, { total: number; n: number }>()
  for (const item of LIKERT_ITEMS) {
    const a = answers.likert[item.id]
    if (!a) continue
    const v = item.keyed === 1 ? a.value : 7 - a.value
    const cur = sums.get(item.dim) ?? { total: 0, n: 0 }
    sums.set(item.dim, { total: cur.total + v, n: cur.n + 1 })
  }
  const out: Partial<Scores> = {}
  for (const [dim, { total, n }] of sums) out[dim] = ((total / n - 1) / 5) * 100
  return out
}

/**
 * Forced choice, MVP scoring: most = 2 points, unpicked = 1, least = 0, flipped for reverse-keyed
 * statements, averaged per dimension. The pilot replaces this with a Thurstonian IRT model so scores
 * stay comparable between people (ipsative sums are only fair within one person).
 */
const forcedScores = (answers: Answers): Partial<Scores> => {
  const sums = new Map<DimCode, { total: number; n: number }>()
  for (const block of FORCED_BLOCKS) {
    const a = answers.forced[block.id]
    if (!a?.most || !a.least) continue
    for (const s of block.statements) {
      const p = s.id === a.most ? 2 : s.id === a.least ? 0 : 1
      const v = s.keyed === 1 ? p : 2 - p
      const cur = sums.get(s.dim) ?? { total: 0, n: 0 }
      sums.set(s.dim, { total: cur.total + v, n: cur.n + 1 })
    }
  }
  const out: Partial<Scores> = {}
  for (const [dim, { total, n }] of sums) out[dim] = (total / n / 2) * 100
  return out
}

/** Scenarios nudge scores: most-likely +1 × effect, least-likely −½ × effect, 5 points per step. */
const scenarioAdjust = (answers: Answers): Partial<Scores> => {
  const adj: Partial<Scores> = {}
  const add = (dim: DimCode, v: number) => (adj[dim] = (adj[dim] ?? 0) + v)
  for (const sc of SCENARIOS) {
    const a = answers.scenario[sc.id]
    if (!a) continue
    for (const o of sc.options) {
      const w = o.id === a.most ? 1 : o.id === a.least ? -0.5 : 0
      if (!w) continue
      for (const [dim, e] of Object.entries(o.effects)) add(dim as DimCode, w * (e ?? 0) * 5)
    }
  }
  return adj
}

export const computeScores = (answers: Answers): Scores => {
  const base = { ...emptyScores(), ...likertScores(answers), ...forcedScores(answers) }
  const adj = scenarioAdjust(answers)
  const out = emptyScores()
  for (const c of DIM_CODES) out[c] = round(clamp(base[c] + (adj[c] ?? 0)))
  return out
}

export const computeShifts = (answers: Answers): ContextShift[] =>
  CONTEXTS.map(({ id }) => {
    const likely: T[] = []
    const unlikely: T[] = []
    for (const sc of SCENARIOS.filter((s) => s.context === id)) {
      const a = answers.scenario[sc.id]
      const most = sc.options.find((o) => o.id === a?.most)
      const least = sc.options.find((o) => o.id === a?.least)
      if (most) likely.push(most.behaviour)
      if (least) unlikely.push(least.behaviour)
    }
    return { context: id, likely, unlikely }
  })

export const computeQuality = (answers: Answers): QualityReport => {
  const attentionFailed = ATTENTION_ITEMS.filter((it) => {
    const a = answers.likert[it.id]
    return a && a.value !== it.expect
  }).length
  const timed = LIKERT_ITEMS.map((i) => answers.likert[i.id]).filter(Boolean)
  const tooFastShare = timed.length ? timed.filter((a) => a.ms < 2000).length / timed.length : 0
  // Straight-lining: 12 or more identical answers in a row on the Likert pages.
  let run = 1
  let maxRun = 1
  let prev: number | undefined
  for (const entry of LIKERT_SEQUENCE) {
    const v = answers.likert[entry.item.id]?.value
    run = v !== undefined && v === prev ? run + 1 : 1
    maxRun = Math.max(maxRun, run)
    prev = v
  }
  const straightLined = maxRun >= 12
  return { attentionFailed, tooFastShare, straightLined, ok: attentionFailed === 0 && tooFastShare < 0.3 && !straightLined }
}

/* ------------------------------------------ Persona -------------------------------------------- */

/** Gap between the nearest and second-nearest family centroid (points on the 0–100 scale). */
export const clarityOf = (gap: number): Clarity => (gap >= 4 ? 'very-clear' : gap >= 1.5 ? 'clear' : 'borderline')

export const assignPersona = (scores: Scores, model: PersonaModel = STARTER_MODEL): PersonaResult => {
  const [first, second] = rankFamilies(scores, model)
  const gap = second.distance - first.distance
  const variant: Variant = `${scores.LD >= 50 ? 'L' : 'S'}${scores.PC >= 50 ? 'F' : 'C'}` as Variant
  const persona = PERSONAS.find((p) => p.family === first.id && p.variant === variant)
  if (!persona) throw new Error('Persona table incomplete')
  const modifiers = MODIFIERS.map((m) => ({ m, strength: (scores[m.dim] - 50) * m.pole }))
    .filter((x) => x.strength >= 15)
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 3)
    .map((x) => x.m.id)
  return {
    family: first.id,
    blend: gap < 1 ? second.id : undefined,
    variant,
    personaId: persona.id,
    clarity: clarityOf(gap),
    modifiers,
  }
}

export const computeProfile = (answers: Answers): Profile => {
  const scores = computeScores(answers)
  return {
    scores,
    persona: assignPersona(scores),
    shifts: computeShifts(answers),
    quality: computeQuality(answers),
  }
}

/** 0–100 strength of a dimension pole; used for "how clear is this trait" bands. */
export const traitClarity = (score: number): Clarity => {
  const d = Math.abs(score - 50)
  return d >= 30 ? 'very-clear' : d >= 15 ? 'clear' : 'borderline'
}
