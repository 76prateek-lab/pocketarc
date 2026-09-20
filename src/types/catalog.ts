export interface CatalogEntry {
  id: string
  title: string
  description: string
  developer: string
  publisher: string
  year: number
  genre: string[]
  cover: string
  romPath: string
  fileSize: number
  checksum: string
  featured: boolean
}
