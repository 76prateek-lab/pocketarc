import clsx from 'clsx'
import styles from '../primitives.module.css'

type StatusDotProps = { status?: 'neutral' | 'success' | 'warning' | 'danger' | 'info'; label: string }

export function StatusDot({ label, status = 'neutral' }: StatusDotProps) {
  return <span className={clsx(styles.statusDot, styles[`status${status[0].toUpperCase()}${status.slice(1)}`])} role="img" aria-label={label}/>
}
