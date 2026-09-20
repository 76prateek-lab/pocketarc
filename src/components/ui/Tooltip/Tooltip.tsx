import { cloneElement, useId, type ReactElement } from 'react'
import styles from '../primitives.module.css'

type TooltipProps = { content: string; children: ReactElement<Record<string, unknown>> }

export function Tooltip({ children, content }: TooltipProps) {
  const id = useId()
  return <span className={styles.tooltipWrap}>{cloneElement(children, { 'aria-describedby': id })}<span id={id} role="tooltip" className={styles.tooltip}>{content}</span></span>
}
