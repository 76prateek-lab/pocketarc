import type { ColorTheme } from '@/types/settings'

const THEME_KEY = 'pocketgba-color-theme'
export type ResolvedTheme = Exclude<ColorTheme, 'system'>

export function resolveTheme(theme: ColorTheme): ResolvedTheme {
  if (theme !== 'system') return theme
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme: ColorTheme) {
  const resolved = resolveTheme(theme)
  document.documentElement.dataset.theme = resolved
  document.documentElement.style.colorScheme = resolved
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute('content', resolved === 'dark' ? '#0A0A0A' : '#FAFAFA')
  try { localStorage.setItem(THEME_KEY, theme) } catch { /* IndexedDB remains the source of truth. */ }
  window.dispatchEvent(new CustomEvent('pocketgba-theme-change', { detail: resolved }))
  return resolved
}

export function initializeTheme() {
  let theme: ColorTheme = 'system'
  try { const stored = localStorage.getItem(THEME_KEY); if (stored === 'light' || stored === 'dark' || stored === 'system') theme = stored } catch { /* Use the system preference. */ }
  applyTheme(theme)
}
