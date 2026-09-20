import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import styles from '../primitives.module.css'

export type DropdownItem = { label: string; icon?: ReactNode; disabled?: boolean; onSelect: () => void }
type DropdownProps = { label: string; items: DropdownItem[]; trigger?: ReactNode }

export function Dropdown({ items, label, trigger }: DropdownProps) {
  const [open, setOpen] = useState(false); const rootRef = useRef<HTMLDivElement>(null); const triggerRef = useRef<HTMLButtonElement>(null); const focusFirst = useRef(false)
  useEffect(() => {
    if (!open) return
    if (focusFirst.current) { rootRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')?.focus(); focusFirst.current = false }
    function closeOutside(event: PointerEvent) { if (!rootRef.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [open])
  function moveFocus(direction: 1 | -1) {
    const buttons = Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)') ?? [])
    const current = buttons.indexOf(document.activeElement as HTMLButtonElement); buttons[(current + direction + buttons.length) % buttons.length]?.focus()
  }
  return <div className={styles.dropdown} ref={rootRef}><button ref={triggerRef} type="button" className={styles.dropdownTrigger} aria-label={trigger ? label : undefined} aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)} onKeyDown={(event) => { if (event.key === 'ArrowDown') { event.preventDefault(); focusFirst.current = true; setOpen(true) } }}>{trigger ?? <>{label}<ChevronDown size={16}/></>}</button>{open && <div className={styles.menu} role="menu" aria-label={label} onKeyDown={(event) => { if (event.key === 'ArrowDown') { event.preventDefault(); moveFocus(1) } else if (event.key === 'ArrowUp') { event.preventDefault(); moveFocus(-1) } else if (event.key === 'Escape') { event.preventDefault(); setOpen(false); triggerRef.current?.focus() } else if (event.key === 'Tab') setOpen(false) }}>{items.map((item) => <button key={item.label} type="button" role="menuitem" disabled={item.disabled} className={styles.menuItem} onClick={() => { item.onSelect(); setOpen(false); triggerRef.current?.focus() }}>{item.icon}{item.label}</button>)}</div>}</div>
}
