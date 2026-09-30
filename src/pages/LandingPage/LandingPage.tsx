import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Gamepad2, HardDrive, LockKeyhole, WifiOff, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProductPreview } from '@/components/landing/ProductPreview'
import { routes } from '@/routes/routes'
import styles from './LandingPage.module.css'

const trustItems = [
  { icon: HardDrive, label: 'Local ROMs' },
  { icon: WifiOff, label: 'Offline-ready' },
  { icon: LockKeyhole, label: 'Saves stay on your device' },
  { icon: Gamepad2, label: 'Controller-ready' },
]

const floatingCovers = [
  { src: '/catalog/covers/pokemon-fire-red.jpg', name: 'Pokémon FireRed', position: 'upperLeft' },
  { src: '/catalog/covers/beyblade-v-force.jpg', name: 'Beyblade V-Force', position: 'lowerLeft' },
  { src: '/catalog/covers/pokemon-leaf-green.jpg', name: 'Pokémon LeafGreen', position: 'upperRight' },
  { src: '/catalog/covers/dragon-ball-advanced-adventure.jpg', name: 'Dragon Ball: Advanced Adventure', position: 'lowerRight' },
] as const

export function LandingPage() {
  const [howOpen, setHowOpen] = useState(false)

  useEffect(() => {
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const previousColor = themeColor?.content
    themeColor?.setAttribute('content', '#050506')
    return () => {
      if (previousColor) themeColor?.setAttribute('content', previousColor)
    }
  }, [])

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#landing-content">Skip to content</a>
      <Link className={styles.brand} to={routes.landing} aria-label="PocketArc home">
        <span className={styles.brandMark} aria-hidden="true"><Gamepad2 size={18} strokeWidth={1.8} /></span>
        <span className={styles.brandName}>PocketArc</span>
      </Link>

      <main className={styles.main} id="landing-content">
        <section className={styles.hero} aria-labelledby="landing-heading">
          <div className={styles.copy}>
            <h1 id="landing-heading">Your GBA library,<br />reimagined.</h1>
            <p className={styles.summary}>Play, save and carry your collection anywhere —<br className={styles.desktopBreak} /> without uploads or accounts.</p>
            <div className={styles.actions}>
              <Link className={styles.primaryAction} to={routes.home}>Launch PocketArc <ArrowRight size={17} /></Link>
              <button className={styles.secondaryAction} type="button" onClick={() => setHowOpen(true)}>How it works</button>
            </div>
          </div>
          <div id="product" className={styles.showcase}>
            <div className={styles.ambient} aria-hidden="true" />
            {floatingCovers.map((cover) => <img className={`${styles.floatingCover} ${styles[cover.position]}`} key={cover.name} src={cover.src} alt="" aria-hidden="true" />)}
            <div className={styles.product}><ProductPreview /></div>
          </div>
          <ul className={styles.trust} aria-label="PocketArc benefits">
            {trustItems.map(({ icon: Icon, label }) => <li key={label}><Icon aria-hidden="true" size={14} />{label}</li>)}
          </ul>
        </section>
      </main>

      <LandingFooter />
      <HowItWorksDialog open={howOpen} onClose={() => setHowOpen(false)} />
    </div>
  )
}

function LandingFooter() {
  return <footer className={styles.footer}><div className={styles.footerInner}><div className={styles.footerIdentity}><Gamepad2 aria-hidden="true" size={14}/><span>PocketArc</span><span aria-hidden="true">·</span><span>© {new Date().getFullYear()}</span></div><div className={styles.poweredBy} aria-label="Powered by 7SP"><span>Powered by</span><img src="/brand/7sp-mark.png" alt="7SP" /></div><nav aria-label="Footer navigation"><Link to={routes.about}>About</Link><Link to={routes.copyright}>Copyright</Link><Link to={routes.terms}>Terms</Link><Link to={routes.privacy}>Privacy</Link></nav></div></footer>
}

function HowItWorksDialog({ onClose, open }: { onClose: () => void; open: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog aria-labelledby="how-pocketarc-works" className={styles.dialog} ref={dialogRef} onCancel={onClose} onClose={onClose} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className={styles.dialogContent}>
        <header><div><p className={styles.dialogEyebrow}>Three simple steps</p><h2 id="how-pocketarc-works">How PocketArc works</h2></div><button type="button" aria-label="Close how it works" onClick={onClose}><X size={18} /></button></header>
        <ol>
          <li><span>1</span><div><h3>Import your .gba file</h3><p>Choose a ROM you already have on your device.</p></div></li>
          <li><span>2</span><div><h3>Keep it in your browser</h3><p>PocketArc stores it locally. Nothing is uploaded.</p></div></li>
          <li><span>3</span><div><h3>Play and save offline</h3><p>After setup, your library and progress remain available offline.</p></div></li>
        </ol>
        <Link className={styles.dialogLaunch} to={routes.home}>Launch PocketArc <ArrowRight size={16} /></Link>
      </div>
    </dialog>
  )
}
