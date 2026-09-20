import { afterEach, describe, expect, it, vi } from 'vitest'
import { getStorageEstimate, requestPersistentStorage } from '@/services/storageEstimateService'

afterEach(() => vi.restoreAllMocks())

describe('storage estimate fallbacks', () => {
  it('degrades gracefully when quota estimation fails', async () => {
    const original = navigator.storage
    Object.defineProperty(navigator, 'storage', { configurable: true, value: { estimate: vi.fn().mockRejectedValue(new Error('quota failure')), persisted: vi.fn() } })
    await expect(getStorageEstimate()).resolves.toEqual({ supported: false })
    Object.defineProperty(navigator, 'storage', { configurable: true, value: original })
  })

  it('treats persistent-storage denial as optional', async () => {
    const original = navigator.storage
    Object.defineProperty(navigator, 'storage', { configurable: true, value: { persist: vi.fn().mockRejectedValue(new Error('denied')) } })
    await expect(requestPersistentStorage(true)).resolves.toBe(false)
    Object.defineProperty(navigator, 'storage', { configurable: true, value: original })
  })
})
