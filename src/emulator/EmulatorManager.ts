import { EmulatorJSAdapter } from '@/emulator/EmulatorJSAdapter'
import { createEmulatorConfig } from '@/emulator/emulatorConfig'
import { EmulatorEvents } from '@/emulator/emulatorEvents'
import { loadRomUrl, type LoadedRom, RomUnavailableError } from '@/emulator/romLoader'
import type { EmulatorLaunchRequest, EmulatorSnapshot, EmulatorState } from '@/emulator/emulatorTypes'
import { SaveBridge } from '@/emulator/saveBridge'
import type { SaveStateSlot } from '@/storage/saveStateRepository'
import type { GameAction } from '@/input/inputTypes'
import { screenshotRepository } from '@/storage/screenshotRepository'
import type { DisplaySettings } from '@/types/settings'
import { createId } from '@/utils/createId'

const ALLOWED_TRANSITIONS: Record<EmulatorState, EmulatorState[]> = {
  idle: ['idle', 'preparing'],
  preparing: ['loading', 'error', 'destroying', 'idle'],
  loading: ['ready', 'error', 'destroying'],
  ready: ['running', 'error', 'destroying'],
  running: ['running', 'paused', 'error', 'destroying'],
  paused: ['running', 'error', 'destroying'],
  error: ['error', 'idle', 'preparing', 'destroying'],
  destroying: ['idle', 'error'],
}

export class EmulatorManager {
  private readonly events = new EmulatorEvents()
  private adapter?: EmulatorJSAdapter
  private loadedRom?: LoadedRom
  private generation = 0
  private saveBridge?: SaveBridge
  private snapshot: EmulatorSnapshot = { state: 'idle' }

  subscribe = (listener: (snapshot: EmulatorSnapshot) => void) => this.events.subscribe(listener)
  getSnapshot = () => this.snapshot

  async launch({ game, mount }: EmulatorLaunchRequest) {
    const generation = ++this.generation
    await this.destroy(false)
    if (generation !== this.generation) return
    this.setState('preparing', game.id)
    try {
      const loadedRom = await loadRomUrl(game.romId)
      if (generation !== this.generation) { loadedRom.release(); return }
      this.loadedRom = loadedRom
      const saveBridge = new SaveBridge(game.id)
      this.saveBridge = saveBridge
      const normalSave = await saveBridge.getNormalSave()
      if (generation !== this.generation) { loadedRom.release(); return }
      this.setState('loading', game.id)
      const adapter = new EmulatorJSAdapter()
      this.adapter = adapter
      await adapter.mountEmulator(mount, { ...createEmulatorConfig(game, loadedRom.url), ...(normalSave ? { normalSave } : {}) }, {
        onEvent: (message) => {
          if (generation !== this.generation) return
          const { type: event, detail } = message
          if (event === 'running') this.setState('running', game.id)
          if (event === 'paused') this.setState('paused', game.id)
          if (event === 'exit') void this.destroy()
          if (event === 'error') this.fail(detail ?? 'The emulator encountered an error.', game.id)
          if (event === 'normal-save' && message.data) saveBridge.receiveNormalSave(message.data, message.hash)
        },
      })
      if (generation === this.generation && this.snapshot.state === 'loading') this.setState('ready', game.id)
    } catch (error) {
      if (generation !== this.generation) return
      this.adapter?.destroy()
      this.adapter = undefined
      this.loadedRom?.release()
      this.loadedRom = undefined
      this.saveBridge = undefined
      this.fail(error instanceof Error ? error.message : 'The emulator could not be started.', game.id)
      throw error
    }
  }

  pause() { if (this.snapshot.state === 'running') this.adapter?.command({ type: 'pause' }) }
  resume() { if (this.snapshot.state === 'paused') this.adapter?.command({ type: 'resume' }) }
  restart() { if (['ready', 'running', 'paused'].includes(this.snapshot.state)) this.adapter?.command({ type: 'restart' }) }
  input(action: GameAction, pressed: boolean) { if (['running', 'paused'].includes(this.snapshot.state)) this.adapter?.command({ type: 'input', action, pressed }) }
  fastForward(ratio: 1 | 2 | 4) { if (['ready', 'running', 'paused'].includes(this.snapshot.state)) this.adapter?.command({ type: 'fast-forward', ratio }) }
  setCheats(cheats: { code: string; enabled: boolean }[]) { if (['ready', 'running', 'paused'].includes(this.snapshot.state)) this.adapter?.command({ type: 'cheats', cheats }) }
  setVolume(value: number) { this.adapter?.command({ type: 'volume', value: Math.min(1, Math.max(0, value)) }) }
  setDisplay(settings: DisplaySettings) { this.adapter?.command({ type: 'display', settings }) }
  getInputWindow() { return this.adapter?.getInputWindow() }

  async saveState(slot: SaveStateSlot, name: string) {
    if (!this.adapter || !this.saveBridge) throw new Error('Start the game before creating a save state.')
    return this.saveBridge.capture(this.adapter, slot, name)
  }

  async loadState(stateId: string) {
    if (!this.adapter || !this.saveBridge) throw new Error('Start the game before loading a save state.')
    return this.saveBridge.load(this.adapter, stateId)
  }
  quickSave() { return this.saveState('quick', 'Quick Save') }
  async quickLoad() {
    if (!this.adapter || !this.saveBridge) throw new Error('Start the game before loading a save state.')
    return this.saveBridge.loadSlot(this.adapter, 'quick')
  }
  async captureScreenshot() {
    if (!this.adapter || !this.snapshot.gameId) throw new Error('Start the game before taking a screenshot.')
    const capture = await this.adapter.captureScreenshot()
    const record = { id: createId(), gameId: this.snapshot.gameId, blob: new Blob([capture.data], { type: capture.type }), createdAt: Date.now(), source: 'manual' as const }
    await screenshotRepository.put(record)
    return record
  }

  async flushSaves() {
    await this.adapter?.flushSave()
    await this.saveBridge?.flush()
  }

  async destroy(invalidate = true) {
    if (invalidate) this.generation++
    if (!this.adapter && !this.loadedRom) { this.setState('idle'); return }
    const shouldAutoSave = Boolean(this.adapter && this.saveBridge && ['ready', 'running', 'paused'].includes(this.snapshot.state))
    this.setState('destroying', this.snapshot.gameId)
    try {
      if (shouldAutoSave && this.adapter && this.saveBridge) {
        try { await this.saveBridge.capture(this.adapter, 'auto', 'Auto save') }
        catch (error) { if (import.meta.env.DEV) console.error('Failed to create the automatic save state.', error) }
      }
      try { await this.flushSaves() }
      catch (error) { if (import.meta.env.DEV) console.error('Failed to flush normal save data.', error) }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to flush emulator saves during cleanup.', error)
    } finally {
      this.adapter?.destroy()
      this.adapter = undefined
      this.loadedRom?.release()
      this.loadedRom = undefined
      this.saveBridge = undefined
      this.setState('idle')
    }
  }

  private fail(message: string, gameId?: string) { this.transition('error', gameId, message) }
  private setState(state: EmulatorState, gameId?: string) { this.transition(state, gameId) }
  private transition(state: EmulatorState, gameId?: string, error?: string) {
    if (!ALLOWED_TRANSITIONS[this.snapshot.state].includes(state)) {
      throw new Error(`Invalid emulator transition: ${this.snapshot.state} → ${state}`)
    }
    this.snapshot = { state, gameId, ...(error ? { error } : {}) }
    this.events.emit(this.snapshot)
  }
}

export { RomUnavailableError }
export const emulatorManager = new EmulatorManager()
