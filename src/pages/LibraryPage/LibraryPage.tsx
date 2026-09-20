import { useDeferredValue, useMemo, useRef, useState, type DragEvent } from 'react'
import { Check, CircleAlert, FileUp, FolderOpen, LoaderCircle, Upload } from 'lucide-react'
import { Button, EmptyState, Skeleton } from '@/components/ui'
import { GameGrid } from '@/components/library/GameGrid'
import { LibraryToolbar, type LibrarySort } from '@/components/library/LibraryToolbar'
import type { Game } from '@/types/game'
import { sortGames } from '@/components/library/sortGames'
import { useGames } from '@/hooks/useGames'
import { requestPersistentStorage } from '@/services/storageEstimateService'
import { romImportService, type ImportProgress } from '@/services/romImportService'
import styles from './LibraryPage.module.css'

type LibraryPageProps = { games?: Game[] }

export function LibraryPage({ games: providedGames }: LibraryPageProps) {
  const storedGames = useGames()
  const games = providedGames ?? storedGames
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const deferredQuery = useDeferredValue(query)
  const [sort, setSort] = useState<LibrarySort>('recently-played')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [imports, setImports] = useState<Record<string, ImportProgress>>({})
  const [dragging, setDragging] = useState(false)
  const visibleGames = useMemo(() => { const needle = deferredQuery.trim().toLocaleLowerCase(); return sortGames((games ?? []).filter((game) => !needle || game.title.toLocaleLowerCase().includes(needle) || game.fileName.toLocaleLowerCase().includes(needle)), sort) }, [deferredQuery, games, sort])

  async function importFiles(files: FileList | File[]) {
    if (files.length === 0) return
    const results = await romImportService.importFiles(files, (progress) => {
      setImports((current) => ({ ...current, [progress.fileName]: progress }))
    })
    if (results.some((result) => result.stage === 'Complete')) await requestPersistentStorage()
    if (inputRef.current) inputRef.current.value = ''
  }

  function dropFiles(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setDragging(false)
    void importFiles(event.dataTransfer.files)
  }

  const importControl = <>
    <input ref={inputRef} hidden type="file" accept=".gba" multiple onChange={(event) => void importFiles(event.target.files ?? [])}/>
    <Button variant="primary" onClick={() => inputRef.current?.click()}><Upload size={16}/>Import ROM</Button>
  </>

  if (games === undefined) return <LibrarySkeleton/>

  if (games.length === 0) return <main className={styles.page}>
    <header className={styles.intro}><div><span className={styles.eyebrow}>Local collection</span><h1 className="display-medium">Library</h1><p className="body">Show and manage all your games.</p></div></header>
    <div className={`${styles.dropZone} ${dragging ? styles.dropZoneActive : ''}`} onDragEnter={() => setDragging(true)} onDragLeave={() => setDragging(false)} onDragOver={(event) => event.preventDefault()} onDrop={dropFiles}>
      <EmptyState icon={<FolderOpen size={20}/>} title="Your library is empty" description="Import a GBA ROM to start playing. Your games stay on this device." actions={importControl}/>
      <p className={styles.dropHint}><FileUp size={15}/>Supports .gba files · You can also drop files here</p>
    </div>
    <ImportProgressList imports={imports}/>
  </main>

  return <main className={styles.page}>
    <header className={styles.intro}><div><span className={styles.eyebrow}>Local collection</span><h1 className="display-medium">Library</h1><p className="body">Browse, play, and manage your games.</p></div><span className={styles.count}>{games.length} {games.length === 1 ? 'game' : 'games'}</span></header>
    <section className={styles.section}>
      <LibraryToolbar query={query} sort={sort} view={view} onQueryChange={setQuery} onSortChange={setSort} onViewChange={setView} onImport={() => inputRef.current?.click()}/>
      <input ref={inputRef} hidden type="file" accept=".gba" multiple onChange={(event) => void importFiles(event.target.files ?? [])}/>
      <div className={`${styles.dropTarget} ${dragging ? styles.dropZoneActive : ''}`} onDragEnter={() => setDragging(true)} onDragLeave={() => setDragging(false)} onDragOver={(event) => event.preventDefault()} onDrop={dropFiles}>
        {dragging && <p className={styles.dropOverlay}>Drop .gba files to import</p>}
        {visibleGames.length > 0 ? <GameGrid games={visibleGames} label="My library games" view={view}/> : <div className={styles.noResults}><FolderOpen size={22} aria-hidden="true"/><h3>No matching games</h3><p>Try another title or filename.</p><Button variant="ghost" onClick={() => setQuery('')}>Clear search</Button></div>}
      </div>
      <ImportProgressList imports={imports}/>
    </section>
  </main>
}

function LibrarySkeleton() { return <main className={styles.page} aria-busy="true" aria-label="Loading library"><header className={styles.intro}><div><Skeleton width={120} height={16}/><Skeleton width={260} height={48}/></div></header><div className={styles.skeletonGrid}>{Array.from({ length: 10 }, (_, index) => <div key={index}><Skeleton height={260}/><Skeleton width="70%" height={16}/><Skeleton width="45%" height={12}/></div>)}</div></main> }

function ImportProgressList({ imports }: { imports: Record<string, ImportProgress> }) {
  const items = Object.values(imports)
  if (items.length === 0) return null
  return <section className={styles.imports} aria-label="ROM import progress" aria-live="polite">
    {items.map((item) => <div className={styles.importRow} key={item.fileName}>
      {item.stage === 'Complete' ? <Check size={16}/> : item.stage === 'Failed' ? <CircleAlert size={16}/> : <LoaderCircle size={16} className={styles.spinner}/>} 
      <span className={styles.importName}>{item.fileName}</span><span>{item.message ?? item.stage}</span>
    </div>)}
  </section>
}
