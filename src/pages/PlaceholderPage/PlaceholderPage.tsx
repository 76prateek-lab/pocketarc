import styles from './PlaceholderPage.module.css'

export function PlaceholderPage({ description, title }: { description: string; title: string }) {
  return <main className={styles.page}><p className="code">PocketArc</p><h1 className="display-large">{title}</h1><p className="body">{description}</p></main>
}
