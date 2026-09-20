import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect } from 'react'
import { catalogService } from '@/services/catalogService'
import { gameRepository } from '@/storage/gameRepository'
import { romRepository } from '@/storage/romRepository'

export function useGames() {
  useEffect(() => { void catalogService.syncMetadata().catch((error) => { if (import.meta.env.DEV) console.error('Catalog metadata could not be synchronized.', error) }) }, [])
  return useLiveQuery(() => gameRepository.list(), [])
}

export function useGame(gameId?: string) {
  return useLiveQuery(async () => gameId ? (await gameRepository.get(gameId) ?? null) : null, [gameId])
}

export function useSaveStateCount(gameId?: string) {
  return useLiveQuery(() => gameId ? gameRepository.countSaveStates(gameId) : 0, [gameId], 0)
}

export function useRomInstalled(romId?: string) {
  return useLiveQuery(async () => romId ? Boolean(await romRepository.get(romId)) : false, [romId])
}
