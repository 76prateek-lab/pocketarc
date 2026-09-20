import { useRef, useState, type ChangeEvent } from 'react'
import { Download, FileUp, Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button, Dialog, EmptyState, Input } from '@/components/ui'
import { GameCover } from '@/components/library/GameCover'
import { useGames } from '@/hooks/useGames'
import { useNormalSave, useSaveStates, useScreenshotUrl } from '@/hooks/useSaves'
import { routes } from '@/routes/routes'
import { exportSaveFile, importSaveFile } from '@/services/saveFileService'
import { saveStateRepository } from '@/storage/saveStateRepository'
import type { SaveStateRecord } from '@/storage/schema'
import type { Game } from '@/types/game'
import { formatBytes } from '@/utils/formatBytes'
import { binarySize } from '@/storage/binary'
import styles from './SavesPage.module.css'

export function SavesPage() {
  const games = useGames()
  if (!games) return <main className={styles.page}><p>Loading saves…</p></main>
  return <main className={styles.page}><header className={styles.pageHeader}><div><span className={styles.eyebrow}>Stored locally</span><h1 className="display-medium">Saves</h1><p>Cartridge saves and snapshots on this device.</p></div>{games.length > 0 && <span className={styles.gameCount}>{games.length} {games.length === 1 ? 'game' : 'games'}</span>}</header>{games.length ? <div className={styles.groups}>{games.map((game) => <GameSaves key={game.id} game={game}/>)}</div> : <EmptyState title="No game saves yet" description="Import a game and start playing to create local saves." actions={<Link to={routes.library}>Return to library</Link>}/>}</main>
}

function GameSaves({ game }: { game: Game }) {
  const save = useNormalSave(game.id)
  const states = useSaveStates(game.id)
  const inputRef = useRef<HTMLInputElement>(null)
  const pendingFile = useRef<File | undefined>(undefined)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [notice, setNotice] = useState('')

  async function selected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    pendingFile.current = file
    if (save) setConfirmOpen(true)
    else await importPending()
  }
  async function importPending() {
    const file = pendingFile.current
    if (!file) return
    try { await importSaveFile(game.id, file); setNotice('Save imported.') } catch (error) { setNotice(error instanceof Error ? error.message : 'Save import failed.') }
    finally { pendingFile.current = undefined; setConfirmOpen(false) }
  }

  return <section className={styles.group} aria-labelledby={`saves-${game.id}`}><div className={styles.groupHeader}><div className={styles.gameIdentity}><div className={styles.coverWrap}><GameCover className={styles.cover} game={game}/></div><div><h2 id={`saves-${game.id}`}>{game.title}</h2><Link to={routes.game(game.id)}>View game</Link></div></div><div className={styles.actions}><input ref={inputRef} className="visually-hidden" type="file" accept=".sav,application/octet-stream" onChange={(event) => void selected(event)}/><Button onClick={() => inputRef.current?.click()}><FileUp size={15}/>Import .sav</Button><Button disabled={!save} onClick={() => void exportSaveFile(game.id, game.fileName).catch((error: Error) => setNotice(error.message))}><Download size={15}/>Export .sav</Button></div></div>
    <div className={styles.normal}><span className={`${styles.saveDot} ${save ? styles.saveDotReady : ''}`} aria-hidden="true"/><div><strong>{save ? 'Cartridge save ready' : 'No cartridge save'}</strong><p>{save ? `${formatBytes(binarySize(save.data))} · Updated ${new Date(save.updatedAt).toLocaleString()}` : 'Import a .sav file or play to create one'}</p></div>{states.length > 0 && <span className={styles.stateCount}>{states.length} {states.length === 1 ? 'state' : 'states'}</span>}</div>
    {states.length > 0 && <div className={styles.states}>{states.map((state) => <StoredState key={state.id} state={state}/>)}</div>}
    {notice && <p className={styles.notice} role="status">{notice}</p>}
    <Dialog open={confirmOpen} title="Replace existing save?" description={`Importing this file will replace the normal save for ${game.title}.`} onClose={() => { pendingFile.current = undefined; setConfirmOpen(false) }} footer={<><Button variant="ghost" onClick={() => setConfirmOpen(false)}>Cancel</Button><Button variant="primary" onClick={() => void importPending()}>Replace save</Button></>}><p>Export the current save first if you want to keep a backup.</p></Dialog>
  </section>
}

function StoredState({ state }: { state: SaveStateRecord }) {
  const image = useScreenshotUrl(state.screenshotId)
  const [renameOpen, setRenameOpen] = useState(false)
  const [name, setName] = useState(state.name)
  const label = state.slot === 'auto' ? 'Auto' : state.slot === 'quick' ? 'Quick Save' : `Slot ${state.slot}`
  return <article className={styles.state}><div className={styles.preview}>{image ? <img src={image} alt="Save-state preview"/> : <span>No preview</span>}</div><div className={styles.stateBody}><p>{label}</p><h3>{state.name}</h3><time>{new Date(state.updatedAt).toLocaleString()}</time><div className={styles.stateActions}><Button size="small" variant="ghost" onClick={() => { setName(state.name); setRenameOpen(true) }}><Pencil size={14}/>Rename</Button><Button size="small" variant="ghost" onClick={() => void saveStateRepository.delete(state.id)}><Trash2 size={14}/>Delete</Button></div></div><Dialog open={renameOpen} title="Rename save state" onClose={() => setRenameOpen(false)} footer={<><Button variant="ghost" onClick={() => setRenameOpen(false)}>Cancel</Button><Button variant="primary" disabled={!name.trim()} onClick={() => void saveStateRepository.rename(state.id, name).then(() => setRenameOpen(false))}>Rename</Button></>}><Input label="Name" value={name} maxLength={60} onChange={(event) => setName(event.target.value)}/></Dialog></article>
}
