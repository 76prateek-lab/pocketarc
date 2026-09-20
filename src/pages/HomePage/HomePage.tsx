import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { ArrowRight, MoreHorizontal, Play } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Dropdown, Skeleton } from '@/components/ui'
import { GameCard } from '@/components/library/GameCard'
import { GameCover } from '@/components/library/GameCover'
import { useGames } from '@/hooks/useGames'
import { routes } from '@/routes/routes'
import { saveStateRepository } from '@/storage/saveStateRepository'
import { storageRepository } from '@/storage/storageRepository'
import { formatBytes } from '@/utils/formatBytes'
import { formatLastPlayed } from '@/utils/formatDate'
import { formatDuration } from '@/utils/formatDuration'
import styles from './HomePage.module.css'

export function HomePage() {
  const games = useGames()
  const saveStateCount = useLiveQuery(() => saveStateRepository.count(), [], 0)
  const storage = useLiveQuery(() => storageRepository.breakdown(), [], undefined)
  const navigate = useNavigate()
  const played = useMemo(() => [...(games ?? [])].filter((game) => game.lastPlayedAt).sort((a, b) => (b.lastPlayedAt ?? 0) - (a.lastPlayedAt ?? 0)), [games])
  const recentShelf = played.slice(1, 7)
  const featured = played[0] ?? games?.[0]
  const preview = useMemo(() => [...(games ?? [])].sort((a, b) => b.addedAt - a.addedAt).slice(0, 5), [games])
  const totalPlaytime = useMemo(() => (games ?? []).reduce((total, game) => total + game.totalPlayTimeMs, 0), [games])

  if (games === undefined) return <HomeSkeleton />

  const destination = featured ? (featured.source === 'bundled' ? routes.game(featured.id) : routes.play(featured.id)) : routes.library
  const primaryLabel = featured?.lastPlayedAt ? 'Continue playing' : featured ? 'Start playing' : 'Import ROM'

  return <main className={styles.page}>
    <header className={styles.intro}><p className={styles.pageEyebrow}>Your local collection</p><h1 className="display-medium">Welcome back</h1><p>Pick up where you left off.</p></header>
    <div className={styles.heroGrid}>
      <section className={styles.feature} aria-labelledby="continue-heading">
        {featured ? <>
          <div className={styles.featureArt}><GameCover className={styles.heroCover} game={featured} labelled /></div>
          <div className={styles.featureContent}>
            <p className={styles.eyebrow}>{featured.lastPlayedAt ? 'Continue playing' : 'Start playing'}</p>
            <h2 id="continue-heading">{featured.title}</h2>
            <p className={styles.featureMeta}>{featured.lastPlayedAt ? `${formatDuration(featured.totalPlayTimeMs)} played · ${formatLastPlayed(featured.lastPlayedAt)}` : 'Ready when you are.'}</p>
            <div className={styles.featureActions}><Button variant="primary" onClick={() => navigate(destination)}><Play size={16}/>{primaryLabel}</Button><Dropdown label={`More actions for ${featured.title}`} trigger={<MoreHorizontal size={18}/>} items={[{ label: 'View game details', onSelect: () => navigate(routes.game(featured.id)) }, { label: 'Manage saves', onSelect: () => navigate(routes.saves) }]}/></div>
          </div>
        </> : <div className={styles.startEmpty}><p className={styles.eyebrow}>Start playing</p><h2 id="continue-heading">Your next game starts here</h2><p>Import a GBA ROM. It stays entirely on this device.</p><Button variant="primary" onClick={() => navigate(routes.library)}>Import ROM</Button></div>}
      </section>
      <aside className={styles.summary} aria-labelledby="summary-heading">
        <div className={styles.summaryTop}><p className={styles.eyebrow} id="summary-heading">Your library</p><span>Local only</span></div>
        <dl><div><dt>Games</dt><dd>{games.length}</dd></div><div><dt>Playtime</dt><dd>{formatDuration(totalPlaytime)}</dd></div><div><dt>Save states</dt><dd>{saveStateCount}</dd></div><div><dt>Storage</dt><dd>{storage ? formatBytes(storage.totalBytes) : '—'}</dd></div></dl>
        <div className={styles.summaryFoot}><p>Stored privately on this device.</p><Link to={routes.storage}>Manage storage <ArrowRight size={14}/></Link></div>
      </aside>
    </div>
    {recentShelf.length > 0 && <section className={styles.section}><SectionHeading title="Recently played" action="View library" to={routes.library}/><div className={styles.shelf} aria-label="Recently played games">{recentShelf.map((game) => <GameCard game={game} key={game.id}/>)}</div></section>}
    <section className={styles.section}><SectionHeading title="Your games" action="View library" to={routes.library}/>{preview.length ? <div className={styles.previewGrid} aria-label="Your games preview">{preview.map((game) => <GameCard game={game} key={game.id}/>)}</div> : <div className={styles.emptyPreview}><p>Your library is empty.</p><Link to={routes.library}>Import a game <ArrowRight size={14}/></Link></div>}</section>
  </main>
}

function SectionHeading({ action, title, to }: { action: string; title: string; to: string }) {
  return <header className={styles.sectionHeader}><h2>{title}</h2><Link to={to}>{action} <ArrowRight size={14}/></Link></header>
}

function HomeSkeleton() {
  return <main className={styles.page} aria-label="Loading home" aria-busy="true"><header className={styles.intro}><Skeleton width={220} height={40}/><Skeleton width={190} height={20}/></header><div className={styles.heroGrid}><Skeleton height={360}/><Skeleton height={360}/></div></main>
}
