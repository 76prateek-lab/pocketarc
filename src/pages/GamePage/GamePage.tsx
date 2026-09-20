import { useState, type ReactNode } from 'react'
import { ArrowLeft, Clock3, Download, Image, Pencil, Play, Settings, Star, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, Dialog, Skeleton } from '@/components/ui'
import { ScreenshotGallery } from '@/components/game/ScreenshotGallery'
import { EditGameDialog } from '@/components/library/EditGameDialog'
import { GameCover } from '@/components/library/GameCover'
import { routes } from '@/routes/routes'
import { formatDuration } from '@/utils/formatDuration'
import { formatLastPlayed } from '@/utils/formatDate'
import { formatBytes } from '@/utils/formatBytes'
import { useGame, useRomInstalled, useSaveStateCount } from '@/hooks/useGames'
import { useScreenshots } from '@/hooks/useSaves'
import { gameRepository } from '@/storage/gameRepository'
import type { Game } from '@/types/game'
import { catalogService, type CatalogInstallStage } from '@/services/catalogService'
import { requestPersistentStorage } from '@/services/storageEstimateService'
import styles from './GamePage.module.css'

export function GamePage({ game: providedGame }: { game?: Game }) {
  const { gameId } = useParams(); const navigate = useNavigate(); const storedGame = useGame(providedGame ? undefined : gameId); const game = providedGame ?? storedGame
  const saveStateCount = useSaveStateCount(providedGame ? undefined : gameId); const screenshots = useScreenshots(providedGame ? undefined : gameId)
  const romInstalled = useRomInstalled(game?.romId); const [deleteOpen, setDeleteOpen] = useState(false); const [editOpen, setEditOpen] = useState(false); const [deleting, setDeleting] = useState(false); const [notice, setNotice] = useState(''); const [installStage, setInstallStage] = useState<CatalogInstallStage>()
  if (game === undefined) return <GamePageSkeleton/>
  if (!game) return <main className={styles.notFound}><h1 className="display-medium">Game not found</h1><p>This game may have been removed from this device.</p><Link to={routes.library}>Return to library</Link></main>

  const currentGame = game; const actionLabel = game.lastSaveStateId ? 'Continue' : 'Play'
  async function deleteGame() { setDeleting(true); try { await gameRepository.removeWithLocalData(currentGame.id); navigate(routes.library) } catch { setDeleting(false); setDeleteOpen(false); setNotice('PocketArc could not remove this game. Your data remains in place.') } }
  async function toggleFavorite() { await gameRepository.update(currentGame.id, { favorite: !currentGame.favorite }) }
  async function installCatalogGame() { if (!currentGame.catalogId) return; setNotice(''); setInstallStage('Downloading'); try { await catalogService.install(currentGame.catalogId, setInstallStage); void requestPersistentStorage(); navigate(routes.play(currentGame.id)) } catch (error) { setInstallStage(undefined); setNotice(error instanceof Error ? error.message : 'The game could not be installed.') } }
  const needsInstall = game.source === 'bundled' && !romInstalled

  return <main className={styles.page}>
    <Link className={styles.back} to={routes.library}><ArrowLeft size={16}/>Library</Link>
    <section className={styles.hero}><div className={styles.coverWrap}><GameCover game={game} labelled/></div><div className={styles.rightColumn}><div className={styles.details}>
      <div className={styles.titleLine}><p className="code">{game.fileName}</p>{game.source === 'bundled' && <Badge>Catalog</Badge>}{game.favorite && <Badge><Star size={13} fill="currentColor"/>Favorite</Badge>}</div><h1 className="display-large">{game.title}</h1>
      <div className={styles.metadata}>{game.releaseYear && <span>{game.releaseYear}</span>}{game.developer && <span>{game.developer}</span>}{game.genre?.map((genre) => <Badge key={genre}>{genre}</Badge>)}</div>
      {game.description ? <p className={styles.description}>{game.description}</p> : <p className={styles.descriptionMuted}>No description added.</p>}
      <dl className={styles.stats}><Stat icon={<Clock3 size={16}/>} label="Playtime" value={formatDuration(game.totalPlayTimeMs)}/><Stat label="Last played" value={formatLastPlayed(game.lastPlayedAt)}/><Stat label="Added" value={formatLastPlayed(game.addedAt)}/><Stat label="File size" value={formatBytes(game.fileSize)}/><Stat label="Save states" value={String(saveStateCount)}/><Stat label="Screenshots" value={String(screenshots.length)}/></dl>
      {notice && <p role="status" className={styles.notice}>{notice}</p>}
    </div><div className={styles.actions} aria-label="Game actions">{needsInstall ? <Button variant="primary" size="large" disabled={Boolean(installStage)} onClick={() => void installCatalogGame()}><Download size={17}/>{installStage ?? 'Download & Play'}</Button> : <Button variant="primary" size="large" onClick={() => navigate(routes.play(game.id))}><Play size={17}/>{actionLabel}</Button>}<Button onClick={() => navigate(routes.saves)}><Download size={16}/>Manage saves</Button><Button onClick={() => setEditOpen(true)}><Pencil size={16}/>Edit</Button><Button onClick={() => navigate(routes.settings)}><Settings size={16}/>Game settings</Button><Button aria-pressed={game.favorite} onClick={() => void toggleFavorite()}><Star size={16} fill={game.favorite ? 'currentColor' : 'none'}/>{game.favorite ? 'Unfavourite' : 'Favourite'}</Button></div></div></section>
    <section className={styles.media}><div className={styles.mediaHeader}><div><h2>Screenshots</h2><p>Captured locally while playing or creating save states.</p></div><Image size={18}/></div><ScreenshotGallery gameTitle={game.title} screenshots={screenshots}/></section>
    <section className={styles.dangerZone}><div><h2>Remove game and ROM</h2><p>Removes the ROM, saves, save states, screenshots, cover, and play sessions stored on this device.</p></div><Button onClick={() => setDeleteOpen(true)}><Trash2 size={16}/>Delete game</Button></section>
    <EditGameDialog game={game} open={editOpen} onClose={() => setEditOpen(false)}/>
    <Dialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} title={`Delete ${game.title}?`} description="This permanently removes the game and ROM from this device." footer={<><Button variant="ghost" disabled={deleting} onClick={() => setDeleteOpen(false)}>Cancel</Button><Button variant="primary" disabled={deleting} onClick={() => void deleteGame()}>{deleting ? 'Deleting…' : 'Delete game and ROM'}</Button></>}><p className="body">Associated saves, save states, screenshots, cover artwork, and play sessions will also be removed. This cannot be undone.</p></Dialog>
  </main>
}

function Stat({ icon, label, value }: { icon?: ReactNode; label: string; value: string }) { return <div>{icon}<dt>{label}</dt><dd>{value}</dd></div> }
function GamePageSkeleton() { return <main className={styles.page} aria-busy="true" aria-label="Loading game"><Skeleton width={100} height={40}/><section className={styles.hero}><Skeleton height={480}/><div className={styles.skeletonDetails}><Skeleton width="35%"/><Skeleton height={48}/><Skeleton width="70%" height={24}/><Skeleton height={180}/></div></section></main> }
