import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { FORCED_BLOCKS, LIKERT_SEQUENCE, SCENARIOS } from '@/domain/items'
import { FAMILIES } from '@/domain/personas'
import type { Background } from '@/domain/culture'
import { DEEP_ITEMS, type DeepAnswers } from '@/domain/deep'
import { computeScores } from '@/domain/scoring'
import type { PeerRating } from '@/domain/peer'
import { emptyContext, syntheticRoleAnswers, type ContextDimId, type ContextProfile, type GrowthRole, type RoleAnswers } from '@/domain/roles'
import { useFun } from './fun'
import { LEVEL_ORDER, type Level } from '@/domain/levels'
import type { Answers, FamilyId } from '@/domain/types'

export interface Consent {
  self: boolean
  team: boolean
  hr: boolean // visible in HR search for internal opportunities
  at?: string
}

interface State {
  /** Stable random id so peer response codes can be matched to this person. */
  myId: string
  background: Background
  peerRatings: PeerRating[]
  /** Optional deep modules: item id → 1–6. */
  deep: DeepAnswers
  /** Role-interest answers (48 items): question id → option id. */
  roles: RoleAnswers
  answerRole: (id: string, optionId: string) => void
  /** Working preferences the person set; only confirmed values are ever used. */
  context: ContextProfile
  setContext: (dim: ContextDimId, value: number | null, confirmed: boolean) => void
  /** Question ids the person marked as unclear — content feedback only, never scored. */
  unclear: string[]
  toggleUnclear: (id: string) => void
  growthRoles: GrowthRole[]
  setGrowthRoles: (g: GrowthRole[]) => void
  /** Removes every answer, result and setting kept on this device. */
  deleteAll: () => void
  /** True while the answers are the generated sample, so the test never shows them as the person's own. */
  sample: boolean
  /** Chosen test depth; null until the person picks one. */
  level: Level | null
  setLevel: (l: Level) => void
  /** Deepest level finished so far. */
  completedLevel?: Level
  answerDeep: (id: string, value: number) => void
  setBackground: (b: Background) => void
  addPeerRating: (r: PeerRating) => boolean
  removePeerRating: (id: string) => void
  setPeerRatings: (r: PeerRating[]) => void
  name: string
  consent: Consent
  answers: Answers
  step: number
  completedAt?: string
  /** Set when a candidate opens an invite link (/test?invite=roleId). */
  invitedRole?: string
  setInvitedRole: (roleId?: string) => void
  setName: (name: string) => void
  setConsent: (c: Partial<Consent>) => void
  answerLikert: (id: string, value: number, ms: number) => void
  pick: (kind: 'forced' | 'scenario', id: string, slot: 'most' | 'least', optionId: string) => void
  setStep: (step: number) => void
  complete: () => void
  reset: () => void
  fillDemo: (family?: FamilyId) => void
}

const emptyAnswers = (): Answers => ({ likert: {}, forced: {}, scenario: {} })

/** Answers that lean towards one family, so the demo result is recognisable. */
const demoAnswers = (family: FamilyId): Answers => {
  const sig = FAMILIES.find((f) => f.id === family)?.signature ?? {}
  const a = emptyAnswers()
  let seed = family.charCodeAt(0) * 31 + family.charCodeAt(1)
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  for (const e of LIKERT_SEQUENCE) {
    if (e.kind === 'attention') {
      a.likert[e.item.id] = { value: e.item.expect, ms: 3200 }
      continue
    }
    const dir = sig[e.item.dim] ?? 0
    const lean = dir * e.item.keyed // +1 agree, −1 disagree, 0 neutral-ish
    const base = lean > 0 ? 5 : lean < 0 ? 2 : 3 + Math.round(rand())
    const value = Math.min(6, Math.max(1, base + Math.round(rand() * 2 - 1)))
    a.likert[e.item.id] = { value, ms: 2500 + Math.round(rand() * 3000) }
  }
  for (const b of FORCED_BLOCKS) {
    const ranked = [...b.statements].sort((x, y) => (sig[y.dim] ?? 0) * y.keyed - (sig[x.dim] ?? 0) * x.keyed || rand() - 0.5)
    a.forced[b.id] = { most: ranked[0].id, least: ranked[2].id }
  }
  for (const sc of SCENARIOS) {
    const val = (o: (typeof sc.options)[number]) =>
      Object.entries(o.effects).reduce((s, [d, e]) => s + (sig[d as keyof typeof sig] ?? 0) * (e ?? 0), 0) + rand() * 0.5
    const ranked = [...sc.options].sort((x, y) => val(y) - val(x))
    a.scenario[sc.id] = { most: ranked[0].id, least: ranked[3].id }
  }
  return a
}

