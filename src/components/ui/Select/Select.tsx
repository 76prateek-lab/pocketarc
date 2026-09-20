import { forwardRef, useId, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import styles from '../primitives.module.css'

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; labelHidden?: boolean; hint?: string }

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { children, hint, id, label, labelHidden = false, ...props }, ref,
) {
  const generatedId = useId(); const selectId = id ?? generatedId; const hintId = `${selectId}-hint`
  return <div className={styles.field}><label className={clsx(styles.fieldLabel, labelHidden && 'visually-hidden')} htmlFor={selectId}>{label}</label><span className={styles.selectWrap}><select ref={ref} id={selectId} className={styles.select} aria-describedby={hint ? hintId : undefined} {...props}>{children}</select><ChevronDown className={styles.selectIcon} size={16} aria-hidden="true"/></span>{hint && <span id={hintId} className={styles.fieldHint}>{hint}</span>}</div>
})
