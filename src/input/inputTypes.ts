export const GAME_ACTIONS = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'A', 'B', 'L', 'R', 'START', 'SELECT'] as const
export const APP_COMMANDS = ['QUICK_SAVE', 'QUICK_LOAD', 'FAST_FORWARD', 'PAUSE', 'FULLSCREEN', 'MENU'] as const

export type GameAction = typeof GAME_ACTIONS[number]
export type AppCommand = typeof APP_COMMANDS[number]
export type InputBinding = GameAction | AppCommand
export type InputSource = 'keyboard' | 'gamepad' | 'touch'
export type KeyboardMapping = Record<InputBinding, string>
export type GamepadMapping = Record<GameAction, number>
export type InputSink = (action: GameAction, pressed: boolean) => void
export type CommandSink = (command: AppCommand, pressed: boolean) => void

export interface InputSettings {
  keyboard: KeyboardMapping
  gamepad: GamepadMapping
  touchOpacity: number
  touchSize: number
  touchLayout: 'standard' | 'compact'
  touchLayouts: TouchLayouts
  showTouchControls: boolean
  haptics: boolean
}
import type { TouchLayouts } from '@/input/touchLayout'
