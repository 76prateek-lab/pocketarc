import type { Game } from '@/types/game'
import { GameCard } from './GameCard'
import styles from './GameGrid.module.css'

type GameGridProps = { games: Game[]; view?: 'grid' | 'list'; showStatus?: boolean; label: string }

export function GameGrid({ games, label, showStatus, view = 'grid' }: GameGridProps) {
  return <div className={view === 'list' ? `${styles.grid} ${styles.list}` : styles.grid} aria-label={label}>{games.map((game) => <GameCard key={game.id} game={game} view={view} showStatus={showStatus}/>)}</div>
}
