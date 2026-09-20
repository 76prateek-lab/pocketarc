import { romRepository } from '@/storage/romRepository'
import { revokeRomUrl } from '@/emulator/cleanup'
import { toBlob } from '@/storage/binary'

export class RomUnavailableError extends Error {
  constructor() { super('The ROM for this game is unavailable on this device.') }
}

export interface LoadedRom {
  url: string
  release: () => void
}

export async function loadRomUrl(romId: string): Promise<LoadedRom> {
  const rom = await romRepository.get(romId)
  if (!rom?.blob) throw new RomUnavailableError()
  const url = URL.createObjectURL(toBlob(rom.blob, rom.mimeType))
  let released = false
  return {
    url,
    release() {
      if (released) return
      released = true
      revokeRomUrl(url)
    },
  }
}
