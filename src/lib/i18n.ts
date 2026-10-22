import { useCallback, useEffect } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

/* ------------------------------------------------------------------------------------------------
 * Two languages, Thai first. Content lives as { th, en } pairs next to the data it describes, so a
 * question, a persona or an insight can never exist in one language only.
 * ---------------------------------------------------------------------------------------------- */

export type Lang = 'th' | 'en'

export interface T {
  th: string
  en: string
}

export const tt = (th: string, en: string): T => ({ th, en })

interface LangState {
  lang: Lang
  setLang: (l: Lang) => void
}

export const useLangStore = create<LangState>()(
  persist((set) => ({ lang: 'th', setLang: (lang) => set({ lang }) }), {
    name: 'workfit-lang',
    storage: createJSONStorage(() => localStorage),
  }),
)

export const useLang = () => useLangStore((s) => s.lang)

/**
 * `t({ th, en })` picks the current language; `t('ไทย', 'English')` is the inline form for UI copy.
 */
export const useT = () => {
  const lang = useLang()
  return useCallback(
    (a: T | string, en?: string): string => (typeof a === 'object' ? a[lang] : lang === 'en' ? (en ?? a) : a),
    [lang],
  )
}

/** Keeps <html lang> and the tab title in sync for screen readers, fonts and spell-check. */
export const useHtmlLang = () => {
  const lang = useLang()
  useEffect(() => {
    document.documentElement.lang = lang
    document.title = lang === 'en' ? 'Workfit — Know the working you' : 'Workfit — รู้จักตัวตนการทำงานแบบคนไทย'
  }, [lang])
}
