import type { EmulatorJSAdapter } from '@/emulator/EmulatorJSAdapter'
import { binaryBuffer, binarySize } from '@/storage/binary'
import { saveRepository, type SaveRepository } from '@/storage/saveRepository'
import { saveStateRepository, type SaveStateRepository, type SaveStateSlot } from '@/storage/saveStateRepository'

const SAVE_DEBOUNCE_MS = 750

export class SaveBridge {
  private timer?: number
  private pending?: { data: ArrayBuffer; hash?: string }

  constructor(
    readonly gameId: string,
    private readonly saves: SaveRepository = saveRepository,
    private readonly states: SaveStateRepository = saveStateRepository,
  ) {}

  async getNormalSave() {
    const save = await this.saves.getForGame(this.gameId)
    return save && binarySize(save.data) ? binaryBuffer(save.data) : undefined
  }

  receiveNormalSave(data: ArrayBuffer, hash?: string) {
    if (data.byteLength === 0) return
    this.pending = { data: data.slice(0), ...(hash ? { hash } : {}) }
    if (this.timer !== undefined) window.clearTimeout(this.timer)
    this.timer = window.setTimeout(() => { void this.flush() }, SAVE_DEBOUNCE_MS)
  }

  async flush() {
    if (this.timer !== undefined) window.clearTimeout(this.timer)
    this.timer = undefined
    const pending = this.pending
    this.pending = undefined
    if (!pending?.data.byteLength) return
    await this.saves.putForGame(this.gameId, pending.data, pending.hash)
  }

  async capture(adapter: EmulatorJSAdapter, slot: SaveStateSlot, name: string) {
    const captured = await adapter.captureSaveState()
    return this.states.putSlot({
      gameId: this.gameId,
      slot,
      name,
      stateData: captured.state,
      ...(captured.screenshot?.byteLength ? { screenshot: captured.screenshot } : {}),
    })
  }

  async load(adapter: EmulatorJSAdapter, stateId: string) {
    const state = await this.states.get(stateId)
    if (!state || state.gameId !== this.gameId) throw new Error('This save state does not belong to the running game.')
    adapter.loadSaveState(await binaryBuffer(state.stateData))
  }

  async loadSlot(adapter: EmulatorJSAdapter, slot: SaveStateSlot) {
    const state = await this.states.getSlot(this.gameId, slot)
    if (!state) throw new Error('No save state exists in this slot.')
    adapter.loadSaveState(await binaryBuffer(state.stateData))
  }
}
