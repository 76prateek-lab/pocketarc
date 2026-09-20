import type { Game } from '@/types/game'

const coverUrl = '/covers/placeholders/gba-cover.svg'

export const fixtureGames: Game[] = ([
  { id: 'aurora-circuit', romId: 'rom-001', title: 'Aurora Circuit', fileName: 'aurora-circuit.gba', coverUrl, description: 'A fast, technical racer built for short sessions and precise cornering.', developer: 'Northstar Works', publisher: 'Pocket Press', releaseYear: 2003, genre: ['Racing'], favorite: true, addedAt: 1789228800000, lastPlayedAt: 1790051400000, totalPlayTimeMs: 16440000, lastSaveStateId: 'state-001', source: 'imported' },
  { id: 'verdant-quest', romId: 'rom-002', title: 'Verdant Quest', fileName: 'verdant-quest.gba', coverUrl, description: 'Explore quiet ruins, recover lost maps, and restore a forgotten valley.', developer: 'Mosslight', publisher: 'Pocket Press', releaseYear: 2002, genre: ['Adventure', 'RPG'], favorite: false, addedAt: 1789056000000, lastPlayedAt: 1789875000000, totalPlayTimeMs: 31260000, lastSaveStateId: 'state-002', source: 'imported' },
  { id: 'pixel-strikers', romId: 'rom-003', title: 'Pixel Strikers', fileName: 'pixel-strikers.gba', coverUrl, description: 'A compact arcade football game with quick matches and tournament play.', developer: 'Eleven Labs', publisher: 'Pocket Press', releaseYear: 2004, genre: ['Sports'], favorite: true, addedAt: 1788710400000, lastPlayedAt: 1789441200000, totalPlayTimeMs: 7740000, source: 'imported' },
  { id: 'moonfall-tactics', romId: 'rom-004', title: 'Moonfall Tactics', fileName: 'moonfall-tactics.gba', coverUrl, description: 'Lead a small company through deliberate turn-based encounters.', developer: 'Grey Banner', publisher: 'Pocket Press', releaseYear: 2005, genre: ['Strategy'], favorite: false, addedAt: 1788278400000, lastPlayedAt: 1789016400000, totalPlayTimeMs: 45180000, lastSaveStateId: 'state-004', source: 'imported' },
  { id: 'harbor-story', romId: 'rom-005', title: 'Harbor Story', fileName: 'harbor-story.gba', coverUrl, description: 'Build a workshop, meet the harbor community, and take each day slowly.', developer: 'Soft Current', publisher: 'Pocket Press', releaseYear: 2001, genre: ['Simulation'], favorite: false, addedAt: 1788019200000, totalPlayTimeMs: 2460000, source: 'imported' },
  { id: 'orbit-breaker', romId: 'rom-006', title: 'Orbit Breaker', fileName: 'orbit-breaker.gba', coverUrl, description: 'A focused score-chasing shooter set above a collapsing moon.', developer: 'Aster Byte', publisher: 'Pocket Press', releaseYear: 2003, genre: ['Action'], favorite: false, addedAt: 1787587200000, lastPlayedAt: 1788584400000, totalPlayTimeMs: 10920000, source: 'imported' },
  { id: 'tiny-workshop', romId: 'rom-007', title: 'Tiny Workshop', fileName: 'tiny-workshop.gba', coverUrl, description: 'Solve mechanical puzzles by building small, surprising machines.', developer: 'Bench Games', publisher: 'Pocket Press', releaseYear: 2004, genre: ['Puzzle'], favorite: true, addedAt: 1787155200000, totalPlayTimeMs: 5400000, source: 'imported' },
  { id: 'winter-post', romId: 'rom-008', title: 'Winter Post', fileName: 'winter-post.gba', coverUrl, description: 'Deliver letters across a snowbound region and learn its stories.', developer: 'Quiet Mile', publisher: 'Pocket Press', releaseYear: 2002, genre: ['Adventure'], favorite: false, addedAt: 1786723200000, totalPlayTimeMs: 0, source: 'imported' },
] satisfies Array<Omit<Game, 'fileSize' | 'romHash'>>).map((game, index) => ({
  ...game,
  fileSize: 8 * 1024 * 1024,
  romHash: `fixture-hash-${index + 1}`,
}))
