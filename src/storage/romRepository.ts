import type { PocketGBADatabase } from '@/storage/db'
import { db } from '@/storage/db'
import type { RomRecord } from '@/storage/schema'

export class RomRepository {
  constructor(private readonly database: PocketGBADatabase = db) {}

  get(id: string) { return this.database.roms.get(id) }
  findByHash(hash: string) { return this.database.roms.where('hash').equals(hash).first() }
  add(record: RomRecord) { return this.database.roms.add(record) }
  remove(id: string) { return this.database.roms.delete(id) }
}

export const romRepository = new RomRepository()
