import { Gamepad2 } from 'lucide-react'
import styles from './EmulatorShell.module.css'

export function ControllerStatus({ name }: { name?: string }) {
  return <p className={styles.controllerStatus} role="status"><Gamepad2 size={14}/>{name ? name : 'Keyboard ready'}</p>
}
