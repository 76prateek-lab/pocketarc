import { Grid2X2, List, Search, Upload } from 'lucide-react'
import { Button, IconButton, Input, Select } from '@/components/ui'
import styles from './LibraryToolbar.module.css'

export type LibrarySort = 'recently-played' | 'recently-added' | 'a-z' | 'most-played'
type Props = { query: string; sort: LibrarySort; view: 'grid' | 'list'; onQueryChange: (value: string) => void; onSortChange: (sort: LibrarySort) => void; onViewChange: (view: 'grid' | 'list') => void; onImport: () => void }

export function LibraryToolbar({ onImport, onQueryChange, onSortChange, onViewChange, query, sort, view }: Props) {
  return <div className={styles.toolbar}><div className={styles.search}><Search size={16} aria-hidden="true"/><Input label="Search library" labelHidden placeholder="Search your library…" value={query} onChange={(event) => onQueryChange(event.target.value)}/></div><Select label="Sort games" labelHidden value={sort} onChange={(event) => onSortChange(event.target.value as LibrarySort)}><option value="recently-played">Recently played</option><option value="recently-added">Recently added</option><option value="a-z">A-Z</option><option value="most-played">Most played</option></Select><div className={styles.viewToggle} aria-label="Library view"><IconButton label="Grid view" aria-pressed={view === 'grid'} onClick={() => onViewChange('grid')}><Grid2X2 size={17}/></IconButton><IconButton label="List view" aria-pressed={view === 'list'} onClick={() => onViewChange('list')}><List size={18}/></IconButton></div><Button variant="primary" onClick={onImport}><Upload size={16}/>Import ROM</Button></div>
}
