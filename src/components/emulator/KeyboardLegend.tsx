import { useState } from 'react'
import { Keyboard } from 'lucide-react'
import { Button, Dialog } from '@/components/ui'
import type { InputBinding, KeyboardMapping } from '@/input/inputTypes'
import styles from './EmulatorShell.module.css'

const GAME_CONTROLS: { action: InputBinding; label: string }[] = [
  { action: 'UP', label: 'Move up' },
  { action: 'DOWN', label: 'Move down' },
  { action: 'LEFT', label: 'Move left' },
  { action: 'RIGHT', label: 'Move right' },
  { action: 'A', label: 'A button' },
  { action: 'B', label: 'B button' },
  { action: 'L', label: 'L shoulder' },
  { action: 'R', label: 'R shoulder' },
  { action: 'START', label: 'Start' },
  { action: 'SELECT', label: 'Select' },
]

const SHORTCUTS: { action: InputBinding; label: string }[] = [
  { action: 'QUICK_SAVE', label: 'Quick Save' },
  { action: 'QUICK_LOAD', label: 'Quick Load' },
  { action: 'FAST_FORWARD', label: 'Fast-forward' },
  { action: 'PAUSE', label: 'Pause' },
  { action: 'FULLSCREEN', label: 'Fullscreen' },
  { action: 'MENU', label: 'Quick Menu' },
]

export function KeyboardLegend({ mapping }: { mapping: KeyboardMapping }) {
  const [open, setOpen] = useState(false)
  return <>
    <button type="button" className={styles.keyboardTrigger} aria-label="Show keyboard controls" aria-haspopup="dialog" onClick={() => setOpen(true)}><Keyboard size={17}/><span>Keyboard</span></button>
    <Dialog open={open} onClose={() => setOpen(false)} title="Keyboard controls" description="Current controls for this game, including any custom mappings." footer={<Button onClick={() => setOpen(false)}>Done</Button>}>
      <div className={styles.legendContent}>
        <LegendSection title="Game controls" entries={GAME_CONTROLS} mapping={mapping}/>
        <LegendSection title="Shortcuts" entries={SHORTCUTS} mapping={mapping}/>
        <p className={styles.legendHint}>Change these controls any time in Settings → Keyboard.</p>
      </div>
    </Dialog>
  </>
}

function LegendSection({ entries, mapping, title }: { entries: { action: InputBinding; label: string }[]; mapping: KeyboardMapping; title: string }) {
  return <section className={styles.legendSection}><h3>{title}</h3><dl className={styles.legendGrid}>{entries.map(({ action, label }) => <div className={styles.legendItem} key={action}><dt>{label}</dt><dd><kbd>{formatKey(mapping[action])}</kbd></dd></div>)}</dl></section>
}

function formatKey(code: string) {
  const labels: Record<string, string> = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→', ShiftLeft: 'Shift', ShiftRight: 'Shift', Space: 'Space', Escape: 'Esc', Enter: 'Enter' }
  return labels[code] ?? code.replace(/^Key/, '').replace(/^Digit/, '')
}
