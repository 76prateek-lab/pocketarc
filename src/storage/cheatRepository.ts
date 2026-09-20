import type { PocketGBADatabase } from '@/storage/db'
import { db } from '@/storage/db'
import type { CheatRecord } from '@/storage/schema'
import { createId } from '@/utils/createId'

export class CheatRepository {
  constructor(private readonly database: PocketGBADatabase = db) {}
  forGame(gameId: string) { return this.database.cheats.where('gameId').equals(gameId).sortBy('createdAt') }
  async add(gameId: string, name: string, code: string) {
    const cleanName = name.trim(); const cleanCode = code.trim()
    if (!cleanName) throw new Error('Enter a cheat name.')
    if (!cleanCode || cleanCode.length > 512) throw new Error('Enter a valid cheat code up to 512 characters.')
    const now = Date.now(); const record: CheatRecord = { id: createId(), gameId, name: cleanName, code: cleanCode, enabled: false, createdAt: now, updatedAt: now }
    await this.database.cheats.add(record); return record
  }
  update(id: string, changes: Partial<Pick<CheatRecord, 'name' | 'code' | 'enabled'>>) { return this.database.cheats.update(id, { ...changes, updatedAt: Date.now() }) }
  delete(id: string) { return this.database.cheats.delete(id) }
  deleteForGame(gameId: string) { return this.database.cheats.where('gameId').equals(gameId).delete() }
}

export const cheatRepository = new CheatRepository()
