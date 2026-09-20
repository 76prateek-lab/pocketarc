import { touchButtonHandlers, type TouchActionHandler } from '@/input/touch'
import styles from './TouchControls.module.css'

export function ActionButtons({ onAction }: { onAction: TouchActionHandler }) {
  return <div className={styles.actions} aria-label="Action controls"><button type="button" className={`${styles.touchButton} ${styles.b}`} {...touchButtonHandlers('B', onAction)}>B</button><button type="button" className={`${styles.touchButton} ${styles.a}`} {...touchButtonHandlers('A', onAction)}>A</button></div>
}
