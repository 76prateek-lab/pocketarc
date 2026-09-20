import { Link } from 'react-router-dom'
import { Gamepad2 } from 'lucide-react'
import { routes } from '@/routes/routes'
import styles from './AppLayout.module.css'

export function AppFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerSummary}>
          <Link className={styles.footerBrand} to={routes.home} aria-label="PocketArc footer">
            <span className={styles.footerBrandMark} aria-hidden="true"><Gamepad2 size={14} strokeWidth={1.8}/></span>
            <span>PocketArc</span>
          </Link>
          <span className={styles.footerDivider} aria-hidden="true" />
          <p>© {new Date().getFullYear()} · Personal and educational use only.</p>
        </div>

        <div className={styles.poweredBy} aria-label="Powered by 7SP">
          <span>Powered by</span>
          <img className={styles.poweredLogo} src="/brand/7sp-mark.png" alt="7SP" />
        </div>

        <nav className={styles.footerNavigation} aria-label="Footer navigation">
          <Link to={routes.about}>About</Link>
          <Link to={routes.copyright}>Copyright</Link>
          <Link to={routes.terms}>Terms</Link>
          <Link to={routes.privacy}>Privacy</Link>
        </nav>
      </div>
    </footer>
  )
}
