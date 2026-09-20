import type { PocketGBADatabase } from '@/storage/db'
import { db } from '@/storage/db'

export class SettingsRepository {
  constructor(private readonly database: PocketGBADatabase = db) {}
  get(key: string) { return this.database.settings.get(key) }
  set(key: string, value: unknown) {
    return this.database.settings.put({ key, value, updatedAt: Date.now() })
  }
}

export const settingsRepository = new SettingsRepository()
