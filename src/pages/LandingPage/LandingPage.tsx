import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Gamepad2, LockKeyhole, MonitorSmartphone, WifiOff, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProductPreview } from '@/components/landing/ProductPreview'
import { AppFooter } from '@/layouts/AppFooter'
import { routes } from '@/routes/routes'
import styles from './LandingPage.module.css'

const trustItems = [
  { icon: LockKeyhole, label: 'Local-only ROMs' },
  { icon: WifiOff, label: 'Offline-ready' },
  { icon: MonitorSmartphone, label: 'Saves stay on device' },
]

export function LandingPage() {
  const [howOpen, setHowOpen] = useState(false)

  useEffect(() => {
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const previousColor = themeColor?.content
    themeColor?.setAttribute('content', '#080808')
    return () => {
      if (previousColor) themeColor?.setAttribute('content', previousColor)
    }
  }, [])

  return (
    <div className={styles.page}>
      <a className={styles.skipLink} href="#landing-content">Skip to content</a>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} to={routes.landing} aria-label="PocketArc home">
            <span className={styles.brandMark} aria-hidden="true"><Gamepad2 size={20} strokeWidth={1.8} /></span>
            <span>PocketArc</span>
          </Link>
          <nav className={styles.navigation} aria-label="Landing navigation">
            <a href="#product">Product</a>
            <Link to={routes.privacy}>Privacy</Link>
            <Link className={styles.launchSmall} to={routes.home}>Launch</Link>
          </nav>
        </div>
      </header>

      <main className={styles.main} id="landing-content">
        <section className={styles.hero} aria-labelledby="landing-heading">
          <div className={styles.copy}>
            <p className={styles.eyebrow}>Private browser emulation</p>
            <h1 id="landing-heading">Your games.<br />Your device.</h1>
            <p className={styles.summary}>A private, offline-first way to play your Game Boy Advance library directly in your browser.</p>
            <div className={styles.actions}>
              <Link className={styles.primaryAction} to={routes.home}>Launch PocketArc <ArrowRight size={17} /></Link>
              <button className={styles.secondaryAction} type="button" onClick={() => setHowOpen(true)}>How it works</button>
            </div>
            <ul className={styles.trust} aria-label="PocketArc benefits">
              {trustItems.map(({ icon: Icon, label }) => <li key={label}><Icon aria-hidden="true" size={13} />{label}</li>)}
            </ul>
          </div>
          <div id="product" className={styles.product}><ProductPreview /></div>
        </section>
      </main>

      <div className={styles.productFooter}><AppFooter /></div>
      <HowItWorksDialog open={howOpen} onClose={() => setHowOpen(false)} />
    </div>
  )
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
