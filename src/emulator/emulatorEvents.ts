import type { EmulatorSnapshot } from '@/emulator/emulatorTypes'

export type EmulatorListener = (snapshot: EmulatorSnapshot) => void

export class EmulatorEvents {
  private readonly listeners = new Set<EmulatorListener>()

  subscribe(listener: EmulatorListener) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  emit(snapshot: EmulatorSnapshot) {
    this.listeners.forEach((listener) => listener(snapshot))
  }
}
