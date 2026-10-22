import { Button } from '@/components/ui/Button'
import { useT } from '@/lib/i18n'

export function NotFound() {
  const t = useT()
  return (
    <div className="grid min-h-[50vh] place-items-center text-center">
      <div>
        <div className="text-5xl font-semibold text-gradient">404</div>
        <p className="mt-2 text-slate-500">{t('ไม่พบหน้านี้', 'Page not found')}</p>
        <Button className="mt-6" variant="primary" to="/">
          {t('กลับหน้าแรก', 'Back to home')}
        </Button>
      </div>
    </div>
  )
}
