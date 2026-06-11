'use client'

import { useEffect } from 'react'

/** Syncs CSS custom properties with the visual viewport for fixed overlays on mobile. */
export function useFixedViewportInsets() {
  useEffect(() => {
    const root = document.documentElement

    const sync = () => {
      const vv = window.visualViewport
      if (!vv) {
        root.style.setProperty('--vv-height', '100dvh')
        root.style.setProperty('--vv-offset-top', '0px')
        root.style.setProperty('--vv-offset-bottom', '0px')
        return
      }

      const offsetTop = Math.max(0, vv.offsetTop)
      const offsetBottom = Math.max(
        0,
        window.innerHeight - vv.offsetTop - vv.height,
      )

      root.style.setProperty('--vv-height', `${vv.height}px`)
      root.style.setProperty('--vv-offset-top', `${offsetTop}px`)
      root.style.setProperty('--vv-offset-bottom', `${offsetBottom}px`)
    }

    sync()
    window.visualViewport?.addEventListener('resize', sync)
    window.visualViewport?.addEventListener('scroll', sync)
    window.addEventListener('resize', sync)
    window.addEventListener('orientationchange', sync)

    return () => {
      window.visualViewport?.removeEventListener('resize', sync)
      window.visualViewport?.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
      window.removeEventListener('orientationchange', sync)
      root.style.removeProperty('--vv-height')
      root.style.removeProperty('--vv-offset-top')
      root.style.removeProperty('--vv-offset-bottom')
    }
  }, [])
}
