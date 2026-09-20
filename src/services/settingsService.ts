import { APP_COMMANDS, GAME_ACTIONS, type GamepadMapping, type InputBinding, type InputSettings, type KeyboardMapping } from '@/input/inputTypes'
import { DEFAULT_GAMEPAD_MAPPING, DEFAULT_KEYBOARD_MAPPING, mergeInputSettings } from '@/input/mappings'
import { DEFAULT_TOUCH_LAYOUTS, validateTouchLayouts } from '@/input/touchLayout'
import { settingsRepository } from '@/storage/settingsRepository'
import type { AppSettings, ColorTheme, DisplayFilter, DisplaySettings, FullscreenBehavior, GameSettings, ScreenFit, TouchLayout, TouchSettings } from '@/types/settings'

export const DEFAULT_APP_SETTINGS: AppSettings = { version: 1, appearance: { theme: 'system' }, general: { launchLastGame: false, confirmRestart: true, keepAwake: true }, display: { integerScaling: false, smoothFiltering: true, screenFit: 'contain', fullscreenBehavior: 'app', filter: 'original' }, touch: { showControls: true, opacity: .82, size: 1, haptics: true, layout: 'standard', layouts: DEFAULT_TOUCH_LAYOUTS }, keyboard: DEFAULT_KEYBOARD_MAPPING, gamepad: DEFAULT_GAMEPAD_MAPPING, audio: { masterVolume: .5, muted: false } }
const themes: ColorTheme[] = ['system', 'light', 'dark']; const screenFits: ScreenFit[] = ['contain', 'fill', 'pixel-perfect']; const fullscreenBehaviors: FullscreenBehavior[] = ['app', 'screen']; const displayFilters: DisplayFilter[] = ['original', 'sharp', 'smooth']; const touchLayouts: TouchLayout[] = ['standard', 'compact']; const bindings = [...GAME_ACTIONS, ...APP_COMMANDS] as InputBinding[]

export function validateAppSettings(value: unknown, legacyInput?: unknown): AppSettings {
  const root = object(value); const legacy = mergeInputSettings(legacyInput); const appearance = object(root.appearance); const general = object(root.general); const audio = object(root.audio)
  return { version: 1, appearance: { theme: enumeration(appearance.theme, themes, 'system') }, general: { launchLastGame: bool(general.launchLastGame, false), confirmRestart: bool(general.confirmRestart, true), keepAwake: bool(general.keepAwake, true) }, display: validateDisplay(root.display), touch: validateTouch(root.touch, legacy), keyboard: validateKeyboard(root.keyboard, legacy.keyboard), gamepad: validateGamepad(root.gamepad, legacy.gamepad), audio: { masterVolume: clamp(audio.masterVolume, 0, 1, .5), muted: bool(audio.muted, false) } }
}

export function validateGameSettings(gameId: string, value: unknown): GameSettings {
  const root = object(value); const controls = object(root.controls); const result: GameSettings = { gameId }
  if (root.display && typeof root.display === 'object') result.display = partialDisplay(root.display)
  if (root.controls && typeof root.controls === 'object') result.controls = { ...(controls.touch ? { touch: partialTouch(controls.touch) } : {}), ...(controls.keyboard ? { keyboard: partialKeyboard(controls.keyboard) } : {}), ...(controls.gamepad ? { gamepad: partialGamepad(controls.gamepad) } : {}) }
  if (typeof root.volume === 'number') result.volume = clamp(root.volume, 0, 1, .5)
  if (typeof root.muted === 'boolean') result.muted = root.muted
  const fast = object(root.fastForward); if (Object.keys(fast).length) result.fastForward = { ...(typeof fast.enabledByDefault === 'boolean' ? { enabledByDefault: fast.enabledByDefault } : {}), ...([2, 4].includes(Number(fast.multiplier)) ? { multiplier: Number(fast.multiplier) as 2 | 4 } : {}) }
  return result
}

export function resolveGameSettings(global: AppSettings, overrides?: GameSettings) { return { display: { ...global.display, ...overrides?.display }, touch: { ...global.touch, ...overrides?.controls?.touch }, keyboard: { ...global.keyboard, ...overrides?.controls?.keyboard }, gamepad: { ...global.gamepad, ...overrides?.controls?.gamepad }, audio: { masterVolume: overrides?.volume ?? global.audio.masterVolume, muted: overrides?.muted ?? global.audio.muted }, fastForward: { enabledByDefault: overrides?.fastForward?.enabledByDefault ?? false, multiplier: overrides?.fastForward?.multiplier ?? 2 } } }
export function toInputSettings(settings: AppSettings): InputSettings { return { keyboard: settings.keyboard, gamepad: settings.gamepad, touchOpacity: settings.touch.opacity, touchSize: settings.touch.size, touchLayout: settings.touch.layout, touchLayouts: settings.touch.layouts, showTouchControls: settings.touch.showControls, haptics: settings.touch.haptics } }
export function toResolvedInputSettings(settings: ReturnType<typeof resolveGameSettings>): InputSettings { return { keyboard: settings.keyboard, gamepad: settings.gamepad, touchOpacity: settings.touch.opacity, touchSize: settings.touch.size, touchLayout: settings.touch.layout, touchLayouts: settings.touch.layouts, showTouchControls: settings.touch.showControls, haptics: settings.touch.haptics } }

