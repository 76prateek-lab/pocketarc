import { useLiveQuery } from 'dexie-react-hooks'
import { resolveGameSettings, settingsService } from '@/services/settingsService'

export function useAppSettings() { return useLiveQuery(() => settingsService.getAppSettings(false), []) }
export function useResolvedGameSettings(gameId?: string) {
  return useLiveQuery(async () => { const global = await settingsService.getAppSettings(false); const game = gameId ? await settingsService.getGameSettings(gameId, false) : undefined; return { global, game, resolved: resolveGameSettings(global, game) } }, [gameId])
}
