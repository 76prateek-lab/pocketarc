import type { ReactNode } from 'react'
import styles from '../primitives.module.css'

type EmptyStateProps = { title: string; description: string; icon?: ReactNode; actions?: ReactNode }

export function EmptyState({ actions, description, icon, title }: EmptyStateProps) {
  return <section className={styles.emptyState}><div className={styles.emptyIcon} aria-hidden="true">{icon}</div><h2 className={styles.emptyTitle}>{title}</h2><p className={styles.emptyDescription}>{description}</p>{actions && <div className={styles.emptyActions}>{actions}</div>}</section>
}