export class SettingsService {
  async getAppSettings(repair = true) { const [stored, legacy] = await Promise.all([settingsRepository.get('appSettings'), settingsRepository.get('inputSettings')]); const repaired = validateAppSettings(stored?.value, legacy?.value); if (repair && JSON.stringify(stored?.value) !== JSON.stringify(repaired)) await settingsRepository.set('appSettings', repaired); return repaired }
  async saveAppSettings(value: unknown) { const validated = validateAppSettings(value); await settingsRepository.set('appSettings', validated); return validated }
  resetAppSettings() { return this.saveAppSettings(DEFAULT_APP_SETTINGS) }
  async getGameSettings(gameId: string, repair = true) { const record = await settingsRepository.get(`gameSettings:${gameId}`); const repaired = validateGameSettings(gameId, record?.value); if (repair && record && JSON.stringify(record.value) !== JSON.stringify(repaired)) await settingsRepository.set(`gameSettings:${gameId}`, repaired); return repaired }
  async saveGameSettings(gameId: string, value: unknown) { const validated = validateGameSettings(gameId, value); await settingsRepository.set(`gameSettings:${gameId}`, validated); return validated }
}

function validateDisplay(value: unknown): DisplaySettings { const v = object(value); return { integerScaling: bool(v.integerScaling, false), smoothFiltering: bool(v.smoothFiltering, true), screenFit: enumeration(v.screenFit, screenFits, 'contain'), fullscreenBehavior: enumeration(v.fullscreenBehavior, fullscreenBehaviors, 'app'), filter: enumeration(v.filter, displayFilters, 'original') } }
function validateTouch(value: unknown, legacy: InputSettings): TouchSettings { const v = object(value); return { showControls: bool(v.showControls, true), opacity: clamp(v.opacity, .3, 1, legacy.touchOpacity), size: clamp(v.size, .75, 1.25, 1), haptics: bool(v.haptics, legacy.haptics), layout: enumeration(v.layout, touchLayouts, 'standard'), layouts: validateTouchLayouts(v.layouts) } }
function validateKeyboard(value: unknown, fallback: KeyboardMapping) { const v = object(value); return Object.fromEntries(bindings.map((key) => [key, typeof v[key] === 'string' && v[key] ? v[key] : fallback[key]])) as KeyboardMapping }
function validateGamepad(value: unknown, fallback: GamepadMapping) { const v = object(value); return Object.fromEntries(GAME_ACTIONS.map((key) => [key, integer(v[key], 0, 31, fallback[key])])) as GamepadMapping }
function partialDisplay(value: unknown) { const v = object(value); return { ...(typeof v.integerScaling === 'boolean' ? { integerScaling: v.integerScaling } : {}), ...(typeof v.smoothFiltering === 'boolean' ? { smoothFiltering: v.smoothFiltering } : {}), ...(screenFits.includes(v.screenFit as ScreenFit) ? { screenFit: v.screenFit as ScreenFit } : {}), ...(fullscreenBehaviors.includes(v.fullscreenBehavior as FullscreenBehavior) ? { fullscreenBehavior: v.fullscreenBehavior as FullscreenBehavior } : {}), ...(displayFilters.includes(v.filter as DisplayFilter) ? { filter: v.filter as DisplayFilter } : {}) } }
function partialTouch(value: unknown) { const v = object(value); return { ...(typeof v.showControls === 'boolean' ? { showControls: v.showControls } : {}), ...(typeof v.opacity === 'number' ? { opacity: clamp(v.opacity, .3, 1, .82) } : {}), ...(typeof v.size === 'number' ? { size: clamp(v.size, .75, 1.25, 1) } : {}), ...(typeof v.haptics === 'boolean' ? { haptics: v.haptics } : {}), ...(touchLayouts.includes(v.layout as TouchLayout) ? { layout: v.layout as TouchLayout } : {}), ...(v.layouts && typeof v.layouts === 'object' ? { layouts: validateTouchLayouts(v.layouts) } : {}) } }
function partialKeyboard(value: unknown) { const v = object(value); return Object.fromEntries(bindings.filter((key) => typeof v[key] === 'string' && v[key]).map((key) => [key, v[key]])) as Partial<KeyboardMapping> }
function partialGamepad(value: unknown) { const v = object(value); return Object.fromEntries(GAME_ACTIONS.filter((key) => typeof v[key] === 'number' && Number.isInteger(v[key]) && Number(v[key]) >= 0 && Number(v[key]) <= 31).map((key) => [key, v[key]])) as Partial<GamepadMapping> }
function object(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {} }
function bool(value: unknown, fallback: boolean) { return typeof value === 'boolean' ? value : fallback }
function clamp(value: unknown, min: number, max: number, fallback: number) { return typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback }
function integer(value: unknown, min: number, max: number, fallback: number) { return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max ? value : fallback }
function enumeration<T extends string>(value: unknown, values: T[], fallback: T) { return values.includes(value as T) ? value as T : fallback }
export const settingsService = new SettingsService()
