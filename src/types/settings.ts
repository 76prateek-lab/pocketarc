import type { GamepadMapping, KeyboardMapping } from '@/input/inputTypes'
import type { TouchLayouts } from '@/input/touchLayout'

export type ScreenFit = 'contain' | 'fill' | 'pixel-perfect'
export type FullscreenBehavior = 'app' | 'screen'
export type TouchLayout = 'standard' | 'compact'
export type DisplayFilter = 'original' | 'sharp' | 'smooth'
export type ColorTheme = 'system' | 'light' | 'dark'
export interface GeneralSettings { launchLastGame: boolean; confirmRestart: boolean; keepAwake: boolean }
export interface AppearanceSettings { theme: ColorTheme }
export interface DisplaySettings { integerScaling: boolean; smoothFiltering: boolean; screenFit: ScreenFit; fullscreenBehavior: FullscreenBehavior; filter: DisplayFilter }
export interface TouchSettings { showControls: boolean; opacity: number; size: number; haptics: boolean; layout: TouchLayout; layouts: TouchLayouts }
export interface AudioSettings { masterVolume: number; muted: boolean }
export interface AppSettings { version: 1; appearance: AppearanceSettings; general: GeneralSettings; display: DisplaySettings; touch: TouchSettings; keyboard: KeyboardMapping; gamepad: GamepadMapping; audio: AudioSettings }
export interface GameSettings { gameId: string; display?: Partial<DisplaySettings>; controls?: { touch?: Partial<TouchSettings>; keyboard?: Partial<KeyboardMapping>; gamepad?: Partial<GamepadMapping> }; volume?: number; muted?: boolean; fastForward?: { enabledByDefault?: boolean; multiplier?: 2 | 4 } }
