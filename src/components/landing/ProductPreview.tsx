import { useRef, type PointerEvent } from 'react'
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
  const previewRef = useRef<HTMLDivElement>(null)
  const movePreview = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch' || window.innerWidth < 1200 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const preview = previewRef.current
    if (!preview) return
    const bounds = preview.getBoundingClientRect()
    const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
    const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1
    preview.style.setProperty('--pointer-rx', `${(-y).toFixed(2)}deg`)
    preview.style.setProperty('--pointer-ry', `${(x * 1.5).toFixed(2)}deg`)
    preview.style.setProperty('--pointer-x', `${(x * 3).toFixed(2)}px`)
    preview.style.setProperty('--pointer-y', `${(y * 3).toFixed(2)}px`)
  }
  const resetPreview = () => {
    const preview = previewRef.current
    preview?.style.removeProperty('--pointer-rx'); preview?.style.removeProperty('--pointer-ry'); preview?.style.removeProperty('--pointer-x'); preview?.style.removeProperty('--pointer-y')
  }
  return (
    <div className={styles.preview} aria-label="PocketArc product preview" ref={previewRef} onPointerMove={movePreview} onPointerLeave={resetPreview}>
      <header className={styles.header}>
        <span className={styles.brand}><span className={styles.brandMark}><Gamepad2 size={15} /></span>PocketArc</span>
        <span className={styles.status}><span aria-hidden="true" />Local</span>
      </header>
      <div className={styles.body}>
        <div className={styles.sectionHeading}><h2>CONTINUE PLAYING</h2></div>
        <article className={styles.continueCard}>
          <img src="/catalog/covers/pokemon-emerald.jpg" alt="Pokémon Emerald cover art" />
          <div className={styles.gameDetails}>
            <div><p className={styles.platform}>GAME BOY ADVANCE</p><h3>Pokémon Emerald</h3><p className={styles.playtime}>4h 26m played</p></div>
            <Link to={routes.home}>Continue <ArrowRight size={14} /></Link>
          </div>
        </article>
        <div className={styles.recentHeader}><h2>YOUR COLLECTION</h2></div>
        <div className={styles.recentGrid}>
          {recentGames.map((game) => <article key={game.title}><img src={game.artwork} alt={game.title} /><p>{game.title}</p></article>)}
        </div>
      </div>
    </div>
  )
}
