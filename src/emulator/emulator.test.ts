import { describe, expect, it, vi } from 'vitest'
import { EmulatorJSAdapter } from '@/emulator/EmulatorJSAdapter'
import { createEmulatorConfig } from '@/emulator/emulatorConfig'
import { revokeRomUrl } from '@/emulator/cleanup'
import type { Game } from '@/types/game'

const game: Game = { id: 'game-1', romId: 'rom-1', title: 'Homebrew Test', fileName: 'homebrew.gba', fileSize: 4, romHash: '0123456789abcdef', favorite: false, addedAt: 1, totalPlayTimeMs: 0, source: 'imported' }

describe('emulator integration boundary', () => {
  it('creates the required GBA/mGBA-compatible EmulatorJS configuration', () => {
    expect(createEmulatorConfig(game, 'blob:test-rom')).toEqual({ player: '#game', core: 'gba', gameUrl: 'blob:test-rom', gameName: 'Homebrew Test', gameId: 0x01234567, pathToData: '/emulatorjs/data/' })
  })

  it('revokes generated ROM URLs during cleanup', () => {
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined)
    revokeRomUrl('blob:test-rom')
    expect(revoke).toHaveBeenCalledWith('blob:test-rom')
    revoke.mockRestore()
  })

  it('never leaves more than one iframe mounted and removes it on destroy', async () => {
    const mount = document.createElement('div')
    const adapter = new EmulatorJSAdapter()
    const config = createEmulatorConfig(game, 'blob:test-rom')
    const first = adapter.mountEmulator(mount, config, { onEvent: vi.fn() })
    expect(mount.querySelectorAll('iframe')).toHaveLength(1)
    adapter.destroy()
    await expect(first).rejects.toMatchObject({ name: 'AbortError' })
    expect(mount.querySelectorAll('iframe')).toHaveLength(0)

    const second = adapter.mountEmulator(mount, config, { onEvent: vi.fn() })
    const frame = mount.querySelector('iframe')
    window.dispatchEvent(new MessageEvent('message', { data: { channel: 'pocketgba-emulator', type: 'ready' }, origin: window.location.origin, source: frame?.contentWindow }))
    await second
    expect(mount.querySelectorAll('iframe')).toHaveLength(1)
    adapter.destroy()
    expect(mount.querySelectorAll('iframe')).toHaveLength(0)
  })
})
