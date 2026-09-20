import { useState } from 'react'
import { Download, Eye, Trash2 } from 'lucide-react'
import { Button, Dialog, Skeleton } from '@/components/ui'
import { useScreenshotUrl } from '@/hooks/useSaves'
import { screenshotRepository } from '@/storage/screenshotRepository'
import type { ScreenshotRecord } from '@/storage/schema'
import { formatLastPlayed } from '@/utils/formatDate'
import styles from './ScreenshotGallery.module.css'

export function ScreenshotGallery({ gameTitle, screenshots }: { gameTitle: string; screenshots: ScreenshotRecord[] }) {
  const [viewing, setViewing] = useState<ScreenshotRecord>(); const ordered = screenshots.slice().sort((a, b) => b.createdAt - a.createdAt)
  if (!ordered.length) return <div className={styles.empty}><p>No screenshots yet</p><span>Take one from the emulator Quick Menu.</span></div>
  return <><div className={styles.grid}>{ordered.map((screenshot) => <ScreenshotCard gameTitle={gameTitle} key={screenshot.id} screenshot={screenshot} onView={() => setViewing(screenshot)}/>)}</div><ScreenshotViewer screenshot={viewing} onClose={() => setViewing(undefined)}/></>
}

function ScreenshotCard({ gameTitle, onView, screenshot }: { gameTitle: string; onView: () => void; screenshot: ScreenshotRecord }) { const url = useScreenshotUrl(screenshot.id); return <article><button className={styles.preview} type="button" onClick={onView}>{url ? <img src={url} alt={`${screenshot.source === 'manual' ? 'Gameplay' : 'Save-state'} screenshot`}/> : <Skeleton height="100%"/>}<span><Eye size={15}/>View</span></button><footer><div><strong>{screenshot.source === 'manual' ? 'Screenshot' : 'Save state'}</strong><time dateTime={new Date(screenshot.createdAt).toISOString()}>{formatLastPlayed(screenshot.createdAt)}</time></div><button type="button" aria-label="Download screenshot" onClick={() => void screenshotRepository.download(screenshot.id, gameTitle)}><Download size={16}/></button><button type="button" aria-label="Delete screenshot" onClick={() => void screenshotRepository.delete(screenshot.id)}><Trash2 size={16}/></button></footer></article> }
function ScreenshotViewer({ onClose, screenshot }: { onClose: () => void; screenshot?: ScreenshotRecord }) { const url = useScreenshotUrl(screenshot?.id); return <Dialog open={Boolean(screenshot)} onClose={onClose} title="Screenshot" description={screenshot ? `${screenshot.source === 'manual' ? 'Manual capture' : 'Save-state preview'} · ${formatLastPlayed(screenshot.createdAt)}` : undefined} footer={<Button onClick={onClose}>Close</Button>}>{url && <img className={styles.full} src={url} alt="Full-size gameplay screenshot"/>}</Dialog> }
