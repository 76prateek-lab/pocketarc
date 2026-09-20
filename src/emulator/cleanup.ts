export function removeMountedEmulator(mount: HTMLElement, iframe?: HTMLIFrameElement) {
  iframe?.remove()
  mount.replaceChildren()
}

export function revokeRomUrl(url?: string) {
  if (url) URL.revokeObjectURL(url)
}
