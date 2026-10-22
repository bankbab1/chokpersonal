import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/**
 * Opt-in "for fun" data, kept apart from the assessment store on purpose:
 * nothing here is read by scoring, fit, sourcing, team or lab views, and it never leaves the device.
 */
interface FunState {
  /** YYYY-MM-DD, local calendar date. */
  birth?: string
  setBirth: (birth?: string) => void
}

export const useFun = create<FunState>()(
  persist(
    (set) => ({
      birth: undefined,
      setBirth: (birth) => set({ birth }),
    }),
    { name: 'workfit-fun-v1', storage: createJSONStorage(() => localStorage) },
  ),
)
