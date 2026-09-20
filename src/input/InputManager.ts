import { GamepadInput } from '@/input/gamepad'
import { KeyboardInput } from '@/input/keyboard'
import { APP_COMMANDS, type AppCommand, type CommandSink, type GameAction, type InputBinding, type InputSettings, type InputSink, type InputSource } from '@/input/inputTypes'
import { mergeInputSettings } from '@/input/mappings'
import { settingsService, toInputSettings } from '@/services/settingsService'

export class InputManager {
  private settings = mergeInputSettings(undefined)
  private keyboard?: KeyboardInput
  private gamepad?: GamepadInput
  private sources = new Map<GameAction, Set<string>>()
  private controllerName?: string
  private listeners = new Set<() => void>()
  private active = false
  private keyboardTargets = new Set<Window>()

  constructor(private readonly sink: InputSink, private readonly commands: CommandSink) {}

  async start(initialSettings?: InputSettings) {
    this.active = true
    const stored = initialSettings ? undefined : await settingsService.getAppSettings()
    if (!this.active) return
    this.settings = mergeInputSettings(initialSettings ?? (stored ? toInputSettings(stored) : undefined))
    this.keyboard = new KeyboardInput(this.settings.keyboard, (binding, pressed) => this.binding('keyboard', binding, pressed))
    this.gamepad = new GamepadInput(this.settings.gamepad, (action, pressed) => this.setAction('gamepad', action, pressed), (name) => { this.controllerName = name; this.emit() })
    this.keyboard.start(); for (const target of this.keyboardTargets) this.keyboard.addTarget(target); this.gamepad.start()
    window.addEventListener('blur', this.releaseAll)
    document.addEventListener('visibilitychange', this.visibility)
    this.emit()
  }
  stop() { this.active = false; this.keyboard?.stop(); this.gamepad?.stop(); window.removeEventListener('blur', this.releaseAll); document.removeEventListener('visibilitychange', this.visibility); this.releaseAll() }
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => this.listeners.delete(listener) }
  snapshot = () => ({ controllerName: this.controllerName, settings: this.settings })
  touch(action: GameAction, pressed: boolean, pointerId: number) { this.setAction(`touch:${pointerId}`, action, pressed) }
  attachKeyboardTarget(target: Window) { this.keyboardTargets.add(target); this.keyboard?.addTarget(target) }
  async updateSettings(settings: InputSettings) { this.settings = mergeInputSettings(settings); this.keyboard?.setMapping(this.settings.keyboard); this.gamepad?.setMapping(this.settings.gamepad); const global = await settingsService.getAppSettings(); await settingsService.saveAppSettings({ ...global, keyboard: this.settings.keyboard, gamepad: this.settings.gamepad, touch: { ...global.touch, opacity: this.settings.touchOpacity, size: this.settings.touchSize, layout: this.settings.touchLayout, layouts: this.settings.touchLayouts, showControls: this.settings.showTouchControls, haptics: this.settings.haptics } }); this.emit() }

  private binding(source: InputSource, binding: InputBinding, pressed: boolean) {
    if ((APP_COMMANDS as readonly string[]).includes(binding)) this.commands(binding as AppCommand, pressed)
    else this.setAction(source, binding as GameAction, pressed)
  }
  private setAction(source: string, action: GameAction, pressed: boolean) {
    const holders = this.sources.get(action) ?? new Set<string>()
    const wasPressed = holders.size > 0
    if (pressed) holders.add(source); else holders.delete(source)
    this.sources.set(action, holders)
    if (wasPressed !== (holders.size > 0)) this.sink(action, holders.size > 0)
  }
  private releaseAll = () => { for (const [action, holders] of this.sources) { if (holders.size) this.sink(action, false); holders.clear() } }
  private visibility = () => { if (document.visibilityState === 'hidden') this.releaseAll() }
  private emit() { for (const listener of this.listeners) listener() }
}
