import { touchButtonHandlers, type TouchActionHandler } from '@/input/touch'
import styles from './TouchControls.module.css'

export function ShoulderButtons({ onAction }: { onAction: TouchActionHandler }) {
  return <div className={styles.shoulders}><button type="button" className={styles.shoulder} {...touchButtonHandlers('L', onAction)}>L</button><button type="button" className={styles.shoulder} {...touchButtonHandlers('R', onAction)}>R</button></div>
}
