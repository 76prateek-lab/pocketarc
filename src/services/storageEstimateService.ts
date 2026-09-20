import { settingsRepository } from '@/storage/settingsRepository'

export type StorageEstimate = {
  supported: boolean
  usage?: number
  quota?: number
  persistent?: boolean
}

export async function getStorageEstimate(): Promise<StorageEstimate> {
  if (!navigator.storage?.estimate) return { supported: false }
  try {
    const [estimate, persistent] = await Promise.all([
      navigator.storage.estimate(),
      navigator.storage.persisted?.() ?? Promise.resolve(undefined),
    ])
    return { supported: true, usage: estimate.usage, quota: estimate.quota, persistent }
  } catch {
    return { supported: false }
  }
}

export async function requestPersistentStorage(force = false) {
  if (!navigator.storage?.persist) return false
  try {
    if (!force && (await settingsRepository.get('persistentStorageRequested'))?.value === true) {
      return navigator.storage.persisted?.() ?? false
    }
    const granted = await navigator.storage.persist()
    await settingsRepository.set('persistentStorageRequested', true)
    return granted
  } catch {
    return false
  }
}
