import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useGames } from '@/hooks/useGames'
import { useAppSettings } from '@/hooks/useSettings'
import { routes } from '@/routes/routes'

const SESSION_KEY = 'pocketgba-launch-last-checked'

export function LaunchLastGame() {
  const games = useGames(); const settings = useAppSettings(); const location = useLocation(); const navigate = useNavigate()
  useEffect(() => {
    if (!games || !settings || location.pathname !== routes.home || sessionStorage.getItem(SESSION_KEY)) return
    sessionStorage.setItem(SESSION_KEY, 'true')
    if (!settings.general.launchLastGame) return
    const latest = games.filter((game) => game.lastPlayedAt).sort((a, b) => (b.lastPlayedAt ?? 0) - (a.lastPlayedAt ?? 0))[0]
    if (latest) navigate(routes.play(latest.id), { replace: true })
  }, [games, location.pathname, navigate, settings])
  return null
}
