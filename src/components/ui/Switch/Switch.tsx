import clsx from 'clsx'
import styles from '../primitives.module.css'

type SwitchProps = { checked: boolean; label: string; onChange: (checked: boolean) => void; disabled?: boolean }

export function Switch({ checked, disabled, label, onChange }: SwitchProps) {
  return <span className={styles.switchRow}><button type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled} className={clsx(styles.switch, checked && styles.switchChecked)} onClick={() => onChange(!checked)}><span className={styles.switchThumb}/></button><span className={styles.switchLabel}>{label}</span></span>
}
