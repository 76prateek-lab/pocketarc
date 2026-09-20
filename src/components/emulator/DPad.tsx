import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, type LucideIcon } from 'lucide-react'
import type { GameAction } from '@/input/inputTypes'
import { touchButtonHandlers, type TouchActionHandler } from '@/input/touch'
import styles from './TouchControls.module.css'

export function DPad({ onAction }: { onAction: TouchActionHandler }) {
  const button = (action: GameAction, label: string, className: string, Icon: LucideIcon) => <button type="button" aria-label={label} className={`${styles.touchButton} ${className}`} {...touchButtonHandlers(action, onAction)}><Icon size={20} strokeWidth={2.4} aria-hidden="true"/></button>
  return <div className={styles.dpad} aria-label="Directional controls">{button('UP', 'Move up', styles.up, ChevronUp)}{button('LEFT', 'Move left', styles.left, ChevronLeft)}<span className={styles.dpadCenter}/>{button('RIGHT', 'Move right', styles.right, ChevronRight)}{button('DOWN', 'Move down', styles.down, ChevronDown)}</div>
}
