import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'
const KEY = 'workfit-theme'

/** UI.md §2: persist the explicit choice; follow the OS only until the user picks. */
export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(KEY)
      if (saved === 'light' || saved === 'dark') return saved
    } catch {
      /* storage blocked */
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })
  useEffect(() => {
    document.documentElement.style.colorScheme = theme
    document.body.style.background = theme === 'dark' ? '#07070d' : '#fbfaff'
  }, [theme])
  const toggle = () =>
    setTheme((t) => {
      const next = t === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(KEY, next)
      } catch {
        /* storage blocked */
      }
      return next
    })
  return { theme, toggle }
}
