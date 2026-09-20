import { useState } from 'react'
import type { Game } from '@/types/game'
import { useCoverUrl } from '@/hooks/useCover'

export function GameCover({ className, game, labelled = false }: { className?: string; game: Game; labelled?: boolean }) {
  const source = useCoverUrl(game.coverId, game.coverUrl)
  const [failedSource, setFailedSource] = useState<string>()
  const initials = game.title.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toLocaleUpperCase()
  if (!source || failedSource === source) return <div className={className} role={labelled ? 'img' : undefined} aria-label={labelled ? `${game.title} cover` : undefined} data-cover-fallback><em aria-hidden="true">Game Boy Advance</em><span aria-hidden="true">{initials}</span><small>{game.title}</small></div>
  return <img className={className} src={source} alt={labelled ? `${game.title} cover` : ''} data-catalog-art={source.startsWith('/catalog/covers/') || undefined} onError={() => setFailedSource(source)}/>
}
