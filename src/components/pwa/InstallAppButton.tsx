import { useSyncExternalStore } from 'react'
import { Download } from 'lucide-react'
import { installService } from '@/services/installService'
import styles from './PwaControls.module.css'

export function InstallAppButton() {
  const install = useSyncExternalStore(installService.subscribe, installService.getSnapshot, installService.getSnapshot)
  if (!install.canInstall) return null
  return <button className={styles.installButton} type="button" disabled={install.prompting} onClick={() => void installService.prompt()}><Download size={15}/><span>{install.prompting ? 'Opening…' : 'Install App'}</span></button>
}
