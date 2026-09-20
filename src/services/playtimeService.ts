import { gameRepository, type GameRepository } from '@/storage/gameRepository'
import { sessionRepository, type SessionRepository } from '@/storage/sessionRepository'
import { createId } from '@/utils/createId'

export class PlaytimeService {
  private sessionId?: string
  private activeSince?: number
  private queue: Promise<void> = Promise.resolve()
  constructor(
    private readonly gameId: string,
    private readonly sessions: SessionRepository = sessionRepository,
    private readonly games: GameRepository = gameRepository,
    private readonly now: () => number = Date.now,
  ) {}

  async start() {
    if (this.sessionId) { this.resume(); return }
    const now = this.now()
    this.sessionId = createId()
    this.activeSince = document.visibilityState === 'visible' ? now : undefined
    await Promise.all([
      this.sessions.add({ id: this.sessionId, gameId: this.gameId, startedAt: now, durationMs: 0 }),
      this.games.update(this.gameId, { lastPlayedAt: now }),
    ])
  }

  resume() { if (this.sessionId && this.activeSince === undefined && document.visibilityState === 'visible') this.activeSince = this.now() }

  pause() {
    if (!this.sessionId || this.activeSince === undefined) return this.queue
    const endedAt = this.now()
    const duration = Math.max(0, endedAt - this.activeSince)
    this.activeSince = undefined
    const sessionId = this.sessionId
    this.queue = this.queue.then(() => this.sessions.addDuration(sessionId, this.gameId, duration, endedAt))
    return this.queue
  }

  async close() {
    await this.pause()
    await this.queue
    if (this.sessionId) await this.sessions.update(this.sessionId, { endedAt: this.now() })
    this.sessionId = undefined
  }
}
