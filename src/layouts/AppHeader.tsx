import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Copyright as CopyrightIcon, Database, Download, FileText, Gamepad2, House, Info, Library, Menu, Moon, Settings, Share, ShieldCheck, Sun } from 'lucide-react'
import { routes } from '@/routes/routes'
import { InstallAppButton } from '@/components/pwa/InstallAppButton'
import { Button, Dialog, IconButton, Sheet } from '@/components/ui'
import { useAppSettings } from '@/hooks/useSettings'
import { settingsService } from '@/services/settingsService'
import { installService } from '@/services/installService'
import { applyTheme, type ResolvedTheme } from '@/services/themeService'
import styles from './AppLayout.module.css'

const navItems = [
  { label: 'Home', to: routes.home, icon: House, end: true },
  { label: 'Library', to: routes.library, icon: Library },
  { label: 'Saves', to: routes.saves, icon: Download },
  { label: 'Storage', to: routes.storage, icon: Database },
  { label: 'Settings', to: routes.settings, icon: Settings },
]

const mobileProjectItems = [
  { label: 'About', to: routes.about, icon: Info },
  { label: 'Copyright', to: routes.copyright, icon: CopyrightIcon },
  { label: 'Terms', to: routes.terms, icon: FileText },
  { label: 'Privacy', to: routes.privacy, icon: ShieldCheck },
]

const mobileSettingsItem = [{ label: 'Settings', to: routes.settings, icon: Settings }]
const mobileMenuDescriptions: Record<string, string> = { Settings: 'Display, controls, and audio', About: 'How PocketArc works', Copyright: 'Usage and attribution', Terms: 'Project terms', Privacy: 'Local data policy' }

export function AppHeader() {
  const { pathname } = useLocation()
  const libraryContext = pathname === routes.library || pathname.startsWith('/app/game/') || pathname.startsWith('/app/play/')
  return <header className={styles.header}><div className={styles.headerInner}><NavLink className={styles.brand} to={routes.home} aria-label="PocketArc home"><span className={styles.brandMark} aria-hidden="true"><Gamepad2 size={19} strokeWidth={1.8}/></span><span>PocketArc</span></NavLink><nav className={styles.desktopNav} aria-label="Primary navigation">{navItems.map(({ end, icon: Icon, label, to }) => { const contextActive = to === routes.library && libraryContext; return contextActive ? <Link key={to} to={to} aria-current="page" className={`${styles.navLink} ${styles.active}`}><Icon size={16}/>{label}</Link> : <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}><Icon size={16}/>{label}</NavLink> })}</nav><div className={styles.headerEnd}><span className={styles.localLabel}><span className={styles.localDot} aria-hidden="true"/>Local only</span><span className={styles.desktopThemeToggle}><ThemeToggle/></span><span className={styles.desktopInstall}><InstallAppButton/></span><MobileMenu/></div></div></header>
}

function MobileMenu() {
  const [open, setOpen] = useState(false)
  const [installGuideOpen, setInstallGuideOpen] = useState(false)
  const install = useSyncExternalStore(installService.subscribe, installService.getSnapshot)
  const { pathname } = useLocation()
  const close = () => setOpen(false)
  const isCurrent = (to: string) => to === routes.library
    ? pathname === routes.library || pathname.startsWith('/app/game/') || pathname.startsWith('/app/play/')
    : pathname === to
  const links = (items: typeof mobileSettingsItem | typeof mobileProjectItems) => items.map(({ icon: Icon, label, to }) => <Link key={to} to={to} aria-label={label} aria-current={isCurrent(to) ? 'page' : undefined} className={isCurrent(to) ? styles.mobileMenuActive : undefined} onClick={close}><span className={styles.mobileMenuIcon} aria-hidden="true"><Icon size={18}/></span><span className={styles.mobileMenuCopy}><strong>{label}</strong><small aria-hidden="true">{mobileMenuDescriptions[label]}</small></span></Link>)
  const requestInstall = async () => {
    if (install.canInstall) {
      close()
      await installService.prompt()
      return
    }
    close()
    setInstallGuideOpen(true)
  }
  const guide = getInstallGuide(install.platform)
  return <><IconButton className={styles.mobileMenuButton} label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}><Menu size={17}/><span aria-hidden="true">Menu</span></IconButton><Sheet open={open} title="Menu" description="Your PocketArc workspace" className={styles.mobileMenuSheet} backdropClassName={styles.mobileMenuBackdrop} headerActions={<ThemeToggle compact/>} onClose={close}><nav className={styles.mobileMenuLinks} aria-label="Mobile menu"><MobileMenuGroup title="App">{!install.installed && <button className={styles.mobileMenuAction} type="button" aria-label="Install PocketArc" onClick={() => void requestInstall()} disabled={install.prompting}><span className={styles.mobileMenuIcon} aria-hidden="true"><Download size={18}/></span><span className={styles.mobileMenuCopy}><strong>{install.prompting ? 'Opening installer…' : 'Install PocketArc'}</strong><small aria-hidden="true">Add to your Home Screen</small></span></button>}</MobileMenuGroup><MobileMenuGroup title="Preferences">{links(mobileSettingsItem)}</MobileMenuGroup><MobileMenuGroup title="Project" grid>{links(mobileProjectItems)}</MobileMenuGroup></nav><MobileAbout/><div className={styles.mobilePoweredBy} aria-label="Powered by 7SP"><span>Powered by</span><img src="/brand/7sp-mark.png" alt="7SP"/></div></Sheet><Dialog open={installGuideOpen} title="Add PocketArc to your Home Screen" description={guide.description} onClose={() => setInstallGuideOpen(false)} footer={<Button variant="primary" onClick={() => setInstallGuideOpen(false)}>Got it</Button>}><div className={styles.installGuide}><span className={styles.installGuideIcon} aria-hidden="true"><Share size={20}/></span><ol>{guide.steps.map((step) => <li key={step}>{step}</li>)}</ol><p>PocketArc will open like an app. Your imported games and saves still remain stored locally in this browser.</p></div></Dialog></>
}

