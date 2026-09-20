import type Dexie from 'dexie'

const stores = {
  games: 'id, romId, romHash, title, favorite, addedAt, lastPlayedAt, source',
  roms: 'id, &hash, fileName, createdAt',
  saves: 'id, gameId, updatedAt',
  saveStates: 'id, gameId, [gameId+slot], updatedAt',
  screenshots: 'id, gameId, createdAt, type',
  settings: 'key, updatedAt',
  sessions: 'id, gameId, startedAt, endedAt',
}

const currentStores = {
  games: 'id, &romHash, addedAt',
  roms: 'id, &hash',
  saves: 'id, &gameId, updatedAt',
  saveStates: 'id, gameId, &[gameId+slot]',
  screenshots: 'id, gameId',
  settings: 'key',
  sessions: 'id, gameId',
  covers: 'id, &gameId',
  cheats: 'id, gameId',
}

export const DATABASE_VERSION = 4

export function configureMigrations(database: Dexie) {
  database.version(1).stores(stores)
  database.version(2).stores({ ...stores, covers: 'id, &gameId, updatedAt' })
  database.version(3).stores({ ...stores, screenshots: 'id, gameId, createdAt, source', covers: 'id, &gameId, updatedAt', cheats: 'id, gameId, [gameId+enabled], updatedAt' }).upgrade(async (transaction) => {
    await transaction.table('screenshots').toCollection().modify((record) => { record.source = record.source ?? record.type ?? 'manual'; delete record.type })
  })
  database.version(DATABASE_VERSION).stores(currentStores).upgrade(async (transaction) => {
    await transaction.table('games').toCollection().modify((record) => {
      record.coverId = record.coverId ?? record.customCoverId
      delete record.customCoverId
    })
    await transaction.table('saves').toCollection().modify((record) => {
      record.createdAt = record.createdAt ?? record.updatedAt ?? Date.now()
    })
    await transaction.table('saveStates').toCollection().modify((record) => {
      const slots: Record<number, string> = { 0: 'auto', 1: '1', 2: '2', 3: '3', 99: 'quick' }
      record.slot = typeof record.slot === 'number' ? (slots[record.slot] ?? 'auto') : record.slot
    })
  })
}
