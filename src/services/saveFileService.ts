import { saveRepository } from '@/storage/saveRepository'
import { binarySize, toBlob } from '@/storage/binary'

const MAX_SAVE_SIZE = 1024 * 1024

export async function importSaveFile(gameId: string, file: File) {
  if (!file.name.toLowerCase().endsWith('.sav')) throw new Error('Choose a .sav file.')
  if (file.size === 0) throw new Error('The selected save file is empty.')
  if (file.size > MAX_SAVE_SIZE) throw new Error('The selected save is larger than the supported 1 MB limit.')
  return saveRepository.putForGame(gameId, file)
}

export async function exportSaveFile(gameId: string, fileName: string) {
  const save = await saveRepository.getForGame(gameId)
  if (!save || !binarySize(save.data)) throw new Error('No normal save exists for this game.')
  const url = URL.createObjectURL(toBlob(save.data))
  try {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `${fileName.replace(/\.[^.]+$/, '')}.sav`
    anchor.click()
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }
}
