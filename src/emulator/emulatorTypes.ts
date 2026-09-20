import type { Game } from '@/types/game'
import type { GameAction } from '@/input/inputTypes'
import type { DisplaySettings } from '@/types/settings'
import type { CheatRecord } from '@/storage/schema'

export type EmulatorState = 'idle' | 'preparing' | 'loading' | 'ready' | 'running' | 'paused' | 'error' | 'destroying'
export type EmulatorCommand =
  | { type: 'pause' | 'resume' | 'restart' | 'destroy' }
  | { type: 'flush-save'; requestId: string }
  | { type: 'capture-state'; requestId: string }
  | { type: 'load-state'; state: ArrayBuffer }
  | { type: 'input'; action: GameAction; pressed: boolean }
  | { type: 'fast-forward'; ratio: 1 | 2 | 4 }
  | { type: 'cheats'; cheats: Pick<CheatRecord, 'code' | 'enabled'>[] }
  | { type: 'capture-screenshot'; requestId: string }
  | { type: 'volume'; value: number }
  | { type: 'display'; settings: DisplaySettings }

export interface EmulatorSnapshot {
  state: EmulatorState
  gameId?: string
  error?: string
}

export interface EmulatorLaunchConfig {
  player: '#game'
  core: 'gba'
  gameUrl: string
  gameName: string
  gameId: number
  pathToData: '/emulatorjs/data/'
  normalSave?: ArrayBuffer
}

export interface EmulatorLaunchRequest {
  game: Game
  mount: HTMLElement
}

export type EmulatorFrameEvent = 'frame-ready' | 'ready' | 'running' | 'paused' | 'exit' | 'error' | 'normal-save' | 'state-captured' | 'state-error' | 'screenshot-captured' | 'screenshot-error' | 'flush-complete'

export interface EmulatorFrameMessage {
  channel: 'pocketgba-emulator'
  type: EmulatorFrameEvent
  detail?: string
  requestId?: string
  data?: ArrayBuffer
  screenshot?: ArrayBuffer
  screenshotType?: string
  hash?: string
}

export interface CapturedSaveState {
  state: ArrayBuffer
  screenshot?: ArrayBuffer
  screenshotType?: string
}

export interface CapturedScreenshot { data: ArrayBuffer; type: string }
