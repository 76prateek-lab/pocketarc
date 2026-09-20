import type { PocketGBADatabase } from '@/storage/db'
import { db } from '@/storage/db'
import type { SaveRecord } from '@/storage/schema'
import { binarySize, toStoredBinary, type StoredBinary } from '@/storage/binary'
import { createId } from '@/utils/createId'

export class SaveRepository {
  constructor(private readonly database: PocketGBADatabase = db) {}

  getForGame(gameId: string) { return this.database.saves.where('gameId').equals(gameId).first() }
  list() { return this.database.saves.orderBy('updatedAt').reverse().toArray() }

  async putForGame(gameId: string, data: StoredBinary, hash?: string) {
    if (binarySize(data) === 0) throw new Error('An empty save cannot replace the stored save.')
    const existing = await this.getForGame(gameId)
    const record: SaveRecord = {
      id: existing?.id ?? createId(),
      gameId,
      data: await toStoredBinary(data),
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
      ...(hash ? { hash } : {}),
    }
    await this.database.saves.put(record)
    return record
  }

  deleteForGame(gameId: string) { return this.database.saves.where('gameId').equals(gameId).delete() }
}

export const saveRepository = new SaveRepository()
