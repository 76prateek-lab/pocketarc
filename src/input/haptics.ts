export function vibrateInput(enabled = true) {
  if (!enabled || typeof navigator.vibrate !== 'function') return false
  return navigator.vibrate(10)
}
