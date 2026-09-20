import { removeMountedEmulator } from '@/emulator/cleanup'
import { EMULATOR_FRAME_URL } from '@/emulator/emulatorConfig'
import type { CapturedSaveState, CapturedScreenshot, EmulatorCommand, EmulatorFrameMessage, EmulatorLaunchConfig } from '@/emulator/emulatorTypes'
import { createId } from '@/utils/createId'

const CHANNEL = 'pocketgba-emulator'

type AdapterCallbacks = {
  onEvent: (message: EmulatorFrameMessage) => void
}

export class EmulatorJSAdapter {
  private iframe?: HTMLIFrameElement
  private mount?: HTMLElement
  private messageHandler?: (event: MessageEvent) => void
  private pendingReject?: (reason?: unknown) => void
  private readyTimeout?: number
  private stateRequests = new Map<string, { resolve: (value: CapturedSaveState) => void; reject: (reason: Error) => void; timeout: number }>()
  private flushRequests = new Map<string, { resolve: () => void; timeout: number }>()
  private screenshotRequests = new Map<string, { resolve: (value: CapturedScreenshot) => void; reject: (reason: Error) => void; timeout: number }>()

  async mountEmulator(mount: HTMLElement, config: EmulatorLaunchConfig, callbacks: AdapterCallbacks) {
    this.destroy()
    this.mount = mount
    const iframe = document.createElement('iframe')
    iframe.className = 'pocketgba-emulator-frame'
    iframe.title = `${config.gameName} emulator`
    iframe.src = EMULATOR_FRAME_URL
    iframe.allow = 'autoplay; fullscreen; gamepad'
    iframe.setAttribute('allowfullscreen', '')
    this.iframe = iframe
    mount.replaceChildren(iframe)

    await new Promise<void>((resolve, reject) => {
      this.pendingReject = reject
      this.readyTimeout = window.setTimeout(() => reject(new Error('EmulatorJS did not become ready in time.')), 20_000)
      this.messageHandler = (event) => {
        if (event.origin !== window.location.origin || event.source !== iframe.contentWindow || event.data?.channel !== CHANNEL) return
        const message = event.data as EmulatorFrameMessage
        const type = message.type
        if (type === 'frame-ready') {
          iframe.contentWindow?.postMessage({ channel: CHANNEL, type: 'initialize', config }, window.location.origin)
          return
        }
        if ((type === 'state-captured' || type === 'state-error') && message.requestId) {
          const pending = this.stateRequests.get(message.requestId)
          if (pending) {
            window.clearTimeout(pending.timeout)
            this.stateRequests.delete(message.requestId)
            if (type === 'state-captured' && message.data) pending.resolve({ state: message.data, screenshot: message.screenshot, screenshotType: message.screenshotType })
            else pending.reject(new Error(message.detail ?? 'The save state could not be created.'))
          }
        }
        if (type === 'flush-complete' && message.requestId) {
          const pending = this.flushRequests.get(message.requestId)
          if (pending) {
            window.clearTimeout(pending.timeout)
            this.flushRequests.delete(message.requestId)
            pending.resolve()
          }
        }
        if ((type === 'screenshot-captured' || type === 'screenshot-error') && message.requestId) {
          const pending = this.screenshotRequests.get(message.requestId)
          if (pending) {
            window.clearTimeout(pending.timeout); this.screenshotRequests.delete(message.requestId)
            if (type === 'screenshot-captured' && message.data) pending.resolve({ data: message.data, type: message.screenshotType ?? 'image/png' })
            else pending.reject(new Error(message.detail ?? 'The screenshot could not be captured.'))
          }
        }
        callbacks.onEvent(message)
        if (type === 'ready') { this.clearPending(); resolve() }
        if (type === 'error') { this.clearPending(); reject(new Error(message.detail || 'EmulatorJS failed to load.')) }
      }
      window.addEventListener('message', this.messageHandler)
    })
  }

  command(command: EmulatorCommand) {
    this.iframe?.contentWindow?.postMessage({ channel: CHANNEL, type: 'command', command }, window.location.origin)
  }

  captureSaveState() {
    const requestId = createId()
    return new Promise<CapturedSaveState>((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        this.stateRequests.delete(requestId)
        reject(new Error('The emulator did not return a save state in time.'))
      }, 10_000)
      this.stateRequests.set(requestId, { resolve, reject, timeout })
      this.command({ type: 'capture-state', requestId })
    })
  }

  captureScreenshot() {
    const requestId = createId()
    return new Promise<CapturedScreenshot>((resolve, reject) => {
      const timeout = window.setTimeout(() => { this.screenshotRequests.delete(requestId); reject(new Error('The emulator did not return a screenshot in time.')) }, 10_000)
      this.screenshotRequests.set(requestId, { resolve, reject, timeout })
      this.command({ type: 'capture-screenshot', requestId })
    })
  }

  loadSaveState(state: ArrayBuffer) { this.command({ type: 'load-state', state }) }
  getInputWindow() { return this.iframe?.contentWindow ?? undefined }
  flushSave() {
    const requestId = createId()
    return new Promise<void>((resolve) => {
      const timeout = window.setTimeout(() => { this.flushRequests.delete(requestId); resolve() }, 1000)
      this.flushRequests.set(requestId, { resolve, timeout })
      this.command({ type: 'flush-save', requestId })
    })
  }

  destroy() {
    const reject = this.pendingReject
    this.clearPending()
    reject?.(new DOMException('Emulator mounting was cancelled.', 'AbortError'))
    if (this.messageHandler) window.removeEventListener('message', this.messageHandler)
    if (this.iframe?.contentWindow) this.command({ type: 'destroy' })
    if (this.mount) removeMountedEmulator(this.mount, this.iframe)
    this.messageHandler = undefined
    this.iframe = undefined
    this.mount = undefined
    for (const request of this.stateRequests.values()) {
      window.clearTimeout(request.timeout)
      request.reject(new Error('The emulator was closed before the save state completed.'))
    }
    this.stateRequests.clear()
    for (const request of this.flushRequests.values()) { window.clearTimeout(request.timeout); request.resolve() }
    this.flushRequests.clear()
    for (const request of this.screenshotRequests.values()) { window.clearTimeout(request.timeout); request.reject(new Error('The emulator was closed before the screenshot completed.')) }
    this.screenshotRequests.clear()
  }

  private clearPending() {
    if (this.readyTimeout !== undefined) window.clearTimeout(this.readyTimeout)
    this.readyTimeout = undefined
    this.pendingReject = undefined
  }
}
