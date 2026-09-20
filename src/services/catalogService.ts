import type { PocketGBADatabase } from '@/storage/db'
import { db } from '@/storage/db'
import { MAX_GBA_FILE_SIZE } from '@/services/romImportService'
import type { GameRecord, RomRecord } from '@/storage/schema'
import type { CatalogEntry } from '@/types/catalog'
import { sha256 } from '@/utils/sha256'

export type CatalogInstallStage = 'Downloading' | 'Verifying' | 'Saving' | 'Complete'
export class CatalogError extends Error {}
type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

export class CatalogService {
  private catalog?: CatalogEntry[]
  constructor(private readonly database: PocketGBADatabase = db, private readonly fetcher: Fetcher = (input, init) => fetch(input, init)) {}

  async load(force = false) {
    if (this.catalog && !force) return this.catalog
    let response: Response
    try { response = await this.fetcher('/catalog/games.json', { cache: 'no-cache' }) } catch { throw new CatalogError('The game catalog is unavailable.') }
    if (!response.ok) throw new CatalogError('The game catalog could not be loaded.')
    const value: unknown = await response.json().catch(() => undefined)
    if (!Array.isArray(value)) throw new CatalogError('The game catalog is malformed.')
    const entries = value.map(validateEntry); const ids = new Set<string>()
    for (const entry of entries) { if (ids.has(entry.id)) throw new CatalogError(`The catalog contains a duplicate ID: ${entry.id}`); ids.add(entry.id) }
    this.catalog = entries
    return entries
  }

  async syncMetadata() {
    const entries = await this.load()
    const now = Date.now()
    await this.database.transaction('rw', this.database.games, async () => {
      for (const entry of entries) {
        const id = gameId(entry.id); const existing = await this.database.games.get(id)
        if (existing) {
          if (existing.coverUrl !== (entry.cover || undefined)) await this.database.games.update(id, { coverUrl: entry.cover || undefined })
          continue
        }
        const imported = await this.database.games.where('romHash').equals(entry.checksum).first()
        if (imported) {
          await this.database.games.update(imported.id, { title: entry.title, catalogId: entry.id, coverUrl: entry.cover || undefined, description: entry.description || undefined, developer: entry.developer || undefined, publisher: entry.publisher || undefined, releaseYear: entry.year || undefined, genre: entry.genre })
          continue
        }
        const record: GameRecord = { id, catalogId: entry.id, romId: romId(entry.id), title: entry.title, fileName: fileName(entry.romPath), fileSize: entry.fileSize, romHash: entry.checksum, coverUrl: entry.cover || undefined, description: entry.description || undefined, developer: entry.developer || undefined, publisher: entry.publisher || undefined, releaseYear: entry.year || undefined, genre: entry.genre, favorite: false, addedAt: now, totalPlayTimeMs: 0, source: 'bundled' }
        await this.database.games.add(record)
      }
    })
    return entries
  }

  async install(catalogId: string, onProgress?: (stage: CatalogInstallStage) => void) {
    const entry = (await this.load()).find((item) => item.id === catalogId)
    if (!entry) throw new CatalogError('This catalog game is no longer available.')
    const existing = await this.database.roms.get(romId(entry.id)); if (existing) return existing
    onProgress?.('Downloading')
    let response: Response
    try { response = await this.fetcher(entry.romPath) } catch { throw new CatalogError('The ROM download failed. Check your connection and try again.') }
    if (!response.ok) throw new CatalogError('The ROM download failed. Check your connection and try again.')
    const bytes = await response.arrayBuffer()
    if (bytes.byteLength !== entry.fileSize) throw new CatalogError('The downloaded ROM size does not match the catalog.')
    if (bytes.byteLength === 0 || bytes.byteLength > MAX_GBA_FILE_SIZE) throw new CatalogError('The downloaded ROM has an invalid GBA file size.')
    onProgress?.('Verifying')
    const checksum = await sha256(bytes)
    if (checksum !== entry.checksum) throw new CatalogError('The downloaded ROM failed checksum verification and was not saved.')
    onProgress?.('Saving')
    const record: RomRecord = { id: romId(entry.id), hash: checksum, fileName: fileName(entry.romPath), mimeType: 'application/octet-stream', size: bytes.byteLength, blob: bytes.slice(0), createdAt: Date.now() }
    await this.database.roms.put(record)
    onProgress?.('Complete')
    return record
  }
}

function validateEntry(value: unknown): CatalogEntry {
  const item = object(value); const id = string(item.id); const romPath = string(item.romPath); const checksum = string(item.checksum).toLowerCase(); const fileSize = integer(item.fileSize)
  if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(id)) throw new CatalogError('A catalog game has an invalid ID.')
  if (!string(item.title)) throw new CatalogError(`Catalog game ${id} has no title.`)
  if (!/^\/catalog\/roms\/[a-zA-Z0-9._-]+\.gba$/.test(romPath)) throw new CatalogError(`Catalog game ${id} has an unsafe ROM path.`)
  if (!/^[a-f0-9]{64}$/.test(checksum)) throw new CatalogError(`Catalog game ${id} has an invalid checksum.`)
  if (fileSize <= 0 || fileSize > MAX_GBA_FILE_SIZE) throw new CatalogError(`Catalog game ${id} has an invalid file size.`)
  const cover = string(item.cover); if (cover && !/^\/catalog\/covers\/[a-zA-Z0-9._-]+\.(png|jpe?g|webp|svg)$/.test(cover)) throw new CatalogError(`Catalog game ${id} has an unsafe cover path.`)
  return { id, title: string(item.title), description: string(item.description), developer: string(item.developer), publisher: string(item.publisher), year: integer(item.year), genre: Array.isArray(item.genre) ? item.genre.filter((genre): genre is string => typeof genre === 'string').slice(0, 12) : [], cover, romPath, fileSize, checksum, featured: item.featured === true }
}
function gameId(id: string) { return `catalog:${id}` }
function romId(id: string) { return `catalog-rom:${id}` }
function fileName(path: string) { return path.split('/').at(-1) ?? 'catalog-game.gba' }
function object(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {} }
function string(value: unknown) { return typeof value === 'string' ? value.trim() : '' }
function integer(value: unknown) { return typeof value === 'number' && Number.isInteger(value) ? value : 0 }

export const catalogService = new CatalogService()
