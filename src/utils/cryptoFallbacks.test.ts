import { describe, expect, it } from 'vitest'
import { createId } from '@/utils/createId'
import { sha256Portable } from '@/utils/sha256'

describe('portable crypto fallbacks', () => {
  it('hashes bytes without SubtleCrypto', async () => {
    const bytes = new TextEncoder().encode('abc')
    await expect(sha256Portable(bytes.buffer)).resolves.toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad')
  })

  it('creates a UUID when randomUUID is unavailable', () => {
    const source = { getRandomValues: <T extends ArrayBufferView>(array: T) => { new Uint8Array(array.buffer, array.byteOffset, array.byteLength).fill(7); return array } }
    expect(createId(source)).toBe('07070707-0707-4707-8707-070707070707')
  })
})
