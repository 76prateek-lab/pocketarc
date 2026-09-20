import type { PocketGBADatabase } from '@/storage/db'
import { db } from '@/storage/db'
import type { GameRecord } from '@/storage/schema'

export class GameRepository {
  constructor(private readonly database: PocketGBADatabase = db) {}

  list() { return this.database.games.orderBy('addedAt').reverse().toArray() }
  get(id: string) { return this.database.games.get(id) }
  findByRomHash(hash: string) { return this.database.games.where('romHash').equals(hash).first() }
  add(record: GameRecord) { return this.database.games.add(record) }
  update(id: string, changes: Partial<GameRecord>) { return this.database.games.update(id, changes) }
  countSaveStates(id: string) { return this.database.saveStates.where('gameId').equals(id).count() }

  async removeWithLocalData(id: string) {
    await this.database.transaction(
      'rw',
      [this.database.games, this.database.roms, this.database.saves, this.database.saveStates, this.database.screenshots, this.database.sessions, this.database.covers, this.database.cheats],
      async () => {
        const game = await this.database.games.get(id)
        if (!game) return
        await Promise.all([
          this.database.saves.where('gameId').equals(id).delete(),
          this.database.saveStates.where('gameId').equals(id).delete(),
          this.database.screenshots.where('gameId').equals(id).delete(),
          this.database.sessions.where('gameId').equals(id).delete(),
          this.database.covers.where('gameId').equals(id).delete(),
          this.database.cheats.where('gameId').equals(id).delete(),
        ])
        await this.database.games.delete(id)
        await this.database.roms.delete(game.romId)
      },
    )
  }
}

export const gameRepository = new GameRepository()
