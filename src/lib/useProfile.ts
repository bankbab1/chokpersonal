import { useMemo } from 'react'
import { DEMO_CANDIDATES, DEMO_STAFF, type StaffMember } from '@/domain/demo'
import type { Candidate } from '@/domain/sourcing'
import { LIKERT_SEQUENCE, FORCED_BLOCKS, SCENARIOS, TOTAL_STEPS } from '@/domain/items'
import { summarisePeers } from '@/domain/peer'
import { classify, ROLE_ITEMS, scoreRoles, type RoleScores } from '@/domain/roles'
import { computeProfile } from '@/domain/scoring'
import { useAssessment } from '@/store/assessment'

export const useProgress = () => {
  const answers = useAssessment((s) => s.answers)
  return useMemo(() => {
    const likert = LIKERT_SEQUENCE.filter((e) => answers.likert[e.item.id]).length
    const forced = FORCED_BLOCKS.filter((b) => answers.forced[b.id]?.most && answers.forced[b.id]?.least).length
    const scenario = SCENARIOS.filter((s) => answers.scenario[s.id]?.most && answers.scenario[s.id]?.least).length
    const done = likert + forced + scenario
    return { likert, forced, scenario, done, total: TOTAL_STEPS, pct: Math.round((done / TOTAL_STEPS) * 100) }
  }, [answers])
}

/** The signed-in person's profile, or null until the assessment is complete. */
export const useProfile = () => {
  const answers = useAssessment((s) => s.answers)
  const completedAt = useAssessment((s) => s.completedAt)
  return useMemo(() => (completedAt ? computeProfile(answers) : null), [answers, completedAt])
}

/** Demo staff plus "you" when you've finished and opted in to the team/HR view. */
export const useStaffPool = (): StaffMember[] => {
  const profile = useProfile()
  const name = useAssessment((s) => s.name)
  const consent = useAssessment((s) => s.consent)
  const ratings = useAssessment((s) => s.peerRatings)
  const roleResult = useRoleResult()
  const context = useAssessment((s) => s.context)
  const growthRoles = useAssessment((s) => s.growthRoles)
  const peers = useMemo(() => (profile && ratings.length ? summarisePeers(profile.scores, ratings) : null), [profile, ratings])
  return useMemo(() => {
    if (!profile || !consent.team) return DEMO_STAFF
    const you: StaffMember = {
      id: 'you',
      name: name || 'คุณ',
      team: 'ctw',
      role: { th: 'ผู้ทำแบบทดสอบ', en: 'Test taker' },
      years: 3,
      openToMove: consent.hr,
      scores: profile.scores,
      persona: profile.persona,
      roleScores: roleResult?.scores ?? null,
      roleClass: roleResult?.classification ?? null,
      context,
      growthRoles,
      observedDelivery: peers?.delivery ?? Math.round(profile.scores.C * 0.7 + profile.scores.H * 0.3),
      isYou: true,
    }
    return [you, ...DEMO_STAFF]
  }, [profile, consent, name, peers, roleResult, context, growthRoles])
}

/**
 * Everyone a recruiter can consider: internal staff who opted in to internal moves, plus external
 * applicants. "You" join as an applicant when you came through an invite link.
 */
export const useCandidatePool = (): Candidate[] => {
  const staff = useStaffPool()
  const profile = useProfile()
  const name = useAssessment((s) => s.name)
  const invitedRole = useAssessment((s) => s.invitedRole)
  const roleResult = useRoleResult()
  const context = useAssessment((s) => s.context)
  const growthRoles = useAssessment((s) => s.growthRoles)
  return useMemo(() => {
    const internal: Candidate[] = staff
      .filter((m) => m.openToMove && !(invitedRole && m.isYou))
      .map((m) => ({ ...m, external: false }))
    const external: Candidate[] = DEMO_CANDIDATES
    if (profile && invitedRole) {
      return [
        ...internal,
        {
          id: 'you',
          name: name || 'คุณ',
          team: '',
          role: { th: 'ผู้สมัครผ่านลิงก์เชิญ', en: 'Invited applicant' },
          currentRole: { th: 'ผู้สมัครผ่านลิงก์เชิญ', en: 'Invited applicant' },
          years: 0,
          openToMove: true,
          scores: profile.scores,
          persona: profile.persona,
          roleScores: roleResult?.scores ?? null,
          roleClass: roleResult?.classification ?? null,
          context,
          growthRoles,
          observedDelivery: 0,
          external: true,
          source: { th: 'ลิงก์เชิญ', en: 'Invite link' },
          isYou: true,
        },
        ...external,
      ]
    }
    return [...internal, ...external]
  }, [staff, profile, name, invitedRole, roleResult, context, growthRoles])
}

/** Self vs. others for the signed-in person; `delivery` feeds the talk-vs-do check once raters exist. */
export const usePeerSummary = () => {
  const profile = useProfile()
  const ratings = useAssessment((s) => s.peerRatings)
  return useMemo(() => (profile ? summarisePeers(profile.scores, ratings) : null), [profile, ratings])
}

/** Role-interest result (12 types). Null until all 48 items are answered — never a partial result. */
export const useRoleResult = () => {
  const roles = useAssessment((s) => s.roles)
  return useMemo(() => {
    const r = scoreRoles(roles)
    if (!r.complete) return null
    const scores = r.scores as RoleScores
    return { scores, raw: r.raw as RoleScores, classification: classify(scores) }
  }, [roles])
}

export const useRoleProgress = () => {
  const roles = useAssessment((s) => s.roles)
  return useMemo(() => {
    const done = ROLE_ITEMS.filter((q) => roles[q.id]).length
    return { done, total: ROLE_ITEMS.length }
  }, [roles])
}
