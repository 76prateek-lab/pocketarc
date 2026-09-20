import { Settings, X } from 'lucide-react'
import { IconButton, Tooltip } from '@/components/ui'
import styles from './EmulatorShell.module.css'

type Props = { onExit: () => void; onSettings: () => void }

export function EmulatorToolbar({ onExit, onSettings }: Props) {
  return <nav className={styles.toolbar} aria-label="Gameplay controls">
    <Tooltip content="Play settings"><IconButton className={styles.compactAction} label="Open play menu" onClick={onSettings}><Settings size={19}/></IconButton></Tooltip>
    <Tooltip content="Exit game"><IconButton className={styles.compactAction} label="Exit game" onClick={onExit}><X size={20}/></IconButton></Tooltip>
  </nav>
}
