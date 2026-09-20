import type { Game } from '@/types/game'
import type { StoredBinary } from '@/storage/binary'

export type GameRecord = Game

export interface CoverRecord {
  id: string
  gameId: string
  blob: StoredBinary
  mimeType: string
  updatedAt: number
}

export interface RomRecord {
  id: string
  hash: string
  fileName: string
  mimeType: string
  size: number
  blob: StoredBinary
  createdAt: number
}

export interface GameSave {
  id: string
  gameId: string
  data: StoredBinary
  hash?: string
  createdAt: number
  updatedAt: number
}

export type SaveRecord = GameSave

export type SaveStateSlot = 'auto' | 'quick' | '1' | '2' | '3'

export interface SaveStateRecord {
  id: string
  gameId: string
  slot: SaveStateSlot
  name: string
  stateData: StoredBinary
  screenshotId?: string
  createdAt: number
  updatedAt: number
}

export interface ScreenshotRecord {
  id: string
  gameId: string
  blob: StoredBinary
  createdAt: number
  source: 'save-state' | 'manual'
}

export interface CheatRecord {
  id: string
  gameId: string
  name: string
  code: string
  enabled: boolean
  createdAt: number
  updatedAt: number
}

export interface SettingRecord {
  key: string
  value: unknown
  updatedAt: number
}

export interface PlaySession {
  id: string
  gameId: string
  startedAt: number
  endedAt?: number
  durationMs: number
}

export type SessionRecord = PlaySession
