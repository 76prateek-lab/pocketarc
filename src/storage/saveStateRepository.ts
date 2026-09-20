import type { PocketGBADatabase } from '@/storage/db'
import { db } from '@/storage/db'
import type { SaveStateRecord, SaveStateSlot, ScreenshotRecord } from '@/storage/schema'
import { binarySize, toStoredBinary, type StoredBinary } from '@/storage/binary'
import { createId } from '@/utils/createId'

export type { SaveStateSlot } from '@/storage/schema'

export class SaveStateRepository {
  constructor(private readonly database: PocketGBADatabase = db) {}

  get(id: string) { return this.database.saveStates.get(id) }
  count() { return this.database.saveStates.count() }
  async forGame(gameId: string) {
    const order: Record<SaveStateSlot, number> = { auto: 0, quick: 1, '1': 2, '2': 3, '3': 4 }
    return (await this.database.saveStates.where('gameId').equals(gameId).toArray()).sort((a, b) => order[a.slot] - order[b.slot])
  }
  getSlot(gameId: string, slot: SaveStateSlot) { return this.database.saveStates.where('[gameId+slot]').equals([gameId, slot]).first() }

  async putSlot(input: { gameId: string; slot: SaveStateSlot; name: string; stateData: StoredBinary; screenshot?: StoredBinary }) {
    if (binarySize(input.stateData) === 0) throw new Error('Empty save-state data was rejected.')
    const stateData = await toStoredBinary(input.stateData)
    const screenshotData = input.screenshot && binarySize(input.screenshot) ? await toStoredBinary(input.screenshot) : undefined
    return this.database.transaction('rw', [this.database.saveStates, this.database.screenshots, this.database.games], async () => {
      const existing = await this.getSlot(input.gameId, input.slot)
      const now = Date.now()
      let screenshotId = existing?.screenshotId
      if (screenshotData) {
        const screenshot: ScreenshotRecord = { id: createId(), gameId: input.gameId, blob: screenshotData, createdAt: now, source: 'save-state' }
        await this.database.screenshots.put(screenshot)
        screenshotId = screenshot.id
        if (existing?.screenshotId) await this.database.screenshots.delete(existing.screenshotId)
      }
      const record: SaveStateRecord = {
        id: existing?.id ?? createId(),
        gameId: input.gameId,
        slot: input.slot,
        name: input.name,
        stateData,
        ...(screenshotId ? { screenshotId } : {}),
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
      }
      await this.database.saveStates.put(record)
      await this.database.games.update(input.gameId, { lastSaveStateId: record.id })
      return record
    })
  }

  async rename(id: string, name: string) {
    const cleanName = name.trim()
    if (!cleanName) throw new Error('Save-state name cannot be empty.')
    return this.database.saveStates.update(id, { name: cleanName, updatedAt: Date.now() })
  }

  async delete(id: string) {
    await this.database.transaction('rw', [this.database.saveStates, this.database.screenshots, this.database.games], async () => {
      const state = await this.database.saveStates.get(id)
      if (!state) return
      await this.database.saveStates.delete(id)
      if (state.screenshotId) await this.database.screenshots.delete(state.screenshotId)
      const game = await this.database.games.get(state.gameId)
      if (game?.lastSaveStateId === id) {
        const replacement = await this.database.saveStates.where('gameId').equals(state.gameId).reverse().sortBy('updatedAt')
        await this.database.games.update(state.gameId, { lastSaveStateId: replacement[0]?.id })
      }
    })
  }
}

export const saveStateRepository = new SaveStateRepository()
