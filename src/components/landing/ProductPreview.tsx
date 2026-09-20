import { ArrowRight, Gamepad2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { routes } from '@/routes/routes'
import styles from './ProductPreview.module.css'

const recentGames = [
  { artwork: '/catalog/covers/pokemon-fire-red.jpg', title: 'Pokémon FireRed' },
  { artwork: '/catalog/covers/pokemon-leaf-green.jpg', title: 'Pokémon LeafGreen' },
  { artwork: '/catalog/covers/dragon-ball-advanced-adventure.jpg', title: 'Dragon Ball: Advanced Adventure' },
  { artwork: '/catalog/covers/beyblade-v-force.jpg', title: 'Beyblade V-Force' },
]

export function ProductPreview() {
  return (
    <div className={styles.preview} aria-label="PocketArc product preview">
      <header className={styles.header}>
        <span className={styles.brand}><span className={styles.brandMark}><Gamepad2 size={15} /></span>PocketArc</span>
        <span className={styles.status}><span aria-hidden="true" />Local only</span>
      </header>
      <div className={styles.body}>
        <div className={styles.sectionHeading}><div><span>Ready to play</span><h2>Continue Playing</h2></div><span className={styles.libraryCount}>6 games</span></div>
        <article className={styles.continueCard}>
          <img src="/catalog/covers/pokemon-emerald.jpg" alt="Pokémon Emerald cover art" />
          <div className={styles.gameDetails}>
            <div><p className={styles.platform}>Game Boy Advance</p><h3>Pokémon Emerald</h3><p className={styles.playtime}>Last played today · 4h 26m</p></div>
            <Link to={routes.home}>Continue <ArrowRight size={14} /></Link>
          </div>
        </article>
        <div className={styles.recentHeader}><h2>Recently Played</h2><span>View library</span></div>
        <div className={styles.recentGrid}>
          {recentGames.map((game) => <article key={game.title}><img src={game.artwork} alt="" /><p>{game.title}</p></article>)}
        </div>
      </div>
    </div>
  )
}
