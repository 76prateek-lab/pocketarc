import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import clsx from 'clsx'
import styles from '../primitives.module.css'

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; labelHidden?: boolean; hint?: string; error?: string }

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, error, hint, id, label, labelHidden = false, ...props }, ref,
) {
  const generatedId = useId(); const inputId = id ?? generatedId
  const messageId = `${inputId}-message`; const message = error ?? hint
  return <div className={styles.field}><label className={clsx(styles.fieldLabel, labelHidden && 'visually-hidden')} htmlFor={inputId}>{label}</label><span className={styles.inputWrap}><input ref={ref} id={inputId} className={clsx(styles.input, className)} aria-describedby={message ? messageId : undefined} aria-invalid={Boolean(error)} {...props}/></span>{message && <span id={messageId} className={error ? styles.fieldError : styles.fieldHint}>{message}</span>}</div>
})
