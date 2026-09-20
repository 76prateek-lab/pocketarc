import { useId, useRef, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import clsx from 'clsx'
import { useFocusTrap } from '../useFocusTrap'
import styles from '../primitives.module.css'

type SheetProps = { open: boolean; title: string; description?: string; children: ReactNode; side?: 'left' | 'right'; className?: string; backdropClassName?: string; headerActions?: ReactNode; onClose: () => void }

export function Sheet({ backdropClassName, children, className, description, headerActions, onClose, open, side = 'right', title }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null); const titleId = useId(); const descriptionId = useId()
  useFocusTrap(ref, open, onClose)
  if (!open) return null
  function closeBackdrop(event: MouseEvent<HTMLDivElement>) { if (event.target === event.currentTarget) onClose() }
  return createPortal(<div className={clsx(styles.backdrop, styles.sheetBackdrop, side === 'left' && styles.sheetBackdropLeft, backdropClassName)} onMouseDown={closeBackdrop}><aside ref={ref} className={clsx(styles.sheet, side === 'left' && styles.sheetLeft, className)} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}><header className={styles.sheetHeader}><h2 id={titleId} className={styles.sheetTitle}>{title}</h2>{description && <p id={descriptionId} className={styles.sheetDescription}>{description}</p>}</header><div className={styles.sheetActions}>{headerActions}<button className={styles.closeButton} type="button" aria-label="Close sheet" onClick={onClose}><X size={18}/></button></div><div className={styles.sheetBody}>{children}</div></aside></div>, document.body)
}
