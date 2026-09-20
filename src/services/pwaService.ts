import { registerSW } from 'virtual:pwa-register'
import { emulatorManager } from '@/emulator/EmulatorManager'

export type PwaSnapshot = { offlineReady: boolean; updateAvailable: boolean; updateDeferred: boolean; updating: boolean }

export class PwaService {
  private listeners = new Set<() => void>()
  private initialized = false
  private updateSW?: (reloadPage?: boolean) => Promise<void>
  private unsubscribeEmulator?: () => void
  private snapshot: PwaSnapshot = { offlineReady: false, updateAvailable: false, updateDeferred: false, updating: false }

  initialize() {
    if (this.initialized || typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    this.initialized = true
    this.updateSW = registerSW({
      immediate: true,
      onOfflineReady: () => this.patch({ offlineReady: true }),
      onNeedRefresh: () => this.patch({ updateAvailable: true }),
      onRegisterError: (error) => { if (import.meta.env.DEV) console.error('Service worker registration failed.', error) },
    })
    this.unsubscribeEmulator = emulatorManager.subscribe(() => {
      if (this.snapshot.updateDeferred && !this.isGameplayActive()) void this.applyUpdate()
    })
  }

  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => this.listeners.delete(listener) }
  getSnapshot = () => this.snapshot
  dismissOfflineReady() { this.patch({ offlineReady: false }) }
  dismissUpdate() { if (!this.snapshot.updateDeferred) this.patch({ updateAvailable: false }) }

  async requestUpdate() {
    if (!this.snapshot.updateAvailable || this.snapshot.updating) return
    if (this.isGameplayActive()) { this.patch({ updateDeferred: true }); return }
    await this.applyUpdate()
  }

  private isGameplayActive() { return !['idle', 'error'].includes(emulatorManager.getSnapshot().state) }
  private async applyUpdate() {
    if (!this.updateSW || this.snapshot.updating) return
    this.patch({ updating: true, updateDeferred: false })
    try { await this.updateSW(true) }
    catch { this.patch({ updating: false, updateAvailable: true }) }
  }

  private patch(patch: Partial<PwaSnapshot>) {
    this.snapshot = { ...this.snapshot, ...patch }
    this.listeners.forEach((listener) => listener())
  }
}

export const pwaService = new PwaService()
