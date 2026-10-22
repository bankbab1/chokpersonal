import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEMO_STAFF } from '@/domain/demo'
import { targetsFromTeamGaps, targetsFromTemplate, type RoleSpec, type Stage } from '@/domain/sourcing'
import type { Target } from '@/domain/fit'

const merge = (a: Target[], b: Target[]) => [...a, ...b.filter((t) => !a.some((x) => x.dim === t.dim))]

const seedRoles = (): RoleSpec[] => [
  {
    id: 'role-store-manager',
    title: 'ผู้จัดการสาขา (สาขาเปิดใหม่)',
    jobLine: 'people-lead',
    env: 'env-frontline',
    managerStyle: 'coach',
    targets: targetsFromTemplate('people-lead', 'env-frontline'),
    createdAt: '2026-10-20T09:00:00.000Z',
    note: 'สาขาเปิดใหม่ ทีม 8 คน ต้องสร้างทีมจากศูนย์',
  },
  {
    id: 'role-fin-analyst',
    title: 'นักวิเคราะห์การเงิน',
    jobLine: 'finance',
    teamId: 'fin',
    managerStyle: 'directive',
    targets: merge(targetsFromTemplate('finance'), targetsFromTeamGaps(DEMO_STAFF.filter((m) => m.team === 'fin'))),
    createdAt: '2026-10-21T09:00:00.000Z',
  },
  {
    id: 'role-designer',
    title: 'Product designer',
    jobLine: 'creative',
    env: 'env-project',
    teamId: 'mer',
    managerStyle: 'handsoff',
    targets: targetsFromTemplate('creative', 'env-project'),
    createdAt: '2026-10-21T13:00:00.000Z',
  },
]

interface State {
  roles: RoleSpec[]
  /** `${roleId}:${personId}` → stage */
  stages: Record<string, Stage>
  notes: Record<string, string>
  upsertRole: (r: RoleSpec) => void
  removeRole: (id: string) => void
  setStage: (roleId: string, personId: string, stage: Stage) => void
  setNote: (roleId: string, personId: string, note: string) => void
  resetDemo: () => void
}

export const pipelineKey = (roleId: string, personId: string) => `${roleId}:${personId}`

export const useSourcing = create<State>()(
  persist(
    (set) => ({
      roles: seedRoles(),
      stages: {},
      notes: {},
      upsertRole: (r) =>
        set((s) => ({ roles: s.roles.some((x) => x.id === r.id) ? s.roles.map((x) => (x.id === r.id ? r : x)) : [r, ...s.roles] })),
      removeRole: (id) => set((s) => ({ roles: s.roles.filter((r) => r.id !== id) })),
      setStage: (roleId, personId, stage) => set((s) => ({ stages: { ...s.stages, [pipelineKey(roleId, personId)]: stage } })),
      setNote: (roleId, personId, note) => set((s) => ({ notes: { ...s.notes, [pipelineKey(roleId, personId)]: note } })),
      resetDemo: () => set({ roles: seedRoles(), stages: {}, notes: {} }),
    }),
    { name: 'workfit-sourcing-v2', storage: createJSONStorage(() => localStorage) },
  ),
)
