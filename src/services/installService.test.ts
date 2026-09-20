import { describe, expect, it, vi } from 'vitest'
import { InstallService, type InstallPromptEvent } from '@/services/installService'

describe('InstallService', () => {
  it('only exposes installation after the browser supplies a prompt', async () => {
    const service = new InstallService(); service.initialize()
    expect(service.getSnapshot().canInstall).toBe(false)
    const event = new Event('beforeinstallprompt', { cancelable: true }) as InstallPromptEvent
    event.prompt = vi.fn().mockResolvedValue(undefined)
    event.userChoice = Promise.resolve({ outcome: 'accepted', platform: 'web' })
    window.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
    expect(service.getSnapshot().canInstall).toBe(true)
    await expect(service.prompt()).resolves.toBe(true)
    expect(service.getSnapshot()).toMatchObject({ canInstall: false, installed: true, prompting: false })
  })
})
