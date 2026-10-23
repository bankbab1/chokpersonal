import { ArrowRight, BookOpen, Check, Copy, Heart, House, Layers, PartyPopper, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { characterOf, groupByKey } from '@/domain/characters'
import { workfitCode } from '@/domain/code'
import { levelInfo, LEVEL_ORDER, levelRank } from '@/domain/levels'
import { ROLE_ACTIVITY } from '@/domain/roleActivity'
import type { Classification } from '@/domain/roles'
import type { Scores } from '@/domain/types'
import { useT } from '@/lib/i18n'
import { useAssessment } from '@/store/assessment'
import { CodeCharacter, tint } from '../character/RoleCharacter'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { CodeLetters, TribeChip } from './WorkfitCodeCard'

/**
 * The result header, 16Personalities-style: the trait chips, the character name, the code in the group
 * colour and the character art on a tinted panel. Everything here comes from the one Workfit Code.
 */
export function CharacterHero({ scores, name, roles }: { scores: Scores; name: string; roles: Classification | null }) {
  const t = useT()
  const wc = workfitCode(scores)
  const ch = characterOf(scores)
  const g = groupByKey(ch.group)
  const completed = useAssessment((s) => s.completedLevel) ?? 'standard'
  const setLevel = useAssessment((s) => s.setLevel)
  const deeper = LEVEL_ORDER[levelRank(completed) + 1]
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const line = `${wc.code} · ${t(ch.name)} · ${t(g.name)}`
  const eyebrow = name ? t(`ผลของ${name.startsWith('คุณ') ? name : `คุณ${name}`}`, `${name}'s result`) : t('ผลของคุณ', 'Your result')
  return (
    <Card className="overflow-hidden p-0">
      <div className="grid items-center gap-2 md:grid-cols-[1fr_auto]" style={{ background: `linear-gradient(135deg, ${tint(g.color, 0.9)}, transparent 70%)` }}>
        <div className="order-2 p-6 pt-2 md:order-1 md:p-8">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{eyebrow}</div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {wc.letters.slice(0, 4).map((l) => (
              <span key={l.axis.id} className="rounded-md bg-white/80 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                {t(l.pole.name)}
              </span>
            ))}
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{t(ch.name)}</h1>
          <div className="mt-1 text-lg font-semibold" style={{ color: g.color }}>
            {ch.key} · {t(g.name)}
          </div>
          <p className="mt-2 max-w-xl text-slate-600 dark:text-slate-300">{t(ch.tagline)}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-200/80 pt-4 dark:border-white/[0.08]">
            <CodeLetters scores={scores} size="sm" />
            <span className="flex flex-wrap gap-1.5">
              <TribeChip tribe={wc.crew} kind="crew" />
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {t(`${ch.key} = ตัวละครของคุณ · -${wc.context} = วิธีทำงานกับคนแบบไทย · แตะตัวอักษรเพื่อดูความหมาย`, `${ch.key} = your character · -${wc.context} = how you work with people, Thai-style · tap a letter for its meaning`)}
          </p>
          {roles?.primary && (
            <p className="mt-3 text-sm">
              <span className="text-slate-500 dark:text-slate-400">{t('งานที่อยากทำมากขึ้น: ', 'Work you want more of: ')}</span>
              <span className="font-medium">
                {[roles.primary, roles.secondary]
                  .filter(Boolean)
                  .map((id) => t(ROLE_ACTIVITY[id!]))
                  .join(' · ')}
              </span>
            </p>
          )}
        </div>
        <div className="order-1 flex justify-center pt-6 md:order-2 md:p-8">
          <CodeCharacter code={ch.key} size={180} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-200/80 px-6 py-3 md:px-8 dark:border-white/[0.08]">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium dark:bg-white/[0.06]">
          <Layers size={13} /> {t('ระดับ', 'Level')} {t(levelInfo(completed).name)}
        </span>
        {deeper && (
          <Button
            size="sm"
            variant="ghost"
            iconRight={ArrowRight}
            onClick={() => {
              setLevel(deeper)
              navigate('/test')
            }}
          >
            {t(`แม่นขึ้นด้วยระดับ${levelInfo(deeper).name.th}`, `More accurate: ${levelInfo(deeper).name.en}`)}
          </Button>
        )}
        <span className="flex-1" />
        <Button size="sm" variant="ghost" icon={BookOpen} to={`/personas/${ch.key}`}>
          {t('อ่านเรื่องตัวละครนี้', 'Read this character')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          icon={copied ? Check : Copy}
          onClick={() => {
            void navigator.clipboard?.writeText(line)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1600)
          }}
        >
          {copied ? t('คัดลอกแล้ว', 'Copied') : t('คัดลอก', 'Copy')}
        </Button>
      </div>
    </Card>
  )
}

/** Strengths and watch-outs at a glance, with a link to the full chaptered page. */
export function CharacterSummaryCard({ scores }: { scores: Scores }) {
  const t = useT()
  const ch = characterOf(scores)
  const g = groupByKey(ch.group)
  return (
    <Card>
      <p className="leading-relaxed text-slate-700 dark:text-slate-200">{t(ch.overview)}</p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <div className="text-sm font-semibold">{t('จุดแข็ง', 'Strengths')}</div>
          <ul className="mt-2 space-y-1.5 text-sm">
            {ch.strengths.map((x) => (
              <li key={x.en} className="flex gap-2">
                <Check size={16} className="mt-0.5 shrink-0" style={{ color: g.color }} />
                {t(x)}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className="text-sm font-semibold">{t('เมื่อมากเกินไป', 'When overdone')}</div>
          <ul className="mt-2 space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
            {ch.watchouts.map((x) => (
              <li key={x.en} className="flex gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500" />
                {t(x)}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <Button className="mt-5" variant="secondary" iconRight={ArrowRight} to={`/personas/${ch.key}`}>
        {t('อ่านทุกบท: ทีม หัวหน้า เพื่อน ครอบครัว คู่ชีวิต', 'All chapters: team, manager, friends, family, partner')}
      </Button>
    </Card>
  )
}

/** Life outside work for your character: friends & gang, family, social events, life partner. */
export function LifeOutsideWorkCard({ scores }: { scores: Scores }) {
  const t = useT()
  const ch = characterOf(scores)
  const g = groupByKey(ch.group)
  const areas = [
    { icon: UsersRound, title: t('กับเพื่อนและแก๊ง', 'With friends & your gang'), body: ch.friends },
    { icon: House, title: t('ในครอบครัว', 'In the family'), body: ch.family },
    { icon: PartyPopper, title: t('ในสังคมและงานเลี้ยง', 'Socialising & parties'), body: ch.social },
    { icon: Heart, title: t('กับคนรัก', 'With a partner'), body: ch.partner },
  ]
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold">{t('นอกที่ทำงาน', 'Outside work')}</h2>
        <span className="text-xs font-medium" style={{ color: g.color }}>
          {t(ch.name)} · {ch.key}
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {areas.map((a) => (
          <div key={a.title} className="rounded-xl p-4" style={{ background: tint(g.color, 0.92) }}>
            <div className="flex items-center gap-2 font-semibold text-slate-900">
              <a.icon size={18} style={{ color: g.color }} /> {a.title}
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{t(a.body)}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {t('เป็นแนวโน้มของตัวละคร ไม่ใช่คำทำนาย แต่ละคนยังต่างกันได้มาก', 'Tendencies of the character, not predictions. People still differ a lot.')}
      </p>
    </Card>
  )
}
