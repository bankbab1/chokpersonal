import { tt, type T } from '@/lib/i18n'
import type { RoleTypeId } from './roles'

/**
 * How the 12 role-interest types are shown next to the 16 code characters: as ACTIVITIES you want to
 * do ("งานวิเคราะห์"), not as people. A character answers "who you are at work" (from the code);
 * a role activity answers "what work you want more of" (Professional level, 48 items). Keeping the
 * labels different stops "The Analyst" (character) being confused with the analyst role interest.
 */
export const ROLE_ACTIVITY: Record<RoleTypeId, T> = {
  navigator: tt('งานวางทิศทาง', 'Setting direction'),
  driver: tt('งานขับเคลื่อนให้เสร็จ', 'Driving delivery'),
  analyst: tt('งานวิเคราะห์ข้อมูล', 'Analysing data'),
  architect: tt('งานออกแบบระบบ', 'Designing systems'),
  creator: tt('งานสร้างสรรค์', 'Creating'),
  explorer: tt('งานทดลองสิ่งใหม่', 'Experimenting'),
  connector: tt('งานประสานคน', 'Coordinating people'),
  coach: tt('งานพัฒนาคน', 'Developing people'),
  carer: tt('งานดูแลและบริการ', 'Caring & service'),
  persuader: tt('งานนำเสนอและเจรจา', 'Presenting & negotiating'),
  guardian: tt('งานรักษาคุณภาพ', 'Quality & risk'),
  organizer: tt('งานจัดระเบียบ', 'Organising'),
}
