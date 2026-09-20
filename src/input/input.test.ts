import { afterEach, describe, expect, it, vi } from 'vitest'
import { GamepadInput } from '@/input/gamepad'
import { InputManager } from '@/input/InputManager'
import { KeyboardInput } from '@/input/keyboard'
import { DEFAULT_GAMEPAD_MAPPING, DEFAULT_KEYBOARD_MAPPING } from '@/input/mappings'
import type { GameAction } from '@/input/inputTypes'

afterEach(() => vi.restoreAllMocks())

describe('unified input', () => {
  it('supports simultaneous keyboard buttons and releases every held key on cleanup', () => {
    const events: string[] = []
    const keyboard = new KeyboardInput(DEFAULT_KEYBOARD_MAPPING, (action, pressed) => events.push(`${action}:${pressed}`))
    keyboard.start()
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp', cancelable: true }))
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyX', cancelable: true }))
    keyboard.stop()
    expect(events).toEqual(['UP:true', 'A:true', 'UP:false', 'A:false'])
  })

  it('tracks multi-touch sources independently without releasing a still-held action', () => {
    const events: string[] = []
    const manager = new InputManager((action, pressed) => events.push(`${action}:${pressed}`), vi.fn())
    manager.touch('A', true, 1)
    manager.touch('A', true, 2)
    manager.touch('B', true, 3)
    manager.touch('A', false, 1)
    manager.touch('A', false, 2)
    manager.stop()
    expect(events).toEqual(['A:true', 'B:true', 'A:false', 'B:false'])
  })

  it('releases every held action when the window loses focus', async () => {
    const events: string[] = []
    const manager = new InputManager((action, pressed) => events.push(`${action}:${pressed}`), vi.fn())
    await manager.start()
    manager.touch('LEFT', true, 1)
    window.dispatchEvent(new Event('blur'))
    manager.stop()
    expect(events).toEqual(['LEFT:true', 'LEFT:false'])
  })

  it('polls a standard gamepad only while active and releases buttons on stop', () => {
    let frameCallback: FrameRequestCallback | undefined
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { frameCallback = callback; return 1 })
    vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined)
    const buttons = Array.from({ length: 16 }, () => ({ pressed: false, touched: false, value: 0 }))
    const pad = { id: 'Standard Test Pad', index: 0, connected: true, mapping: 'standard', buttons, axes: [], timestamp: 1, vibrationActuator: null } as unknown as Gamepad
    Object.defineProperty(navigator, 'getGamepads', { configurable: true, value: () => [pad, null, null, null] })
    const events: string[] = []
    const connections: (string | undefined)[] = []
    const gamepad = new GamepadInput(DEFAULT_GAMEPAD_MAPPING, (action: GameAction, pressed) => events.push(`${action}:${pressed}`), (name) => connections.push(name))
    gamepad.start()
    buttons[0].pressed = true; buttons[0].value = 1; frameCallback?.(1)
    buttons[1].pressed = true; buttons[1].value = 1; frameCallback?.(2)
    const disconnected = new Event('gamepaddisconnected')
    Object.defineProperty(disconnected, 'gamepad', { value: pad })
    window.dispatchEvent(disconnected)
    gamepad.stop()
    expect(connections).toContain('Standard Test Pad')
    expect(connections.at(-1)).toBeUndefined()
    expect(events).toEqual(['A:true', 'B:true', 'A:false', 'B:false'])
    expect(window.cancelAnimationFrame).toHaveBeenCalledWith(1)
    Reflect.deleteProperty(navigator, 'getGamepads')
  })
})
