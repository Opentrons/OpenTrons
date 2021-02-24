
import * as React from 'react'

import styles from './styles.css'

export type ControlInfoProps = {
  children,
  className?: string,
}

export function ControlInfo(props: ControlInfoProps) {
  const { children, className = styles.control_info } = props
  return <div className={className}>{children}</div>
}