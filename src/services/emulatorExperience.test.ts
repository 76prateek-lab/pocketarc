import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PocketGBADatabase } from '@/storage/db'
import { GameRepository } from '@/storage/gameRepository'
import { SessionRepository } from '@/storage/sessionRepository'
import { PlaytimeService } from '@/services/playtimeService'
import { WakeLockService } from '@/services/wakeLockService'

let database: PocketGBADatabase
beforeEach(() => { database = new PocketGBADatabase(`PocketGBA-experience-${crypto.randomUUID()}`) })
afterEach(async () => { vi.restoreAllMocks(); database.close(); await database.delete() })

describe('emulator product services', () => {
  it('counts only active play segments and updates real library metadata', async () => {
    const games = new GameRepository(database); const sessions = new SessionRepository(database)
    await database.games.add({ id: 'game-1', romId: 'rom-1', title: 'Test', fileName: 'test.gba', fileSize: 1, romHash: 'hash', favorite: false, addedAt: 1, totalPlayTimeMs: 100, source: 'imported' })
    const times = [1_000, 2_500, 3_000, 5_000, 5_100]
    const playtime = new PlaytimeService('game-1', sessions, games, () => times.shift() ?? 5_100)
    await playtime.start(); await playtime.pause(); playtime.resume(); await playtime.close()
    expect(await games.get('game-1')).toMatchObject({ totalPlayTimeMs: 3_600, lastPlayedAt: 5_000 })
    expect(await sessions.forGame('game-1')).toEqual([expect.objectContaining({ durationMs: 3_500, endedAt: 5_100 })])
  })

  it('treats wake lock denial as optional and releases a granted lock on pause', async () => {
    const denied = new WakeLockService({ request: vi.fn().mockRejectedValue(new Error('denied')) })
    await expect(denied.setPlaying(true)).resolves.toBeUndefined()
    const sentinel = Object.assign(new EventTarget(), { released: false, type: 'screen' as const, release: vi.fn(async function (this: { released: boolean }) { this.released = true }) }) as unknown as WakeLockSentinel
    const granted = new WakeLockService({ request: vi.fn().mockResolvedValue(sentinel) })
    await granted.setPlaying(true); await granted.setPlaying(false)
    expect(sentinel.release).toHaveBeenCalledOnce()
  })
})
