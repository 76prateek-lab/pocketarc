import { useState } from 'react'
import { ImageOff, Pencil, RotateCcw, Save, Trash2 } from 'lucide-react'
import { Button, Dialog, Input } from '@/components/ui'
import { useScreenshotUrl } from '@/hooks/useSaves'
import { saveStateRepository } from '@/storage/saveStateRepository'
import type { SaveStateRecord } from '@/storage/schema'
import styles from './SaveStatePanel.module.css'

type Props = { state?: SaveStateRecord; label: string; busy?: boolean; onLoad: (id: string) => Promise<void>; onSave: () => Promise<void> }

export function SaveStateCard({ busy, label, onLoad, onSave, state }: Props) {
  const screenshotUrl = useScreenshotUrl(state?.screenshotId)
  const [renameOpen, setRenameOpen] = useState(false)
  const [name, setName] = useState(state?.name ?? '')

  async function rename() {
    if (!state) return
    await saveStateRepository.rename(state.id, name)
    setRenameOpen(false)
  }

  return <article className={styles.card}>
    <div className={styles.preview}>{screenshotUrl ? <img src={screenshotUrl} alt="Save-state preview"/> : <span><ImageOff size={17} aria-hidden="true"/>No preview</span>}</div>
    <div className={styles.cardBody}><div><p className={styles.slot}>{label}</p><h3>{state?.name ?? 'Empty slot'}</h3>{state && <time dateTime={new Date(state.updatedAt).toISOString()}>{new Date(state.updatedAt).toLocaleString()}</time>}</div>
      <div className={styles.cardActions}>{state && <Button size="small" disabled={busy} onClick={() => void onLoad(state.id)}><RotateCcw size={14}/>Load</Button>}<Button size="small" disabled={busy} onClick={() => void onSave()}><Save size={14}/>{state ? 'Overwrite' : 'Save'}</Button>{state && <><Button size="small" variant="ghost" aria-label={`Rename ${label}`} onClick={() => { setName(state.name); setRenameOpen(true) }}><Pencil size={14}/></Button><Button size="small" variant="ghost" aria-label={`Delete ${label}`} onClick={() => void saveStateRepository.delete(state.id)}><Trash2 size={14}/></Button></>}</div>
    </div>
    <Dialog open={renameOpen} title="Rename save state" onClose={() => setRenameOpen(false)} footer={<><Button variant="ghost" onClick={() => setRenameOpen(false)}>Cancel</Button><Button variant="primary" disabled={!name.trim()} onClick={() => void rename()}>Rename</Button></>}><Input label="Name" value={name} maxLength={60} onChange={(event) => setName(event.target.value)}/></Dialog>
  </article>
}
