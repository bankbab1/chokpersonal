import { Check, Copy, HeartHandshake, Lock, Send } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Card, Eyebrow } from '@/components/ui/Card'
import { LIKERT_SCALE } from '@/domain/items'
import { makeResponseCode, PEER_ITEMS, readInvite, RELATIONS, type Relation } from '@/domain/peer'
import { cn } from '@/lib/cn'
import { useT } from '@/lib/i18n'

/** The page a rater opens from an invite link: 16 items about the person, then a response code to send back. */
export function RatePage() {
  const t = useT()
  const { token = '' } = useParams()
  const invite = useMemo(() => readInvite(token), [token])
  const [rater, setRater] = useState('')
  const [relation, setRelation] = useState<Relation | ''>('')
  const [answers, setAnswers] = useState<number[]>(() => PEER_ITEMS.map(() => 0))
  const [code, setCode] = useState('')
  const [copied, setCopied] = useState(false)

  if (!invite)
    return (
      <Card className="mx-auto max-w-xl text-center">
        <h1 className="text-xl font-semibold">{t('ลิงก์ไม่ถูกต้อง', 'This link is not valid')}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{t('ขอให้เจ้าของส่งลิงก์ใหม่อีกครั้ง', 'Ask the person to send the link again.')}</p>
      </Card>
    )

  const who = invite.name
  const done = answers.every((a) => a > 0) && relation !== ''
  const answered = answers.filter((a) => a > 0).length

  if (code)
    return (
      <div className="mx-auto max-w-xl animate-rise space-y-5">
        <Card className="text-center">
          <HeartHandshake size={40} className="mx-auto text-emerald-500" />
          <h1 className="mt-3 text-2xl font-semibold">{t('ขอบคุณที่ช่วยประเมิน', 'Thank you for rating')}</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">
            {t(`ส่งรหัสด้านล่างกลับไปให้ ${who} ทาง LINE หรืออีเมล`, `Send the code below back to ${who} by LINE or email.`)}
          </p>
          <div className="mt-4 break-all rounded-xl bg-slate-900/[0.04] p-3 text-left font-mono text-xs dark:bg-white/[0.05]">{code}</div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button
              variant="primary"
              icon={copied ? Check : Copy}
              onClick={() => {
                void navigator.clipboard?.writeText(code)
                setCopied(true)
                window.setTimeout(() => setCopied(false), 1600)
              }}
            >
              {copied ? t('คัดลอกแล้ว', 'Copied') : t('คัดลอกรหัส', 'Copy code')}
            </Button>
            <a
              href={`https://line.me/R/share?text=${encodeURIComponent(code)}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#06C755] px-4 text-sm font-semibold text-white hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
            >
              {t('ส่งทาง LINE', 'Send via LINE')}
            </a>
          </div>
          <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Lock size={12} /> {t(`${who} จะเห็นคะแนนรวมจากทุกคนเท่านั้น`, `${who} only sees combined scores from all raters`)}
          </p>
        </Card>
      </div>
    )

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <Eyebrow>{t('การประเมินจากคนรอบตัว', 'Peer rating')}</Eyebrow>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{t(`${who} ขอให้คุณช่วยประเมิน`, `${who} asked you to rate them`)}</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          {t(
            `ตอบจากสิ่งที่คุณเห็น ${who} ทำจริงในที่ทำงาน 16 ข้อ ประมาณ 3 นาที คำตอบของคุณจะถูกรวมกับคนอื่น`,
            `Answer from what you have actually seen ${who} do at work. 16 items, about 3 minutes. Your answers are combined with others’.`,
          )}
        </p>
      </div>

      <Card className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="text-sm font-medium">{t('ชื่อของคุณ (ไม่บังคับ)', 'Your name (optional)')}</span>
          <input
            value={rater}
            onChange={(e) => setRater(e.target.value)}
            placeholder={t('เช่น พี่นุ่น', 'e.g. Sam')}
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-base outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-500/15 sm:text-sm dark:border-white/10 dark:bg-white/5"
          />
        </label>
        <div>
          <span className="text-sm font-medium">{t(`คุณรู้จัก ${who} ในฐานะ`, `How do you know ${who}?`)}</span>
          <div className="mt-2 grid grid-cols-2 gap-1.5">
            {RELATIONS.map((r) => (
              <button
                key={r.id}
                type="button"
                aria-pressed={relation === r.id}
                onClick={() => setRelation(r.id)}
                className={cn(
                  'rounded-xl border px-2 py-2 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600',
                  relation === r.id ? 'border-violet-500 bg-violet-500/10' : 'border-slate-200 dark:border-white/10',
                )}
              >
                {t(r.name)}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {PEER_ITEMS.map((item, i) => (
          <Card key={item.id} className="p-4">
            <p className="font-medium">{t(item.text).replace('{name}', who)}</p>
            <div className="mt-3 grid grid-cols-6 gap-1.5" role="radiogroup" aria-label={t(item.text).replace('{name}', who)}>
              {LIKERT_SCALE.map((label, k) => {
                const v = k + 1
                const on = answers[i] === v
                return (
                  <button
                    key={label.en}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    aria-label={t(label)}
                    onClick={() => setAnswers((cur) => cur.map((a, j) => (j === i ? v : a)))}
                    className={cn(
                      'h-9 rounded-lg border text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-600',
                      on
                        ? v >= 4
                          ? 'border-violet-600 bg-violet-600 text-white'
                          : 'border-orange-500 bg-orange-500 text-white'
                        : 'border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400',
                    )}
                  >
                    {v}
                  </button>
                )
              })}
            </div>
            <div className="mt-1 flex justify-between text-[10px] text-slate-500 dark:text-slate-400">
              <span>{t(LIKERT_SCALE[0])}</span>
              <span>{t(LIKERT_SCALE[5])}</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 mt-6 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-lg shadow-slate-900/5 lg:bottom-4 dark:border-white/10 dark:bg-[#18181d] dark:shadow-black/40">
        <span className="tabular text-sm text-slate-600 dark:text-slate-300">
          {answered}/{PEER_ITEMS.length}
          {relation === '' && ` · ${t('เลือกความสัมพันธ์', 'choose a relationship')}`}
        </span>
        <Button
          variant="glow"
          icon={Send}
          disabled={!done}
          onClick={() => {
            setCode(makeResponseCode(invite.id, rater.trim() || t('ไม่ระบุชื่อ', 'Anonymous'), relation as Relation, answers))
            window.scrollTo({ top: 0, behavior: 'instant' })
          }}
        >
          {t('ส่งคำตอบ', 'Submit')}
        </Button>
      </div>
    </div>
  )
}
