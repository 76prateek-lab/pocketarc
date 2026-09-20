import type { Game } from '@/types/game'
import type { EmulatorLaunchConfig } from '@/emulator/emulatorTypes'

export const EMULATOR_FRAME_URL = '/emulatorjs/frame.html'
export const EMULATOR_DATA_PATH = '/emulatorjs/data/' as const

export function createEmulatorConfig(game: Game, gameUrl: string): EmulatorLaunchConfig {
  return {
    player: '#game',
    core: 'gba',
    gameUrl,
    gameName: game.title,
    gameId: numericGameId(game.romHash),
    pathToData: EMULATOR_DATA_PATH,
  }
}

function numericGameId(hash: string) {
  const value = Number.parseInt(hash.slice(0, 8), 16)
  return Number.isSafeInteger(value) ? value : 1
}
