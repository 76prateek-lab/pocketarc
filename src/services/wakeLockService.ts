type WakeLockProvider = { request(type: 'screen'): Promise<WakeLockSentinel> }

export class WakeLockService {
  private sentinel?: WakeLockSentinel
  private playing = false
  private disposed = false
  private readonly provider?: WakeLockProvider

  constructor(provider: WakeLockProvider | undefined = navigator.wakeLock) { this.provider = provider }

  async setPlaying(playing: boolean) {
    this.playing = playing
    if (!playing) await this.release()
    else await this.acquire()
  }

  async visibilityChanged() {
    if (document.visibilityState === 'hidden') await this.release()
    else if (this.playing) await this.acquire()
  }

  async release() {
    const sentinel = this.sentinel
    this.sentinel = undefined
    if (sentinel && !sentinel.released) {
      try { await sentinel.release() } catch { /* Wake lock release is best-effort. */ }
    }
  }

  async dispose() { this.disposed = true; this.playing = false; await this.release() }

  private async acquire() {
    if (this.disposed || !this.playing || document.visibilityState !== 'visible' || !this.provider || (this.sentinel && !this.sentinel.released)) return
    try {
      const sentinel = await this.provider.request('screen')
      if (this.disposed || !this.playing) { await sentinel.release(); return }
      this.sentinel = sentinel
      sentinel.addEventListener('release', () => { if (this.sentinel === sentinel) this.sentinel = undefined })
    } catch { /* Unsupported, denied, low-power, and inactive-document cases are nonfatal. */ }
  }
}
