import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PocketGBADatabase } from '@/storage/db'
import { MAX_GBA_FILE_SIZE, RomImportService, titleFromFileName } from '@/services/romImportService'

let database: PocketGBADatabase
let service: RomImportService

beforeEach(() => { database = new PocketGBADatabase(`PocketGBA-import-test-${crypto.randomUUID()}`); service = new RomImportService(database) })
afterEach(async () => { database.close(); await database.delete() })

describe('RomImportService', () => {
  it('imports a GBA file and prevents a duplicate hash', async () => {
    const progress = vi.fn()
    const first = await service.importFile(new File(['test-rom'], 'my_game.gba'), progress)
    const duplicate = await service.importFile(new File(['test-rom'], 'copy.gba'), progress)
    expect(first.stage).toBe('Complete')
    expect(duplicate).toMatchObject({ stage: 'Failed', message: 'Already in your library', duplicate: true })
    expect(await database.games.count()).toBe(1)
    expect(await database.roms.count()).toBe(1)
    expect(progress.mock.calls.map(([item]) => item.stage)).toContain('Saving')
  })

  it('rejects unsupported, empty, and oversized files without writing data', async () => {
    expect((await service.importFile(new File(['x'], 'game.zip'))).message).toMatch(/Unsupported/)
    expect((await service.importFile(new File([], 'empty.gba'))).message).toMatch(/empty/)
    const oversized = new File([new Uint8Array(MAX_GBA_FILE_SIZE + 1)], 'huge.gba')
    expect((await service.importFile(oversized)).message).toMatch(/32 MB/)
    expect(await database.games.count()).toBe(0)
  })

  it('derives a readable title from the filename', () => {
    expect(titleFromFileName('the_great-adventure.gba')).toBe('The Great Adventure')
  })

  it('reports IndexedDB write failures without crashing the import queue', async () => {
    database.close()
    const result = await service.importFile(new File(['test-rom'], 'storage-error.gba'))
    expect(result.stage).toBe('Failed')
    expect(result.message).toBeTruthy()
  })
})
