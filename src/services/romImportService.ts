import type { PocketGBADatabase } from '@/storage/db'
import { db } from '@/storage/db'
import type { GameRecord, RomRecord } from '@/storage/schema'
import { sha256 } from '@/utils/sha256'
import { createId } from '@/utils/createId'

export const MAX_GBA_FILE_SIZE = 32 * 1024 * 1024

export type ImportStage = 'Reading' | 'Checking' | 'Saving' | 'Complete' | 'Failed'
export type ImportProgress = {
  fileName: string
  stage: ImportStage
  message?: string
  gameId?: string
}

export type ImportResult = ImportProgress & { duplicate?: boolean }

export class RomImportError extends Error {}

export class RomImportService {
  constructor(private readonly database: PocketGBADatabase = db) {}

  async importFiles(files: Iterable<File>, onProgress?: (progress: ImportProgress) => void) {
    const results: ImportResult[] = []
    for (const file of files) {
      results.push(await this.importFile(file, onProgress))
    }
    return results
  }

  async importFile(file: File, onProgress?: (progress: ImportProgress) => void): Promise<ImportResult> {
    const report = (stage: ImportStage, message?: string) => onProgress?.({ fileName: file.name, stage, message })
    try {
      this.validate(file)
      report('Reading')
      const bytes = await file.arrayBuffer()
      report('Checking')
      const hash = await sha256(bytes)
      if (await this.database.roms.where('hash').equals(hash).first()) {
        const result = { fileName: file.name, stage: 'Failed' as const, message: 'Already in your library', duplicate: true }
        onProgress?.(result)
        return result
      }

      report('Saving')
      const now = Date.now()
      const romId = createId()
      const gameId = createId()
      const rom: RomRecord = {
        id: romId,
        hash,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        blob: bytes.slice(0),
        createdAt: now,
      }
      const game: GameRecord = {
        id: gameId,
        romId,
        title: titleFromFileName(file.name),
        fileName: file.name,
        fileSize: file.size,
        romHash: hash,
        favorite: false,
        addedAt: now,
        totalPlayTimeMs: 0,
        source: 'imported',
      }
      await this.database.transaction('rw', this.database.roms, this.database.games, async () => {
        await this.database.roms.add(rom)
        await this.database.games.add(game)
      })
      const result = { fileName: file.name, stage: 'Complete' as const, gameId }
      onProgress?.(result)
      return result
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The ROM could not be imported.'
      const result = { fileName: file.name, stage: 'Failed' as const, message }
      onProgress?.(result)
      return result
    }
  }

  private validate(file: File) {
    if (!file.name.toLocaleLowerCase().endsWith('.gba')) {
      throw new RomImportError('Unsupported file. Choose a .gba ROM.')
    }
    if (file.size === 0) throw new RomImportError('This file is empty.')
    if (file.size > MAX_GBA_FILE_SIZE) {
      throw new RomImportError('This file is larger than the 32 MB GBA limit.')
    }
  }
}

export function titleFromFileName(fileName: string) {
  return fileName
    .replace(/\.gba$/i, '')
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toLocaleUpperCase()) || 'Untitled Game'
}

export const romImportService = new RomImportService()
