import { strFromU8, strToU8, unzip, zip, type Zippable } from 'fflate'
import type { PocketGBADatabase } from '@/storage/db'
import { db } from '@/storage/db'
import type { CheatRecord, CoverRecord, GameRecord, RomRecord, SaveRecord, SaveStateRecord, ScreenshotRecord, SessionRecord, SettingRecord } from '@/storage/schema'
import { binaryBuffer, type StoredBinary } from '@/storage/binary'
import { createId } from '@/utils/createId'

export const BACKUP_FORMAT_VERSION = 1
export const MAX_BACKUP_FILE_SIZE = 1024 * 1024 * 1024
const APP_VERSION = '0.1.0'

export type BackupType = 'save-only' | 'full-metadata' | 'full-with-roms'
export type BackupManifest = { backupFormatVersion: number; appVersion: string; createdAt: string; type: BackupType; includesRoms: boolean; games: { id: string; title: string; romId: string }[] }
export type BackupPreview = { token: string; manifest: BackupManifest; counts: { games: number; saves: number; states: number; screenshots: number; settings: number; cheats: number; roms: number }; conflicts: string[] }
export type RestoreReport = { games: number; saves: number; states: number; screenshots: number; settings: number; cheats: number; roms: number }

type BinaryMeta = { id: string; gameId?: string; path: string; [key: string]: unknown }
type ParsedBackup = {
  manifest: BackupManifest; games: GameRecord[]; settings: SettingRecord[]; saves: SaveRecord[]; states: SaveStateRecord[];
  screenshots: ScreenshotRecord[]; sessions: SessionRecord[]; covers: CoverRecord[]; cheats: CheatRecord[]; roms: RomRecord[]
}

export class BackupService {
  private staged = new Map<string, ParsedBackup>()
  constructor(private readonly database: PocketGBADatabase = db) {}

  async create(type: BackupType): Promise<Blob> {
    const [games, settings, saves, states, screenshots] = await Promise.all([
      this.database.games.toArray(), this.database.settings.toArray(), this.database.saves.toArray(),
      this.database.saveStates.toArray(), this.database.screenshots.toArray(),
    ])
    const full = type !== 'save-only'
    const includeRoms = type === 'full-with-roms'
    const [sessions, covers, cheats, roms] = await Promise.all([
      full ? this.database.sessions.toArray() : [], full ? this.database.covers.toArray() : [], full ? this.database.cheats.toArray() : [], includeRoms ? this.database.roms.toArray() : [],
    ])
    const requiredScreenshotIds = new Set(states.map((state) => state.screenshotId).filter(Boolean))
    const exportedScreenshots = full ? screenshots : screenshots.filter((shot) => requiredScreenshotIds.has(shot.id))
    const manifest: BackupManifest = { backupFormatVersion: BACKUP_FORMAT_VERSION, appVersion: APP_VERSION, createdAt: new Date().toISOString(), type, includesRoms: includeRoms, games: games.map(({ id, title, romId }) => ({ id, title, romId })) }
    const files: Zippable = {
      'manifest.json': json(manifest), 'games.json': json(games), 'settings.json': json(settings),
      'saves/index.json': json(saves.map(({ data: _data, ...record }) => ({ ...record, path: `saves/${record.id}.sav`, mimeType: dataType(_data) }))),
      'states/index.json': json(states.map(({ stateData: _data, ...record }) => ({ ...record, path: `states/${record.id}.state`, mimeType: dataType(_data) }))),
      'screenshots/index.json': json(exportedScreenshots.map(({ blob, ...record }) => ({ ...record, path: `screenshots/${record.id}`, mimeType: dataType(blob) || 'image/png' }))),
    }
    for (const record of saves) files[`saves/${record.id}.sav`] = await blobBytes(record.data)
    for (const record of states) files[`states/${record.id}.state`] = await blobBytes(record.stateData)
    for (const record of exportedScreenshots) files[`screenshots/${record.id}`] = await blobBytes(record.blob)
    if (full) {
      files['sessions.json'] = json(sessions)
      files['cheats.json'] = json(cheats)
      files['covers/index.json'] = json(covers.map(({ blob, ...record }) => ({ ...record, path: `covers/${record.id}`, mimeType: record.mimeType || dataType(blob) })))
      for (const record of covers) files[`covers/${record.id}`] = await blobBytes(record.blob)
    }
    if (includeRoms) {
      files['roms/index.json'] = json(roms.map(({ blob, ...record }) => ({ ...record, mimeType: record.mimeType || dataType(blob), path: `roms/${record.id}.gba` })))
      for (const record of roms) files[`roms/${record.id}.gba`] = await blobBytes(record.blob)
    }
    return new Blob([ownedBuffer(await zipFiles(files))], { type: 'application/zip' })
  }

