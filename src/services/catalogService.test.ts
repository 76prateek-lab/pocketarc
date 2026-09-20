import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PocketGBADatabase } from '@/storage/db'
import { CatalogService } from '@/services/catalogService'
import { sha256 } from '@/utils/sha256'

let database: PocketGBADatabase
beforeEach(() => { database = new PocketGBADatabase(`PocketGBA-catalog-${crypto.randomUUID()}`) })
afterEach(async () => { database.close(); await database.delete() })

describe('catalog service', () => {
  it('syncs metadata without downloading and installs only after checksum verification', async () => {
    const bytes = new Uint8Array([1, 2, 3, 4]); const checksum = await sha256(bytes.buffer); const requests: string[] = []
    const entry = { id: 'legal-demo', title: 'Legal Demo', description: 'Redistributable test game.', developer: 'Demo Dev', publisher: 'Demo Publisher', year: 2026, genre: ['Demo'], cover: '/catalog/covers/legal-demo.png', romPath: '/catalog/roms/legal-demo.gba', fileSize: bytes.byteLength, checksum, featured: true }
    const fetcher = async (input: RequestInfo | URL) => { const path = String(input); requests.push(path); return path.endsWith('games.json') ? new Response(JSON.stringify([entry]), { status: 200 }) : new Response(bytes, { status: 200 }) }
    const service = new CatalogService(database, fetcher)
    await service.syncMetadata()
    expect(await database.games.get('catalog:legal-demo')).toMatchObject({ title: 'Legal Demo', source: 'bundled', catalogId: 'legal-demo' })
    expect(await database.roms.count()).toBe(0)
    expect(requests).toEqual(['/catalog/games.json'])
    await service.install('legal-demo')
    expect(await database.roms.get('catalog-rom:legal-demo')).toMatchObject({ hash: checksum, size: 4 })
    expect(requests).toEqual(['/catalog/games.json', '/catalog/roms/legal-demo.gba'])
  })

  it('rejects a mismatched download without storing it', async () => {
    const entry = { id: 'legal-demo', title: 'Legal Demo', description: '', developer: '', publisher: '', year: 2026, genre: [], cover: '', romPath: '/catalog/roms/legal-demo.gba', fileSize: 4, checksum: '0'.repeat(64), featured: false }
    const service = new CatalogService(database, async (input) => String(input).endsWith('games.json') ? new Response(JSON.stringify([entry])) : new Response(new Uint8Array([1, 2, 3, 4])))
    await service.syncMetadata()
    await expect(service.install('legal-demo')).rejects.toThrow('checksum verification')
    expect(await database.roms.count()).toBe(0)
  })
})
