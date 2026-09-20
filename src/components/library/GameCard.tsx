import { useState } from 'react'
import { Download, MoreHorizontal, Pencil, Play, Star, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge, Button, Dialog, Dropdown, StatusDot } from '@/components/ui'
import { EditGameDialog } from './EditGameDialog'
import { GameCover } from './GameCover'
import { gameRepository } from '@/storage/gameRepository'
import { routes } from '@/routes/routes'
import type { Game } from '@/types/game'
import { formatLastPlayed } from '@/utils/formatDate'
import { formatDuration } from '@/utils/formatDuration'
import styles from './GameCard.module.css'

type GameCardProps = { game: Game; view?: 'grid' | 'list'; showStatus?: boolean }

export function GameCard({ game, showStatus = false, view = 'grid' }: GameCardProps) {
  const navigate = useNavigate(); const [editOpen, setEditOpen] = useState(false); const [deleteOpen, setDeleteOpen] = useState(false); const [deleting, setDeleting] = useState(false)
  async function remove() { setDeleting(true); await gameRepository.removeWithLocalData(game.id).catch(() => setDeleting(false)) }
  const items = [
    { label: game.source === 'bundled' ? 'View / Install' : game.lastSaveStateId ? 'Continue playing' : 'Play', icon: game.source === 'bundled' ? <Download size={15}/> : <Play size={15}/>, onSelect: () => navigate(game.source === 'bundled' ? routes.game(game.id) : routes.play(game.id)) },
    { label: game.favorite ? 'Unfavorite' : 'Favorite', icon: <Star size={15}/>, onSelect: () => void gameRepository.update(game.id, { favorite: !game.favorite }) },
    { label: 'Manage saves', icon: <Download size={15}/>, onSelect: () => navigate(routes.saves) },
    { label: 'Edit details', icon: <Pencil size={15}/>, onSelect: () => setEditOpen(true) },
    { label: 'Delete', icon: <Trash2 size={15}/>, onSelect: () => setDeleteOpen(true) },
  ]
  const metadata = game.lastPlayedAt ? `${formatDuration(game.totalPlayTimeMs)} · ${formatLastPlayed(game.lastPlayedAt)}` : 'Never played'
  return <article className={view === 'list' ? `${styles.card} ${styles.list}` : styles.card}><Link to={routes.game(game.id)} className={styles.link}><div className={styles.coverWrap}><GameCover className={styles.cover} game={game}/><span className={styles.playHint} aria-hidden="true"><Play size={18} fill="currentColor"/></span>{game.favorite && <span className={styles.favorite} aria-label="Favorite"><Star size={14} fill="currentColor"/></span>}</div><div className={styles.details}><div className={styles.titleRow}><h3>{game.title}</h3>{showStatus && game.lastSaveStateId && <Badge><StatusDot status="success" label="Save state available"/>Continue</Badge>}</div><p className={styles.metadata}>{metadata}</p></div></Link><div className={styles.contextMenu}><Dropdown label={`Actions for ${game.title}`} trigger={<MoreHorizontal size={18}/>} items={items}/></div><EditGameDialog game={game} open={editOpen} onClose={() => setEditOpen(false)}/><Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} title={`Delete ${game.title}?`} description="This removes the game and all associated local data." footer={<><Button variant="ghost" disabled={deleting} onClick={() => setDeleteOpen(false)}>Cancel</Button><Button variant="primary" disabled={deleting} onClick={() => void remove()}>{deleting ? 'Deleting…' : 'Delete game and ROM'}</Button></>}><p>This cannot be undone.</p></Dialog></article>
}
