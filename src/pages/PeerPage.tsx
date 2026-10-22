import { ArrowRight, Check, ClipboardPaste, Copy, Eye, EyeOff, Link2, Play, Trash2, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { DimensionBars } from '@/components/charts/DimensionBars'
import { SayDoMeter } from '@/components/charts/SayDoMeter'
import { Button } from '@/components/ui/Button'
import { Card, Eyebrow } from '@/components/ui/Card'
import { sayDo } from '@/domain/insights'
import { demoRatings, makeInvite, parseResponseCode, RELATIONS } from '@/domain/peer'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'
import { usePeerSummary, useProfile } from '@/lib/useProfile'
import { useAssessment } from '@/store/assessment'

export function PeerPage() {
  const t = useT()
  const profile = useProfile()
  const { myId, name, peerRatings, addPeerRating, removePeerRating, setPeerRatings } = useAssessment()
  const peers = usePeerSummary()
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [copied, setCopied] = useState(false)

  if (!profile)
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <UsersRound size={40} className="mx-auto text-violet-500" />
        <h1 className="mt-4 text-2xl font-semibold">{t('ทำแบบทดสอบก่อน แล้วค่อยชวนคนรอบตัว', 'Take the test first, then invite others')}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {t('มุมมองคนรอบตัวจะถูกเทียบกับผลของคุณเอง จึงต้องมีผลของคุณก่อน', 'Peer ratings are compared with your own results, so those come first.')}
        </p>
        <Button className="mt-6" variant="glow" size="lg" to="/test" iconRight={ArrowRight}>
          {t('เริ่มทำแบบทดสอบ', 'Start the test')}
        </Button>
      </div>
    )

  const inviteUrl = `${window.location.origin}/rate/${makeInvite(myId, name || t('เพื่อนของคุณ', 'your colleague'))}`
  const lineShare = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(inviteUrl)}`
  const sd = sayDo(profile.scores, peers?.delivery)
  const blind = peers?.gaps.filter((g) => g.kind === 'blind-spot') ?? []
  const hidden = peers?.gaps.filter((g) => g.kind === 'hidden-strength') ?? []

  const importCode = () => {
    const r = parseResponseCode(code, myId)
    if (!r.ok) {
      setMsg({
        ok: false,
        text:
          r.reason === 'other-person'
            ? t('รหัสนี้เป็นของการประเมินคนอื่น', 'This code is for someone else’s rating')
            : t('รหัสไม่ถูกต้อง ลองคัดลอกใหม่ทั้งหมด', 'That code is not valid. Try copying it again in full.'),
      })
      return
    }
    const added = addPeerRating(r.rating)
    setMsg(added ? { ok: true, text: t(`เพิ่มการประเมินจาก ${r.rating.rater} แล้ว`, `Added the rating from ${r.rating.rater}`) } : { ok: false, text: t('เพิ่มรหัสนี้ไปแล้ว', 'This code was already added') })
    if (added) setCode('')
  }

  return (
    <div className="space-y-6">
      <div>
        <Eyebrow>{t('มุมมองคนรอบตัว · Peer view', 'Peer view')}</Eyebrow>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">{t('คนอื่นเห็นคุณแบบไหน', 'How others see you')}</h1>
        <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-300">
          {t(
            'งานวิจัยพบว่าการประเมินจากคนที่รู้จักเรา ทำนายผลงานได้ดีกว่าการประเมินตัวเอง และช่วยให้เห็นจุดบอดที่เรามองไม่เห็น ชวน 3–5 คนจากหลายมุม เช่น หัวหน้า เพื่อน และน้องในทีม',
            'Research shows ratings from people who know you predict job performance better than self-ratings, and reveal blind spots you cannot see. Invite 3–5 people from different angles: a manager, colleagues, juniors.',
          )}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card>
          <h2 className="flex items-center gap-2 font-semibold">
            <Link2 size={18} className="text-violet-500" /> {t('1 · ส่งลิงก์ให้คนที่รู้จักคุณ', '1 · Send this link to people who know you')}
          </h2>
          <div className="mt-3 break-all rounded-xl bg-slate-900/[0.04] p-3 font-mono text-xs dark:bg-white/[0.05]">{inviteUrl}</div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="primary"
              icon={copied ? Check : Copy}
              onClick={() => {
                void navigator.clipboard?.writeText(inviteUrl)
                setCopied(true)
                window.setTimeout(() => setCopied(false), 1600)
              }}
            >
              {copied ? t('คัดลอกแล้ว', 'Copied') : t('คัดลอกลิงก์', 'Copy link')}
            </Button>
            <a
              href={lineShare}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-[#06C755] px-3 text-xs font-semibold text-white hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
            >
              {t('แชร์ทาง LINE', 'Share on LINE')}
            </a>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {t(
              'ผู้ประเมินตอบ 16 ข้อ ใช้เวลาประมาณ 3 นาที ไม่ต้องสมัครสมาชิก เมื่อเสร็จจะได้รหัสคำตอบให้ส่งกลับมาหาคุณ',
              'Raters answer 16 items in about 3 minutes, with no sign-up. When done they get a response code to send back to you.',
            )}
          </p>
        </Card>

        <Card>
          <h2 className="flex items-center gap-2 font-semibold">
            <ClipboardPaste size={18} className="text-violet-500" /> {t('2 · วางรหัสคำตอบที่ได้รับ', '2 · Paste the response code you received')}
          </h2>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={3}
            placeholder="WF1.…"
            className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-3 font-mono text-base outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/15 sm:text-xs dark:border-white/10 dark:bg-white/5"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button size="sm" variant="primary" disabled={!code.trim()} onClick={importCode}>
              {t('เพิ่มการประเมิน', 'Add rating')}
            </Button>
            <Button size="sm" variant="ghost" icon={Play} onClick={() => setPeerRatings(demoRatings(profile.scores))} title={t('ใส่ผู้ประเมินตัวอย่าง 3 คนเพื่อดูหน้าตาผล', 'Add 3 sample raters to preview the results')}>
              {t('ใช้ตัวอย่าง', 'Use samples')}
            </Button>
            {msg && <span className={cn('text-xs', msg.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400')}>{msg.text}</span>}
          </div>
          {peerRatings.length > 0 && (
            <ul className="mt-4 space-y-1.5">
              {peerRatings.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-900/[0.03] px-3 py-1.5 text-sm dark:bg-white/[0.04]">
                  <span>
                    <span className="font-medium">{r.rater}</span>{' '}
                    <span className="text-xs text-slate-500 dark:text-slate-400">· {t(RELATIONS.find((x) => x.id === r.relation)?.name ?? { th: '', en: '' })}</span>
                  </span>
                  <Button variant="ghost" size="sm" iconOnly icon={Trash2} onClick={() => removePeerRating(r.id)} aria-label={t('ลบการประเมินนี้', 'Remove this rating')}>
                    {t('ลบการประเมินนี้', 'Remove this rating')}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {peers && peers.n > 0 && (
        <>
          <div className="grid gap-5 lg:grid-cols-3">
            <Card>
              <div className="text-sm font-semibold">{t('คุณเห็นตัวเองตรงกับคนอื่นแค่ไหน', 'How closely your self-view matches')}</div>
              <div className="tabular mt-3 text-4xl font-semibold">
                {peers.agreement === undefined ? '—' : `${Math.round(Math.max(0, peers.agreement) * 100)}%`}
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {t(`จาก ${peers.n} คน · ยิ่งสูงยิ่งเห็นตัวเองตรงกับที่คนอื่นเห็น`, `From ${peers.n} rater(s) · higher means you see yourself as others do`)}
              </p>
              {peers.n < 3 && <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">{t('ควรมีอย่างน้อย 3 คนเพื่อให้ผลเชื่อถือได้', 'Aim for at least 3 raters for reliable results')}</p>}
            </Card>
            <Card>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <EyeOff size={16} className="text-orange-500" /> {t('จุดบอด', 'Blind spots')}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('สิ่งที่คุณเห็นในตัวเองมากกว่าที่คนอื่นเห็น', 'Traits you rate higher than others do')}</p>
              <ul className="mt-3 space-y-2">
                {blind.length === 0 && <li className="text-sm text-slate-500 dark:text-slate-400">{t('ไม่มี', 'None')}</li>}
                {blind.map((g) => (
                  <li key={g.dim} className="flex justify-between gap-2 text-sm">
                    <span>{t(g.name)}</span>
                    <span className="tabular text-xs text-slate-500 dark:text-slate-400">
                      {g.self} → {g.others}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
            <Card>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Eye size={16} className="text-emerald-500" /> {t('จุดแข็งที่ซ่อนอยู่', 'Hidden strengths')}
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t('สิ่งที่คนอื่นเห็นในตัวคุณมากกว่าที่คุณคิด', 'Traits others see more of than you do')}</p>
              <ul className="mt-3 space-y-2">
                {hidden.length === 0 && <li className="text-sm text-slate-500 dark:text-slate-400">{t('ไม่มี', 'None')}</li>}
                {hidden.map((g) => (
                  <li key={g.dim} className="flex justify-between gap-2 text-sm">
                    <span>{t(g.name)}</span>
                    <span className="tabular text-xs text-slate-500 dark:text-slate-400">
                      {g.self} → {g.others}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="grid gap-5 lg:grid-cols-[2fr_1fr]">
            <Card>
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold">{t('ตัวคุณ ● เทียบกับคนรอบตัว ◆', 'You ● vs others ◆')}</h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">{t('◆ แสดงเฉพาะมิติที่ผู้ประเมินตอบ', '◆ only on dimensions raters answered')}</span>
              </div>
              <div className="mt-5">
                <DimensionBars scores={profile.scores} compare={peers.others} />
              </div>
            </Card>
            <Card className="self-start">
              <h2 className="font-semibold">{t('พูด vs ทำ จากมุมมองคนอื่น', 'Say vs do, as others see it')}</h2>
              <div className="mt-4">
                <SayDoMeter value={sd} observed={peers.delivery !== undefined} />
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
