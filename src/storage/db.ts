import Dexie, { type EntityTable } from 'dexie'
import { configureMigrations } from '@/storage/migrations'
import type {
  CoverRecord,
  CheatRecord,
  GameRecord,
  RomRecord,
  SaveRecord,
  SaveStateRecord,
  ScreenshotRecord,
  SessionRecord,
  SettingRecord,
} from '@/storage/schema'

export class PocketGBADatabase extends Dexie {
  games!: EntityTable<GameRecord, 'id'>
  roms!: EntityTable<RomRecord, 'id'>
  saves!: EntityTable<SaveRecord, 'id'>
  saveStates!: EntityTable<SaveStateRecord, 'id'>
  screenshots!: EntityTable<ScreenshotRecord, 'id'>
  settings!: EntityTable<SettingRecord, 'key'>
  sessions!: EntityTable<SessionRecord, 'id'>
  covers!: EntityTable<CoverRecord, 'id'>
  cheats!: EntityTable<CheatRecord, 'id'>

  constructor(name = 'PocketGBADB') {
    super(name)
    configureMigrations(this)
  }
}

export const db = new PocketGBADatabase()
