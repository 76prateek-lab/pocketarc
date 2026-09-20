import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Trash2 } from 'lucide-react'
import { Button, Dialog, Input, Switch } from '@/components/ui'
import { cheatRepository } from '@/storage/cheatRepository'
import type { CheatRecord } from '@/storage/schema'
import styles from './CheatManager.module.css'

type Props = { gameId: string; open: boolean; onClose: () => void; onChange: (cheats: CheatRecord[]) => void }

export function CheatManager({ gameId, onChange, onClose, open }: Props) {
  const cheats = useLiveQuery(() => cheatRepository.forGame(gameId), [gameId], [])
  const [name, setName] = useState(''); const [code, setCode] = useState(''); const [error, setError] = useState('')
  async function add() { try { await cheatRepository.add(gameId, name, code); setName(''); setCode(''); setError(''); onChange(await cheatRepository.forGame(gameId)) } catch (reason) { setError(reason instanceof Error ? reason.message : 'The cheat could not be saved.') } }
  async function toggle(cheat: CheatRecord, enabled: boolean) { await cheatRepository.update(cheat.id, { enabled }); onChange(await cheatRepository.forGame(gameId)) }
  async function remove(cheat: CheatRecord) { await cheatRepository.delete(cheat.id); onChange(await cheatRepository.forGame(gameId)) }
  return <Dialog open={open} onClose={onClose} title="Cheats" description="Cheats are stored separately for this game and may affect gameplay stability." footer={<Button onClick={onClose}>Done</Button>}><div className={styles.content}><div className={styles.form}><Input label="Cheat name" value={name} onChange={(event) => setName(event.target.value)}/><Input label="Cheat code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="GameShark or Action Replay code"/><Button onClick={() => void add()}><Plus size={16}/>Add cheat</Button>{error && <p role="alert">{error}</p>}</div><div className={styles.list}>{cheats.length ? cheats.map((cheat) => <article key={cheat.id}><div><strong>{cheat.name}</strong><code>{cheat.code}</code></div><Switch label={`Enable ${cheat.name}`} checked={cheat.enabled} onChange={(enabled) => void toggle(cheat, enabled)}/><button type="button" aria-label={`Delete ${cheat.name}`} onClick={() => void remove(cheat)}><Trash2 size={16}/></button></article>) : <p>No cheats added for this game.</p>}</div></div></Dialog>
}
