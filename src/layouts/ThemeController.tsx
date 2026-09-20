import { useEffect } from 'react'
import { useAppSettings } from '@/hooks/useSettings'
import { applyTheme } from '@/services/themeService'

export function ThemeController() {
  const settings = useAppSettings()
  useEffect(() => {
    if (!settings) return
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    const update = () => applyTheme(settings.appearance.theme)
    update()
    if (settings.appearance.theme !== 'system') return
    media?.addEventListener?.('change', update)
    return () => media?.removeEventListener?.('change', update)
  }, [settings])
  return null
}
