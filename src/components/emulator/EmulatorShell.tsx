import { LoaderCircle } from 'lucide-react'
import { EmulatorError } from '@/components/emulator/EmulatorError'
import { EmulatorToolbar } from '@/components/emulator/EmulatorToolbar'
import { TouchControls } from '@/components/emulator/TouchControls'
import type { EmulatorSnapshot } from '@/emulator/emulatorTypes'
import type { InputManager } from '@/input/InputManager'
import styles from './EmulatorShell.module.css'

type Props = { gameTitle: string; emulator: EmulatorSnapshot; inputManager?: InputManager; onExit: () => void; onSettings: () => void; onRetry: () => void }

export function EmulatorShell(props: Props) {
  const active = ['ready', 'running', 'paused'].includes(props.emulator.state)
  const busy = ['idle', 'preparing', 'loading', 'destroying'].includes(props.emulator.state)
  return <div id="pocketgba-emulator-shell" className={styles.shell}>
    <EmulatorToolbar onExit={props.onExit} onSettings={props.onSettings}/>
    <p className="visually-hidden" role="status">{active ? props.emulator.state === 'paused' ? 'Paused' : 'Playing' : stateLabel(props.emulator.state)}</p>
    <div className={styles.gameArea}><section id="pocketgba-emulator-stage" className={styles.stage} aria-label={`${props.gameTitle} play area`}><div id="emulator-root" className={styles.emulatorRoot}/>{busy && <div className={styles.overlay}><LoaderCircle className={styles.spinner} size={24}/><strong>{stateLabel(props.emulator.state)}</strong><span>Loading the self-hosted mGBA core and your local ROM.</span></div>}{props.emulator.state === 'error' && <EmulatorError message={props.emulator.error ?? 'The emulator encountered an error.'} onRetry={props.onRetry}/>}</section>{props.inputManager && <TouchControls manager={props.inputManager}/>}</div>
  </div>
}

function stateLabel(state: string) { return ({ idle: 'Preparing', preparing: 'Preparing ROM', loading: 'Loading emulator', destroying: 'Closing emulator' } as Record<string, string>)[state] ?? state }
