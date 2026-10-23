import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { DEMO_STAFF } from '@/domain/demo'
import type { Target } from '@/domain/fit'
import { targetsFromTeamGaps, targetsFromTemplate, upgradeRole, type RoleSpec, type Stage, type StageEntry } from '@/domain/sourcing'

const merge = (a: Target[], b: Target[]) => [...a, ...b.filter((t) => !a.some((x) => x.dim === t.dim))]

const seedRoles = (): RoleSpec[] => [
  {
    id: 'role-store-manager',
    title: 'ผู้จัดการสาขา (สาขาเปิดใหม่)',
    duties: 'เปิดสาขาและพาทีม 8 คนให้ทำยอดตามเป้า จัดตารางกะและสต็อก ดูแลลูกค้าและแก้ปัญหาหน้าร้าน สอนงานพนักงานใหม่',
    owner: 'ผู้จัดการเขต',
    reviewedAt: '2026-10-20',
    roleWeights: { driver: 0.4, carer: 0.3, organizer: 0.3 },
    contextRanges: { collaboration: { min: 55, max: 100 }, change: { min: 40, max: 85 }, leadership_interest: { min: 60, max: 100 } },
    managerTemplate: 'balanced',
    jobLine: 'people-lead',
    env: 'env-frontline',
    targets: targetsFromTemplate('people-lead', 'env-frontline'),
    createdAt: '2026-10-20T09:00:00.000Z',
    note: 'สาขาเปิดใหม่ ทีม 8 คน ต้องสร้างทีมจากศูนย์',
  },
  {
    id: 'role-fin-analyst',
    title: 'นักวิเคราะห์การเงิน',
    duties: 'วิเคราะห์งบและต้นทุนรายเดือน หาสาเหตุเมื่อตัวเลขผิดปกติ ตรวจความถูกต้องก่อนส่งผู้บริหาร ดูแลรอบปิดบัญชีให้ตรงเวลา',
    owner: 'ผู้จัดการบัญชี',
    reviewedAt: '2026-10-21',
    roleWeights: { analyst: 0.5, guardian: 0.3, organizer: 0.2 },
    contextRanges: { autonomy: { min: 20, max: 60 }, experimentation: { min: 0, max: 50 } },
    managerTemplate: 'structured',
    teamTemplate: 'quiet',
    jobLine: 'finance',
    teamId: 'fin',
    targets: merge(targetsFromTemplate('finance'), targetsFromTeamGaps(DEMO_STAFF.filter((m) => m.team === 'fin'))),
    createdAt: '2026-10-21T09:00:00.000Z',
  },
  {
    id: 'role-designer',
    title: 'Product designer',
    duties: 'ออกแบบสินค้าและประสบการณ์ใหม่ ทำต้นแบบและทดสอบกับลูกค้า ประสานกับทีมจัดซื้อและการตลาด',
    owner: 'ผู้จัดการทีมสินค้า',
    reviewedAt: '2026-10-21',
    roleWeights: { creator: 0.5, explorer: 0.3, connector: 0.2 },
    contextRanges: { autonomy: { min: 60, max: 100 }, collaboration: { min: 40, max: 80 } },
    managerTemplate: 'autonomous',
    teamTemplate: 'mixed',
    jobLine: 'creative',
    env: 'env-project',
    teamId: 'mer',
    targets: targetsFromTemplate('creative', 'env-project'),
    createdAt: '2026-10-21T13:00:00.000Z',
  },
]

interface State {
  roles: RoleSpec[]
  /** `${roleId}:${personId}` → stage note with reason and time */
  stages: Record<string, StageEntry>
  notes: Record<string, string>
  upsertRole: (r: RoleSpec) => void
  removeRole: (id: string) => void
  setStage: (roleId: string, personId: string, stage: Stage, reason: string) => void
  setNote: (roleId: string, personId: string, note: string) => void
  resetDemo: () => void
}

export const pipelineKey = (roleId: string, personId: string) => `${roleId}:${personId}`

const STORE_VERSION = 3

/** v0–2: roles had no duty weights/ranges/owner, and stages were bare strings without reasons. */
export const migrateSourcing = (persisted: unknown, version: number) => {
  const s = (persisted ?? {}) as { roles?: unknown[]; stages?: Record<string, unknown>; notes?: Record<string, string> }
  if (version >= STORE_VERSION) return s as Partial<State>
  const roles = Array.isArray(s.roles) ? (s.roles as Parameters<typeof upgradeRole>[0][]).filter((r) => r && typeof r.id === 'string').map(upgradeRole) : seedRoles()
  const stages: Record<string, StageEntry> = {}
  for (const [k, v] of Object.entries(s.stages ?? {})) {
    if (typeof v === 'string') stages[k] = { stage: v as Stage, reason: '', at: '' }
    else if (v && typeof v === 'object' && 'stage' in v) stages[k] = v as StageEntry
  }
  return { roles, stages, notes: s.notes ?? {} } as Partial<State>
}

export const useSourcing = create<State>()(
  persist(
    (set) => ({
      roles: seedRoles(),
      stages: {},
      notes: {},
      upsertRole: (r) =>
        set((s) => ({ roles: s.roles.some((x) => x.id === r.id) ? s.roles.map((x) => (x.id === r.id ? r : x)) : [r, ...s.roles] })),
      removeRole: (id) => set((s) => ({ roles: s.roles.filter((r) => r.id !== id) })),
      setStage: (roleId, personId, stage, reason) =>
        set((s) => ({ stages: { ...s.stages, [pipelineKey(roleId, personId)]: { stage, reason, at: new Date().toISOString() } } })),
      setNote: (roleId, personId, note) => set((s) => ({ notes: { ...s.notes, [pipelineKey(roleId, personId)]: note } })),
      resetDemo: () => set({ roles: seedRoles(), stages: {}, notes: {} }),
    }),
    { name: 'workfit-sourcing-v2', version: STORE_VERSION, migrate: migrateSourcing, storage: createJSONStorage(() => localStorage) },
  ),
)
