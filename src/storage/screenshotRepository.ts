import type { PocketGBADatabase } from '@/storage/db'
import { db } from '@/storage/db'
import type { ScreenshotRecord } from '@/storage/schema'
import { toBlob, toStoredBinary } from '@/storage/binary'

export class ScreenshotRepository {
  constructor(private readonly database: PocketGBADatabase = db) {}

  get(id: string) { return this.database.screenshots.get(id) }
  forGame(gameId: string) { return this.database.screenshots.where('gameId').equals(gameId).toArray() }
  async put(record: ScreenshotRecord) { return this.database.screenshots.put({ ...record, blob: await toStoredBinary(record.blob) }) }
  delete(id: string) { return this.database.screenshots.delete(id) }
  async download(id: string, gameTitle: string) {
    const record = await this.get(id); if (!record) throw new Error('Screenshot not found.')
    const url = URL.createObjectURL(toBlob(record.blob, 'image/png')); const anchor = document.createElement('a'); anchor.href = url; anchor.download = `${gameTitle.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase()}-${new Date(record.createdAt).toISOString().replace(/[:.]/g, '-')}.png`; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }
}

export const screenshotRepository = new ScreenshotRepository()
