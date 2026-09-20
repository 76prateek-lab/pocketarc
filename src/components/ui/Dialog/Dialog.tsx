import { useId, useRef, type MouseEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useFocusTrap } from '../useFocusTrap'
import styles from '../primitives.module.css'

type DialogProps = { open: boolean; title: string; description?: string; children: ReactNode; footer?: ReactNode; onClose: () => void }

export function Dialog({ children, description, footer, onClose, open, title }: DialogProps) {
  const ref = useRef<HTMLDivElement>(null); const titleId = useId(); const descriptionId = useId()
  useFocusTrap(ref, open, onClose)
  if (!open) return null
  function closeBackdrop(event: MouseEvent<HTMLDivElement>) { if (event.target === event.currentTarget) onClose() }
  return createPortal(<div className={`${styles.backdrop} ${styles.dialogBackdrop}`} onMouseDown={closeBackdrop}><div ref={ref} className={styles.dialog} role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={description ? descriptionId : undefined}><header className={styles.dialogHeader}><h2 id={titleId} className={styles.dialogTitle}>{title}</h2>{description && <p id={descriptionId} className={styles.dialogDescription}>{description}</p>}</header><button className={styles.closeButton} type="button" aria-label="Close dialog" onClick={onClose}><X size={18}/></button><div className={styles.dialogBody}>{children}</div>{footer && <footer className={styles.dialogFooter}>{footer}</footer>}</div></div>, document.body)
}
