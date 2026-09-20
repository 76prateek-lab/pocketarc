import { ArrowRight, CloudOff, Cpu, Database, Gamepad2, HeartHandshake, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { routes } from '@/routes/routes'
import styles from './AboutPage.module.css'

const principles = [
  { icon: Database, title: 'Local-first', text: 'Imported games, saves, screenshots, and preferences live in your browser instead of a PocketArc account.' },
  { icon: CloudOff, title: 'Offline-ready', text: 'The application shell and emulator runtime are designed to keep working after installation without a permanent connection.' },
  { icon: ShieldCheck, title: 'Progress matters', text: 'Reliable normal saves, save states, backups, and careful database migrations take priority over secondary features.' },
]

const stack = ['React', 'TypeScript', 'Vite', 'Dexie', 'EmulatorJS', 'mGBA', 'Workbox', 'Playwright']

export function AboutPage() {
  return <main className={styles.page}>
    <section className={styles.hero}>
      <div className={styles.heroMark} aria-hidden="true"><Gamepad2 size={24}/></div>
      <p className="code">About PocketArc</p>
      <h1>Your Game Boy Advance library, kept close.</h1>
      <p className={styles.lead}>PocketArc is an independent, offline-first portfolio project exploring how a polished handheld game library can work entirely inside a modern web browser.</p>
      <div className={styles.heroActions}><Link className={styles.primaryAction} to={routes.library}>Open your library<ArrowRight size={16}/></Link><Link className={styles.secondaryAction} to={routes.privacy}>How privacy works</Link></div>
    </section>

    <section className={styles.principles} aria-labelledby="principles-title">
      <header className={styles.sectionIntro}><p className="code">Principles</p><h2 id="principles-title">Built around ownership and continuity.</h2><p>No account is required. PocketArc focuses on keeping your library usable, your controls predictable, and your progress recoverable.</p></header>
      <div className={styles.principleGrid}>{principles.map(({ icon: Icon, text, title }) => <article key={title}><span className={styles.icon}><Icon size={18}/></span><h3>{title}</h3><p>{text}</p></article>)}</div>
    </section>

    <section className={styles.story} aria-labelledby="story-title">
      <div className={styles.storyTitle}><p className="code">The project</p><h2 id="story-title">A product exercise, not another ROM website.</h2></div>
      <div className={styles.storyBody}>
        <p>PocketArc was created to bring the discipline of a production application to browser-based emulation: a restrained interface, responsive controls, explicit storage boundaries, accessible interactions, and an architecture that keeps React, IndexedDB, and the emulator runtime separate.</p>
        <p>The project does not implement Game Boy Advance hardware emulation. Gameplay is powered by the established EmulatorJS integration with the mGBA WebAssembly core. PocketArc provides the surrounding experience—library management, local persistence, input handling, saves, screenshots, backups, offline installation, and responsive presentation.</p>
        <p>It is intentionally focused. There are no accounts, social feeds, advertisements, analytics, cloud saves, or external ROM search. Features earn their place by making local play safer, clearer, or more dependable.</p>
      </div>
    </section>

    <section className={styles.comparison} aria-label="What PocketArc is and is not">
      <article><h2>What it is</h2><ul><li>A private library for games you are entitled to use</li><li>An installable offline-first web application</li><li>A practical demonstration of local browser storage</li><li>A keyboard, touch, and controller-friendly player</li><li>An independent portfolio and educational project</li></ul></article>
      <article><h2>What it is not</h2><ul><li>A cloud gaming or streaming platform</li><li>A marketplace or external ROM downloader</li><li>A replacement for owning lawful game copies</li><li>An account, tracking, or advertising service</li><li>An official Nintendo or rights-holder product</li></ul></article>
    </section>

    <section className={styles.technology} aria-labelledby="technology-title">
      <div><span className={styles.icon}><Cpu size={18}/></span><p className="code">Technology</p><h2 id="technology-title">Modern web tools, deliberately separated.</h2><p>The interface, storage layer, emulator adapter, input system, and offline runtime are independent parts so each can be tested and maintained without placing emulator globals or binary data inside UI components.</p></div>
      <ul aria-label="Core technologies">{stack.map((technology) => <li key={technology}>{technology}</li>)}</ul>
    </section>

    <section className={styles.responsibility} aria-labelledby="responsibility-title">
      <HeartHandshake size={22}/><div><p className="code">Responsible use</p><h2 id="responsibility-title">Respect the work behind every game.</h2><p>PocketArc is intended for personal, non-commercial, educational, and portfolio evaluation. Only import material you own or have permission to use, and do not redistribute protected catalog or game files.</p><div><Link to={routes.terms}>Read the Terms<ArrowRight size={15}/></Link><Link to={routes.privacy}>Read the Privacy Policy<ArrowRight size={15}/></Link></div></div>
    </section>
  </main>
}