  async preview(file: File | Blob): Promise<BackupPreview> {
    if (!file.size || file.size > MAX_BACKUP_FILE_SIZE) throw new Error('Choose a non-empty PocketArc backup no larger than 1 GB.')
    const archive = await unzipFiles(await blobBytes(file))
    const parsed = parseArchive(archive)
    const [games, saves, states, screenshots, settings, cheats, roms] = await Promise.all([
      this.database.games.bulkGet(parsed.games.map((item) => item.id)), this.database.saves.bulkGet(parsed.saves.map((item) => item.id)),
      this.database.saveStates.bulkGet(parsed.states.map((item) => item.id)), this.database.screenshots.bulkGet(parsed.screenshots.map((item) => item.id)),
      this.database.settings.bulkGet(parsed.settings.map((item) => item.key)), this.database.cheats.bulkGet(parsed.cheats.map((item) => item.id)), this.database.roms.bulkGet(parsed.roms.map((item) => item.id)),
    ])
    const conflicts: string[] = []
    addConflict(conflicts, games, 'game records'); addConflict(conflicts, saves, 'normal saves'); addConflict(conflicts, states, 'save states')
    addConflict(conflicts, screenshots, 'screenshots'); addConflict(conflicts, settings, 'settings'); addConflict(conflicts, cheats, 'cheats'); addConflict(conflicts, roms, 'ROMs')
    this.staged.clear()
    const token = createId(); this.staged.set(token, parsed)
    return { token, manifest: parsed.manifest, counts: counts(parsed), conflicts }
  }

  async restore(preview: BackupPreview): Promise<RestoreReport> {
    const parsed = this.staged.get(preview.token)
    if (!parsed) throw new Error('Select the backup again before restoring it.')
    await this.database.transaction('rw', [this.database.games, this.database.settings, this.database.saves, this.database.saveStates, this.database.screenshots, this.database.sessions, this.database.covers, this.database.cheats, this.database.roms], async () => {
      await this.database.games.bulkPut(parsed.games); await this.database.settings.bulkPut(parsed.settings)
      await this.database.saves.bulkPut(parsed.saves); await this.database.saveStates.bulkPut(parsed.states)
      await this.database.screenshots.bulkPut(parsed.screenshots); await this.database.sessions.bulkPut(parsed.sessions)
      await this.database.covers.bulkPut(parsed.covers); await this.database.roms.bulkPut(parsed.roms)
      await this.database.cheats.bulkPut(parsed.cheats)
    })
    this.staged.delete(preview.token)
    return counts(parsed)
  }

  async clearAll() {
    await this.database.transaction('rw', this.database.tables, async () => { await Promise.all(this.database.tables.map((table) => table.clear())) })
  }
}

function parseArchive(files: Record<string, Uint8Array>): ParsedBackup {
  if (Object.keys(files).length > 10_000) throw new Error('This backup contains too many files.')
  if (Object.keys(files).some((path) => path.includes('..') || path.startsWith('/'))) throw new Error('This backup contains unsafe file paths.')
  const manifest = readJson<BackupManifest>(files, 'manifest.json')
  if (!manifest || manifest.backupFormatVersion !== BACKUP_FORMAT_VERSION || !Array.isArray(manifest.games) || !['save-only', 'full-metadata', 'full-with-roms'].includes(manifest.type)) throw new Error('This is not a supported PocketArc backup.')
  if (manifest.includesRoms !== (manifest.type === 'full-with-roms')) throw new Error('The backup ROM declaration is invalid.')
  const games = readArray<GameRecord>(files, 'games.json'); const settings = readArray<SettingRecord>(files, 'settings.json')
  const saves = binaryRecords<SaveRecord>(files, 'saves/index.json', 'data')
  const states = binaryRecords<SaveStateRecord>(files, 'states/index.json', 'stateData')
  const screenshots = binaryRecords<ScreenshotRecord>(files, 'screenshots/index.json', 'blob')
  const sessions = optionalArray<SessionRecord>(files, 'sessions.json'); const cheats = optionalArray<CheatRecord>(files, 'cheats.json'); const covers = binaryRecords<CoverRecord>(files, 'covers/index.json', 'blob', true)
  const roms = binaryRecords<RomRecord>(files, 'roms/index.json', 'blob', true)
  for (const record of [...saves, ...states, ...screenshots]) if (!games.some((game) => game.id === record.gameId)) throw new Error('The backup contains data for an unknown game.')
  return { manifest, games, settings, saves, states, screenshots, sessions, covers, cheats, roms }
}

