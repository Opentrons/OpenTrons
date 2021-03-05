// Card component with drop shadow

import * as React from 'react'
import cx from 'classnames'

import styles from './structure.css'

export interface LabeledValueProps {
  /** Label */
  label: string
  /** Value */
  value: string
  /** Additional className */
  className?: string
  /** Additional value className */
  valueClassName?: string
}

export function LabeledValue(props: LabeledValueProps): JSX.Element {
  const { label, value } = props
  const className = cx(styles.labeled_value, props.className)

  return (
    <div className={className}>
      <p className={styles.labeled_value_label}>{label}:</p>
      <p className={cx(styles.labeled_value_value, props.valueClassName)}>
        {value}
      </p>
    </div>
  )
}
