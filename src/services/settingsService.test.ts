import { describe, expect, it } from 'vitest'
import { DEFAULT_APP_SETTINGS, resolveGameSettings, validateAppSettings, validateGameSettings } from '@/services/settingsService'

describe('settings schema', () => {
  it('repairs missing and malformed global values', () => {
    const repaired = validateAppSettings({ appearance: { theme: 'neon' }, general: { launchLastGame: 'yes', confirmRestart: false }, display: { screenFit: 'broken' }, touch: { opacity: 8, size: -4 }, audio: { masterVolume: Number.NaN, muted: 'no' }, keyboard: { A: 4 }, gamepad: { A: 99 } })
    expect(repaired.appearance).toEqual({ theme: 'system' })
    expect(repaired.general).toEqual({ launchLastGame: false, confirmRestart: false, keepAwake: true })
    expect(repaired.display.screenFit).toBe('contain')
    expect(repaired.touch).toMatchObject({ opacity: 1, size: .75 })
    expect(repaired.audio).toEqual(DEFAULT_APP_SETTINGS.audio)
    expect(repaired.keyboard.A).toBe('KeyX')
    expect(repaired.gamepad.A).toBe(0)
  })

  it('keeps per-game overrides sparse and inherits global settings', () => {
    const game = validateGameSettings('game-1', { display: { smoothFiltering: false, screenFit: 'invalid' }, controls: { touch: { opacity: .1 } }, volume: 2, fastForward: { multiplier: 4 } })
    expect(game).toEqual({ gameId: 'game-1', display: { smoothFiltering: false }, controls: { touch: { opacity: .3 } }, volume: 1, fastForward: { multiplier: 4 } })
    expect(resolveGameSettings(DEFAULT_APP_SETTINGS, game)).toMatchObject({ display: { screenFit: 'contain', smoothFiltering: false }, audio: { masterVolume: 1 }, fastForward: { multiplier: 4 } })
  })
})
