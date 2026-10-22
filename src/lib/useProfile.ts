import { useMemo } from 'react'
import { DEMO_CANDIDATES, DEMO_STAFF, type StaffMember } from '@/domain/demo'
import type { Candidate } from '@/domain/sourcing'
import { LIKERT_SEQUENCE, FORCED_BLOCKS, SCENARIOS, TOTAL_STEPS } from '@/domain/items'
import { summarisePeers } from '@/domain/peer'
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
      observedDelivery: peers?.delivery ?? Math.round(profile.scores.C * 0.7 + profile.scores.H * 0.3),
      isYou: true,
    }
    return [you, ...DEMO_STAFF]
  }, [profile, consent, name, peers])
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
          observedDelivery: 0,
          external: true,
          source: { th: 'ลิงก์เชิญ', en: 'Invite link' },
          isYou: true,
        },
        ...external,
      ]
    }
    return [...internal, ...external]
  }, [staff, profile, name, invitedRole])
}

/** Self vs. others for the signed-in person; `delivery` feeds the talk-vs-do check once raters exist. */
export const usePeerSummary = () => {
  const profile = useProfile()
  const ratings = useAssessment((s) => s.peerRatings)
  return useMemo(() => (profile ? summarisePeers(profile.scores, ratings) : null), [profile, ratings])
}