function binaryRecords<T>(files: Record<string, Uint8Array>, indexPath: string, field: string, optional = false): T[] {
  if (!files[indexPath] && optional) return []
  return readArray<BinaryMeta>(files, indexPath).map((meta) => {
    if (typeof meta.path !== 'string' || !files[meta.path]?.byteLength) throw new Error(`Backup data is missing for ${meta.id}.`)
    const record: Partial<BinaryMeta> = { ...meta }; delete record.path; const mimeType = record.mimeType; delete record.mimeType
    return { ...record, ...(field === 'blob' && typeof mimeType === 'string' && !('mimeType' in record) ? { mimeType } : {}), [field]: ownedBuffer(files[meta.path]) } as T
  })
}
function readJson<T>(files: Record<string, Uint8Array>, path: string): T { if (!files[path]) throw new Error(`Backup is missing ${path}.`); try { return JSON.parse(strFromU8(files[path])) as T } catch { throw new Error(`${path} is malformed.`) } }
function readArray<T>(files: Record<string, Uint8Array>, path: string): T[] { const value = readJson<unknown>(files, path); if (!Array.isArray(value)) throw new Error(`${path} must contain a list.`); return value as T[] }
function optionalArray<T>(files: Record<string, Uint8Array>, path: string): T[] { return files[path] ? readArray<T>(files, path) : [] }
function json(value: unknown) { return strToU8(JSON.stringify(value, null, 2)) }
function dataType(value: StoredBinary) { return value instanceof Blob ? value.type || 'application/octet-stream' : 'application/octet-stream' }
function ownedBuffer(value: Uint8Array) { return value.slice().buffer as ArrayBuffer }
function blobBytes(blob: Blob | StoredBinary) {
  if (typeof (blob as Blob).arrayBuffer === 'function') return (blob as Blob).arrayBuffer().then((value) => new Uint8Array(value))
  if (blob instanceof ArrayBuffer) return binaryBuffer(blob).then((value) => new Uint8Array(value))
  return new Promise<Uint8Array>((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(reader.error ?? new Error('A local file could not be read.')); reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer)); reader.readAsArrayBuffer(blob) })
}
function zipFiles(files: Zippable) { return new Promise<Uint8Array>((resolve, reject) => zip(files, { level: 6 }, (error, data) => error ? reject(error) : resolve(data))) }
function unzipFiles(data: Uint8Array) { return new Promise<Record<string, Uint8Array>>((resolve, reject) => unzip(data, (error, files) => error ? reject(new Error('The selected backup is not a valid ZIP archive.')) : resolve(files))) }
function addConflict(target: string[], records: unknown[], label: string) { const count = records.filter(Boolean).length; if (count) target.push(`${count} existing ${label} will be replaced.`) }
function counts(value: ParsedBackup): RestoreReport { return { games: value.games.length, saves: value.saves.length, states: value.states.length, screenshots: value.screenshots.length, settings: value.settings.length, cheats: value.cheats.length, roms: value.roms.length } }

export function downloadBackup(blob: Blob, type: BackupType) {
  const url = URL.createObjectURL(blob); const anchor = document.createElement('a'); const date = new Date().toISOString().slice(0, 10)
  anchor.href = url; anchor.download = `pocketarc-${type}-${date}.zip`; anchor.click(); window.setTimeout(() => URL.revokeObjectURL(url), 0)
}

export const backupService = new BackupService()
