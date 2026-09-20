import type { PocketGBADatabase } from '@/storage/db'
import { db } from '@/storage/db'
import { toStoredBinary } from '@/storage/binary'
import { createId } from '@/utils/createId'

export const MAX_COVER_FILE_SIZE = 10 * 1024 * 1024

export class CoverRepository {
  constructor(private readonly database: PocketGBADatabase = db) {}

  get(id: string) { return this.database.covers.get(id) }
  forGame(gameId: string) { return this.database.covers.where('gameId').equals(gameId).first() }

  async replaceForGame(gameId: string, file: Blob) {
    if (!file.type.startsWith('image/')) throw new Error('Choose a valid image file.')
    if (file.size === 0) throw new Error('The cover image is empty.')
    if (file.size > MAX_COVER_FILE_SIZE) throw new Error('Cover images must be 10 MB or smaller.')
    const stored = await toStoredBinary(file)
    return this.database.transaction('rw', [this.database.covers, this.database.games], async () => {
      const existing = await this.forGame(gameId)
      const id = existing?.id ?? createId()
      await this.database.covers.put({ id, gameId, blob: stored, mimeType: file.type, updatedAt: Date.now() })
      await this.database.games.update(gameId, { coverId: id })
      return id
    })
  }

  async removeForGame(gameId: string) {
    await this.database.transaction('rw', [this.database.covers, this.database.games], async () => {
      await this.database.covers.where('gameId').equals(gameId).delete()
      await this.database.games.update(gameId, { coverId: undefined })
    })
  }
}

export const coverRepository = new CoverRepository()
