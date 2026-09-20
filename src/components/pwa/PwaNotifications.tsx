import { useSyncExternalStore } from 'react'
import { CheckCircle2, Download, X } from 'lucide-react'
import { emulatorManager } from '@/emulator/EmulatorManager'
import { pwaService } from '@/services/pwaService'
import styles from './PwaControls.module.css'

export function PwaNotifications() {
  const pwa = useSyncExternalStore(pwaService.subscribe, pwaService.getSnapshot, pwaService.getSnapshot)
  const emulator = useSyncExternalStore(emulatorManager.subscribe, emulatorManager.getSnapshot, emulatorManager.getSnapshot)
  const gameplayActive = !['idle', 'error'].includes(emulator.state)
  if (!pwa.offlineReady && !pwa.updateAvailable) return null
  return <div className={gameplayActive ? `${styles.notifications} ${styles.gameplayNotifications}` : styles.notifications} aria-live="polite">
    {pwa.updateAvailable && <section className={styles.notice} aria-label="Application update"><Download size={18}/><div><strong>Update ready</strong><span>{pwa.updateDeferred ? 'It will install when you leave the game.' : 'A new PocketArc version is available.'}</span></div><button className={styles.noticeAction} type="button" disabled={pwa.updating || pwa.updateDeferred} onClick={() => void pwaService.requestUpdate()}>{pwa.updating ? 'Updating…' : gameplayActive ? 'Update after game' : 'Update now'}</button>{!pwa.updateDeferred && <button className={styles.close} type="button" aria-label="Dismiss update" onClick={() => pwaService.dismissUpdate()}><X size={16}/></button>}</section>}
    {pwa.offlineReady && <section className={styles.notice} aria-label="Offline status"><CheckCircle2 size={18}/><div><strong>Ready offline</strong><span>PocketArc and the emulator are available without a network.</span></div><button className={styles.close} type="button" aria-label="Dismiss offline notification" onClick={() => pwaService.dismissOfflineReady()}><X size={16}/></button></section>}
  </div>
}
