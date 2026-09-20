import { useState } from 'react'
import { FolderOpen, MoreHorizontal, Plus, Settings } from 'lucide-react'
import { Badge, Button, Dialog, Dropdown, EmptyState, IconButton, Input, Select, Sheet, Skeleton, StatusDot, Switch, Tooltip } from '@/components/ui'
import styles from './DesignSystemPreview.module.css'

export function DesignSystemPreview() {
  const [enabled, setEnabled] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  return <main className={styles.page}>
    <header className={styles.header}><p className="code">Development preview</p><h1 className="display-large">PocketArc design system</h1><p className="body">Foundational tokens, type, controls, and overlay behavior.</p></header>

    <PreviewSection title="Typography"><div className={styles.stack}><p className="display-large">Display large</p><p className="display-medium">Display medium</p><p className="label">Interface label</p><p className="body">Body text for comfortable interface reading.</p><p className="caption">Caption text for supporting information.</p><code className="code">mGBA · IndexedDB · 13px</code></div></PreviewSection>

    <PreviewSection title="Actions"><div className={styles.row}><Button variant="primary"><Plus size={16}/>Primary</Button><Button>Secondary</Button><Button variant="ghost">Ghost</Button><Button disabled>Disabled</Button><Tooltip content="Application settings"><IconButton label="Open settings"><Settings size={18}/></IconButton></Tooltip></div></PreviewSection>

    <PreviewSection title="Form controls"><div className={styles.formGrid}><Input label="Game title" placeholder="Enter a title" hint="Stored only on this device."/><Input label="Save name" defaultValue="Quick save" error="A save with this name already exists."/><Select label="Display scale" defaultValue="fit" hint="Keeps the full game visible."><option value="fit">Fit to screen</option><option value="integer">Integer scale</option></Select><Switch checked={enabled} onChange={setEnabled} label="Enable touch controls"/></div></PreviewSection>

    <PreviewSection title="Status and feedback"><div className={styles.stack}><div className={styles.row}><Badge><StatusDot status="success" label="Ready"/>Ready</Badge><Badge><StatusDot status="warning" label="Needs attention"/>Needs attention</Badge><Badge>Local only</Badge></div><Skeleton width="100%" height={12}/><Skeleton width="64%" height={12}/></div></PreviewSection>

    <PreviewSection title="Menus and overlays"><div className={styles.row}><Dropdown label="Game actions" items={[{ label: 'Open details', onSelect: () => undefined }, { label: 'Disabled item', disabled: true, onSelect: () => undefined }]}/><Button onClick={() => setDialogOpen(true)}>Open dialog</Button><Button onClick={() => setSheetOpen(true)}>Open sheet</Button></div></PreviewSection>

    <PreviewSection title="Empty state"><EmptyState icon={<FolderOpen size={20}/>} title="Nothing here yet" description="This neutral state is ready for future product-specific content." actions={<><Button variant="primary">Primary action</Button><IconButton label="More options"><MoreHorizontal size={18}/></IconButton></>}/></PreviewSection>

    <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} title="Example dialog" description="Focus stays inside until this dialog closes." footer={<><Button variant="ghost" onClick={() => setDialogOpen(false)}>Cancel</Button><Button variant="primary" onClick={() => setDialogOpen(false)}>Confirm</Button></>}><p className="body">Dialog content uses a white surface, a shadow boundary, and restrained elevation.</p></Dialog>
    <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Example sheet" description="Responsive secondary content."><p className="body">On narrow screens this sheet anchors to the bottom edge.</p></Sheet>
  </main>
}

function PreviewSection({ children, title }: { children: React.ReactNode; title: string }) {
  return <section className={styles.section}><h2 className="label">{title}</h2><div className={styles.surface}>{children}</div></section>
}
