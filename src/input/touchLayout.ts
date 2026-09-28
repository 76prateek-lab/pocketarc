export const TOUCH_CONTROL_IDS = ['dpad', 'a', 'b', 'l', 'r', 'start', 'select'] as const
export type TouchControlId = typeof TOUCH_CONTROL_IDS[number]
export type TouchOrientation = 'portrait' | 'landscape'
export type TouchPreset = 'default' | 'compact' | 'large'
export interface NormalizedControlPosition { x: number; y: number; scale: number }
export type TouchControlLayout = Record<TouchControlId, NormalizedControlPosition>
export interface TouchLayouts { portrait: TouchControlLayout; landscape: TouchControlLayout }

const portrait: TouchControlLayout = {
  dpad: { x: .22, y: .47, scale: 1 }, a: { x: .82, y: .39, scale: 1 }, b: { x: .65, y: .55, scale: 1 },
  l: { x: .17, y: .08, scale: 1 }, r: { x: .83, y: .08, scale: 1 }, start: { x: .63, y: .82, scale: 1 }, select: { x: .37, y: .82, scale: 1 },
}
const legacyPortrait: TouchControlLayout = {
  dpad: { x: .22, y: .68, scale: 1 }, a: { x: .82, y: .58, scale: 1 }, b: { x: .66, y: .73, scale: 1 },
  l: { x: .18, y: .17, scale: 1 }, r: { x: .82, y: .17, scale: 1 }, start: { x: .57, y: .89, scale: 1 }, select: { x: .37, y: .89, scale: 1 },
}
const landscape: TouchControlLayout = {
  dpad: { x: .16, y: .72, scale: .9 }, a: { x: .88, y: .62, scale: 1 }, b: { x: .76, y: .76, scale: 1 },
  l: { x: .12, y: .16, scale: 1 }, r: { x: .88, y: .16, scale: 1 }, start: { x: .56, y: .87, scale: .9 }, select: { x: .44, y: .87, scale: .9 },
}

export const DEFAULT_TOUCH_LAYOUTS: TouchLayouts = { portrait, landscape }

export function presetTouchLayouts(preset: TouchPreset): TouchLayouts {
  const scale = preset === 'compact' ? .82 : preset === 'large' ? 1.18 : 1
  return mapLayouts(DEFAULT_TOUCH_LAYOUTS, (position) => ({ ...position, scale: clamp(position.scale * scale, .7, 1.3) }))
}

export function validateTouchLayouts(value: unknown): TouchLayouts {
  const root = record(value)
  return {
    portrait: migrateLegacyPortrait(validateLayout(root.portrait, DEFAULT_TOUCH_LAYOUTS.portrait)),
    landscape: validateLayout(root.landscape, DEFAULT_TOUCH_LAYOUTS.landscape),
  }
}

function migrateLegacyPortrait(layout: TouchControlLayout): TouchControlLayout {
  return Object.fromEntries(TOUCH_CONTROL_IDS.map((id) => {
    const current = layout[id]
    const legacy = legacyPortrait[id]
    return [id, current.x === legacy.x && current.y === legacy.y
      ? { ...DEFAULT_TOUCH_LAYOUTS.portrait[id], scale: current.scale }
      : current]
  })) as unknown as TouchControlLayout
}

export function clampControlPosition(position: NormalizedControlPosition): NormalizedControlPosition {
  return { x: clamp(position.x, .04, .96), y: clamp(position.y, .04, .96), scale: clamp(position.scale, .7, 1.3) }
}

function validateLayout(value: unknown, fallback: TouchControlLayout): TouchControlLayout {
  const source = record(value)
  return Object.fromEntries(TOUCH_CONTROL_IDS.map((id) => {
    const current = record(source[id]); const base = fallback[id]
    return [id, clampControlPosition({ x: number(current.x, base.x), y: number(current.y, base.y), scale: number(current.scale, base.scale) })]
  })) as unknown as TouchControlLayout
}
function mapLayouts(layouts: TouchLayouts, mapper: (position: NormalizedControlPosition) => NormalizedControlPosition): TouchLayouts {
  return Object.fromEntries((['portrait', 'landscape'] as const).map((orientation) => [orientation, Object.fromEntries(TOUCH_CONTROL_IDS.map((id) => [id, mapper(layouts[orientation][id])]))])) as unknown as TouchLayouts
}
function record(value: unknown): Record<string, unknown> { return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {} }
function number(value: unknown, fallback: number) { return typeof value === 'number' && Number.isFinite(value) ? value : fallback }
function clamp(value: number, min: number, max: number) { return Math.min(max, Math.max(min, value)) }
