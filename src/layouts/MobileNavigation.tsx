import { Database, Download, House, Library } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { routes } from '@/routes/routes'
import styles from './AppLayout.module.css'

const items = [
  { label: 'Home', to: routes.home, icon: House, end: true },
  { label: 'Library', to: routes.library, icon: Library },
  { label: 'Saves', to: routes.saves, icon: Download },
  { label: 'Storage', to: routes.storage, icon: Database },
]

export function MobileNavigation() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const libraryContext = pathname === routes.library || pathname.startsWith('/app/game/') || pathname.startsWith('/app/play/')

  return (
    <nav className={styles.mobileNav} aria-label="Mobile navigation">
      {items.map(({ end, icon: Icon, label, to }) => {
        const active = to === routes.library ? libraryContext : end ? pathname === to : pathname.startsWith(to)
        return <button key={to} type="button" role="link" aria-current={active ? 'page' : undefined} className={active ? `${styles.mobileLink} ${styles.mobileActive}` : styles.mobileLink} onClick={() => navigate(to)}><Icon size={20}/><span>{label}</span></button>
      })}
    </nav>
  )
}
