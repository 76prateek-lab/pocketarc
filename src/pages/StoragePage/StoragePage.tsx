import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Archive, Database, FileArchive, HardDrive, Image, ShieldCheck, Trash2 } from 'lucide-react'
import { Badge, Button, Dialog, Input, Skeleton, Switch } from '@/components/ui'
import { backupService, downloadBackup, type BackupPreview, type BackupType } from '@/services/backupService'
import { getStorageEstimate, requestPersistentStorage, type StorageEstimate } from '@/services/storageEstimateService'
import { storageRepository, type LocalStorageBreakdown } from '@/storage/storageRepository'
import { useGames } from '@/hooks/useGames'
import { formatBytes } from '@/utils/formatBytes'
import styles from './StoragePage.module.css'

export function StoragePage() {
  const games = useGames(); const importRef = useRef<HTMLInputElement>(null)
  const [estimate, setEstimate] = useState<StorageEstimate>(); const [breakdown, setBreakdown] = useState<LocalStorageBreakdown>()
  const [persistMessage, setPersistMessage] = useState(''); const [notice, setNotice] = useState('')
  const [includeRoms, setIncludeRoms] = useState(false); const [working, setWorking] = useState(false)
  const [preview, setPreview] = useState<BackupPreview>(); const [deleteOpen, setDeleteOpen] = useState(false); const [deleteText, setDeleteText] = useState('')
  useEffect(() => { void refresh() }, [games])
  async function refresh() { const [nextEstimate, nextBreakdown] = await Promise.all([getStorageEstimate(), storageRepository.breakdown()]); setEstimate(nextEstimate); setBreakdown(nextBreakdown) }
  const percent = estimate?.usage !== undefined && estimate.quota ? Math.min(100, estimate.usage / estimate.quota * 100) : undefined

  async function makePersistent() { const granted = await requestPersistentStorage(true); setPersistMessage(granted ? 'Persistent storage is enabled.' : 'The browser declined persistent storage. PocketArc will continue using standard local storage.'); await refresh() }
  async function exportBackup(type: BackupType) { setWorking(true); setNotice('Preparing your backup…'); try { const blob = await backupService.create(type); downloadBackup(blob, type); setNotice(type === 'full-with-roms' ? 'Personal ROM-inclusive backup downloaded.' : 'Backup downloaded. ROM binaries were not included.') } catch (error) { setNotice(message(error, 'The backup could not be created.')) } finally { setWorking(false) } }
  async function chooseBackup(file?: File) { if (!file) return; setWorking(true); setNotice('Validating backup…'); try { setPreview(await backupService.preview(file)); setNotice('') } catch (error) { setPreview(undefined); setNotice(message(error, 'The backup could not be read.')) } finally { setWorking(false); if (importRef.current) importRef.current.value = '' } }
  async function restore() { if (!preview) return; setWorking(true); try { const result = await backupService.restore(preview); setPreview(undefined); setNotice(`Restore complete: ${result.saves} saves and ${result.states} save states restored.`); await refresh() } catch (error) { setNotice(message(error, 'Nothing was restored. Your existing data is unchanged.')) } finally { setWorking(false) } }
  async function clearAll() { if (deleteText !== 'DELETE') return; setWorking(true); try { await backupService.clearAll(); setDeleteOpen(false); setDeleteText(''); setNotice('All PocketArc data was removed from this browser.'); await refresh() } catch (error) { setNotice(message(error, 'Local data could not be cleared.')) } finally { setWorking(false) } }

  return <main className={styles.page}>
    <header className={styles.intro}><p className="code">On this device</p><h1 className="display-large">Storage</h1><p>Review local data, create private backups, and restore PocketArc safely.</p></header>
    <section className={styles.cards} aria-label="Storage breakdown">
      <StorageCard icon={<HardDrive size={18}/>} label="ROM storage" value={breakdown ? formatBytes(breakdown.romBytes) : undefined} detail={`${games?.length ?? 0} ${games?.length === 1 ? 'game' : 'games'}`}/>
      <StorageCard icon={<Database size={18}/>} label="Normal saves" value={breakdown ? formatBytes(breakdown.saveBytes) : undefined}/>
      <StorageCard icon={<FileArchive size={18}/>} label="Save states" value={breakdown ? formatBytes(breakdown.saveStateBytes) : undefined}/>
      <StorageCard icon={<Image size={18}/>} label="Screenshots" value={breakdown ? formatBytes(breakdown.screenshotBytes) : undefined}/>
      <StorageCard icon={<Archive size={18}/>} label="PocketArc data" value={breakdown ? formatBytes(breakdown.totalBytes) : undefined} detail={breakdown?.coverBytes ? `${formatBytes(breakdown.coverBytes)} cover artwork` : undefined}/>
      <StorageCard icon={<ShieldCheck size={18}/>} label="Storage protection" value={estimate?.persistent ? 'Persistent' : 'Standard'} badge={estimate?.persistent}/>
    </section>
    {percent !== undefined && <section className={styles.meterPanel}><div className={styles.meterHeader}><h2>Browser quota</h2><span>{formatBytes(estimate?.usage)} of {formatBytes(estimate?.quota)}</span></div><div className={styles.meter} role="meter" aria-label="Browser storage used" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(percent)}><span style={{ width: `${percent}%` }}/></div><p>The browser estimate can include service-worker assets and other origin data.</p></section>}
    <section className={styles.persistence}><div><h2>Reduce automatic cleanup</h2><p>Ask your browser to retain PocketArc data when storage space becomes limited. Browser support and approval vary.</p></div><Button disabled={estimate?.persistent} onClick={() => void makePersistent()}>{estimate?.persistent ? 'Storage protected' : 'Request persistent storage'}</Button></section>
    <section className={styles.backupPanel}><header><div><h2>Backup and restore</h2><p>Save backups include game metadata, settings, normal saves, save states, and their previews.</p></div></header><div className={styles.backupActions}><Button disabled={working} onClick={() => void exportBackup('save-only')}>Export All Saves</Button><Button variant="secondary" disabled={working} onClick={() => void exportBackup('full-metadata')}>Export Full Metadata</Button><Button variant="secondary" disabled={working} onClick={() => importRef.current?.click()}>Import Backup</Button><input ref={importRef} className={styles.fileInput} type="file" accept=".zip,application/zip" onChange={(event) => void chooseBackup(event.target.files?.[0])}/></div><div className={styles.romOption}><div><strong>Include personal ROM files</strong><span>Only enable this for a private backup. ROM binaries are excluded by default.</span></div><Switch label="Include ROM files" checked={includeRoms} onChange={setIncludeRoms}/></div>{includeRoms && <div className={styles.romExport}><p>This backup may be large and must not be redistributed unless you have permission.</p><Button disabled={working} onClick={() => void exportBackup('full-with-roms')}>Export with ROMs</Button></div>}</section>
    <section className={styles.danger}><div><h2>Clear all local data</h2><p>Remove every imported ROM, save, state, screenshot, cover, session, and setting from this browser.</p></div><Button className={styles.dangerButton} onClick={() => setDeleteOpen(true)}><Trash2 size={16}/>Clear All Local Data</Button></section>
    {(notice || persistMessage) && <p className={styles.notice} role="status">{notice || persistMessage}</p>}
    {!estimate?.supported && estimate !== undefined && <p className={styles.notice}>This browser does not report storage usage. Your library can still be stored locally.</p>}
    <Dialog open={Boolean(preview)} title="Restore backup?" description="Review the validated contents before any local data is changed." onClose={() => setPreview(undefined)} footer={<><Button variant="ghost" onClick={() => setPreview(undefined)}>Cancel</Button><Button disabled={working} onClick={() => void restore()}>Restore backup</Button></>}>
      {preview && <div className={styles.preview}><dl><div><dt>Created</dt><dd>{new Date(preview.manifest.createdAt).toLocaleString()}</dd></div><div><dt>Backup type</dt><dd>{backupLabel(preview.manifest.type)}</dd></div><div><dt>Games</dt><dd>{preview.counts.games}</dd></div><div><dt>Saves / states</dt><dd>{preview.counts.saves} / {preview.counts.states}</dd></div><div><dt>Screenshots</dt><dd>{preview.counts.screenshots}</dd></div><div><dt>Cheats</dt><dd>{preview.counts.cheats}</dd></div><div><dt>ROM files</dt><dd>{preview.counts.roms}</dd></div></dl>{preview.conflicts.length ? <div className={styles.conflicts}><strong>Conflicts</strong>{preview.conflicts.map((conflict) => <p key={conflict}>{conflict}</p>)}</div> : <p>No existing records will be replaced.</p>}</div>}
    </Dialog>
    <Dialog open={deleteOpen} title="Clear all PocketArc data?" description="This cannot be undone unless you have a backup." onClose={() => { setDeleteOpen(false); setDeleteText('') }} footer={<><Button variant="ghost" onClick={() => { setDeleteOpen(false); setDeleteText('') }}>Cancel</Button><Button className={styles.dangerButton} disabled={deleteText !== 'DELETE' || working} onClick={() => void clearAll()}>Delete everything</Button></>}><div className={styles.deleteConfirm}><p>Type <span className="code">DELETE</span> to confirm.</p><Input label="Confirmation" value={deleteText} onChange={(event) => setDeleteText(event.target.value)} autoComplete="off"/></div></Dialog>
  </main>
}

function StorageCard({ badge, detail, icon, label, value }: { badge?: boolean; detail?: string; icon: ReactNode; label: string; value?: string }) { return <article>{icon}<span>{label}</span>{value ? <strong>{value}</strong> : <Skeleton height={24}/>} {detail && <small>{detail}</small>}{badge && <Badge>Enabled</Badge>}</article> }
function message(error: unknown, fallback: string) { return error instanceof Error ? error.message : fallback }
function backupLabel(type: BackupType) { return type === 'save-only' ? 'Save-only' : type === 'full-metadata' ? 'Full metadata' : 'Personal backup with ROMs' }
