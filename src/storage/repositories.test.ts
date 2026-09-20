import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import Dexie from 'dexie'
import { PocketGBADatabase } from '@/storage/db'
import { GameRepository } from '@/storage/gameRepository'
import { RomRepository } from '@/storage/romRepository'
import { SettingsRepository } from '@/storage/settingsRepository'
import { SessionRepository } from '@/storage/sessionRepository'
import { SaveRepository } from '@/storage/saveRepository'
import { SaveStateRepository } from '@/storage/saveStateRepository'
import { CoverRepository } from '@/storage/coverRepository'
import { CheatRepository } from '@/storage/cheatRepository'
import type { GameRecord, RomRecord } from '@/storage/schema'

let database: PocketGBADatabase

beforeEach(() => { database = new PocketGBADatabase(`PocketGBA-test-${crypto.randomUUID()}`) })
afterEach(async () => { database.close(); await database.delete() })

function records(): { game: GameRecord; rom: RomRecord } {
  const rom: RomRecord = { id: 'rom-1', hash: 'abc123', fileName: 'demo.gba', mimeType: 'application/octet-stream', size: 4, blob: new Blob(['demo']), createdAt: 100 }
  const game: GameRecord = { id: 'game-1', romId: rom.id, title: 'Demo', fileName: rom.fileName, fileSize: rom.size, romHash: rom.hash, favorite: false, addedAt: 100, totalPlayTimeMs: 0, source: 'imported' }
  return { game, rom }
}

describe('storage repositories', () => {
  it('migrates legacy cover, save timestamp, and numeric state-slot records', async () => {
    const name = `PocketGBA-migration-${crypto.randomUUID()}`
    const legacy = new Dexie(name)
    legacy.version(3).stores({ games: 'id, romHash, addedAt', saves: 'id, gameId, updatedAt', saveStates: 'id, gameId, [gameId+slot]' })
    await legacy.open()
    await legacy.table('games').add({ ...records().game, customCoverId: 'cover-1' })
    await legacy.table('saves').add({ id: 'save-1', gameId: 'game-1', data: new ArrayBuffer(1), updatedAt: 200 })
    await legacy.table('saveStates').add({ id: 'state-1', gameId: 'game-1', slot: 99, name: 'Quick', stateData: new ArrayBuffer(1), createdAt: 200, updatedAt: 200 })
    legacy.close()

    const migrated = new PocketGBADatabase(name)
    await migrated.open()
    expect(await migrated.games.get('game-1')).toMatchObject({ coverId: 'cover-1' })
    expect(await migrated.saves.get('save-1')).toMatchObject({ createdAt: 200 })
    expect(await migrated.saveStates.get('state-1')).toMatchObject({ slot: 'quick' })
    migrated.close()
    await migrated.delete()
  })

  it('stores game metadata separately from the ROM blob and finds hashes', async () => {
    const { game, rom } = records()
    const games = new GameRepository(database)
    const roms = new RomRepository(database)
    await roms.add(rom)
    await games.add(game)
    expect(await roms.findByHash('abc123')).toMatchObject({ id: 'rom-1', fileName: 'demo.gba' })
    expect(database.roms.schema.indexes.map((index) => index.name)).not.toContain('blob')
    expect(await games.findByRomHash('abc123')).toMatchObject({ id: 'game-1', title: 'Demo' })
  })

  it('deletes the game, ROM, and associated local records atomically', async () => {
    const { game, rom } = records()
    const games = new GameRepository(database)
    await database.roms.add(rom)
    await database.games.add(game)
    await database.saves.add({ id: 'save-1', gameId: game.id, data: new Blob(['save']), createdAt: 200, updatedAt: 200 })
    await database.saveStates.add({ id: 'state-1', gameId: game.id, slot: 'quick', name: 'Quick save', stateData: new Blob(['state']), createdAt: 200, updatedAt: 200 })
    await database.screenshots.add({ id: 'shot-1', gameId: game.id, blob: new Blob(['image']), createdAt: 200, source: 'save-state' })
    await database.sessions.add({ id: 'session-1', gameId: game.id, startedAt: 100, durationMs: 50 })
    await database.covers.add({ id: 'cover-1', gameId: game.id, blob: new Blob(['cover'], { type: 'image/png' }), mimeType: 'image/png', updatedAt: 200 })
    await games.removeWithLocalData(game.id)
    expect(await Promise.all([database.games.count(), database.roms.count(), database.saves.count(), database.saveStates.count(), database.screenshots.count(), database.sessions.count(), database.covers.count()])).toEqual([0, 0, 0, 0, 0, 0, 0])
  })

  it('stores local cover artwork separately and links only its id from the game', async () => {
    const { game } = records(); await database.games.add(game); const covers = new CoverRepository(database); const id = await covers.replaceForGame(game.id, new Blob(['image'], { type: 'image/png' })); expect(await database.games.get(game.id)).toMatchObject({ coverId: id }); expect(await covers.forGame(game.id)).toMatchObject({ gameId: game.id }); expect(database.covers.schema.indexes.map((index) => index.name)).not.toContain('blob')
  })

  it('persists minimal settings and sessions', async () => {
    const settings = new SettingsRepository(database)
    const sessions = new SessionRepository(database)
    await settings.set('libraryView', 'list')
    await sessions.add({ id: 'session-1', gameId: 'game-1', startedAt: 100, durationMs: 0 })
    expect((await settings.get('libraryView'))?.value).toBe('list')
    expect(await sessions.forGame('game-1')).toHaveLength(1)
  })

  it('keeps cheats isolated by game and outside settings', async () => {
    const cheats = new CheatRepository(database); const record = await cheats.add('game-a', 'Infinite lives', '1234ABCD 0009')
    await cheats.update(record.id, { enabled: true })
    expect(await cheats.forGame('game-a')).toMatchObject([{ name: 'Infinite lives', enabled: true }])
    expect(await cheats.forGame('game-b')).toEqual([])
    expect(await database.settings.count()).toBe(0)
  })

  it('keeps normal saves isolated by game and rejects empty replacements', async () => {
    const saves = new SaveRepository(database)
    await saves.putForGame('game-a', new Blob([new Uint8Array([1, 2, 3])]), 'hash-a')
    await saves.putForGame('game-b', new Blob([new Uint8Array([9])]), 'hash-b')
    expect(await saves.getForGame('game-a')).toMatchObject({ gameId: 'game-a', hash: 'hash-a' })
    expect((await saves.getForGame('game-b'))?.hash).toBe('hash-b')
    await expect(saves.putForGame('game-a', new Blob([]))).rejects.toThrow('empty save')
    expect((await saves.getForGame('game-a'))?.hash).toBe('hash-a')
  })

  it('overwrites one state slot atomically and removes its previous screenshot', async () => {
    const states = new SaveStateRepository(database)
    const first = await states.putSlot({ gameId: 'game-a', slot: '1', name: 'First', stateData: new Blob(['one']), screenshot: new Blob(['image-one']) })
    const second = await states.putSlot({ gameId: 'game-a', slot: '1', name: 'Second', stateData: new Blob(['two']), screenshot: new Blob(['image-two']) })
    expect(second.id).toBe(first.id)
    expect(await states.forGame('game-a')).toHaveLength(1)
    expect(await database.screenshots.count()).toBe(1)
    expect(await states.getSlot('game-b', '1')).toBeUndefined()
    await states.delete(second.id)
    expect(await database.screenshots.count()).toBe(0)
  })
})
