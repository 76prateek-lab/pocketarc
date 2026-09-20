import { useState } from 'react'
import { Zap } from 'lucide-react'
import { Button } from '@/components/ui'
import { SaveStateCard } from '@/components/emulator/SaveStateCard'
import { emulatorManager } from '@/emulator/EmulatorManager'
import { useSaveStates } from '@/hooks/useSaves'
import type { SaveStateSlot } from '@/storage/saveStateRepository'
import styles from './SaveStatePanel.module.css'

const SLOTS: { slot: SaveStateSlot; label: string; name: string }[] = [
  { slot: 'auto', label: 'Auto', name: 'Auto save' }, { slot: '1', label: 'Slot 1', name: 'Slot 1' },
  { slot: '2', label: 'Slot 2', name: 'Slot 2' }, { slot: '3', label: 'Slot 3', name: 'Slot 3' },
]

export function SaveStatePanel({ gameId }: { gameId: string }) {
  const states = useSaveStates(gameId)
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  async function perform(action: () => Promise<unknown>, success: string) {
    setBusy(true); setNotice('')
    try { await action(); setNotice(success) } catch (error) { setNotice(error instanceof Error ? error.message : 'The save-state action failed.') } finally { setBusy(false) }
  }
  const quick = states.find((state) => state.slot === 'quick')
  return <section className={styles.panel} aria-labelledby="save-states-title"><div className={styles.heading}><div><h2 id="save-states-title">Save states</h2><p>Snapshots are stored locally for this game only.</p></div><div className={styles.quick}><Button disabled={busy} onClick={() => void perform(() => emulatorManager.saveState('quick', 'Quick Save'), 'Quick save created.')}><Zap size={15}/>Quick Save</Button><Button disabled={busy || !quick} onClick={() => quick && void perform(() => emulatorManager.loadState(quick.id), 'Quick save loaded.')}>Quick Load</Button></div></div>
    {notice && <p className={styles.notice} role="status">{notice}</p>}
    <div className={styles.grid}>{SLOTS.map(({ label, name, slot }) => <SaveStateCard key={slot} label={label} busy={busy} state={states.find((state) => state.slot === slot)} onLoad={(id) => perform(() => emulatorManager.loadState(id), `${label} loaded.`)} onSave={() => perform(() => emulatorManager.saveState(slot, name), `${label} saved.`)}/>)}</div>
  </section>
}
