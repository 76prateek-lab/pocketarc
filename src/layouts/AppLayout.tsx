import { Outlet } from 'react-router-dom'
import { AppHeader } from './AppHeader'
import { PwaNotifications } from '@/components/pwa/PwaNotifications'
import { LaunchLastGame } from './LaunchLastGame'
import styles from './AppLayout.module.css'
import { ThemeController } from './ThemeController'
import { AppFooter } from './AppFooter'
import { MobileNavigation } from './MobileNavigation'

export function AppLayout() {
  return (
    <div className={styles.shell}>
      <ThemeController />
      <LaunchLastGame />
      <a className={styles.skipLink} href="#main-content">Skip to content</a>
      <AppHeader />
      <div id="main-content" className={styles.content}><Outlet /></div>
      <AppFooter />
      <MobileNavigation />
      <PwaNotifications />
    </div>
  )
}
