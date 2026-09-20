import type { PocketGBADatabase } from '@/storage/db'
import { db } from '@/storage/db'
import { binarySize } from '@/storage/binary'

export type LocalStorageBreakdown = {
  romBytes: number
  saveBytes: number
  saveStateBytes: number
  screenshotBytes: number
  coverBytes: number
  totalBytes: number
}

export class StorageRepository {
  constructor(private readonly database: PocketGBADatabase = db) {}

  async breakdown(): Promise<LocalStorageBreakdown> {
    const [roms, saves, states, screenshots, covers] = await Promise.all([
      this.database.roms.toArray(), this.database.saves.toArray(), this.database.saveStates.toArray(),
      this.database.screenshots.toArray(), this.database.covers.toArray(),
    ])
    const romBytes = sum(roms, (record) => binarySize(record.blob))
    const saveBytes = sum(saves, (record) => binarySize(record.data))
    const saveStateBytes = sum(states, (record) => binarySize(record.stateData))
    const screenshotBytes = sum(screenshots, (record) => binarySize(record.blob))
    const coverBytes = sum(covers, (record) => binarySize(record.blob))
    return { romBytes, saveBytes, saveStateBytes, screenshotBytes, coverBytes, totalBytes: romBytes + saveBytes + saveStateBytes + screenshotBytes + coverBytes }
  }
}

function sum<T>(records: T[], size: (record: T) => number) { return records.reduce((total, record) => total + size(record), 0) }

export const storageRepository = new StorageRepository()
