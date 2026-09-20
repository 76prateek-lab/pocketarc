import type { InputBinding, KeyboardMapping } from '@/input/inputTypes'

type Handler = (binding: InputBinding, pressed: boolean) => void

export class KeyboardInput {
  private pressed = new Set<string>()
  private targets = new Set<Window>()
  constructor(private mapping: KeyboardMapping, private readonly handler: Handler) {}

  setMapping(mapping: KeyboardMapping) { this.mapping = mapping }
  start() { this.addTarget(window) }
  addTarget(target: Window) { if (this.targets.has(target)) return; this.targets.add(target); target.addEventListener('keydown', this.onDown as EventListener); target.addEventListener('keyup', this.onUp as EventListener) }
  stop() { for (const target of this.targets) { target.removeEventListener('keydown', this.onDown as EventListener); target.removeEventListener('keyup', this.onUp as EventListener) } this.targets.clear(); this.releaseAll() }
  releaseAll() { for (const code of this.pressed) this.emit(code, false); this.pressed.clear() }

  private binding(code: string) { return (Object.entries(this.mapping) as [InputBinding, string][]).find(([, mapped]) => mapped === code)?.[0] }
  private shouldIgnore(event: KeyboardEvent) { return event.metaKey || event.ctrlKey || event.altKey || event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement }
  private emit(code: string, pressed: boolean) { const binding = this.binding(code); if (binding) this.handler(binding, pressed) }
  private onDown = (event: KeyboardEvent) => {
    if (this.shouldIgnore(event) || !this.binding(event.code)) return
    event.preventDefault()
    if (this.pressed.has(event.code)) return
    this.pressed.add(event.code); this.emit(event.code, true)
  }
  private onUp = (event: KeyboardEvent) => {
    if (!this.pressed.has(event.code)) return
    event.preventDefault(); this.pressed.delete(event.code); this.emit(event.code, false)
  }
}
