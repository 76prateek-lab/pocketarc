import { describe, expect, it } from 'vitest'
import { DEFAULT_TOUCH_LAYOUTS, presetTouchLayouts, validateTouchLayouts } from '@/input/touchLayout'

describe('normalized touch layouts', () => {
  it('repairs missing and inaccessible coordinates', () => {
    const repaired = validateTouchLayouts({ portrait: { a: { x: -5, y: 8, scale: 9 } } })
    expect(repaired.portrait.a).toEqual({ x: .04, y: .96, scale: 1.3 })
    expect(repaired.portrait.dpad).toEqual(DEFAULT_TOUCH_LAYOUTS.portrait.dpad)
    expect(repaired.landscape).toEqual(DEFAULT_TOUCH_LAYOUTS.landscape)
  })

  it('provides independently sized presets for both orientations', () => {
    expect(presetTouchLayouts('compact').portrait.a.scale).toBeLessThan(1)
    expect(presetTouchLayouts('large').landscape.a.scale).toBeGreaterThan(1)
    expect(presetTouchLayouts('default')).toEqual(DEFAULT_TOUCH_LAYOUTS)
  })
})
