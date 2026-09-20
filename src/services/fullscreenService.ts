type WebkitElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void }
type WebkitDocument = Document & { webkitExitFullscreen?: () => Promise<void> | void; webkitFullscreenElement?: Element | null }

export function isFullscreen() {
  const doc = document as WebkitDocument
  return Boolean(document.fullscreenElement ?? doc.webkitFullscreenElement)
}

export async function toggleFullscreen(target: HTMLElement) {
  const doc = document as WebkitDocument
  try {
    if (isFullscreen()) {
      if (document.exitFullscreen) await document.exitFullscreen()
      else await doc.webkitExitFullscreen?.()
      return false
    }
    const element = target as WebkitElement
    if (element.requestFullscreen) await element.requestFullscreen()
    else if (element.webkitRequestFullscreen) await element.webkitRequestFullscreen()
    else return false
    return true
  } catch { return false }
}
