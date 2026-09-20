import { useEffect, useState, type CSSProperties } from 'react'
import { DPad } from '@/components/emulator/DPad'
import { vibrateInput } from '@/input/haptics'
import { touchButtonHandlers } from '@/input/touch'
import type { GameAction } from '@/input/inputTypes'
import type { InputManager } from '@/input/InputManager'
import type { NormalizedControlPosition, TouchControlId, TouchOrientation } from '@/input/touchLayout'
import styles from './TouchControls.module.css'

export function TouchControls({ manager }: { manager: InputManager }) {
  const { haptics, showTouchControls, touchLayouts, touchOpacity, touchSize } = manager.snapshot().settings
  const orientation = useOrientation(); const layout = touchLayouts[orientation]
  const onAction = (action: GameAction, pressed: boolean, pointerId: number) => { if (pressed) vibrateInput(haptics); manager.touch(action, pressed, pointerId) }
  if (!showTouchControls) return null
  const control = (id: Exclude<TouchControlId, 'dpad'>, action: GameAction, label: string) => <div className={styles.positioned} style={positionStyle(id, layout[id], touchSize)} data-control={id}><button type="button" className={`${styles.touchButton} ${styles[id]}`} {...touchButtonHandlers(action, onAction)}>{label}</button></div>
  return <section className={styles.controls} style={{ '--touch-opacity': touchOpacity } as CSSProperties} aria-label="Touch game controls" data-orientation={orientation}>
    <div className={`${styles.positioned} ${styles.dpadPosition}`} style={positionStyle('dpad', layout.dpad, touchSize)} data-control="dpad"><DPad onAction={onAction}/></div>
    {control('a', 'A', 'A')}{control('b', 'B', 'B')}{control('l', 'L', 'L')}{control('r', 'R', 'R')}{control('start', 'START', 'Start')}{control('select', 'SELECT', 'Select')}
  </section>
}

const SIZES: Record<TouchControlId, [number, number]> = { dpad: [132, 132], a: [68, 68], b: [68, 68], l: [80, 44], r: [80, 44], start: [72, 40], select: [72, 40] }
function positionStyle(id: TouchControlId, position: NormalizedControlPosition, globalScale: number): CSSProperties { const scale = position.scale * globalScale; return { '--control-x': `${position.x * 100}%`, '--control-y': `${position.y * 100}%`, '--control-scale': scale, '--half-width': `${SIZES[id][0] * scale / 2}px`, '--half-height': `${SIZES[id][1] * scale / 2}px` } as CSSProperties }
function useOrientation(): TouchOrientation {
  const read = (): TouchOrientation => window.matchMedia('(orientation: landscape)').matches ? 'landscape' : 'portrait'
  const [orientation, setOrientation] = useState<TouchOrientation>(read)
  useEffect(() => { const query = window.matchMedia('(orientation: landscape)'); const update = () => setOrientation(read()); query.addEventListener('change', update); window.addEventListener('resize', update); return () => { query.removeEventListener('change', update); window.removeEventListener('resize', update) } }, [])
  return orientation
}
