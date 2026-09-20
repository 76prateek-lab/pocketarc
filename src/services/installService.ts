export interface InstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export type InstallPlatform = 'ios' | 'android' | 'other'

export type InstallSnapshot = {
  canInstall: boolean
  installed: boolean
  prompting: boolean
  platform: InstallPlatform
}

export class InstallService {
  private promptEvent?: InstallPromptEvent
  private listeners = new Set<() => void>()
  private initialized = false
  private snapshot: InstallSnapshot = { canInstall: false, installed: false, prompting: false, platform: 'other' }

  initialize() {
    if (this.initialized || typeof window === 'undefined') return
    this.initialized = true
    window.addEventListener('beforeinstallprompt', this.onBeforeInstallPrompt)
    window.addEventListener('appinstalled', this.onInstalled)
    const platform = detectInstallPlatform()
    const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean }
    const installed = window.matchMedia?.('(display-mode: standalone)').matches || navigatorWithStandalone.standalone === true
    this.setSnapshot({ canInstall: false, installed, prompting: false, platform })
  }

  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => this.listeners.delete(listener) }
  getSnapshot = () => this.snapshot

  async prompt() {
    if (!this.promptEvent || this.snapshot.prompting) return false
    this.setSnapshot({ ...this.snapshot, prompting: true })
    try {
      await this.promptEvent.prompt()
      const choice = await this.promptEvent.userChoice
      this.promptEvent = undefined
      this.setSnapshot({ ...this.snapshot, canInstall: false, installed: choice.outcome === 'accepted', prompting: false })
      return choice.outcome === 'accepted'
    } catch {
      this.setSnapshot({ ...this.snapshot, prompting: false })
      return false
    }
  }

  private onBeforeInstallPrompt = (event: Event) => {
    event.preventDefault()
    this.promptEvent = event as InstallPromptEvent
    this.setSnapshot({ ...this.snapshot, canInstall: true, installed: false, prompting: false })
  }

  private onInstalled = () => {
    this.promptEvent = undefined
    this.setSnapshot({ ...this.snapshot, canInstall: false, installed: true, prompting: false })
  }

  private setSnapshot(snapshot: InstallSnapshot) { this.snapshot = snapshot; this.listeners.forEach((listener) => listener()) }
}

export const installService = new InstallService()

function detectInstallPlatform(): InstallPlatform {
  const userAgent = navigator.userAgent.toLowerCase()
  const isIPadDesktopMode = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  if (/iphone|ipad|ipod/.test(userAgent) || isIPadDesktopMode) return 'ios'
  if (/android/.test(userAgent)) return 'android'
  return 'other'
}
