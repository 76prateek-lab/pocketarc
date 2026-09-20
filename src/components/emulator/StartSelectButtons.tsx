import { touchButtonHandlers, type TouchActionHandler } from '@/input/touch'
import styles from './TouchControls.module.css'

export function StartSelectButtons({ onAction }: { onAction: TouchActionHandler }) {
  return <div className={styles.system}><button type="button" className={styles.systemButton} {...touchButtonHandlers('SELECT', onAction)}>Select</button><button type="button" className={styles.systemButton} {...touchButtonHandlers('START', onAction)}>Start</button></div>
}