/** Deep-module answers that follow the core profile, with a little noise, for the demo. */
const demoDeep = (sc: ReturnType<typeof computeScores>): DeepAnswers => {
  let seed = Math.round(sc.X * 7 + sc.C * 3 + sc.KJ)
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280)
  const lean = (v: number) => 1 + (v / 100) * 5
  const base = (key: string): number => {
    const dim = key.split('.')[0] as keyof typeof sc
    if (dim in sc) return lean(sc[dim])
    const risk: Record<string, number> = {
      overconfidence: (sc.LD + (100 - sc.A)) / 2,
      volatility: 100 - sc.E,
      avoidance: (sc.KJ + sc.FC) / 2,
      control: (sc.C + sc.LD) / 2 - 10,
      pleasing: (sc.KJ + sc.A) / 2,
      blame: 100 - sc.H,
      security: 100 - sc.CH,
      reward: 50 + (sc.PC - 50) / 2,
      recognition: sc.PR,
      growth: sc.O,
      purpose: (sc.H + sc.O) / 2,
      belonging: (sc.SK + sc.BK) / 2,
      autonomy: 100 - sc.ST,
      challenge: (sc.CH + sc.LD) / 2,
      LA: (sc.O + sc.CH) / 2,
    }
    return lean(risk[key] ?? 50)
  }
  const out: DeepAnswers = {}
  for (const item of DEEP_ITEMS) {
    const b = base(item.key)
    const v = item.keyed === 1 ? b : 7 - b
    out[item.id] = Math.min(6, Math.max(1, Math.round(v + (rand() - 0.5) * 2)))
  }
  return out
}

