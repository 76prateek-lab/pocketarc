import type { HTMLAttributes } from 'react'
import clsx from 'clsx'
import styles from '../primitives.module.css'

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={clsx(styles.badge, className)} {...props}/>
}
