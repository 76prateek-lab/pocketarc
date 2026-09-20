import type { PocketGBADatabase } from '@/storage/db'
import { db } from '@/storage/db'
import type { SessionRecord } from '@/storage/schema'

export class SessionRepository {
  constructor(private readonly database: PocketGBADatabase = db) {}
  add(session: SessionRecord) { return this.database.sessions.add(session) }
  forGame(gameId: string) { return this.database.sessions.where('gameId').equals(gameId).toArray() }
  update(id: string, changes: Partial<SessionRecord>) { return this.database.sessions.update(id, changes) }

  async addDuration(sessionId: string, gameId: string, durationMs: number, playedAt: number) {
    if (durationMs <= 0) return
    await this.database.transaction('rw', [this.database.sessions, this.database.games], async () => {
      const [session, game] = await Promise.all([this.database.sessions.get(sessionId), this.database.games.get(gameId)])
      if (!session || !game) return
      await Promise.all([
        this.database.sessions.update(sessionId, { durationMs: session.durationMs + durationMs }),
        this.database.games.update(gameId, { totalPlayTimeMs: game.totalPlayTimeMs + durationMs, lastPlayedAt: playedAt }),
      ])
    })
  }
}

export const sessionRepository = new SessionRepository()
