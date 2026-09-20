import type { LibrarySort } from './LibraryToolbar'
import type { Game } from '@/types/game'

export function sortGames(games: Game[], sort: LibrarySort) {
  return [...games].sort((a, b) => {
    let difference: number
    if (sort === 'a-z') difference = a.title.localeCompare(b.title)
    else if (sort === 'recently-added') difference = b.addedAt - a.addedAt
    else if (sort === 'most-played') difference = b.totalPlayTimeMs - a.totalPlayTimeMs
    else difference = (b.lastPlayedAt ?? 0) - (a.lastPlayedAt ?? 0)
    return difference || a.title.localeCompare(b.title) || a.id.localeCompare(b.id)
  })
}