function MobileMenuGroup({ children, grid = false, title }: { children: ReactNode; grid?: boolean; title: string }) { return <section className={styles.mobileMenuGroup}><h2>{title}</h2><div className={grid ? styles.mobileMenuGrid : styles.mobileMenuGroupBody}>{children}</div></section> }

function MobileAbout() {
  return <section className={styles.mobileAbout} aria-labelledby="mobile-about-title"><header><h2 id="mobile-about-title">App details</h2><span>Local runtime</span></header><dl><div><dt>Version</dt><dd>0.1.0</dd></div><div><dt>Emulator</dt><dd>EmulatorJS 4.2.3</dd></div><div><dt>Core</dt><dd>mGBA</dd></div></dl><p>No accounts, analytics, ROM uploads, or cloud sync. Your library and progress remain in this browser.</p><div className={styles.mobileLicenseLinks}><a href="/emulatorjs/licenses/EmulatorJS-GPL-3.0.txt" target="_blank" rel="noreferrer">EmulatorJS license</a><a href="/emulatorjs/licenses/mGBA-MPL-2.0.txt" target="_blank" rel="noreferrer">mGBA license</a></div></section>
}

function getInstallGuide(platform: 'ios' | 'android' | 'other') {
  if (platform === 'ios') return {
    description: 'Safari requires you to add web apps manually.',
    steps: ['Open PocketArc in Safari.', 'Tap the Share button in the Safari toolbar.', 'Choose “Add to Home Screen.”', 'Tap “Add” to confirm.'],
  }
  if (platform === 'android') return {
    description: 'Your browser has not exposed its one-tap installer yet.',
    steps: ['Open the browser menu (⋮).', 'Choose “Install app” or “Add to Home screen.”', 'Confirm the installation.'],
  }
  return {
    description: 'Use your browser menu to install PocketArc when supported.',
    steps: ['Open the browser menu.', 'Choose “Install app” or “Add to Home screen.”', 'Confirm the installation.'],
  }
}

function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const settings = useAppSettings()
  const [resolved, setResolved] = useState<ResolvedTheme>(() => document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')
  useEffect(() => {
    const update = (event: Event) => setResolved((event as CustomEvent<ResolvedTheme>).detail)
    window.addEventListener('pocketgba-theme-change', update)
    return () => window.removeEventListener('pocketgba-theme-change', update)
  }, [])
  if (!settings) return null
  const next = resolved === 'dark' ? 'light' : 'dark'
  const changeTheme = async () => {
    try {
      await settingsService.saveAppSettings({ ...settings, appearance: { theme: next } })
    } finally {
      applyTheme(next)
    }
  }
  return <span className={compact ? styles.menuThemeToggle : styles.themeToggle}><IconButton label={`Use ${next} mode`} onClick={() => void changeTheme()}>{resolved === 'dark' ? <Sun size={17}/> : <Moon size={17}/>}</IconButton></span>
}