export const useAssessment = create<State>()(
  persist(
    (set, get) => ({
      myId: Math.random().toString(36).slice(2, 10),
      background: 'thai',
      peerRatings: [],
      deep: {},
      roles: {},
      answerRole: (id, optionId) => set((st) => ({ roles: { ...st.roles, [id]: optionId } })),
      context: emptyContext(),
      setContext: (dim, value, confirmed) => set((st) => ({ context: { ...st.context, [dim]: { value, confirmed } } })),
      unclear: [],
      toggleUnclear: (id) => set((st) => ({ unclear: st.unclear.includes(id) ? st.unclear.filter((x) => x !== id) : [...st.unclear, id] })),
      growthRoles: [],
      setGrowthRoles: (growthRoles) => set({ growthRoles }),
      sample: false,
      level: null,
      setLevel: (level) => set({ level, step: 0 }),
      completedLevel: undefined,
      deleteAll: () => {
        set({
          answers: emptyAnswers(), step: 0, completedAt: undefined, deep: {}, roles: {}, context: emptyContext(), sample: false, level: null, completedLevel: undefined, growthRoles: [], unclear: [],
          peerRatings: [], name: '', consent: { self: false, team: false, hr: false }, invitedRole: undefined, background: 'thai',
          myId: Math.random().toString(36).slice(2, 10),
        })
        useFun.getState().setBirth(undefined)
      },
      answerDeep: (id, value) => set((st) => ({ deep: { ...st.deep, [id]: value } })),
      setBackground: (background) => set({ background }),
      addPeerRating: (r) => {
        if (get().peerRatings.some((x) => x.id === r.id)) return false
        set((st) => ({ peerRatings: [...st.peerRatings, r] }))
        return true
      },
      removePeerRating: (id) => set((st) => ({ peerRatings: st.peerRatings.filter((x) => x.id !== id) })),
      setPeerRatings: (peerRatings) => set({ peerRatings }),
      name: '',
      consent: { self: false, team: false, hr: false },
      answers: emptyAnswers(),
      step: 0,
      setInvitedRole: (invitedRole) => set({ invitedRole }),
      setName: (name) => set({ name }),
      setConsent: (c) => set((s) => ({ consent: { ...s.consent, ...c, at: new Date().toISOString() } })),
      answerLikert: (id, value, ms) =>
        set((s) => ({ answers: { ...s.answers, likert: { ...s.answers.likert, [id]: { value, ms } } } })),
      pick: (kind, id, slot, optionId) =>
        set((s) => {
          const cur = { ...s.answers[kind][id] }
          const other = slot === 'most' ? 'least' : 'most'
          if (cur[other] === optionId) delete cur[other]
          cur[slot] = cur[slot] === optionId ? undefined : optionId
          return { answers: { ...s.answers, [kind]: { ...s.answers[kind], [id]: cur } } }
        }),
      setStep: (step) => set({ step }),
      complete: () =>
        set((s) => {
          const lvl = s.level ?? 'standard'
          const deeper = !s.completedLevel || LEVEL_ORDER.indexOf(lvl) > LEVEL_ORDER.indexOf(s.completedLevel)
          return { completedAt: new Date().toISOString(), completedLevel: deeper ? lvl : s.completedLevel }
        }),
      reset: () =>
        set((s) => {
          // Leaving a sample: also drop the sample's name and auto-given consent, so the real run asks properly.
          const wasSample = s.sample || s.name === 'คุณ (ตัวอย่าง)'
          return {
            answers: emptyAnswers(), step: 0, completedAt: undefined, deep: {}, roles: {}, sample: false, level: null, completedLevel: undefined,
            ...(wasSample ? { name: '', consent: { self: false, team: false, hr: false } } : {}),
          }
        }),
      fillDemo: (family) => {
        const f = family ?? FAMILIES[Math.floor(Math.random() * FAMILIES.length)].id
        const answers = demoAnswers(f)
        const sc = computeScores(answers)
        set((s) => ({
          answers,
          deep: demoDeep(sc),
          roles: syntheticRoleAnswers(sc, Math.round(sc.X * 13 + sc.O * 7 + sc.LD)),
          completedAt: new Date().toISOString(),
          name: s.name || 'คุณ (ตัวอย่าง)',
          sample: true,
          step: 0,
          level: 'pro' as Level,
          completedLevel: 'pro' as Level,
          consent: { self: true, team: true, hr: true, at: new Date().toISOString() },
        }))
      },
    }),
    {
      name: 'workfit-assessment-v1',
      storage: createJSONStorage(() => localStorage),
      // v1: role answers from question set th-TH-seed-1 (5-point with a middle) mean something else now — drop them.
      version: 2,
      migrate: (persisted, from) => {
        let st = (persisted ?? {}) as Partial<State>
        if (from < 1) st = { ...st, roles: {}, unclear: [] }
        // v2: test levels. Earlier finishers did the full style test (= standard), plus roles if all 48 are answered.
        if (from < 2) {
          const rolesDone = Object.keys(st.roles ?? {}).length >= 48
          const done: Level | undefined = st.completedAt ? (rolesDone ? 'pro' : 'standard') : undefined
          st = { ...st, completedLevel: done, level: done ?? null }
        }
        return st as State
      },
      // Older saves have no id: write the freshly generated one straight away so invite links and
      // response codes keep matching after a reload.
      onRehydrateStorage: () => (state) => {
        // Deferred: with synchronous storage this runs before `useAssessment` is assigned.
        if (state) window.setTimeout(() => useAssessment.setState({ myId: state.myId }), 0)
      },
    },
  ),
)
