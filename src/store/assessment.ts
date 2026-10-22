import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { FORCED_BLOCKS, LIKERT_SEQUENCE, SCENARIOS } from '@/domain/items'
import { FAMILIES } from '@/domain/personas'
import type { Background } from '@/domain/culture'
import { DEEP_ITEMS, type DeepAnswers } from '@/domain/deep'
import { computeScores } from '@/domain/scoring'
import type { PeerRating } from '@/domain/peer'
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
      complete: () => set({ completedAt: new Date().toISOString() }),
      reset: () => set({ answers: emptyAnswers(), step: 0, completedAt: undefined, deep: {} }),
      fillDemo: (family) => {
        const f = family ?? FAMILIES[Math.floor(Math.random() * FAMILIES.length)].id
        const answers = demoAnswers(f)
        set((s) => ({
          answers,
          deep: demoDeep(computeScores(answers)),
          completedAt: new Date().toISOString(),
          name: s.name || 'คุณ (ตัวอย่าง)',
          consent: { self: true, team: true, hr: true, at: new Date().toISOString() },
        }))
      },
    }),
    {
      name: 'workfit-assessment-v1',
      storage: createJSONStorage(() => localStorage),
      // Older saves have no id: write the freshly generated one straight away so invite links and
      // response codes keep matching after a reload.
      onRehydrateStorage: () => (state) => {
        // Deferred: with synchronous storage this runs before `useAssessment` is assigned.
        if (state) window.setTimeout(() => useAssessment.setState({ myId: state.myId }), 0)
      },
    },
  ),
)
