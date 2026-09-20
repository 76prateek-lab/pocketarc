import type { GameAction, GamepadMapping, InputSettings, KeyboardMapping } from '@/input/inputTypes'
import { DEFAULT_TOUCH_LAYOUTS, validateTouchLayouts } from '@/input/touchLayout'

export const DEFAULT_KEYBOARD_MAPPING: KeyboardMapping = {
  UP: 'ArrowUp', DOWN: 'ArrowDown', LEFT: 'ArrowLeft', RIGHT: 'ArrowRight',
  A: 'KeyX', B: 'KeyZ', L: 'KeyA', R: 'KeyS', START: 'Enter', SELECT: 'ShiftLeft',
  QUICK_SAVE: 'F5', QUICK_LOAD: 'F9', FAST_FORWARD: 'Space', PAUSE: 'Escape', FULLSCREEN: 'KeyF', MENU: 'KeyM',
}

export const DEFAULT_GAMEPAD_MAPPING: GamepadMapping = {
  A: 0, B: 1, L: 4, R: 5, SELECT: 8, START: 9, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15,
}

export const DEFAULT_INPUT_SETTINGS: InputSettings = {
  keyboard: DEFAULT_KEYBOARD_MAPPING,
  gamepad: DEFAULT_GAMEPAD_MAPPING,
  touchOpacity: 0.82,
  touchSize: 1,
  touchLayout: 'standard',
  touchLayouts: DEFAULT_TOUCH_LAYOUTS,
  showTouchControls: true,
  haptics: true,
}

export const EMULATOR_ACTION_INDEX: Record<GameAction, number> = {
  A: 8, B: 0, L: 10, R: 11, SELECT: 2, START: 3, UP: 4, DOWN: 5, LEFT: 6, RIGHT: 7,
}

export function mergeInputSettings(value: unknown): InputSettings {
  if (!value || typeof value !== 'object') return structuredClone(DEFAULT_INPUT_SETTINGS)
  const partial = value as Partial<InputSettings>
  return {
    keyboard: { ...DEFAULT_KEYBOARD_MAPPING, ...partial.keyboard },
    gamepad: { ...DEFAULT_GAMEPAD_MAPPING, ...partial.gamepad },
    touchOpacity: typeof partial.touchOpacity === 'number' ? Math.min(1, Math.max(0.3, partial.touchOpacity)) : DEFAULT_INPUT_SETTINGS.touchOpacity,
    touchSize: typeof partial.touchSize === 'number' ? Math.min(1.25, Math.max(0.75, partial.touchSize)) : DEFAULT_INPUT_SETTINGS.touchSize,
    touchLayout: partial.touchLayout === 'compact' ? 'compact' : 'standard',
    touchLayouts: validateTouchLayouts(partial.touchLayouts),
    showTouchControls: typeof partial.showTouchControls === 'boolean' ? partial.showTouchControls : true,
    haptics: typeof partial.haptics === 'boolean' ? partial.haptics : DEFAULT_INPUT_SETTINGS.haptics,
  }
}
