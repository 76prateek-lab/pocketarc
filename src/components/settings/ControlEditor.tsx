import { useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react'
import { RotateCcw } from 'lucide-react'
import { Button, Select } from '@/components/ui'
import { clampControlPosition, presetTouchLayouts, TOUCH_CONTROL_IDS, type TouchControlId, type TouchLayouts, type TouchOrientation, type TouchPreset } from '@/input/touchLayout'
import type { TouchSettings } from '@/types/settings'
import styles from './ControlEditor.module.css'

const LABELS: Record<TouchControlId, string> = { dpad: 'D-pad', a: 'A', b: 'B', l: 'L', r: 'R', start: 'Start', select: 'Select' }
const BASE_SIZE: Record<TouchControlId, [number, number]> = { dpad: [132, 132], a: [74, 74], b: [74, 74], l: [92, 48], r: [92, 48], start: [84, 46], select: [84, 46] }

export function ControlEditor({ value, onSave, onCancel }: { value: TouchSettings; onSave: (value: TouchSettings) => void | Promise<void>; onCancel: () => void }) {
  const [draft, setDraft] = useState(value); const [orientation, setOrientation] = useState<TouchOrientation>('portrait'); const [selected, setSelected] = useState<TouchControlId>('dpad'); const viewport = useRef<HTMLDivElement>(null)
  const layout = draft.layouts[orientation]
  function updateLayouts(layouts: TouchLayouts) { setDraft((current) => ({ ...current, layouts })) }
  function updateControl(id: TouchControlId, next: Partial<{ x: number; y: number; scale: number }>) { updateLayouts({ ...draft.layouts, [orientation]: { ...layout, [id]: clampControlPosition({ ...layout[id], ...next }) } }) }
  function moveFromPointer(id: TouchControlId, event: PointerEvent<HTMLButtonElement>) {
    const rect = viewport.current?.getBoundingClientRect(); if (!rect) return
    const [width, height] = BASE_SIZE[id]; const scale = layout[id].scale * draft.size; const padding = 12
    const minX = (padding + width * scale / 2) / rect.width; const maxX = 1 - minX; const minY = (padding + height * scale / 2) / rect.height; const maxY = 1 - minY
    updateControl(id, { x: Math.min(maxX, Math.max(minX, (event.clientX - rect.left) / rect.width)), y: Math.min(maxY, Math.max(minY, (event.clientY - rect.top) / rect.height)) })
  }
  function pointerDown(id: TouchControlId, event: PointerEvent<HTMLButtonElement>) { setSelected(id); event.currentTarget.setPointerCapture(event.pointerId); moveFromPointer(id, event) }
  function keyMove(id: TouchControlId, event: KeyboardEvent<HTMLButtonElement>) { const delta = event.shiftKey ? .05 : .01; const moves: Partial<Record<string, [number, number]>> = { ArrowLeft: [-delta, 0], ArrowRight: [delta, 0], ArrowUp: [0, -delta], ArrowDown: [0, delta] }; const move = moves[event.key]; if (!move) return; event.preventDefault(); updateControl(id, { x: layout[id].x + move[0], y: layout[id].y + move[1] }) }
  function applyPreset(preset: TouchPreset) { setDraft((current) => ({ ...current, layouts: presetTouchLayouts(preset), size: 1 })); setSelected('dpad') }
  return <div className={styles.editor}>
    <div className={styles.toolbar}>
      <div className={styles.segmented} aria-label="Preview orientation">{(['portrait', 'landscape'] as const).map((item) => <button key={item} type="button" aria-pressed={orientation === item} onClick={() => setOrientation(item)}>{item}</button>)}</div>
      <Select label="Control preset" labelHidden defaultValue="default" onChange={(event) => applyPreset(event.target.value as TouchPreset)}><option value="default">Default</option><option value="compact">Compact</option><option value="large">Large</option></Select>
    </div>
    <p className={styles.instructions}>Drag a control to move it. Select one and use arrow keys for precise positioning.</p>
    <div ref={viewport} className={`${styles.viewport} ${styles[orientation]}`} aria-label={`${orientation} gameplay viewport preview`} style={{ '--editor-opacity': draft.opacity } as CSSProperties}>
      <div className={styles.gameScreen}><span>Gameplay viewport</span></div>
      {TOUCH_CONTROL_IDS.map((id) => { const position = layout[id]; const scale = position.scale * draft.size; return <button key={id} type="button" className={`${styles.control} ${styles[id]} ${selected === id ? styles.selected : ''}`} style={{ '--item-x': `${position.x * 100}%`, '--item-y': `${position.y * 100}%`, '--item-scale': scale, '--safe-half-width': `${BASE_SIZE[id][0] * scale / 2}px`, '--safe-half-height': `${BASE_SIZE[id][1] * scale / 2}px` } as CSSProperties} aria-label={`Move ${LABELS[id]} control`} onPointerDown={(event) => pointerDown(id, event)} onPointerMove={(event) => { if (event.currentTarget.hasPointerCapture(event.pointerId)) moveFromPointer(id, event) }} onKeyDown={(event) => keyMove(id, event)}>{id === 'dpad' ? <span className={styles.dpadShape}>+</span> : LABELS[id]}</button> })}
    </div>
    <div className={styles.adjustments}>
      <label><span>{LABELS[selected]} size</span><input aria-label="Selected control size" type="range" min={.7} max={1.3} step={.05} value={layout[selected].scale} onChange={(event) => updateControl(selected, { scale: Number(event.target.value) })}/><output>{Math.round(layout[selected].scale * 100)}%</output></label>
      <label><span>Opacity</span><input aria-label="Editor control opacity" type="range" min={.3} max={1} step={.05} value={draft.opacity} onChange={(event) => setDraft((current) => ({ ...current, opacity: Number(event.target.value) }))}/><output>{Math.round(draft.opacity * 100)}%</output></label>
    </div>
    <footer className={styles.actions}><Button variant="ghost" onClick={() => setDraft((current) => ({ ...current, layouts: presetTouchLayouts('default'), size: 1 }))}><RotateCcw size={15}/>Reset Layout</Button><span/><Button onClick={onCancel}>Cancel</Button><Button variant="primary" onClick={() => void onSave(draft)}>Save layout</Button></footer>
  </div>
}
