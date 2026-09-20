export interface Game {
  id: string
  romId: string
  title: string
  fileName: string
  fileSize: number
  romHash: string
  coverId?: string
  coverUrl?: string
  description?: string
  developer?: string
  publisher?: string
  releaseYear?: number
  genre?: string[]
  favorite: boolean
  addedAt: number
  lastPlayedAt?: number
  totalPlayTimeMs: number
  lastSaveStateId?: string
  source: 'imported' | 'bundled'
  catalogId?: string
}
