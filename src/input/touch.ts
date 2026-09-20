import type { GameAction } from '@/input/inputTypes'
import type { DragEvent, MouseEvent, PointerEvent } from 'react'

export type TouchActionHandler = (action: GameAction, pressed: boolean, pointerId: number) => void

export function touchButtonHandlers(action: GameAction, handler: TouchActionHandler) {
  return {
    onPointerDown(event: PointerEvent<HTMLElement>) { event.preventDefault(); event.currentTarget.setPointerCapture(event.pointerId); handler(action, true, event.pointerId) },
    onPointerUp(event: PointerEvent<HTMLElement>) { event.preventDefault(); handler(action, false, event.pointerId); if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId) },
    onPointerCancel(event: PointerEvent<HTMLElement>) { handler(action, false, event.pointerId) },
    onContextMenu(event: MouseEvent<HTMLElement>) { event.preventDefault() },
    onDragStart(event: DragEvent<HTMLElement>) { event.preventDefault() },
  }
}
