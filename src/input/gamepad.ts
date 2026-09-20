import type { GameAction, GamepadMapping } from '@/input/inputTypes'

type ActionHandler = (action: GameAction, pressed: boolean) => void
type ConnectionHandler = (name?: string) => void

export class GamepadInput {
  private frame?: number
  private active = new Set<GameAction>()
  private index?: number
  constructor(private mapping: GamepadMapping, private readonly onAction: ActionHandler, private readonly onConnection: ConnectionHandler) {}

  setMapping(mapping: GamepadMapping) { this.mapping = mapping }
  start() {
    window.addEventListener('gamepadconnected', this.connected)
    window.addEventListener('gamepaddisconnected', this.disconnected)
    const existing = Array.from(navigator.getGamepads?.() ?? []).find(Boolean)
    if (existing) { this.index = existing.index; this.onConnection(existing.id) }
    this.poll()
  }
  stop() {
    window.removeEventListener('gamepadconnected', this.connected); window.removeEventListener('gamepaddisconnected', this.disconnected)
    if (this.frame !== undefined) cancelAnimationFrame(this.frame)
    this.frame = undefined; this.releaseAll(); this.index = undefined
  }
  private connected = (event: GamepadEvent) => { if (this.index === undefined) { this.index = event.gamepad.index; this.onConnection(event.gamepad.id) } }
  private disconnected = (event: GamepadEvent) => { if (event.gamepad.index === this.index) { this.releaseAll(); this.index = undefined; this.onConnection(undefined) } }
  private releaseAll() { for (const action of this.active) this.onAction(action, false); this.active.clear() }
  private poll = () => {
    if (this.index !== undefined) {
      const pad = navigator.getGamepads?.()[this.index]
      if (!pad) { this.releaseAll(); this.index = undefined; this.onConnection(undefined) }
      else for (const [action, button] of Object.entries(this.mapping) as [GameAction, number][]) {
        const pressed = Boolean(pad.buttons[button]?.pressed || (pad.buttons[button]?.value ?? 0) > 0.5)
        const wasPressed = this.active.has(action)
        if (pressed !== wasPressed) { if (pressed) this.active.add(action); else this.active.delete(action); this.onAction(action, pressed) }
      }
    }
    this.frame = requestAnimationFrame(this.poll)
  }
}
