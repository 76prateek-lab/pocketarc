import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { unzipSync } from 'fflate'
import { Blob as NodeBlob } from 'node:buffer'
import { BackupService } from '@/services/backupService'
import { PocketGBADatabase } from '@/storage/db'
import type { GameRecord, RomRecord } from '@/storage/schema'

let database: PocketGBADatabase
let service: BackupService

beforeEach(() => { database = new PocketGBADatabase(`PocketGBA-backup-${crypto.randomUUID()}`); service = new BackupService(database) })
afterEach(async () => { database.close(); await database.delete() })

function records(): { game: GameRecord; rom: RomRecord } {
  const rom: RomRecord = { id: 'rom-1', hash: 'hash-1', fileName: 'homebrew.gba', mimeType: 'application/octet-stream', size: 3, blob: new NodeBlob(['rom']) as unknown as Blob, createdAt: 10 }
  const game: GameRecord = { id: 'game-1', romId: rom.id, title: 'Homebrew', fileName: rom.fileName, fileSize: rom.size, romHash: rom.hash, favorite: true, addedAt: 10, totalPlayTimeMs: 20, source: 'imported' }
  return { game, rom }
}

async function seed() {
  const { game, rom } = records()
  await database.roms.add(rom); await database.games.add(game)
  await database.saves.add({ id: 'save-1', gameId: game.id, data: new NodeBlob(['save']) as unknown as Blob, createdAt: 20, updatedAt: 20 })
  await database.saveStates.add({ id: 'state-1', gameId: game.id, slot: '1', name: 'Slot 1', stateData: new NodeBlob(['state']) as unknown as Blob, screenshotId: 'shot-1', createdAt: 20, updatedAt: 20 })
  await database.screenshots.add({ id: 'shot-1', gameId: game.id, blob: new NodeBlob(['image'], { type: 'image/png' }) as unknown as Blob, createdAt: 20, source: 'save-state' })
  await database.settings.add({ key: 'appSettings', value: { audio: { muted: true } }, updatedAt: 20 })
}

describe('BackupService', () => {
  it('exports saves without silently including ROM binaries', async () => {
    await seed(); const blob = await service.create('save-only'); const files = unzipSync(await readBytes(blob))
    expect(Object.keys(files)).toContain('manifest.json'); expect(Object.keys(files)).toContain('saves/save-1.sav')
    expect(Object.keys(files).some((path) => path.startsWith('roms/'))).toBe(false)
  })

  it('previews, clears, and transactionally restores saves and settings', async () => {
    await seed(); const blob = await service.create('full-with-roms'); const preview = await service.preview(blob)
    expect(preview.counts).toMatchObject({ games: 1, saves: 1, states: 1, screenshots: 1, settings: 1, roms: 1 })
    expect(preview.conflicts.length).toBeGreaterThan(0)
    await service.clearAll(); expect(await database.games.count()).toBe(0)
    await service.restore(preview)
    expect(await database.games.get('game-1')).toMatchObject({ title: 'Homebrew' })
    expect(await database.settings.get('appSettings')).toMatchObject({ value: { audio: { muted: true } } })
    expect(await database.saves.get('save-1')).toMatchObject({ gameId: 'game-1' })
    expect(await database.roms.count()).toBe(1)
  })

  it('rejects malformed archives without changing existing data', async () => {
    await seed()
    await expect(service.preview(new Blob(['not a zip']))).rejects.toThrow('valid ZIP')
    expect(await database.games.get('game-1')).toMatchObject({ title: 'Homebrew' })
    expect(await database.saves.count()).toBe(1)
  })
})

function readBytes(blob: Blob) { return new Promise<Uint8Array>((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(reader.error); reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer)); reader.readAsArrayBuffer(blob) }) }
