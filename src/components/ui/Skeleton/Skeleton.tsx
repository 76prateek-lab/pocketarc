import styles from '../primitives.module.css'

type SkeletonProps = { width?: string | number; height?: string | number; label?: string }

export function Skeleton({ height = 16, label = 'Loading', width = '100%' }: SkeletonProps) {
  return <div className={styles.skeleton} style={{ width, height }} role="status" aria-label={label}/>
}
