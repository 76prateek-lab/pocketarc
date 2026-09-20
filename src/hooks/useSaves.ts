import { useEffect, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { saveRepository } from '@/storage/saveRepository'
import { saveStateRepository } from '@/storage/saveStateRepository'
import { screenshotRepository } from '@/storage/screenshotRepository'
import { toBlob } from '@/storage/binary'

export function useNormalSave(gameId?: string) {
  return useLiveQuery(() => gameId ? saveRepository.getForGame(gameId) : undefined, [gameId])
}

export function useSaveStates(gameId?: string) {
  return useLiveQuery(() => gameId ? saveStateRepository.forGame(gameId) : [], [gameId], [])
}

export function useScreenshots(gameId?: string) {
  return useLiveQuery(() => gameId ? screenshotRepository.forGame(gameId) : [], [gameId], [])
}

export function useScreenshotUrl(screenshotId?: string) {
  const record = useLiveQuery(() => screenshotId ? screenshotRepository.get(screenshotId) : undefined, [screenshotId])
  const url = useMemo(() => record?.blob ? URL.createObjectURL(toBlob(record.blob, 'image/png')) : undefined, [record])
  useEffect(() => {
    if (!url) return
    return () => URL.revokeObjectURL(url)
  }, [url])
  return url
}
