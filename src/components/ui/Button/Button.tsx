import { forwardRef, type ButtonHTMLAttributes } from 'react'
import clsx from 'clsx'
import styles from '../primitives.module.css'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'small' | 'medium' | 'large'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, size = 'medium', type = 'button', variant = 'secondary', ...props }, ref,
) {
  return <button ref={ref} type={type} className={clsx(styles.button, styles[`button${capitalize(variant)}`], styles[`button${capitalize(size)}`], className)} {...props} />
})

function capitalize(value: string) { return value[0].toUpperCase() + value.slice(1) }
