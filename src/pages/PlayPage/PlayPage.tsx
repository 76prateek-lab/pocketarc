import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { CircleAlert, LoaderCircle } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { EmulatorShell } from '@/components/emulator/EmulatorShell'
import { QuickMenu } from '@/components/emulator/QuickMenu'
import { SaveStatePanel } from '@/components/emulator/SaveStatePanel'
import { CheatManager } from '@/components/emulator/CheatManager'
import { Sheet } from '@/components/ui'
import { emulatorManager } from '@/emulator/EmulatorManager'
import { InputManager } from '@/input/InputManager'
import type { AppCommand } from '@/input/inputTypes'
import { useGame } from '@/hooks/useGames'
import { routes } from '@/routes/routes'
import { toggleFullscreen } from '@/services/fullscreenService'
import { PlaytimeService } from '@/services/playtimeService'
import { WakeLockService } from '@/services/wakeLockService'
import { useResolvedGameSettings } from '@/hooks/useSettings'
import { DEFAULT_APP_SETTINGS, resolveGameSettings, settingsService, toResolvedInputSettings } from '@/services/settingsService'
import styles from './PlayPage.module.css'
import { cheatRepository } from '@/storage/cheatRepository'
import { useLiveQuery } from 'dexie-react-hooks'

export function PlayPage() {
  const { gameId } = useParams(); const game = useGame(gameId); const navigate = useNavigate()
  const activeGameRef = useRef(game)
  if (game && activeGameRef.current?.id !== game.id) activeGameRef.current = game
  const activeGame = activeGameRef.current
  const storedSettings = useResolvedGameSettings(gameId)
  const cheats = useLiveQuery(() => gameId ? cheatRepository.forGame(gameId) : [], [gameId], [])
  const configured = storedSettings ?? { global: DEFAULT_APP_SETTINGS, game: undefined, resolved: resolveGameSettings(DEFAULT_APP_SETTINGS) }
  const playtimeRef = useRef<PlaytimeService | undefined>(undefined); const wakeLockRef = useRef<WakeLockService | undefined>(undefined)
  const [inputManager, setInputManager] = useState<InputManager>()
  const [menuOpen, setMenuOpen] = useState(false); const [saveStatesOpen, setSaveStatesOpen] = useState(false); const [cheatsOpen, setCheatsOpen] = useState(false); const [fastForward, setFastForward] = useState<1 | 2 | 4>(1); const [notice, setNotice] = useState('')
  const emulator = useSyncExternalStore(emulatorManager.subscribe, emulatorManager.getSnapshot, emulatorManager.getSnapshot)

  useEffect(() => { const mount = document.getElementById('emulator-root'); if (!activeGame || !mount) return; void emulatorManager.launch({ game: activeGame, mount }).catch(() => undefined); return () => { void emulatorManager.destroy() } }, [activeGame])

  useEffect(() => {
    if (!activeGame) return
    const playtime = new PlaytimeService(activeGame.id); const wakeLock = new WakeLockService(); playtimeRef.current = playtime; wakeLockRef.current = wakeLock
    const visibility = () => { void wakeLock.visibilityChanged(); if (document.visibilityState === 'hidden') { void playtime.pause(); void emulatorManager.flushSaves() } else if (emulatorManager.getSnapshot().state === 'running') playtime.resume() }
    const pageHide = () => { void playtime.pause(); void emulatorManager.flushSaves() }
    document.addEventListener('visibilitychange', visibility); window.addEventListener('pagehide', pageHide)
    return () => { document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pagehide', pageHide); void playtime.close(); void wakeLock.dispose(); playtimeRef.current = undefined; wakeLockRef.current = undefined }
  }, [activeGame])

  useEffect(() => {
    const running = emulator.state === 'running' && document.visibilityState === 'visible'
    if (emulator.state === 'running') { void playtimeRef.current?.start(); playtimeRef.current?.resume() } else void playtimeRef.current?.pause()
    void wakeLockRef.current?.setPlaying(running && configured.global.general.keepAwake)
    if (!running && fastForward !== 1) emulatorManager.fastForward(1)
    if (running && fastForward !== 1) emulatorManager.fastForward(fastForward)
    if (['ready', 'running', 'paused'].includes(emulator.state)) { emulatorManager.setDisplay(configured.resolved.display); emulatorManager.setVolume(configured.resolved.audio.muted ? 0 : configured.resolved.audio.masterVolume) }
  }, [configured.global.general.keepAwake, configured.resolved.audio.masterVolume, configured.resolved.audio.muted, configured.resolved.display, emulator.state, fastForward])

  useEffect(() => { if (['ready', 'running', 'paused'].includes(emulator.state)) emulatorManager.setCheats(cheats) }, [cheats, emulator.state])

  useEffect(() => { const target = emulatorManager.getInputWindow(); if (inputManager && target && ['ready', 'running', 'paused'].includes(emulator.state)) inputManager.attachKeyboardTarget(target) }, [emulator.state, inputManager])

  useEffect(() => {
    if (!activeGame) return
    const command = (action: AppCommand, pressed: boolean) => { if (action === 'FAST_FORWARD') { setSpeed(pressed ? configured.resolved.fastForward.multiplier : 1); return } if (!pressed) return; if (action === 'QUICK_SAVE') showResult(emulatorManager.quickSave(), 'Quick save created.'); if (action === 'QUICK_LOAD') showResult(emulatorManager.quickLoad(), 'Quick save loaded.'); if (action === 'PAUSE') { if (emulatorManager.getSnapshot().state === 'paused') emulatorManager.resume(); else emulatorManager.pause() } if (action === 'FULLSCREEN') { const target = document.getElementById('pocketgba-emulator-shell'); if (target) void toggleFullscreen(target) } if (action === 'MENU') { setSpeed(1); emulatorManager.pause(); setMenuOpen(true) } }
    const manager = new InputManager((action, pressed) => emulatorManager.input(action, pressed), command)
    let cancelled = false; void manager.start(toResolvedInputSettings(configured.resolved)).then(() => { if (!cancelled) setInputManager(manager) }); return () => { cancelled = true; manager.stop() }
  }, [activeGame, configured.resolved])

  function showResult(action: Promise<unknown>, success: string) { setNotice(''); void action.then(() => setNotice(success)).catch((error: unknown) => setNotice(error instanceof Error ? error.message : 'The action failed.')) }
  function quickSave() { showResult(emulatorManager.quickSave(), 'Quick save created.') }
  function quickLoad() { showResult(emulatorManager.quickLoad(), 'Quick save loaded.') }
  function screenshot() { showResult(emulatorManager.captureScreenshot(), 'Screenshot saved on this device.') }
  function togglePause() { if (emulatorManager.getSnapshot().state === 'paused') emulatorManager.resume(); else { setSpeed(1); emulatorManager.pause() } }
  function setAudio(next: number) { emulatorManager.setVolume(next); void settingsService.saveAppSettings({ ...configured.global, audio: { masterVolume: next, muted: next === 0 } }) }
  function setSpeed(ratio: 1 | 2 | 4) { setFastForward(ratio); emulatorManager.fastForward(ratio) }
  async function fullscreen() { const target = document.getElementById('pocketgba-emulator-shell'); if (target) await toggleFullscreen(target) }
  async function exit(destination: string = routes.library) { await playtimeRef.current?.close(); await wakeLockRef.current?.dispose(); await emulatorManager.destroy(); navigate(destination) }
  function saveStates() { setMenuOpen(false); setSaveStatesOpen(true) }

  if (game === undefined) return <PageMessage loading title="Loading game" message="Preparing your local library record."/>
  if (game === null) return <PageMessage title="Game not found" message="This game is no longer in your library."/>
  const volume = configured.resolved.audio.muted ? 0 : configured.resolved.audio.masterVolume
  return <main className={styles.page}>
    <EmulatorShell gameTitle={game.title} emulator={emulator} inputManager={inputManager} onExit={() => void exit()} onSettings={() => { setSpeed(1); emulatorManager.pause(); setMenuOpen(true) }} onRetry={() => { const mount = document.getElementById('emulator-root'); if (mount) void emulatorManager.launch({ game, mount }) }}/>
    {notice && <p className={styles.notice} role="status">{notice}</p>}
    <QuickMenu open={menuOpen} paused={emulator.state === 'paused'} fastForward={fastForward} volume={volume} keyboard={configured.resolved.keyboard} confirmRestart={configured.global.general.confirmRestart} onClose={() => setMenuOpen(false)} onResume={togglePause} onQuickSave={quickSave} onQuickLoad={quickLoad} onSaveStates={saveStates} onFastForward={setSpeed} onScreenshot={screenshot} onCheats={() => { setMenuOpen(false); setCheatsOpen(true) }} onControls={() => void exit(routes.settings)} onFullscreen={() => void fullscreen()} onVolume={setAudio} onRestart={() => emulatorManager.restart()} onExit={() => void exit()}/>
    <Sheet open={saveStatesOpen} side="left" title="Snapshots" description="Manage local save states for this game" onClose={() => setSaveStatesOpen(false)}><SaveStatePanel gameId={game.id}/></Sheet>
    <CheatManager gameId={game.id} open={cheatsOpen} onClose={() => setCheatsOpen(false)} onChange={(next) => emulatorManager.setCheats(next)}/>
  </main>
}

function PageMessage({ loading = false, message, title }: { loading?: boolean; message: string; title: string }) { return <main className={styles.message}>{loading ? <LoaderCircle className={styles.spinner} size={24}/> : <CircleAlert size={24}/>}<h1 className="display-medium">{title}</h1><p>{message}</p><Link to={routes.library}>Return to library</Link></main> }
