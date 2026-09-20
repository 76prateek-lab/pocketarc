import { useEffect, useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { coverRepository } from '@/storage/coverRepository'
import { toBlob } from '@/storage/binary'

export function useCoverUrl(coverId?: string, fallbackUrl?: string) {
  const cover = useLiveQuery(() => coverId ? coverRepository.get(coverId) : undefined, [coverId])
  const objectUrl = useMemo(() => cover?.blob ? URL.createObjectURL(toBlob(cover.blob, cover.mimeType)) : undefined, [cover])
  useEffect(() => objectUrl ? () => URL.revokeObjectURL(objectUrl) : undefined, [objectUrl])
  return objectUrl ?? fallbackUrl
}
