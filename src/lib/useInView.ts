import { useEffect, useRef, useState } from 'react'

/** True once the element has scrolled into view (stays true). Used to start entrance animations. */
export function useInView<E extends Element>(threshold = 0.25) {
  const ref = useRef<E>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    // Safety net: never leave content in its pre-animation state if the observer doesn't report
    // (e.g. a background tab), so dots can't get stuck on the centre line.
    const fallback = window.setTimeout(() => setSeen(true), 4000)
    return () => {
      io.disconnect()
      window.clearTimeout(fallback)
    }
  }, [seen, threshold])
  return [ref, seen] as const
}
