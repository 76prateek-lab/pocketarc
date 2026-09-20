import { CircleAlert } from 'lucide-react'
import { Button } from '@/components/ui'
import styles from './EmulatorShell.module.css'

export function EmulatorError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return <div className={styles.overlay} role="alert"><CircleAlert size={24}/><strong>Unable to start emulator</strong><span>{message}</span><Button onClick={onRetry}>Try again</Button></div>
}
