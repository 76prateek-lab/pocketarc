interface EmulatorJSInstance {
  pause: (dontUpdate?: boolean) => void
  play: (dontUpdate?: boolean) => void
  gameManager?: { restart?: () => void; saveSaveFiles?: () => void }
}

interface Window {
  EJS_player?: string
  EJS_core?: 'gba'
  EJS_gameUrl?: string
  EJS_gameName?: string
  EJS_gameID?: number
  EJS_pathtodata?: string
  EJS_biosUrl?: string
  EJS_ready?: () => void
  EJS_onGameStart?: () => void
  EJS_onExit?: () => void
  EJS_emulator?: EmulatorJSInstance
}
