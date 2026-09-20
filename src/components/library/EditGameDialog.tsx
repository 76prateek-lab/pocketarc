import { useRef, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { Button, Dialog, Input } from '@/components/ui'
import { coverRepository } from '@/storage/coverRepository'
import { gameRepository } from '@/storage/gameRepository'
import type { Game } from '@/types/game'
import styles from './EditGameDialog.module.css'

export function EditGameDialog({ game, onClose, open }: { game: Game; onClose: () => void; open: boolean }) {
  return open ? <EditGameForm key={`${game.id}-${game.title}-${game.coverId ?? ''}`} game={game} onClose={onClose}/> : null
}

function EditGameForm({ game, onClose }: { game: Game; onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState(game.title); const [description, setDescription] = useState(game.description ?? '')
  const [cover, setCover] = useState<File>(); const [removeCover, setRemoveCover] = useState(false); const [error, setError] = useState(''); const [saving, setSaving] = useState(false)
  async function save() {
    const cleanTitle = title.trim()
    if (!cleanTitle) { setError('Title is required.'); return }
    setSaving(true); setError('')
    try {
      await gameRepository.update(game.id, { title: cleanTitle, description: description.trim() || undefined })
      if (cover) await coverRepository.replaceForGame(game.id, cover)
      else if (removeCover) await coverRepository.removeForGame(game.id)
      onClose()
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'The game details could not be saved.') }
    finally { setSaving(false) }
  }
  return <Dialog open onClose={() => !saving && onClose()} title="Edit game details" description="Changes and cover artwork stay on this device." footer={<><Button variant="ghost" disabled={saving} onClick={onClose}>Cancel</Button><Button variant="primary" disabled={saving} onClick={() => void save()}>{saving ? 'Saving…' : 'Save changes'}</Button></>}>
    <div className={styles.form}><Input label="Title" value={title} maxLength={120} onChange={(event) => setTitle(event.target.value)}/><label className={styles.description}><span>Description</span><textarea rows={4} maxLength={1000} value={description} onChange={(event) => setDescription(event.target.value)}/></label><div className={styles.coverActions}><input ref={fileRef} hidden type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => { const next = event.target.files?.[0]; setCover(next); setRemoveCover(false) }}/><Button onClick={() => fileRef.current?.click()}><ImagePlus size={16}/>{cover ? cover.name : 'Choose cover image'}</Button>{game.coverId && <Button variant="ghost" onClick={() => { setCover(undefined); setRemoveCover(true) }}><Trash2 size={16}/>{removeCover ? 'Cover will be removed' : 'Remove custom cover'}</Button>}</div>{error && <p className={styles.error} role="alert">{error}</p>}</div>
  </Dialog>
}
