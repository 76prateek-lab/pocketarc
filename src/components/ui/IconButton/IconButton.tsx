import { forwardRef, type ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'
import styles from '../primitives.module.css'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { label: string }

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { className, label, type = 'button', ...props }, ref,
) {
  return <button ref={ref} type={type} className={clsx(styles.iconButton, className)} aria-label={label} {...props} />
})
